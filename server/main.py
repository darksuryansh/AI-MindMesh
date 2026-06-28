"""FastAPI application entry point for the AI MindMesh backend.

Wires up CORS, a health check, and the three feature routers (explain / quiz /
chat). Route wiring lives here; everything else lives in its own package.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
)


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
