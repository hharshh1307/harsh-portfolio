import type { Metadata } from "next";
import Image from "next/image";
import { getNowPlaying, getRecentlyPlayed, getTopMusic, spotifyConfigured } from "@/lib/spotify";
import { timeAgo } from "@/lib/format";
import { NowPlaying } from "@/components/music/NowPlaying";
import { Reveal } from "@/components/ui/Reveal";
import { AskButton } from "@/components/chat/AskButton";

export const metadata: Metadata = {
  title: "Music",
  description: "What I've had on repeat, straight from Spotify.",
};

export const revalidate = 300;

export default async function MusicPage() {
  const [now, top, recent] = await Promise.all([getNowPlaying(), getTopMusic("short_term"), getRecentlyPlayed(8)]);
  const nothing = !now && !top && !recent;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <header className="grid gap-10 pb-16 pt-12 sm:pt-20 md:grid-cols-[1.2fr_1fr] md:items-end">
        <div>
          <p className="label mb-4">Music</p>
          <h1 className="display text-6xl leading-[0.95] sm:text-8xl">
            On <span className="italic">repeat.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-ink-2">Pulled live from my Spotify, so it&apos;s honest, even when it&apos;s embarrassing.</p>
          <div className="mt-6">
            <AskButton question="Recommend me something based on what you've been listening to">Ask for a recommendation</AskButton>
          </div>
        </div>
        {now && (
          <Reveal>
            <div className="min-w-0 overflow-hidden rounded-2xl border border-rule bg-paper-2 p-5 sm:p-6">
              <NowPlaying initial={now} size="lg" />
            </div>
          </Reveal>
        )}
      </header>

      {nothing && (
        <p className="rounded-2xl border border-dashed border-rule p-8 text-ink-2">
          {spotifyConfigured() ? "Spotify isn't answering right now. Try again in a bit." : "Spotify isn't connected yet."}
        </p>
      )}

      {top && top.tracks.length > 0 && (
        <section aria-labelledby="top-tracks" className="pt-8">
          <h2 id="top-tracks" className="display mb-8 border-b border-rule pb-4 text-4xl">
            Most played, last 4 weeks
          </h2>
          <ol className="grid gap-x-10 gap-y-4 md:grid-cols-2">
            {top.tracks.map((t, i) => (
              <Reveal as="li" key={t.url} delay={(i % 2) * 0.04}>
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
                  <span className="w-6 shrink-0 text-right font-mono text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  {t.image && (
                    <Image src={t.image} alt="" width={56} height={56} className="size-14 shrink-0 rounded-md" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium underline-offset-4 group-hover:underline">{t.title}</span>
                    <span className="block truncate text-sm text-ink-2">{t.artist}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {top && top.artists.length > 0 && (
        <section aria-labelledby="top-artists" className="pt-24">
          <h2 id="top-artists" className="display mb-8 border-b border-rule pb-4 text-4xl">
            Artists I keep going back to
          </h2>
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {top.artists.map((a, i) => (
              <Reveal as="li" key={a.url} delay={(i % 4) * 0.04}>
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="group block text-center">
                  {a.image ? (
                    <Image
                      src={a.image}
                      alt=""
                      width={240}
                      height={240}
                      className="mx-auto aspect-square w-full max-w-48 rounded-full object-cover grayscale transition group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="mx-auto block aspect-square w-full max-w-48 rounded-full bg-paper-2" />
                  )}
                  <span className="display mt-3 block text-xl underline-offset-4 group-hover:underline">{a.name}</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {recent && recent.length > 0 && (
        <section aria-labelledby="recent" className="pt-24">
          <h2 id="recent" className="display mb-8 border-b border-rule pb-4 text-4xl">
            Recently played
          </h2>
          <ul className="divide-y divide-rule">
            {recent.map((t, i) => (
              <li key={`${t.playedAt}-${i}`}>
                <a href={t.url} target="_blank" rel="noopener noreferrer" className="group flex items-baseline gap-4 py-3">
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium underline-offset-4 group-hover:underline">{t.title}</span>
                    <span className="text-ink-2"> · {t.artist}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ink-3">{timeAgo(t.playedAt)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
