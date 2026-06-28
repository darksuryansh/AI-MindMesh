"use client";

import { useState } from "react";

import { Brand } from "@/components/Brand";
import { Chat } from "@/components/Chat";
import { ChatProvider } from "@/components/chat/ChatContext";
import { ExplainMode } from "@/components/ExplainMode";
import { Hero } from "@/components/Hero";
import { Quiz } from "@/components/Quiz";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TopicSelect } from "@/components/TopicSelect";
import { Segmented } from "@/components/ui/Segmented";
import { cn } from "@/lib/cn";
import { DEFAULT_TOPIC } from "@/lib/topics";

type Tab = "explain" | "quiz" | "chat";

const TABS = [
  { value: "explain" as const, label: "Explain" },
  { value: "quiz" as const, label: "Quiz" },
  { value: "chat" as const, label: "Chat" },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("explain");
  const [topic, setTopic] = useState<string>(DEFAULT_TOPIC);

  // The topic dropdown lives in the navbar on the Explain (home) view; Quiz and
  // Chat open in full view without it. Changing the topic stays on Explain.
  const showTopic = tab === "explain";

  return (
    <ChatProvider topic={topic}>
      <div className="flex h-dvh flex-col overflow-hidden">
        {/* Navbar: brand (left), topic dropdown (centered), theme toggle (right). */}
        <header className="shrink-0 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
            <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div className="flex justify-start sm:col-start-1">
                <Brand />
              </div>
              {showTopic && (
                <div className="order-last col-span-2 sm:order-0 sm:col-span-1 sm:col-start-2 sm:flex sm:justify-center">
                  <TopicSelect value={topic} onChange={setTopic} />
                </div>
              )}
              <div className="flex justify-end sm:col-start-3">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          {/* Mode switcher — its own bar, not part of the navbar. */}
          <div className="shrink-0 border-b">
            <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
              <Segmented
                ariaLabel="Choose a learning mode"
                options={TABS}
                value={tab}
                onChange={setTab}
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          {/* Active panel fills the rest; only this region scrolls. */}
          <div className="min-h-0 flex-1">
            {/* Explain: the empty state fits one screen; once an explanation is
                generated the whole page scrolls naturally. */}
            <div
              className={cn(
                "h-full overflow-y-auto",
                tab !== "explain" && "hidden",
              )}
            >
              <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
                <Hero topic={topic} />
                <ExplainMode topic={topic} />
              </div>
            </div>

            {/* Quiz: full view. */}
            <div
              className={cn(
                "h-full overflow-y-auto",
                tab !== "quiz" && "hidden",
              )}
            >
              <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
                <Quiz topic={topic} />
              </div>
            </div>

            {/* Chat: full view, fills the height. */}
            <div className={cn("h-full", tab !== "chat" && "hidden")}>
              <div className="mx-auto h-full max-w-5xl px-4 py-6 sm:px-6">
                <Chat topic={topic} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ChatProvider>
  );
}
