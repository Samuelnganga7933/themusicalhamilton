import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vibra API", version="0.3.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("VIBRA_ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "apikey"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "vibra-api", "version": "0.3.0"}


@app.get("/api/v1/config")
def config():
    return {
        "name": "Vibra",
        "version": "0.3.0",
        "catalogue": "Apple iTunes Search API",
        "lyrics": "LRCLIB",
        "playback": "provider preview URLs only",
        "account_storage": "Supabase Auth and row-level-secured database",
    }
