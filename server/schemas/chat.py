"""Schemas for the topic-scoped chat feature."""

from typing import Literal, Optional

from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    # Omit on the first turn; the server returns a session_id to send back on
    # subsequent turns so conversation history is preserved.
    session_id: Optional[str] = None
    # Optional — defaults to the app's topic. Lets the chat be scoped to a
    # different topic later without changing the API contract.
    topic: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    history: list[ChatMessage]
