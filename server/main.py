"""FastAPI application entry point for the AI MindMesh backend.

Wires up CORS, a health check, and the three feature routers (explain / quiz /
chat). Route wiring lives here; everything else lives in its own package.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.genai import errors as genai_errors

from config import settings
from routes import chat, explain, quiz

app = FastAPI(
    title="AI MindMesh API",
    description="Backend for AI MindMesh — learn 'How Neural Networks Learn'.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-Id"],  # so the browser can read it from the chat stream
)


@app.exception_handler(genai_errors.APIError)
async def handle_gemini_error(request: Request, exc: genai_errors.APIError) -> JSONResponse:
    """Translate Gemini SDK errors into clean HTTP responses.

    Most importantly, a quota/rate-limit error becomes a 429 with an actionable
    message instead of a confusing 502.
    """
    status = exc.code if isinstance(getattr(exc, "code", None), int) else 502
    message = getattr(exc, "message", str(exc))

    if status == 429:
        detail = (
            "Gemini quota or rate limit reached. The free tier has per-minute and "
            "per-day caps - wait a moment and retry, switch GEMINI_MODEL, or enable billing."
        )
    elif status in (400, 401, 403):
        detail = f"Gemini rejected the request ({status}): {message}"
    else:
        status = 502
        detail = f"Gemini API error: {message}"

    return JSONResponse(status_code=status, content={"detail": detail})


@app.get("/", tags=["meta"])
def root() -> dict:
    """Landing route (shown on the Hugging Face Space 'App' tab)."""
    return {
        "service": "AI MindMesh API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["meta"])
def health() -> dict:
    """Liveness probe. Reports whether a Gemini key is configured (never the key)."""
    return {
        "status": "ok",
        "model": settings.gemini_model,
        "gemini_configured": bool(settings.gemini_api_key),
    }


app.include_router(explain.router)
app.include_router(quiz.router)
app.include_router(chat.router)


if __name__ == "__main__":
    # Allows `python main.py` to start the server directly (works from any
    # directory). For hot-reload during development prefer:
    #   uvicorn main:app --reload --port 8000
    import os

    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
