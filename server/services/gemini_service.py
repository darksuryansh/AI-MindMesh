"""Thin wrapper around the Google Gemini (google-genai) SDK.

Every Gemini call in the app goes through here, so provider details (client
creation, role mapping, structured output) live in exactly one place. Routes
and other services depend on these functions, never on the SDK directly.
"""

import json
from functools import lru_cache
from typing import Any

from google import genai
from google.genai import types

from config import settings

# Gemini uses "model" for the assistant role; our app uses "assistant".
_ROLE_MAP = {"user": "user", "assistant": "model", "model": "model"}


@lru_cache
def get_client() -> genai.Client:
    """Return a cached Gemini client, or raise if the key is missing.

    Created lazily so the app can boot (and /health can respond) before a key
    is configured.
    """
    if not settings.gemini_api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to server/.env before calling Gemini."
        )
    return genai.Client(api_key=settings.gemini_api_key)


def generate_text(
    prompt: str,
    *,
    system_instruction: str | None = None,
    temperature: float | None = None,
    model: str | None = None,
) -> str:
    """Single-shot text generation (used by Explain Mode)."""
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=temperature,
    )
    response = get_client().models.generate_content(
        model=model or settings.gemini_model,
        contents=prompt,
        config=config,
    )
    return response.text or ""


def generate_chat_reply(
    history: list[dict],
    *,
    system_instruction: str | None = None,
    temperature: float | None = None,
    model: str | None = None,
) -> str:
    """Multi-turn generation. `history` is the full ordered list of
    {"role": "user"|"assistant", "content": str} — passing all of it is what
    gives the chat real memory across turns."""
    contents = [
        types.Content(
            role=_ROLE_MAP.get(message["role"], "user"),
            parts=[types.Part(text=message["content"])],
        )
        for message in history
    ]
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=temperature,
    )
    response = get_client().models.generate_content(
        model=model or settings.gemini_model,
        contents=contents,
        config=config,
    )
    return response.text or ""


def generate_structured(
    prompt: str,
    *,
    response_schema: Any,
    system_instruction: str | None = None,
    temperature: float | None = None,
    model: str | None = None,
) -> Any:
    """Generation constrained to a JSON schema (used by quiz generation).

    Returns `response.parsed` (typed) when available, falling back to parsing
    the raw JSON text. `response_schema` may be a Pydantic model or, e.g.,
    `list[SomeModel]`.
    """
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=temperature,
        response_mime_type="application/json",
        response_schema=response_schema,
    )
    response = get_client().models.generate_content(
        model=model or settings.gemini_model,
        contents=prompt,
        config=config,
    )
    if getattr(response, "parsed", None) is not None:
        return response.parsed
    return json.loads(response.text or "[]")
