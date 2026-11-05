import { cn } from "@/lib/utils";

/**
 * Fades content up as it scrolls into view, in pure CSS (scroll-driven animations).
 * Content is fully visible without JavaScript and in browsers without support; it never
 * waits for hydration to appear. Respects reduced motion via globals.css.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Comp = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  return (
    <Comp className={cn("reveal", className)} style={delay ? ({ "--reveal-shift": `${Math.round(delay * 100)}%` } as React.CSSProperties) : undefined}>
      {children}
    </Comp>
  );
}
