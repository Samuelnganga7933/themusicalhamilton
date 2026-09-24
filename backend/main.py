from __future__ import annotations

import asyncio
import os
import re
import time
from typing import Any, AsyncIterator
from urllib.parse import urlparse, parse_qs

import httpx
from fastapi import FastAPI, Header, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from yt_dlp import YoutubeDL
from ytmusicapi import YTMusic


app = FastAPI(title="Vibra Music API", version="1.0.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "https://themusicalhamilton.vercel.app,https://themusicalhamilton.onrender.com,http://localhost:4173,http://localhost:5173",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["Range", "Content-Type", "Accept", "Origin"],
    expose_headers=["Accept-Ranges", "Content-Length", "Content-Range", "Content-Type"],
)

_http_client: httpx.AsyncClient | None = None
_ytmusic: YTMusic | None = None


def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(
            follow_redirects=True,
            timeout=httpx.Timeout(20.0, connect=10.0),
            headers={"User-Agent": "Vibra/1.0"},
        )
    return _http_client


def get_ytmusic() -> YTMusic:
    global _ytmusic
    if _ytmusic is None:
        _ytmusic = YTMusic()
    return _ytmusic


def duration_seconds(value: Any) -> int | None:
    if isinstance(value, (int, float)):
        return round(value)
    if isinstance(value, str):
        parts = value.split(":")
        try:
            total = 0
            for part in parts:
                total = total * 60 + int(part)
            return total
        except ValueError:
            return None
    return None


def image_url(images: Any) -> str | None:
    if isinstance(images, list) and images:
        first = images[0]
        if isinstance(first, dict):
            return first.get("url") or first.get("thumbnails", [{}])[0].get("url")
        if isinstance(first, str):
            return first
    return None


def clean_search_result(item: dict[str, Any]) -> dict[str, Any]:
    artists = item.get("artists") or []
    artist = ", ".join(
        a.get("name", "") for a in artists if isinstance(a, dict) and a.get("name")
    )
    album = item.get("album") or {}
    return {
        "id": item.get("videoId") or item.get("browseId") or item.get("id"),
        "title": item.get("title") or item.get("name") or "Unknown track",
        "artist": artist or item.get("artist") or "Unknown artist",
        "duration": duration_seconds(item.get("duration") or item.get("lengthSeconds")),
        "albumArt": image_url(item.get("thumbnails")) or image_url(album.get("thumbnails")),
    }


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "vibra-music-api"}


@app.get("/api/v1/search")
async def search(
    q: str = Query(..., min_length=1, max_length=200, description="Track, artist, or album search"),
    limit: int = Query(20, ge=1, le=50),
) -> dict[str, Any]:
    try:
        results = await asyncio.to_thread(get_ytmusic().search, q.strip(), filter="songs", limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Music search failed: {exc}") from exc
    return {"query": q.strip(), "tracks": [clean_search_result(item) for item in results]}


async def resolve_stream(video_id: str) -> dict[str, Any]:
    def extract() -> dict[str, Any]:
        options = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "noplaylist": True,
            "format": "bestaudio/best",
        }
        cookie_file = os.getenv("YOUTUBE_COOKIES_FILE")
        if cookie_file:
            options["cookiefile"] = cookie_file
        with YoutubeDL(options) as ydl:
            return ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False) or {}

    info = await asyncio.to_thread(extract)
    url = info.get("url")
    if not url:
        raise HTTPException(status_code=404, detail="No playable audio stream found")
    query = parse_qs(urlparse(url).query)
    expires = query.get("expire", [None])[0]
    expires_at = int(expires) if expires and expires.isdigit() else None
    return {
        "id": video_id,
        "title": info.get("title"),
        "artist": info.get("uploader") or info.get("channel"),
        "duration": duration_seconds(info.get("duration")),
        "url": url,
        "mimeType": info.get("acodec") and (info.get("ext") == "webm" and "audio/webm" or "audio/mp4"),
        "expiresAt": expires_at,
        "expiresIn": max(0, expires_at - int(time.time())) if expires_at else None,
    }


@app.get("/api/v1/stream/{video_id}")
async def stream(video_id: str) -> dict[str, Any]:
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
        raise HTTPException(status_code=400, detail="Invalid music video ID")
    try:
        return await resolve_stream(video_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to resolve audio stream") from exc


HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "set-cookie",
    "server",
}


def proxy_headers(upstream: httpx.Response) -> dict[str, str]:
    keep = {"content-type", "content-length", "content-range", "accept-ranges", "cache-control", "etag"}
    return {key: value for key, value in upstream.headers.items() if key.lower() in keep and key.lower() not in HOP_BY_HOP_HEADERS}


@app.get("/api/v1/proxy")
async def proxy(request: Request, stream_url: str = Query(..., min_length=20)) -> StreamingResponse:
    parsed = urlparse(stream_url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail="stream_url must be an absolute HTTP(S) URL")
    host = parsed.hostname.lower() if parsed.hostname else ""
    trusted_host = host == "youtube.com" or host.endswith(".youtube.com") or host.endswith(".googlevideo.com")
    if not trusted_host:
        raise HTTPException(status_code=403, detail="Audio proxy host is not allowed")

    requested_range = request.headers.get("range")
    headers = {"Accept": "*/*", "User-Agent": "Vibra/1.0"}
    if requested_range:
        headers["Range"] = requested_range

    client = get_http_client()
    try:
        upstream = await client.send(
            client.build_request("GET", stream_url, headers=headers),
            stream=True,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Unable to reach the audio CDN") from exc

    if upstream.status_code not in {200, 206}:
        await upstream.aclose()
        raise HTTPException(status_code=upstream.status_code, detail="Audio source rejected the request")

    async def body() -> AsyncIterator[bytes]:
        try:
            async for chunk in upstream.aiter_bytes(64 * 1024):
                yield chunk
        finally:
            await upstream.aclose()

    response_status = 206 if requested_range and upstream.status_code == 206 else upstream.status_code
    return StreamingResponse(body(), status_code=response_status, headers=proxy_headers(upstream), media_type=None)


@app.get("/api/v1/lyrics")
async def lyrics(
    track_name: str = Query(..., min_length=1, max_length=200),
    artist_name: str = Query(..., min_length=1, max_length=200),
    album_name: str | None = Query(None, max_length=200),
) -> JSONResponse:
    client = get_http_client()
    params = {"track_name": track_name, "artist_name": artist_name}
    if album_name:
        params["album_name"] = album_name
    try:
        result = await client.get("https://lrclib.net/api/get", params=params)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Lyrics service is unavailable") from exc
    if result.status_code == 404:
        raise HTTPException(status_code=404, detail="Lyrics not found")
    if result.status_code >= 400:
        raise HTTPException(status_code=502, detail="Lyrics service returned an error")
    payload = result.json()
    return JSONResponse(
        {
            "id": payload.get("id"),
            "trackName": payload.get("trackName") or track_name,
            "artistName": payload.get("artistName") or artist_name,
            "albumName": payload.get("albumName") or album_name,
            "duration": payload.get("duration"),
            "plainLyrics": payload.get("plainLyrics"),
            "syncedLyrics": payload.get("syncedLyrics"),
        }
    )


@app.on_event("shutdown")
async def shutdown() -> None:
    if _http_client is not None:
        await _http_client.aclose()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)
