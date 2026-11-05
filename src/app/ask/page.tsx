import type { Metadata } from "next";
import { profile } from "@/lib/content";
import { ChatPanel } from "@/components/chat/ChatPanel";

export const metadata: Metadata = {
  title: "Ask",
  description: `Chat with an AI that knows ${profile.shortName}'s work, projects, trips and opinions.`,
};

export default function AskPage() {
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col px-0 sm:px-6">
      <header className="px-5 pb-2 pt-8 sm:px-0">
        <p className="label">Ask</p>
        <h1 className="display mt-2 text-4xl sm:text-5xl">Ask my AI anything.</h1>
        <p className="mt-2 text-ink-2">
          It answers as me, from what&apos;s on this site plus live GitHub and Spotify. It can be wrong, and it&apos;ll say
          when it doesn&apos;t know.
        </p>
      </header>
      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden border-rule sm:mb-6 sm:rounded-2xl sm:border sm:bg-paper-2/50">
        <ChatPanel autoFocus />
      </div>
    </div>
  );
}
