# AI MindMesh — Backend (FastAPI)

FastAPI service that powers the three AI features. Holds the Gemini API key
server-side; the frontend never talks to Gemini directly.

## Structure

```
server/
├── main.py                 # FastAPI app: CORS, /health, router wiring
├── config.py               # env-based settings (Gemini key/model, CORS) + DEFAULT_TOPIC
├── routes/                 # thin HTTP handlers, one per feature
│   ├── explain.py          #   GET  /api/explain?level=eli5|pro
│   ├── quiz.py             #   GET  /api/quiz
│   └── chat.py             #   POST /api/chat  ·  DELETE /api/chat/{session_id}
├── services/
│   ├── gemini_service.py   # google-genai wrapper: text / chat / structured JSON
│   └── conversation_service.py  # in-memory per-session chat history
├── prompts/                # purpose-built prompt logic, isolated from routes
│   ├── explain_prompt.py
│   ├── quiz_prompt.py
│   └── chat_prompt.py
├── schemas/                # Pydantic request/response models per feature
└── requirements.txt
```

## API

| Method | Path                       | Purpose                                              |
| ------ | -------------------------- | ---------------------------------------------------- |
| GET    | `/health`                  | Liveness + whether a Gemini key is configured        |
| GET    | `/api/explain?level=eli5`  | Explanation at `eli5` or `pro` depth                 |
| GET    | `/api/quiz`                | 5 multiple-choice questions (with answers + reasons) |
| POST   | `/api/chat`                | Send a message; returns reply + full history         |
| DELETE | `/api/chat/{session_id}`   | Clear a conversation                                 |

## Run locally

```bash
cd server
conda create -n mindmesh python=3.12 -y
conda activate mindmesh
pip install -r requirements.txt
cp .env.example .env        # then add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

Check it: http://localhost:8000/health · Interactive docs: http://localhost:8000/docs
