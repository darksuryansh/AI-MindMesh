"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className,
  disabled = false,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex gap-1 rounded-xl border bg-surface-2 p-1",
        disabled && "opacity-60",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed",
              size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4 text-sm",
              active
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
