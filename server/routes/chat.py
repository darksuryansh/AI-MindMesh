"""Chat route: POST /api/chat — topic-scoped chat with conversation memory."""

from fastapi import APIRouter, HTTPException

from config import DEFAULT_TOPIC
from prompts.chat_prompt import build_chat_system_prompt
from schemas.chat import ChatMessage, ChatRequest, ChatResponse
from services import gemini_service
from services.conversation_service import conversation_store

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Reuse the client's session if it sent one, otherwise start a new one.
    session_id = request.session_id or conversation_store.new_session_id()

    # Build the full conversation (prior turns + this message) and send ALL of
    # it to Gemini — this is what gives the chat real memory across turns.
    prior = conversation_store.get_history(session_id)
    outgoing = prior + [{"role": "user", "content": message}]

    reply = gemini_service.generate_chat_reply(
        outgoing,
        system_instruction=build_chat_system_prompt(request.topic or DEFAULT_TOPIC),
        temperature=0.7,
    )

    # Persist only after a successful reply, so a failed turn never pollutes history.
    conversation_store.append(session_id, "user", message)
    conversation_store.append(session_id, "assistant", reply)

    return ChatResponse(
        session_id=session_id,
        reply=reply,
        history=[ChatMessage(**m) for m in conversation_store.get_history(session_id)],
    )


@router.delete("/chat/{session_id}", status_code=204)
def reset_chat(session_id: str) -> None:
    """Clear a conversation's history (e.g. a 'new chat' button)."""
    conversation_store.reset(session_id)
