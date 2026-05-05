import React, { useState, useEffect, useCallback, useMemo, useContext, Suspense } from 'react';
import useSSE from './src/hooks/useSSE.js';
import useWeather from './src/hooks/useWeather.js';
import useBotPolling from './src/hooks/useBotPolling.js';
import usePlexData from './src/hooks/usePlexData.js';
import useQuoteHistory from './src/hooks/useQuoteHistory.js';
import { PRIMARY_URL, SECONDARY_URL, POLL_MS, MONO, getStatusTier, defaultStats, safeHref } from './src/utils/constants.js';
import MODE_REGISTRY from './src/modeRegistry.js';
import { DashboardProvider } from './src/context/DashboardContext.jsx';
import { DialectProvider } from './src/context/DialectContext.jsx';
import ServiceDetailPanel from './src/components/ServiceDetailPanel.jsx';
import PeriodicHeader from './src/components/PeriodicHeader.jsx';
import { activeCATRef, ThemeContext } from './src/themes/ThemeContext.jsx';
import { MODE_THEMES, MODE_DEFAULT_THEME, THEMES } from './src/themes/themeConfig.js';
import AnimatedBackground from './src/themes/AnimatedBackground.jsx';
import SpotifyMiniPlayer from './src/components/SpotifyMiniPlayer.jsx';
import ChatBubble from './src/components/ChatBubble.jsx';
import SecurityBadgeRow from './src/components/SecurityBadgeRow.jsx';
import CommandPalette from './src/components/CommandPalette.jsx';
import MediaSearch from './src/components/MediaSearch.jsx';
import ActiveOperationsBar from './src/components/ActiveOperationsBar.jsx';
import WidgetSection from './src/components/WidgetSection.jsx';
import WidgetSkeleton from './src/components/WidgetSkeleton.jsx';
import useWidgetLayout from './src/hooks/useWidgetLayout.js';
import { widgetById } from './src/widgets/registry.js';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SERVICE_REGISTRY, ALL_ELEMENTS } from './src/data/serviceRegistry.js';
import BOT_REGISTRY from './src/data/botRegistry.js';
import CastLayout from './CastLayout.jsx';

// Stable — URL search params don't change for the lifetime of the page
const _URL_PARAMS = new URLSearchParams(window.location.search);
const IS_CAST = _URL_PARAMS.get('cast') === '1';
// Cast mode override: ?mode=SCHLENK forces the dashboard into SCHLENK (or any
// other registered mode) at mount. Default when cast= is set but mode= is not
// provided is SCHLENK (the bench-scene view is cast-optimized).
const CAST_MODE_PARAM = (_URL_PARAMS.get('mode') || '').toUpperCase();

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const STORAGE_VERSION = 'v3';

// Local alias — keeps existing `elementRegistry: ELEMENT_REGISTRY` references working
const ELEMENT_REGISTRY = SERVICE_REGISTRY;

function wavelengthToRgb(nm) {
  let r = 0, g = 0, b = 0;
  if      (nm >= 380 && nm < 440) { r = -(nm - 440) / (440 - 380); g = 0; b = 1; }
  else if (nm >= 440 && nm < 490) { r = 0; g = (nm - 440) / (490 - 440); b = 1; }
  else if (nm >= 490 && nm < 510) { r = 0; g = 1; b = -(nm - 510) / (510 - 490); }
  else if (nm >= 510 && nm < 580) { r = (nm - 510) / (580 - 510); g = 1; b = 0; }
  else if (nm >= 580 && nm < 645) { r = 1; g = -(nm - 645) / (645 - 580); b = 0; }
  else if (nm >= 645 && nm <= 700) { r = 1; g = 0; b = 0; }
  let factor = 1.0;
  if      (nm >= 380 && nm < 420) factor = 0.3 + 0.7 * (nm - 380) / (420 - 380);
  else if (nm >= 680 && nm <= 700) factor = 0.3 + 0.7 * (700 - nm) / (700 - 680);
  return [
    Math.round(r * factor * 255),
    Math.round(g * factor * 255),
    Math.round(b * factor * 255),
  ];
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
let logCounter = 0;
const makeLog = (service, message, type) => ({
  id: `${Date.now()}-${++logCounter}`,
  service,
  message,
  type,
  time: new Date().toLocaleTimeString('en-US', { hour12: false }),
});

export default function App() {
  // SYN-P2-2: localStorage version guard
  useEffect(() => {
    if (localStorage.getItem('hc-storage-version') !== STORAGE_VERSION) {
      Object.keys(localStorage)
        .filter(k => k.startsWith('hc-'))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('hc-storage-version', STORAGE_VERSION);
    }
  }, []);

  const { setCurrentModeThemes, activeTheme, sceneConfig, animationTier, registerModeSetter } = useContext(ThemeContext) ?? {};

  // ── Dashboard mode ──
  const [dashboardMode, setDashboardModeState] = useState(() => {
    // Cast mode: URL ?mode=X wins, else default to SCHLENK for cast sessions
    if (IS_CAST) {
      if (CAST_MODE_PARAM && Object.keys(MODE_THEMES).includes(CAST_MODE_PARAM)) return CAST_MODE_PARAM;
      return 'SCHLENK';
    }
    const stored = localStorage.getItem('jenkins-media-dashboard-mode');
    return Object.keys(MODE_THEMES).includes(stored) ? stored : 'CHEM';
  });

  const setDashboardMode = useCallback((mode) => {
    try { localStorage.setItem('jenkins-media-dashboard-mode', mode); } catch {}
    setDashboardModeState(mode);
  }, []);

  useEffect(() => {
    if (registerModeSetter) registerModeSetter(setDashboardMode);
  }, [registerModeSetter, setDashboardMode]);

  useEffect(() => {
    if (setCurrentModeThemes) {
      setCurrentModeThemes(MODE_THEMES[dashboardMode], MODE_DEFAULT_THEME[dashboardMode]);
    }
  }, [dashboardMode, setCurrentModeThemes]);

  // ── NH-74: Media search overlay ──
  const [searchView, setSearchView] = useState(null);

  // ── Logs ──
  const [logs, setLogs] = useState([
    makeLog('SYSTEM', 'Periodic Table Initialized. Polling elements...', 'info'),
  ]);
  const [lastPolledAt, setLastPolledAt] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const addLog = useCallback((service, message, type) => {
    setLogs(prev => [makeLog(service, message, type), ...prev].slice(0, 120));
    setLastPolledAt(new Date().toLocaleTimeString('en-US', { hour12: false }));
    setIsInitializing(false);
    fetch('/api/flask/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, message, type }),
    }).catch(err => console.error('[journal write]', err.message));
  }, []);

  useEffect(() => {
    fetch('/api/flask/journal?limit=120')
      .then(r => r.json())
      .then(entries => {
        if (!entries.length) return;
        const hydrated = entries.map(e => ({
          id: `hist-${e.ts}-${Math.random()}`,
          service: e.service, message: e.message, type: e.type,
          time: new Date(e.ts).toLocaleTimeString('en-US', { hour12: false }),
        }));
        setLogs(prev => {
          const live = prev.filter(e => !e.id.startsWith('hist-'));
          return [...live, ...hydrated].slice(0, 120);
        });
      })
      .catch(err => console.error('[journal history]', err.message));
  }, []);

  // ── UI state ──
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsInitializing(false), 30_000);
    return () => clearTimeout(t);
  }, []);

  const [errorToast, setErrorToast] = useState(null);
  const showErrorToast = useCallback((msg) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5_000);
  }, []);

  const [showScrollHint, setShowScrollHint] = useState(() => !localStorage.getItem('hc-scroll-seen'));
  useEffect(() => {
    if (!showScrollHint) return;
    const dismiss = () => { setShowScrollHint(false); localStorage.setItem('hc-scroll-seen', '1'); };
    const t = setTimeout(dismiss, 8000);
    window.addEventListener('scroll', dismiss, { once: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', dismiss); };
  }, [showScrollHint]);

  // ── Selected element for detail panel ──
  const [selectedElement, setSelectedElement] = useState(null);
  const handleElementClick = useCallback((el) => {
    const bot = BOT_REGISTRY.find(b => b.id === el.id);
    if (bot) { setSelectedBot(bot); setSelectedElement(null); }
    else     { setSelectedElement(el); setSelectedBot(null); }
  }, []);

  // ── Ctrl+K to open command palette ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Custom hooks (extracted from App.jsx for PRD-036) ──
  const { botResults, selectedBot, setSelectedBot } = useBotPolling(BOT_REGISTRY, addLog);
  const { plexStats, plexSessions, transcodingActive, recentMovies, recentShows, recentAlbums } = usePlexData(addLog);
  const { quote, fetchQuote, history } = useQuoteHistory(addLog);
  const { weatherStats, weatherForecast, weatherAge } = useWeather(addLog);

  // ── SSE-driven service status (PRD-035) + download activity (ADR-009) ──
  const _SSE_KEY_MAP = useMemo(() => ({
    seerr: 'overseerr', tautulli_bridge: 'tautulli-bridge',
    musicbrainz_db: 'musicbrainz-local', gluetun: 'protonvpn',
    restic: 'restic-sidecar', hue: 'hue-bridge',
    terminal: 'claude-terminal', obsidian: 'obsidian-remote',
    queue_manager: 'queue-manager',
  }), []);
  const [sseServiceStats, setSseServiceStats] = useState({});
  const [vpnForwardedPort, setVpnForwardedPort] = useState(null);
  const [qbitListenPort, setQbitListenPort] = useState(null);
  const [qbTorrents, setQbTorrents] = useState([]);
  const [sabnzbdQueue, setSabnzbdQueue] = useState({ slots: [], speed: '0', timeleft: '0:00:00' });
  useSSE({
    'service:status': (data) => {
      const svcs = data.services || {};
      setSseServiceStats(svcs);
      const gluetun = svcs.gluetun;
      if (gluetun?.forwarded_port) setVpnForwardedPort(gluetun.forwarded_port);
      if (gluetun?.qbit_listen_port != null) setQbitListenPort(gluetun.qbit_listen_port);
    },
    'download:progress': (data) => {
      if (Array.isArray(data?.qbittorrent)) setQbTorrents(data.qbittorrent);
      if (data?.sabnzbd) setSabnzbdQueue(data.sabnzbd);
    },
  });
  const protonvpnStats = sseServiceStats.gluetun ?? defaultStats();

  // ── Port-updater derives from protonvpn ──
  const portUpdaterStats = useMemo(() => ({
    level: protonvpnStats.online ? 50 : 0,
    online: protonvpnStats.online,
    isBoiling: false,
    details: [
      { label: 'ROLE',     value: 'Port sync'    },
      { label: 'INTERVAL', value: '5 min'        },
      { label: 'VPN',      value: protonvpnStats.online ? 'LINKED' : 'UNLINKED' },
    ],
  }), [protonvpnStats]);

  // ── Stats map ──
  const statsMap = useMemo(() => {
    const sseMap = {};
    for (const [k, v] of Object.entries(sseServiceStats)) {
      sseMap[_SSE_KEY_MAP[k] || k] = v;
    }
    return {
      plex: plexStats,
      ...sseMap,
      'port-updater': portUpdaterStats,
      lottery: { level: 0, isBoiling: false, online: true, details: [{ label: 'TYPE', value: 'UTILITY' }] },
      ...Object.fromEntries(BOT_REGISTRY.map(b => {
        const r = botResults[b.id];
        return [b.id, r
          ? { level: r.load_percent ?? 0, isBoiling: (r.load_percent ?? 0) > 0,
              online: r.online ?? false,
              stale: !r.online && !!r.cached,
              details: [
                { label: 'ITEMS', value: String(r.items?.length ?? 0) },
                { label: 'LOAD',  value: r.load_label ?? '' },
              ] }
          : defaultStats()
        ];
      })),
    };
  }, [plexStats, sseServiceStats, _SSE_KEY_MAP, portUpdaterStats, botResults]);

  const selectedStats = selectedElement ? (statsMap[selectedElement.id] || defaultStats()) : defaultStats();

  // ── Global status tier ──
  const INFRA_SERVICE_IDS = useMemo(() => new Set([
    'plex', 'overseerr', 'tautulli', 'tautulli-bridge', 'radarr', 'sonarr', 'lidarr', 'tunarr',
    'qbittorrent', 'sabnzbd', 'prowlarr', 'cloudflared', 'notifiarr',
    'flaresolverr', 'protonvpn', 'musicbrainz',
    'port-updater', 'musicbrainz-local', 'bazarr', 'restic-sidecar', 'hue-bridge', 'claude-terminal',
    'triggercmd', 'obsidian-remote', 'kometa', 'snappymail', 'recoll', 'audiobookshelf', 'kavita', 'bhyve', 'diskhealth', 'prometheus', 'grafana',
  ]), []);
  const allLevels = Object.entries(statsMap)
    .filter(([id]) => INFRA_SERVICE_IDS.has(id))
    .map(([, s]) => s.level ?? 0);
  const maxLevel = allLevels.length ? Math.max(...allLevels) : 0;
  const globalTier = getStatusTier(maxLevel);

  const healthColor = useMemo(() => {
    const values = Object.values(statsMap);
    const total = values.length;
    const online = values.filter(s => s.online).length;
    const onlineFrac = total > 0 ? online / total : 0;
    const nm = 700 - onlineFrac * 300;
    const [r, g, b] = wavelengthToRgb(nm);
    const main  = `rgb(${r},${g},${b})`;
    return { text: main, border: `rgba(${r},${g},${b},0.4)`, bg: `rgba(${r},${g},${b},0.08)`, dot: main };
  }, [statsMap]);

  // ── Widget layout engine (NH-58) ──
  const { layout, sortableIds, handleDragEnd, collapsed, toggleCollapse, resetLayout, isCustomized } = useWidgetLayout();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // ── DashboardContext value — all shared state for registry widgets ──
  const dashboardCtx = useMemo(() => ({
    statsMap, dashboardMode, handleElementClick,
    protonvpnStats, vpnForwardedPort, qbitListenPort,
    plexStats, transcodingActive, recentMovies, recentShows, recentAlbums,
    weatherStats, weatherForecast, weatherAge,
    qbTorrents, sabnzbdQueue,
    quote, fetchQuote, history,
    logs, addLog,
  }), [
    statsMap, dashboardMode, handleElementClick,
    protonvpnStats, vpnForwardedPort, qbitListenPort,
    plexStats, transcodingActive, recentMovies, recentShows, recentAlbums,
    weatherStats, weatherForecast, weatherAge,
    qbTorrents, sabnzbdQueue,
    quote, fetchQuote, history,
    logs, addLog,
  ]);

  // ── Cast mode: render stripped-down full-screen layout for Chromecast/Nest Hub ──
  if (IS_CAST) {
    return (
      <DialectProvider>
        <DashboardProvider value={dashboardCtx}>
          <CastLayout />
        </DashboardProvider>
      </DialectProvider>
    );
  }

  return (
    <DialectProvider>
    <DashboardProvider value={dashboardCtx}>
      <div className="min-h-screen periodic-dot-grid overflow-x-hidden" style={{ background: 'var(--bg-base, #0F1117)' }}>

        <AnimatedBackground sceneConfig={sceneConfig} tier={animationTier} accent={THEMES[activeTheme]?.accent} />

        {(() => {
          // Per-mode DetailPanel override (e.g., SCHLENK uses SchlenkDetailPanel).
          // Falls back to the generic ServiceDetailPanel via detailTransform for all other modes.
          const reg = MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM;
          const CustomPanel = reg.DetailPanel;
          if (CustomPanel && selectedElement) {
            return (
              <>
                <div className="fixed inset-0 z-30" style={{ cursor: 'pointer' }} onClick={() => setSelectedElement(null)} />
                <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 40, maxWidth: 'min(640px, 96vw)' }}>
                  <Suspense fallback={null}>
                    <CustomPanel
                      element={selectedElement}
                      stats={selectedStats}
                      allElements={SERVICE_REGISTRY}
                      onClose={() => { setSelectedElement(null); setSelectedBot(null); }}
                    />
                  </Suspense>
                </div>
              </>
            );
          }
          return (
            <>
              <ServiceDetailPanel
                element={selectedElement}
                stats={selectedStats}
                onClose={() => { setSelectedElement(null); setSelectedBot(null); }}
                detailTransform={reg.detailTransform}
                bot={selectedBot}
                botResult={selectedBot ? botResults[selectedBot.id] : null}
              />
              {selectedElement && (
                <div className="fixed inset-0 z-30" style={{ cursor: 'pointer' }} onClick={() => setSelectedElement(null)} />
              )}
            </>
          );
        })()}

        {searchView && <MediaSearch type={searchView} onClose={() => setSearchView(null)} />}

        <div data-section="header">
          <PeriodicHeader globalTier={globalTier} lastPolledAt={lastPolledAt} healthColor={healthColor} dashboardMode={dashboardMode} setDashboardMode={setDashboardMode} modeThemes={MODE_THEMES[dashboardMode]} headerTitle={(MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM).headerTitle} headerSubtitle={(MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM).headerSubtitle} onSearchOpen={setSearchView} />
        </div>

        <ActiveOperationsBar statsMap={statsMap} />
        <div style={{ padding: '4px 16px' }}>
          <SecurityBadgeRow addLog={addLog} />
        </div>

        <SpotifyMiniPlayer />

        {/* ADR-010 Phase 3: Registry-driven widget rendering */}
        <main className="max-w-screen-2xl mx-auto px-6 pt-8 pb-16 space-y-8">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              {layout.map(section => {
                const manifest = widgetById[section.id];
                if (!manifest) return null;
                const C = manifest.component;
                return (
                  <WidgetSection
                    key={section.id}
                    id={section.id}
                    label={section.label}
                    pinned={section.pinned}
                    collapsed={collapsed[section.id]}
                    onToggleCollapse={toggleCollapse}
                  >
                    <Suspense fallback={<WidgetSkeleton />}>
                      <C />
                    </Suspense>
                  </WidgetSection>
                );
              })}
            </SortableContext>
          </DndContext>
        </main>

        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          elementRegistry={ELEMENT_REGISTRY}
          dashboardMode={dashboardMode}
          sectionRefs={{}}
        />

        <ChatBubble />

        {isInitializing && (
          <div role="status" aria-live="polite" style={{
            position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
            padding: '8px 18px', fontFamily: 'monospace', fontSize: 10,
            color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em', pointerEvents: 'none',
          }}>
          ◆ INITIALIZING — POLLING ELEMENTS...
          </div>
        )}

        {showScrollHint && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9998, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
            padding: '6px 16px', fontFamily: 'monospace', fontSize: 9,
            color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em',
            animation: 'scrollHintBounce 2s ease-in-out infinite',
            cursor: 'pointer',
          }} onClick={() => { setShowScrollHint(false); localStorage.setItem('hc-scroll-seen', '1'); }}>
            ▼ SCROLL FOR MORE WIDGETS ▼
          </div>
        )}
        <style>{`@keyframes scrollHintBounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-6px); } }`}</style>

        {errorToast && (
          <div role="alert" aria-live="assertive" style={{
            position: 'fixed', top: 16, right: 16, zIndex: 9999,
            background: 'rgba(239,68,68,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8,
            padding: '10px 16px', fontFamily: 'monospace', fontSize: 10,
            color: '#f87171', letterSpacing: '0.15em', maxWidth: 320,
            cursor: 'pointer',
          }} onClick={() => setErrorToast(null)}>
            ✗ {errorToast}
          </div>
        )}

      </div>
    </DashboardProvider>
    </DialectProvider>
  );
}
