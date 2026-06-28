"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { TOPICS } from "@/lib/topics";

export function TopicSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = TOPICS.find((t) => t.value === value) ?? TOPICS[0];

  // Close on click-outside or Escape.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative w-full sm:w-72">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border bg-surface px-4 py-2.5 transition-colors hover:bg-surface-2"
      >
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
          Topic
        </span>
        <span className="flex-1 truncate text-left text-sm font-medium text-foreground">
          {current.label}
        </span>
        <svg
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border bg-surface p-1 shadow-lg"
        >
          {TOPICS.map((t) => {
            const active = t.value === value;
            return (
              <li key={t.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(t.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-surface-2",
                  )}
                >
                  <span className="truncate">{t.label}</span>
                  {active && (
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
