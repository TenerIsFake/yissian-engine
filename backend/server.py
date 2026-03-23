from flask import Flask, request, jsonify, Response
from google import genai
from google.genai import types
import os
import sys
import json
import re
import time
import requests as http_requests
from datetime import date, datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

JOURNAL_PATH = '/tmp/lab-journal.jsonl'
JOURNAL_MAX_LINES = 2000
JOURNAL_TRIM_AT = 2500

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY environment variable not set. Exiting.", flush=True)
    sys.exit(1)

TAUTULLI_URL = os.environ.get("TAUTULLI_URL", "http://tautulli:8181")
# NH-28: Overseerr is on SRV-2 (10.0.0.155) — use IP, not Docker hostname
OVERSEERR_URL = os.environ.get("OVERSEERR_URL", "http://10.0.0.155:5055")
OVERSEERR_API_KEY = os.environ.get("OVERSEERR_API_KEY", os.environ.get("SEERR_API_KEY", ""))
RADARR_URL = os.environ.get("RADARR_URL", "http://radarr:7878")
RADARR_API_KEY = os.environ.get("RADARR_API_KEY", "")
SONARR_URL = os.environ.get("SONARR_URL", "http://sonarr:8989")
SONARR_API_KEY = os.environ.get("SONARR_API_KEY", "")
PLEX_URL = os.environ.get("PLEX_URL", "http://10.0.0.195:32400")
PLEX_TOKEN = os.environ.get("PLEX_TOKEN", "")
# NH-30 / NH-38: SRV-2 services (not in SRV-1 Docker network — use IP)
NTFY_BASE = os.environ.get("NTFY_BASE", "http://10.0.0.155:8840")
UPTIME_KUMA_BASE = os.environ.get("UPTIME_KUMA_BASE", "http://10.0.0.155:3001")
# NH-37: Cloudflare Tunnel health
CF_API_TOKEN = os.environ.get("CF_API_TOKEN")
CF_ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID")
CF_TUNNEL_ID = os.environ.get("CF_TUNNEL_ID")
CF_BASE = "https://api.cloudflare.com/client/v4"
TAUTULLI_API_KEY = os.environ.get("TAUTULLI_API_KEY", "")
BAZARR_URL = os.environ.get("BAZARR_URL", "http://bazarr:6767")
BAZARR_API_KEY = os.environ.get("BAZARR_API_KEY", "")

client = genai.Client(api_key=api_key)

# --- GEMINI CHAT LOGIC ---

def analyze_media(title: str) -> str:
    """Use this function to check the library for a movie or show and retrieve its metadata and technical details."""
    print(f"*** SYSTEM LOG: Analyzing library for {title} ***")
    return f"Library Data for {title}: Available in 4K resolution, Dolby Vision HDR, DTS:X audio track. Watch count: 2."

PERSONAS = {
    "media_assistant": "You are the Jenkins Media Assistant. Help users navigate the server library. Use the analyze_media tool. Be brief and helpful.",
    "mixologist": "You are a virtual bartender. When a user asks about a movie in the library, suggest a thematic cocktail pairing and explain why it fits.",
    "film_snob": "You are a pretentious film critic. Use analyze_media to check their library. Begrudgingly admit high-end tech specs are 'acceptable', but complain about the cinematography.",
    "it_admin": "You are the grumpy sysadmin. Focus on technical specs. Warn the user not to transcode 4K and use terrible IT dad jokes.",
    "trivia_master": "You are a game-show host. Give a piece of behind-the-scenes trivia about the requested title and quiz the user.",
    "kids_mode": "You are Captain Jenkins, a pirate guide. Focus on family-friendly movies. Suggest snacks. Speak lightly in pirate slang.",
    "binge_watcher": "You are a hyperactive couch potato who hasn't slept. Always try to upsell the user into watching back-to-back movies.",
    "nostradamus": "You are Nostradamus. Use the analyze_media tool to peer into the library. Speak in cryptic, prophetic, and slightly ominous quatrains.",
    "sun_tzu": "You are Sun Tzu. Use the analyze_media tool. Treat watching the movie as a strategic military campaign.",
    "socrates": "You are Socrates. Use the analyze_media tool to check the library. Use the Socratic method. Ask profound, probing questions about why they desire to watch this film.",
    "plato": "You are Plato. Use the analyze_media tool. Refer frequently to the Allegory of the Cave.",
    "nietzsche": "You are Friedrich Nietzsche. Use the analyze_media tool. Speak of the Übermensch, the will to power, and the abyss.",
    "galileo": "You are Galileo Galilei. Use the analyze_media tool. Marvel at the technology of the server like celestial bodies.",
    "mark_twain": "You are Mark Twain. Use the analyze_media tool. Speak with a folksy, sharp, Midwestern wit.",
    "steinbeck": "You are John Steinbeck. Use the analyze_media tool. Describe the movie's plot through the lens of the working class and human struggle.",
    "hemingway": "You are Ernest Hemingway. Use the analyze_media tool. Write only in short, punchy sentences. Omit needless words."
}

@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')[:4096]
    frontend_history = data.get('history', [])[:20]
    persona_key = data.get('persona', 'media_assistant')
    
    current_instruction = PERSONAS.get(persona_key, PERSONAS["media_assistant"])

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    gemini_history = []
    for msg in frontend_history:
        role = 'model' if msg['role'] == 'bot' else 'user'
        gemini_history.append(
            types.Content(role=role, parts=[types.Part(text=msg['text'])])
        )

    try:
        chat_session = client.chats.create(
            model='gemini-2.0-flash-001',
            config=types.GenerateContentConfig(
                system_instruction=current_instruction,
                tools=[analyze_media],
            ),
            history=gemini_history,
        )

        response = chat_session.send_message(user_message)
        return jsonify({"response": response.text})

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({"error": "Failed to connect to Gemini"}), 500


# --- STOCK WIDGET LOGIC ---

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    import concurrent.futures
    import yfinance as yf
    def _fetch():
        tickers = yf.Tickers('AAPL MSFT GOOGL TSLA')
        data = []
        for symbol, ticker in tickers.tickers.items():
            current = ticker.fast_info['last_price']
            prev = ticker.fast_info['previous_close']
            change = ((current - prev) / prev) * 100
            data.append({"ticker": symbol, "price": round(current, 2), "change": round(change, 2)})
        return data
    try:
        with concurrent.futures.ThreadPoolExecutor() as ex:
            future = ex.submit(_fetch)
            data = future.result(timeout=15)
        return jsonify(data)
    except concurrent.futures.TimeoutError:
        return jsonify({'error': 'timeout'}), 504
    except Exception as e:
        print(f"YFinance error (falling back to mock data): {e}")
        return jsonify([
            {"ticker": "AAPL", "price": 173.50, "change": 1.25},
            {"ticker": "MSFT", "price": 418.22, "change": -0.50},
            {"ticker": "GOOGL", "price": 142.65, "change": 0.85},
            {"ticker": "TSLA", "price": 175.34, "change": -2.10}
        ])

def _is_stale(generated_at_str, threshold_minutes=15):
    """Return True if generated_at is absent or older than threshold_minutes."""
    if not generated_at_str:
        return True
    try:
        generated_at = datetime.fromisoformat(generated_at_str.replace('Z', '+00:00'))
        age = datetime.now(generated_at.tzinfo) - generated_at
        return age.total_seconds() > threshold_minutes * 60
    except Exception:
        return True


@app.route('/api/port-audit')
def port_audit():
    try:
        with open('/tmp/port-audit.json') as f:
            data = json.load(f)
        ports = data.get('ports', [])
        if not isinstance(ports, list):
            return jsonify({'error': 'invalid data'}), 503
        return jsonify({'ports': ports[:200], 'ts': data.get('ts'),
                        'stale': _is_stale(data.get('generated_at'))})
    except Exception as e:
        app.logger.error('port_audit error: %s', e)
        return jsonify({'error': 'unavailable'}), 503


@app.route('/api/ufw-status')
def ufw_status():
    try:
        with open('/tmp/ufw-status.json') as f:
            data = json.load(f)
        return jsonify({'status': data.get('status'), 'ts': data.get('ts'),
                        'stale': _is_stale(data.get('generated_at'))})
    except Exception as e:
        app.logger.error('ufw_status error: %s', e)
        return jsonify({'error': 'unavailable'}), 503


@app.route('/api/key-audit')
def key_audit():
    try:
        audit_path = os.path.join(os.path.dirname(__file__), '.env.audit')
        stale_count = 0
        expired_count = 0
        total = 0
        with open(audit_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    _, v = line.split('=', 1)
                    days_old = (date.today() - date.fromisoformat(v.strip())).days
                    total += 1
                    if days_old > 365:
                        expired_count += 1
                    elif days_old > 180:
                        stale_count += 1
        return jsonify({'total': total, 'stale': stale_count, 'expired': expired_count})
    except Exception as e:
        app.logger.error('key_audit error: %s', e)
        return jsonify({'error': 'unavailable'}), 503


@app.route('/api/journal', methods=['POST'])
def journal_write():
    data = request.get_json(silent=True) or {}
    entry = {
        'ts': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
        'service': str(data.get('service', 'UNKNOWN'))[:64],
        'message': str(data.get('message', ''))[:512],
        'type': data.get('type', 'info') if data.get('type') in ('success', 'error', 'warn', 'info') else 'info',
    }
    print(f"[JOURNAL] {entry['ts']} [{entry['type'].upper():7}] {entry['service']}: {entry['message']}", flush=True)
    with open(JOURNAL_PATH, 'a') as f:
        f.write(json.dumps(entry) + '\n')
    with open(JOURNAL_PATH) as f:
        lines = f.readlines()
    if len(lines) > JOURNAL_TRIM_AT:
        with open(JOURNAL_PATH, 'w') as f:
            f.writelines(lines[-JOURNAL_MAX_LINES:])
    return jsonify({'ok': True})


@app.route('/api/vpn-status')
def vpn_status():
    # Signal 1: Is Gluetun's API reachable from within Docker's internal network?
    # Uses the same unauthenticated endpoint the browser previously called, but now
    # the call stays server-side — never touches an external service, never hits nginx
    # access logs from the browser. API responding with 200 means the container is up
    # and the VPN tunnel is initialised; we do NOT gate on public_ip content so that
    # a failed IP-lookup doesn't falsely report the tunnel as down.
    api_up = False
    try:
        r = http_requests.get('http://gluetun:8000/v1/publicip/ip', timeout=3)
        api_up = (r.status_code == 200)
    except Exception:
        pass

    # Signal 2: Forwarded port file written by Gluetun on every connect/reconnect.
    # Gluetun rewrites this file each time port-forwarding is (re-)established, so its
    # presence (and a valid port number) confirms active port forwarding.
    forwarded_port = None
    try:
        with open('/tmp/gluetun/forwarded_port') as f:
            val = int(f.read().strip())
            if 1024 <= val <= 65535:
                forwarded_port = val
    except Exception:
        pass

    return jsonify({'online': api_up, 'forwarded_port': forwarded_port})


# ── DF-05: DNS Leak Test ──────────────────────────────────────────────────────
_leak_cache: dict = {'ts': 0.0, 'result': None}
_LEAK_CACHE_TTL = 1800  # 30 minutes


def _run_leak_test() -> dict:
    """Check whether qBittorrent's traffic exits via ProtonVPN.

    Uses Gluetun's internal API (http://gluetun:8000) — same network as flask-backend —
    to get the actual public IP that qBittorrent traffic uses.  Fails only when that IP
    is NOT owned by ProtonVPN (AS212473), meaning qBittorrent would be reachable outside
    the VPN tunnel.
    """
    try:
        # Step 1: Ask Gluetun for the current VPN exit IP (qBittorrent's outgoing IP).
        # Gluetun is on media_net so this call never leaves the Docker network.
        try:
            gluetun_resp = http_requests.get('http://gluetun:8000/v1/publicip/ip', timeout=5)
            gluetun_resp.raise_for_status()
            gluetun_data = gluetun_resp.json()
            # Gluetun returns {"public_ip": "x.x.x.x", ...}
            outgoing_ip = gluetun_data.get('public_ip', '')
            gluetun_up = bool(outgoing_ip)
        except Exception:
            # Gluetun unreachable → VPN tunnel is down → qBittorrent is unprotected
            return {
                'passed': False,
                'outgoing_ip': None,
                'outgoing_asn': None,
                'outgoing_isp': None,
                'resolvers': [],
                'gluetun_up': False,
                'checked_at': datetime.utcnow().isoformat() + 'Z',
                'cached': False,
            }

        # Step 2: Verify the exit IP belongs to ProtonVPN (AS212473).
        ipinfo = http_requests.get(f'https://ipinfo.io/{outgoing_ip}/json', timeout=8).json()
        outgoing_asn = ipinfo.get('org', '')   # e.g. "AS212473 ProtonVPN AG"

        passed = 'AS212473' in outgoing_asn

        return {
            'passed': passed,
            'outgoing_ip': outgoing_ip,
            'outgoing_asn': outgoing_asn,
            'outgoing_isp': outgoing_asn,
            'resolvers': [],
            'gluetun_up': gluetun_up,
            'checked_at': datetime.utcnow().isoformat() + 'Z',
            'cached': False,
        }
    except Exception as e:
        return {'error': str(e), 'passed': False, 'checked_at': datetime.utcnow().isoformat() + 'Z', 'cached': False}


@app.route('/api/vpn/leaktest')
def vpn_leaktest():
    now = time.time()
    if _leak_cache['result'] and now - _leak_cache['ts'] < _LEAK_CACHE_TTL:
        result = dict(_leak_cache['result'])
        result['cached'] = True
        return jsonify(result)
    result = _run_leak_test()
    _leak_cache['ts'] = now
    _leak_cache['result'] = result
    return jsonify(result)


@app.route('/api/vpn/leaktest/refresh', methods=['POST'])
def vpn_leaktest_refresh():
    _leak_cache['ts'] = 0.0
    _leak_cache['result'] = None
    result = _run_leak_test()
    _leak_cache['ts'] = time.time()
    _leak_cache['result'] = result
    return jsonify(result)


@app.route('/api/journal', methods=['GET'])
def journal_read():
    try:
        limit = min(int(request.args.get('limit', 120)), 500)
    except (ValueError, TypeError):
        return jsonify({'error': 'limit must be a positive integer'}), 400
    try:
        with open(JOURNAL_PATH) as f:
            lines = [l.strip() for l in f if l.strip()]
        entries = []
        for line in reversed(lines[-limit:]):
            try:
                entries.append(json.loads(line))
            except Exception:
                pass
        return jsonify(entries)
    except FileNotFoundError:
        return jsonify([])


@app.route('/api/tautulli/sessions')
def tautulli_sessions():
    try:
        resp = http_requests.get(
            f"{TAUTULLI_URL}/api/v2",
            params={"apikey": TAUTULLI_API_KEY, "cmd": "get_activity"},
            timeout=8
        )
        resp.raise_for_status()
        data = resp.json()["response"]["data"]
        sessions = []
        for s in data.get("sessions", []):
            sessions.append({
                "title":                s.get("full_title"),
                "media_type":           s.get("media_type"),
                "grandparent_title":    s.get("grandparent_title"),
                "parent_media_index":   s.get("parent_media_index"),
                "media_index":          s.get("media_index"),
                "user":                 s.get("friendly_name"),
                "player":               s.get("player"),
                "progress_percent":     s.get("progress_percent"),
                "view_offset":          s.get("view_offset"),
                "duration":             s.get("duration"),
                "stream_video_decision": s.get("stream_video_decision"),
                "stream_audio_decision": s.get("stream_audio_decision"),
                "video_codec":          s.get("video_codec"),
                "audio_codec":          s.get("audio_codec"),
                "stream_video_codec":   s.get("stream_video_codec"),
                "stream_audio_codec":   s.get("stream_audio_codec"),
                "subtitle_decision":    s.get("stream_subtitle_decision"),
                "bitrate":              s.get("stream_bitrate"),
                "thumb":                s.get("thumb"),
                "grandparent_thumb":    s.get("grandparent_thumb"),
            })
        return jsonify({"sessions": sessions, "stream_count": data.get("stream_count", 0)})
    except Exception as e:
        return jsonify({"error": str(e), "sessions": [], "stream_count": 0}), 500


@app.route('/api/tautulli/thumb')
def tautulli_thumb():
    img = request.args.get("img", "")
    if not img or not img.startswith("/library/"):
        return "", 400
    try:
        resp = http_requests.get(
            f"{TAUTULLI_URL}/api/v2",
            params={"apikey": TAUTULLI_API_KEY, "cmd": "pms_image_proxy",
                    "img": img, "width": 80, "height": 120},
            timeout=8
        )
        resp.raise_for_status()
        return Response(resp.content, content_type=resp.headers.get("Content-Type", "image/jpeg"))
    except Exception as e:
        return jsonify({"error": str(e)}), 502


@app.route('/api/bazarr/health')
def bazarr_health():
    headers = {"X-API-KEY": BAZARR_API_KEY}
    try:
        movies_resp, episodes_resp, providers_resp = None, None, None
        try:
            movies_resp = http_requests.get(f"{BAZARR_URL}/api/movies?start=0&length=-1", headers=headers, timeout=8)
            movies_resp.raise_for_status()
        except Exception:
            pass
        try:
            episodes_resp = http_requests.get(f"{BAZARR_URL}/api/episodes?start=0&length=-1", headers=headers, timeout=8)
            episodes_resp.raise_for_status()
        except Exception:
            pass
        try:
            providers_resp = http_requests.get(f"{BAZARR_URL}/api/providers", headers=headers, timeout=8)
            providers_resp.raise_for_status()
        except Exception:
            pass

        def count_coverage(resp):
            if not resp:
                return {"total": 0, "with_subs": 0}
            data = resp.json()
            items = data.get("data", data) if isinstance(data, dict) else data
            if not isinstance(items, list):
                return {"total": 0, "with_subs": 0}
            total = len(items)
            with_subs = sum(1 for m in items if m.get("missing_subtitles") == [] or not m.get("missing_subtitles"))
            return {"total": total, "with_subs": with_subs}

        providers = []
        if providers_resp:
            raw = providers_resp.json()
            if isinstance(raw, dict):
                raw = raw.get("data", raw.get("providers", []))
            for p in (raw if isinstance(raw, list) else []):
                providers.append({
                    "name": p.get("name") or p.get("provider", ""),
                    "enabled": p.get("enabled", True),
                    "status": p.get("status", "ok"),
                    "last_error": str(p.get("last_error", "") or "")[:60] or None,
                })

        return jsonify({
            "movies":    count_coverage(movies_resp),
            "episodes":  count_coverage(episodes_resp),
            "providers": providers,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 502


# NH-30 — ntfy Notification Inbox
# Update KNOWN_TOPICS when new ntfy topics are created.
NTFY_KNOWN_TOPICS = os.environ.get("NTFY_TOPICS", "uptime-alerts,watchtower").split(",")
# SYN-P1-02 CF-03: regex + allowlist double guard (pentester) — prevents SSRF via topic param
_NTFY_TOPIC_RE = re.compile(r'^[a-zA-Z0-9_\-]{1,64}$')

@app.route('/api/ntfy/messages')
def ntfy_messages():
    topic = request.args.get('topic', '').strip()
    try:
        page = max(1, int(request.args.get('page', 1)))
        limit = min(100, max(1, int(request.args.get('limit', 20))))
    except (ValueError, TypeError):
        return jsonify({'error': 'invalid pagination params'}), 400

    if topic and topic != 'all':
        if not _NTFY_TOPIC_RE.match(topic):
            return jsonify({'error': 'invalid topic name'}), 400
        if topic not in NTFY_KNOWN_TOPICS:
            return jsonify({'error': 'unknown topic'}), 404
        topics_to_fetch = [topic]
    else:
        topics_to_fetch = list(NTFY_KNOWN_TOPICS)

    all_msgs = []
    for t in topics_to_fetch:
        try:
            r = http_requests.get(
                f"{NTFY_BASE}/{t.strip()}/json",
                params={"poll": "1", "since": "all"},
                timeout=8,
                stream=True
            )
            for line in r.iter_lines():
                if line:
                    msg = json.loads(line)
                    msg['_topic'] = t.strip()
                    all_msgs.append(msg)
        except Exception:
            pass  # topic may be empty or ntfy just started

    all_msgs.sort(key=lambda m: m.get('time', 0), reverse=True)
    total = len(all_msgs)
    start = (page - 1) * limit
    return jsonify({
        "messages": all_msgs[start:start + limit],
        "total": total,
        "page": page,
        "pages": max(1, -(-total // limit)),
        "topics": NTFY_KNOWN_TOPICS,
    })


# NH-38 — Uptime Kuma Incident Timeline
MONITOR_ALLOWLIST_PATH = os.path.expanduser("~/.config/homepage-audit/uptime-kuma-monitors.json")
UPTIME_KUMA_SLUG = os.environ.get("UPTIME_KUMA_SLUG", "default")
_uk_cache = {"data": None, "ts": 0}


def load_allowlist():
    # Monitor name casing must EXACTLY match Uptime Kuma monitor names.
    try:
        with open(MONITOR_ALLOWLIST_PATH) as f:
            return set(json.load(f))
    except Exception:
        return set()  # empty = show all monitors


@app.route('/api/uptime/history')
def uptime_history():
    now = time.time()
    if _uk_cache["data"] and now - _uk_cache["ts"] < 300:
        return jsonify(_uk_cache["data"])

    allowlist = load_allowlist()
    try:
        r = http_requests.get(
            f"{UPTIME_KUMA_BASE}/api/status-page/heartbeat/{UPTIME_KUMA_SLUG}",
            timeout=10
        )
        if r.status_code == 404:
            return jsonify({"error": "Status page not configured in Uptime Kuma"}), 404
        r.raise_for_status()
        payload = r.json()
    except Exception as e:
        return jsonify({"error": str(e)}), 503

    monitor_list = payload.get("monitorList", {})
    heartbeat_list = payload.get("heartbeatList", {})

    result = []
    for mid, monitor in monitor_list.items():
        name = monitor.get("name", "")
        if allowlist and name not in allowlist:
            continue
        beats = heartbeat_list.get(str(mid), [])
        beats_sorted = sorted(beats, key=lambda b: b.get("time", ""))
        timeline = [{"status": b.get("status"), "time": b.get("time"), "ping": b.get("ping")} for b in beats_sorted]
        up_count = sum(1 for b in beats if b.get("status") == 1)
        pct = round(up_count / len(beats) * 100, 1) if beats else None
        result.append({
            "id": mid,
            "name": name,
            "current_status": monitor.get("active"),
            "timeline": timeline,
            "uptime_7d_pct": pct,
            "has_incident": any(b.get("status") != 1 for b in beats),
        })

    result.sort(key=lambda m: (not m["has_incident"], m["name"]))
    _uk_cache["data"] = {"monitors": result, "fetched_at": int(now)}
    _uk_cache["ts"] = now
    return jsonify(_uk_cache["data"])


# NH-18 — Air Quality Index Widget (OpenAQ v3, Chicago)
from datetime import timezone as _tz, timedelta as _td
_LAT, _LON = 41.8781, -87.6298
_OPENAQ_KEY = os.environ.get("OPENAQ_API_KEY", "")
_aqi_cache = {"data": None, "ts": 0}

_PM25_BP = [(0,12.0,0,50,"Good"),(12.1,35.4,51,100,"Moderate"),(35.5,55.4,101,150,"Unhealthy for Sensitive Groups"),(55.5,150.4,151,200,"Unhealthy"),(150.5,250.4,201,300,"Very Unhealthy"),(250.5,500.4,301,500,"Hazardous")]
_PM10_BP = [(0,54,0,50,"Good"),(55,154,51,100,"Moderate"),(155,254,101,150,"Unhealthy for Sensitive Groups"),(255,354,151,200,"Unhealthy"),(355,424,201,300,"Very Unhealthy"),(425,604,301,500,"Hazardous")]

def _calc_aqi(value, breakpoints):
    for (c_lo, c_hi, i_lo, i_hi, label) in breakpoints:
        if c_lo <= value <= c_hi:
            return round((i_hi - i_lo) / (c_hi - c_lo) * (value - c_lo) + i_lo), label
    return None, "Unknown"

def _oaq_headers():
    return {"X-API-Key": _OPENAQ_KEY} if _OPENAQ_KEY else {}

def _fetch_sensor_latest(sensor_id, hours_back=4):
    """Fetch most recent measurement for a sensor via datetime window."""
    now_utc = datetime.now(_tz.utc)
    since = (now_utc - _td(hours=hours_back)).strftime('%Y-%m-%dT%H:%M:%SZ')
    r = http_requests.get(
        f"https://api.openaq.org/v3/sensors/{sensor_id}/measurements",
        params={"datetime_from": since, "limit": 1, "sort": "desc", "order_by": "datetime"},
        headers=_oaq_headers(), timeout=10
    )
    results = r.json().get("results", [])
    return results[0] if results else None

@app.route('/api/airquality')
def air_quality():
    now = time.time()
    if _aqi_cache["data"] and now - _aqi_cache["ts"] < 1800:
        return jsonify(_aqi_cache["data"])
    if not _OPENAQ_KEY:
        return jsonify({"error": "OPENAQ_API_KEY not configured"}), 503
    try:
        # Discover nearest stations for pm25, pm10, o3 (v3 max radius = 25000m)
        PARAM_IDS = {"pm25": 2, "pm10": 1, "o3": 10}
        sensor_map = {}  # param_name → {sensor_id, station_name, unit}
        for param, pid in PARAM_IDS.items():
            r = http_requests.get(
                "https://api.openaq.org/v3/locations",
                params={"coordinates": f"{_LAT},{_LON}", "radius": 25000, "limit": 5, "parameters_id": pid},
                headers=_oaq_headers(), timeout=10
            )
            try:
                payload = r.json()
            except Exception:
                continue
            if not isinstance(payload, dict):
                continue
            for loc in payload.get("results", []):
                for s in loc.get("sensors", []):
                    if s["parameter"]["name"] == param:
                        sensor_map[param] = {"sensor_id": s["id"], "station": loc["name"], "unit": s["parameter"]["units"]}
                        break
                if param in sensor_map:
                    break

        results = {}
        for param, info in sensor_map.items():
            try:
                m = _fetch_sensor_latest(info["sensor_id"])
                if m is None or m.get("value", -1) < 0:
                    results[param] = None
                    continue
                val = m["value"]
                last_updated = m.get("period", {}).get("datetimeTo", {}).get("local")
                if param == "pm25":
                    aqi, label = _calc_aqi(val, _PM25_BP)
                    results[param] = {"value": round(val, 1), "unit": info["unit"], "aqi": aqi, "category": label, "last_updated": last_updated, "station": info["station"]}
                elif param == "pm10":
                    aqi, label = _calc_aqi(val, _PM10_BP)
                    results[param] = {"value": round(val, 1), "unit": info["unit"], "aqi": aqi, "category": label, "last_updated": last_updated, "station": info["station"]}
                elif param == "o3":
                    ppb = round(val * 1000, 1) if "ppm" in info["unit"] else round(val, 1)
                    cat = "Good" if ppb <= 54 else "Moderate" if ppb <= 70 else "Unhealthy for Sensitive Groups" if ppb <= 85 else "Unhealthy" if ppb <= 105 else "Very Unhealthy"
                    results[param] = {"value": ppb, "unit": "ppb", "aqi": None, "category": cat, "last_updated": last_updated, "station": info["station"]}
            except Exception:
                results[param] = None

        _aqi_cache["data"] = results
        _aqi_cache["ts"] = now
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 503


# NH-37 — Cloudflare Tunnel Health Card (Ho/Z=67 upgrade)
def _cf_headers():
    return {"Authorization": f"Bearer {CF_API_TOKEN}", "Content-Type": "application/json"}

def _cf_not_configured():
    return not all([CF_API_TOKEN, CF_ACCOUNT_ID, CF_TUNNEL_ID])

@app.route('/api/cloudflare/tunnel')
def cf_tunnel():
    if _cf_not_configured():
        return jsonify({"error": "Cloudflare credentials not configured"}), 503
    try:
        r = http_requests.get(
            f"{CF_BASE}/accounts/{CF_ACCOUNT_ID}/cfd_tunnel/{CF_TUNNEL_ID}",
            headers=_cf_headers(), timeout=8
        )
        t = r.json().get("result", {})
        return jsonify({
            "name": t.get("name"),
            "status": t.get("status"),
            "connector_count": len(t.get("connections", [])),
            "created_at": t.get("created_at"),
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 503

@app.route('/api/cloudflare/tunnel/connections')
def cf_tunnel_connections():
    if _cf_not_configured():
        return jsonify({"error": "Cloudflare credentials not configured"}), 503
    try:
        r = http_requests.get(
            f"{CF_BASE}/accounts/{CF_ACCOUNT_ID}/cfd_tunnel/{CF_TUNNEL_ID}/connections",
            headers=_cf_headers(), timeout=8
        )
        conns = r.json().get("result", [])
        return jsonify({"connections": [
            {"colo": c.get("colo_name"), "origin_ip": c.get("origin_ip"), "opened_at": c.get("opened_at")}
            for c in conns
        ]})
    except Exception as e:
        return jsonify({"error": str(e)}), 503

@app.route('/api/cloudflare/tunnel/auth-events')
def cf_auth_events():
    if _cf_not_configured():
        return jsonify({"available": False, "reason": "Cloudflare credentials not configured"})
    try:
        r = http_requests.get(
            f"{CF_BASE}/accounts/{CF_ACCOUNT_ID}/access/logs/access-requests",
            headers=_cf_headers(), timeout=8,
            params={"limit": 1, "direction": "desc"}
        )
        if r.status_code in (403, 404):
            # Token lacks Access:AuditLogs:Read — graceful degradation, don't leak 403 body
            return jsonify({"available": False, "reason": "Auth logs require Access:AuditLogs:Read permission"})
        events = r.json().get("result", [])
        last = events[0] if events else None
        return jsonify({"available": True, "last_event": last})
    except Exception as e:
        return jsonify({"available": False, "reason": str(e)})


# NH-28 — Unified Media Pipeline
STAGE_ORDER = {"requested": 0, "downloading": 1, "completed": 2}

@app.route('/api/pipeline')
def pipeline():
    items = {}  # title → item (last-write-wins; higher stages overwrite lower)

    # 1. Overseerr pending requests (lowest stage)
    try:
        r = http_requests.get(f"{OVERSEERR_URL}/api/v1/request?filter=pending&take=20",
            headers={"X-Api-Key": OVERSEERR_API_KEY}, timeout=8)
        for req in r.json().get("results", []):
            title = req.get("media", {}).get("title") or req.get("media", {}).get("name", "Unknown")
            items[title] = {
                "title": title,
                "type": "Movie" if req.get("type") == "movie" else "TV",
                "stage": "requested",
                "stage_label": "Awaiting Approval",
                "overseerr_id": req.get("id"),
                "requested_by": req.get("requestedBy", {}).get("displayName"),
                "eta": None,
            }
    except Exception:
        pass

    # 2. Radarr queue
    try:
        r = http_requests.get(f"{RADARR_URL}/api/v3/queue",
            headers={"X-Api-Key": RADARR_API_KEY}, timeout=8)
        for item in r.json().get("records", []):
            title = item.get("title", "Unknown")
            items[title] = {
                "title": title, "type": "Movie", "stage": "downloading",
                "stage_label": "Downloading", "eta": item.get("estimatedCompletionTime"),
            }
    except Exception:
        pass

    # 3. Sonarr queue
    try:
        r = http_requests.get(f"{SONARR_URL}/api/v3/queue",
            headers={"X-Api-Key": SONARR_API_KEY}, timeout=8)
        for item in r.json().get("records", []):
            title = item.get("title", "Unknown")
            items[title] = {
                "title": title, "type": "TV", "stage": "downloading",
                "stage_label": "Downloading", "eta": item.get("estimatedCompletionTime"),
            }
    except Exception:
        pass

    # 4. Plex recently added last 24h (highest stage — overrides downloading)
    try:
        cutoff = time.time() - 86400
        r = http_requests.get(f"{PLEX_URL}/library/recentlyAdded",
            headers={"X-Plex-Token": PLEX_TOKEN, "Accept": "application/json"}, timeout=8)
        for item in r.json().get("MediaContainer", {}).get("Metadata", []):
            if item.get("addedAt", 0) > cutoff:
                title = item.get("title", "Unknown")
                items[title] = {
                    "title": title,
                    "type": "Movie" if item.get("type") == "movie" else "TV",
                    "stage": "completed", "stage_label": "Added to Plex", "eta": None,
                }
    except Exception:
        pass

    sorted_items = sorted(items.values(), key=lambda x: STAGE_ORDER.get(x["stage"], 99))
    return jsonify({"items": sorted_items})


@app.route('/api/overseerr/request/<int:req_id>/approve', methods=['POST'])
def overseerr_approve(req_id):
    try:
        r = http_requests.post(f"{OVERSEERR_URL}/api/v1/request/{req_id}/approve",
            headers={"X-Api-Key": OVERSEERR_API_KEY}, timeout=8)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 503


@app.route('/api/overseerr/request/<int:req_id>/decline', methods=['POST'])
def overseerr_decline(req_id):
    try:
        r = http_requests.post(f"{OVERSEERR_URL}/api/v1/request/{req_id}/decline",
            headers={"X-Api-Key": OVERSEERR_API_KEY}, timeout=8)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 503


# NH-31 — Tautulli Analytics
def _tautulli(cmd, **kwargs):
    params = {"apikey": TAUTULLI_API_KEY, "cmd": cmd, **kwargs}
    r = http_requests.get(f"{TAUTULLI_URL}/api/v2", params=params, timeout=10)
    return r.json().get("response", {}).get("data", {})

@app.route('/api/tautulli/analytics')
def tautulli_analytics():
    period = request.args.get("period", "week")
    time_range = 7 if period == "week" else 1
    try:
        plays_by_date = _tautulli("get_plays_by_date", time_range=time_range)
        home_stats = _tautulli("get_home_stats", time_range=time_range, stats_count=5)
        libraries = _tautulli("get_libraries_table")
        if not isinstance(home_stats, list):
            home_stats = []
        top_movies = next((s for s in home_stats if s.get("stat_id") == "top_movies"), {})
        top_tv     = next((s for s in home_stats if s.get("stat_id") == "top_tv"), {})
        top_users  = next((s for s in home_stats if s.get("stat_id") == "top_users"), {})
        lib_data = libraries.get("data", []) if isinstance(libraries, dict) else []
        return jsonify({
            "period": period,
            "plays_by_date": plays_by_date,
            "top_movies": top_movies.get("rows", [])[:5],
            "top_tv":     top_tv.get("rows", [])[:5],
            "top_users":  top_users.get("rows", [])[:5],
            "library_counts": [
                {"name": lib.get("section_name"), "count": lib.get("count"), "type": lib.get("section_type")}
                for lib in lib_data
            ],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 503


# NH-32 — Cron & Scheduled Task Monitor
from datetime import datetime as _dt
try:
    from croniter import croniter as _croniter
    _CRONITER_AVAILABLE = True
except ImportError:
    _CRONITER_AVAILABLE = False

_CRON_JOBS = [
    {"id": "backup",       "name": "backup.sh",      "cron": "0 3 * * *",   "log": "/home/tener/backup.log"},
    {"id": "port_audit",   "name": "port_audit.sh",  "cron": "*/5 * * * *", "mtime_path": "/home/tener/.config/homepage-audit/port-audit.json"},
    {"id": "ufw_status",   "name": "ufw_status.sh",  "cron": "*/5 * * * *", "mtime_path": "/home/tener/.config/homepage-audit/ufw-status.json"},
    {"id": "watchtower",   "name": "Watchtower",      "cron": "0 8 * * *",   "docker": "watchtower"},
    {"id": "port_updater", "name": "port-updater",   "cron": "*/5 * * * *", "docker": "port-updater"},
    {"id": "restic_check", "name": "restic check",   "cron": "0 4 * * 0",   "log": "/home/tener/.config/homepage-audit/restic-check.log"},
    {"id": "speedtest",    "name": "speedtest",      "cron": "0 */6 * * *", "log": "/home/tener/.config/homepage-audit/speedtest.log"},
]

def _next_run(cron_expr):
    if not _CRONITER_AVAILABLE:
        return None
    try:
        return _croniter(cron_expr, _dt.now()).get_next(_dt).isoformat()
    except Exception:
        return None

def _last_run_from_log(log_path):
    try:
        mtime = os.path.getmtime(log_path)
        import subprocess as _sp
        result = _sp.run(["tail", "-1", log_path], capture_output=True, text=True)
        return {"last_run": _dt.fromtimestamp(mtime).isoformat(), "last_line": result.stdout.strip()[:200]}
    except Exception:
        return {"last_run": None, "last_line": None}

def _last_run_from_mtime(path):
    try:
        return {"last_run": _dt.fromtimestamp(os.path.getmtime(path)).isoformat()}
    except Exception:
        return {"last_run": None}

@app.route('/api/cron/status')
def cron_status():
    results = []
    for job in _CRON_JOBS:
        item = {"id": job["id"], "name": job["name"], "cron": job["cron"],
                "next_run": _next_run(job["cron"])}
        if "log" in job:
            item.update(_last_run_from_log(job["log"]))
        elif "mtime_path" in job:
            item.update(_last_run_from_mtime(job["mtime_path"]))
        elif "docker" in job:
            try:
                r = http_requests.get("http://docker-monitor:5803/api/docker/containers", timeout=3)
                containers = r.json().get("containers", [])
                c = next((x for x in containers if x["name"] == job["docker"]), None)
                item["last_run"] = c.get("started_at") if c else None
                item["restart_count"] = c.get("restart_count", 0) if c else None
            except Exception:
                item["last_run"] = None
        results.append(item)
    return jsonify({"jobs": results})


# ── DF-08: FreshRSS Headlines ─────────────────────────────────────────────────
FRESHRSS_URL  = os.environ.get('FRESHRSS_URL', 'http://10.0.0.155:8082')
FRESHRSS_USER = os.environ.get('FRESHRSS_USER', '')
FRESHRSS_PASS = os.environ.get('FRESHRSS_PASSWORD', '')
_freshrss_sid: dict = {'token': None, 'ts': 0.0}
_freshrss_headlines_cache: dict = {'ts': 0.0, 'items': None}
_FRESHRSS_CACHE_TTL = 300  # 5 minutes


def _freshrss_auth() -> str | None:
    """Return a cached GReader SID token, re-authenticating only when expired or missing."""
    now = time.time()
    if _freshrss_sid['token'] and now - _freshrss_sid['ts'] < 3600:
        return _freshrss_sid['token']
    if not FRESHRSS_USER or not FRESHRSS_PASS:
        return None
    try:
        r = http_requests.post(
            f'{FRESHRSS_URL}/api/greader.php/accounts/ClientLogin',
            data={'Email': FRESHRSS_USER, 'Passwd': FRESHRSS_PASS},
            timeout=8,
        )
        r.raise_for_status()
        for line in r.text.splitlines():
            if line.startswith('Auth='):
                token = line[5:].strip()
                _freshrss_sid['token'] = token
                _freshrss_sid['ts'] = now
                return token
    except Exception:
        pass
    return None


@app.route('/api/freshrss/headlines')
def freshrss_headlines():
    now = time.time()
    if _freshrss_headlines_cache['items'] is not None and now - _freshrss_headlines_cache['ts'] < _FRESHRSS_CACHE_TTL:
        return jsonify(_freshrss_headlines_cache['items'])

    try:
        limit = min(int(request.args.get('limit', 20)), 50)
    except (ValueError, TypeError):
        limit = 20

    token = _freshrss_auth()
    if not token:
        return jsonify({'error': 'FreshRSS unavailable — not configured or auth failed'}), 503

    try:
        r = http_requests.get(
            f'{FRESHRSS_URL}/api/greader.php/reader/api/0/stream/contents/user/-/state/com.google/reading-list',
            headers={'Authorization': f'GoogleLogin auth={token}'},
            params={'n': limit, 'output': 'json'},
            timeout=12,
        )
        if r.status_code == 401:
            # Token stale — force re-auth on next call
            _freshrss_sid['token'] = None
            return jsonify({'error': 'FreshRSS auth expired — retry'}), 503
        r.raise_for_status()
        raw = r.json()
        items = []
        for entry in raw.get('items', []):
            source = entry.get('origin', {}).get('title', '')
            url = next((l['href'] for l in entry.get('alternate', []) if l.get('href')), '')
            items.append({
                'id':           entry.get('id', ''),
                'title':        entry.get('title', ''),
                'source':       source,
                'url':          url,
                'published_at': entry.get('published', 0),
                'is_read':      'user/-/state/com.google/read' in entry.get('categories', []),
            })
        _freshrss_headlines_cache['items'] = items
        _freshrss_headlines_cache['ts'] = now
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': f'FreshRSS unavailable: {e}'}), 503


# ── DF-10: Audiobookshelf / Kavita / Hardcover (Reading) ─────────────────────
ABS_URL         = os.environ.get('ABS_URL', 'http://audiobookshelf:80')
ABS_TOKEN       = os.environ.get('ABS_TOKEN', '')
KAVITA_URL      = os.environ.get('KAVITA_URL', 'http://kavita:5000')
KAVITA_API_KEY  = os.environ.get('KAVITA_API_KEY', '')
HARDCOVER_TOKEN = os.environ.get('HARDCOVER_API_KEY', '')

_kavita_jwt_cache: dict = {'token': None, 'expires': 0.0}


def _abs_get(path: str, timeout: int = 8):
    """GET request to Audiobookshelf with Bearer auth."""
    return http_requests.get(
        f'{ABS_URL}{path}',
        headers={'Authorization': f'Bearer {ABS_TOKEN}'} if ABS_TOKEN else {},
        timeout=timeout,
    )


def _kavita_jwt() -> str | None:
    """Exchange KAVITA_API_KEY for a short-lived JWT via Kavita Plugin authenticate."""
    import time
    if not KAVITA_API_KEY:
        return None
    now = time.time()
    if _kavita_jwt_cache['token'] and _kavita_jwt_cache['expires'] > now:
        return _kavita_jwt_cache['token']
    try:
        r = http_requests.post(
            f'{KAVITA_URL}/api/Plugin/authenticate',
            params={'apiKey': KAVITA_API_KEY, 'pluginName': 'HomepageDash'},
            timeout=8,
        )
        r.raise_for_status()
        token = r.json().get('token')
        if token:
            _kavita_jwt_cache['token'] = token
            _kavita_jwt_cache['expires'] = now + 3600
        return token
    except Exception:
        return None


def _kavita_get(path: str, timeout: int = 8):
    """GET request to Kavita using JWT obtained via Plugin authenticate."""
    token = _kavita_jwt()
    return http_requests.get(
        f'{KAVITA_URL}{path}',
        headers={'Authorization': f'Bearer {token}'} if token else {},
        timeout=timeout,
    )


@app.route('/api/reading/inprogress')
def reading_inprogress():
    results = []
    errors = []

    # Audiobookshelf — items currently in progress for the logged-in user
    if ABS_TOKEN:
        try:
            r = _abs_get('/api/me/items-in-progress')
            r.raise_for_status()
            for item in r.json().get('libraryItems', []):
                media = item.get('media', {})
                meta  = media.get('metadata', {})
                prog  = item.get('userMediaProgress', {})
                results.append({
                    'service':      'audiobookshelf',
                    'title':        meta.get('title', '—'),
                    'author':       meta.get('authorName', ''),
                    'progress_pct': round(prog.get('progress', 0) * 100, 1),
                    'last_read':    prog.get('lastUpdate'),
                    'cover_url':    f"{ABS_URL}/api/items/{item.get('id')}/cover" if item.get('id') else None,
                    'url':          f"{ABS_URL}/item/{item.get('id')}" if item.get('id') else None,
                })
        except Exception as e:
            errors.append(f'audiobookshelf: {e}')

    # Kavita — series in progress
    if KAVITA_API_KEY:
        try:
            r = _kavita_get('/api/Series/in-progress?pageSize=10')
            r.raise_for_status()
            for series in r.json().get('result', []):
                results.append({
                    'service':      'kavita',
                    'title':        series.get('name', '—'),
                    'author':       '',
                    'progress_pct': round(series.get('pagesRead', 0) / max(series.get('pages', 1), 1) * 100, 1),
                    'last_read':    series.get('lastChapterAdded'),
                    'cover_url':    f"{KAVITA_URL}/api/image/series-cover?seriesId={series.get('id')}" if series.get('id') else None,
                    'url':          f"{KAVITA_URL}/library/{series.get('libraryId')}/series/{series.get('id')}" if series.get('id') else None,
                })
        except Exception as e:
            errors.append(f'kavita: {e}')

    return jsonify({'items': results, 'errors': errors})


@app.route('/api/reading/recent')
def reading_recent():
    results = []
    errors = []

    # Audiobookshelf — recently added library items
    if ABS_TOKEN:
        try:
            # Get all libraries, then fetch recently added from the first one
            libs_r = _abs_get('/api/libraries')
            libs_r.raise_for_status()
            libraries = libs_r.json().get('libraries', [])
            for lib in libraries[:2]:
                r = _abs_get(f"/api/libraries/{lib['id']}/items?sort=addedAt&desc=1&limit=6")
                r.raise_for_status()
                for item in r.json().get('results', []):
                    media = item.get('media', {})
                    meta  = media.get('metadata', {})
                    results.append({
                        'service':   'audiobookshelf',
                        'title':     meta.get('title', '—'),
                        'type':      lib.get('mediaType', 'audiobook'),
                        'added_at':  item.get('addedAt'),
                        'cover_url': f"{ABS_URL}/api/items/{item.get('id')}/cover" if item.get('id') else None,
                        'url':       f"{ABS_URL}/item/{item.get('id')}" if item.get('id') else None,
                    })
        except Exception as e:
            errors.append(f'audiobookshelf: {e}')

    # Kavita — recently added series
    if KAVITA_API_KEY:
        try:
            r = _kavita_get('/api/Series/recently-added?pageSize=6')
            r.raise_for_status()
            for series in r.json().get('result', []):
                results.append({
                    'service':   'kavita',
                    'title':     series.get('name', '—'),
                    'type':      'manga',
                    'added_at':  series.get('created'),
                    'cover_url': f"{KAVITA_URL}/api/image/series-cover?seriesId={series.get('id')}" if series.get('id') else None,
                    'url':       f"{KAVITA_URL}/library/{series.get('libraryId')}/series/{series.get('id')}" if series.get('id') else None,
                })
        except Exception as e:
            errors.append(f'kavita: {e}')

    # Sort by added_at descending, place None last
    results.sort(key=lambda x: x.get('added_at') or 0, reverse=True)
    return jsonify({'items': results[:12], 'errors': errors})


@app.route('/api/reading/search')
def reading_search():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'error': 'q is required'}), 400
    results = []
    errors = []

    # Audiobookshelf search — per-library (global /api/search removed in v2+)
    if ABS_TOKEN:
        try:
            libs_r = _abs_get('/api/libraries')
            libs_r.raise_for_status()
            for lib in libs_r.json().get('libraries', [])[:2]:
                sr = _abs_get(f"/api/libraries/{lib['id']}/search?q={q}&limit=8")
                sr.raise_for_status()
                for item in sr.json().get('book', []):
                    meta = item.get('libraryItem', {}).get('media', {}).get('metadata', {})
                    lid  = item.get('libraryItem', {}).get('id')
                    results.append({
                        'service':   'audiobookshelf',
                        'title':     meta.get('title', '—'),
                        'author':    meta.get('authorName', ''),
                        'cover_url': f"{ABS_URL}/api/items/{lid}/cover" if lid else None,
                        'url':       f"{ABS_URL}/item/{lid}" if lid else None,
                    })
        except Exception as e:
            errors.append(f'audiobookshelf: {e}')

    # Kavita search
    if KAVITA_API_KEY:
        try:
            r = _kavita_get(f'/api/Search/search?queryString={q}')
            r.raise_for_status()
            for series in r.json().get('series', []):
                results.append({
                    'service':   'kavita',
                    'title':     series.get('name', '—'),
                    'author':    '',
                    'cover_url': f"{KAVITA_URL}/api/image/series-cover?seriesId={series.get('seriesId')}" if series.get('seriesId') else None,
                    'url':       f"{KAVITA_URL}/library/{series.get('libraryId')}/series/{series.get('seriesId')}" if series.get('seriesId') else None,
                })
        except Exception as e:
            errors.append(f'kavita: {e}')

    # Hardcover — GraphQL API; results is a JSON scalar, hits[N].document has book data
    if HARDCOVER_TOKEN:
        try:
            gql = {'query': 'query Search($q:String!){search(query:$q,query_type:Book,per_page:6){results}}',
                   'variables': {'q': q}}
            r = http_requests.post('https://api.hardcover.app/v1/graphql',
                                   json=gql,
                                   headers={'Authorization': f'Bearer {HARDCOVER_TOKEN}',
                                            'Content-Type': 'application/json'},
                                   timeout=10)
            r.raise_for_status()
            hits = r.json().get('data', {}).get('search', {}).get('results', {}).get('hits', [])
            for hit in hits:
                doc = hit.get('document', {})
                author = (doc.get('author_names') or [''])[0]
                results.append({
                    'service':   'hardcover',
                    'title':     doc.get('title', '—'),
                    'author':    author,
                    'cover_url': (doc.get('image') or {}).get('url'),
                    'url':       f"https://hardcover.app/books/{doc.get('slug')}" if doc.get('slug') else None,
                })
        except Exception as e:
            errors.append(f'hardcover: {e}')

    return jsonify({'items': results, 'errors': errors})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)