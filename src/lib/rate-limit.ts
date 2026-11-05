/**
 * Best-effort in-memory sliding-window limiter. On serverless each warm instance keeps its own
 * window, so this stops casual abuse (a script hammering the chat) rather than a determined
 * attacker. Swap for Upstash Ratelimit if the OpenAI bill ever says otherwise.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  }
  return true;
}
