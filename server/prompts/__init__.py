"""Prompt-engineering layer.

All prompt text and prompt construction lives here, isolated from routes and
services. Each feature gets a purpose-built prompt so they can be reasoned
about and iterated independently (see README for the reasoning behind each).
"""

from config import DEFAULT_TOPIC

__all__ = ["DEFAULT_TOPIC"]
