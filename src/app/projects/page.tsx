import type { Metadata } from "next";
import { profile, projects } from "@/lib/content";
import { getRecentCommits, getRepos } from "@/lib/github";
import { timeAgo } from "@/lib/format";
import { PageIntro } from "@/components/ui/Chapter";
import { Reveal } from "@/components/ui/Reveal";
import { Missing } from "@/components/ui/Missing";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { RepoList } from "@/components/projects/RepoList";
import { AskButton } from "@/components/chat/AskButton";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects",
  description: "Side projects: AI agents, iOS apps, market tools, and this website.",
};

export default async function ProjectsPage() {
  const [repos, commits] = await Promise.all([
    getRepos(profile.githubUsername),
    getRecentCommits(profile.githubUsername, 6),
  ]);
  const byName = new Map(repos.map((r) => [r.name, r]));
  const hidden = new Set(projects.hiddenRepos);
  const listed = repos.filter((r) => !r.fork && !hidden.has(r.name));

  return (
    <>
      <PageIntro kicker="Projects" title={<>Built after hours, mostly with agents in the loop.</>}>
        <p>The ones I&apos;d show a friend, then everything else straight from GitHub.</p>
      </PageIntro>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="space-y-20">
          {projects.featured.map((p, i) => (
            <Reveal as="li" key={p.slug}>
              <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-start">
                <ProjectCard project={p} repo={p.repo ? byName.get(p.repo) : undefined} index={i} />
                <div className="md:pt-6">
                  <p className="label mb-3">The story</p>
                  {p.story ? (
                    <p className="text-lg leading-relaxed">{p.story}</p>
                  ) : (
                    <Missing what={`projects.${p.slug}.story`} />
                  )}
                  <div className="mt-6">
                    <AskButton question={`Tell me about ${p.name}: what it does and how it's built.`}>
                      Ask about {p.name}
                    </AskButton>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-28 grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <section aria-labelledby="all-repos">
            <h2 id="all-repos" className="display mb-6 text-3xl">
              Everything on GitHub
            </h2>
            <RepoList repos={listed} />
          </section>
          <section aria-labelledby="commits">
            <h2 id="commits" className="display mb-6 text-3xl">
              Latest commits
            </h2>
            {commits.length ? (
              <ol className="relative space-y-5 border-l border-rule pl-5">
                {commits.map((c) => (
                  <li key={c.url} className="relative">
                    <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-accent ring-4 ring-paper" aria-hidden />
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="group block">
                      <span className="block text-[15px] group-hover:text-accent">{c.message}</span>
                      <span className="mt-0.5 block font-mono text-xs text-ink-3">
                        {c.repo} · {timeAgo(c.date)}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-ink-2">No public commits in the last few weeks.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
