"use client";

import { MessageCircle } from "lucide-react";
import { useChat } from "./ChatProvider";
import { cn } from "@/lib/utils";

/** Opens the chat drawer and immediately asks a question about whatever the visitor is looking at. */
export function AskButton({
  question,
  children,
  className,
  variant = "ghost",
}: {
  question?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "ghost" | "solid";
}) {
  const { open } = useChat();
  return (
    <button
      type="button"
      onClick={() => open(question)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full text-sm transition-all",
        variant === "solid"
          ? "bg-ink px-5 py-2.5 text-paper hover:-translate-y-0.5"
          : "border border-rule px-4 py-2 text-ink-2 hover:border-ink hover:text-ink",
        className,
      )}
    >
      <MessageCircle className="size-4" aria-hidden />
      {children}
    </button>
  );
}
