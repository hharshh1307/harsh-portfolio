"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useChat } from "./ChatProvider";
import { ChatPanel } from "./ChatPanel";

export function ChatDrawer() {
  const { isOpen, close } = useChat();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // The /ask page renders the full chat; the drawer would duplicate it.
  const onAskPage = pathname === "/ask";

  useEffect(() => {
    if (!isOpen) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (onAskPage && isOpen) close();
  }, [onAskPage, isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && !onAskPage && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Chat with Harsh's AI"
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col border-l border-rule bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="flex items-center justify-between border-b border-rule px-5 py-4">
              <div>
                <p className="display text-xl">Ask my AI</p>
                <p className="text-xs text-ink-3">Trained on my notes on this site. It can be wrong.</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 text-ink-2 hover:bg-paper-3 hover:text-ink"
                aria-label="Close chat"
              >
                <X className="size-5" />
              </button>
            </div>
            <ChatPanel autoFocus />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
