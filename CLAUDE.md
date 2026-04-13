# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

- **Dev server:** `npm run dev` — Vite dev server on port 5173 (proxies API calls)
- **Build:** `npm run build` — Optimized production build to `dist/`
- **Preview:** `npm run preview` — Serve the production build locally
- **Docker deploy:** `docker compose up -d --build flask-backend homepage` — Build and run both containers
- **Flask backend only:** `docker compose up -d --build flask-backend` — Rebuild backend after `.env` or `server.py` changes

No linting or test scripts are configured.

## Architecture

**React SPA** — core orchestration in `App.jsx` (~1,063 lines). Mode dispatch via `src/modeRegistry.js` (table-driven). Service polling via `src/hooks/useServicePoller.js`. Shared constants in `src/utils/constants.js`. Entry points: `index.html` → `src/main.jsx` → `App.jsx`.

**Tech stack:** React 18 + Vite, Tailwind CSS, Framer Motion (animations), Lucide-React (icons).

### Flask Backend

A Python Flask API lives in `backend/` and runs as a separate Docker container (`flask-backend` on `media_net`). It is **not** host-exposed — the nginx container proxies to it via `/api/flask/*`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | Multi-persona Gemini AI chat (16 personas) |
| `/api/stocks` | GET | Live stock quotes via yfinance (AAPL, MSFT, GOOGL, TSLA) |

**Secret:** `GEMINI_API_KEY` lives in `backend/.env` (gitignored). After changing the key: `docker compose restart flask-backend`.

### API Proxy (CORS Fix)
All API calls from the frontend **must** use relative `/api/<service>` paths — never direct IPs. This is enforced by:
- **Dev:** `vite.config.js` proxy rules
- **Prod:** `nginx.conf.template` reverse proxy (processed by nginx envsubst at container startup)

Both configs rewrite requests to the actual service endpoints on the internal network. qBittorrent requires special cookie/origin header handling because it shares the Gluetun network stack. The Flask backend is proxied as `/api/flask/*` → `flask-backend:5000/api/*`.

### Multi-Server Setup
- **Primary server:** `10.0.0.195` — hosts most services (Plex, *arr stack, downloaders, Glances, etc.)
- **Secondary server:** `10.0.0.155` — hosts Tunarr (port 8000) and Musicbrainz Local DB (port 5000)

API keys and server IPs come from `.env` (see `.env.example` for required variables). Keys are injected by nginx at runtime via `proxy_set_header` — never bundled into the JS.

### Status Tier System
Service load levels (0–100) map to color/animation tiers:
| Tier | Level | Color | Boil speed |
|------|-------|-------|------------|
| EQUILIBRIUM | 0–60 | Cyan | 2.5s |
| ELEVATED | 61–80 | Yellow | 1.2s |
| MINOR_WARNING | 81–94 | Amber | 0.7s |
| CRITICAL_INSTABILITY | 95–100 | Red (pulsing) | 0.3s |

### Dashboard Modes
The dashboard has **15 display modes** toggled by `DashboardModeToggle` in the header:
- **CHEM** — Periodic table layout with chemistry-themed glassware SVGs and lab metaphors
- **SPACE** — Star map layout (`src/dashboards/space/`) with stellar metaphors
- **NEURAL** — Neural network node layout (`src/dashboards/neural/`)
- **ARCANE** — Arcane/rune sigil metaphor (`src/dashboards/arcane/`)
- **BIO** — Biological cell metaphor (`src/dashboards/bio/`)
- **MOLECULE** — Molecular bond diagram (`src/dashboards/molecule/`)
- **PLANET** — Planetary system metaphor (`src/dashboards/planet/`)
- **WEATHER** — Atmospheric/weather station metaphor (`src/dashboards/weather/`)
- **AIRPORT** — Airport departure board metaphor (`src/dashboards/airport/`)
- **DINO** — Fossil/dinosaur classification metaphor (`src/dashboards/dino/`)
- **NOIR** — Film noir detective case-file metaphor (`src/dashboards/noir/`)
- **VINYL** — Record collection/turntable metaphor (`src/dashboards/vinyl/`)
- **BAND** — Rock band role/instrument metaphor (`src/dashboards/band/`)
- **PARTICLE** — Particle physics collision metaphor (`src/dashboards/particle/`)
- **GLOBE** — Geographic region metaphor (`src/dashboards/globe/`)

**12 color themes** are available via `ThemeSelector` (also in the header). Each mode has 5 curated themes defined via `MODE_THEMES` in `src/themes/themeConfig.js`. The active theme list changes when the mode changes.

### Dashboard Layout (main scroll area)
Below the header and ActiveOperationsBar, the `<main>` block renders these sections in order:

1. **Services grid** — mode-specific component (PeriodicTableGrid, StarMapGrid, etc.)
2. **AI / Utility Widgets** — 4-column row: ChatWidget, LotteryWidget, StockWidget, SpotifyWidget
3. **Category legend strip** — color key for the 6 visible category groups
4. **Weather + Quick Launch** — 2-column grid
5. **Quote + On This Day** — 2-column grid
6. **SystemMetricsPanel** — CPU, RAM, bandwidth, drive fill dials for both servers
7. **TabbedTicker** — Films / Series / Music recent-additions reels (mode-labeled)
8. **LabJournal** — live log stream (mode-labeled title)

### Design System
- **Theme:** Dark Mode Glassmorphism with 12 switchable color palettes (5 curated per mode)
- Glassmorphism: `backdrop-blur`, semi-transparent backgrounds (`bg-white/5`, `bg-black/40`), borders (`border-white/10`, `border-white/20`)
- Typography: sans-serif for general text, `font-mono` for all data, logs, and labels
- Widget header pattern: `◆ LABEL ◆ Sublabel` in `font-mono`, `fontSize: 9`, `letterSpacing: '0.3em'`, `rgba(255,255,255,0.4)`
- Visual metaphor (CHEM): each monitored service maps to a specific SVG lab glassware shape; liquid level reflects load

### Docker / Nginx
**Homepage container:** Multi-stage Dockerfile: Node 22-Alpine builds the app, Nginx 1.27-Alpine serves `dist/` and acts as API reverse proxy. Nginx runs as non-root on **port 8080**. The container joins `media_net`.

**Flask-backend container:** Python 3.12-slim, builds from `backend/Dockerfile`, joins `media_net`. Not host-exposed.

**Critical nginx rules:**
- `nginx.conf.template` is the file Docker uses (envsubst processes it at startup) — always keep `nginx.conf` in sync with it
- All service upstreams use `set $upstream_foo hostname;` variable trick to defer DNS resolution to request time (prevents nginx startup failure if a service is temporarily down)
- Healthcheck probes `http://127.0.0.1:8080/` — not `localhost` (Alpine's nginx user doesn't resolve `localhost`)
- CSP includes `frame-src 'self' https://open.spotify.com` to allow the SpotifyWidget iframe

### Key Files
| File | Purpose |
|------|---------|
| `App.jsx` | Main SPA (~1,063 lines) — state, service pollers, layout |
| `src/modeRegistry.js` | Table-driven mode dispatch — Grid, DetailPanel, labels, ticker, log title per mode |
| `src/hooks/useServicePoller.js` | Generic polling hook — 20 services use this instead of raw useEffect |
| `src/utils/constants.js` | Shared constants (getStatusTier, PRIMARY_URL, MONO, etc.) |
| `src/components/ElementDetailPanel.jsx` | CHEM-mode element detail panel (Docker, Terminal, Hue, CF, Tautulli) |
| `src/components/BotDetailPanel.jsx` | Bot recommendation detail panel with Plex/Seerr links |
| `src/components/DiscoveryTicker.jsx` | Auto-scrolling media discovery reel (films/series/music) |
| `src/components/LabJournal.jsx` | Live log stream with service filter and expand/collapse |
| `src/components/PeriodicHeader.jsx` | Header bar (mode toggle, theme selector, clock, status badge) |
| `src/components/FreshRssTickerWidget.jsx` | FreshRSS headlines auto-scroller (React Query) |
| `backend/server.py` | Flask API — Gemini chat + yfinance stock endpoints |
| `backend/requirements.txt` | Python deps for the flask-backend Docker image |
| `backend/.env` | `GEMINI_API_KEY` — gitignored, must be populated before first run |
| `backend/Dockerfile` | Python 3.12-slim image for the flask-backend service |
| `nginx.conf.template` | Nginx config template; Docker processes this with envsubst at startup |
| `nginx.conf` | Dev reference copy — must stay in sync with the template |
| `Dockerfile` | Multi-stage build; Node 22 → Nginx 1.27, non-root port 8080 |
| `src/themes/themeConfig.js` | 12 color themes; MODE_THEMES maps each mode to its 5-theme curated list |
| `src/themes/ThemeContext.jsx` | Theme state provider with auto-cycle support |
| `src/components/ThemeSelector.jsx` | Theme picker UI; accepts `dashboardMode` prop |
| `src/components/DashboardModeToggle.jsx` | 15-mode toggle |
| `src/components/RandomizerButton.jsx` | Split-button randomizer — cycles theme, mode, or both |
| `src/components/ChatWidget.jsx` | Multi-persona Gemini AI chat; calls `/api/flask/chat` |
| `src/components/ExtraWidgets.jsx` | LotteryWidget, StockWidget (`/api/flask/stocks`), SpotifyWidget |
| `src/dashboards/space/` | Space mode components (StarMapGrid, StarCard, StarDetailPanel) |
| `src/dashboards/band/` | Band mode components (BandGrid, BandCard, BandDetailPanel, bandConfig.js) |
| `src/dashboards/particle/` | Particle mode components (ParticleGrid, ParticleCard, ParticleDetailPanel, particleConfig.js) |
| `src/dashboards/globe/` | Globe mode components (GlobeGrid, GlobeCard, GlobeDetailPanel, globeConfig.js) |
