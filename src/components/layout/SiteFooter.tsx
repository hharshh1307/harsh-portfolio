import Link from "next/link";
import { profile, now } from "@/lib/content";
import { navLinks } from "@/lib/nav";
import { formatMonth } from "@/lib/format";

export function SiteFooter() {
  const lastUpdate = now.updates[0]?.date;
  const socials = [
    { label: "GitHub", href: profile.links.github },
    { label: "LinkedIn", href: profile.links.linkedin },
    ...(profile.links.twitter ? [{ label: "X / Twitter", href: profile.links.twitter }] : []),
    ...(profile.links.email ? [{ label: "Email", href: `mailto:${profile.links.email}` }] : []),
  ];

  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display text-3xl leading-tight sm:text-4xl">
            Say <span className="italic">hi.</span>
          </p>
          <p className="mt-4 max-w-sm text-ink-2">
            Easiest on LinkedIn. Or ask the AI on this site. It knows what I&apos;ve written here and nothing else.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="label mb-3">Pages</p>
          <ul className="space-y-1.5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link className="link" href={l.href}>
                  {l.name}
                </Link>
              </li>
            ))}
            <li>
              <Link className="link" href="/ask">
                Ask
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="label mb-3">Elsewhere</p>
          <ul className="space-y-1.5">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  className="link"
                  href={s.href}
                  {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-rule px-4 py-6 text-sm text-ink-3 sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        {lastUpdate && <p className="font-mono text-xs">Last updated {formatMonth(lastUpdate)}, from my phone</p>}
      </div>
    </footer>
  );
}
