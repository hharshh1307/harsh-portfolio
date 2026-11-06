import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clapperboard, Play } from "lucide-react";
import { travel } from "@/lib/content";
import { withSizes } from "@/lib/images";
import { formatMonth } from "@/lib/format";
import { Gallery } from "@/components/travel/Gallery";
import { Missing } from "@/components/ui/Missing";
import { Reveal } from "@/components/ui/Reveal";
import { AskButton } from "@/components/chat/AskButton";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return travel.trips.map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const trip = travel.trips.find((t) => t.slug === slug);
  if (!trip) return {};
  return {
    title: `${trip.place}, ${trip.country}`,
    description: trip.summary ?? `Photos from ${trip.place}.`,
    openGraph: trip.photos[0] ? { images: [trip.photos[0].src] } : undefined,
  };
}

export default async function TripPage({ params }: Params) {
  const { slug } = await params;
  const i = travel.trips.findIndex((t) => t.slug === slug);
  if (i < 0) notFound();
  const trip = travel.trips[i];
  const prev = travel.trips[(i - 1 + travel.trips.length) % travel.trips.length];
  const next = travel.trips[(i + 1) % travel.trips.length];
  const [cover, ...rest] = await withSizes(trip.photos);

  return (
    <article>
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <Link href="/travel" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> All trips
        </Link>
      </div>

      <header className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-8 sm:px-6 md:grid-cols-[1fr_1.1fr] md:items-end">
        <div>
          <p className="label mb-4">
            {trip.country}
            {trip.date && ` · ${formatMonth(trip.date)}`}
          </p>
          <h1 className="display text-6xl italic leading-none sm:text-8xl">{trip.place}</h1>
          {trip.summary ? (
            <p className="mt-6 max-w-md text-xl leading-relaxed text-ink-2">{trip.summary}</p>
          ) : (
            <p className="mt-6">
              <Missing what={`travel.${trip.slug}.summary`} />
            </p>
          )}
          {trip.video &&
            (trip.video.url ? (
              <p className="mt-6">
                <a
                  href={trip.video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-sm transition-colors hover:border-ink"
                >
                  <Play className="size-3.5 fill-current" aria-hidden />
                  Watch the trip video
                  <span className="text-ink-3 group-hover:text-ink-2">on YouTube ↗</span>
                </a>
                {trip.video.by && <span className="mt-2 block text-sm text-ink-3">Shot and edited by {trip.video.by}</span>}
              </p>
            ) : (
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink-3">
                <Clapperboard className="size-4" aria-hidden /> Trip video is still in the edit.
              </p>
            ))}
          {!trip.date && (
            <p className="mt-2">
              <Missing what={`travel.${trip.slug}.date`} />
            </p>
          )}
        </div>
        {cover && (
          <Reveal>
            <figure className="relative overflow-hidden rounded-2xl bg-paper-3">
              <Image
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                sizes="(max-width: 768px) 100vw, 55vw"
                priority
                className="max-h-[70vh] w-full object-cover"
              />
              {cover.caption && (
                <figcaption className="absolute bottom-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-xs text-ink backdrop-blur">
                  {cover.caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        )}
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {(trip.story?.length || trip.highlights?.length) && (
          <div className="grid gap-12 border-t border-rule py-12 md:grid-cols-[1.5fr_1fr]">
            {trip.story?.length ? (
              <div className="prose-journal max-w-2xl text-lg leading-relaxed">
                {trip.story.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ) : (
              <div />
            )}
            {trip.highlights?.length ? (
              <aside>
                <p className="label mb-4">Don&apos;t miss</p>
                <ul className="space-y-3">
                  {trip.highlights.map((h) => (
                    <li key={h} className="flex gap-3">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </div>
        )}

        {rest.length > 0 && (
          <section aria-label="Photos" className="border-t border-rule pt-12">
            <Gallery photos={rest} />
          </section>
        )}

        <div className="mt-12">
          <AskButton question={`Tell me about your trip to ${trip.place}.`}>Ask about {trip.place}</AskButton>
        </div>

        {travel.trips.length > 1 && (
          <nav aria-label="More trips" className="mt-20 grid grid-cols-2 gap-6 border-t border-rule pt-8">
            <Link href={`/travel/${prev.slug}`} className="group">
              <span className="label inline-flex items-center gap-1">
                <ArrowLeft className="size-3" aria-hidden /> Previous
              </span>
              <span className="display mt-1 block text-3xl italic group-hover:text-accent">{prev.place}</span>
            </Link>
            <Link href={`/travel/${next.slug}`} className="group text-right">
              <span className="label inline-flex items-center gap-1">
                Next <ArrowRight className="size-3" aria-hidden />
              </span>
              <span className="display mt-1 block text-3xl italic group-hover:text-accent">{next.place}</span>
            </Link>
          </nav>
        )}
      </div>
    </article>
  );
}
