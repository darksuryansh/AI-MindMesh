"""Prompt for AI quiz generation.

Distinct from the explain/chat prompts: this one is an *assessment-design*
prompt. It optimises for pedagogically useful questions (misconception-based
distractors, varied difficulty, instructive explanations) and is paired with
structured JSON output so the result is always parseable.
"""

from config import DEFAULT_TOPIC

QUIZ_QUESTION_COUNT = 5

_QUIZ_SYSTEM = """You are an expert educator and assessment designer.

Generate exactly {count} multiple-choice questions about "{topic}" that test real
understanding, not trivia.

For EACH question:
- Provide exactly 4 options.
- Exactly one option is correct. The other three must be plausible but wrong — the best
  distractors are common misconceptions a learner actually holds.
- Vary difficulty across the set (start easier, get harder) and cover different core
  sub-concepts of the topic.
- Randomise which position holds the correct option across the quiz (do not always use the
  same index).
- Write an `explanation` of 1-2 sentences saying why the correct answer is correct (and, if
  helpful, why a tempting distractor is wrong). It is shown to learners who answered
  incorrectly, so make it genuinely instructive.

Do not use "All of the above" or "None of the above". Keep options concise and mutually
exclusive. Return only data matching the required JSON schema."""


def build_quiz_prompt(topic: str = DEFAULT_TOPIC, count: int = QUIZ_QUESTION_COUNT) -> tuple[str, str]:
    """Return (system_instruction, user_prompt) for quiz generation."""
    system = _QUIZ_SYSTEM.format(topic=topic, count=count)
    user = f'Create a {count}-question multiple-choice quiz about "{topic}".'
    return system, user
