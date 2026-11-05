import type { Metadata } from "next";
import { profile, work } from "@/lib/content";
import { duration, formatMonth, formatRange } from "@/lib/format";
import { PageIntro } from "@/components/ui/Chapter";
import { Reveal } from "@/components/ui/Reveal";
import { AskButton } from "@/components/chat/AskButton";

export const metadata: Metadata = {
  title: "Work",
  description: `${profile.currentRole} at ${profile.currentCompany}. Experience, projects and impact.`,
};

export default function WorkPage() {
  return (
    <>
      <PageIntro kicker="Work" title={<>What I do between nine and six.</>}>
        {profile.intro.slice(0, 2).map((p) => (
          <p key={p} className="mt-3 first:mt-0">
            {p}
          </p>
        ))}
        <div className="mt-6 flex flex-wrap gap-3">
          <AskButton question="What kind of problems do you work on?">Ask about my work</AskButton>
          <a
            href={profile.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-rule px-4 py-2 text-sm text-ink-2 hover:border-ink hover:text-ink"
          >
            LinkedIn ↗
          </a>
        </div>
      </PageIntro>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="flex flex-wrap gap-2 border-y border-rule py-6" aria-label="Focus areas">
          {profile.focusAreas.map((f) => (
            <li key={f} className="display rounded-full border border-rule bg-paper-2 px-4 py-1.5 text-lg">
              {f}
            </li>
          ))}
        </ul>

        <section aria-labelledby="exp" className="mt-20">
          <h2 id="exp" className="label mb-8">
            Experience
          </h2>
          <ol className="space-y-12">
            {work.experience.map((e) => (
              <Reveal as="li" key={e.company}>
                <article className="grid gap-6 border-b border-rule pb-12 md:grid-cols-[260px_1fr]">
                  <header className="md:sticky md:top-24 md:self-start">
                    <h3 className="display text-4xl">{e.company}</h3>
                    <p className="mt-1 text-ink-2">{e.role}</p>
                    <p className="mt-3 font-mono text-xs text-ink-3">
                      {formatRange(e.start, e.end)}
                      <br />
                      {duration(e.start, e.end)} · {e.location}
                    </p>
                  </header>
                  <div>
                    <p className="text-lg">{e.summary}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`Things I worked on at ${e.company}`}>
                      {e.projects.map((p) => (
                        <li key={p.name} className="rounded-full border border-rule px-3 py-1 text-sm text-ink-2">
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>
        </section>

        <div className="mt-24 grid gap-16 md:grid-cols-2">
          <Reveal>
            <section aria-labelledby="edu">
              <h2 id="edu" className="label mb-6">
                Education
              </h2>
              {work.education.map((ed) => (
                <div key={ed.institution}>
                  <p className="display text-3xl">{ed.institution}</p>
                  <p className="mt-1 text-ink-2">{ed.degree}</p>
                  <p className="mt-2 font-mono text-xs text-ink-3">
                    {formatMonth(ed.start)} – {formatMonth(ed.end)}
                    {ed.grade && ` · ${ed.grade}`}
                  </p>
                  {ed.courses && (
                    <ul className="mt-4 space-y-1 text-ink-2">
                      {ed.courses.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <h2 className="label mb-4 mt-12">Achievements</h2>
              <ul className="space-y-3">
                {work.achievements.map((a) => (
                  <li key={a.title} className="flex gap-4">
                    {a.year && <span className="w-10 shrink-0 font-mono text-xs leading-6 text-ink-3">{a.year}</span>}
                    <span>
                      <span className="font-medium">{a.title}</span>
                      <span className="text-ink-2"> · {a.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
          <Reveal delay={0.06}>
            <section aria-labelledby="skills">
              <h2 id="skills" className="label mb-6">
                Toolbox
              </h2>
              <dl className="space-y-6">
                {work.skills.map((g) => (
                  <div key={g.group}>
                    <dt className="display text-xl italic">{g.group}</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {g.items.map((s) => (
                        <span key={s} className="rounded-full border border-rule bg-paper-2 px-3 py-1 text-sm text-ink-2">
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>
        </div>
      </div>
    </>
  );
}
