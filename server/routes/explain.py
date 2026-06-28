"""Explain Mode route: GET /api/explain?level=eli5|pro"""

from fastapi import APIRouter, HTTPException, Query

from config import DEFAULT_TOPIC
from prompts.explain_prompt import build_explain_prompt
from schemas.explain import ExplainLevel, ExplainResponse
from services import gemini_service

router = APIRouter(prefix="/api", tags=["explain"])

# Explanations for a given (topic, level) are stable, so cache them: the toggle
# feels instant after first load and we avoid spending tokens regenerating.
_cache: dict[tuple[str, str], str] = {}


@router.get("/explain", response_model=ExplainResponse)
def explain(
    level: ExplainLevel = Query(..., description="Depth level: eli5 or pro."),
    topic: str = Query(DEFAULT_TOPIC),
) -> ExplainResponse:
    cache_key = (topic, level.value)
    if cache_key not in _cache:
        system_instruction, user_prompt = build_explain_prompt(level, topic)
        try:
            text = gemini_service.generate_text(
                user_prompt,
                system_instruction=system_instruction,
                temperature=0.7,
            )
        except Exception as exc:  # noqa: BLE001 - surface a clean error to the client
            raise HTTPException(status_code=502, detail=f"Explanation failed: {exc}")
        if not text.strip():
            raise HTTPException(status_code=502, detail="Empty explanation returned.")
        _cache[cache_key] = text

    return ExplainResponse(topic=topic, level=level, explanation=_cache[cache_key])
