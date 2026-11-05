import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Live Valorant stats via the community HenrikDev API (https://docs.henrikdev.xyz).
 * Riot's official API doesn't issue personal keys for Valorant (production key + Riot Sign-On
 * required), so this is the practical route for a personal site.
 *
 * Env: HENRIK_API_KEY, VALORANT_RIOT_ID ("name#tag"), VALORANT_REGION (ap | eu | na | kr | latam | br).
 * Cached for 10 minutes; every function returns null on any failure so pages never break.
 */

export type ValorantMatch = {
  map: string;
  agent: string;
  mode: string;
  kills: number;
  deaths: number;
  assists: number;
  won: boolean | null;
  startedAt: string;
};

export type ValorantLive = {
  riotId: string;
  rank: string | null;
  rr: number | null;
  peakRank: string | null;
  lastChange: number | null;
  recent: ValorantMatch[];
  topAgents: { name: string; games: number }[];
  record: { wins: number; losses: number };
};

const BASE = "https://api.henrikdev.xyz";

function config() {
  const key = process.env.HENRIK_API_KEY;
  const region = (process.env.VALORANT_REGION ?? "ap").trim().toLowerCase();
  const [rawName, rawTag] = (process.env.VALORANT_RIOT_ID ?? "").split("#");
  const name = rawName?.trim();
  const tag = rawTag?.trim();
  if (!key || !name || !tag) return null;
  const riotId = `${name}#${tag}`;
  return { key: key.trim(), riotId, region, name: encodeURIComponent(name), tag: encodeURIComponent(tag) };
}

export const valorantConfigured = () => config() !== null;

async function henrik<T>(path: string, key: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: key, Accept: "application/json" },
      // Raw match payloads are several MB (over Next's 2MB fetch-cache limit), so the
      // small derived result is cached instead; see getValorantLive below.
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type MmrV3 = {
  data?: {
    current?: { tier?: { name?: string }; rr?: number; last_change?: number };
    peak?: { tier?: { name?: string } } | null;
  };
};

type MatchesV4 = {
  data?: {
    metadata?: { map?: { name?: string }; queue?: { name?: string }; started_at?: string };
    players?: {
      name?: string;
      tag?: string;
      team_id?: string;
      agent?: { name?: string };
      stats?: { kills?: number; deaths?: number; assists?: number };
    }[];
    teams?: { team_id?: string; won?: boolean }[];
  }[];
};

async function fetchValorantLive(): Promise<ValorantLive> {
  const c = config();
  if (!c) throw new Error("Valorant not configured");

  const [mmr, matches] = await Promise.all([
    henrik<MmrV3>(`/valorant/v3/mmr/${c.region}/pc/${c.name}/${c.tag}`, c.key),
    henrik<MatchesV4>(`/valorant/v4/matches/${c.region}/pc/${c.name}/${c.tag}?size=10`, c.key),
  ]);
  // Throwing (rather than returning null) keeps failures out of the cache.
  if (!mmr && !matches) throw new Error("HenrikDev unavailable");

  const me = (p: { name?: string; tag?: string }) =>
    p.name?.toLowerCase() === decodeURIComponent(c.name).toLowerCase() &&
    p.tag?.toLowerCase() === decodeURIComponent(c.tag).toLowerCase();

  const recent: ValorantMatch[] = [];
  for (const m of matches?.data ?? []) {
    const p = m.players?.find(me);
    if (!p) continue;
    const team = m.teams?.find((t) => t.team_id === p.team_id);
    recent.push({
      map: m.metadata?.map?.name ?? "Unknown",
      agent: p.agent?.name ?? "Unknown",
      mode: m.metadata?.queue?.name ?? "",
      kills: p.stats?.kills ?? 0,
      deaths: p.stats?.deaths ?? 0,
      assists: p.stats?.assists ?? 0,
      won: team?.won ?? null,
      startedAt: m.metadata?.started_at ?? "",
    });
  }

  const counts = new Map<string, number>();
  recent.forEach((m) => counts.set(m.agent, (counts.get(m.agent) ?? 0) + 1));
  const topAgents = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, games]) => ({ name, games }));

  const rank = mmr?.data?.current?.tier?.name ?? null;
  return {
    riotId: c.riotId,
    rank,
    rr: mmr?.data?.current?.rr ?? null,
    peakRank: mmr?.data?.peak?.tier?.name ?? null,
    lastChange: mmr?.data?.current?.last_change ?? null,
    recent,
    topAgents,
    record: {
      wins: recent.filter((m) => m.won === true).length,
      losses: recent.filter((m) => m.won === false).length,
    },
  };
}

/** Cached for 10 minutes per Riot ID, so page views and agent calls share one upstream fetch. */
export async function getValorantLive(): Promise<ValorantLive | null> {
  const c = config();
  if (!c) return null;
  try {
    return await unstable_cache(fetchValorantLive, ["valorant-live", c.riotId, c.region], { revalidate: 600 })();
  } catch {
    return null;
  }
}
