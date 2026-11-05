"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, RefreshCw } from "lucide-react";

/** Shows one hot take at a time; tap for the next one. */
export function TakeCycler({ takes }: { takes: { take: string; spicy: boolean }[] }) {
  const [i, setI] = useState(0);
  if (!takes.length) return null;
  const t = takes[i];
  return (
    <div>
      <div className="relative min-h-[5.5rem]" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.blockquote
            key={i}
            initial={{ opacity: 0, y: 10, rotate: -0.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="display text-2xl leading-snug"
          >
            “{t.take}”
            {t.spicy && (
              <span className="ml-2 inline-flex translate-y-[-2px] items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-wider text-accent">
                <Flame className="size-3" aria-hidden /> spicy
              </span>
            )}
          </motion.blockquote>
        </AnimatePresence>
      </div>
      {takes.length > 1 && (
        <button
          type="button"
          onClick={() => setI((n) => (n + 1) % takes.length)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"
        >
          <RefreshCw className="size-3.5" aria-hidden /> Another take ({i + 1}/{takes.length})
        </button>
      )}
    </div>
  );
}
