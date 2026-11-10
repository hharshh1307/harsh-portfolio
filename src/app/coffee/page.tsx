import type { Metadata } from "next";
import { coffee } from "@/lib/content";
import { Missing } from "@/components/ui/Missing";
import { Reveal } from "@/components/ui/Reveal";
import { BrewCalculator } from "@/components/coffee/BrewCalculator";
import { AskButton } from "@/components/chat/AskButton";

export const metadata: Metadata = {
  title: "Coffee",
  description: "My order, my cafés, and a pour-over calculator.",
};

export default function CoffeePage() {
  const c = coffee;
  const ratio = c.ratio ? Math.round((c.ratio.waterGrams / c.ratio.coffeeGrams) * 2) / 2 : 16;

  return (
    <div className="text-[#2b1d12] dark:text-[#efe0cc]">
      <header className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pt-20 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div>
          <p className="label mb-4">Coffee</p>
          <h1 className="display text-6xl leading-[0.95] sm:text-8xl">
            First, <span className="italic">coffee.</span>
          </h1>
          {c.note ? (
            <p className="mt-6 max-w-md text-lg text-ink-2">{c.note}</p>
          ) : (
            <p className="mt-6">
              <Missing what="coffee.note" />
            </p>
          )}
        </div>
        <Reveal>
          <div className="rounded-full border-2 border-dashed border-[#8a4b2a]/50 p-2">
            <div className="flex aspect-square flex-col items-center justify-center rounded-full bg-[#ead9c2] p-8 text-center dark:bg-[#2a2018]">
              <p className="label !text-current opacity-70">Usual order</p>
              <p className="display mt-2 text-3xl leading-tight sm:text-4xl">
                {c.usualOrder ?? (process.env.NODE_ENV === "production" ? "Ask me" : <Missing what="coffee.usualOrder" />)}
              </p>
              {c.cupsPerDay !== undefined && (
                <p className="mt-3 font-mono text-xs opacity-70">
                  {c.cupsPerDay} cup{c.cupsPerDay === 1 ? "" : "s"} a day
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </header>

      <div className="mx-auto max-w-6xl space-y-24 px-4 sm:px-6">
        {(c.cafes.length > 0 || process.env.NODE_ENV !== "production") && (
        <section aria-labelledby="cafes">
          <h2 id="cafes" className="display mb-8 border-b border-rule pb-4 text-4xl">
            Cafés I&apos;d send you to
          </h2>
          {c.cafes.length ? (
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
              {c.cafes.map((cafe, i) => (
                <Reveal as="li" key={cafe.name} delay={(i % 3) * 0.05} className="bg-paper p-6">
                  <p className="display text-2xl">{cafe.name}</p>
                  <p className="font-mono text-xs text-ink-3">{cafe.area}</p>
                  {cafe.order && (
                    <p className="mt-3">
                      <span className="text-ink-3">Get: </span>
                      {cafe.order}
                    </p>
                  )}
                  {cafe.note && <p className="mt-2 text-ink-2">{cafe.note}</p>}
                </Reveal>
              ))}
            </ul>
          ) : (
            <Missing what="coffee.cafes" />
          )}
        </section>
        )}

        {Boolean(c.brewMethod || c.homeSetup?.length || c.beans.length) && (
          <section aria-labelledby="home-setup" className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 id="home-setup" className="display mb-6 text-4xl">
                At home
              </h2>
              {c.brewMethod && <p className="text-lg">{c.brewMethod}</p>}
              {c.homeSetup?.length ? (
                <ul className="mt-4 space-y-2 text-ink-2">
                  {c.homeSetup.map((s) => (
                    <li key={s} className="flex gap-3">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#8a4b2a]" aria-hidden />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {c.beans.length > 0 && (
              <div>
                <h2 className="display mb-6 text-4xl">Beans on rotation</h2>
                <ul className="divide-y divide-rule border-y border-rule">
                  {c.beans.map((b) => (
                    <li key={b.name} className="py-3">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-sm text-ink-2">{[b.roaster, b.note].filter(Boolean).join(" · ")}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        <section aria-label="Brew calculator">
          <BrewCalculator defaultRatio={ratio} defaultCoffee={c.ratio?.coffeeGrams ?? 18} />
        </section>

        <AskButton question="What's your coffee order and where should I get coffee in Bengaluru?">
          Ask for a café recommendation
        </AskButton>
      </div>
    </div>
  );
}
