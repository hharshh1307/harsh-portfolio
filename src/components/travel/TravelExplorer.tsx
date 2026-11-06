"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Trip } from "@/lib/content/schema";
import { formatMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TravelMap, type TravelMapProps } from "./TravelMap";

type Props = Omit<TravelMapProps, "active" | "onActive"> & {
  trips: Pick<Trip, "slug" | "place" | "country" | "date" | "summary" | "photos" | "video">[];
  variant?: "full" | "compact";
};

/** Map and trip list that highlight each other on hover/focus. */
export function TravelExplorer({ trips, variant = "full", ...map }: Props) {
  const [active, setActive] = useState<string | null>(null);

  if (variant === "compact") {
    return (
      <div className="grid items-center gap-8 md:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-rule bg-paper-2">
          <TravelMap {...map} active={active} onActive={setActive} />
        </div>
        <ol className="space-y-1">
          {trips.map((t, i) => (
            <li key={t.slug}>
              <Link
                href={`/travel/${t.slug}`}
                onMouseEnter={() => setActive(t.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(t.slug)}
                onBlur={() => setActive(null)}
                className={cn(
                  "flex items-baseline justify-between gap-4 border-b border-rule py-3 transition-colors",
                  active === t.slug ? "text-accent" : "text-ink",
                )}
              >
                <span className="display text-2xl italic">
                  <span className="label mr-3 not-italic">{String(i + 1).padStart(2, "0")}</span>
                  {t.place}
                </span>
                <span className="font-mono text-xs text-ink-3">{t.date ? formatMonth(t.date) : t.country}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-rule bg-paper-2">
        <TravelMap {...map} active={active} onActive={setActive} />
      </div>
      <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((t, i) => {
          const cover = t.photos[0];
          const badge = [
            t.photos.length ? `${t.photos.length} photo${t.photos.length === 1 ? "" : "s"}` : null,
            t.video ? (t.video.url ? "▶ video" : "video soon") : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <li
              key={t.slug}
              className="reveal"
              style={{ ["--reveal-shift" as string]: `${(i % 3) * 6}%` }}
            >
              <Link
                href={`/travel/${t.slug}`}
                onMouseEnter={() => setActive(t.slug)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(t.slug)}
                onBlur={() => setActive(null)}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-paper-3">
                  {cover && (
                    <Image
                      src={cover.src}
                      alt={cover.alt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                  {badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 font-mono text-[11px] text-ink backdrop-blur">
                      {badge}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <h3
                    className={cn(
                      "display text-3xl italic transition-colors",
                      active === t.slug ? "text-accent" : "group-hover:text-accent",
                    )}
                  >
                    {t.place}
                  </h3>
                  <span className="font-mono text-xs text-ink-3">
                    {t.date ? formatMonth(t.date) : t.country}
                  </span>
                </div>
                {t.summary && <p className="mt-2 text-ink-2">{t.summary}</p>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
