"use client";

import { useEffect, useRef } from "react";

import { useChat } from "@/components/chat/ChatContext";
import { Markdown } from "@/components/Markdown";
import { cn } from "@/lib/cn";

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="mesh-node h-2 w-2 rounded-full bg-muted"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}

/** Renders the shared conversation. Used both in the Chat tab and inline in Explain. */
export function ChatThread({ className }: { className?: string }) {
  const { messages } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  // Keep pinned to the newest content as tokens stream in.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  return (
    <div className={cn("space-y-4 overflow-y-auto", className)}>
      {messages.map((m, i) => (
        <div
          key={i}
          className={cn(
            "flex",
            m.role === "user" ? "justify-end" : "justify-start",
          )}
        >
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
              m.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-surface-2",
            )}
          >
            {m.role === "user" ? (
              <p className="whitespace-pre-wrap">{m.content}</p>
            ) : m.content ? (
              <Markdown content={m.content} className="text-sm" />
            ) : (
              <TypingDots />
            )}
          </div>
        </div>
      ))}

      <div ref={endRef} />
    </div>
  );
}
