/**
 * Loads and validates every content file. Imported JSON is bundled at build time, so
 * a content change ships with the next deploy (which the Telegram bot triggers by committing).
 * Validation failures throw during `next build`, so invalid content never reaches production.
 */
import profileJson from "../../../content/profile.json";
import nowJson from "../../../content/now.json";
import workJson from "../../../content/work.json";
import projectsJson from "../../../content/projects.json";
import travelJson from "../../../content/travel.json";
import footballJson from "../../../content/football.json";
import valorantJson from "../../../content/valorant.json";
import coffeeJson from "../../../content/coffee.json";
import { contentFiles, type ContentKey, type SiteContent } from "./schema";

const raw: Record<ContentKey, unknown> = {
  profile: profileJson,
  now: nowJson,
  work: workJson,
  projects: projectsJson,
  travel: travelJson,
  football: footballJson,
  valorant: valorantJson,
  coffee: coffeeJson,
};

function load(): SiteContent {
  const out = {} as Record<ContentKey, unknown>;
  const errors: string[] = [];
  for (const key of Object.keys(contentFiles) as ContentKey[]) {
    const result = contentFiles[key].schema.safeParse(raw[key]);
    if (result.success) out[key] = result.data;
    else
      errors.push(
        `${contentFiles[key].file}:\n` +
          result.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n"),
      );
  }
  if (errors.length) throw new Error(`Invalid content:\n${errors.join("\n")}`);
  return out as SiteContent;
}

export const content: SiteContent = load();

export const { profile, now, work, projects, travel, football, valorant, coffee } = content;

export * from "./schema";
