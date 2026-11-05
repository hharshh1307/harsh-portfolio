"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Pick a topic, read the opinion. Tabs pattern with arrow-key support. */
export function OpinionPicker({ opinions }: { opinions: { topic: string; opinion: string }[] }) {
  const [active, setActive] = useState(0);
  if (!opinions.length) return null;
  const current = opinions[active];

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
      <div
        role="tablist"
        aria-label="Topics"
        className="flex flex-wrap content-start gap-2"
        onKeyDown={(e) => {
          const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
          if (!delta) return;
          e.preventDefault();
          const next = (active + delta + opinions.length) % opinions.length;
          setActive(next);
          document.getElementById(`op-tab-${next}`)?.focus();
        }}
      >
        {opinions.map((o, i) => (
          <button
            key={o.topic}
            role="tab"
            id={`op-tab-${i}`}
            aria-selected={i === active}
            aria-controls="op-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm transition-colors",
              i === active ? "bg-ink text-paper" : "border border-rule text-ink-2 hover:border-ink hover:text-ink",
            )}
          >
            {o.topic}
          </button>
        ))}
      </div>
      <div id="op-panel" role="tabpanel" aria-labelledby={`op-tab-${active}`} className="min-h-40">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.topic}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <p className="label mb-3">On {current.topic}</p>
            <p className="display text-3xl leading-snug">{current.opinion}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
