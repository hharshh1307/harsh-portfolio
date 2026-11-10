import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Coffee as CoffeeIcon, Crosshair, Headphones, Trophy } from "lucide-react";
import { coffee, football, now, profile, projects, travel, valorant, work } from "@/lib/content";
import { getRepos } from "@/lib/github";
import { getValorantLive } from "@/lib/valorant";
import { getNowPlaying, getTopMusic } from "@/lib/spotify";
import { NowPlaying } from "@/components/music/NowPlaying";
import { buildTravelMap } from "@/lib/travel-map";
import { formatMonth } from "@/lib/format";
import { PhotoStack } from "@/components/home/PhotoStack";
import { TravelExplorer } from "@/components/travel/TravelExplorer";
import { TakeCycler } from "@/components/football/TakeCycler";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AskButton } from "@/components/chat/AskButton";
import { AskInline } from "@/components/chat/AskInline";
import { Chapter } from "@/components/ui/Chapter";
import { Reveal } from "@/components/ui/Reveal";
import { Marked } from "@/components/ui/Marked";
import { Missing } from "@/components/ui/Missing";

export const revalidate = 3600;

const TAG_LABEL: Record<string, string> = {
  work: "Work",
  project: "Project",
  travel: "Travel",
  football: "Football",
  valorant: "Valorant",
  coffee: "Coffee",
  life: "Life",
};

export default async function Home() {
  const [repos, valoLive, nowPlaying, topMusic] = await Promise.all([
    getRepos(profile.githubUsername),
    getValorantLive(),
    getNowPlaying(),
    getTopMusic("short_term"),
  ]);
  const onRepeat = (topMusic?.tracks ?? []).filter((t) => t.image).slice(0, 6);
  const repoByName = new Map(repos.map((r) => [r.name, r]));
  const map = buildTravelMap({ width: 1000, height: 560 });

  const stackPhotos = travel.trips
    .filter((t) => t.photos[0])
    .slice(0, 3)
    .reverse()
    .map((t) => ({ ...t.photos[0], href: `/travel/${t.slug}`, place: t.place }));

  const valorantLine = [valoLive?.rank ?? valorant.rank, valorant.role].filter(Boolean).join(" · ");
  const valorantMains = valorant.agents.length ? valorant.agents.map((a) => a.name) : (valoLive?.topAgents ?? []).map((a) => a.name);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 md:grid-cols-[1.2fr_1fr] md:pt-16">
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
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2">{profile.summary}</p>
          </div>
          <div className="rise" style={{ ["--rise-delay" as string]: "240ms" }}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <AskButton variant="solid">Ask my AI anything</AskButton>
              <Link href="/travel" className="group inline-flex items-center gap-1.5 px-2 py-2.5 text-sm text-ink-2 hover:text-ink">
                Where I&apos;ve been
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
        {stackPhotos.length > 0 && <PhotoStack photos={stackPhotos} />}
      </section>

      {/* ---------- Now ---------- */}
      <section aria-labelledby="now-heading" className="border-y border-rule bg-paper-2/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[200px_1fr]">
          <div>
            <h2 id="now-heading" className="display text-2xl italic">
              Now
            </h2>
            <p className="label mt-1 normal-case tracking-normal">posted from my phone</p>
          </div>
          <div>
            {now.status && <p className="text-lg">{now.status}</p>}
            <ul className="mt-3 space-y-2">
              {now.updates.slice(0, 3).map((u, i) => (
                <li key={`${u.date}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-ink-2">
                  <span className="font-mono text-xs text-ink-3">{formatMonth(u.date)}</span>
                  <span className="rounded-full bg-paper-3 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-2">
                    {TAG_LABEL[u.tag]}
                  </span>
                  {u.link ? (
                    <Link href={u.link} className="link">
                      {u.text}
                    </Link>
                  ) : (
                    <span>{u.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- 01 Travel ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="travel-heading">
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
        {travel.wishlist.length > 0 && (
          <p className="mt-6 text-ink-2">
            <span className="label mr-2">Next</span>
            {travel.wishlist.map((w) => `${w.place}${w.why ? ` (${w.why.replace(/\.$/, "")})` : ""}`).join(", ")}
          </p>
        )}
      </section>

      {/* ---------- 02 Off the clock ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="life-heading">
        <Reveal>
          <Chapter n="02" kicker="Off the clock" id="life-heading" title="Football, Valorant, coffee, music" />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-2xl bg-[#1f4d36] p-7 text-[#fbf3e6] [--ink-2:#d9e8dc] [--ink:#fbf3e6] [--accent:#ffd36e] [--accent-soft:#ffd36e33]">
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
            <Link href="/valorant" className="group flex h-full flex-col rounded-2xl border border-rule bg-paper-2 p-7 transition-colors hover:border-ink-3">
              <p className="label">
                <Crosshair className="mr-1.5 inline size-3.5" aria-hidden />
                Valorant
              </p>
              <div className="mt-8 flex-1">
                {valorantLine ? <p className="display text-3xl">{valorantLine}</p> : <Missing what="valorant.rank / role" />}
                {valorantMains.length > 0 && <p className="mt-3 text-ink-2">Mains: {valorantMains.join(", ")}</p>}
                {valorant.note && <p className="mt-3 text-ink-2">{valorant.note}</p>}
                {!valorantLine && !valorantMains.length && !valorant.note && (
                  <p className="text-ink-2">My loadout, mains and map opinions.</p>
                )}
              </div>
              <span className="mt-6 text-sm text-ink-2 group-hover:text-ink">Loadout →</span>
            </Link>
          </Reveal>

          <Reveal delay={0.12} className="h-full">
            <Link href="/coffee" className="group flex h-full flex-col rounded-2xl border border-rule bg-[#ead9c2] p-7 text-[#2b1d12] transition-colors hover:border-ink-3 dark:bg-[#2a2018] dark:text-[#efe0cc]">
              <p className="label !text-current opacity-70">
                <CoffeeIcon className="mr-1.5 inline size-3.5" aria-hidden />
                Coffee
              </p>
              <div className="mt-8 flex-1">
                {coffee.usualOrder ? (
                  <>
                    <p className="label !text-current opacity-60 normal-case tracking-normal">Usual order</p>
                    <p className="display mt-1 text-3xl">{coffee.usualOrder}</p>
                  </>
                ) : (
                  <>
                    <Missing what="coffee.usualOrder" />
                    <p className="mt-2 opacity-80">My order, my cafés, and a brew calculator.</p>
                  </>
                )}
                {coffee.cafes.length > 0 && <p className="mt-3 opacity-80">{coffee.cafes.length} cafés I&apos;d send you to</p>}
              </div>
              <span className="mt-6 text-sm opacity-80 group-hover:opacity-100">Brew notes →</span>
            </Link>
          </Reveal>
        </div>

        {(nowPlaying || onRepeat.length > 0) && (
          <Reveal className="mt-5">
            <div className="grid items-center gap-8 overflow-hidden rounded-2xl border border-rule bg-paper-2 p-6 sm:p-7 md:grid-cols-[1fr_1.3fr]">
              <div className="min-w-0">
                <p className="label mb-5">
                  <Headphones className="mr-1.5 inline size-3.5" aria-hidden />
                  Music
                </p>
                <NowPlaying initial={nowPlaying} />
              </div>
              {onRepeat.length > 0 && (
                <div>
                  <div className="mb-3 flex items-baseline justify-between">
                    <p className="label">On repeat this month</p>
                    <Link href="/music" className="text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline">
                      All of it →
                    </Link>
                  </div>
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {onRepeat.map((t) => (
                      <li key={t.url}>
                        <a href={t.url} target="_blank" rel="noopener noreferrer" className="group block" title={`${t.title} · ${t.artist}`}>
                          <Image
                            src={t.image!}
                            alt={`${t.title} by ${t.artist}`}
                            width={120}
                            height={120}
                            className="aspect-square w-full rounded-md transition-transform group-hover:-translate-y-1"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Reveal>
        )}
      </section>

      {/* ---------- 03 Projects ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="projects-heading">
        <Reveal>
          <Chapter n="03" kicker="Side projects" id="projects-heading" title="Things I build after hours" href="/projects" hrefLabel="All projects" />
        </Reveal>
        <ul className="grid gap-5 md:grid-cols-3">
          {projects.featured.slice(0, 3).map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.06}>
              <ProjectCard project={p} repo={p.repo ? repoByName.get(p.repo) : undefined} index={i} />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- Day job ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="work-heading">
        <Reveal>
          <div className="grid gap-6 border-y border-rule py-10 md:grid-cols-[200px_1fr_auto] md:items-center">
            <h2 id="work-heading" className="display text-2xl italic">
              Day job
            </h2>
            <div>
              <p className="text-lg">
                {profile.currentRole} at {profile.currentCompany}
                {work.experience[1] && <span className="text-ink-2">, previously {work.experience[1].company}</span>}.
                Mostly working on:
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.focusAreas.map((f) => (
                  <li key={f} className="rounded-full border border-rule bg-paper-2 px-3 py-1 text-sm">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/work" className="group inline-flex items-center gap-1 text-sm text-ink-2 hover:text-ink">
              Work
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- Ask ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6" aria-labelledby="ask-heading">
        <Reveal>
          <div className="rounded-3xl border border-rule bg-paper-2 px-6 py-12 sm:px-12 sm:py-16">
            <p className="label mb-4">04 · Ask</p>
            <h2 id="ask-heading" className="display max-w-2xl text-4xl leading-tight sm:text-5xl">
              Still curious? Ask the version of me that <span className="italic">never sleeps.</span>
            </h2>
            <p className="mt-4 max-w-xl text-ink-2">
              It knows everything on this site, checks my GitHub, Spotify and Valorant stats live, and will happily argue about football.
            </p>
            <div className="mt-8 max-w-2xl">
              <AskInline
                placeholder="e.g. what are you listening to these days?"
                examples={["Messi or Ronaldo?", "What are you listening to?", "Where have you travelled?"]}
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
