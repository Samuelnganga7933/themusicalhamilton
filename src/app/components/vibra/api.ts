import type { Track } from "./data";

const inferredLocalApi =
  typeof window !== "undefined" && /^\d+-.*\.manus\.computer$/.test(window.location.hostname)
    ? `${window.location.protocol}//${window.location.hostname.replace(/^\d+-/, "8000-")}`
    : "http://localhost:8000";
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? inferredLocalApi).replace(/\/$/, "");

export interface ApiTrack {
  id: string;
  title: string;
  artist: string;
  duration: number | null;
  albumArt: string | null;
}

export interface StreamSource {
  id: string;
  url: string;
  mimeType: string | null;
  expiresAt: number | null;
  expiresIn: number | null;
}

export interface LyricsResult {
  id: number | null;
  trackName: string;
  artistName: string;
  albumName: string | null;
  duration: number | null;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Music API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function searchMusic(query: string, limit = 20): Promise<ApiTrack[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const result = await getJson<{ tracks: ApiTrack[] }>(`/api/v1/search?${params}`);
  return result.tracks;
}

export async function resolveStream(id: string): Promise<StreamSource> {
  return getJson<StreamSource>(`/api/v1/stream/${encodeURIComponent(id)}`);
}

export function proxyAudioUrl(streamUrl: string): string {
  const params = new URLSearchParams({ stream_url: streamUrl });
  return `${API_BASE}/api/v1/proxy?${params}`;
}

export async function fetchLyrics(trackName: string, artistName: string, albumName?: string): Promise<LyricsResult> {
  const params = new URLSearchParams({ track_name: trackName, artist_name: artistName });
  if (albumName) params.set("album_name", albumName);
  return getJson<LyricsResult>(`/api/v1/lyrics?${params}`);
}

export function apiTrackToTrack(track: ApiTrack): Track {
  return {
    id: `yt-${track.id}`,
    sourceId: track.id,
    title: track.title,
    artist: track.artist,
    album: "YouTube Music",
    year: new Date().getFullYear(),
    duration: track.duration ?? 0,
    art: track.albumArt ?? "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=900&h=900&fit=crop&auto=format&q=80",
    tone: "#3C6E9B",
    because: "Found in Music Search",
  };
}
