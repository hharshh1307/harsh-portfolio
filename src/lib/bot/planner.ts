import "server-only";
import { generateObject, type ModelMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { contentFiles, contentKeys, type ContentKey } from "@/lib/content/schema";

export type ContentSnapshot = Record<ContentKey, string>; // raw JSON text per section

export type Plan =
  | { kind: "answer"; reply: string }
  | {
      kind: "edit";
      reply: string;
      title: string;
      files: { key: ContentKey; text: string }[];
      diff: string[];
    };

const planSchema = z.object({
  kind: z.enum(["edit", "answer"]).describe("edit = change site content; answer = just reply, no change"),
  reply: z.string().describe("Short message back to the owner (1-3 sentences). For edits, what you changed."),
  title: z.string().describe("Commit title, imperative, <= 60 chars, e.g. 'Add Coorg trip'. Empty for answers."),
  edits: z
    .array(
      z.object({
        section: z.enum(contentKeys as [ContentKey, ...ContentKey[]]),
        json: z.string().describe("The COMPLETE new JSON for this section file, not a fragment"),
      }),
    )
    .describe("Only sections that change. Empty for answers."),
});

function schemaHints(): string {
  return contentKeys
    .map((k) => {
      const js = z.toJSONSchema(contentFiles[k].schema, { io: "input", unrepresentable: "any" });
      return `## ${k} (${contentFiles[k].file})\n${JSON.stringify(js)}`;
    })
    .join("\n\n");
}

function system(today: string): string {
  return `You maintain the content of a personal website by editing JSON files. The site owner messages you from their phone.

Today is ${today}.

Rules:
- Make exactly the change the owner asks for. Preserve every other field and array item verbatim.
- Write in the owner's voice (first person), plain and specific. No marketing language, no emoji, no exclamation marks unless they used them.
- Never invent facts (dates, numbers, places, opinions). If a required detail is missing, set kind="answer" and ask for it in one short question.
- If the message is news (shipped something, a trip, a match, a new café), ALSO prepend an entry to now.updates with today's month (YYYY-MM) unless they gave a date. Keep now.updates to the 20 newest.
- Trips: slug is lowercase-hyphenated place name; coords are [longitude, latitude] of the place.
- If a photo was uploaded, use the given path exactly. Place it where the caption says. If unclear, put it in travel.unplacedPhotos. Write a factual alt text from what you see in the image.
- In profile.headline, wrapping one word in *asterisks* gives it a highlighter effect. Keep at most one.
- Image paths must point at files that exist: reuse existing paths or the uploaded photo's path. Never invent image paths.
- Questions about the content ("what's on my coffee page?") → kind="answer" using the current content.
- Output complete, valid JSON for each edited file, matching its schema.

Schemas:
${schemaHints()}`;
}

// --- Deterministic diff so the owner approves what actually changes, not the model's summary ---

function flatten(v: unknown, prefix = "", out: Map<string, string> = new Map()) {
  if (Array.isArray(v)) v.forEach((x, i) => flatten(x, `${prefix}[${i}]`, out));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) flatten(x, prefix ? `${prefix}.${k}` : k, out);
  else out.set(prefix, JSON.stringify(v));
  return out;
}

const clip = (s: string, n = 70) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function diffJson(section: string, before: unknown, after: unknown, max = 14): string[] {
  const a = flatten(before);
  const b = flatten(after);
  const lines: string[] = [];
  for (const [k, v] of b) {
    if (!a.has(k)) lines.push(`+ ${section}.${k}: ${clip(v)}`);
    else if (a.get(k) !== v) lines.push(`~ ${section}.${k}: ${clip(v)}`);
  }
  for (const k of a.keys()) if (!b.has(k)) lines.push(`− ${section}.${k}`);
  if (lines.length > max) return [...lines.slice(0, max), `… and ${lines.length - max} more`];
  return lines;
}

// --- Planning ---

export async function plan(opts: {
  message: string;
  snapshot: ContentSnapshot;
  photo?: { src: string; bytes: Uint8Array; mediaType: string };
}): Promise<Plan> {
  const today = new Date().toISOString().slice(0, 10);
  const current = contentKeys.map((k) => `<${k}>\n${opts.snapshot[k]}\n</${k}>`).join("\n");

  const userText =
    `Current content:\n${current}\n\n` +
    (opts.photo ? `A photo was uploaded and will be saved at "${opts.photo.src}".\n\n` : "") +
    `Owner's message:\n${opts.message || "(no text — photo only)"}`;

  const messages: ModelMessage[] = [
    {
      role: "user",
      content: opts.photo
        ? [
            { type: "text", text: userText },
            { type: "image", image: opts.photo.bytes, mediaType: opts.photo.mediaType },
          ]
        : userText,
    },
  ];

  const model = openai(process.env.BOT_MODEL ?? "gpt-4.1");

  for (let attempt = 0; attempt < 2; attempt++) {
    const { object } = await generateObject({
      model,
      schema: planSchema,
      system: system(today),
      messages,
      temperature: 0.2,
    });

    if (object.kind === "answer" || object.edits.length === 0) {
      return { kind: "answer", reply: object.reply };
    }

    const errors: string[] = [];
    const files: { key: ContentKey; text: string }[] = [];
    const diff: string[] = [];

    for (const edit of object.edits) {
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(edit.json);
      } catch {
        errors.push(`${edit.section}: not valid JSON`);
        continue;
      }
      const result = contentFiles[edit.section].schema.safeParse(parsedJson);
      if (!result.success) {
        errors.push(
          `${edit.section}: ` + result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        );
        continue;
      }
      const before = JSON.parse(opts.snapshot[edit.section]);
      const lines = diffJson(edit.section, before, parsedJson);
      if (!lines.length) continue;
      files.push({ key: edit.section, text: `${JSON.stringify(parsedJson, null, 2)}\n` });
      diff.push(...lines);
    }

    if (!errors.length) {
      if (!files.length) return { kind: "answer", reply: "Nothing to change. That's already on the site." };
      return { kind: "edit", reply: object.reply, title: object.title || "Update content", files, diff };
    }

    // One retry with the validation errors fed back.
    messages.push(
      { role: "assistant", content: JSON.stringify(object) },
      { role: "user", content: `Those edits failed validation:\n${errors.join("\n")}\nFix them and return the full plan again.` },
    );
  }

  return {
    kind: "answer",
    reply: "I couldn't produce a valid edit for that. Try rephrasing, or be more specific about which section.",
  };
}
