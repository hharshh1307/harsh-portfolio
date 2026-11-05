import "server-only";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import land50 from "world-atlas/land-50m.json";

export type MapPoint = { x: number; y: number };

export type ProjectedMap = {
  width: number;
  height: number;
  land: string;
  project: (c: [number, number]) => MapPoint;
};

const topo = land50 as unknown as Topology<{ land: GeometryCollection }>;
const landFeature = feature(topo, topo.objects.land) as FeatureCollection<Polygon | MultiPolygon>;

/**
 * Builds a Mercator projection framed around the given points and the matching land outline,
 * clipped to the frame so only the visible coastline is serialised. Runs on the server; the
 * client only receives an SVG path string and pixel positions.
 */
export function projectMap(
  points: [number, number][],
  { width = 1000, height = 560, pad = 70, minSpanDeg = 10 } = {},
): ProjectedMap {
  const lons = points.map((p) => p[0]);
  const lats = points.map((p) => p[1]);
  let [minLon, maxLon, minLat, maxLat] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)];

  // Never zoom in tighter than minSpanDeg, so a single trip still shows its surroundings.
  const growTo = (lo: number, hi: number, span: number) => {
    const d = Math.max(0, span - (hi - lo)) / 2;
    return [lo - d, hi + d];
  };
  [minLon, maxLon] = growTo(minLon, maxLon, minSpanDeg);
  [minLat, maxLat] = growTo(minLat, maxLat, minSpanDeg * 0.55);

  const frame = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "MultiPoint" as const,
      coordinates: [
        [minLon, minLat],
        [maxLon, maxLat],
      ],
    },
  };

  const projection = geoMercator()
    .fitExtent(
      [
        [pad, pad],
        [width - pad, height - pad],
      ],
      frame,
    )
    .clipExtent([
      [-10, -10],
      [width + 10, height + 10],
    ]);

  const path = geoPath(projection).digits(1);
  const land = path(landFeature) ?? "";

  return {
    width,
    height,
    land,
    project: (c) => {
      const [x, y] = projection(c) ?? [0, 0];
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    },
  };
}
