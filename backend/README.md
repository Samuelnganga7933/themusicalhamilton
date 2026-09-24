# Vibra Music API

A small FastAPI service for music search, audio stream resolution, range-based audio proxying, and synced lyrics.

## Run locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`

## Endpoints

- `GET /api/v1/search?q=Tems&limit=20` — YouTube Music song metadata. Results use deterministic lexical ranking, so exact title, artist, and album terms win without rewriting the query.
- `GET /api/v1/stream/{video_id}` — resolves a short-lived direct audio URL with expiry metadata.
- `GET /api/v1/proxy?stream_url=<encoded-url>` — forwards optional `Range` headers and streams audio bytes with `206 Partial Content` when supported.
- `GET /api/v1/lyrics?track_name=...&artist_name=...&album_name=...` — returns LRCLIB plain and synced `.lrc` lyrics.

Set `CORS_ORIGINS` to a comma-separated list of trusted frontend origins when deploying. The stream resolver returns CDN URLs that expire; clients should resolve them again after expiry rather than persist them.

If YouTube requires verification for the deployment's IP, export a Netscape-format cookie file path as `YOUTUBE_COOKIES_FILE`. Keep that file private and provide it through the host's secret storage; never commit it.

## Hosting

This service needs a Python web-service host separate from the existing static frontend. Use the repository root as the service root, install with `pip install -r requirements.txt`, and start with `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.
