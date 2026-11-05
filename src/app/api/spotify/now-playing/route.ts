import { getNowPlaying, spotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!spotifyConfigured()) return Response.json({ configured: false }, { status: 200 });
  const track = await getNowPlaying();
  return Response.json(
    { configured: true, track },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
}
