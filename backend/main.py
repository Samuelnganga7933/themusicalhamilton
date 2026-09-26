from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Vibra API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TRACKS = [
    {"id": "afterglow", "title": "Afterglow", "artist": "Nia Sol", "album": "Night Drive", "duration": "3:42", "genre": "Alternative"},
    {"id": "velvet-sky", "title": "Velvet Sky", "artist": "Milo Grey", "album": "Stillness", "duration": "4:08", "genre": "R&B"},
    {"id": "slow-motion", "title": "Slow Motion", "artist": "Lena Vale", "album": "Tidal", "duration": "3:51", "genre": "Indie"},
    {"id": "open-water", "title": "Open Water", "artist": "Kairo", "album": "Drift", "duration": "4:16", "genre": "Electronic"},
]

@app.get("/health")
def health():
    return {"status": "ok", "service": "vibra-api"}

@app.get("/api/v1/config")
def config():
    return {
        "name": "Vibra",
        "version": "0.2.0",
        "features": ["discovery", "search", "playlists", "library", "playback", "charts"],
    }

@app.get("/api/v1/tracks")
def list_tracks(
    q: str | None = Query(default=None),
    genre: str | None = Query(default=None),
):
    results = TRACKS
    if q:
        needle = q.lower()
        results = [
            track for track in results
            if needle in " ".join([
                track["title"], track["artist"], track["album"], track["genre"]
            ]).lower()
        ]
    if genre:
        results = [track for track in results if track["genre"].lower() == genre.lower()]
    return {"items": results, "total": len(results)}

@app.get("/api/v1/tracks/{track_id}")
def get_track(track_id: str):
    for track in TRACKS:
        if track["id"] == track_id:
            return track
    return {"error": "Track not found"}

@app.get("/api/v1/artists")
def list_artists():
    artists = {}
    for track in TRACKS:
        artists[track["artist"]] = {"name": track["artist"], "tracks": 0}
        artists[track["artist"]]["tracks"] += 1
    return {"items": list(artists.values()), "total": len(artists)}

@app.get("/api/v1/albums")
def list_albums():
    albums = {}
    for track in TRACKS:
        albums[track["album"]] = {
            "title": track["album"],
            "artist": track["artist"],
            "tracks": 0,
        }
        albums[track["album"]]["tracks"] += 1
    return {"items": list(albums.values()), "total": len(albums)}
