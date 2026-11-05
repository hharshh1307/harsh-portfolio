import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Numbered chapter heading used on the home page and section pages. */
export function Chapter({
  n,
  title,
  kicker,
  href,
  hrefLabel = "More",
  className,
  id,
}: {
  n?: string;
  title: React.ReactNode;
  kicker?: string;
  href?: string;
  hrefLabel?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-6 border-b border-rule pb-4", className)}>
      <div>
        <p className="label mb-2">
          {n && <span className="text-accent">{n} </span>}
          {kicker}
        </p>
        <h2 id={id} className="display text-3xl leading-none sm:text-4xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm text-ink-2 hover:text-ink"
        >
          {hrefLabel}
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-20">
      <p className="label mb-4">{kicker}</p>
      <h1 className="display max-w-4xl text-5xl leading-[0.95] sm:text-7xl">{title}</h1>
      {children && <div className="mt-6 max-w-2xl text-lg text-ink-2">{children}</div>}
    </header>
  );
}
