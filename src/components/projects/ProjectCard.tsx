import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { Projects } from "@/lib/content/schema";
import type { Repo } from "@/lib/github";
import { timeAgo } from "@/lib/format";

type Featured = Projects["featured"][number];

export function ProjectCard({ project, repo, index }: { project: Featured; repo?: Repo; index: number }) {
  const href = project.liveUrl ?? repo?.url;
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-rule bg-paper-2 p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-ink-3 hover:shadow-[0_20px_40px_-24px_rgba(30,20,10,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <span className="label">{String(index + 1).padStart(2, "0")}</span>
        {repo && (
          <span className="flex items-center gap-3 font-mono text-[11px] text-ink-3">
            {repo.stars > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3" aria-hidden /> {repo.stars}
              </span>
            )}
            <span title={`Last push ${repo.pushedAt.slice(0, 10)}`}>pushed {timeAgo(repo.pushedAt)}</span>
          </span>
        )}
      </div>
      <h3 className="display mt-6 text-3xl">
        {href ? (
          <Link
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="after:absolute after:inset-0 after:rounded-2xl"
          >
            {project.name}
          </Link>
        ) : (
          project.name
        )}
      </h3>
      <p className="mt-3 flex-1 text-ink-2">{project.tagline}</p>
      <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Tech used">
        {project.stack.map((s) => (
          <li key={s} className="rounded-full border border-rule px-2.5 py-0.5 font-mono text-[11px] text-ink-2">
            {s}
          </li>
        ))}
      </ul>
      {href && (
        <ArrowUpRight
          className="absolute right-5 top-14 size-5 text-ink-3 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden
        />
      )}
    </article>
  );
}
