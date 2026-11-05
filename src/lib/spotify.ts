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

/** Returns the current or last played track, or null if Spotify isn't configured or fails. */
export async function getNowPlaying(): Promise<NowPlaying | null> {
  if (!spotifyConfigured()) return null;
  try {
    const basic = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString("base64");
    const tokenRes = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: process.env.SPOTIFY_REFRESH_TOKEN! }),
      cache: "no-store",
    });
    if (!tokenRes.ok) return null;
    const { access_token } = (await tokenRes.json()) as { access_token: string };
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
