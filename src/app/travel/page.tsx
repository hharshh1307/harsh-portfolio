import type { Metadata } from "next";
import { travel } from "@/lib/content";
import { buildTravelMap } from "@/lib/travel-map";
import { PageIntro } from "@/components/ui/Chapter";
import { TravelExplorer } from "@/components/travel/TravelExplorer";

export const metadata: Metadata = {
  title: "Travel",
  description: "Trips, photos and notes from the road.",
};

export default function TravelPage() {
  const map = buildTravelMap({ width: 1100, height: 600 });
  const photoCount = travel.trips.reduce((n, t) => n + t.photos.length, 0);

  return (
    <>
      <PageIntro kicker="Travel" title={<>Places I&apos;ve been, and the photos to prove it.</>}>
        <p>
          {travel.trips.length} trips, {photoCount} photos. Hover a pin or a card; they&apos;re linked.
        </p>
      </PageIntro>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <TravelExplorer
          trips={travel.trips}
          width={map.width}
          height={map.height}
          land={map.land}
          home={map.home}
          pins={map.pins}
        />

        {travel.wishlist.length > 0 && (
          <section aria-labelledby="wishlist" className="mt-24 border-t border-rule pt-10">
            <h2 id="wishlist" className="label mb-6">
              On the list
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {travel.wishlist.map((w) => (
                <li key={w.place}>
                  <p className="display text-3xl italic">{w.place}</p>
                  {w.why && <p className="mt-1 text-ink-2">{w.why}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
