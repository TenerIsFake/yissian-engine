"""
Real homelab tool calls for Gemini chat.
Each function queries actual service APIs and returns a summary string.
"""
import os
import requests as http_requests

DOCKER_MONITOR_URL = os.environ.get('DOCKER_MONITOR_URL', 'http://docker-monitor:5803')
GLANCES_SRV1_URL = 'http://glances:61208'
GLANCES_SRV2_URL = 'http://10.0.0.155:61208'
GLUETUN_URL = 'http://gluetun:8000'
RESTIC_SIDECAR_URL = 'http://restic-sidecar:5802'

RADARR_URL = os.environ.get("RADARR_URL", "http://radarr:7878")
RADARR_API_KEY = os.environ.get("RADARR_API_KEY", "")
SONARR_URL = os.environ.get("SONARR_URL", "http://sonarr:8989")
SONARR_API_KEY = os.environ.get("SONARR_API_KEY", "")
PLEX_URL = os.environ.get("PLEX_URL", "http://10.0.0.195:32400")
PLEX_TOKEN = os.environ.get("PLEX_TOKEN", "")
OVERSEERR_URL = os.environ.get("OVERSEERR_URL", "http://10.0.0.155:5055")
OVERSEERR_API_KEY = os.environ.get("OVERSEERR_API_KEY", os.environ.get("SEERR_API_KEY", ""))
TAUTULLI_URL = os.environ.get("TAUTULLI_URL", "http://tautulli:8181")
TAUTULLI_API_KEY = os.environ.get("TAUTULLI_API_KEY", "")

TIMEOUT = 5


def search_movies(title: str) -> str:
    """Search the Radarr movie library for a title. Returns matching movies with quality and file info."""
    if not RADARR_API_KEY:
        return "Radarr API key not configured."
    try:
        r = http_requests.get(
            f"{RADARR_URL}/api/v3/movie",
            params={"apikey": RADARR_API_KEY},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        movies = r.json()
        matches = [m for m in movies if title.lower() in m.get('title', '').lower()]
        if not matches:
            return f"No movies matching '{title}' found in the library."
        results = []
        for m in matches[:5]:
            has_file = m.get('hasFile', False)
            quality = m.get('movieFile', {}).get('quality', {}).get('quality', {}).get('name', 'Unknown') if has_file else 'Not downloaded'
            size_gb = round(m.get('movieFile', {}).get('size', 0) / 1e9, 1) if has_file else 0
            results.append(
                f"- {m['title']} ({m.get('year', '?')}) | Quality: {quality} | Size: {size_gb}GB | "
                f"Rating: {m.get('ratings', {}).get('imdb', {}).get('value', '?')}/10 | "
                f"{'Available' if has_file else 'Missing file'}"
            )
        return f"Found {len(matches)} movie(s):\n" + "\n".join(results)
    except Exception as e:
        return f"Radarr query failed: {e}"


def search_shows(title: str) -> str:
    """Search the Sonarr TV library for a series. Returns matching shows with episode counts."""
    if not SONARR_API_KEY:
        return "Sonarr API key not configured."
    try:
        r = http_requests.get(
            f"{SONARR_URL}/api/v3/series",
            params={"apikey": SONARR_API_KEY},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        shows = r.json()
        matches = [s for s in shows if title.lower() in s.get('title', '').lower()]
        if not matches:
            return f"No TV shows matching '{title}' found in the library."
        results = []
        for s in matches[:5]:
            ep_have = s.get('statistics', {}).get('episodeFileCount', 0)
            ep_total = s.get('statistics', {}).get('totalEpisodeCount', 0)
            size_gb = round(s.get('statistics', {}).get('sizeOnDisk', 0) / 1e9, 1)
            results.append(
                f"- {s['title']} ({s.get('year', '?')}) | Episodes: {ep_have}/{ep_total} | "
                f"Size: {size_gb}GB | Status: {s.get('status', '?')}"
            )
        return f"Found {len(matches)} show(s):\n" + "\n".join(results)
    except Exception as e:
        return f"Sonarr query failed: {e}"


def get_plex_sessions() -> str:
    """Check what is currently playing on Plex. Returns active streams with users and titles."""
    if not PLEX_TOKEN:
        return "Plex token not configured."
    try:
        r = http_requests.get(
            f"{PLEX_URL}/status/sessions",
            headers={"X-Plex-Token": PLEX_TOKEN, "Accept": "application/json"},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        data = r.json()
        sessions = data.get('MediaContainer', {}).get('Metadata', [])
        if not sessions:
            return "Nothing is currently playing on Plex."
        results = []
        for s in sessions:
            user = s.get('User', {}).get('title', 'Unknown')
            title = s.get('title', 'Unknown')
            player = s.get('Player', {}).get('product', '?')
            state = s.get('Player', {}).get('state', '?')
            decision = s.get('TranscodeSession', {}).get('videoDecision', 'direct play') if s.get('TranscodeSession') else 'direct play'
            results.append(f"- {user} watching '{title}' on {player} ({state}, {decision})")
        return f"{len(sessions)} active stream(s):\n" + "\n".join(results)
    except Exception as e:
        return f"Plex query failed: {e}"


def get_library_stats() -> str:
    """Get overall Plex library statistics — total movies, shows, and music albums."""
    if not PLEX_TOKEN:
        return "Plex token not configured."
    try:
        r = http_requests.get(
            f"{PLEX_URL}/library/sections",
            headers={"X-Plex-Token": PLEX_TOKEN, "Accept": "application/json"},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        sections = r.json().get('MediaContainer', {}).get('Directory', [])
        results = []
        for sec in sections:
            title = sec.get('title', '?')
            count = sec.get('count', 0) if 'count' in sec else '?'
            stype = sec.get('type', '?')
            results.append(f"- {title}: {count} items ({stype})")
        return "Library sections:\n" + "\n".join(results) if results else "No library sections found."
    except Exception as e:
        return f"Plex library query failed: {e}"


def request_media(title: str, media_type: str = "movie") -> str:
    """Search Overseerr for a movie or TV show and describe what's available to request."""
    if not OVERSEERR_API_KEY:
        return "Overseerr API key not configured."
    try:
        r = http_requests.get(
            f"{OVERSEERR_URL}/api/v1/search",
            params={"query": title, "page": 1, "language": "en"},
            headers={"X-Api-Key": OVERSEERR_API_KEY},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        results_data = r.json().get('results', [])
        if not results_data:
            return f"No results found for '{title}' on Overseerr."
        results = []
        for item in results_data[:5]:
            name = item.get('title') or item.get('name', '?')
            year = (item.get('releaseDate') or item.get('firstAirDate', ''))[:4]
            mtype = item.get('mediaType', '?')
            status = item.get('mediaInfo', {}).get('status', 0) if item.get('mediaInfo') else 0
            status_label = {1: 'Unknown', 2: 'Pending', 3: 'Processing', 4: 'Partially Available', 5: 'Available'}.get(status, 'Not Requested')
            results.append(f"- {name} ({year}) [{mtype}] — {status_label}")
        return f"Overseerr results for '{title}':\n" + "\n".join(results)
    except Exception as e:
        return f"Overseerr query failed: {e}"


def get_watch_history(count: int = 10) -> str:
    """Get recent watch history from Tautulli — what was watched recently and by whom."""
    if not TAUTULLI_API_KEY:
        return "Tautulli API key not configured."
    try:
        r = http_requests.get(
            f"{TAUTULLI_URL}/api/v2",
            params={"apikey": TAUTULLI_API_KEY, "cmd": "get_history", "length": min(count, 25)},
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        data = r.json().get('response', {}).get('data', {}).get('data', [])
        if not data:
            return "No recent watch history found."
        results = []
        for item in data[:count]:
            user = item.get('friendly_name', '?')
            title = item.get('full_title', '?')
            duration = round(item.get('duration', 0) / 60)
            results.append(f"- {user}: '{title}' ({duration}min)")
        return f"Recent watch history ({len(data)} entries):\n" + "\n".join(results)
    except Exception as e:
        return f"Tautulli query failed: {e}"


def get_download_queue() -> str:
    """Check active downloads in Radarr and Sonarr queues."""
    results = []
    for name, url, key in [("Radarr", RADARR_URL, RADARR_API_KEY), ("Sonarr", SONARR_URL, SONARR_API_KEY)]:
        if not key:
            continue
        try:
            r = http_requests.get(
                f"{url}/api/v3/queue",
                params={"apikey": key, "pageSize": 10},
                timeout=TIMEOUT,
            )
            r.raise_for_status()
            records = r.json().get('records', [])
            for item in records[:5]:
                title = item.get('title', '?')
                status = item.get('status', '?')
                sizeleft = round(item.get('sizeleft', 0) / 1e9, 2)
                results.append(f"- [{name}] {title} — {status} ({sizeleft}GB remaining)")
        except Exception:
            results.append(f"- [{name}] Queue check failed")
    return "\n".join(results) if results else "No active downloads in either queue."


def view_container_logs(name: str, lines: int = 50) -> str:
    """View recent Docker container logs for debugging."""
    lines = min(lines, 200)
    try:
        r = http_requests.get(f'{DOCKER_MONITOR_URL}/api/docker/logs/{name}',
            params={'lines': lines}, timeout=10)
        if r.status_code == 403:
            return f"Cannot view logs for '{name}' — infrastructure container."
        r.raise_for_status()
        entries = r.json().get('lines', [])
        if not entries:
            return f"No recent logs for '{name}'."
        log_text = '\n'.join(f"[{e['timestamp'][:19]}] {e['message']}" for e in entries[-lines:])
        return f"Last {len(entries)} log lines for {name}:\n{log_text}"
    except Exception as e:
        return f"Failed to fetch logs for '{name}': {e}"


def restart_service(name: str) -> str:
    """Restart a Docker container. The user MUST confirm before this runs."""
    try:
        r = http_requests.post(f'{DOCKER_MONITOR_URL}/api/docker/restart/{name}', timeout=15)
        if r.status_code == 403:
            return f"Cannot restart '{name}' — it's on the denylist (infrastructure container)."
        r.raise_for_status()
        return f"Successfully restarted '{name}'. It may take a few seconds to come back up."
    except Exception as e:
        return f"Failed to restart '{name}': {e}"


def get_vpn_status() -> str:
    """Get VPN tunnel status, public IP, forwarded port."""
    results = []
    try:
        ip = http_requests.get(f'{GLUETUN_URL}/v1/publicip/ip', timeout=5).json()
        results.append(f"Public IP: {ip.get('public_ip', '?')} ({ip.get('country', '?')})")
    except Exception:
        results.append("Public IP: unavailable")
    try:
        port = http_requests.get(f'{GLUETUN_URL}/v1/openvpn/portforwarded', timeout=5).json()
        results.append(f"Forwarded port: {port.get('port', '?')}")
    except Exception:
        results.append("Forwarded port: unavailable")
    try:
        status = http_requests.get(f'{GLUETUN_URL}/v1/openvpn/status', timeout=5).json()
        results.append(f"VPN status: {status.get('status', '?')}")
    except Exception:
        results.append("VPN status: unavailable")
    return "VPN Status Report:\n" + "\n".join(results)


def run_speedtest() -> str:
    """Read latest speedtest results from cache."""
    import json as _json
    try:
        with open('/config/homepage-audit/speedtest.json', 'r') as f:
            data = _json.load(f)
        if isinstance(data, list) and data:
            latest = data[-1]
            return (f"Latest speedtest ({latest.get('timestamp', '?')}):\n"
                    f"Download: {latest.get('download', '?')} Mbps\n"
                    f"Upload: {latest.get('upload', '?')} Mbps\n"
                    f"Ping: {latest.get('ping', '?')} ms\n"
                    f"Server: {latest.get('server', '?')}")
        return "No speedtest data available."
    except Exception as e:
        return f"Speedtest data unavailable: {e}"


def get_backup_status() -> str:
    """Get backup health — restic snapshots and status."""
    try:
        r = http_requests.get('http://flask-backend:5000/api/backup/panorama', timeout=10)
        if r.status_code == 200:
            d = r.json()
            parts = []
            if 'restic_srv1' in d:
                rs = d['restic_srv1']
                parts.append(f"Restic SRV-1: {rs.get('status','?')} | Last: {rs.get('last_backup','?')} | Snapshots: {rs.get('snapshot_count','?')}")
            if 'syncthing' in d:
                sy = d['syncthing']
                parts.append(f"Syncthing: {sy.get('state','?')} | Peers: {sy.get('connected_peers','?')} | Need: {sy.get('need_files',0)} files")
            if 'docker_volumes' in d:
                dv = d['docker_volumes']
                parts.append(f"Volume Backups: {dv.get('status','?')} | Last: {dv.get('last_backup','?')} | Files: {dv.get('file_count',0)}")
            return "Backup Status:\n" + "\n".join(parts)
        raise Exception(f"HTTP {r.status_code}")
    except Exception:
        try:
            r = http_requests.get(f'{RESTIC_SIDECAR_URL}/api/backup/status', timeout=8)
            d = r.json()
            return f"Restic SRV-1: Last backup {d.get('last_backup_time','?')} | Snapshots: {d.get('snapshot_count','?')}"
        except Exception as e:
            return f"Backup status unavailable: {e}"


def get_system_metrics() -> str:
    """Get CPU, RAM, disk for both servers via Glances."""
    results = []
    for label, url in [('SRV-1', GLANCES_SRV1_URL), ('SRV-2', GLANCES_SRV2_URL)]:
        try:
            cpu = http_requests.get(f'{url}/api/4/cpu', timeout=5).json()
            mem = http_requests.get(f'{url}/api/4/mem', timeout=5).json()
            fs = http_requests.get(f'{url}/api/4/fs', timeout=5).json()
            cpu_pct = cpu.get('total', '?')
            mem_pct = mem.get('percent', '?')
            disks = ', '.join(f"{d.get('mnt_point','?')}: {d.get('percent','?')}%" for d in fs[:6])
            results.append(f"{label}: CPU {cpu_pct}% | RAM {mem_pct}% | Disks: {disks}")
        except Exception:
            results.append(f"{label}: unreachable")
    return "System Metrics:\n" + "\n".join(results)


# Gemini tool declarations — these are the function objects Gemini can call
TOOL_FUNCTIONS = {
    'search_movies': search_movies,
    'search_shows': search_shows,
    'get_plex_sessions': get_plex_sessions,
    'get_library_stats': get_library_stats,
    'request_media': request_media,
    'get_watch_history': get_watch_history,
    'get_download_queue': get_download_queue,
    'view_container_logs': view_container_logs,
    'restart_service': restart_service,
    'get_vpn_status': get_vpn_status,
    'run_speedtest': run_speedtest,
    'get_backup_status': get_backup_status,
    'get_system_metrics': get_system_metrics,
}

# List of callable functions for Gemini tools parameter
TOOL_LIST = [
    search_movies,
    search_shows,
    get_plex_sessions,
    get_library_stats,
    request_media,
    get_watch_history,
    get_download_queue,
    view_container_logs,
    restart_service,
    get_vpn_status,
    run_speedtest,
    get_backup_status,
    get_system_metrics,
]
