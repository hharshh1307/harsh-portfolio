"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Photo } from "@/lib/content/schema";
import { formatMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

export type MapPin = {
  slug: string;
  place: string;
  x: number;
  y: number;
  date?: string;
  cover?: Photo;
};

export type TravelMapProps = {
  width: number;
  height: number;
  land: string;
  home?: { place: string; x: number; y: number };
  pins: MapPin[];
  active: string | null;
  onActive: (slug: string | null) => void;
  compact?: boolean;
};

function arc(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(80, len * 0.25);
  // Bend to the left of travel direction, so arcs fan out instead of overlapping.
  const cx = mx - (dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`;
}

export function TravelMap({ width, height, land, home, pins, active, onActive, compact }: TravelMapProps) {
  const activePin = pins.find((p) => p.slug === active);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 h-full w-full"
        role="group"
        aria-label="Map of places I've travelled to"
      >
        <defs>
          <pattern id="sea-lines" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--rule)" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#sea-lines)" opacity="0.55" />
        <path d={land} fill="var(--land)" stroke="var(--ink-3)" strokeWidth="0.8" strokeLinejoin="round" />

        {home &&
          pins.map((p) => (
            <path
              key={`arc-${p.slug}`}
              d={arc(home, p)}
              fill="none"
              stroke={active === p.slug ? "var(--accent)" : "var(--ink-3)"}
              strokeWidth={active === p.slug ? 1.8 : 1}
              strokeDasharray="4 5"
              className="transition-[stroke] duration-300"
            />
          ))}

        {home && (
          <g transform={`translate(${home.x},${home.y})`} aria-label={`Home: ${home.place}`}>
            <rect x="-5" y="-5" width="10" height="10" fill="var(--ink)" transform="rotate(45)" />
            {!compact && (
              <text x="12" y="4" className="fill-ink font-mono text-[13px]">
                {home.place} · home
              </text>
            )}
          </g>
        )}

        {pins.map((p) => {
          const isActive = active === p.slug;
          return (
            <Link
              key={p.slug}
              href={`/travel/${p.slug}`}
              onMouseEnter={() => onActive(p.slug)}
              onMouseLeave={() => onActive(null)}
              onFocus={() => onActive(p.slug)}
              onBlur={() => onActive(null)}
              aria-label={`${p.place}${p.date ? `, ${formatMonth(p.date)}` : ""}`}
              className="cursor-pointer outline-none"
            >
              <g transform={`translate(${p.x},${p.y})`}>
                <circle r="22" fill="transparent" />
                <motion.circle
                  r={isActive ? 14 : 0}
                  fill="var(--accent)"
                  opacity={0.18}
                  animate={{ r: isActive ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                <circle r={isActive ? 7 : 5.5} fill="var(--accent)" stroke="var(--paper)" strokeWidth="2" />
                {!compact && (
                  <text
                    x={p.x > width * 0.8 ? -12 : 12}
                    y="5"
                    textAnchor={p.x > width * 0.8 ? "end" : "start"}
                    className={cn(
                      "font-display text-[17px] italic transition-colors",
                      isActive ? "fill-accent" : "fill-ink",
                    )}
                    style={{ paintOrder: "stroke", stroke: "var(--paper)", strokeWidth: 4 }}
                  >
                    {p.place}
                  </text>
                )}
              </g>
            </Link>
          );
        })}
      </svg>

      <AnimatePresence>
        {activePin?.cover && (
          <div
            key={activePin.slug}
            className="pointer-events-none absolute z-10"
            style={{
              left: `${(activePin.x / width) * 100}%`,
              top: `${(activePin.y / height) * 100}%`,
              transform: `translate(-50%, ${activePin.y / height > 0.5 ? "calc(-100% - 22px)" : "22px"})`,
            }}
            aria-hidden
          >
            <motion.div
              initial={{ opacity: 0, y: 8, rotate: -2 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
              className="w-36 bg-paper p-1.5 pb-2 shadow-xl ring-1 ring-rule sm:w-44"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-paper-3">
                <Image src={activePin.cover.src} alt="" fill sizes="180px" className="object-cover" />
              </div>
              <p className="display mt-1.5 text-center text-sm italic">{activePin.place}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
