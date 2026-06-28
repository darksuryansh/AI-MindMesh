"""In-memory conversation store for the chat feature.

Keeps the full ordered message history per session so each chat turn can be
sent to Gemini with all prior context (real conversation memory). Provider-
agnostic: it only stores {"role", "content"} dicts.

Note: this is an in-process store — history is lost on restart and is not
shared across multiple server instances. Swapping this class for a Redis- or
DB-backed implementation would be the production upgrade (see README).
"""

import uuid
from threading import Lock


class ConversationStore:
    def __init__(self) -> None:
        self._sessions: dict[str, list[dict]] = {}
        self._lock = Lock()

    @staticmethod
    def new_session_id() -> str:
        return uuid.uuid4().hex

    def get_history(self, session_id: str) -> list[dict]:
        """Return a copy of the message history for a session (empty if unknown)."""
        with self._lock:
            return list(self._sessions.get(session_id, []))

    def append(self, session_id: str, role: str, content: str) -> None:
        with self._lock:
            self._sessions.setdefault(session_id, []).append(
                {"role": role, "content": content}
            )

    def reset(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)


# Module-level singleton shared across requests.
conversation_store = ConversationStore()
