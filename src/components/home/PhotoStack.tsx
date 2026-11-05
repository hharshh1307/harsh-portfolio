"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Photo } from "@/lib/content/schema";

type StackPhoto = Photo & { href: string; place: string };

const REST = [
  { rotate: -7, x: -26, y: 10 },
  { rotate: 5, x: 22, y: -6 },
  { rotate: -1, x: 0, y: 0 },
];
const FAN = [
  { rotate: -14, x: -120, y: 18 },
  { rotate: 12, x: 120, y: 10 },
  { rotate: -2, x: 0, y: -14 },
];

/**
 * A small pile of polaroids. Hover fans them out; each can be dragged and springs back;
 * clicking opens that trip. Keyboard users get a regular link per photo.
 */
export function PhotoStack({ photos }: { photos: StackPhoto[] }) {
  const [fanned, setFanned] = useState(false);
  const [dragging, setDragging] = useState(false);
  const router = useRouter();
  const items = photos.slice(0, 3);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[420px]"
      onMouseEnter={() => setFanned(true)}
      onMouseLeave={() => setFanned(false)}
    >
      {items.map((p, i) => {
        const pose = (fanned ? FAN : REST)[i] ?? REST[2];
        return (
          <motion.a
            key={p.src}
            href={p.href}
            onClick={(e) => {
              e.preventDefault();
              if (!dragging) router.push(p.href);
            }}
            onFocus={() => setFanned(true)}
            onBlur={() => setFanned(false)}
            aria-label={`${p.place}: ${p.alt}`}
            drag
            dragSnapToOrigin
            dragElastic={0.6}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setTimeout(() => setDragging(false), 50)}
            whileDrag={{ scale: 1.05, zIndex: 20, cursor: "grabbing" }}
            initial={REST[i] ?? REST[2]}
            animate={pose}
            transition={{ type: "spring", stiffness: 220, damping: 22, delay: fanned ? 0 : i * 0.08 }}
            className="absolute inset-x-[14%] top-[8%] block cursor-grab bg-[#fbf8f2] p-2.5 pb-10 shadow-[0_18px_40px_-18px_rgba(30,20,10,0.45)] ring-1 ring-black/5 sm:p-3 sm:pb-12"
            style={{ zIndex: i + 1 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-paper-3">
              <Image
                src={p.src}
                alt=""
                fill
                sizes="(max-width: 640px) 70vw, 320px"
                className="pointer-events-none object-cover"
                priority={i === items.length - 1}
                draggable={false}
              />
            </div>
            <span className="absolute inset-x-0 bottom-2.5 text-center font-display text-lg italic text-[#2a241d] sm:bottom-3.5">
              {p.place}
            </span>
          </motion.a>
        );
      })}
      <p className="label absolute -bottom-6 left-0 right-0 text-center normal-case tracking-normal" aria-hidden>
        drag them around ↻
      </p>
    </div>
  );
}
