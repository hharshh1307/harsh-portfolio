import type { Metadata } from "next";
import Image from "next/image";
import { football } from "@/lib/content";
import { withSizes } from "@/lib/images";
import { Chapter } from "@/components/ui/Chapter";
import { Missing } from "@/components/ui/Missing";
import { Reveal } from "@/components/ui/Reveal";
import { TakesVote } from "@/components/football/TakesVote";
import { OpinionPicker } from "@/components/football/OpinionPicker";
import { AskButton } from "@/components/chat/AskButton";

export const metadata: Metadata = {
  title: "Football",
  description: "Takes I will defend, and a few I probably shouldn't.",
};

export default async function FootballPage() {
  const [photo] = football.photo ? await withSizes([football.photo]) : [];
  const publicOpinions = football.opinions.filter((o) => !o.agentOnly);

  return (
    <>
      <header className="relative overflow-hidden bg-[#1f4d36] text-[#fbf3e6]">
        {/* Mown-pitch stripes. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "repeating-linear-gradient(90deg, #ffffff0a 0 64px, transparent 64px 128px)" }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="label mb-4 !text-[#d9e8dc]">Football</p>
            <h1 className="display text-6xl leading-[0.95] sm:text-8xl">
              Strong <span className="italic">opinions.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-[#d9e8dc]">
              Weakly held, mostly. Vote on the takes below, or argue with my AI. It knows which club I support.
            </p>
            {football.since ? (
              <p className="mt-3 max-w-md text-[#d9e8dc]">{football.since}</p>
            ) : (
              <p className="mt-3">
                <Missing what="football.since" />
              </p>
            )}
            <div className="mt-8">
              <AskButton
                question="Messi or Ronaldo? Convince me."
                className="!border-[#fbf3e6]/40 !text-[#fbf3e6] hover:!border-[#fbf3e6]"
              >
                Argue with my AI
              </AskButton>
            </div>
          </div>
          {photo && (
            <Reveal className="relative mx-auto w-full max-w-xs md:mx-0 md:justify-self-end">
              <figure className="rotate-2 bg-[#fbf8f2] p-3 pb-10 shadow-2xl">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={photo.src} alt={photo.alt} fill sizes="320px" className="object-cover object-top" priority />
                </div>
                <figcaption className="absolute inset-x-0 bottom-3 text-center font-display text-lg italic text-[#2a241d]">
                  {photo.caption ?? "The GOAT"}
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <section aria-labelledby="takes" className="pt-20">
          <Reveal>
            <Chapter n="01" kicker="Hot takes" id="takes" title="Do you agree?" />
          </Reveal>
          <TakesVote takes={football.takes} />
        </section>

        {publicOpinions.length > 0 && (
          <section aria-labelledby="opinions" className="pt-24">
            <Reveal>
              <Chapter n="02" kicker="Opinions" id="opinions" title="Pick a topic" />
            </Reveal>
            <OpinionPicker opinions={publicOpinions} />
          </section>
        )}

        {football.moments.length > 0 && (
          <section aria-labelledby="moments" className="pt-24">
            <Reveal>
              <Chapter n="03" kicker="Moments" id="moments" title="Nights I still think about" />
            </Reveal>
            <ol className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
              {football.moments.map((m, i) => (
                <Reveal as="li" key={m.title} delay={i * 0.05} className="bg-paper p-7">
                  <p className="display text-6xl text-accent">{m.year}</p>
                  <p className="mt-4 text-xl font-medium">{m.title}</p>
                  <p className="mt-2 text-ink-2">{m.why}</p>
                </Reveal>
              ))}
            </ol>
          </section>
        )}

        {football.stadiumBucketList?.length ? (
          <p className="mt-16 text-ink-2">
            <span className="label mr-2">Stadium bucket list</span>
            {football.stadiumBucketList.join(", ")}
          </p>
        ) : null}
      </div>
    </>
  );
}
