// Shared types mirroring the FastAPI backend schemas.

export type ExplainLevel = "eli5" | "pro";

export interface ExplainResponse {
  topic: string;
  level: ExplainLevel;
  explanation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizResponse {
  topic: string;
  questions: QuizQuestion[];
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResponse {
  session_id: string;
  reply: string;
  history: ChatMessage[];
}
