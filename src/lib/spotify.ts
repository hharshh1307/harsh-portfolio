import "server-only";

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
export type TopMusic = {
  timeRange: TimeRange;
  tracks: { title: string; artist: string; url: string }[];
  artists: { name: string; genres: string[]; url: string }[];
};

/**
 * Top tracks and artists (needs the user-top-read scope). short_term ≈ last 4 weeks,
 * medium_term ≈ 6 months, long_term ≈ all time. Cached for an hour.
 */
export async function getTopMusic(timeRange: TimeRange = "short_term"): Promise<TopMusic | null> {
  if (!spotifyConfigured()) return null;
  try {
    const token = await accessToken();
    if (!token) return null;
    const auth = { Authorization: `Bearer ${token}` };
    const [t, a] = await Promise.all([
      fetch(`https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${timeRange}`, { headers: auth, next: { revalidate: 3600 } }),
      fetch(`https://api.spotify.com/v1/me/top/artists?limit=8&time_range=${timeRange}`, { headers: auth, next: { revalidate: 3600 } }),
    ]);
    if (!t.ok && !a.ok) return null;
    const tracks = t.ok ? ((await t.json()) as { items: SpotifyTrack[] }).items : [];
    const artists = a.ok
      ? ((await a.json()) as { items: { name: string; genres?: string[]; external_urls: { spotify: string } }[] }).items
      : [];
    return {
      timeRange,
      tracks: tracks.map((x) => ({ title: x.name, artist: x.artists.map((r) => r.name).join(", "), url: x.external_urls.spotify })),
      artists: artists.map((x) => ({ name: x.name, genres: x.genres ?? [], url: x.external_urls.spotify })),
    };
  } catch {
    return null;
  }
}

/** Last few tracks played (needs user-read-recently-played). */
export async function getRecentlyPlayed(limit = 10): Promise<{ title: string; artist: string; playedAt: string }[] | null> {
  if (!spotifyConfigured()) return null;
  try {
    const token = await accessToken();
    if (!token) return null;
    const res = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { items: { track: SpotifyTrack; played_at: string }[] };
    return data.items.map((i) => ({
      title: i.track.name,
      artist: i.track.artists.map((a) => a.name).join(", "),
      playedAt: i.played_at,
    }));
  } catch {
    return null;
  }
}

/** Returns the current or last played track, or null if Spotify isn't configured or fails. */
export async function getNowPlaying(): Promise<NowPlaying | null> {
  if (!spotifyConfigured()) return null;
  try {
    const access_token = await accessToken();
    if (!access_token) return null;
    const auth = { Authorization: `Bearer ${access_token}` };

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
  } catch {
    return null;
  }
}
