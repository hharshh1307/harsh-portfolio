import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";
import { getRecentCommits, getRepos } from "@/lib/github";
import { getNowPlaying, getRecentlyPlayed, getTopMusic } from "@/lib/spotify";
import { getValorantLive } from "@/lib/valorant";
import { content } from "@/lib/content";

const hidden = new Set(content.projects.hiddenRepos);

export const agentTools = {
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

export type AgentTools = typeof agentTools;
