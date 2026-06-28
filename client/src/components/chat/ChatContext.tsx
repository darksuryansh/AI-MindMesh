"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { ApiError, resetChat, streamChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

interface ChatState {
  messages: ChatMessage[];
  sending: boolean;
  error: string | null;
  hasConversation: boolean;
  /**
   * Send a turn. `message` is what the model receives (may include context);
   * `displayAs` is what shows in the bubble (defaults to `message`).
   * Returns true on success so callers can decide whether to clear their input.
   */
  send: (message: string, displayAs?: string) => Promise<boolean>;
  reset: () => void;
}

const ChatContext = createContext<ChatState | null>(null);

export function useChat(): ChatState {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
}

// One conversation for the whole app — the Chat tab and the inline "Ask about
// this" composer in Explain both read and write here, so there is never a
// confusing "second chat".
export function ChatProvider({
  topic,
  children,
}: {
  topic: string;
  children: ReactNode;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (message: string, displayAs?: string): Promise<boolean> => {
      const sent = message.trim();
      if (!sent || sending) return false;

      setError(null);
      const shown = (displayAs ?? message).trim() || sent;
      // Add the user turn plus an empty assistant turn to stream tokens into.
      setMessages((m) => [
        ...m,
        { role: "user", content: shown },
        { role: "assistant", content: "" },
      ]);
      setSending(true);

      try {
        await streamChatMessage(sent, sessionId, topic, {
          onSession: (id) => setSessionId(id),
          onToken: (text) =>
            setMessages((m) => {
              const copy = m.slice();
              const last = copy[copy.length - 1];
              if (last && last.role === "assistant") {
                copy[copy.length - 1] = {
                  ...last,
                  content: last.content + text,
                };
              }
              return copy;
            }),
        });
        return true;
      } catch (e) {
        // Roll back the optimistic user + assistant turns; caller restores input.
        setMessages((m) => m.slice(0, -2));
        setError(
          e instanceof ApiError ? e.message : "Failed to send. Try again.",
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [sending, sessionId, topic],
  );

  const reset = useCallback(() => {
    if (sessionId) resetChat(sessionId).catch(() => {});
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, [sessionId]);

  // The chat is scoped to a topic — switching topics starts a fresh conversation.
  useEffect(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, [topic]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sending,
        error,
        hasConversation: messages.length > 0,
        send,
        reset,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
