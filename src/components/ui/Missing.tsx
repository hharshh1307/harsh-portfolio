/**
 * Dev-only marker for content that hasn't been written yet. Renders nothing in production,
 * so a half-filled section just looks shorter instead of showing placeholders.
 */
export function Missing({ what }: { what: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded border border-dashed border-accent/60 px-1.5 py-0.5 font-mono text-[11px] text-accent">
      missing: {what}
    </span>
  );
}
