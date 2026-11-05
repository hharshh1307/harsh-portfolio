"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getToolName, isToolUIPart, type UIMessage } from "ai";
import { ArrowUp, RotateCcw, Square } from "lucide-react";
import { useChat } from "./ChatProvider";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What did you build at Zomato?",
  "What are you coding these days?",
  "Best Barça match you've watched?",
  "Where have you travelled?",
];

const TOOL_LABELS: Record<string, [busy: string, done: string]> = {
  getGitHubActivity: ["Checking GitHub…", "looked at GitHub"],
  getNowPlaying: ["Checking Spotify…", "checked Spotify"],
  searchWeb: ["Searching the web…", "searched the web"],
};

function Markdown({ text }: { text: string }) {
  return (
    <div className="prose-journal">
      <ReactMarkdown
        components={{
          a: ({ href = "", children }) =>
            href.startsWith("/") ? (
              <Link href={href}>{children}</Link>
            ) : (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
          // Keep the model from emitting big headings in a chat bubble.
          h1: ({ children }) => <p className="font-semibold">{children}</p>,
          h2: ({ children }) => <p className="font-semibold">{children}</p>,
          h3: ({ children }) => <p className="font-semibold">{children}</p>,
          img: () => null,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

function MessageView({ m }: { m: UIMessage }) {
  if (m.role === "user") {
    const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-paper">{text}</p>
      </div>
    );
  }
  return (
    <div className="max-w-[92%] space-y-2 text-[15px] leading-relaxed">
      {m.parts.map((p, i) => {
        if (p.type === "text") return p.text ? <Markdown key={i} text={p.text} /> : null;
        if (isToolUIPart(p)) {
          const name = getToolName(p);
          const [busy, done] = TOOL_LABELS[name] ?? ["Looking that up…", "looked it up"];
          const finished = p.state === "output-available" || p.state === "output-error";
          return (
            <p key={i} className="label flex items-center gap-2 normal-case tracking-normal">
              <span className={cn("size-1.5 rounded-full", finished ? "bg-ink-3" : "animate-pulse bg-accent")} />
              {finished ? done : busy}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

export function ChatPanel({ autoFocus = false, className }: { autoFocus?: boolean; className?: string }) {
  const { chat, ask } = useChat();
  const { messages, status, error, stop, regenerate, setMessages } = chat;
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = (text: string) => {
    if (!text.trim() || busy) return;
    ask(text);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "";
  };

  const errorText = (() => {
    if (!error) return null;
    const msg = error.message ?? "";
    if (msg.includes("Too many")) return "You're sending messages fast. Give it a minute.";
    if (msg.includes("not configured")) return "Chat isn't switched on right now.";
    return "Something went wrong. Try again?";
  })();

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div ref={listRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6" aria-live="polite">
        {messages.length === 0 ? (
          <div>
            <p className="text-ink-2">
              Ask about my work, projects, trips, football opinions, anything that&apos;s on this site. Some starters:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-full border border-rule px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-ink hover:text-ink"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          messages.map((m) => <MessageView key={m.id} m={m} />)
        )}
        {status === "submitted" && (
          <p className="label flex items-center gap-2 normal-case tracking-normal">
            <span className="size-1.5 animate-pulse rounded-full bg-accent" /> thinking…
          </p>
        )}
        {errorText && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-sm">
            <span>{errorText}</span>
            <button type="button" onClick={() => regenerate()} className="link shrink-0">
              Retry
            </button>
          </div>
        )}
      </div>

      <form
        className="border-t border-rule p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <div className="flex items-end gap-2 rounded-2xl border border-rule bg-paper-2 p-2 focus-within:border-ink-3">
          <label htmlFor="chat-input" className="sr-only">
            Your question
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={2000}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ask me something…"
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] placeholder:text-ink-3 focus:outline-none"
          />
          {busy ? (
            <button
              type="button"
              onClick={() => stop()}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper"
              aria-label="Stop"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-paper transition-opacity disabled:opacity-30"
              aria-label="Send"
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </div>
        {messages.length > 0 && !busy && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="mt-2 inline-flex items-center gap-1.5 px-2 text-xs text-ink-3 hover:text-ink"
          >
            <RotateCcw className="size-3" /> New conversation
          </button>
        )}
      </form>
    </div>
  );
}
