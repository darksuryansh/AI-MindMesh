"""Quiz route: GET /api/quiz — generates multiple-choice questions."""

import random

from fastapi import APIRouter, HTTPException, Query

from config import DEFAULT_TOPIC
from prompts.quiz_prompt import QUIZ_QUESTION_COUNT, build_quiz_prompt
from schemas.quiz import GeneratedQuestion, QuizQuestion, QuizResponse
from services import gemini_service

router = APIRouter(prefix="/api", tags=["quiz"])


def _to_quiz_question(index: int, item: object) -> QuizQuestion:
    """Normalise a generated item (Pydantic model or dict) into a QuizQuestion,
    guarding against an out-of-range correct_index."""
    generated = item if isinstance(item, GeneratedQuestion) else GeneratedQuestion(**item)
    correct_index = generated.correct_index
    if not 0 <= correct_index < len(generated.options):
        correct_index = 0
    return QuizQuestion(
        id=index,
        question=generated.question,
        options=generated.options,
        correct_index=correct_index,
        explanation=generated.explanation,
    )


def _balance_answer_positions(questions: list[QuizQuestion]) -> list[QuizQuestion]:
    """Spread correct answers evenly across option slots, then shuffle that
    assignment — so the answer key looks balanced (never all "B") yet stays
    unpredictable. Models have a strong positional bias the prompt can't fix.
    """
    num_options = 4
    targets = [i % num_options for i in range(len(questions))]
    random.shuffle(targets)

    balanced: list[QuizQuestion] = []
    for question, target in zip(questions, targets):
        slot = min(target, len(question.options) - 1)
        options = list(question.options)
        current = question.correct_index
        options[current], options[slot] = options[slot], options[current]
        balanced.append(
            question.model_copy(update={"options": options, "correct_index": slot}),
        )
    return balanced


@router.get("/quiz", response_model=QuizResponse)
def quiz(
    topic: str = Query(DEFAULT_TOPIC),
    count: int = Query(QUIZ_QUESTION_COUNT, ge=1, le=10),
) -> QuizResponse:
    system_instruction, user_prompt = build_quiz_prompt(topic, count)
    generated = gemini_service.generate_structured(
        user_prompt,
        response_schema=list[GeneratedQuestion],
        system_instruction=system_instruction,
        temperature=0.5,
    )

    questions = [_to_quiz_question(i, item) for i, item in enumerate(generated or [])]
    if not questions:
        raise HTTPException(status_code=502, detail="No questions were generated.")

    return QuizResponse(topic=topic, questions=_balance_answer_positions(questions))
