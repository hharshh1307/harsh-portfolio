import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";
import { getRecentCommits, getRepos } from "@/lib/github";
import { getNowPlaying, getRecentlyPlayed, getTopMusic } from "@/lib/spotify";
import { getValorantLive } from "@/lib/valorant";
import { content } from "@/lib/content";
import { sendMessage, escapeHtml } from "@/lib/bot/telegram";
import { rateLimit } from "@/lib/rate-limit";

const hidden = new Set(content.projects.hiddenRepos);

export type ToolContext = { ip: string };

/** Tools are built per request so the visitor-facing ones (leaveMessage) can rate-limit by IP. */
export function createAgentTools({ ip }: ToolContext) {
  return {
  getGitHubActivity: tool({
    description: "Live public GitHub repositories and the most recent commits.",
    inputSchema: z.object({}),
    execute: async () => {
      const [repos, commits] = await Promise.all([
        getRepos(content.profile.githubUsername),
        getRecentCommits(content.profile.githubUsername, 8),
      ]);
      return {
        repos: repos
          .filter((r) => !r.fork && !hidden.has(r.name))
          .slice(0, 12)
          .map(({ name, description, language, stars, pushedAt, url }) => ({
            name,
            description,
            language,
            stars,
            lastPush: pushedAt.slice(0, 10),
            url,
          })),
        recentCommits: commits.map((c) => ({ ...c, date: c.date.slice(0, 10) })),
      };
    },
  }),

  getMusic: tool({
    description:
      "Spotify listening data. view='now' = playing right now; 'recent' = last tracks played; 'top' = most played tracks and artists for a period. Use 'top' for taste questions and for recommending music (recommend from these, don't invent).",
    inputSchema: z.object({
      view: z.enum(["now", "recent", "top"]),
      period: z.enum(["short_term", "medium_term", "long_term"]).default("short_term").describe("For 'top': ~4 weeks, ~6 months, all time"),
    }),
    execute: async ({ view, period }) => {
      if (view === "now") {
        const t = await getNowPlaying();
        return t ? { isPlaying: t.isPlaying, title: t.title, artist: t.artist, url: t.songUrl } : { unavailable: true };
      }
      if (view === "recent") {
        const r = await getRecentlyPlayed(10);
        return r ? r.map(({ title, artist, playedAt }) => ({ title, artist, playedAt })) : { unavailable: true };
      }
      const top = await getTopMusic(period);
      if (!top) return { unavailable: true };
      // Image URLs are noise for the model; keep titles, artists and links.
      return {
        period,
        tracks: top.tracks.map(({ title, artist, url }) => ({ title, artist, url })),
        artists: top.artists.map(({ name, genres }) => (genres.length ? { name, genres } : { name })),
      };
    },
  }),

  getValorantStats: tool({
    description: "Live Valorant stats: current rank and RR, peak rank, last 10 matches (map, agent, K/D/A, result), most played agents.",
    inputSchema: z.object({}),
    execute: async () => (await getValorantLive()) ?? { unavailable: true },
  }),

  getSnapshot: tool({
    description:
      "One combined, live snapshot: what he's focused on, his latest update, what's playing on Spotify, Valorant rank and last match, and the most recent GitHub commit. Use for 'what are you up to / doing right now / these days'.",
    inputSchema: z.object({}),
    execute: async () => {
      const [music, valo, commits] = await Promise.all([
        getNowPlaying().catch(() => null),
        getValorantLive().catch(() => null),
        getRecentCommits(content.profile.githubUsername, 1).catch(() => []),
      ]);
      const last = valo?.recent[0];
      return {
        focus: content.now.status ?? null,
        latestUpdate: content.now.updates[0] ?? null,
        music: music ? { isPlaying: music.isPlaying, title: music.title, artist: music.artist } : null,
        valorant: valo
          ? {
              rank: valo.rank,
              rr: valo.rr,
              lastMatch: last ? { map: last.map, agent: last.agent, won: last.won, kda: `${last.kills}/${last.deaths}/${last.assists}`, at: last.startedAt } : null,
            }
          : null,
        latestCommit: commits[0] ? { repo: commits[0].repo, message: commits[0].message, date: commits[0].date.slice(0, 10) } : null,
      };
    },
  }),

  leaveMessage: tool({
    description:
      "Deliver a visitor's message to the site owner's phone. Only call this after the visitor has clearly asked you to pass something on AND given the message text. Call it once per message; never invent or embellish the text.",
    inputSchema: z.object({
      message: z.string().min(5).max(1000).describe("The visitor's message, verbatim"),
      name: z.string().max(80).optional().describe("Visitor's name, if they gave one"),
      contact: z.string().max(200).optional().describe("How to reply: email, LinkedIn, phone. Only if they gave one"),
    }),
    execute: async ({ message, name, contact }) => {
      const owner = Number(process.env.TELEGRAM_OWNER_ID);
      if (!process.env.TELEGRAM_BOT_TOKEN || !owner) {
        return { delivered: false, reason: "messaging isn't set up", fallback: content.profile.links.linkedin };
      }
      // Per-visitor and global caps so the owner's phone can't be spammed through the bot.
      if (!rateLimit(`msg:${ip}`, { limit: 3, windowMs: 60 * 60_000 }) || !rateLimit("msg:all", { limit: 40, windowMs: 24 * 60 * 60_000 })) {
        return { delivered: false, reason: "too many messages right now", fallback: content.profile.links.linkedin };
      }
      try {
        await sendMessage(
          owner,
          `💬 <b>Message from the website</b>\n` +
            `From: ${escapeHtml(name?.trim() || "anonymous")}${contact ? ` · ${escapeHtml(contact.trim())}` : ""}\n\n` +
            `${escapeHtml(message.trim())}`,
        );
        return { delivered: true, canReply: Boolean(contact) };
      } catch {
        return { delivered: false, reason: "delivery failed", fallback: content.profile.links.linkedin };
      }
    },
  }),

  searchWeb: tool({
    description: "Search the web for current events (football results, news, game patches). Not for facts about the site owner.",
    inputSchema: z.object({ query: z.string().min(2).max(200) }),
    execute: async ({ query }) => {
      const apiKey = process.env.TAVILY_API_KEY;
      if (!apiKey) return { unavailable: true };
      try {
        const res = await tavily({ apiKey }).search(query, { maxResults: 4, searchDepth: "basic" });
        return {
          results: res.results.map((r) => ({ title: r.title, url: r.url, snippet: r.content.slice(0, 400) })),
        };
      } catch {
        return { error: "search failed" };
      }
    },
  }),
  };
}

export type AgentTools = ReturnType<typeof createAgentTools>;
