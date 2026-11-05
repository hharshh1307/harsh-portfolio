"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { useChat } from "./ChatProvider";

/** A big inline question box that hands off to the chat drawer. */
export function AskInline({ placeholder, examples }: { placeholder: string; examples: string[] }) {
  const { open } = useChat();
  const [q, setQ] = useState("");

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) {
            open(q);
            setQ("");
          }
        }}
        className="flex items-center gap-2 rounded-full border border-rule bg-paper py-2 pl-5 pr-2 shadow-sm focus-within:border-ink-3"
      >
        <label htmlFor="ask-inline" className="sr-only">
          Ask a question
        </label>
        <input
          id="ask-inline"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
          className="min-w-0 flex-1 bg-transparent py-2 text-base placeholder:text-ink-3 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!q.trim()}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-paper transition-opacity disabled:opacity-30"
          aria-label="Ask"
        >
          <ArrowUp className="size-4" />
        </button>
      </form>
      <ul className="mt-4 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <li key={ex}>
            <button
              type="button"
              onClick={() => open(ex)}
              className="rounded-full border border-rule px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink hover:text-ink"
            >
              {ex}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
