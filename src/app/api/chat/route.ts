import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, safeValidateUIMessages, stepCountIs, streamText, type UIMessage } from "ai";
import { buildSystemPrompt } from "@/lib/agent/prompt";
import { agentTools } from "@/lib/agent/tools";
import { rateLimit } from "@/lib/rate-limit";

export const maxDuration = 30;

const MAX_MESSAGES = 30;
const MAX_CHARS_PER_MESSAGE = 2000;

function textLength(m: UIMessage): number {
  return m.parts.reduce((n, p) => n + (p.type === "text" ? p.text.length : 0), 0);
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: "Chat is not configured." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`chat:${ip}`, { limit: 20, windowMs: 60_000 })) {
    return Response.json({ error: "Too many messages. Try again in a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = await safeValidateUIMessages({
    messages: (body as { messages?: unknown })?.messages,
  });
  if (!parsed.success) {
    return Response.json({ error: "Invalid messages." }, { status: 400 });
  }

  // Keep the most recent turns; cap each user message so nobody can stuff the context.
  const messages = parsed.data.slice(-MAX_MESSAGES);
  const last = messages.at(-1);
  if (!last || last.role !== "user") {
    return Response.json({ error: "Last message must be from the user." }, { status: 400 });
  }
  if (messages.some((m) => m.role === "user" && textLength(m) > MAX_CHARS_PER_MESSAGE)) {
    return Response.json({ error: "Message too long." }, { status: 413 });
  }

  const result = streamText({
    model: openai(process.env.CHAT_MODEL ?? "gpt-4.1-mini"),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages, { tools: agentTools }),
    tools: agentTools,
    stopWhen: stepCountIs(4),
    temperature: 0.6,
    maxOutputTokens: 600,
    onError: ({ error }) => console.error("chat stream error", error),
  });

  return result.toUIMessageStreamResponse({
    onError: () => "Something went wrong on my side. Try again?",
  });
}
