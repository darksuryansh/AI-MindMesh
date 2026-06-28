"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorNote } from "@/components/ui/ErrorNote";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";
import { ApiError, getQuiz } from "@/lib/api";
import { downloadFile, slugify } from "@/lib/export";
import type { QuizQuestion } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function scoreMessage(score: number, total: number) {
  const ratio = score / total;
  if (ratio === 1) return "Perfect — you've got this.";
  if (ratio >= 0.6) return "Solid. Review the misses below.";
  return "Good start — the explanations below will help.";
}

function buildQuizMarkdown(
  topic: string,
  questions: QuizQuestion[],
  answers: Record<number, number>,
  score: number,
): string {
  const lines = [
    `# Quiz results — ${topic}`,
    "",
    `Score: ${score} / ${questions.length}`,
    "",
  ];
  questions.forEach((q, i) => {
    const selected = answers[q.id];
    lines.push(`## ${i + 1}. ${q.question}`);
    q.options.forEach((option, oi) => {
      const tags: string[] = [];
      if (oi === q.correct_index) tags.push("correct");
      if (oi === selected) tags.push("your answer");
      lines.push(
        `- ${LETTERS[oi]}. ${option}${tags.length ? `  (${tags.join(", ")})` : ""}`,
      );
    });
    lines.push("");
    lines.push(
      `Result: ${selected === q.correct_index ? "Correct" : "Incorrect"}`,
    );
    lines.push(`Why: ${q.explanation}`);
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

export function Quiz({ topic }: { topic: string }) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the quiz when the topic changes so questions never mismatch the topic.
  useEffect(() => {
    setQuestions(null);
    setAnswers({});
    setSubmitted(false);
    setError(null);
  }, [topic]);

  async function generate() {
    setLoading(true);
    setError(null);
    setSubmitted(false);
    setAnswers({});
    setQuestions(null);
    try {
      const res = await getQuiz(topic);
      setQuestions(res.questions);
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Failed to generate the quiz.",
      );
    } finally {
      setLoading(false);
    }
  }

  const allAnswered =
    questions !== null && questions.every((q) => answers[q.id] !== undefined);
  const score = questions
    ? questions.reduce(
        (sum, q) => sum + (answers[q.id] === q.correct_index ? 1 : 0),
        0,
      )
    : 0;

  function select(qid: number, idx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
  }

  function exportResults() {
    if (!questions) return;
    downloadFile(
      `quiz-${slugify(topic)}.md`,
      buildQuizMarkdown(topic, questions, answers, score),
    );
  }

  // ── Idle / loading / error ──────────────────────────────────────────
  if (!questions) {
    return (
      <Card className="flex min-h-70 flex-col items-center justify-center gap-4 p-8 text-center">
        {error ? (
          <ErrorNote message={error} onRetry={generate} />
        ) : (
          <>
            <h2 className="font-display text-xl font-semibold">
              Test yourself
            </h2>
            <p className="max-w-sm text-sm text-muted">
              Five AI-generated multiple-choice questions on how neural networks
              learn. You&apos;ll get a score and an explanation for every answer.
            </p>
            <Button onClick={generate} disabled={loading}>
              {loading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Generating…
                </>
              ) : (
                "Generate quiz"
              )}
            </Button>
          </>
        )}
      </Card>
    );
  }

  // ── Questions ───────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold">Quiz</h2>
          <p className="text-sm text-muted">
            {submitted
              ? scoreMessage(score, questions.length)
              : "Pick an answer for each question, then check your score."}
          </p>
        </div>
        {submitted && (
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-semibold">
              {score}
              <span className="text-muted">/{questions.length}</span>
            </span>
            <Button variant="outline" size="sm" onClick={exportResults}>
              <DownloadIcon />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={generate}>
              New quiz
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <Card key={q.id} className="p-5">
              <p className="font-medium">
                <span className="mr-2 font-mono text-sm text-muted">
                  {qi + 1}.
                </span>
                {q.question}
              </p>

              <div className="mt-4 grid gap-2">
                {q.options.map((option, oi) => {
                  const isSelected = selected === oi;
                  const isCorrect = oi === q.correct_index;
                  const showCorrect = submitted && isCorrect;
                  const showWrong = submitted && isSelected && !isCorrect;

                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      aria-pressed={isSelected}
                      onClick={() => select(q.id, oi)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                        !submitted &&
                          (isSelected
                            ? "border-primary bg-primary/5"
                            : "hover:bg-surface-2"),
                        showCorrect && "border-success bg-success/10",
                        showWrong && "border-danger bg-danger/10",
                        submitted &&
                          !showCorrect &&
                          !showWrong &&
                          "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs",
                          isSelected && !submitted && "border-primary text-primary",
                          showCorrect && "border-success text-success",
                          showWrong && "border-danger text-danger",
                        )}
                      >
                        {LETTERS[oi]}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showCorrect && <span className="text-success">✓</span>}
                      {showWrong && <span className="text-danger">✗</span>}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={cn(
                    "mt-4 rounded-lg border-l-2 bg-surface-2 px-4 py-3 text-sm text-muted",
                    selected === q.correct_index
                      ? "border-success"
                      : "border-danger",
                  )}
                >
                  <span className="font-medium text-foreground">
                    {selected === q.correct_index ? "Correct. " : "Why: "}
                  </span>
                  {q.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {Object.keys(answers).length}/{questions.length} answered
          </p>
          <Button onClick={() => setSubmitted(true)} disabled={!allAnswered}>
            Check answers
          </Button>
        </div>
      )}
    </div>
  );
}
