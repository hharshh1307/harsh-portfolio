"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import type { Repo } from "@/lib/github";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

type Sort = "recent" | "stars";

export function RepoList({ repos }: { repos: Repo[] }) {
  const [lang, setLang] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("recent");

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    repos.forEach((r) => r.language && counts.set(r.language, (counts.get(r.language) ?? 0) + 1));
    return ["All", ...[...counts].sort((a, b) => b[1] - a[1]).map(([l]) => l)];
  }, [repos]);

  const shown = useMemo(() => {
    const list = lang === "All" ? repos : repos.filter((r) => r.language === lang);
    return [...list].sort((a, b) =>
      sort === "stars" ? b.stars - a.stars || +new Date(b.pushedAt) - +new Date(a.pushedAt) : +new Date(b.pushedAt) - +new Date(a.pushedAt),
    );
  }, [repos, lang, sort]);

  if (!repos.length) {
    return <p className="text-ink-2">GitHub didn&apos;t answer just now. The repos will be back on the next refresh.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter by language" className="flex flex-wrap gap-1.5">
          {languages.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                lang === l ? "bg-ink text-paper" : "border border-rule text-ink-2 hover:border-ink hover:text-ink",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-2">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-rule bg-paper px-3 py-1 text-ink"
          >
            <option value="recent">Recently pushed</option>
            <option value="stars">Stars</option>
          </select>
        </label>
      </div>

      <ul className="divide-y divide-rule border-y border-rule">
        <AnimatePresence initial={false}>
          {shown.map((r) => (
            <motion.li
              key={r.name}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-4"
              >
                <span className="font-mono text-[15px] group-hover:text-accent">
                  {r.name}
                  <ArrowUpRight className="ml-1 inline size-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </span>
                <span className="flex items-center gap-4 font-mono text-xs text-ink-3">
                  {r.language && <span>{r.language}</span>}
                  {r.stars > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3" aria-hidden />
                      {r.stars}
                    </span>
                  )}
                  <span className="hidden sm:inline">{timeAgo(r.pushedAt)}</span>
                </span>
                {r.description && <span className="col-span-2 text-sm text-ink-2">{r.description}</span>}
              </a>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
