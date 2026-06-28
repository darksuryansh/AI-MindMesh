"""Schemas for the Explain Mode feature."""

from enum import Enum

from pydantic import BaseModel


class ExplainLevel(str, Enum):
    """Depth level for an explanation."""

    eli5 = "eli5"  # Explain Like I'm 5
    pro = "pro"    # Explain Like a Pro


class ExplainResponse(BaseModel):
    topic: str
    level: ExplainLevel
    explanation: str
