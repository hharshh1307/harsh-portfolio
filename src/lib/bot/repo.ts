import "server-only";

/**
 * GitHub Git Data API helpers. The bot never pushes to main directly while drafting:
 * it builds commits on PENDING_BRANCH, and "Publish" merges that branch into main,
 * which makes Vercel deploy. Every change is therefore a normal, revertible git commit.
 */

export const PENDING_BRANCH = "bot/pending";
export const COMMIT_PREFIX = "content:";

function cfg() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) throw new Error("GITHUB_TOKEN and GITHUB_REPO must be set");
  return { token, repo, main: process.env.GITHUB_BRANCH ?? "main" };
}

export function mainBranch() {
  return cfg().main;
}

class GitHubError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function gh<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const { token, repo } = cfg();
  const res = await fetch(`https://api.github.com/repos/${repo}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new GitHubError(res.status, (data as { message?: string }).message ?? res.statusText);
  return data as T;
}

/** Returns the head commit sha of a branch, or null if it doesn't exist. */
export async function branchSha(branch: string): Promise<string | null> {
  try {
    const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${branch}`);
    return ref.object.sha;
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

/** Reads a UTF-8 text file at a ref. Returns null if the file doesn't exist there. */
export async function readText(path: string, ref: string): Promise<string | null> {
  try {
    const f = await gh<{ content: string; encoding: string }>(
      `/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(ref)}`,
    );
    return Buffer.from(f.content, "base64").toString("utf8");
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return null;
    throw e;
  }
}

export type FileChange =
  | { path: string; text: string }
  | { path: string; bytes: Uint8Array }
  | { path: string; delete: true };

/** Creates one commit with all changes on top of `parentSha`, and points `branch` at it. */
export async function commitFiles(opts: {
  branch: string;
  parentSha: string;
  message: string;
  changes: FileChange[];
  createBranch: boolean;
}): Promise<string> {
  const parent = await gh<{ tree: { sha: string } }>(`/git/commits/${opts.parentSha}`);

  const tree = await Promise.all(
    opts.changes.map(async (c) => {
      if ("delete" in c) return { path: c.path, mode: "100644", type: "blob", sha: null };
      const blob = await gh<{ sha: string }>(`/git/blobs`, {
        method: "POST",
        body: JSON.stringify(
          "text" in c
            ? { content: c.text, encoding: "utf-8" }
            : { content: Buffer.from(c.bytes).toString("base64"), encoding: "base64" },
        ),
      });
      return { path: c.path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );

  const newTree = await gh<{ sha: string }>(`/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await gh<{ sha: string }>(`/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message: opts.message, tree: newTree.sha, parents: [opts.parentSha] }),
  });

  if (opts.createBranch) {
    await gh(`/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${opts.branch}`, sha: commit.sha }),
    });
  } else {
    await gh(`/git/refs/heads/${opts.branch}`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
  }
  return commit.sha;
}

/** Merges the pending branch into main. Returns "merged" | "nothing" | "conflict". */
export async function mergePending(message: string): Promise<"merged" | "nothing" | "conflict"> {
  try {
    const res = await gh<{ sha?: string } | undefined>(`/merges`, {
      method: "POST",
      body: JSON.stringify({ base: mainBranch(), head: PENDING_BRANCH, commit_message: message }),
    });
    return res ? "merged" : "nothing";
  } catch (e) {
    if (e instanceof GitHubError && e.status === 409) return "conflict";
    throw e;
  }
}

export async function deleteBranch(branch: string): Promise<void> {
  try {
    await gh(`/git/refs/heads/${branch}`, { method: "DELETE" });
  } catch (e) {
    if (!(e instanceof GitHubError && (e.status === 404 || e.status === 422))) throw e;
  }
}

type CompareResult = {
  ahead_by: number;
  commits: { commit: { message: string } }[];
  files?: { filename: string; status: string }[];
};

export async function comparePending(): Promise<CompareResult | null> {
  if (!(await branchSha(PENDING_BRANCH))) return null;
  return gh<CompareResult>(`/compare/${mainBranch()}...${PENDING_BRANCH}`);
}

type CommitInfo = {
  sha: string;
  commit: { message: string; author: { date: string } };
  parents: { sha: string }[];
  files?: { filename: string; status: string; previous_filename?: string }[];
};

export const PUBLISH_PREFIX = `${COMMIT_PREFIX} publish`;
export const UNDO_PREFIX = `${COMMIT_PREFIX} undo`;

/**
 * Published changes on main, newest first: the merge commits created by Publish and the commits
 * created by /undo. Individual draft commits inside a merge are skipped, so one /undo reverts one
 * whole published change.
 */
export async function recentPublishedChanges(limit = 10): Promise<CommitInfo[]> {
  const commits = await gh<CommitInfo[]>(`/commits?sha=${mainBranch()}&per_page=50`);
  return commits
    .filter((c) => c.commit.message.startsWith(PUBLISH_PREFIX) || c.commit.message.startsWith(UNDO_PREFIX))
    .slice(0, limit);
}

/**
 * Reverts the file changes of one commit by writing back each file's content from the commit's
 * parent, as a new commit on main. Works for both bot commits and merge commits (first parent).
 */
export async function revertCommit(sha: string): Promise<string> {
  const target = await gh<CommitInfo>(`/commits/${sha}`);
  const parentSha = target.parents[0]?.sha;
  if (!parentSha) throw new Error("Can't revert the first commit");

  // For a merge commit, /commits/{sha} lists files vs first parent — exactly what we want.
  const files = target.files ?? [];
  if (!files.length) throw new Error("That commit didn't change any files");

  const changes: FileChange[] = [];
  for (const f of files) {
    if (f.status === "added") {
      changes.push({ path: f.filename, delete: true });
      continue;
    }
    const blob = await gh<{ content: string }>(
      `/contents/${f.previous_filename ?? f.filename}?ref=${parentSha}`,
    ).catch(() => null);
    if (!blob) continue;
    changes.push({ path: f.previous_filename ?? f.filename, bytes: Buffer.from(blob.content, "base64") });
    if (f.previous_filename) changes.push({ path: f.filename, delete: true });
  }

  const head = await branchSha(mainBranch());
  if (!head) throw new Error("Main branch not found");
  const firstLine = target.commit.message.split("\n")[0].replace(PUBLISH_PREFIX, "").replace(COMMIT_PREFIX, "").trim();
  return commitFiles({
    branch: mainBranch(),
    parentSha: head,
    message: `${UNDO_PREFIX} ${firstLine}`,
    changes,
    createBranch: false,
  });
}

type Deployment = { id: number; ref: string; sha: string; environment: string; created_at: string };
type DeploymentStatus = { state: string; environment_url?: string; target_url?: string; created_at: string };

/**
 * Deploy state for a branch head, via the deployment statuses Vercel posts back to GitHub,
 * so no Vercel token is needed. Returns null if the branch or its deployment doesn't exist yet.
 */
export async function latestDeployment(branch: string): Promise<
  { state: string; url?: string; createdAt: string; sha: string } | null
> {
  const sha = await branchSha(branch);
  if (!sha) return null;
  const deployments = await gh<Deployment[]>(`/deployments?sha=${sha}&per_page=1`);
  const d = deployments[0];
  if (!d) return null;
  const statuses = await gh<DeploymentStatus[]>(`/deployments/${d.id}/statuses?per_page=1`);
  const s = statuses[0];
  return {
    state: s?.state ?? "pending",
    url: s?.environment_url || s?.target_url,
    createdAt: s?.created_at ?? d.created_at,
    sha: d.sha,
  };
}
