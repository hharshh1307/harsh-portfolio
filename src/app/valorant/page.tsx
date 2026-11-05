import type { Metadata } from "next";
import { valorant } from "@/lib/content";
import { getValorantLive } from "@/lib/valorant";
import { timeAgo } from "@/lib/format";
import { Missing } from "@/components/ui/Missing";
import { Reveal } from "@/components/ui/Reveal";
import { CopyButton } from "@/components/ui/CopyButton";
import { AskButton } from "@/components/chat/AskButton";

export const metadata: Metadata = {
  title: "Valorant",
  description: "Rank, mains, maps and settings.",
};

function Stat({ label, value, field }: { label: string; value?: string; field: string }) {
  return (
    <div className="border-l-2 border-[#ff4655] pl-4">
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#8b978f]">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold uppercase tracking-wide text-[#ece8e1]">
        {value ?? <Missing what={field} />}
        {!value && process.env.NODE_ENV === "production" && "—"}
      </dd>
    </div>
  );
}

export const revalidate = 600;

export default async function ValorantPage() {
  const live = await getValorantLive();
  const v = {
    ...valorant,
    rank: live?.rank ? `${live.rank}${live.rr !== null ? ` · ${live.rr} RR` : ""}` : valorant.rank,
    peakRank: live?.peakRank ?? valorant.peakRank,
    agents: valorant.agents.length
      ? valorant.agents
      : (live?.topAgents ?? []).map((a) => ({ name: a.name, note: `${a.games} of last ${live?.recent.length} games` })),
  };
  const hasAnything = Boolean(v.rank || v.role || v.agents.length || v.favouriteMap || v.crosshairCode || v.note);

  return (
    <div className="bg-[#0f1923] text-[#ece8e1] [--ink-3:#8b978f]">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -right-24 top-0 h-full w-[60%] -skew-x-12 bg-[#ff4655]/10"
          aria-hidden
        />
        <header className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#ff4655]">Valorant</p>
          <h1 className="mt-4 text-6xl font-black uppercase leading-[0.9] tracking-tight sm:text-8xl">
            {v.role ? (
              <>
                {v.role}
                <br />
                <span className="text-[#ff4655]">main.</span>
              </>
            ) : (
              <>
                Locked
                <br />
                <span className="text-[#ff4655]">in.</span>
              </>
            )}
          </h1>
          {v.note ? (
            <p className="mt-6 max-w-lg text-lg text-[#c5c9c5]">{v.note}</p>
          ) : (
            <div className="mt-6">
              <Missing what="valorant.note" />
            </div>
          )}
          {!hasAnything && process.env.NODE_ENV === "production" && (
            <p className="mt-6 max-w-lg text-lg text-[#c5c9c5]">
              Rank, mains and settings are on their way.
            </p>
          )}
        </header>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <dl className="grid grid-cols-2 gap-8 border-y border-white/10 py-10 md:grid-cols-4">
            <Stat label="Current rank" value={v.rank} field="valorant.rank" />
            <Stat label="Peak" value={v.peakRank} field="valorant.peakRank" />
            <Stat label="Role" value={v.role} field="valorant.role" />
            <Stat label="Sensitivity" value={v.sensitivity} field="valorant.sensitivity" />
          </dl>
        </Reveal>

        <div className="mt-16 grid gap-16 md:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="agents">
            <h2 id="agents" className="font-mono text-xs uppercase tracking-[0.3em] text-[#8b978f]">
              Agent pool
            </h2>
            {v.agents.length ? (
              <ol className="mt-6 space-y-3">
                {v.agents.map((a, i) => (
                  <Reveal as="li" key={a.name} delay={i * 0.05}>
                    <div className="group flex items-baseline gap-5 border-b border-white/10 pb-3 transition-colors hover:border-[#ff4655]">
                      <span className="font-mono text-sm text-[#ff4655]">{String(i + 1).padStart(2, "0")}</span>
                      <span className="text-3xl font-bold uppercase tracking-wide">{a.name}</span>
                      {a.note && <span className="text-[#c5c9c5]">{a.note}</span>}
                    </div>
                  </Reveal>
                ))}
              </ol>
            ) : (
              <div className="mt-6">
                <Missing what="valorant.agents" />
              </div>
            )}
          </section>

          <section aria-labelledby="maps" className="space-y-10">
            <div>
              <h2 id="maps" className="font-mono text-xs uppercase tracking-[0.3em] text-[#8b978f]">
                Maps
              </h2>
              <dl className="mt-6 space-y-4">
                <div>
                  <dt className="text-sm text-[#8b978f]">Happy place</dt>
                  <dd className="text-2xl font-bold uppercase">{v.favouriteMap ?? <Missing what="valorant.favouriteMap" />}</dd>
                </div>
                {v.leastFavouriteMap && (
                  <div>
                    <dt className="text-sm text-[#8b978f]">Instant dodge</dt>
                    <dd className="text-2xl font-bold uppercase">{v.leastFavouriteMap}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-[#8b978f]">Crosshair</h2>
              {v.crosshairCode ? (
                <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4">
                  <code className="block break-all font-mono text-sm text-[#c5c9c5]">{v.crosshairCode}</code>
                  <CopyButton
                    value={v.crosshairCode}
                    label="Copy crosshair code"
                    className="mt-3 border-[#ff4655]/50 text-[#ff4655] hover:bg-[#ff4655] hover:text-white"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <Missing what="valorant.crosshairCode" />
                </div>
              )}
            </div>

            {v.playsWith && (
              <p className="text-[#c5c9c5]">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#8b978f]">Duo / stack · </span>
                {v.playsWith}
              </p>
            )}
          </section>
        </div>

        {live && live.recent.length > 0 && (
          <section aria-labelledby="recent" className="mt-16">
            <div className="flex items-baseline justify-between">
              <h2 id="recent" className="font-mono text-xs uppercase tracking-[0.3em] text-[#8b978f]">
                Last {live.recent.length} games
              </h2>
              <p className="font-mono text-xs text-[#8b978f]">
                {live.record.wins}W · {live.record.losses}L · live from {live.riotId.split("#")[0]}
              </p>
            </div>
            <ol className="mt-4 divide-y divide-white/10 border-y border-white/10">
              {live.recent.map((m, i) => (
                <li key={`${m.startedAt}-${i}`} className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-3 sm:grid-cols-[auto_1fr_1fr_auto_auto]">
                  <span
                    className={
                      m.won === true
                        ? "w-6 font-mono text-sm font-bold text-[#3fd3a6]"
                        : m.won === false
                          ? "w-6 font-mono text-sm font-bold text-[#ff4655]"
                          : "w-6 font-mono text-sm text-[#8b978f]"
                    }
                  >
                    {m.won === true ? "W" : m.won === false ? "L" : "–"}
                  </span>
                  <span className="font-semibold uppercase tracking-wide">{m.map}</span>
                  <span className="hidden text-[#c5c9c5] sm:block">{m.agent}</span>
                  <span className="font-mono text-sm text-[#c5c9c5]">
                    {m.kills}/{m.deaths}/{m.assists}
                  </span>
                  <span className="hidden font-mono text-xs text-[#8b978f] sm:block">{m.startedAt ? timeAgo(m.startedAt) : ""}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div className="mt-16">
          <AskButton
            question="What do you play in Valorant and how did you get into it?"
            className="!border-[#ff4655]/50 !text-[#ece8e1] hover:!border-[#ff4655]"
          >
            Ask about my Valorant
          </AskButton>
        </div>
      </div>
    </div>
  );
}
