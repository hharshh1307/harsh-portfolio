/**
 * Content schemas — the single source of truth for everything personal on the site.
 *
 * Every file in /content is validated against these at build time (src/lib/content/index.ts)
 * and by the Telegram bot before it proposes a change, so a bad edit can never ship.
 *
 * Convention: optional fields that are missing simply don't render in production.
 * In development a small "missing" chip shows where content is still needed.
 */
import { z } from "zod";

const coords = z
  .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)])
  .describe("[longitude, latitude]");

const isoDate = z
  .string()
  .regex(/^\d{4}(-\d{2}){0,2}$/, "Use YYYY, YYYY-MM or YYYY-MM-DD");

const photo = z.object({
  src: z.string().min(1).describe("Path under /public, e.g. /images/travel/goa-1.jpg"),
  alt: z.string().min(1).describe("What the photo shows, for screen readers"),
  caption: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  headline: z.string().describe("One line shown big on the home page"),
  location: z.string(),
  currentRole: z.string(),
  currentCompany: z.string(),
  summary: z.string().describe("One or two plain sentences under the home headline"),
  focusAreas: z.array(z.string()).min(1).describe("What you work on, as short keywords"),
  intro: z.array(z.string()).min(1).describe("Short paragraphs about you, first person"),
  links: z.object({
    github: z.url(),
    linkedin: z.url(),
    twitter: z.url().optional(),
    email: z.email().optional(),
  }),
  githubUsername: z.string(),
  portrait: photo.optional(),
});

export const nowSchema = z.object({
  status: z.string().optional().describe("What you're focused on right now, one sentence"),
  updates: z
    .array(
      z.object({
        date: isoDate,
        text: z.string().min(1),
        tag: z.enum(["work", "project", "travel", "football", "valorant", "coffee", "life"]),
        link: z.string().optional(),
      }),
    )
    .describe("Newest first. The bot prepends here for quick updates."),
});

const workProject = z.object({
  name: z.string(),
  description: z.string(),
  impact: z.string().optional(),
  stack: z.array(z.string()).optional(),
});

export const workSchema = z.object({
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      location: z.string(),
      start: isoDate,
      end: isoDate.nullable().describe("null = current role"),
      summary: z.string(),
      projects: z.array(workProject),
    }),
  ),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()).min(1) })),
});

export const projectsSchema = z.object({
  featured: z.array(
    z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      name: z.string(),
      repo: z.string().optional().describe("GitHub repo name; enables live stars/commit data"),
      tagline: z.string(),
      story: z.string().optional().describe("Why you built it and what you learned"),
      stack: z.array(z.string()),
      liveUrl: z.url().optional(),
      year: z.number().int().optional(),
    }),
  ),
  hiddenRepos: z.array(z.string()).describe("Repos never shown in the live GitHub list"),
});

export const travelSchema = z.object({
  home: z.object({ place: z.string(), coords }).optional().describe("Where trips start from on the map"),
  trips: z.array(
    z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      place: z.string(),
      country: z.string(),
      coords,
      date: isoDate.optional(),
      summary: z.string().optional().describe("One or two sentences"),
      story: z.array(z.string()).optional().describe("Longer write-up paragraphs"),
      highlights: z.array(z.string()).optional(),
      photos: z.array(photo),
    }),
  ),
  wishlist: z.array(z.object({ place: z.string(), coords, why: z.string().optional() })),
  unplacedPhotos: z
    .array(photo)
    .describe("Photos not yet assigned to a trip; not shown publicly"),
});

export const footballSchema = z.object({
  club: z.string(),
  idol: z.string(),
  since: z.string().optional().describe("When/how you started following the club"),
  takes: z.array(z.object({ take: z.string(), spicy: z.boolean().default(false) })),
  opinions: z
    .array(z.object({ topic: z.string(), opinion: z.string() }))
    .describe("Longer opinions the chat agent can quote"),
  moments: z.array(z.object({ year: z.number().int(), title: z.string(), why: z.string() })),
  stadiumBucketList: z.array(z.string()).optional(),
  photo: photo.optional(),
});

export const valorantSchema = z.object({
  rank: z.string().optional(),
  peakRank: z.string().optional(),
  role: z.enum(["Duelist", "Initiator", "Controller", "Sentinel", "Flex"]).optional(),
  agents: z.array(z.object({ name: z.string(), note: z.string().optional() })),
  favouriteMap: z.string().optional(),
  leastFavouriteMap: z.string().optional(),
  crosshairCode: z.string().optional(),
  sensitivity: z.string().optional().describe("e.g. 0.35 @ 800 DPI"),
  playsWith: z.string().optional(),
  note: z.string().optional().describe("A line in your own voice about the game"),
});

export const coffeeSchema = z.object({
  usualOrder: z.string().optional(),
  homeSetup: z.array(z.string()).optional().describe("Grinder, brewer, etc."),
  brewMethod: z.string().optional(),
  ratio: z
    .object({ coffeeGrams: z.number().positive(), waterGrams: z.number().positive() })
    .optional(),
  beans: z.array(z.object({ name: z.string(), roaster: z.string().optional(), note: z.string().optional() })),
  cafes: z.array(
    z.object({
      name: z.string(),
      area: z.string(),
      order: z.string().optional(),
      note: z.string().optional(),
    }),
  ),
  cupsPerDay: z.number().optional(),
  note: z.string().optional(),
});

/** Registry used by the loader, the agent prompt and the Telegram bot. */
export const contentFiles = {
  profile: { file: "content/profile.json", schema: profileSchema },
  now: { file: "content/now.json", schema: nowSchema },
  work: { file: "content/work.json", schema: workSchema },
  projects: { file: "content/projects.json", schema: projectsSchema },
  travel: { file: "content/travel.json", schema: travelSchema },
  football: { file: "content/football.json", schema: footballSchema },
  valorant: { file: "content/valorant.json", schema: valorantSchema },
  coffee: { file: "content/coffee.json", schema: coffeeSchema },
} as const;

export type ContentKey = keyof typeof contentFiles;
export const contentKeys = Object.keys(contentFiles) as ContentKey[];

export type Profile = z.infer<typeof profileSchema>;
export type Now = z.infer<typeof nowSchema>;
export type Work = z.infer<typeof workSchema>;
export type Projects = z.infer<typeof projectsSchema>;
export type Travel = z.infer<typeof travelSchema>;
export type Trip = Travel["trips"][number];
export type Photo = z.infer<typeof photo>;
export type Football = z.infer<typeof footballSchema>;
export type Valorant = z.infer<typeof valorantSchema>;
export type Coffee = z.infer<typeof coffeeSchema>;

export type SiteContent = {
  profile: Profile;
  now: Now;
  work: Work;
  projects: Projects;
  travel: Travel;
  football: Football;
  valorant: Valorant;
  coffee: Coffee;
};
