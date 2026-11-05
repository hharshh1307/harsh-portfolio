import { after } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { handleUpdate } from "@/lib/bot/handlers";
import type { TgUpdate } from "@/lib/bot/telegram";

export const maxDuration = 60;

function secretOk(req: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const got = req.headers.get("x-telegram-bot-api-secret-token");
  if (!expected || !got) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Telegram webhook. Responds 200 immediately (so Telegram never retries) and does the work
 * after the response. Only requests carrying the secret registered with setWebhook are accepted;
 * only TELEGRAM_OWNER_ID can make changes (checked in handleUpdate).
 */
export async function POST(req: Request) {
  if (!secretOk(req)) return new Response("Forbidden", { status: 403 });

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  after(() => handleUpdate(update).catch((e) => console.error("telegram handler failed", e)));
  return new Response("ok");
}
