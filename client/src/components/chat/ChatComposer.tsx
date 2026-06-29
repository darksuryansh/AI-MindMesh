"use client";

import { useState } from "react";

import { useChat } from "@/components/chat/ChatContext";
import { Button } from "@/components/ui/Button";

export function ChatComposer({
  placeholder = "Ask anything about how neural networks learn…",
  /** Optionally rewrite the raw input into { sent, display } — used by Explain
   *  to attach context to the message without changing what the user sees. */
  transform,
  autoFocus = false,
}: {
  placeholder?: string;
  transform?: (raw: string) => { sent: string; display: string };
  autoFocus?: boolean;
}) {
  const { send, sending } = useChat();
  const [input, setInput] = useState("");

  async function submit() {
    const raw = input.trim();
    if (!raw || sending) return;
    setInput("");
    const { sent, display } = transform
      ? transform(raw)
      : { sent: raw, display: raw };
    const ok = await send(sent, display);
    if (!ok) setInput(raw); // restore on failure
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2"
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        autoFocus={autoFocus}
        placeholder={placeholder}
        // 16px on mobile (text-base) stops iOS Safari from auto-zooming the
        // page on focus; back to text-sm at the sm breakpoint and up.
        className="max-h-32 flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-base outline-none placeholder:text-muted focus:border-primary sm:text-sm"
      />
      <Button type="submit" disabled={!input.trim() || sending}>
        Send
      </Button>
    </form>
  );
}
