import "server-only";
import { unstable_cache } from "next/cache";

export type NowPlaying = {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumImageUrl: string;
  songUrl: string;
};

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

export function spotifyConfigured(): boolean {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET && process.env.SPOTIFY_REFRESH_TOKEN,
  );
}

type SpotifyTrack = {
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
};

function toNowPlaying(track: SpotifyTrack, isPlaying: boolean): NowPlaying {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumImageUrl: track.album.images[0]?.url ?? "",
    songUrl: track.external_urls.spotify,
  };
}

async function accessToken(): Promise<string | null> {
  const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.SPOTIFY_REFRESH_TOKEN! }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  return ((await res.json()) as { access_token: string }).access_token;
}

export type TimeRange = "short_term" | "medium_term" | "long_term";
export type Track = { title: string; artist: string; album: string; image: string | null; url: string };
export type TopMusic = {
  timeRange: TimeRange;
  tracks: Track[];
  artists: { name: string; genres: string[]; image: string | null; url: string }[];
};

function toTrack(t: SpotifyTrack): Track {
  return {
    title: t.name,
    artist: t.artists.map((a) => a.name).join(", "),
    album: t.album.name,
    // Spotify lists images largest first; the 300px one (index 1) is plenty for cards.
    image: t.album.images[1]?.url ?? t.album.images[0]?.url ?? null,
    url: t.external_urls.spotify,
  };
}

async function spotifyGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify ${path} → ${res.status}`);
  return (await res.json()) as T;
}

type SpotifyArtist = { name: string; genres?: string[]; images?: { url: string }[]; external_urls: { spotify: string } };

async function fetchTopMusic(timeRange: TimeRange): Promise<TopMusic> {
  const token = await accessToken();
  if (!token) throw new Error("Spotify token refresh failed");
  const [t, a] = await Promise.all([
    spotifyGet<{ items: SpotifyTrack[] }>(`/me/top/tracks?limit=10&time_range=${timeRange}`, token),
    spotifyGet<{ items: SpotifyArtist[] }>(`/me/top/artists?limit=8&time_range=${timeRange}`, token),
  ]);
  return {
    timeRange,
    tracks: t.items.map(toTrack),
    artists: a.items.map((x) => ({
      name: x.name,
      genres: x.genres ?? [],
      image: x.images?.[1]?.url ?? x.images?.[0]?.url ?? null,
      url: x.external_urls.spotify,
    })),
  };
}

/**
 * Top tracks and artists (needs the user-top-read scope). short_term ≈ last 4 weeks,
 * medium_term ≈ 6 months, long_term ≈ all time. Cached for an hour; failures aren't cached.
 */
export async function getTopMusic(timeRange: TimeRange = "short_term"): Promise<TopMusic | null> {
  if (!spotifyConfigured()) return null;
  try {
    return await unstable_cache(fetchTopMusic, ["spotify-top"], { revalidate: 3600 })(timeRange);
  } catch {
    return null;
  }
}

export type RecentPlay = Track & { playedAt: string };

async function fetchRecentlyPlayed(limit: number): Promise<RecentPlay[]> {
  const token = await accessToken();
  if (!token) throw new Error("Spotify token refresh failed");
  const data = await spotifyGet<{ items: { track: SpotifyTrack; played_at: string }[] }>(
    `/me/player/recently-played?limit=${limit}`,
    token,
  );
  return data.items.map((i) => ({ ...toTrack(i.track), playedAt: i.played_at }));
}

/** Last few tracks played (needs user-read-recently-played). Cached for 5 minutes. */
export async function getRecentlyPlayed(limit = 10): Promise<RecentPlay[] | null> {
  if (!spotifyConfigured()) return null;
  try {
    return await unstable_cache(fetchRecentlyPlayed, ["spotify-recent"], { revalidate: 300 })(limit);
  } catch {
    return null;
  }
}

async function fetchNowPlaying(): Promise<NowPlaying | null> {
  const token = await accessToken();
  if (!token) throw new Error("Spotify token refresh failed");
  const auth = { Authorization: `Bearer ${token}` };

  const now = await fetch(NOW_PLAYING, { headers: auth, cache: "no-store" });
  if (now.status === 200) {
    const song = (await now.json()) as { is_playing: boolean; item: SpotifyTrack | null };
    if (song.item) return toNowPlaying(song.item, song.is_playing);
  }

  const recent = await fetch(RECENTLY_PLAYED, { headers: auth, cache: "no-store" });
  if (recent.status === 200) {
    const data = (await recent.json()) as { items: { track: SpotifyTrack }[] };
    const track = data.items[0]?.track;
    if (track) return toNowPlaying(track, false);
  }
  return null;
}

/**
 * Current or last played track, or null if Spotify isn't configured or fails. Cached for a
 * minute so pages stay static (ISR); the NowPlaying component refreshes itself client-side.
 */
export async function getNowPlaying(): Promise<NowPlaying | null> {
  if (!spotifyConfigured()) return null;
  try {
    return await unstable_cache(fetchNowPlaying, ["spotify-now"], { revalidate: 60 })();
  } catch {
    return null;
  }
}
