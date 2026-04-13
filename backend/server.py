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

from models import init_db, ChatSession, ChatMessage, CustomPersona
from tools import TOOL_LIST, TOOL_FUNCTIONS
from context import get_homelab_context

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

# Initialize databases on startup
init_db()

# --- GEMINI CHAT LOGIC ---

PERSONAS = {
    "media_assistant": "You are the Jenkins Media Assistant for a homelab media server. You have tools to search movies (Radarr), TV shows (Sonarr), check Plex sessions, library stats, Overseerr requests, watch history (Tautulli), and download queues. Use these tools to answer questions about the library. Be brief and helpful.",
    "mixologist": "You are a virtual bartender at the Jenkins homelab. When a user asks about a movie or show, use the search tools to find it, then suggest a thematic cocktail pairing and explain why it fits the mood.",
    "film_snob": "You are a pretentious film critic with access to the Jenkins media library. Use the search tools to check their collection. Begrudgingly admit high-end quality specs are 'acceptable', but critique the selections.",
    "it_admin": "You are the grumpy sysadmin of the Jenkins homelab. Use tools to check Plex sessions, download queues, and library stats. Warn about transcoding 4K. Make terrible IT dad jokes.",
    "trivia_master": "You are a game-show host with access to the Jenkins media library. Use tools to find titles, then give behind-the-scenes trivia and quiz the user about their own collection.",
    "kids_mode": "You are Captain Jenkins, a pirate guide to the media library. Use tools to find family-friendly content. Suggest snacks. Speak lightly in pirate slang. Keep it wholesome.",
    "binge_watcher": "You are a hyperactive couch potato who hasn't slept in 72 hours. Use the search tools and watch history to suggest back-to-back viewing marathons.",
    "nostradamus": "You are Nostradamus with mystical access to the Jenkins media library. Use tools to peer into the collection. Speak in cryptic, prophetic quatrains about what you find.",
    "sun_tzu": "You are Sun Tzu with strategic access to the Jenkins media library. Use tools to assess the collection. Treat movie selection as military strategy.",
    "socrates": "You are Socrates with access to the Jenkins media library. Use tools to examine titles. Apply the Socratic method — ask profound questions about why they wish to watch this.",
    "plato": "You are Plato with access to the Jenkins media library. Use tools to explore the collection. Refer to the Allegory of the Cave when discussing what people watch.",
    "nietzsche": "You are Friedrich Nietzsche with access to the Jenkins media library. Use tools to examine the abyss of content. Speak of the will to power in media consumption.",
    "galileo": "You are Galileo Galilei marveling at the Jenkins media server. Use tools to explore this technological wonder. Treat each discovery like observing celestial bodies.",
    "mark_twain": "You are Mark Twain with folksy access to the Jenkins media library. Use tools to check on titles. Speak with sharp Midwestern wit about what you find.",
    "steinbeck": "You are John Steinbeck examining the Jenkins media library. Use tools to search the collection. Describe everything through the lens of the working class and human struggle.",
    "hemingway": "You are Ernest Hemingway with access to the Jenkins media library. Use tools to check titles. Short sentences. No wasted words. The server is good. The movies are true.",
}

@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200


# ── Custom Persona CRUD ──────────────────────────

@app.route('/api/chat/personas', methods=['GET'])
def list_personas():
    """List all custom personas."""
    personas = list(CustomPersona.select().order_by(CustomPersona.name))
    return jsonify([p.to_dict() for p in personas])


@app.route('/api/chat/personas', methods=['POST'])
def create_persona():
    """Create a new custom persona."""
    data = request.json or {}
    name = data.get('name', '').strip()
    instruction = data.get('instruction', '').strip()
    if not name or not instruction:
        return jsonify({"error": "Name and instruction are required"}), 400
    key = 'custom_' + re.sub(r'[^a-z0-9]+', '_', name.lower()).strip('_')
    if CustomPersona.select().where(CustomPersona.key == key).exists():
        return jsonify({"error": "A persona with that name already exists"}), 409
    persona = CustomPersona.create(
        key=key, name=name, instruction=instruction,
        greeting=data.get('greeting', f'{name} is ready.'),
        glyph=data.get('glyph', '🤖'),
        hue=data.get('hue', 200),
    )
    return jsonify(persona.to_dict()), 201


@app.route('/api/chat/personas/<int:persona_id>', methods=['PUT'])
def update_persona(persona_id):
    """Update a custom persona."""
    try:
        persona = CustomPersona.get_by_id(persona_id)
    except CustomPersona.DoesNotExist:
        return jsonify({"error": "Persona not found"}), 404
    data = request.json or {}
    if 'name' in data:
        persona.name = data['name'].strip()
    if 'instruction' in data:
        persona.instruction = data['instruction'].strip()
    if 'greeting' in data:
        persona.greeting = data['greeting']
    if 'glyph' in data:
        persona.glyph = data['glyph']
    if 'hue' in data:
        persona.hue = data['hue']
    persona.save()
    return jsonify(persona.to_dict())


@app.route('/api/chat/personas/<int:persona_id>', methods=['DELETE'])
def delete_persona(persona_id):
    """Delete a custom persona."""
    try:
        persona = CustomPersona.get_by_id(persona_id)
    except CustomPersona.DoesNotExist:
        return jsonify({"error": "Persona not found"}), 404
    persona.delete_instance()
    return jsonify({"ok": True})


# ── Session CRUD ──────────────────────────────

@app.route('/api/chat/sessions', methods=['GET'])
def list_sessions():
    """List all chat sessions, newest first."""
    sessions = (ChatSession
                .select()
                .order_by(ChatSession.updated_at.desc())
                .limit(50))
    return jsonify([s.to_dict() for s in sessions])


@app.route('/api/chat/sessions', methods=['POST'])
def create_session():
    """Create a new chat session."""
    data = request.json or {}
    persona = data.get('persona', 'media_assistant')
    session = ChatSession.create(persona=persona, title=data.get('title', 'New Chat'))
    return jsonify(session.to_dict()), 201


@app.route('/api/chat/sessions/<int:session_id>', methods=['GET'])
def get_session(session_id):
    """Get a session and all its messages."""
    try:
        session = ChatSession.get_by_id(session_id)
    except ChatSession.DoesNotExist:
        return jsonify({"error": "Session not found"}), 404
    messages = list(session.messages.order_by(ChatMessage.created_at))
    return jsonify({
        **session.to_dict(),
        'messages': [m.to_dict() for m in messages],
    })


@app.route('/api/chat/sessions/<int:session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a session and all its messages."""
    try:
        session = ChatSession.get_by_id(session_id)
    except ChatSession.DoesNotExist:
        return jsonify({"error": "Session not found"}), 404
    session.delete_instance(recursive=True)
    return jsonify({"ok": True})


# ── Chat endpoint (SSE streaming + tool calls + persistence) ──

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')[:4096]
    persona_key = data.get('persona', 'media_assistant')
    session_id = data.get('session_id')
    stream = data.get('stream', True)

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Resolve persona instruction — check built-ins first, then custom DB personas
    base_instruction = PERSONAS.get(persona_key)
    if not base_instruction and persona_key.startswith('custom_'):
        try:
            cp = CustomPersona.get(CustomPersona.key == persona_key)
            base_instruction = cp.instruction
        except CustomPersona.DoesNotExist:
            pass
    if not base_instruction:
        base_instruction = PERSONAS["media_assistant"]

    # Inject live homelab context into the system instruction
    homelab_context = get_homelab_context()
    current_instruction = (
        f"{base_instruction}\n\n"
        f"--- CURRENT HOMELAB STATE (auto-refreshed) ---\n"
        f"{homelab_context}\n"
        f"--- END STATE ---\n"
        f"Use this state to answer questions directly when possible. "
        f"Only use tool calls when the user asks for something not covered above "
        f"(e.g., searching for a specific title, requesting media, or checking details). "
        f"You can also: view Docker container logs (view_container_logs), restart services "
        f"(restart_service — ALWAYS ask the user for confirmation first), check VPN status "
        f"(get_vpn_status), read speedtest results (run_speedtest), check backup health "
        f"(get_backup_status), and get system metrics (get_system_metrics)."
    )

    # Load or create session
    if session_id:
        try:
            session = ChatSession.get_by_id(session_id)
        except ChatSession.DoesNotExist:
            return jsonify({"error": "Session not found"}), 404
    else:
        # Auto-create session from first message
        title = user_message[:60] + ('...' if len(user_message) > 60 else '')
        session = ChatSession.create(persona=persona_key, title=title)
        session_id = session.id

    # Save user message to DB
    ChatMessage.create(session=session, role='user', text=user_message)

    # Build history from DB (last 20 messages for context window)
    db_messages = list(
        ChatMessage
        .select()
        .where(ChatMessage.session == session)
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
    )
    db_messages.reverse()  # chronological order

    gemini_history = []
    # Exclude the last message (it's the current user_message we'll send)
    for msg in db_messages[:-1]:
        role = 'model' if msg.role == 'bot' else 'user'
        gemini_history.append(
            types.Content(role=role, parts=[types.Part(text=msg.text)])
        )

    if stream:
        return _stream_response(user_message, current_instruction, gemini_history, session, session_id)
    else:
        return _sync_response(user_message, current_instruction, gemini_history, session, session_id)


def _handle_tool_calls(response, chat_session):
    """Process any tool calls in the response, send results back, return final text."""
    max_rounds = 5
    for _ in range(max_rounds):
        # Check if the response contains function calls
        if not response.candidates or not response.candidates[0].content.parts:
            break
        fn_calls = [p for p in response.candidates[0].content.parts if p.function_call]
        if not fn_calls:
            break

        # Execute each function call
        tool_results = []
        for fc in fn_calls:
            fn_name = fc.function_call.name
            fn_args = dict(fc.function_call.args) if fc.function_call.args else {}
            print(f"[TOOL] Calling {fn_name}({fn_args})", flush=True)
            fn = TOOL_FUNCTIONS.get(fn_name)
            if fn:
                result = fn(**fn_args)
            else:
                result = f"Unknown function: {fn_name}"
            tool_results.append(types.Part(
                function_response=types.FunctionResponse(name=fn_name, response={"result": result})
            ))

        # Send tool results back to Gemini
        response = chat_session.send_message(tool_results)

    # Extract final text
    text_parts = [p.text for p in (response.candidates[0].content.parts if response.candidates else []) if hasattr(p, 'text') and p.text]
    return " ".join(text_parts) if text_parts else "I processed the request but have no text response."


def _sync_response(user_message, instruction, history, session, session_id):
    """Non-streaming fallback."""
    try:
        chat_session = client.chats.create(
            model='gemini-2.5-flash',
            config=types.GenerateContentConfig(
                system_instruction=instruction,
                tools=TOOL_LIST,
            ),
            history=history,
        )
        response = chat_session.send_message(user_message)
        text = _handle_tool_calls(response, chat_session)
        ChatMessage.create(session=session, role='bot', text=text)
        session.updated_at = datetime.utcnow()
        session.save()
        return jsonify({"response": text, "session_id": session_id})
    except Exception as e:
        app.logger.error("Gemini API error: %s", e, exc_info=True)
        return jsonify({"error": "Failed to connect to Gemini"}), 500


def _stream_response(user_message, instruction, history, session, session_id):
    """SSE streaming response with tool call support."""
    def generate():
        try:
            chat_session = client.chats.create(
                model='gemini-2.5-flash',
                config=types.GenerateContentConfig(
                    system_instruction=instruction,
                    tools=TOOL_LIST,
                ),
                history=history,
            )

            # First response — may contain tool calls or streaming text
            full_text = ""
            response = chat_session.send_message(user_message)

            # Check for tool calls in the initial response
            if response.candidates and response.candidates[0].content.parts:
                fn_calls = [p for p in response.candidates[0].content.parts if p.function_call]
                if fn_calls:
                    # Handle tool calls synchronously, then stream the final text
                    yield f"data: {json.dumps({'type': 'tool', 'name': fn_calls[0].function_call.name})}\n\n"
                    final_text = _handle_tool_calls(response, chat_session)
                    # Stream the tool response in chunks for typewriter effect
                    for i in range(0, len(final_text), 12):
                        chunk = final_text[i:i+12]
                        full_text += chunk
                        yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"
                else:
                    # No tool calls — extract text from non-streaming response
                    text_parts = [p.text for p in response.candidates[0].content.parts if hasattr(p, 'text') and p.text]
                    final_text = " ".join(text_parts)
                    for i in range(0, len(final_text), 12):
                        chunk = final_text[i:i+12]
                        full_text += chunk
                        yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

            # Save bot response
            if full_text:
                ChatMessage.create(session=session, role='bot', text=full_text)
                session.updated_at = datetime.utcnow()
                session.save()

            yield f"data: {json.dumps({'type': 'done', 'session_id': session_id})}\n\n"

        except Exception as e:
            app.logger.error("Streaming error: %s", e, exc_info=True)
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return Response(
        generate(),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        },
    )


# --- STOCK WIDGET LOGIC ---

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    import concurrent.futures
    import yfinance as yf
    def _fetch():
        tickers = yf.Tickers('AAPL MSFT GOOGL TSLA')
        data = []
        for symbol, ticker in tickers.tickers.items():
            current = getattr(ticker.fast_info, 'last_price', 0) or 0
            prev = getattr(ticker.fast_info, 'previous_close', current) or current
            change = ((current - prev) / prev) * 100
            data.append({"ticker": symbol, "price": round(current, 2), "change": round(change, 2)})
        return data
    try:
        with concurrent.futures.ThreadPoolExecutor() as ex:
            future = ex.submit(_fetch)
            data = future.result(timeout=15)
        for d in data:
            d['source'] = 'live'
        return jsonify(data)
    except concurrent.futures.TimeoutError:
        return jsonify({'error': 'timeout'}), 504
    except Exception as e:
        app.logger.error("YFinance error (falling back to mock data): %s", e, exc_info=True)
        return jsonify([
            {"ticker": "AAPL", "price": 173.50, "change": 1.25, "source": "fallback"},
            {"ticker": "MSFT", "price": 418.22, "change": -0.50, "source": "fallback"},
            {"ticker": "GOOGL", "price": 142.65, "change": 0.85, "source": "fallback"},
            {"ticker": "TSLA", "price": 175.34, "change": -2.10, "source": "fallback"}
        ])

_stock_history_cache = {}
_STOCK_HISTORY_TTL = 900  # 15 minutes

@app.route('/api/stocks/history', methods=['GET'])
def get_stock_history():
    import concurrent.futures
    import yfinance as yf

    symbols_raw = request.args.get('symbols', 'AAPL,MSFT,GOOGL,TSLA')
    period = request.args.get('period', '5d')
    interval = request.args.get('interval', '1h')

    # Validate inputs
    allowed_periods = {'1d', '5d', '1mo', '3mo'}
    allowed_intervals = {'5m', '15m', '1h', '1d'}
    if period not in allowed_periods:
        return jsonify({'error': f'Invalid period. Allowed: {sorted(allowed_periods)}'}), 400
    if interval not in allowed_intervals:
        return jsonify({'error': f'Invalid interval. Allowed: {sorted(allowed_intervals)}'}), 400

    symbols = [s.strip().upper() for s in symbols_raw.split(',') if s.strip()][:8]
    if not symbols:
        return jsonify({'error': 'No symbols provided'}), 400

    cache_key = f"{','.join(symbols)}|{period}|{interval}"
    cached = _stock_history_cache.get(cache_key)
    if cached and (time.time() - cached['ts']) < _STOCK_HISTORY_TTL:
        return jsonify(cached['data'])

    def _fetch():
        result = {}
        for sym in symbols:
            try:
                ticker = yf.Ticker(sym)
                hist = ticker.history(period=period, interval=interval)
                current = getattr(ticker.fast_info, 'last_price', 0) or 0
                prev = getattr(ticker.fast_info, 'previous_close', current) or current
                change = ((current - prev) / prev * 100) if prev else 0
                points = []
                for ts, row in hist.iterrows():
                    points.append({
                        't': ts.isoformat(),
                        'c': round(float(row['Close']), 2)
                    })
                # Fetch investment ratios (graceful — indices/commodities won't have all)
                ratios = {}
                try:
                    info = ticker.info or {}
                    pe = info.get('trailingPE') or info.get('forwardPE')
                    if pe is not None:
                        ratios['pe'] = round(float(pe), 2)
                    dy = info.get('dividendYield')
                    if dy is not None:
                        ratios['divYield'] = round(float(dy) * 100, 2)
                    w52h = info.get('fiftyTwoWeekHigh')
                    w52l = info.get('fiftyTwoWeekLow')
                    if w52h is not None:
                        ratios['w52High'] = round(float(w52h), 2)
                    if w52l is not None:
                        ratios['w52Low'] = round(float(w52l), 2)
                    mc = info.get('marketCap')
                    if mc is not None:
                        ratios['marketCap'] = int(mc)
                    beta = info.get('beta')
                    if beta is not None:
                        ratios['beta'] = round(float(beta), 2)
                except Exception:
                    pass  # ratios stay empty for commodities/indices that fail

                result[sym] = {
                    'current': round(float(current), 2),
                    'change': round(float(change), 2),
                    'history': points,
                    'ratios': ratios
                }
            except Exception as e:
                app.logger.warning("yfinance history error for %s: %s", sym, e)
                result[sym] = {'current': 0, 'change': 0, 'history': [], 'error': str(e)}
        return result

    try:
        with concurrent.futures.ThreadPoolExecutor() as ex:
            future = ex.submit(_fetch)
            data = future.result(timeout=30)
        _stock_history_cache[cache_key] = {'data': data, 'ts': time.time()}
        return jsonify(data)
    except concurrent.futures.TimeoutError:
        return jsonify({'error': 'timeout'}), 504
    except Exception as e:
        app.logger.error("Stock history error: %s", e, exc_info=True)
        return jsonify({'error': str(e)}), 500


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
        with open('/tmp/homepage-audit/port-audit.json') as f:
            data = json.load(f)
        ports = data.get('ports', [])
        if not isinstance(ports, list):
            return jsonify({'error': 'invalid data'}), 503
        return jsonify({'ports': ports[:200], 'ts': data.get('ts'),
                        'stale': _is_stale(data.get('generated_at'))})
    except Exception as e:
        app.logger.error('port_audit error: %s', e)
        return jsonify({'error': 'unavailable'}), 503


@app.route('/api/firewall-status')
def firewall_status():
    try:
        with open('/tmp/homepage-audit/firewall-status.json') as f:
            data = json.load(f)
        return jsonify({
            'win_firewall': data.get('win_firewall'),
            'portproxy_count': data.get('portproxy_count'),
            'wan_exposure': data.get('wan_exposure'),
            'srv2_services': data.get('srv2_services', []),
            'srv2_up': data.get('srv2_up', 0),
            'srv2_down': data.get('srv2_down', 0),
            'ts': data.get('ts'),
            'stale': _is_stale(data.get('generated_at')),
        })
    except Exception as e:
        app.logger.error('firewall_status error: %s', e)
        return jsonify({'error': 'unavailable'}), 503


@app.route('/api/docker/container/<name>')
def docker_container_status(name):
    """Return status for a specific Docker container via docker-monitor."""
    try:
        r = http_requests.get("http://docker-monitor:5803/api/docker/containers", timeout=10)
        r.raise_for_status()
        data = r.json()
        containers = data if isinstance(data, list) else data.get("containers", [])
        c = next((x for x in containers if x["name"] == name), None)
        if not c:
            return jsonify({"error": f"container '{name}' not found", "running": False}), 404
        return jsonify({
            "name": c["name"],
            "running": c.get("status") == "running",
            "health": c.get("health", "none"),
            "restart_count": c.get("restart_count", 0),
            "started_at": c.get("started_at"),
            "image": c.get("image"),
        })
    except Exception as e:
        app.logger.error("Docker status error for %s: %s", name, e, exc_info=True)
        return jsonify({"error": str(e), "running": False}), 503


@app.route('/api/docker/health')
def docker_health():
    """Return health status for ALL Docker containers via docker-monitor."""
    try:
        r = http_requests.get("http://docker-monitor:5803/api/docker/containers", timeout=10)
        r.raise_for_status()
        data = r.json()
        containers = data if isinstance(data, list) else data.get("containers", [])
        result = []
        for c in containers:
            running = c.get("status") == "running"
            result.append({
                "name": c.get("name", "unknown"),
                "running": running,
                "health": c.get("health", "none"),
                "restart_count": c.get("restart_count", 0),
                "started_at": c.get("started_at"),
                "image": c.get("image"),
            })
        result.sort(key=lambda x: (x["running"], x["name"]))
        healthy = sum(1 for c in result if c["running"])
        return jsonify({
            "containers": result,
            "total": len(result),
            "healthy": healthy,
            "unhealthy": len(result) - healthy,
        })
    except Exception as e:
        app.logger.error("Docker health error: %s", e, exc_info=True)
        return jsonify({"error": str(e), "containers": [], "total": 0, "healthy": 0, "unhealthy": 0}), 503


# ── Lottery trends ───────────────────────────────────────────────────────────
_lottery_cache = {}
_LOTTERY_TTL = 21600  # 6 hours

_LOTTERY_DATASETS = {
    'powerball':    'd6yy-54nr',
    'megamillions': '5xaw-6ayf',
}

_DRAW_SCHEDULE = {
    'powerball':    [0, 2, 5],  # Mon, Wed, Sat
    'megamillions': [1, 4],     # Tue, Fri
}


def _next_draw_date(game):
    """Return the next draw date for a game as ISO string."""
    from datetime import datetime, timedelta
    now = datetime.now()
    days = _DRAW_SCHEDULE.get(game, [])
    for offset in range(1, 8):
        candidate = now + timedelta(days=offset)
        if candidate.weekday() in days:
            return candidate.strftime('%A, %B %d')
    # If today is a draw day and it's before 11 PM, today counts
    if now.weekday() in days and now.hour < 23:
        return now.strftime('%A, %B %d (TONIGHT)')
    return 'Unknown'


def _parse_drawings(raw, game):
    """Parse Socrata API results into [{main: [int], special: int, date: str}]."""
    drawings = []
    for row in raw:
        try:
            nums_str = row.get('winning_numbers', '')
            nums = [int(n) for n in nums_str.split() if n.strip()]
            date = row.get('draw_date', '')[:10]
            if game == 'megamillions':
                main = nums[:5]
                special = int(row.get('mega_ball', nums[-1] if len(nums) > 5 else 0))
            else:
                # Powerball: last number in winning_numbers is the PB
                if len(nums) >= 6:
                    main = nums[:5]
                    special = nums[5]
                else:
                    main = nums[:5]
                    special = int(row.get('multiplier', 0))
            if len(main) == 5 and special > 0:
                drawings.append({'main': sorted(main), 'special': special, 'date': date})
        except (ValueError, IndexError):
            continue
    return drawings


def _analyze_window(drawings, window):
    """Compute trend analysis for a window of drawings."""
    from collections import Counter
    subset = drawings[:window]
    if not subset:
        return None
    all_mains = [n for d in subset for n in d['main']]
    all_specials = [d['special'] for d in subset]
    main_freq = Counter(all_mains)
    special_freq = Counter(all_specials)
    avg_sum = round(sum(sum(d['main']) for d in subset) / len(subset), 1)
    avg_number = round(sum(all_mains) / len(all_mains), 1)
    odd_count = sum(1 for n in all_mains if n % 2 == 1)
    even_count = len(all_mains) - odd_count
    mid = 35
    high_count = sum(1 for n in all_mains if n > mid)
    low_count = len(all_mains) - high_count
    return {
        'window': window,
        'count': len(subset),
        'hot_numbers': [n for n, _ in main_freq.most_common(5)],
        'cold_numbers': [n for n, _ in main_freq.most_common()[:-6:-1]],
        'hot_special': [n for n, _ in special_freq.most_common(3)],
        'avg_sum': avg_sum,
        'avg_number': avg_number,
        'odd_even': f"{odd_count}:{even_count}",
        'high_low': f"{high_count}:{low_count}",
        'top_10': [[n, c] for n, c in main_freq.most_common(10)],
        'date_range': f"{subset[-1]['date']} — {subset[0]['date']}" if len(subset) > 1 else subset[0]['date'],
    }


@app.route('/api/lottery/trends', methods=['GET'])
def lottery_trends():
    """Fetch and analyze recent lottery drawings for Powerball or Mega Millions."""
    game = request.args.get('game', 'powerball').lower()
    if game not in _LOTTERY_DATASETS:
        return jsonify({'error': f'Unknown game. Use: {list(_LOTTERY_DATASETS.keys())}'}), 400

    cache_key = game
    cached = _lottery_cache.get(cache_key)
    if cached and (time.time() - cached['ts']) < _LOTTERY_TTL:
        return jsonify(cached['data'])

    dataset = _LOTTERY_DATASETS[game]
    url = f"https://data.ny.gov/resource/{dataset}.json?$order=draw_date%20DESC&$limit=50"
    try:
        r = http_requests.get(url, timeout=15)
        r.raise_for_status()
        raw = r.json()
    except Exception as e:
        app.logger.warning("Lottery API error for %s: %s", game, e)
        # Return cached data if available, even if stale
        if cached:
            return jsonify(cached['data'])
        return jsonify({'error': 'Could not fetch lottery data', 'detail': str(e)}), 503

    drawings = _parse_drawings(raw, game)
    if not drawings:
        return jsonify({'error': 'No valid drawings found in API response'}), 502

    result = {
        'game': game,
        'next_draw': _next_draw_date(game),
        'trends': {
            '10': _analyze_window(drawings, 10),
            '25': _analyze_window(drawings, 25),
            '50': _analyze_window(drawings, 50),
        },
        'latest': drawings[0] if drawings else None,
        'fetched_at': time.strftime('%Y-%m-%dT%H:%M:%S'),
    }
    _lottery_cache[cache_key] = {'data': result, 'ts': time.time()}
    return jsonify(result)


@app.route('/api/braintree/status')
def braintree_status():
    """Probe Brain-Tree-OS web UI on SRV-2 (primary) and SRV-1 (fallback)."""
    srv2 = False
    srv1 = False
    try:
        r = http_requests.get("http://10.0.0.155:3006", timeout=3)
        srv2 = r.status_code in (200, 401, 302)  # 401/302 = auth wall = service is up
    except Exception:
        pass
    try:
        r = http_requests.get("http://host.docker.internal:3006", timeout=3)
        srv1 = r.status_code in (200, 401, 302)
    except Exception:
        pass
    return jsonify({"srv2": srv2, "srv1": srv1})


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
    # Signal 1: Query Gluetun's public IP API for tunnel status + exit info.
    api_up = False
    exit_ip = None
    country = None
    city = None
    try:
        r = http_requests.get('http://gluetun:8000/v1/publicip/ip', timeout=3)
        api_up = (r.status_code == 200)
        if api_up:
            d = r.json()
            exit_ip = d.get('public_ip')
            country = d.get('country')
            city = d.get('city')
    except Exception:
        pass

    # Signal 2: Forwarded port file written by Gluetun on every connect/reconnect.
    forwarded_port = None
    try:
        with open('/tmp/gluetun/forwarded_port') as f:
            val = int(f.read().strip())
            if 1024 <= val <= 65535:
                forwarded_port = val
    except Exception:
        pass

    return jsonify({
        'online': api_up,
        'forwarded_port': forwarded_port,
        'exit_ip': exit_ip,
        'country': country,
        'city': city,
    })


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

        # Step 2: Verify the exit IP belongs to ProtonVPN or a known partner datacenter.
        # ProtonVPN routes through multiple ASNs depending on the exit server:
        #   AS212473 — ProtonVPN AG (direct)
        #   AS212238 — Datacamp Limited (partner DC, common for CH/EU exits)
        #   AS9009   — M247 Ltd (partner DC, common for US/UK exits)
        #   AS209103 — Proton AG (current direct allocation, seen 2026-04)
        # We also accept any org string containing "Proton" as a belt-and-braces
        # fallback so a future ASN rotation doesn't trip a false LEAK alert.
        PROTONVPN_ASNS = {'AS212473', 'AS212238', 'AS9009', 'AS209103'}
        ipinfo = http_requests.get(f'https://ipinfo.io/{outgoing_ip}/json', timeout=8).json()
        outgoing_asn = ipinfo.get('org', '')   # e.g. "AS212473 ProtonVPN AG"

        asn_match = any(asn in outgoing_asn for asn in PROTONVPN_ASNS)
        name_match = 'proton' in outgoing_asn.lower()
        passed = asn_match or name_match

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
        app.logger.error("Plex sessions error: %s", e, exc_info=True)
        return jsonify({"error": str(e), "sessions": [], "stream_count": 0}), 500


_TAUTULLI_THUMB_RE = re.compile(r'^/library/metadata/\d+/(thumb|art)/\d+$')

@app.route('/api/tautulli/thumb')
def tautulli_thumb():
    img = request.args.get("img", "")
    if not img or not _TAUTULLI_THUMB_RE.match(img):
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
        app.logger.error("Tautulli thumb proxy error: %s", e, exc_info=True)
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
MONITOR_ALLOWLIST_PATH = "/tmp/homepage-audit/uptime-kuma-monitors.json"
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
        # Fetch monitor names from status page config (publicGroupList)
        cfg_r = http_requests.get(
            f"{UPTIME_KUMA_BASE}/api/status-page/{UPTIME_KUMA_SLUG}",
            timeout=10
        )
        if cfg_r.status_code == 404:
            return jsonify({"error": "Status page not configured in Uptime Kuma"}), 404
        cfg_r.raise_for_status()
        cfg = cfg_r.json()

        # Build ID→name map from publicGroupList
        monitor_names = {}
        for group in cfg.get("publicGroupList", []):
            for m in group.get("monitorList", []):
                monitor_names[str(m["id"])] = m.get("name", f"Monitor {m['id']}")

        # Fetch heartbeat data
        hb_r = http_requests.get(
            f"{UPTIME_KUMA_BASE}/api/status-page/heartbeat/{UPTIME_KUMA_SLUG}",
            timeout=10
        )
        hb_r.raise_for_status()
        hb_payload = hb_r.json()
    except Exception as e:
        return jsonify({"error": str(e)}), 503

    heartbeat_list = hb_payload.get("heartbeatList", {})
    uptime_list = hb_payload.get("uptimeList", {})

    result = []
    for mid, name in monitor_names.items():
        if allowlist and name not in allowlist:
            continue
        beats = heartbeat_list.get(mid, [])
        beats_sorted = sorted(beats, key=lambda b: b.get("time", ""))
        timeline = [{"status": b.get("status"), "time": b.get("time"), "ping": b.get("ping")} for b in beats_sorted]
        # Use uptimeList for accurate percentage (key format: "{id}_24" for 24h)
        uptime_24 = uptime_list.get(f"{mid}_24")
        pct = round(uptime_24 * 100, 1) if uptime_24 is not None else None
        result.append({
            "id": mid,
            "name": name,
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
    {"id": "backup",       "name": "backup.sh",      "cron": "0 3 * * *",   "log": "/tmp/backup.log"},
    {"id": "port_audit",   "name": "port_audit.sh",  "cron": "*/5 * * * *", "mtime_path": "/tmp/homepage-audit/port-audit.json"},
    {"id": "firewall_status", "name": "firewall_status.sh", "cron": "*/5 * * * *", "mtime_path": "/tmp/homepage-audit/firewall-status.json"},
    {"id": "watchtower",   "name": "Watchtower",      "cron": "0 8 * * *",   "docker": "watchtower"},
    {"id": "port_updater", "name": "port-updater",   "cron": "*/5 * * * *", "docker": "port-updater"},
    {"id": "restic_check", "name": "restic check",   "cron": "0 4 * * 0",   "log": "/tmp/homepage-audit/restic-check.log"},
    {"id": "speedtest",    "name": "speedtest",      "cron": "0 */6 * * *", "log": "/tmp/homepage-audit/speedtest.log"},
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
                r = http_requests.get("http://docker-monitor:5803/api/docker/containers", timeout=10)
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


# ── NH-65 — Backup Panorama ──────────────────────────────────────
SYNCTHING_URL = os.environ.get('SYNCTHING_URL', 'http://syncthing:8384')
SYNCTHING_API_KEY = os.environ.get('SYNCTHING_API_KEY', '')
SYNCTHING_FOLDER_ID = os.environ.get('SYNCTHING_FOLDER_ID', 'handoff')
RESTIC_SIDECAR_URL_INT = 'http://restic-sidecar:5802'

@app.route('/api/backup/panorama')
def backup_panorama():
    result = {}
    # Restic SRV-1
    try:
        r = http_requests.get(f'{RESTIC_SIDECAR_URL_INT}/api/backup/status', timeout=8)
        d = r.json()
        result['restic_srv1'] = {
            'last_backup': d.get('last_backup_time'),
            'snapshot_count': d.get('snapshot_count'),
            'size_gb': d.get('repo_size_gb'),
            'status': 'ok' if d.get('last_backup_time') else 'unknown',
        }
    except Exception:
        result['restic_srv1'] = {'status': 'unreachable'}

    # Syncthing
    if SYNCTHING_API_KEY:
        try:
            headers = {'X-API-Key': SYNCTHING_API_KEY}
            conn = http_requests.get(f'{SYNCTHING_URL}/rest/system/connections', headers=headers, timeout=5).json()
            db = http_requests.get(f'{SYNCTHING_URL}/rest/db/status', params={'folder': SYNCTHING_FOLDER_ID}, headers=headers, timeout=5).json()
            connected = sum(1 for c in conn.get('connections', {}).values() if c.get('connected'))
            result['syncthing'] = {
                'connected_peers': connected,
                'global_files': db.get('globalFiles', 0),
                'need_files': db.get('needFiles', 0),
                'state': db.get('state', 'unknown'),
                'status': 'ok' if db.get('state') == 'idle' and db.get('needFiles', 0) == 0 else 'syncing',
            }
        except Exception:
            result['syncthing'] = {'status': 'unreachable'}
    else:
        result['syncthing'] = {'status': 'no_api_key'}

    # Docker volume backups
    try:
        import glob
        backup_dir = '/home/tener/.config/volume-backups'
        files = sorted(glob.glob(f'{backup_dir}/*.tar.gz'), key=os.path.getmtime, reverse=True)
        total_mb = sum(os.path.getsize(f) for f in files) / 1e6
        latest = os.path.getmtime(files[0]) if files else 0
        result['docker_volumes'] = {
            'file_count': len(files),
            'total_mb': round(total_mb, 1),
            'last_backup': datetime.fromtimestamp(latest).isoformat() if latest else None,
            'status': 'ok' if files else 'no_backups',
        }
    except Exception:
        result['docker_volumes'] = {'status': 'no_directory'}

    result['backup_cron'] = {'schedule': 'daily 3am', 'script': '/home/tener/backup.sh'}
    return jsonify(result)


# ── NH-68 — Disk Trend Data ──────────────────────────────────────
@app.route('/api/disk-trend')
def disk_trend():
    path = '/tmp/homepage-audit/disk-trend.json'
    if not os.path.exists(path):
        return jsonify([])
    try:
        with open(path) as f:
            return jsonify(json.load(f))
    except Exception:
        return jsonify([])


# ── NH-64 — Image Freshness ─────────────────────────────────────
@app.route('/api/image-freshness')
def image_freshness():
    path = '/tmp/homepage-audit/image-freshness.json'
    if not os.path.exists(path):
        return jsonify([])
    try:
        with open(path) as f:
            return jsonify(json.load(f))
    except Exception:
        return jsonify([])


# ── NH-73 — Kometa Status ───────────────────────────────────────
@app.route('/api/kometa/status')
def kometa_status():
    log_dir = '/tmp/kometa-logs'
    status = {'state': 'unknown', 'lastRun': None, 'duration': None, 'collections': 0, 'overlays': 0, 'errors': []}
    log_path = os.path.join(log_dir, 'meta.log')
    if not os.path.exists(log_path):
        return jsonify(status)
    try:
        with open(log_path) as f:
            lines = f.readlines()[-200:]
        for line in reversed(lines):
            if 'Run Completed' in line or 'Finished' in line:
                status['state'] = 'sleeping'
                # Extract timestamp from log line
                if len(line) > 19:
                    status['lastRun'] = line[:19].strip()
                break
            if 'Run Started' in line or 'Starting' in line:
                status['state'] = 'syncing'
                break
            if 'error' in line.lower() or 'ERROR' in line:
                status['errors'].append(line.strip()[:200])
        # Count collections/overlays
        for line in lines:
            if 'Collection' in line and ('Created' in line or 'Updated' in line):
                status['collections'] += 1
            if 'Overlay' in line and ('Applied' in line or 'Updated' in line):
                status['overlays'] += 1
    except Exception:
        pass
    return jsonify(status)


# ── NH-70 — Deploy Control Panel (ADR-015 file-queue) ─────────
DEPLOY_DENYLIST = {'gluetun', 'socket-proxy', 'docker-monitor', 'restic-sidecar',
                   'flask-backend', 'homepage'}
DEPLOY_QUEUE_DIR = '/tmp/deploy-queue'
DEPLOY_RESULTS_DIR = '/tmp/deploy-results'


@app.route('/api/deploy', methods=['POST'])
def deploy():
    data = request.json or {}
    services = data.get('services', [])
    build = data.get('build', False)

    if not services:
        return jsonify({'error': 'no services specified'}), 400

    for svc in services:
        if svc in DEPLOY_DENYLIST:
            return jsonify({'error': f'{svc} is deploy-protected'}), 403

    # Reject if queue already has a pending request
    existing = [f for f in os.listdir(DEPLOY_QUEUE_DIR) if f.endswith('.json')] if os.path.isdir(DEPLOY_QUEUE_DIR) else []
    if existing:
        return jsonify({'error': 'deploy already queued'}), 429

    deploy_id = f"deploy-{int(time.time())}"
    queue_file = os.path.join(DEPLOY_QUEUE_DIR, f'{deploy_id}.json')
    request_data = {'id': deploy_id, 'services': services, 'build': build, 'queuedAt': time.time()}

    os.makedirs(DEPLOY_QUEUE_DIR, exist_ok=True)
    with open(queue_file, 'w') as f:
        json.dump(request_data, f)

    return jsonify({'id': deploy_id, 'status': 'queued'})


@app.route('/api/deploy/status/<deploy_id>')
def deploy_status(deploy_id):
    if not re.match(r'^deploy-\d+$', deploy_id):
        return jsonify({'error': 'invalid id'}), 400

    result_file = os.path.join(DEPLOY_RESULTS_DIR, f'{deploy_id}.json')
    if not os.path.exists(result_file):
        # Check if still queued
        queue_file = os.path.join(DEPLOY_QUEUE_DIR, f'{deploy_id}.json')
        if os.path.exists(queue_file):
            return jsonify({'id': deploy_id, 'status': 'queued'})
        return jsonify({'error': 'not found'}), 404

    with open(result_file) as f:
        result = json.load(f)

    # Include log tail
    log_file = os.path.join(DEPLOY_RESULTS_DIR, f'{deploy_id}.log')
    if os.path.exists(log_file):
        with open(log_file) as f:
            lines = f.readlines()
            result['logTail'] = [l.rstrip() for l in lines[-50:]]
            result['logLines'] = len(lines)

    return jsonify(result)


@app.route('/api/deploy/history')
def deploy_history():
    history_file = os.path.join(DEPLOY_RESULTS_DIR, 'history.json')
    if not os.path.exists(history_file):
        return jsonify([])
    try:
        with open(history_file) as f:
            return jsonify(json.load(f))
    except Exception:
        return jsonify([])


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)