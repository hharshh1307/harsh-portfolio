/**
 * Live GitHub data for the Projects page and the chat agent.
 * Responses are cached by Next for an hour, so the public API's rate limit
 * (60/h unauthenticated) is never an issue. GITHUB_TOKEN raises it and is optional here.
 */
import "server-only";

export type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  homepage: string | null;
  pushedAt: string;
  topics: string[];
  fork: boolean;
};

export type Commit = { repo: string; message: string; date: string; url: string };

const API = "https://api.github.com";

function headers(): HeadersInit {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // A read token is optional. Reuse the bot's token if present (it has repo scope).
  const token = process.env.GITHUB_READ_TOKEN ?? process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

type ApiRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  homepage: string | null;
  pushed_at: string;
  topics?: string[];
  fork: boolean;
  private: boolean;
};

export async function getRepos(username: string): Promise<Repo[]> {
  try {
    const res = await fetch(`${API}/users/${username}/repos?per_page=100&sort=pushed&type=owner`, {
      headers: headers(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as ApiRepo[];
    return data
      .filter((r) => !r.private)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count,
        url: r.html_url,
        homepage: r.homepage || null,
        pushedAt: r.pushed_at,
        topics: r.topics ?? [],
        fork: r.fork,
      }));
  } catch {
    return [];
  }
}

type ApiEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: { commits?: { message: string; sha: string }[] };
};

/** Most recent public commits across all repos (from the events feed). */
export async function getRecentCommits(username: string, limit = 5): Promise<Commit[]> {
  try {
    const res = await fetch(`${API}/users/${username}/events/public?per_page=50`, {
      headers: headers(),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const events = (await res.json()) as ApiEvent[];
    const commits: Commit[] = [];
    for (const e of events) {
      if (e.type !== "PushEvent" || !e.payload.commits) continue;
      const repo = e.repo.name.split("/")[1] ?? e.repo.name;
      for (const c of [...e.payload.commits].reverse()) {
        commits.push({
          repo,
          message: c.message.split("\n")[0],
          date: e.created_at,
          url: `https://github.com/${e.repo.name}/commit/${c.sha}`,
        });
        if (commits.length >= limit) return commits;
      }
    }
    return commits;
  } catch {
    return [];
  }
}
