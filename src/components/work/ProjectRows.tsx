"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Work } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

type Project = Work["experience"][number]["projects"][number];

/** Expandable list of projects within a role. The impact is always visible; details on demand. */
export function ProjectRows({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {projects.map((p, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-${i}`;
        return (
          <li key={p.name}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="group flex w-full items-start justify-between gap-6 py-4 text-left"
            >
              <span>
                <span className="block text-lg font-medium group-hover:text-accent">{p.name}</span>
                {p.impact && <span className="mt-0.5 block text-sm text-accent">{p.impact}</span>}
              </span>
              <Plus
                className={cn("mt-1.5 size-4 shrink-0 text-ink-3 transition-transform duration-300", isOpen && "rotate-45")}
                aria-hidden
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 pr-8">
                    <p className="text-ink-2">{p.description}</p>
                    {p.stack && (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {p.stack.map((s) => (
                          <li key={s} className="rounded-full border border-rule px-2.5 py-0.5 font-mono text-[11px] text-ink-2">
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
