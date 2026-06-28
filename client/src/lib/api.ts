// Single place that talks to the FastAPI backend. Components call these
// functions and never construct URLs or touch fetch directly.

import { DEFAULT_TOPIC } from "@/lib/topics";
import type {
  ChatResponse,
  ExplainLevel,
  ExplainResponse,
  QuizResponse,
} from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

/** Error carrying the backend's HTTP status and human-readable detail. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      0,
      "Can't reach the server. Make sure the backend is running on " +
        BASE_URL +
        ".",
    );
  }

  if (!res.ok) {
    let detail = res.statusText || "Request failed";
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* non-JSON error body — keep the status text */
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

export function getExplanation(
  level: ExplainLevel,
  topic: string = DEFAULT_TOPIC,
): Promise<ExplainResponse> {
  return request<ExplainResponse>(
    `/api/explain?level=${level}&topic=${encodeURIComponent(topic)}`,
  );
}

export function getQuiz(topic: string = DEFAULT_TOPIC): Promise<QuizResponse> {
  return request<QuizResponse>(`/api/quiz?topic=${encodeURIComponent(topic)}`);
}

export function sendChatMessage(
  message: string,
  sessionId: string | null,
  topic: string = DEFAULT_TOPIC,
): Promise<ChatResponse> {
  return request<ChatResponse>(`/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId, topic }),
  });
}

export function resetChat(sessionId: string): Promise<void> {
  return fetch(`${BASE_URL}/api/chat/${sessionId}`, { method: "DELETE" }).then(
    () => undefined,
  );
}
