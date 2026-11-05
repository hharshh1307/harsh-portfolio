import "server-only";
import { travel } from "@/lib/content";
import { projectMap } from "@/lib/map";
import type { MapPin } from "@/components/travel/TravelMap";

/** Projects every trip (plus home) into one map. Shared by the home page and /travel. */
export function buildTravelMap(opts?: { width?: number; height?: number }) {
  const points = travel.trips.map((t) => t.coords);
  if (travel.home) points.push(travel.home.coords);
  const map = projectMap(points.length ? points : [[77.59, 12.97]], opts);

  const pins: MapPin[] = travel.trips.map((t) => ({
    slug: t.slug,
    place: t.place,
    date: t.date,
    cover: t.photos[0],
    ...map.project(t.coords),
  }));
  const home = travel.home ? { place: travel.home.place, ...map.project(travel.home.coords) } : undefined;

  return { width: map.width, height: map.height, land: map.land, pins, home };
}
