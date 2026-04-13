"""
Dynamic homelab context builder for Gemini chat.
Queries live service state and returns a formatted context string
injected into the system instruction so Gemini has real-time awareness
without needing tool calls for basic state questions.

Cached for 60 seconds to avoid API spam on every chat message.
"""
import os
import time
import threading
from datetime import datetime

import requests as http_requests

from tools import (
    get_plex_sessions,
    get_library_stats,
    get_download_queue,
    get_watch_history,
    RADARR_URL, RADARR_API_KEY,
    SONARR_URL, SONARR_API_KEY,
)

UPTIME_KUMA_BASE = os.environ.get("UPTIME_KUMA_BASE", "http://10.0.0.155:3001")
UPTIME_KUMA_SLUG = os.environ.get("UPTIME_KUMA_SLUG", "default")
TIMEOUT = 4

_cache = {"text": "", "expires": 0}
_lock = threading.Lock()
CACHE_TTL = 60  # seconds


def _get_library_counts():
    """Get total movie and show counts from Radarr/Sonarr."""
    counts = {}
    if RADARR_API_KEY:
        try:
            r = http_requests.get(
                f"{RADARR_URL}/api/v3/movie",
                params={"apikey": RADARR_API_KEY},
                timeout=TIMEOUT,
            )
            r.raise_for_status()
            movies = r.json()
            total = len(movies)
            on_disk = sum(1 for m in movies if m.get('hasFile'))
            counts['movies'] = f"{on_disk} on disk / {total} monitored"
        except Exception:
            counts['movies'] = "unavailable"

    if SONARR_API_KEY:
        try:
            r = http_requests.get(
                f"{SONARR_URL}/api/v3/series",
                params={"apikey": SONARR_API_KEY},
                timeout=TIMEOUT,
            )
            r.raise_for_status()
            shows = r.json()
            total = len(shows)
            episodes = sum(s.get('statistics', {}).get('episodeFileCount', 0) for s in shows)
            counts['shows'] = f"{total} series, {episodes} episodes on disk"
        except Exception:
            counts['shows'] = "unavailable"

    return counts


def _get_uptime_summary():
    """Get service health summary from Uptime Kuma public status page.

    Uses two API calls (same pattern as server.py):
    1. /api/status-page/<slug> — config with monitor names (publicGroupList)
    2. /api/status-page/heartbeat/<slug> — latest heartbeats per monitor ID
    """
    try:
        # Step 1: Get monitor names from config
        name_map = {}
        try:
            r = http_requests.get(
                f"{UPTIME_KUMA_BASE}/api/status-page/{UPTIME_KUMA_SLUG}",
                timeout=TIMEOUT,
            )
            if r.ok:
                config = r.json()
                for group in config.get('publicGroupList', []):
                    for mon in group.get('monitorList', []):
                        name_map[str(mon.get('id', ''))] = mon.get('name', f"Monitor {mon.get('id')}")
        except Exception:
            pass

        # Step 2: Get heartbeats
        r = http_requests.get(
            f"{UPTIME_KUMA_BASE}/api/status-page/heartbeat/{UPTIME_KUMA_SLUG}",
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        heartbeats = data.get('heartbeatList', {})

        if not heartbeats:
            return "No monitors found on status page"

        up = 0
        down = 0
        names_down = []
        for monitor_id, beats in heartbeats.items():
            if beats:
                latest = beats[-1]
                if latest.get('status') == 1:
                    up += 1
                else:
                    down += 1
                    name = name_map.get(str(monitor_id), f'Monitor {monitor_id}')
                    names_down.append(name)

        summary = f"{up}/{up + down} services up"
        if down:
            summary += f", {down} DOWN: {', '.join(names_down)}"
        else:
            summary += ", all healthy"
        return summary
    except Exception:
        return "Uptime Kuma unavailable"


def _build_context():
    """Query all services and build a context string."""
    sections = []

    # Current time
    now = datetime.now()
    sections.append(
        f"Current time: {now.strftime('%Y-%m-%d %H:%M')} ({now.strftime('%A')})"
    )

    # Service health
    uptime = _get_uptime_summary()
    sections.append(f"Service health: {uptime}")

    # Library counts
    counts = _get_library_counts()
    if counts:
        lib_lines = []
        if 'movies' in counts:
            lib_lines.append(f"  Movies: {counts['movies']}")
        if 'shows' in counts:
            lib_lines.append(f"  TV: {counts['shows']}")
        sections.append("Library:\n" + "\n".join(lib_lines))

    # Plex sessions
    sessions = get_plex_sessions()
    sections.append(f"Plex: {sessions}")

    # Download queue
    queue = get_download_queue()
    sections.append(f"Downloads: {queue}")

    # Recent history (last 5)
    history = get_watch_history(5)
    sections.append(f"Recent watches: {history}")

    return "\n\n".join(sections)


def get_homelab_context():
    """Get cached homelab context string. Refreshes every CACHE_TTL seconds."""
    now = time.time()
    with _lock:
        if now < _cache["expires"] and _cache["text"]:
            return _cache["text"]

    # Build outside the lock to avoid blocking concurrent requests
    text = _build_context()

    with _lock:
        _cache["text"] = text
        _cache["expires"] = time.time() + CACHE_TTL

    return text
