import Link from "next/link";
import { ArrowRight, ArrowUpRight, Coffee as CoffeeIcon, Crosshair, Headphones, Trophy } from "lucide-react";
import { coffee, football, now, profile, projects, travel, valorant } from "@/lib/content";
import { getValorantLive } from "@/lib/valorant";
import { getNowPlaying } from "@/lib/spotify";
import { NowPlaying } from "@/components/music/NowPlaying";
import { buildTravelMap } from "@/lib/travel-map";
import { formatMonth } from "@/lib/format";
import { PhotoStack } from "@/components/home/PhotoStack";
import { TravelExplorer } from "@/components/travel/TravelExplorer";
import { TakeCycler } from "@/components/football/TakeCycler";
import { AskInline } from "@/components/chat/AskInline";
import { Chapter } from "@/components/ui/Chapter";
import { Reveal } from "@/components/ui/Reveal";
import { Marked } from "@/components/ui/Marked";
import { Missing } from "@/components/ui/Missing";

export const revalidate = 3600;

export default async function Home() {
  const [valoLive, nowPlaying] = await Promise.all([getValorantLive(), getNowPlaying()]);
  const map = buildTravelMap({ width: 1000, height: 560 });
  const latest = now.updates[0];

  const stackPhotos = travel.trips
    .filter((t) => t.photos[0])
    .slice(0, 3)
    .reverse()
    .map((t) => ({ ...t.photos[0], href: `/travel/${t.slug}`, place: t.place }));

  const valorantLine = [valoLive?.rank ?? valorant.rank, valorant.role].filter(Boolean).join(" · ");

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-16">
        <div>
          <div className="rise">
            <p className="label mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                {profile.location}
              </span>
              <span aria-hidden>·</span>
              <span>
                {profile.currentRole} at {profile.currentCompany}
              </span>
            </p>
          </div>
          <div className="rise" style={{ ["--rise-delay" as string]: "80ms" }}>
            <h1 className="display text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem]">
              <Marked text={profile.headline} />
            </h1>
          </div>
          <div className="rise" style={{ ["--rise-delay" as string]: "160ms" }}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-2">
              Ask the AI version of me anything. It knows this whole site and checks my GitHub, Spotify and Valorant live.
            </p>
          </div>
          <div className="rise mt-7" style={{ ["--rise-delay" as string]: "240ms" }}>
            <AskInline
              placeholder="Ask me anything…"
              examples={["What are you up to right now?", "Where should I travel next?", "Messi or Ronaldo?"]}
            />
          </div>
        </div>
        {stackPhotos.length > 0 && <PhotoStack photos={stackPhotos} />}
      </section>

      {/* ---------- Now ---------- */}
      <section aria-labelledby="now-heading" className="border-y border-rule bg-paper-2/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-4 gap-y-2 px-4 py-5 sm:px-6">
          <h2 id="now-heading" className="display shrink-0 text-xl italic">
            Now
          </h2>
          {now.status && <p className="text-ink-2">{now.status}</p>}
          {latest && (
            <p className="ml-auto flex items-baseline gap-3 text-sm text-ink-2">
              <span className="font-mono text-xs text-ink-3">{formatMonth(latest.date)}</span>
              {latest.link ? (
                <Link href={latest.link} className="link">
                  {latest.text}
                </Link>
              ) : (
                <span>{latest.text}</span>
              )}
            </p>
          )}
        </div>
      </section>

      {/* ---------- 01 Travel ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6" aria-labelledby="travel-heading">
        <Reveal>
          <Chapter n="01" kicker="Travel" id="travel-heading" title="Places I've been" href="/travel" hrefLabel="Trips & photos" />
        </Reveal>
        <Reveal>
          <TravelExplorer
            variant="compact"
            trips={travel.trips}
            width={map.width}
            height={map.height}
            land={map.land}
            home={map.home}
            pins={map.pins}
            compact
          />
        </Reveal>
      </section>

      {/* ---------- 02 Off the clock ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="life-heading">
        <Reveal>
          <Chapter n="02" kicker="Off the clock" id="life-heading" title="Football, Valorant, coffee, music" />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-2xl bg-[#1f4d36] p-7 text-[#fbf3e6] [--accent-soft:#ffd36e33] [--accent:#ffd36e] [--ink-2:#d9e8dc] [--ink:#fbf3e6]">
              <div className="flex items-center justify-between">
                <p className="label !text-[#d9e8dc]">
                  <Trophy className="mr-1.5 inline size-3.5" aria-hidden />
                  Football
                </p>
                <Link href="/football" className="text-sm underline-offset-4 hover:underline">
                  More takes →
                </Link>
              </div>
              <div className="mt-8 flex-1">
                <TakeCycler takes={football.takes} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="h-full">
            <div className="flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-rule bg-paper-2 p-7">
              <div className="flex items-center justify-between">
                <p className="label">
                  <Headphones className="mr-1.5 inline size-3.5" aria-hidden />
                  Music
                </p>
                <Link href="/music" className="text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                  On repeat →
                </Link>
              </div>
              <div className="mt-8">
                {nowPlaying ? <NowPlaying initial={nowPlaying} /> : <p className="text-ink-2">Whatever Spotify says I had on last.</p>}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="h-full">
            <Link
              href="/valorant"
              className="group flex h-full items-end justify-between gap-4 rounded-2xl border border-rule bg-paper-2 p-7 transition-colors hover:border-ink-3"
            >
              <span className="min-w-0">
                <span className="label block">
                  <Crosshair className="mr-1.5 inline size-3.5" aria-hidden />
                  Valorant
                </span>
                {valorantLine ? (
                  <span className="display mt-6 block text-3xl">{valorantLine}</span>
                ) : (
                  <span className="mt-6 block">
                    <Missing what="valorant.rank / role" />
                  </span>
                )}
              </span>
              <ArrowUpRight className="size-5 shrink-0 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </Reveal>

          <Reveal delay={0.18} className="h-full">
            <Link
              href="/coffee"
              className="group flex h-full items-end justify-between gap-4 rounded-2xl border border-rule bg-[#ead9c2] p-7 text-[#2b1d12] transition-colors hover:border-ink-3 dark:bg-[#2a2018] dark:text-[#efe0cc]"
            >
              <span className="min-w-0">
                <span className="label !text-current block opacity-70">
                  <CoffeeIcon className="mr-1.5 inline size-3.5" aria-hidden />
                  Coffee
                </span>
                {coffee.usualOrder ? (
                  <span className="display mt-6 block text-2xl leading-snug">{coffee.usualOrder}</span>
                ) : (
                  <span className="mt-6 block">
                    <Missing what="coffee.usualOrder" />
                  </span>
                )}
              </span>
              <ArrowUpRight className="size-5 shrink-0 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- 03 Projects ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6" aria-labelledby="projects-heading">
        <Reveal>
          <Chapter n="03" kicker="Side projects" id="projects-heading" title="Things I build after hours" href="/projects" hrefLabel="All projects" />
        </Reveal>
        <ul className="border-b border-rule">
          {projects.featured.slice(0, 3).map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.06} className="border-t border-rule">
              <Link href="/projects" className="group flex items-center gap-6 py-6">
                <span className="display min-w-0 flex-1 text-3xl sm:text-4xl">
                  <span className="underline-offset-[6px] group-hover:underline">{p.name}</span>
                </span>
                <span className="hidden min-w-0 flex-1 truncate text-ink-2 sm:block">{p.stack.slice(0, 3).join(" · ")}</span>
                <ArrowRight className="size-5 shrink-0 text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-accent" aria-hidden />
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
