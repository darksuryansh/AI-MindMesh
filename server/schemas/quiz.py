"""Schemas for the AI-generated quiz feature."""

from pydantic import BaseModel, Field


class GeneratedQuestion(BaseModel):
    """Shape the LLM must return (used as the structured-output schema).

    No `id` here — ids are assigned server-side after generation so the model
    only has to reason about content.
    """

    question: str = Field(..., description="The question text.")
    options: list[str] = Field(..., description="Exactly 4 answer options.")
    correct_index: int = Field(
        ..., description="0-based index of the correct option within `options`."
    )
    explanation: str = Field(
        ...,
        description="1-2 sentences on why the correct answer is right; shown when the user answers wrong.",
    )


class QuizQuestion(GeneratedQuestion):
    """A question as served to the client, with a stable id."""

    id: int


class QuizResponse(BaseModel):
    topic: str
    questions: list[QuizQuestion]
