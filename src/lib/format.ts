const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2025-09" → "Sep 2025", "2025" → "2025", "2025-09-12" → "12 Sep 2025". */
export function formatMonth(d: string): string {
  const [y, m, day] = d.split("-");
  if (!m) return y;
  const mon = MONTHS[Number(m) - 1] ?? m;
  return day ? `${Number(day)} ${mon} ${y}` : `${mon} ${y}`;
}

export function formatRange(start: string, end: string | null): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : "now"}`;
}

/** Whole-ish years between two YYYY-MM dates (end null = today), e.g. "2 yrs 3 mos". */
export function duration(start: string, end: string | null): string {
  const [sy, sm] = start.split("-").map(Number);
  const e = end ? end.split("-").map(Number) : [new Date().getFullYear(), new Date().getMonth() + 1];
  const months = (e[0] - sy) * 12 + ((e[1] ?? 1) - (sm ?? 1)) + 1;
  const y = Math.floor(months / 12);
  const mo = months % 12;
  return [y ? `${y} yr${y > 1 ? "s" : ""}` : "", mo ? `${mo} mo${mo > 1 ? "s" : ""}` : ""].filter(Boolean).join(" ");
}

export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  if (s < 86400 * 365) return `${Math.round(s / (86400 * 30))}mo ago`;
  return `${Math.round(s / (86400 * 365))}y ago`;
}
