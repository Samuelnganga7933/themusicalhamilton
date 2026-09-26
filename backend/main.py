from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vibra API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "vibra-api"}

@app.get("/api/v1/config")
def config():
    return {"name": "Vibra", "version": "0.1.0", "features": ["discovery", "playlists", "library", "playback"]}
