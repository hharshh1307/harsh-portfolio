"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalJSON } from "@/lib/use-local-json";

type Take = { take: string; spicy: boolean };
type Vote = "agree" | "disagree";

const KEY = "football-votes-v1";

function verdict(agree: number, total: number): string {
  const r = agree / total;
  if (r === 1) return "Perfect agreement. We'd get along on matchday.";
  if (r >= 0.75) return "Mostly with me. We'd watch a Clásico together.";
  if (r >= 0.5) return "Split down the middle. Respectable.";
  if (r > 0) return "You disagree with most of these. Brave.";
  return "You disagree with all of them. Are you a Madridista?";
}

/**
 * Visitors agree/disagree with each take and get a verdict. Votes stay in their browser only
 * (localStorage); there are no global counts, so nothing here is made up.
 */
const NO_VOTES: Record<number, Vote> = {};

export function TakesVote({ takes }: { takes: Take[] }) {
  const [votes, setVotes] = useLocalJSON<Record<number, Vote>>(KEY, NO_VOTES);

  const cast = (i: number, v: Vote) => setVotes({ ...votes, [i]: v });
  const reset = () => setVotes(null);

  const answered = Object.keys(votes).length;
  const agreed = Object.values(votes).filter((v) => v === "agree").length;
  const done = answered === takes.length && takes.length > 0;

  return (
    <div>
      <ol className="space-y-4">
        {takes.map((t, i) => {
          const v = votes[i];
          return (
            <li
              key={t.take}
              className={cn(
                "rounded-2xl border p-5 transition-colors sm:p-6",
                v === "agree" ? "border-[#1f4d36]/40 bg-[#1f4d36]/5" : v === "disagree" ? "border-rule bg-paper-3/60" : "border-rule bg-paper-2",
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="display text-2xl leading-snug">
                  <span className="label mr-3 align-middle">{String(i + 1).padStart(2, "0")}</span>
                  {t.take}
                  {t.spicy && <Flame className="ml-2 inline size-4 text-accent" aria-label="spicy take" />}
                </p>
                <div className="flex shrink-0 gap-2" role="group" aria-label={`Your verdict on take ${i + 1}`}>
                  {(["agree", "disagree"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={v === opt}
                      onClick={() => cast(i, opt)}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-sm capitalize transition-all",
                        v === opt
                          ? opt === "agree"
                            ? "bg-[#1f4d36] text-white"
                            : "bg-ink text-paper"
                          : "border border-rule text-ink-2 hover:border-ink hover:text-ink",
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex min-h-12 flex-wrap items-center justify-between gap-4" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.p
              key="verdict"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="display text-2xl italic"
            >
              {agreed}/{takes.length}. {verdict(agreed, takes.length)}
            </motion.p>
          ) : (
            <motion.p key="progress" className="text-ink-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {answered ? `${answered} of ${takes.length} answered.` : "Agree or disagree. No wrong answers (there are)."}
            </motion.p>
          )}
        </AnimatePresence>
        {answered > 0 && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
            <RotateCcw className="size-3.5" aria-hidden /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
