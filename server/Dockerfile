# Hugging Face Spaces (Docker SDK) — FastAPI backend.
# HF Spaces serves the container on port 7860.
FROM python:3.12-slim

# HF Spaces runs the container as UID 1000; create a matching non-root user.
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user . .

EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
