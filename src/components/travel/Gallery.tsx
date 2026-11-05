"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Photo } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

type SizedPhoto = Photo & { width: number; height: number };

/** Photo grid with a keyboard- and swipe-friendly lightbox. */
export function Gallery({ photos }: { photos: SizedPhoto[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setIndex(null);
    triggerRef.current?.focus();
  }, []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (index === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, close, step]);

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {photos.map((p, i) => (
          <li key={p.src} className="break-inside-avoid">
            <figure>
              <button
                type="button"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setIndex(i);
                }}
                className="group relative block w-full overflow-hidden rounded-xl bg-paper-3"
                aria-label={`Open photo: ${p.alt}`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={p.width}
                  height={p.height}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </button>
              {p.caption && <figcaption className="mt-2 text-sm text-ink-3">{p.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {current && index !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            className="fixed inset-0 z-[70] flex flex-col bg-[#0e0c0a]/95 text-[#efe8da]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between p-4">
              <span className="font-mono text-xs">
                {index + 1} / {photos.length}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="rounded-full p-2 hover:bg-white/10"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative flex-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={current.src}
                  className="absolute inset-0 px-4"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  drag={photos.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) step(1);
                    else if (info.offset.x > 80) step(-1);
                  }}
                >
                  <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20 sm:block"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 hover:bg-white/20 sm:block"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>
            <p className={cn("p-4 text-center text-sm text-[#b9b0a2]", !current.caption && "sr-only")}>
              {current.caption ?? current.alt}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
