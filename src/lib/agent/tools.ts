import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";
import { getRecentCommits, getRepos } from "@/lib/github";
import { getNowPlaying } from "@/lib/spotify";
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

  getNowPlaying: tool({
    description: "What is playing on Spotify right now (or the last track played).",
    inputSchema: z.object({}),
    execute: async () => (await getNowPlaying()) ?? { unavailable: true },
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
