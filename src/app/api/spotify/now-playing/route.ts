const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

async function getAccessToken() {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN || "",
    }),
  });

  return response.json();
}

export async function GET() {
  // If credentials not configured, return mock data
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return Response.json({
      isPlaying: false,
      title: "Not configured",
      artist: "Set up Spotify credentials",
      album: "",
      albumImageUrl: "",
      songUrl: "",
    });
  }

  try {
    const { access_token } = await getAccessToken();

    // Try to get currently playing
    const nowPlayingRes = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // If playing something
    if (nowPlayingRes.status === 200) {
      const song = await nowPlayingRes.json();

      if (song.item) {
        return Response.json({
          isPlaying: song.is_playing,
          title: song.item.name,
          artist: song.item.artists.map((a: { name: string }) => a.name).join(", "),
          album: song.item.album.name,
          albumImageUrl: song.item.album.images[0]?.url || "",
          songUrl: song.item.external_urls.spotify,
        });
      }
    }

    // If not playing, get recently played
    const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (recentRes.status === 200) {
      const recent = await recentRes.json();
      const track = recent.items[0]?.track;

      if (track) {
        return Response.json({
          isPlaying: false,
          title: track.name,
          artist: track.artists.map((a: { name: string }) => a.name).join(", "),
          album: track.album.name,
          albumImageUrl: track.album.images[0]?.url || "",
          songUrl: track.external_urls.spotify,
        });
      }
    }

    return Response.json({
      isPlaying: false,
      title: "Nothing playing",
      artist: "",
      album: "",
      albumImageUrl: "",
      songUrl: "",
    });
  } catch (error) {
    console.error("Spotify API error:", error);
    return Response.json(
      { error: "Failed to fetch Spotify data" },
      { status: 500 }
    );
  }
}
