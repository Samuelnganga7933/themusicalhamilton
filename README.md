# Vibra

Vibra is a calm, editorial music discovery and listening app for web and mobile-sized screens. It focuses on artists, albums, moods, playlists, search, and playback.

## Frontend

```bash
pnpm install
pnpm dev
```

Build for production with `pnpm build`.

## Music API

The optional FastAPI service lives in [`backend/`](backend/README.md). It provides music search, short-lived audio stream resolution, range-request audio proxying, and synced lyrics through LRCLIB.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

The frontend is static and can be deployed to Vercel or Render as a static site. The FastAPI service should be deployed separately as a Python web service and configured through `CORS_ORIGINS`.
