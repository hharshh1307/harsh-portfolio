import "server-only";
import path from "node:path";
import { imageSizeFromFile } from "image-size/fromFile";
import type { Photo } from "@/lib/content/schema";

export type SizedPhoto = Photo & { width: number; height: number };

/**
 * Reads real pixel dimensions for photos under /public at build time, so galleries reserve the
 * right space before images load (no layout jump). Falls back to 4:3 if a file can't be read.
 */
export async function withSizes(photos: Photo[]): Promise<SizedPhoto[]> {
  return Promise.all(
    photos.map(async (p) => {
      try {
        const s = await imageSizeFromFile(path.join(process.cwd(), "public", p.src));
        const rotated = s.orientation !== undefined && s.orientation >= 5;
        const width = (rotated ? s.height : s.width) ?? 1200;
        const height = (rotated ? s.width : s.height) ?? 900;
        return { ...p, width, height };
      } catch {
        return { ...p, width: 1200, height: 900 };
      }
    }),
  );
}
