import React, { useState, useEffect, useCallback, useMemo, useContext, Suspense } from 'react';
import useServicePoller from './src/hooks/useServicePoller.js';
import useWeather from './src/hooks/useWeather.js';
import useBotPolling from './src/hooks/useBotPolling.js';
import useDownloadActivity from './src/hooks/useDownloadActivity.js';
import { PRIMARY_URL, SECONDARY_URL, POLL_MS, MONO, getStatusTier, defaultStats, safeHref } from './src/utils/constants.js';
import MODE_REGISTRY from './src/modeRegistry.js';
import ServiceDetailPanel from './src/components/ServiceDetailPanel.jsx';
import DiscoveryTicker from './src/components/DiscoveryTicker.jsx';
import TabbedTicker from './src/components/TabbedTicker.jsx';
import ModeLog from './src/components/logs/ModeLog.jsx';
import PeriodicHeader from './src/components/PeriodicHeader.jsx';
import FreshRssTickerWidget from './src/components/FreshRssTickerWidget.jsx';
import WeatherWidget from './src/components/WeatherWidget.jsx';
import QuoteWidget from './src/components/QuoteWidget.jsx';
import OnThisDayWidget from './src/components/OnThisDayWidget.jsx';
import { activeCATRef, ThemeContext } from './src/themes/ThemeContext.jsx';
import { MODE_THEMES, MODE_DEFAULT_THEME, THEMES } from './src/themes/themeConfig.js';
import AnimatedBackground from './src/themes/AnimatedBackground.jsx';
import { StockWidget } from './src/components/ExtraWidgets.jsx';
import SpotifyMiniPlayer from './src/components/SpotifyMiniPlayer.jsx';
import ChatBubble from './src/components/ChatBubble.jsx';
import SecurityBadgeRow from './src/components/SecurityBadgeRow.jsx';
import PlexEcosystemRow from './src/components/PlexEcosystemRow.jsx';
import VpnStatusWidget from './src/components/VpnStatusWidget.jsx';
// DnsLeakCard merged into VpnStatusWidget; QuickLaunchPanel removed (NH-71 Phase 2)
import SystemMetricsPanel from './src/components/SystemMetricsPanel.jsx';
import CommandPalette from './src/components/CommandPalette.jsx';
import DockerHealthWidget from './src/components/DockerHealthWidget.jsx';
import NtfyFeedWidget from './src/components/NtfyFeedWidget.jsx';
import ServerComparisonWidget from './src/components/ServerComparisonWidget.jsx';
import BackupPanoramaWidget from './src/components/BackupPanoramaWidget.jsx';
import NetworkTopologyWidget from './src/components/NetworkTopologyWidget.jsx';
import DeployControlPanel from './src/components/DeployControlPanel.jsx';
// UptimeTimelineWidget replaced by DockerHealthWidget (3-tab: Docker/Uptime/Ntfy)
import MediaPipelineWidget from './src/components/MediaPipelineWidget.jsx';
import CronMonitorWidget from './src/components/CronMonitorWidget.jsx';
import ActiveOperationsBar from './src/components/ActiveOperationsBar.jsx';
import WidgetSection from './src/components/WidgetSection.jsx';
import useWidgetLayout from './src/hooks/useWidgetLayout.js';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SERVICE_REGISTRY, ALL_ELEMENTS } from './src/data/serviceRegistry.js';

// ─────────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// BOT REGISTRY — 20 media-recommendation bots
// ─────────────────────────────────────────────
const BOT_REGISTRY = [
  // Group A — TRANSITION (cyan) — Librarians
  { id:'au', symbol:'Au', z:79, bot_name:'The Auteur',         group:'A', cat:'TRANSITION', desc:'Obscure critical darlings'       },
  { id:'o',  symbol:'O',  z:8,  bot_name:'Mabel',              group:'A', cat:'TRANSITION', desc:'Comfort & warmth picks'          },
  { id:'u',  symbol:'U',  z:92, bot_name:'Chaos Gremlin',      group:'A', cat:'TRANSITION', desc:'Genre-clash double bills'        },
  { id:'fe', symbol:'Fe', z:26, bot_name:'Future Historian',   group:'A', cat:'TRANSITION', desc:'Award-winning classics'          },
  { id:'ne', symbol:'Ne', z:10, bot_name:'Retro Rick',         group:'A', cat:'TRANSITION', desc:'Decade-locked local picks'       },
  // Group B — NOBLE (purple) — Scouts
  { id:'h',  symbol:'H',  z:1,  bot_name:'Trailblazer',        group:'B', cat:'NOBLE',      desc:'Trending globally'               },
  { id:'he', symbol:'He', z:2,  bot_name:'Animation Buff',     group:'B', cat:'NOBLE',      desc:'Top anime missing from library'  },
  { id:'li', symbol:'Li', z:3,  bot_name:'Mood Ring',          group:'B', cat:'NOBLE',      desc:'Emotion-based discovery'         },
  { id:'c',  symbol:'C',  z:6,  bot_name:'Foundation',         group:'B', cat:'NOBLE',      desc:'Essential missing classics'      },
  { id:'si', symbol:'Si', z:14, bot_name:'Algorithm',          group:'B', cat:'NOBLE',      desc:'Similar to your favorites'       },
  { id:'cl', symbol:'Cl', z:17, bot_name:'Slasher',            group:'B', cat:'NOBLE',      desc:'Highly-rated missing horror'     },
  { id:'ti', symbol:'Ti', z:22, bot_name:'Blockbuster',        group:'B', cat:'NOBLE',      desc:'High-budget missing sci-fi'      },
  { id:'ag', symbol:'Ag', z:47, bot_name:'Hidden Gem',         group:'B', cat:'NOBLE',      desc:'High critic / low popularity'    },
  { id:'hg', symbol:'Hg', z:80, bot_name:'Shape-Shifter',      group:'B', cat:'NOBLE',      desc:'International/foreign hits'      },
  { id:'pb', symbol:'Pb', z:82, bot_name:'Heavyweight',        group:'B', cat:'NOBLE',      desc:'Epics & docuseries 3+ hrs'       },
  // Group C — CHALCOGEN (green) — Technicians
  { id:'v',  symbol:'V',  z:23, bot_name:'HDR Junkie',         group:'C', cat:'CHALCOGEN',  desc:'Dolby Vision/HDR10+ >60Mbps'    },
  { id:'s',  symbol:'S',  z:16, bot_name:'Sonic Boom',         group:'C', cat:'CHALCOGEN',  desc:'Atmos/DTS:X/TrueHD 7.1'         },
  { id:'cr', symbol:'Cr', z:24, bot_name:'Purist',             group:'C', cat:'CHALCOGEN',  desc:'Remux/high-bitrate encodes'      },
  { id:'cu', symbol:'Cu', z:29, bot_name:'Bandwidth Miser',    group:'C', cat:'CHALCOGEN',  desc:'HEVC/AV1 efficient encodes'      },
  // Group D — METALLOID (blue) — Music
  { id:'sb', symbol:'Sb', z:51, bot_name:'Playlist Alchemist', group:'D', cat:'METALLOID',  desc:'Spotify mood \u00d7 Lidarr library' },
];


const STORAGE_VERSION = 'v3';


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

// SERVICE_REGISTRY and ALL_ELEMENTS imported from src/data/serviceRegistry.js

const extractExternalId = (guids, prefix, validator = null) => {
  const raw = guids.find(g => g.id?.startsWith(prefix))?.id?.replace(prefix, '') ?? null;
  if (raw === null || (validator && !validator(raw))) return null;
  return raw;
};

const buildPlexItem = (m) => ({
  id: m.ratingKey, ratingKey: m.ratingKey, title: m.title, type: m.type,
  thumb: m.thumb, addedAt: m.addedAt, year: m.year,
});

// Local alias — keeps existing `elementRegistry: ELEMENT_REGISTRY` references working
const ELEMENT_REGISTRY = SERVICE_REGISTRY;

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
  // SYN-P2-2: localStorage version guard — clears stale keys on schema mismatch
  useEffect(() => {
    if (localStorage.getItem('hc-storage-version') !== STORAGE_VERSION) {
      Object.keys(localStorage)
        .filter(k => k.startsWith('hc-'))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem('hc-storage-version', STORAGE_VERSION);
    }
  }, []);

  // Subscribe to theme changes so all components (ElementCard, EmptyCell, etc.)
  // re-render when the theme switches and pick up the updated activeCATRef.current.
  // CONFLICT RESOLVED C3 (ARCH-03): collapsed from two useContext calls into one.
  // The destructured call is sufficient to trigger re-renders on context change.
  const { setCurrentModeThemes, activeTheme, sceneConfig, animationTier, registerModeSetter, liteMode } = useContext(ThemeContext) ?? {};

  // ── Dashboard mode ──
  const [dashboardMode, setDashboardModeState] = useState(() => {
    const stored = localStorage.getItem('jenkins-media-dashboard-mode');
    // ARCH REQUIREMENT: Object.keys(MODE_THEMES) is the single source of truth for valid modes.
    // CONFLICT RESOLVED ARCH-01: hardcoded array replaced — adding a mode to themeConfig.js
    // now automatically validates here without a manual edit to this line.
    return Object.keys(MODE_THEMES).includes(stored) ? stored : 'CHEM';
  });

  // Wrapped setter that persists to localStorage (used by mode cycle timer too)
  const setDashboardMode = useCallback((mode) => {
    try { localStorage.setItem('jenkins-media-dashboard-mode', mode); } catch {}
    setDashboardModeState(mode);
  }, []);

  // Register mode setter so ThemeContext's mode cycle timer can switch modes
  useEffect(() => {
    if (registerModeSetter) registerModeSetter(setDashboardMode);
  }, [registerModeSetter, setDashboardMode]);

  // Sync mode-curated themes whenever dashboardMode changes
  useEffect(() => {
    if (setCurrentModeThemes) {
      setCurrentModeThemes(MODE_THEMES[dashboardMode], MODE_DEFAULT_THEME[dashboardMode]);
    }
  }, [dashboardMode, setCurrentModeThemes]);

  // ── Service stats ──
  const [transcodingActive, setTranscodingActive] = useState(false);
  const [plexSessions, setPlexSessions] = useState([]);
  const [plexStats, setPlexStats] = useState(defaultStats());
  const [vpnForwardedPort, setVpnForwardedPort] = useState(null);
  const [qbitListenPort, setQbitListenPort] = useState(null);

  // ── Quote widget ──
  const [quote, setQuote] = useState({ text: '', author: '', loading: true, error: false });

  // ── On This Day widget ──
  const [history, setHistory] = useState({ events: [], loading: true, error: false });

  // ── Plex recently added ──
  const [recentMovies,  setRecentMovies]  = useState([]);
  const [recentShows,   setRecentShows]   = useState([]);
  const [recentAlbums,  setRecentAlbums]  = useState([]);

  // ── Logs ──
  const [logs, setLogs] = useState([
    makeLog('SYSTEM', 'Periodic Table Initialized. Polling elements...', 'info'),
  ]);
  const [lastPolledAt, setLastPolledAt] = useState(null);

  const addLog = useCallback((service, message, type) => {
    setLogs(prev => [makeLog(service, message, type), ...prev].slice(0, 120));
    setLastPolledAt(new Date().toLocaleTimeString('en-US', { hour12: false }));
    // SYN-P1-13: first successful log dismisses the init banner early
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
          service: e.service,
          message: e.message,
          type: e.type,
          time: new Date(e.ts).toLocaleTimeString('en-US', { hour12: false }),
        }));
        setLogs(prev => {
          const live = prev.filter(e => !e.id.startsWith('hist-'));
          return [...live, ...hydrated].slice(0, 120);
        });
      })
      .catch(err => console.error('[journal history]', err.message));
  }, []); // runs once on mount

  // ── Command palette ──
  const [paletteOpen, setPaletteOpen] = useState(false);

  // SYN-P1-13: isInitializing banner — dismissed after 30s or first successful data load
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsInitializing(false), 30_000);
    return () => clearTimeout(t);
  }, []);

  // SYN-P1-14: ErrorToast — 5s auto-dismiss floating error notification
  const [errorToast, setErrorToast] = useState(null);
  const showErrorToast = useCallback((msg) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5_000);
  }, []);

  // P0-05: Scroll hint for first-time visitors — dismissed on scroll or after 8s
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
  // Stable reference — prevents the Escape useEffect in ElementDetailPanel from
  // re-registering the keydown listener on every render.
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

  // ── Bot polling (extracted to useBotPolling hook) ──
  const { botResults, selectedBot, setSelectedBot } = useBotPolling(BOT_REGISTRY, addLog);

  // ── useServicePoller migrations (Phase A) ──
  const tautulliStats = useServicePoller({
    name: 'TAUTULLI', url: '/api/tautulli/api/v2?cmd=get_activity', addLog,
    transform: (data) => {
      const streams = parseInt(data?.response?.data?.stream_count ?? 0);
      const level = Math.min((streams / 5) * 100, 100);
      return {
        level, isBoiling: streams > 0,
        details: [
          { label: 'STREAMS', value: String(streams) },
          { label: 'LAN_BW', value: `${data?.response?.data?.lan_bandwidth ?? 0} kbps` },
        ],
        _log: { message: `Active streams: ${streams}`, level: 'success' },
      };
    },
  });

  const seerrStats = useServicePoller({
    name: 'SEERR', url: '/api/seerr/api/v1/request?take=50&skip=0&filter=pending&sort=added', addLog,
    transform: (data) => {
      const pending = data?.pageInfo?.results ?? data?.results?.length ?? 0;
      const level = Math.min((pending / 20) * 100, 100);
      return {
        level, isBoiling: pending > 0,
        details: [{ label: 'PENDING', value: String(pending) }],
        _log: { message: `Pending requests: ${pending}`, level: 'success' },
      };
    },
  });

  const radarrStats = useServicePoller({
    name: 'RADARR', url: '/api/radarr/api/v3/queue?pageSize=100', addLog,
    transform: (data) => {
      const count = data?.totalRecords ?? data?.records?.length ?? 0;
      const level = Math.min((count / 20) * 100, 100);
      return {
        level, isBoiling: count > 0,
        details: [{ label: 'QUEUE', value: String(count) }],
        _log: { message: `Queue: ${count} items`, level: count > 0 ? 'success' : 'info' },
      };
    },
  });

  const sonarrStats = useServicePoller({
    name: 'SONARR', url: '/api/sonarr/api/v3/queue?pageSize=100', addLog,
    transform: (data) => {
      const count = data?.totalRecords ?? data?.records?.length ?? 0;
      const level = Math.min((count / 20) * 100, 100);
      return {
        level, isBoiling: count > 0,
        details: [{ label: 'QUEUE', value: String(count) }],
        _log: { message: `Queue: ${count} items`, level: count > 0 ? 'success' : 'info' },
      };
    },
  });

  const lidarrStats = useServicePoller({
    name: 'LIDARR', url: '/api/lidarr/api/v1/queue?pageSize=100', addLog,
    transform: (data) => {
      const count = data?.totalRecords ?? data?.records?.length ?? 0;
      const level = Math.min((count / 20) * 100, 100);
      return {
        level, isBoiling: count > 0,
        details: [{ label: 'QUEUE', value: String(count) }],
        _log: { message: `Queue: ${count} items`, level: count > 0 ? 'success' : 'info' },
      };
    },
  });

  const prowlarrStats = useServicePoller({
    name: 'PROWLARR', url: '/api/prowlarr/api/v1/indexer', addLog,
    transform: (data) => {
      const indexers = Array.isArray(data) ? data : [];
      const enabled = indexers.filter(i => i.enable).length;
      const total = indexers.length;
      const level = total > 0 ? Math.min((enabled / total) * 100, 100) : 0;
      return {
        level, isBoiling: enabled > 0,
        details: [
          { label: 'ENABLED', value: String(enabled) },
          { label: 'TOTAL', value: String(total) },
        ],
        _log: { message: `Indexers: ${enabled}/${total} enabled`, level: 'success' },
      };
    },
  });

  const qbStats = useServicePoller({
    name: 'QBITTORRENT', url: '/api/qbittorrent/api/v2/torrents/info', addLog,
    fetchOptions: { credentials: 'include' },
    transform: (torrents) => {
      const total = torrents.length;
      const active = torrents.filter(t => ['downloading', 'uploading', 'stalledDL', 'forcedDL', 'forcedUP'].includes(t.state)).length;
      const level = total > 0 ? Math.min((active / total) * 100, 100) : 0;
      const dlSpeed = torrents.reduce((s, t) => s + (t.dlspeed || 0), 0);
      return {
        level, isBoiling: active > 0,
        details: [
          { label: 'ACTIVE', value: `${active}/${total}` },
          { label: 'DL_SPEED', value: `${(dlSpeed / 1024 / 1024).toFixed(1)} MB/s` },
        ],
        _log: { message: `${active} active / ${total} total torrents`, level: active > 0 ? 'success' : 'info' },
      };
    },
  });

  const sabnzbdStats = useServicePoller({
    name: 'SABNZBD', url: '/api/sabnzbd/api?mode=queue&output=json', addLog,
    transform: (data) => {
      const queue = data?.queue;
      const slots = parseInt(queue?.noofslots ?? 0);
      const kbps = parseFloat(queue?.kbpersec ?? 0);
      const limitKbps = parseFloat(queue?.speedlimit_abs ?? 0);
      const level = limitKbps > 0 ? Math.min((kbps / limitKbps) * 100, 100) : Math.min((slots / 20) * 100, 100);
      return {
        level, isBoiling: slots > 0,
        details: [
          { label: 'QUEUE', value: String(slots) },
          { label: 'SPEED', value: `${(kbps / 1024).toFixed(1)} MB/s` },
        ],
        _log: { message: `Queue: ${slots} items @ ${(kbps / 1024).toFixed(1)} MB/s`, level: 'success' },
      };
    },
  });

  const notifiarrStats = useServicePoller({
    name: 'NOTIFIARR', url: '/api/notifiarr/', addLog, expectJson: false,
    transform: () => ({
      level: 0, isBoiling: false,
      details: [{ label: 'STATUS', value: 'Running' }],
      _log: { message: 'Client online', level: 'success' },
    }),
  });

  const flaresolverrStats = useServicePoller({
    name: 'FLARESOLVERR', url: '/api/flaresolverr/health', addLog,
    transform: (data) => {
      const online = data?.status === 'ok' || data?.status === 'healthy';
      return {
        level: online ? 40 : 0, isBoiling: false, online,
        details: [{ label: 'STATUS', value: data?.status ?? 'unknown' }],
        _log: { message: online ? 'Solver online — burning through CAPTCHAs' : 'Solver offline', level: online ? 'success' : 'warn' },
      };
    },
  });

  const tautulliBridgeStats = useServicePoller({
    name: 'TAUTULLI-BRIDGE', url: '/api/tautulli-bridge/health', addLog,
    transform: (data) => {
      const degraded = data?.status === 'degraded';
      const issues = data?.issues ?? [];
      return {
        level: degraded ? 50 : 0, isBoiling: false,
        details: [
          { label: 'STATUS', value: data?.status?.toUpperCase() ?? 'OK' },
          ...(issues.length ? [{ label: 'ISSUES', value: String(issues.length) }] : []),
        ],
        _log: { message: degraded ? `Degraded: ${issues.join(', ')}` : 'Healthy', level: degraded ? 'warn' : 'success' },
      };
    },
  });

  const tunarrStats = useServicePoller({
    name: 'TUNARR', url: '/api/tunarr/api/channels', addLog,
    transform: (data) => {
      const channels = Array.isArray(data) ? data : data?.data ?? [];
      const total = channels.length;
      const active = channels.filter(c => c.transcoding || c.active).length;
      const level = total > 0 ? Math.min((active / total) * 100, 100) : 0;
      return {
        level, isBoiling: active > 0,
        details: [
          { label: 'CHANNELS', value: String(total) },
          { label: 'ACTIVE', value: String(active) },
        ],
        _log: { message: `Channels: ${active}/${total} active`, level: 'success' },
      };
    },
  });

  const musicbrainzStats = useServicePoller({
    name: 'MUSICBRAINZ', url: '/api/musicbrainz-applet/', addLog, expectJson: false,
    transform: () => ({
      level: 50, isBoiling: false,
      details: [{ label: 'APPLET', value: 'ONLINE' }],
      _log: { message: 'Applet online', level: 'success' },
    }),
    errorMessage: 'Applet offline: {message}',
  });

  const musicbrainzLocalStats = useServicePoller({
    name: 'MUSICBRAINZ-DB', url: '/api/musicbrainz-local/', addLog, expectJson: false,
    transform: () => ({
      level: 50, isBoiling: false,
      details: [{ label: 'LOCAL_DB', value: 'ONLINE' }],
      _log: { message: 'Local DB online', level: 'info' },
    }),
    errorMessage: 'DB offline: {message}',
  });

  const snappymailStats = useServicePoller({
    name: 'MAIL-ARCHIVE', url: '/api/snappymail/', addLog, expectJson: false,
    transform: () => ({
      level: 25, isBoiling: false,
      details: [
        { label: 'SERVICE', value: 'ONLINE' },
        { label: 'DOMAIN', value: '*@tendrid.us' },
        { label: 'MODE', value: 'RECEIVE-ONLY' },
      ],
      _log: { message: 'Mail archive online', level: 'success' },
    }),
    errorMessage: 'Mail archive offline: {message}',
  });

  const bhyveStats = useServicePoller({
    name: 'B-HYVE', url: '/api/bhyve/status', addLog, interval: 60_000,
    transform: (data) => {
      const s = data.summary || {};
      const connected = s.connected ?? 0;
      const total = s.timer_count ?? 0;
      const active = s.active_watering ?? 0;
      const hubOk = s.hub_online ?? false;
      const lowBat = (s.low_battery || []);
      const level = active > 0 ? 60 : hubOk ? 25 : 0;
      return {
        level, isBoiling: active > 0,
        details: [
          { label: 'HUB', value: hubOk ? 'ONLINE' : 'OFFLINE' },
          { label: 'TIMERS', value: `${connected}/${total}` },
          { label: 'ZONES', value: String(s.zone_count ?? 0) },
          { label: 'WATERING', value: active > 0 ? 'ACTIVE' : 'IDLE' },
          ...(lowBat.length > 0 ? [{ label: 'LOW BAT', value: lowBat.join(', ') }] : []),
        ],
        _log: { message: `Hub ${hubOk ? 'online' : 'offline'}, ${connected}/${total} timers, ${s.zone_count ?? 0} zones`, level: hubOk ? 'success' : 'warn' },
      };
    },
    errorMessage: 'B-Hyve offline: {message}',
  });

  const cloudflaredStats = useServicePoller({
    name: 'CLOUDFLARED',
    url: ['/api/flask/cloudflare/tunnel', '/api/flask/cloudflare/tunnel/connections', '/api/flask/cloudflare/tunnel/auth-events'],
    addLog, interval: 60_000,
    transform: ([tunnel, connData, authData]) => {
      const healthy = tunnel.status === 'healthy' && (tunnel.connector_count ?? 0) >= 1;
      const degraded = tunnel.status === 'degraded';
      return {
        level: healthy ? 30 : degraded ? 60 : 0,
        isBoiling: healthy, online: healthy || degraded,
        details: [
          { label: 'STATUS',     value: (tunnel.status || 'unknown').toUpperCase() },
          { label: 'CONNECTORS', value: String(tunnel.connector_count ?? 0) },
          { label: 'TUNNEL',     value: tunnel.name || '—' },
        ],
        _cf: { tunnel, connections: connData.connections || [], auth: authData },
        _log: { message: `Tunnel ${tunnel.status} — ${tunnel.connector_count ?? 0} connector(s)`, level: healthy ? 'success' : 'warn' },
      };
    },
    errorMessage: 'CF API error: {message}',
  });

  const bazarrStats = useServicePoller({
    name: 'BAZARR',
    url: ['/api/bazarr/api/system/status', '/api/bazarr/api/movies/wanted?start=0&length=1', '/api/bazarr/api/movies?start=0&length=1', '/api/bazarr/api/series?start=0&length=500'],
    addLog,
    transform: ([statusData, wantedMov, moviesData, seriesData]) => {
      const missingMovies = wantedMov.total ?? 0;
      const totalMovies   = moviesData.total ?? 0;
      const movPct = totalMovies > 0 ? (missingMovies / totalMovies) * 100 : 0;
      const totalEpFiles   = (seriesData.data ?? []).reduce((s, r) => s + (r.episodeFileCount   ?? 0), 0);
      const totalEpMissing = (seriesData.data ?? []).reduce((s, r) => s + (r.episodeMissingCount ?? 0), 0);
      const epPct = totalEpFiles > 0 ? (totalEpMissing / totalEpFiles) * 100 : 0;
      const level = Math.min(Math.max(movPct, epPct), 100);
      const hasMissing = missingMovies > 0 || totalEpMissing > 0;
      return {
        level, isBoiling: hasMissing,
        details: [
          { label: 'MOVIES_MISSING',   value: `${movPct.toFixed(1)}%` },
          { label: 'EPISODES_MISSING', value: `${epPct.toFixed(1)}%`  },
        ],
        ...(hasMissing ? { _log: { message: `movies ${movPct.toFixed(1)}% · episodes ${epPct.toFixed(1)}% missing subs`, level: 'warn' } } : {}),
      };
    },
    onError: (err, prev) => ({ ...prev, online: false }),
  });

  const protonvpnStats = useServicePoller({
    name: 'GLUETUN', url: '/api/flask/vpn-status', addLog,
    transform: (data) => {
      const connected = data.online === true;
      return {
        level: connected ? 50 : 0, isBoiling: connected, online: connected,
        details: [
          { label: 'COUNTRY', value: data.country ?? '—' },
          { label: 'EXIT_IP', value: data.exit_ip ?? '—' },
        ],
        _log: { message: connected ? `Tunnel active — fwd port: ${data.forwarded_port ?? '?'}` : 'Tunnel down', level: connected ? 'success' : 'error' },
      };
    },
    onSuccess: (data) => {
      if (data.forwarded_port) setVpnForwardedPort(data.forwarded_port);
      // QB-08: qBit listen port for mismatch detection (best-effort)
      fetch('/api/qbittorrent/api/v2/app/preferences')
        .then(r => r.ok ? r.json() : null)
        .then(pd => { if (pd) setQbitListenPort(pd?.listen_port ?? null); })
        .catch(() => {});
    },
  });

  const resticStats = useServicePoller({
    name: 'RESTIC', url: '/api/backup/status', interval: 120_000, skipHidden: false,
    transform: (data) => {
      if (data.error) return { online: false };
      const lastAge = data.last_backup_time
        ? (Date.now() - new Date(data.last_backup_time)) / 3600000 : Infinity;
      const isStale = lastAge > 25 || data.hc_status === 'down';
      const level = isStale ? 80 : data.hc_status === 'grace' ? 60 : 10;
      return {
        online: true, level, isBoiling: isStale,
        details: [
          { label: 'LAST_BACKUP', value: data.last_backup_time ? `${lastAge.toFixed(1)}h ago` : 'never' },
          { label: 'SNAPSHOTS',   value: String(data.snapshot_count ?? 0) },
          { label: 'REPO_SIZE',   value: data.repo_size_gb ? `${data.repo_size_gb}GB` : 'N/A' },
          { label: 'HC_STATUS',   value: data.hc_status ?? '?' },
        ],
      };
    },
    onError: (err, prev) => ({ ...prev, online: false }),
  });

  const hueStats = useServicePoller({
    name: 'HUE', url: '/api/hue/status', interval: 60_000,
    transform: (data) => {
      if (!data.paired) return { level: 0, isBoiling: false, online: false, details: [{ label: 'STATUS', value: 'NOT PAIRED' }] };
      const autoOn = data.automation_enabled;
      const roomsOn = (data.rooms || []).filter(r => r.lights_on).length;
      return {
        level: autoOn ? Math.min(roomsOn * 20, 60) : 0,
        isBoiling: autoOn && roomsOn > 0,
        details: [
          { label: 'AUTOMATION', value: autoOn ? 'ON' : 'OFF' },
          { label: 'MUSIC',      value: data.music_enabled ? 'ON' : 'OFF' },
          { label: 'ROOMS_LIT',  value: `${roomsOn}/${(data.rooms || []).length}` },
        ],
        _hue: data,
      };
    },
    onError: (err, prev) => ({ ...prev, online: false }),
  });

  const terminalStats = useServicePoller({
    name: 'TERMINAL',
    url: ['/api/claude-terminal/status', '/api/claude-terminal-srv2/status'],
    interval: 30_000,
    transform: ([srv1Data, srv2Data]) => {
      const srv1 = srv1Data && Object.keys(srv1Data).length > 0 ? srv1Data : null;
      const srv2 = srv2Data && Object.keys(srv2Data).length > 0 ? srv2Data : null;
      const srv1Online = !!srv1;
      const srv2Online = !!srv2;
      return {
        level: srv1Online ? 20 : 0, isBoiling: false, online: srv1Online,
        details: [
          { label: 'SRV-1', value: srv1Online ? `${srv1?.backend?.toUpperCase() ?? 'CLSH'} / ${srv1?.mode?.toUpperCase() ?? 'CLAUDE'}` : 'OFFLINE' },
          { label: 'SRV-2', value: srv2Online ? `${srv2?.backend?.toUpperCase() ?? 'CLSH'} / ${srv2?.mode?.toUpperCase() ?? 'CLAUDE'}` : 'NOT DEPLOYED' },
        ],
        _terminal: { srv1, srv2, srv1Online, srv2Online },
      };
    },
    onError: (err, prev) => ({ ...prev, online: false }),
  });

  // ── Docker-only services (no HTTP API) — check container status via docker-monitor ──
  const triggercmdStats = useServicePoller({
    name: 'TRIGGERCMD', url: '/api/flask/docker/container/triggercmd', addLog, interval: 60_000,
    transform: (data) => ({
      level: data.running ? 20 : 0, isBoiling: false, online: data.running,
      details: [
        { label: 'STATUS', value: data.running ? 'RUNNING' : 'STOPPED' },
        { label: 'RESTARTS', value: String(data.restart_count ?? 0) },
      ],
    }),
    onError: (err, prev) => ({ ...prev, online: false }),
  });

  const obsidianStats = useServicePoller({
    name: 'OBSIDIAN', url: '/api/flask/braintree/status', addLog, interval: 60_000,
    transform: (data) => ({
      level: data.srv2 || data.srv1 ? 20 : 0, isBoiling: false,
      online: data.srv2 || data.srv1,
      details: [
        { label: 'SRV-2', value: data.srv2 ? 'ONLINE' : 'OFFLINE' },
        { label: 'SRV-1', value: data.srv1 ? 'ONLINE' : 'OFFLINE' },
        { label: 'SOURCE', value: data.srv2 ? 'SRV-2 (primary)' : data.srv1 ? 'SRV-1 (fallback)' : 'NONE' },
      ],
    }),
    onError: (err, prev) => ({ ...prev, online: false }),
  });

  // NH-73: Kometa (batch runner — poll infrequently)
  const kometaStats = useServicePoller({
    name: 'KOMETA', url: '/api/flask/kometa/status', addLog, interval: 300_000,
    transform: (data) => ({
      level: data.state === 'syncing' ? 60 : data.state === 'sleeping' ? 10 : 0,
      isBoiling: data.state === 'syncing',
      online: data.state !== 'unknown',
      details: [
        { label: 'STATE', value: (data.state || 'unknown').toUpperCase() },
        { label: 'LAST', value: data.lastRun || '—' },
        { label: 'COLLS', value: String(data.collections ?? 0) },
      ],
    }),
    onError: (err, prev) => ({ ...prev, online: false }),
  });

  // ── PLEX ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/plex/status/sessions`, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const sessionCount = data?.MediaContainer?.size ?? 0;
        const level = Math.min((sessionCount / 5) * 100, 100);
        setPlexStats({ level, isBoiling: sessionCount > 0, online: true, details: [{ label: 'SESSIONS', value: String(sessionCount) }] });
        addLog('PLEX', `Active sessions: ${sessionCount}`, 'success');

        const videoSessions = data?.MediaContainer?.Video ?? [];
        const transcoding = videoSessions.some(s => s.TranscodeSession !== undefined);
        setTranscodingActive(transcoding);
        setPlexSessions(videoSessions);

        // Fetch all library sections concurrently
        const [moviesRes, showsRes, albumsRes] = await Promise.allSettled([
          fetch(`/api/plex/library/sections/1/all?type=1&sort=addedAt%3Adesc&X-Plex-Container-Size=30&includeGuids=1`, { headers: { Accept: 'application/json' } }),
          fetch(`/api/plex/library/sections/2/all?type=2&sort=addedAt%3Adesc&X-Plex-Container-Size=30&includeGuids=1`, { headers: { Accept: 'application/json' } }),
          fetch(`/api/plex/library/sections/8/all?type=9&sort=addedAt%3Adesc&X-Plex-Container-Size=30&includeGuids=1`, { headers: { Accept: 'application/json' } }),
        ]);
        if (moviesRes.status === 'fulfilled' && moviesRes.value.ok) {
          try {
            const d = await moviesRes.value.json();
            setRecentMovies((d?.MediaContainer?.Metadata ?? []).map(m => ({
              ...buildPlexItem(m), tmdbId: extractExternalId(m.Guid ?? [], 'tmdb://', id => /^\d+$/.test(id)),
            })));
          } catch (e) { console.error('PLEX movies parse error', e); }
        }
        if (showsRes.status === 'fulfilled' && showsRes.value.ok) {
          try {
            const d = await showsRes.value.json();
            setRecentShows((d?.MediaContainer?.Metadata ?? []).map(m => ({
              ...buildPlexItem(m), tvdbId: extractExternalId(m.Guid ?? [], 'tvdb://', id => /^\d+$/.test(id)),
            })));
          } catch (e) { console.error('PLEX shows parse error', e); }
        }
        if (albumsRes.status === 'fulfilled' && albumsRes.value.ok) {
          try {
            const d = await albumsRes.value.json();
            setRecentAlbums((d?.MediaContainer?.Metadata ?? []).map(m => ({
              ...buildPlexItem(m), thumb: m.thumb || m.parentThumb,
              mbid: extractExternalId(m.Guid ?? [], 'mbid://', id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)),
            })));
          } catch (e) { console.error('PLEX albums parse error', e); }
        }
      } catch (err) {
        setPlexStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('PLEX', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── QUOTE (ZenQuotes) — NH-16: extracted to stable callback for refresh button ──
  const fetchQuote = useCallback(async () => {
    setQuote(q => ({ ...q, loading: true, error: false }));
    try {
      const res = await fetch('/api/quotes/random');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const q = Array.isArray(data) ? data[0] : data;
      // SECURITY OVERRIDE: String() coercion + length cap on all external API fields —
      // overrides no-change status from code-simplifier. author?.toUpperCase() throws
      // TypeError if API returns non-string; ev.year can be an object in some Wikipedia
      // response variants. Rated H-01/M-01 by security-reviewer and pentester.
      const rawText   = q.q ?? q.text ?? '';
      const rawAuthor = q.a ?? q.author ?? '';
      setQuote({
        text:    typeof rawText   === 'string' ? rawText.slice(0, 500)   : '',
        author:  typeof rawAuthor === 'string' ? rawAuthor.slice(0, 100) : '',
        loading: false, error: false,
      });
    } catch (err) {
      setQuote({ text: '', author: '', loading: false, error: true });
      addLog('QUOTES', `Feed offline: ${err.message}`, 'warn');
    }
  }, [addLog]);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  // ── ON THIS DAY (Wikipedia, one-shot on mount) ──
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const res = await fetch(`/api/history/events/${mm}/${dd}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // SECURITY OVERRIDE: String() coercion + length cap — SEC-01/H-01.
        // ev.year may be an object/array in some Wikipedia response variants.
        // ev.text may contain wikitext with embedded HTML — length cap limits payload.
        const events = (data.events ?? []).slice(0, 12).map(ev => ({
          year: String(ev.year ?? ev.timestamp ?? '').slice(0, 10),
          text: typeof ev.text === 'string' ? ev.text.slice(0, 300)
              : (typeof ev.description === 'string' ? ev.description.slice(0, 300) : ''),
          // NH-17: preserve pages array for Wikipedia link (only desktop URL is used);
          // URL is validated with /^https:\/\/en\.wikipedia\.org\// before rendering as href.
          pages: Array.isArray(ev.pages) ? ev.pages.slice(0, 1) : [],
        }));
        setHistory({ events, loading: false, error: false });
      } catch (err) {
        setHistory({ events: [], loading: false, error: true });
        addLog('HISTORY', `Feed offline: ${err.message}`, 'warn');
      }
    };
    fetchHistory();
  }, [addLog]);

  // ── Weather (extracted to useWeather hook) ──
  const { weatherStats, weatherForecast, weatherAge } = useWeather(addLog);

  // ── Download activity (extracted to useDownloadActivity hook) ──
  const { qbTorrents, sabnzbdQueue } = useDownloadActivity();

  // ── Port-updater derives from protonvpn (no dedicated API) ──
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
  const statsMap = useMemo(() => ({
    plex: plexStats, overseerr: seerrStats, tautulli: tautulliStats, 'tautulli-bridge': tautulliBridgeStats, tunarr: tunarrStats,
    radarr: radarrStats, sonarr: sonarrStats, lidarr: lidarrStats,
    prowlarr: prowlarrStats, qbittorrent: qbStats, sabnzbd: sabnzbdStats,
    cloudflared: cloudflaredStats, notifiarr: notifiarrStats,
    flaresolverr: flaresolverrStats, musicbrainz: musicbrainzStats,
    'musicbrainz-local': musicbrainzLocalStats,
    bazarr: bazarrStats,
    'restic-sidecar': resticStats,
    'hue-bridge':     hueStats,
    'claude-terminal': terminalStats,
    triggercmd: triggercmdStats, 'obsidian-remote': obsidianStats,
    kometa: kometaStats, snappymail: snappymailStats, bhyve: bhyveStats,
    protonvpn: protonvpnStats, 'port-updater': portUpdaterStats,
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
  }), [plexStats, seerrStats, tautulliStats, tautulliBridgeStats, tunarrStats,
    radarrStats, sonarrStats, lidarrStats,
    prowlarrStats, qbStats, sabnzbdStats,
    cloudflaredStats, notifiarrStats,
    flaresolverrStats, musicbrainzStats, musicbrainzLocalStats,
    bazarrStats, resticStats, hueStats, terminalStats,
    triggercmdStats, obsidianStats, kometaStats, snappymailStats, bhyveStats,
    protonvpnStats, portUpdaterStats, botResults]);

  // ── Selected element stats ──
  const selectedStats = selectedElement ? (statsMap[selectedElement.id] || defaultStats()) : defaultStats();

  // ── Global status tier (worst INFRASTRUCTURE service drives header badge) ──
  // P1-01: explicit allowlist excludes bot elements (bots are in statsMap but their
  // load_percent reflects recommendation catalog size, not infrastructure health).
  // NOTE: if a new infrastructure service is added to ELEMENT_REGISTRY, add its id here.
  const INFRA_SERVICE_IDS = useMemo(() => new Set([
    'plex', 'overseerr', 'tautulli', 'tautulli-bridge', 'radarr', 'sonarr', 'lidarr', 'tunarr',
    'qbittorrent', 'sabnzbd', 'prowlarr', 'cloudflared', 'notifiarr',
    'flaresolverr', 'protonvpn', 'musicbrainz',
    'port-updater', 'musicbrainz-local', 'bazarr', 'restic-sidecar', 'hue-bridge', 'claude-terminal',
    'triggercmd', 'obsidian-remote', 'kometa', 'snappymail', 'bhyve',
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
    const health = onlineFrac;
    const nm = 700 - health * 300; // 700 (red, offline) → 400 (violet, healthy)
    const [r, g, b] = wavelengthToRgb(nm);
    const main  = `rgb(${r},${g},${b})`;
    const alpha40 = `rgba(${r},${g},${b},0.4)`;
    const alphaBg = `rgba(${r},${g},${b},0.08)`;
    return { text: main, border: alpha40, bg: alphaBg, dot: main };
  }, [statsMap]);

  const wl = (MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM).widgetLabels;

  // NH-58: Widget layout engine
  const { layout, sortableIds, handleDragEnd, collapsed, toggleCollapse, resetLayout, isCustomized } = useWidgetLayout();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Build a map of section id → JSX content
  const sectionContent = useMemo(() => {
    const reg = MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM;
    return {
      'services': (
        <Suspense fallback={<div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>LOADING MODULE...</div>}>
        {(() => {
          const Grid = reg.Grid;
          const props = { statsMap, elementRegistry: ELEMENT_REGISTRY, onElementClick: handleElementClick, gridTitle: reg.gridTitle, cardTransform: reg.cardTransform };
          if (reg.gridProps === 'chem') props.allElements = ALL_ELEMENTS;
          if (reg.gridSubtitle) props.gridSubtitle = reg.gridSubtitle;
          return <Grid {...props} />;
        })()}
        </Suspense>
      ),
      'category-legend': (
        <div style={{ display: 'flex', gap: 12, padding: '4px 8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: -4 }}>
          {['LANTHANIDE', 'ACTINIDE', 'TRANSITION', 'NOBLE', 'CHALCOGEN', 'METALLOID'].map(key => {
            const cat = activeCATRef.current[key];
            const label = reg.labels[key];
            return (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.80)', letterSpacing: 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.border, display: 'inline-block' }} />
                {label}
              </span>
            );
          })}
        </div>
      ),
      'weather-vpn': (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeatherWidget weatherStats={weatherStats} weatherForecast={weatherForecast} weatherAge={weatherAge} headerLabel={wl.weather} airQualityLabel={wl.airQuality} />
          <VpnStatusWidget protonvpnStats={protonvpnStats} vpnForwardedPort={vpnForwardedPort} qbitListenPort={qbitListenPort} headerLabel={wl.vpnStatus} dnsLeakLabel={wl.dnsLeak} />
        </div>
      ),
      'plex': <MediaPipelineWidget qbTorrents={qbTorrents} sabnzbdQueue={sabnzbdQueue} addLog={addLog} widgetLabels={wl} />,
      'docker-health': <DockerHealthWidget addLog={addLog} headerLabel={wl.dockerHealth} lanLabel={wl.lanPresence} cronLabel={wl.cronMonitor} />,
      'notifications': <NtfyFeedWidget />,
      'backup-panorama': <BackupPanoramaWidget />,
      'network-topology': <NetworkTopologyWidget statsMap={statsMap} onNodeClick={(id) => {
        const el = ELEMENT_REGISTRY.find(e => e.id === id);
        if (el) handleElementClick(el);
      }} />,
      'server-comparison': <ServerComparisonWidget />,
      'daily-digest': (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <QuoteWidget quote={quote} onRefresh={fetchQuote} headerLabel={wl.quote} embedded />
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
            <OnThisDayWidget history={history} headerLabel={wl.onThisDay} embedded />
          </div>
          <StockWidget headerLabel={wl.stocks} />
        </div>
      ),
      'system-metrics': (
        <Suspense fallback={null}>
          <SystemMetricsPanel addLog={addLog} transcodingActive={transcodingActive} plexStatsLevel={plexStats.level} sectionLabels={reg.sectionLabels} glancesLabels={reg.glancesLabels} storageLabels={reg.storageLabels} widgetLabels={reg.widgetLabels} jablonskiLabels={reg.jablonskiLabels} CpuDiagram={reg.CpuDiagram} RamDiagram={reg.RamDiagram} DownloadDiagram={reg.DownloadDiagram} UploadDiagram={reg.UploadDiagram} ServerStorageDiagram={reg.ServerStorageDiagram} MediaStorageDiagram={reg.MediaStorageDiagram} SpeedtestDiagram={reg.SpeedtestDiagram} />
        </Suspense>
      ),
      'discovery': (() => {
        const t = reg.tickerLabels;
        return (
          <TabbedTicker tabs={[
            { label: 'FILMS',  content: <DiscoveryTicker items={recentMovies} label={t.films[0]}  sublabel={t.films[1]}  accentColor="amber"  type="film"   /> },
            { label: 'SERIES', content: <DiscoveryTicker items={recentShows}  label={t.series[0]} sublabel={t.series[1]} accentColor="blue"   type="series" /> },
            { label: 'MUSIC',  content: <DiscoveryTicker items={recentAlbums} label={t.music[0]}  sublabel={t.music[1]}  accentColor="purple" type="music"  /> },
          ]} />
        );
      })(),
      'freshrss': <FreshRssTickerWidget headerLabel={wl.freshRss} />,
      'deploy-control': <DeployControlPanel />,
      'mode-log': <ModeLog logs={logs} title={reg.logTitle} mode={dashboardMode} />,
    };
  }, [dashboardMode, statsMap, ELEMENT_REGISTRY, handleElementClick, wl, weatherStats, weatherForecast, weatherAge, protonvpnStats, vpnForwardedPort, qbitListenPort, qbTorrents, sabnzbdQueue, addLog, quote, fetchQuote, history, transcodingActive, plexStats.level, recentMovies, recentShows, recentAlbums, logs]);

  return (
    <div className="min-h-screen periodic-dot-grid overflow-x-hidden" style={{ background: 'var(--bg-base, #0F1117)' }}>

      <AnimatedBackground
        sceneConfig={sceneConfig}
        tier={animationTier}
        accent={THEMES[activeTheme]?.accent}
        liteMode={liteMode}
      />

      <ServiceDetailPanel
        element={selectedElement}
        stats={selectedStats}
        onClose={() => { setSelectedElement(null); setSelectedBot(null); }}
        detailTransform={(MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM).detailTransform}
        bot={selectedBot}
        botResult={selectedBot ? botResults[selectedBot.id] : null}
      />

      {/* Click-outside to close detail panel */}
      {selectedElement && (
        <div
          className="fixed inset-0 z-30"
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedElement(null)}
        />
      )}

      <div data-section="header">
        <PeriodicHeader globalTier={globalTier} lastPolledAt={lastPolledAt} healthColor={healthColor} dashboardMode={dashboardMode} setDashboardMode={setDashboardMode} modeThemes={MODE_THEMES[dashboardMode]} headerTitle={(MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM).headerTitle} headerSubtitle={(MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM).headerSubtitle} />
      </div>

      <ActiveOperationsBar statsMap={statsMap} />
      <div style={{ padding: '4px 16px' }}>
        <SecurityBadgeRow addLog={addLog} />
      </div>

      <SpotifyMiniPlayer />

      <main className="max-w-screen-2xl mx-auto px-6 pt-8 pb-16 space-y-8">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
            {layout.map(section => (
              <WidgetSection
                key={section.id}
                id={section.id}
                label={section.label}
                pinned={section.pinned}
                collapsed={collapsed[section.id]}
                onToggleCollapse={toggleCollapse}
              >
                {sectionContent[section.id]}
              </WidgetSection>
            ))}
          </SortableContext>
        </DndContext>
      </main>

      {/* Bot panel is now unified into ServiceDetailPanel above */}

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        elementRegistry={ELEMENT_REGISTRY}
        dashboardMode={dashboardMode}
        sectionRefs={{}}
      />

      <ChatBubble />

      {/* SYN-P1-13: initializing banner — WCAG 4.1.3 status messages */}
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

      {/* P0-05: Scroll hint — first visit only */}
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

      {/* SYN-P1-14: ErrorToast — 5s auto-dismiss floating error — WCAG 3.3.1 */}
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
  );
}
