"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NowPlaying as Track } from "@/lib/spotify";

const POLL_MS = 30_000;

/**
 * Live "now playing" card. The server passes the track it saw at render time so there's no
 * empty first paint; the client then refreshes every 30s while the tab is visible.
 */
export function NowPlaying({ initial, size = "md" }: { initial: Track | null; size?: "md" | "lg" }) {
  const [track, setTrack] = useState<Track | null>(initial);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/spotify/now-playing");
        if (!res.ok) return;
        const data = (await res.json()) as { configured: boolean; track?: Track | null };
        if (!cancelled && data.configured && data.track) setTrack(data.track);
      } catch {
        // Keep showing the last known track.
      }
    };
    refresh();
    const id = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  if (!track) return null;
  const art = size === "lg" ? 160 : 88;

  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-5"
      aria-label={`${track.isPlaying ? "Now playing" : "Last played"}: ${track.title} by ${track.artist} (opens Spotify)`}
    >
      {track.albumImageUrl && (
        <Image
          src={track.albumImageUrl}
          alt=""
          width={art}
          height={art}
          className="shrink-0 rounded-lg shadow-md transition-transform group-hover:-rotate-2"
          style={{ width: art, height: art }}
        />
      )}
      <div className="min-w-0">
        <p className="label flex items-center gap-2">
          {track.isPlaying ? (
            <>
              <span className="eq" aria-hidden>
                <span />
                <span />
                <span />
              </span>
              Now playing
            </>
          ) : (
            "Last played"
          )}
        </p>
        <p className={`display mt-1 truncate ${size === "lg" ? "text-4xl" : "text-2xl"} group-hover:underline underline-offset-4`}>
          {track.title}
        </p>
        <p className="truncate text-ink-2">{track.artist}</p>
      </div>
    </a>
  );
}
