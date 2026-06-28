"use client";

import { useChat } from "@/components/chat/ChatContext";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatThread } from "@/components/chat/ChatThread";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { downloadFile, slugify } from "@/lib/export";
import type { ChatMessage } from "@/lib/types";

const STARTERS = [
  "What actually changes inside the network when it learns?",
  "Explain gradient descent with a simple analogy.",
  "Why do we need a loss function?",
];

function buildChatMarkdown(topic: string, messages: ChatMessage[]): string {
  const lines = [`# Chat transcript — ${topic}`, ""];
  messages.forEach((m) => {
    lines.push(`**${m.role === "user" ? "You" : "Tutor"}:**`);
    lines.push("");
    lines.push(m.content);
    lines.push("");
  });
  return lines.join("\n");
}

function DownloadIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

export function Chat({ topic }: { topic: string }) {
  const { messages, error, sending, send } = useChat();
  const empty = messages.length === 0;

  function exportTranscript() {
    if (empty) return;
    downloadFile(`chat-${slugify(topic)}.md`, buildChatMarkdown(topic, messages));
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex shrink-0 items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Chat tutor</h2>
          <p className="text-sm text-muted">
            One conversation, scoped to this topic — it remembers what you ask
            here and in Explain.
          </p>
        </div>
        {!empty && (
          <Button variant="outline" size="sm" onClick={exportTranscript}>
            <DownloadIcon />
            Export
          </Button>
        )}
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 p-4 sm:p-5">
          {empty && !sending ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="max-w-xs text-sm text-muted">
                Ask a follow-up about how neural networks learn. Try one of
                these:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border bg-surface-2 px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ChatThread className="h-full pr-1" />
          )}
        </div>

        {error && (
          <p className="px-4 pb-1 text-sm text-danger sm:px-5">{error}</p>
        )}

        <div className="border-t p-3 sm:p-4">
          <ChatComposer />
        </div>
      </Card>
    </div>
  );
}
