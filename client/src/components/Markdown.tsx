import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { cn } from "@/lib/cn";

/** Renders backend markdown (explanations, chat replies) with theme-aware styling. */
export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4 text-[15px] leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h2 className="font-display text-xl font-semibold">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="font-display text-lg font-semibold">{children}</h3>
          ),
          h3: ({ children }) => <h4 className="font-semibold">{children}</h4>,
          p: ({ children }) => (
            <p className="text-foreground/90">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc space-y-1.5 pl-5 marker:text-primary">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-5 marker:font-medium marker:text-primary">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1 text-foreground/90">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/40 pl-4 italic text-muted">
              {children}
            </blockquote>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-sm">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]">
              {children}
            </code>
          ),
          // Wrap tables so a wide one scrolls inside the card instead of
          // forcing the whole page to scroll sideways on mobile.
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border px-3 py-2 align-top">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
