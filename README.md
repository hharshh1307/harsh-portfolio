# harsh-portfolio

Personal site: work, projects, travel, football, Valorant, coffee, and an AI that answers as me.
Next.js 16 on Vercel. Content is updated from my phone through a Telegram bot.

## How it fits together

```
content/*.json ──► the website (validated at build time)
      │
      └────────► the chat agent's knowledge (/api/chat)

Telegram ─► /api/bot/telegram ─► LLM drafts an edit ─► commit on branch bot/pending
                                                        │  (Vercel builds a preview)
                                    you tap Publish ────┘► merged into main ─► Vercel deploys
```

- **`content/`**: the only place personal info lives. Schemas in `src/lib/content/schema.ts`.
  A bad edit fails the build, so it can't reach production.
- **Chat agent** (`src/lib/agent/`): sees all of `content/` every turn, plus tools for live
  GitHub activity, Spotify and web search.
- **Telegram bot** (`src/lib/bot/`): you send plain text or a photo with a caption, it drafts
  the change and shows a diff, and nothing goes live until you tap Publish. `/undo` reverts the last
  published change.

## Develop

```bash
npm install
cp .env.example .env.local   # fill in what you need
npm run dev                  # http://localhost:3000
npm run build && npm run lint
```

In dev, dashed **missing: …** chips show content that hasn't been written yet. They never
render in production.

## Set up the Telegram bot (one time, ~10 minutes)

1. In Telegram, message **@BotFather** → `/newbot` → copy the token.
2. Create a GitHub **fine-grained token** for this repo only, with *Contents: Read and write*
   and *Deployments: Read-only*.
3. In Vercel → Settings → Environment Variables, add `TELEGRAM_BOT_TOKEN`,
   `TELEGRAM_WEBHOOK_SECRET` (`openssl rand -hex 32`), `GITHUB_TOKEN`, `GITHUB_REPO`,
   `SITE_URL`, `OPENAI_API_KEY`. Redeploy.
4. Register the webhook:
   `node --env-file=.env.local scripts/telegram-setup.mjs`
5. Message your bot `/whoami`, put the number in `TELEGRAM_OWNER_ID` on Vercel, redeploy.
   Only that account can change the site.

Then just talk to it: *"Went to Coorg in October, stayed on a coffee estate"*, or send a photo
with the caption *"add to Gokarna"*. `/todo` lists what the site is still missing.
