"use client";

import { useState } from "react";

import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Segmented } from "@/components/ui/Segmented";
import { Spinner } from "@/components/ui/Spinner";
import { useChat } from "@/components/chat/ChatContext";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatThread } from "@/components/chat/ChatThread";
import { ApiError, getExplanation } from "@/lib/api";
import type { ExplainLevel } from "@/lib/types";

const LEVELS = [
  { value: "eli5" as const, label: "Like I'm 5" },
  { value: "pro" as const, label: "Like a Pro" },
];

const CAPTION: Record<ExplainLevel, string> = {
  eli5: "A warm, everyday story.",
  pro: "The real training loop, with precise terms.",
};

const LEVEL_LABEL: Record<ExplainLevel, string> = {
  eli5: "Like I'm 5",
  pro: "Like a Pro",
};

function ExplainSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden="true">
      {["w-11/12", "w-full", "w-10/12", "w-9/12", "w-full", "w-8/12"].map(
        (w, i) => (
          <div key={i} className={`h-3.5 rounded bg-surface-2 ${w}`} />
        ),
      )}
    </div>
  );
}

function EmptyState({ level }: { level: ExplainLevel }) {
  return (
    <div className="flex min-h-50 flex-col items-center justify-center gap-3 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0-4 10.5c.5.5 1 1.3 1 2.5h6c0-1.2.5-2 1-2.5A6 6 0 0 0 12 3z" />
          <path d="M9 21h6M10 18h4" />
        </svg>
      </span>
      <p className="max-w-xs text-sm text-muted">
        Pick a depth —{" "}
        <span className="font-medium text-foreground">
          {LEVEL_LABEL[level]}
        </span>{" "}
        is selected — then press{" "}
        <span className="font-medium text-foreground">Generate</span> to create
        the explanation.
      </p>
    </div>
  );
}

export function ExplainMode({ topic }: { topic: string }) {
  const [level, setLevel] = useState<ExplainLevel>("eli5");
  const [cache, setCache] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasConversation, reset } = useChat();

  // Cache by topic + depth, so switching either never shows stale text and a
  // previously generated explanation reappears instantly (no extra API call).
  const cacheKey = `${topic}::${level}`;

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await getExplanation(level, topic);
      setCache((c) => ({ ...c, [cacheKey]: res.explanation }));
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : "Failed to generate the explanation.",
      );
    } finally {
      setLoading(false);
    }
  }

  // Selecting a depth never calls the API — it only shows what's already
  // generated (if anything). Generation happens on the button press.
  function changeLevel(next: ExplainLevel) {
    if (loading) return;
    setError(null);
    setLevel(next);
  }

  const text = cache[cacheKey];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Explain mode</h2>
          <p className="text-sm text-muted">{CAPTION[level]}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Segmented
            ariaLabel="Explanation depth"
            options={LEVELS}
            value={level}
            onChange={changeLevel}
            disabled={loading}
          />
          <Button onClick={generate} disabled={loading} className="h-12">
            {loading ? (
              <>
                <Spinner className="h-4 w-4" />
                Generating…
              </>
            ) : text ? (
              "Regenerate"
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>

      <Card className="min-h-70 p-5 sm:p-7">
        {loading ? (
          <ExplainSkeleton />
        ) : error ? (
          <ErrorNote message={error} onRetry={generate} />
        ) : text ? (
          <Markdown content={text} />
        ) : (
          <EmptyState level={level} />
        )}
      </Card>

      {/* Ask a follow-up right here — same conversation as the Chat tab. */}
      {text && (
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold">
                Ask a follow-up
              </h3>
              <p className="text-xs text-muted">
                Same conversation as the Chat tab — the tutor knows you&apos;re
                reading the{" "}
                <span className="font-medium text-foreground">
                  {LEVEL_LABEL[level]}
                </span>{" "}
                version.
              </p>
            </div>
            {hasConversation && (
              <button
                type="button"
                onClick={reset}
                className="shrink-0 text-xs text-muted transition-colors hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          {hasConversation && <ChatThread className="mt-4 max-h-72 pr-1" />}

          <div className="mt-3">
            <ChatComposer
              placeholder="e.g. What exactly is a gradient?"
              transform={(raw) => ({
                sent: `I'm reading the "${LEVEL_LABEL[level]}" explanation of "${topic}". ${raw}`,
                display: raw,
              })}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
