/**
 * Lists content that would make the site richer but hasn't been filled in yet.
 * Used by the dev-only <Missing> chips and the Telegram bot's /todo command.
 */
import type { SiteContent } from "./schema";

export type MissingItem = { section: string; field: string; hint: string };

export function findMissing(c: SiteContent): MissingItem[] {
  const m: MissingItem[] = [];
  const add = (section: string, field: string, hint: string) => m.push({ section, field, hint });

  c.travel.trips.forEach((t) => {
    if (!t.date) add("travel", `${t.slug}.date`, `When did you go to ${t.place}? (e.g. 2025-09)`);
    if (!t.summary) add("travel", `${t.slug}.summary`, `One or two lines about ${t.place}`);
  });
  if (c.travel.unplacedPhotos.length)
    add("travel", "unplacedPhotos", `${c.travel.unplacedPhotos.length} photo(s) not linked to a trip yet`);

  if (!c.football.since) add("football", "since", "How you got into football");

  const v = c.valorant;
  if (!v.rank) add("valorant", "rank", "Current rank");
  if (!v.role) add("valorant", "role", "Duelist / Initiator / Controller / Sentinel / Flex");
  if (!v.agents.length) add("valorant", "agents", "Your main agents");
  if (!v.favouriteMap) add("valorant", "favouriteMap", "Favourite map");
  if (!v.crosshairCode) add("valorant", "crosshairCode", "Crosshair code (visitors can copy it)");
  if (!v.note) add("valorant", "note", "A line about why you play");

  const k = c.coffee;
  if (!k.usualOrder) add("coffee", "usualOrder", "Your usual café order");
  if (!k.brewMethod) add("coffee", "brewMethod", "How you brew at home, if you do");
  if (!k.cafes.length) add("coffee", "cafes", "Favourite cafés in Bengaluru");
  if (!k.note) add("coffee", "note", "A line about your coffee habit");

  c.projects.featured.forEach((p) => {
    if (!p.story) add("projects", `${p.slug}.story`, `Why you built ${p.name} and what you learned`);
  });

  return m;
}
