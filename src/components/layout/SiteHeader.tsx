"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, X } from "lucide-react";
import { navLinks } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { useChat } from "@/components/chat/ChatProvider";

export function SiteHeader() {
  const pathname = usePathname();
  // The menu is open only on the route it was opened on, so any navigation closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((typeof v === "function" ? v(open) : v) ? pathname : null);
  const [scrolled, setScrolled] = useState(false);
  const chat = useChat();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-b border-rule bg-paper/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="display text-xl font-medium italic tracking-tight" aria-label="Home">
          Harsh Agarwal
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-sm transition-colors",
                    isActive(l.href) ? "text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {isActive(l.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-paper-3"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => chat.open()}
            className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm text-paper transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            <MessageCircle className="size-4" aria-hidden />
            Ask my AI
          </button>
          <ThemeToggle />
          <button
            type="button"
            className="rounded-full p-2 text-ink-2 hover:bg-paper-3 hover:text-ink lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Main"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <ul className="mx-auto max-w-6xl px-4 pb-6 pt-2 sm:px-6">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                >
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="display flex items-baseline justify-between border-b border-rule py-3 text-2xl"
                  >
                    {l.name}
                    <span className="label">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
              <li className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    chat.open();
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-paper"
                >
                  <MessageCircle className="size-4" aria-hidden /> Ask my AI
                </button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
