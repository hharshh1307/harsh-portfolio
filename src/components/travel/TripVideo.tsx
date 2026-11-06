"use client";

import { useState } from "react";
import Image from "next/image";
import { Clapperboard, Play } from "lucide-react";
import { youtubeId, youtubeThumb } from "@/lib/youtube";

/**
 * Click-to-load YouTube: shows the thumbnail until someone presses play, so pages don't pay for
 * YouTube's player (and its cookies) unless the video is actually watched. Without a url it
 * renders a "still in the edit" placeholder.
 */
export function TripVideo({ url, by, place }: { url?: string; by?: string; place: string }) {
  const [playing, setPlaying] = useState(false);
  const id = url ? youtubeId(url) : null;

  if (!id) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rule bg-paper-2 p-6 text-center">
        <Clapperboard className="size-7 text-ink-3" aria-hidden />
        <p className="display text-2xl italic">The {place} video is still in the edit.</p>
        <p className="text-sm text-ink-2">Check back soon.</p>
      </div>
    );
  }

  return (
    <figure>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-[#111]">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={`${place} trip video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 size-full"
            aria-label={`Play the ${place} trip video`}
          >
            <Image src={youtubeThumb(id)} alt="" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover opacity-90 transition-opacity group-hover:opacity-100" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full bg-paper/95 text-ink shadow-xl transition-transform group-hover:scale-110">
                <Play className="ml-1 size-6 fill-current" aria-hidden />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 flex justify-between gap-4 text-sm text-ink-3">
        <span>{by ? `Shot and edited by ${by}` : "Trip video"}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-ink hover:underline">
          Watch on YouTube ↗
        </a>
      </figcaption>
    </figure>
  );
}
