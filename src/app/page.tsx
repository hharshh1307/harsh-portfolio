import Link from "next/link";
import { ArrowRight, Coffee as CoffeeIcon, Crosshair, Trophy } from "lucide-react";
import { coffee, football, now, profile, projects, travel, valorant, work } from "@/lib/content";
import { getRepos } from "@/lib/github";
import { buildTravelMap } from "@/lib/travel-map";
import { formatMonth, formatRange } from "@/lib/format";
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
  const repos = await getRepos(profile.githubUsername);
  const repoByName = new Map(repos.map((r) => [r.name, r]));
  const map = buildTravelMap({ width: 1000, height: 560 });

  const stackPhotos = travel.trips
    .filter((t) => t.photos[0])
    .slice(0, 3)
    .reverse()
    .map((t) => ({ ...t.photos[0], href: `/travel/${t.slug}`, place: t.place }));

  const valorantLine = [valorant.rank, valorant.role].filter(Boolean).join(" · ");

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
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-2">{profile.intro[0]}</p>
          </div>
          <div className="rise" style={{ ["--rise-delay" as string]: "240ms" }}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <AskButton variant="solid">Ask my AI anything</AskButton>
              <Link href="/work" className="group inline-flex items-center gap-1.5 px-2 py-2.5 text-sm text-ink-2 hover:text-ink">
                See my work
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

      {/* ---------- 01 Work ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="work-heading">
        <Reveal>
          <Chapter n="01" kicker="Work" id="work-heading" title="Ranking things people want to see" href="/work" hrefLabel="Full story" />
        </Reveal>
        <div className="grid gap-12 md:grid-cols-[1fr_1fr]">
          <Reveal>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
              {work.highlights.map((h) => (
                <div key={h.label}>
                  <dt className="sr-only">{h.label}</dt>
                  <dd>
                    <span className="display block text-5xl text-accent">{h.value}</span>
                    <span className="mt-1 block text-sm text-ink-2">{h.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <Reveal delay={0.08}>
            <ol className="divide-y divide-rule border-y border-rule">
              {work.experience.map((e) => (
                <li key={e.company} className="flex items-baseline justify-between gap-4 py-4">
                  <div>
                    <p className="display text-2xl">{e.company}</p>
                    <p className="text-sm text-ink-2">{e.role}</p>
                  </div>
                  <p className="shrink-0 font-mono text-xs text-ink-3">{formatRange(e.start, e.end)}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ---------- 02 Projects ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="projects-heading">
        <Reveal>
          <Chapter n="02" kicker="Side projects" id="projects-heading" title="Things I build after hours" href="/projects" hrefLabel="All projects" />
        </Reveal>
        <ul className="grid gap-5 md:grid-cols-3">
          {projects.featured.slice(0, 3).map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.06}>
              <ProjectCard project={p} repo={p.repo ? repoByName.get(p.repo) : undefined} index={i} />
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ---------- 03 Travel ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="travel-heading">
        <Reveal>
          <Chapter n="03" kicker="Travel" id="travel-heading" title="Places I've been" href="/travel" hrefLabel="Trips & photos" />
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

      {/* ---------- 04 Off the clock ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6" aria-labelledby="life-heading">
        <Reveal>
          <Chapter n="04" kicker="Off the clock" id="life-heading" title="Football, Valorant, coffee" />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr]">
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-2xl bg-[#a50044] p-7 text-[#fbf3e6] [--ink-2:#f3dcc8] [--ink:#fbf3e6] [--accent:#ffd36e] [--accent-soft:#ffd36e33]">
              <div className="flex items-center justify-between">
                <p className="label !text-[#f3dcc8]">
                  <Trophy className="mr-1.5 inline size-3.5" aria-hidden />
                  {football.club}
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
                {valorant.agents.length > 0 && (
                  <p className="mt-3 text-ink-2">Mains: {valorant.agents.map((a) => a.name).join(", ")}</p>
                )}
                {valorant.note && <p className="mt-3 text-ink-2">{valorant.note}</p>}
                {!valorantLine && !valorant.agents.length && !valorant.note && (
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
      </section>

      {/* ---------- Ask ---------- */}
      <section className="mx-auto max-w-6xl px-4 pt-28 sm:px-6" aria-labelledby="ask-heading">
        <Reveal>
          <div className="rounded-3xl border border-rule bg-paper-2 px-6 py-12 sm:px-12 sm:py-16">
            <p className="label mb-4">05 · Ask</p>
            <h2 id="ask-heading" className="display max-w-2xl text-4xl leading-tight sm:text-5xl">
              Still curious? Ask the version of me that <span className="italic">never sleeps.</span>
            </h2>
            <p className="mt-4 max-w-xl text-ink-2">
              It knows everything on this site, checks my GitHub live, and will happily argue about football.
            </p>
            <div className="mt-8 max-w-2xl">
              <AskInline
                placeholder="e.g. what did you build at Zomato?"
                examples={["Summarise your work for a recruiter", "Messi or Ronaldo?", "Where have you travelled?"]}
              />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
