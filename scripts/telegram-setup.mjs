#!/usr/bin/env node
/**
 * Registers the Telegram webhook and the bot's command menu.
 *
 *   TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=... SITE_URL=https://your-site.vercel.app \
 *     node scripts/telegram-setup.mjs
 *
 * (or put them in .env.local and run: node --env-file=.env.local scripts/telegram-setup.mjs)
 */
const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_SECRET: secret, SITE_URL: site } = process.env;

if (!token || !secret || !site) {
  console.error("Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and SITE_URL first.");
  process.exit(1);
}
if (!site.startsWith("https://")) {
  console.error("SITE_URL must be the public https:// URL (Telegram can't reach localhost).");
  process.exit(1);
}

async function call(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}

const url = `${site.replace(/\/$/, "")}/api/bot/telegram`;
await call("setWebhook", {
  url,
  secret_token: secret,
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
});
await call("setMyCommands", {
  commands: [
    { command: "status", description: "Live and preview deploy state" },
    { command: "pending", description: "Show the current draft" },
    { command: "publish", description: "Publish the draft" },
    { command: "discard", description: "Throw the draft away" },
    { command: "undo", description: "Revert the last published change" },
    { command: "todo", description: "What's still missing on the site" },
    { command: "deploy", description: "Force a production redeploy" },
    { command: "help", description: "How this works" },
  ],
});
const info = await call("getWebhookInfo", {});
console.log(`Webhook set → ${info.url}`);
console.log("Now message your bot /whoami and set TELEGRAM_OWNER_ID in Vercel to the number it replies with.");
