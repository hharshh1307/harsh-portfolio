"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useChat as useAiChat, type UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { ChatDrawer } from "./ChatDrawer";

type ChatContextValue = {
  isOpen: boolean;
  open: (question?: string) => void;
  close: () => void;
  chat: UseChatHelpers<UIMessage>;
  ask: (text: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * One conversation for the whole visit: the drawer and the /ask page share it,
 * so navigating between pages never loses the thread.
 */
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const chat = useAiChat();

  const ask = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || chat.status === "streaming" || chat.status === "submitted") return;
      void chat.sendMessage({ text: t });
    },
    [chat],
  );

  const open = useCallback(
    (question?: string) => {
      setIsOpen(true);
      if (question) ask(question);
    },
    [ask],
  );
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close, chat, ask }), [isOpen, open, close, chat, ask]);

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatDrawer />
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
