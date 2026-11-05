import "server-only";
import { contentFiles, contentKeys, type ContentKey, type SiteContent } from "@/lib/content/schema";
import { findMissing } from "@/lib/content/missing";
import { plan, type ContentSnapshot } from "./planner";
import {
  branchSha,
  COMMIT_PREFIX,
  commitFiles,
  comparePending,
  deleteBranch,
  latestDeployment,
  mainBranch,
  mergePending,
  PENDING_BRANCH,
  PUBLISH_PREFIX,
  readText,
  recentPublishedChanges,
  revertCommit,
  type FileChange,
} from "./repo";
import {
  answerCallback,
  downloadFile,
  editMessage,
  escapeHtml as esc,
  sendMessage,
  sendTyping,
  type TgMessage,
  type TgUpdate,
} from "./telegram";

const MAX_PHOTO_BYTES = 6 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const HELP = `<b>Site bot</b>
Just tell me what changed, in plain words. Examples:
• <i>Went to Coorg last weekend, stayed at a coffee estate</i>
• <i>Shipped the RTO model to 100% at Newme, cut COD fraud 18%</i>
• <i>My Valorant rank is Diamond 2, I main Omen and Viper</i>
• Send a <b>photo</b> with a caption like <i>add to Gokarna</i>

I draft the change on a preview branch and show you a diff. Nothing goes live until you tap <b>Publish</b>. Follow-up messages refine the same draft.

/status – live and preview deploy state
/pending – show the current draft
/publish – publish the draft
/discard – throw the draft away
/undo – revert the last published change
/todo – what's still missing on the site
/deploy – force a production redeploy
/whoami – your Telegram user id`;

const publishButtons = [[
  { text: "✅ Publish", callback_data: "publish" },
  { text: "🗑 Discard", callback_data: "discard" },
]];

function isOwner(userId: number | undefined): boolean {
  const owner = process.env.TELEGRAM_OWNER_ID;
  return Boolean(owner && userId && String(userId) === owner.trim());
}

async function snapshot(ref: string): Promise<ContentSnapshot> {
  const entries = await Promise.all(
    contentKeys.map(async (k) => [k, (await readText(contentFiles[k].file, ref)) ?? "{}"] as const),
  );
  return Object.fromEntries(entries) as ContentSnapshot;
}

function siteUrl(): string | undefined {
  return process.env.SITE_URL?.replace(/\/$/, "");
}

// ---------- Commands ----------

async function status(chatId: number) {
  const [prod, preview, cmp] = await Promise.all([
    latestDeployment(mainBranch()),
    latestDeployment(PENDING_BRANCH),
    comparePending(),
  ]);
  const icon = (s?: string) =>
    s === "success" ? "🟢" : s === "failure" || s === "error" ? "🔴" : s ? "🟡" : "⚪️";
  const lines = [
    `<b>Production</b> ${icon(prod?.state)} ${prod?.state ?? "no deployment found"}`,
    prod?.url ? prod.url : siteUrl() ?? "",
  ];
  if (cmp) {
    lines.push(
      "",
      `<b>Draft</b> (${cmp.ahead_by} change${cmp.ahead_by === 1 ? "" : "s"}) ${icon(preview?.state)} ${preview?.state ?? "building soon"}`,
    );
    if (preview?.url) lines.push(`Preview: ${preview.url}`);
  } else lines.push("", "No draft pending.");
  await sendMessage(chatId, lines.filter((l) => l !== undefined).join("\n"), cmp ? publishButtons : undefined);
}

async function pending(chatId: number) {
  const cmp = await comparePending();
  if (!cmp || cmp.ahead_by === 0) return sendMessage(chatId, "No draft pending.");
  const msgs = cmp.commits.map((c) => `• ${esc(c.commit.message.split("\n")[0].replace(COMMIT_PREFIX, "").trim())}`);
  const files = (cmp.files ?? []).map((f) => `<code>${esc(f.filename)}</code>`).join(", ");
  await sendMessage(chatId, `<b>Draft</b>\n${msgs.join("\n")}\n\nFiles: ${files}`, publishButtons);
}

async function publish(chatId: number) {
  const cmp = await comparePending();
  if (!cmp || cmp.ahead_by === 0) return sendMessage(chatId, "Nothing to publish.");
  const titles = cmp.commits.map((c) => c.commit.message.split("\n")[0].replace(COMMIT_PREFIX, "").trim());
  const message = `${PUBLISH_PREFIX} ${titles.join("; ").slice(0, 120)}\n\nPublished from Telegram.`;
  const result = await mergePending(message);
  if (result === "conflict") {
    return sendMessage(
      chatId,
      "⚠️ The draft conflicts with changes made on main since it was started. /discard it and send the update again.",
    );
  }
  await deleteBranch(PENDING_BRANCH);
  await sendMessage(
    chatId,
    `🚀 Published. Vercel is deploying now (about a minute).\nCheck with /status${siteUrl() ? `\n${siteUrl()}` : ""}`,
  );
}

async function discard(chatId: number) {
  if (!(await branchSha(PENDING_BRANCH))) return sendMessage(chatId, "No draft to discard.");
  await deleteBranch(PENDING_BRANCH);
  await sendMessage(chatId, "🗑 Draft discarded.");
}

async function undo(chatId: number, confirmed: boolean) {
  const [last] = await recentPublishedChanges(1);
  if (!last) return sendMessage(chatId, "No published bot changes to undo.");
  const title = last.commit.message.split("\n")[0];
  if (!confirmed) {
    return sendMessage(chatId, `Undo this change?\n<i>${esc(title)}</i>`, [[
      { text: "↩️ Yes, undo", callback_data: "undo" },
      { text: "Cancel", callback_data: "cancel" },
    ]]);
  }
  await revertCommit(last.sha);
  await sendMessage(chatId, `↩️ Reverted <i>${esc(title)}</i>. Redeploying now.`);
}

async function todo(chatId: number) {
  const snap = await snapshot(mainBranch());
  const parsed = Object.fromEntries(contentKeys.map((k) => [k, JSON.parse(snap[k])])) as SiteContent;
  let items;
  try {
    items = findMissing(parsed);
  } catch {
    return sendMessage(chatId, "Couldn't read the content on main.");
  }
  if (!items.length) return sendMessage(chatId, "Nothing missing. The site is complete 🎉");
  const bySection = new Map<string, string[]>();
  for (const i of items) bySection.set(i.section, [...(bySection.get(i.section) ?? []), i.hint]);
  const out = [...bySection].map(([s, hints]) => `<b>${s}</b>\n${hints.map((h) => `• ${esc(h)}`).join("\n")}`);
  await sendMessage(chatId, `Still missing (just reply with the answers):\n\n${out.join("\n\n")}`);
}

async function deploy(chatId: number) {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return sendMessage(chatId, "Set VERCEL_DEPLOY_HOOK_URL to enable /deploy.");
  const res = await fetch(hook, { method: "POST" });
  await sendMessage(chatId, res.ok ? "🔁 Production redeploy triggered." : `Deploy hook failed (${res.status}).`);
}

// ---------- Free-text / photo updates ----------

async function getPhoto(msg: TgMessage): Promise<{ bytes: Uint8Array; mediaType: string; ext: string } | { error: string } | null> {
  if (msg.photo?.length) {
    const largest = msg.photo.reduce((a, b) => (a.width * a.height >= b.width * b.height ? a : b));
    const { bytes } = await downloadFile(largest.file_id);
    return { bytes, mediaType: "image/jpeg", ext: "jpg" };
  }
  if (msg.document) {
    const mime = msg.document.mime_type ?? "";
    if (!mime.startsWith("image/")) return null;
    const ext = IMAGE_TYPES[mime];
    if (!ext) return { error: `${mime} isn't supported in browsers. Send it as a normal photo (not a file) instead.` };
    if ((msg.document.file_size ?? 0) > MAX_PHOTO_BYTES) return { error: "That image is over 6 MB. Send it as a normal photo so Telegram compresses it." };
    const { bytes } = await downloadFile(msg.document.file_id);
    return { bytes, mediaType: mime, ext };
  }
  return null;
}

async function update(msg: TgMessage) {
  const chatId = msg.chat.id;
  const text = (msg.text ?? msg.caption ?? "").trim();

  const photo = await getPhoto(msg);
  if (photo && "error" in photo) return sendMessage(chatId, photo.error);
  if (!text && !photo) return sendMessage(chatId, "Send some text or a photo. /help for examples.");

  await sendTyping(chatId);
  const progress = await sendMessage(chatId, "✍️ Drafting…");

  const pendingSha = await branchSha(PENDING_BRANCH);
  const base = pendingSha ? PENDING_BRANCH : mainBranch();
  const snap = await snapshot(base);

  let photoInfo: { src: string; bytes: Uint8Array; mediaType: string } | undefined;
  if (photo) {
    const id = Math.random().toString(36).slice(2, 8);
    const src = `/images/uploads/${new Date().toISOString().slice(0, 10)}-${id}.${photo.ext}`;
    photoInfo = { src, bytes: photo.bytes, mediaType: photo.mediaType };
  }

  const result = await plan({ message: text, snapshot: snap, photo: photoInfo });

  if (result.kind === "answer") {
    return editMessage(chatId, progress.message_id, esc(result.reply));
  }

  const changes: FileChange[] = result.files.map((f) => ({ path: contentFiles[f.key].file, text: f.text }));
  // Only commit the photo if the plan actually references it.
  if (photoInfo && result.files.some((f) => f.text.includes(photoInfo.src))) {
    changes.push({ path: `public${photoInfo.src}`, bytes: photoInfo.bytes });
  }

  const parentSha = pendingSha ?? (await branchSha(mainBranch()));
  if (!parentSha) throw new Error("Main branch not found");
  await commitFiles({
    branch: PENDING_BRANCH,
    parentSha,
    message: `${COMMIT_PREFIX} ${result.title}`,
    changes,
    createBranch: !pendingSha,
  });

  const diff = result.diff.map((l) => esc(l)).join("\n");
  await editMessage(
    chatId,
    progress.message_id,
    `${esc(result.reply)}\n\n<pre>${diff}</pre>\n\n${pendingSha ? "Added to your draft." : "Drafted."} A preview deploy is building (/status for the link). Reply to refine it.`,
  );
  await sendMessage(chatId, "Publish when ready:", publishButtons);
}

// ---------- Entry point ----------

export async function handleUpdate(u: TgUpdate): Promise<void> {
  if (u.callback_query) {
    const cq = u.callback_query;
    const chatId = cq.message?.chat.id;
    if (!chatId || !isOwner(cq.from.id)) return answerCallback(cq.id, "Not allowed.");
    await answerCallback(cq.id);
    try {
      if (cq.data === "publish") await publish(chatId);
      else if (cq.data === "discard") await discard(chatId);
      else if (cq.data === "undo") await undo(chatId, true);
    } catch (e) {
      console.error("bot callback error", e);
      await sendMessage(chatId, `⚠️ ${esc(e instanceof Error ? e.message : "Something went wrong")}`).catch(() => undefined);
    }
    return;
  }

  const msg = u.message;
  if (!msg || msg.chat.type !== "private") return;
  const chatId = msg.chat.id;
  const command = msg.text?.startsWith("/") ? msg.text.split(/[\s@]/)[0].toLowerCase() : null;

  if (command === "/whoami") {
    return void sendMessage(chatId, `Your Telegram user id is <code>${msg.from?.id}</code>. Set it as TELEGRAM_OWNER_ID.`);
  }
  if (!isOwner(msg.from?.id)) {
    return void sendMessage(chatId, "This is a private bot.");
  }

  try {
    switch (command) {
      case "/start":
      case "/help":
        return void (await sendMessage(chatId, HELP));
      case "/status":
        return void (await status(chatId));
      case "/pending":
        return void (await pending(chatId));
      case "/publish":
        return void (await publish(chatId));
      case "/discard":
        return void (await discard(chatId));
      case "/undo":
        return void (await undo(chatId, false));
      case "/todo":
        return void (await todo(chatId));
      case "/deploy":
        return void (await deploy(chatId));
      case null:
        return void (await update(msg));
      default:
        return void (await sendMessage(chatId, "Unknown command. /help"));
    }
  } catch (e) {
    console.error("bot error", e);
    await sendMessage(chatId, `⚠️ ${esc(e instanceof Error ? e.message : "Something went wrong")}`).catch(() => undefined);
  }
}

export type { ContentKey };
