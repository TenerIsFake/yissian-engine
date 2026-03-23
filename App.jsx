import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Terminal, Film, Tv, Disc, X,
         Sun, Cloud, CloudDrizzle, CloudRain, Snowflake, CloudLightning, HelpCircle } from 'lucide-react';
// speedtest.js imports moved to SystemMetricsPanel.jsx
import { activeCATRef, ThemeContext } from './src/themes/ThemeContext.jsx';
import { CATEGORY_LABELS, MODE_THEMES, MODE_DEFAULT_THEME } from './src/themes/themeConfig.js';
import ThemeSelector from './src/components/ThemeSelector.jsx';
import DashboardModeToggle from './src/components/DashboardModeToggle.jsx';
import RandomizerButton from './src/components/RandomizerButton.jsx';
import StarMapGrid from './src/dashboards/space/StarMapGrid.jsx';
import StarDetailPanel from './src/dashboards/space/StarDetailPanel.jsx';
import { SPACE_OVERLAY, STELLAR_LABELS } from './src/dashboards/space/spaceConfig.js';
import NeuralGrid from './src/dashboards/neural/NeuralGrid.jsx';
import NeuralDetailPanel from './src/dashboards/neural/NeuralDetailPanel.jsx';
import { NEURAL_LABELS } from './src/dashboards/neural/neuralConfig.js';
import ArcaneGrid from './src/dashboards/arcane/ArcaneGrid.jsx';
import ArcaneDetailPanel from './src/dashboards/arcane/ArcaneDetailPanel.jsx';
import { ARCANE_LABELS } from './src/dashboards/arcane/arcaneConfig.js';
import BioGrid from './src/dashboards/bio/BioGrid.jsx';
import BioDetailPanel from './src/dashboards/bio/BioDetailPanel.jsx';
import { BIO_LABELS } from './src/dashboards/bio/bioConfig.js';
import MoleculeGrid from './src/dashboards/molecule/MoleculeGrid.jsx';
import MoleculeDetailPanel from './src/dashboards/molecule/MoleculeDetailPanel.jsx';
import { MOLECULE_LABELS } from './src/dashboards/molecule/moleculeConfig.js';
import PlanetGrid from './src/dashboards/planet/PlanetGrid.jsx';
import PlanetDetailPanel from './src/dashboards/planet/PlanetDetailPanel.jsx';
import { PLANET_LABELS } from './src/dashboards/planet/planetConfig.js';
import WeatherGrid from './src/dashboards/weather/WeatherGrid.jsx';
import WeatherDetailPanel from './src/dashboards/weather/WeatherDetailPanel.jsx';
import { WEATHER_LABELS } from './src/dashboards/weather/weatherConfig.js';
import AirportGrid from './src/dashboards/airport/AirportGrid.jsx';
import AirportDetailPanel from './src/dashboards/airport/AirportDetailPanel.jsx';
import { AIRPORT_LABELS } from './src/dashboards/airport/airportConfig.js';
import DinoGrid from './src/dashboards/dino/DinoGrid.jsx';
import DinoDetailPanel from './src/dashboards/dino/DinoDetailPanel.jsx';
import { DINO_LABELS } from './src/dashboards/dino/dinoConfig.js';
import NoirGrid from './src/dashboards/noir/NoirGrid.jsx';
import NoirDetailPanel from './src/dashboards/noir/NoirDetailPanel.jsx';
import { NOIR_LABELS } from './src/dashboards/noir/noirConfig.js';
import VinylGrid from './src/dashboards/vinyl/VinylGrid.jsx';
import VinylDetailPanel from './src/dashboards/vinyl/VinylDetailPanel.jsx';
import { VINYL_LABELS } from './src/dashboards/vinyl/vinylConfig.js';
import BandGrid from './src/dashboards/band/BandGrid.jsx';
import BandDetailPanel from './src/dashboards/band/BandDetailPanel.jsx';
import { BAND_LABELS } from './src/dashboards/band/bandConfig.js';
import ParticleGrid from './src/dashboards/particle/ParticleGrid.jsx';
import ParticleDetailPanel from './src/dashboards/particle/ParticleDetailPanel.jsx';
import { PARTICLE_LABELS } from './src/dashboards/particle/particleConfig.js';
import GlobeGrid from './src/dashboards/globe/GlobeGrid.jsx';
import GlobeDetailPanel from './src/dashboards/globe/GlobeDetailPanel.jsx';
import { GLOBE_LABELS } from './src/dashboards/globe/globeConfig.js';
import ForgeGrid from './src/dashboards/forge/ForgeGrid.jsx';
import ForgeDetailPanel from './src/dashboards/forge/ForgeDetailPanel.jsx';
import { FORGE_LABELS } from './src/dashboards/forge/forgeConfig.js';
import OceanGrid from './src/dashboards/ocean/OceanGrid.jsx';
import OceanDetailPanel from './src/dashboards/ocean/OceanDetailPanel.jsx';
import { OCEAN_LABELS } from './src/dashboards/ocean/oceanConfig.js';
import ChatWidget from './src/components/ChatWidget.jsx';
import { LotteryWidget, StockWidget, SpotifyWidget } from './src/components/ExtraWidgets.jsx';
import SecurityBadgeRow from './src/components/SecurityBadgeRow.jsx';
import PlexEcosystemRow from './src/components/PlexEcosystemRow.jsx';
import VpnStatusWidget from './src/components/VpnStatusWidget.jsx';
import DnsLeakCard from './src/components/DnsLeakCard.jsx';
import QuickLaunchPanel from './src/components/QuickLaunchPanel.jsx';
import SystemMetricsPanel from './src/components/SystemMetricsPanel.jsx';
import CommandPalette from './src/components/CommandPalette.jsx';
import UptimeTimelineWidget from './src/components/UptimeTimelineWidget.jsx';
import NtfyInboxWidget from './src/components/NtfyInboxWidget.jsx';
import AirQualityWidget from './src/components/AirQualityWidget.jsx';
import MediaPipelineWidget from './src/components/MediaPipelineWidget.jsx';
import CronMonitorWidget from './src/components/CronMonitorWidget.jsx';

// ─────────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────────
const POLL_MS = 30000;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// These IPs are browser navigation deep-links (new-tab service URLs) for LAN-only use.
// They are intentionally baked into the bundle — they cannot be proxied through nginx
// because they open directly in a new tab to the service UI.
// If this dashboard is ever exposed externally, remove or move them to a server-side config endpoint.
const PRIMARY_URL = 'http://10.0.0.195';
const SECONDARY_URL = 'http://10.0.0.155';

// ─────────────────────────────────────────────
// SHARED STYLE CONSTANTS
// ─────────────────────────────────────────────
const MONO = 'monospace';

// Tiny label used for section headers inside detail panels and tooltips
// e.g. "ELECTRON_CONFIGURATION", "SERVICE_TELEMETRY ◆ …"
const SECTION_LABEL_STYLE = { fontSize: 8, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3em' };

// Round status/online indicator dot  (used in ElementCard and ElementDetailPanel)
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

// Standard cell dimensions shared by ElementCard, EmptyCell, and placeholder divs
const CELL_SIZE = { width: 72, height: 80, borderRadius: 3 };

// ─────────────────────────────────────────────
// BOT REGISTRY — 20 media-recommendation bots
// ─────────────────────────────────────────────
const BOT_POLL_MS = 60_000; // 60 seconds (was 300_000; reduced for faster recovery from transient failures)

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

// ─────────────────────────────────────────────
// STATUS TIER SYSTEM /* THEME_INVARIANT */
// Tier dot colors (cyan/yellow/amber/red) never change with theme.
// ─────────────────────────────────────────────
const getStatusTier = (level) => {
  if (level >= 95) return {
    tier: 3, label: 'NUCLEAR_DECAY',
    color: 'text-red-400', glowColor: 'rgba(239,68,68,0.6)',
    borderColor: 'rgba(239,68,68,0.5)', bgColor: 'rgba(239,68,68,0.10)',
  };
  if (level >= 81) return {
    tier: 2, label: 'METASTABLE',
    color: 'text-amber-400', glowColor: 'rgba(245,158,11,0.5)',
    borderColor: 'rgba(245,158,11,0.4)', bgColor: 'rgba(245,158,11,0.07)',
  };
  if (level >= 61) return {
    tier: 1, label: 'EXCITED',
    color: 'text-yellow-300', glowColor: 'rgba(250,204,21,0.4)',
    borderColor: 'rgba(250,204,21,0.3)', bgColor: 'rgba(250,204,21,0.05)',
  };
  return {
    tier: 0, label: 'GROUND_STATE',
    color: 'text-cyan-400', glowColor: 'rgba(6,182,212,0.3)',
    borderColor: null, bgColor: null,
  };
};

const STORAGE_VERSION = 'v3';

const defaultStats = () => ({ level: 0, isBoiling: false, details: [], online: null, stale: false });

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
// ELEMENT CATEGORIES
// Colors sourced from activeCATRef.current (set by ThemeProvider).
// Use activeCATRef.current[catKey] instead of CAT[catKey] everywhere.
// Category labels are theme-invariant — use CATEGORY_LABELS[catKey].
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// ELEMENT REGISTRY — service → element mapping
// All services assigned to the Rare Earth (Lanthanide/Actinide) series.
// ─────────────────────────────────────────────

// Quick-launch URLs (update MUSIC_REQUEST_URL to your actual portal)
const MUSIC_REQUEST_URL   = `${PRIMARY_URL}:5050`;  // MusicBrainz Applet — music request portal
const SEERR_URL           = `${SECONDARY_URL}:5055`;  // Overseerr is on SRV-2
const MUSICBRAINZ_LOCAL   = SECONDARY_URL;          // Local MusicBrainz server (port 80) — used for API calls, not external links

const extractExternalId = (guids, prefix, validator = null) => {
  const raw = guids.find(g => g.id?.startsWith(prefix))?.id?.replace(prefix, '') ?? null;
  if (raw === null || (validator && !validator(raw))) return null;
  return raw;
};

const buildPlexItem = (m) => ({
  id: m.ratingKey, ratingKey: m.ratingKey, title: m.title, type: m.type,
  thumb: m.thumb, addedAt: m.addedAt, year: m.year,
});

// Weather location (Open-Meteo, no API key required)
const WEATHER_LAT = 41.85;   // Chicago — update to your coordinates
const WEATHER_LON = -87.65;
const WEATHER_POLL_MS = 600000; // 10 minutes

const WMO_DESC = (code) => {
  if (code === 0)                        return { label: 'Clear Sky',       state: 'GROUND_STATE'    };
  if (code <= 2)                         return { label: 'Mainly Clear',    state: 'GROUND_STATE'    };
  if (code === 3)                        return { label: 'Overcast',        state: 'METASTABLE'      };
  if (code <= 48)                        return { label: 'Fog',             state: 'SUBLIMATION'     };
  if (code <= 57)                        return { label: 'Drizzle',         state: 'EXCITED'         };
  if (code <= 67)                        return { label: 'Rain',            state: 'IONIZED'         };
  if (code <= 77)                        return { label: 'Snow',            state: 'CRYSTALLINE'     };
  if (code <= 82)                        return { label: 'Rain Showers',    state: 'PLASMA'          };
  if (code <= 86)                        return { label: 'Snow Showers',    state: 'CRYSTALLINE'     };
  if (code <= 99)                        return { label: 'Thunderstorm',    state: 'NUCLEAR_DECAY'   };
  return { label: 'Unknown', state: 'UNKNOWN' };
};

const ELEMENT_REGISTRY = [
  // ── Lanthanide series — period 9 f-block (groups 3–17) ──────────────────────────────────────────
  { id: 'plex',         symbol: 'La', name: 'Lanthanum',     z: 57,  mass: '138.905', period: 9,  group: 3,  cat: 'LANTHANIDE', service: 'PLEX',         url: `${PRIMARY_URL}:32400/web`, electronConfig: '[Xe] 5d¹ 6s²',        oxidation: '+3 | +3* | +3** | ionized',     shells: [2,8,18,18,9,2]   },
  { id: 'overseerr',    symbol: 'Ce', name: 'Cerium',        z: 58,  mass: '140.116', period: 9,  group: 4,  cat: 'LANTHANIDE', service: 'SEERR',        url: SEERR_URL,      electronConfig: '[Xe] 4f¹ 5d¹ 6s²',    oxidation: '+3 | +4 | +4* | ionized',       shells: [2,8,18,19,9,2]   },
  { id: 'tautulli',     symbol: 'Pr', name: 'Praseodymium',  z: 59,  mass: '140.908', period: 9,  group: 5,  cat: 'LANTHANIDE', service: 'TAUTULLI',     url: `${PRIMARY_URL}:8181`,      electronConfig: '[Xe] 4f³ 6s²',         oxidation: '+3 | +4 | +2 | excited-f',      shells: [2,8,18,21,8,2]   },
  { id: 'radarr',       symbol: 'Nd', name: 'Neodymium',     z: 60,  mass: '144.242', period: 9,  group: 6,  cat: 'LANTHANIDE', service: 'RADARR',       url: `${PRIMARY_URL}:7878`,      electronConfig: '[Xe] 4f⁴ 6s²',         oxidation: '+3 | +2 | +4 | metastable-f',   shells: [2,8,18,22,8,2]   },
  { id: 'sonarr',       symbol: 'Pm', name: 'Promethium',    z: 61,  mass: '(145)',   period: 9,  group: 7,  cat: 'LANTHANIDE', service: 'SONARR',       url: `${PRIMARY_URL}:8989`,      electronConfig: '[Xe] 4f⁵ 6s²',         oxidation: '+3 | +3* | +3** | decay',       shells: [2,8,18,23,8,2]   },
  { id: 'lidarr',       symbol: 'Sm', name: 'Samarium',      z: 62,  mass: '150.36',  period: 9,  group: 8,  cat: 'LANTHANIDE', service: 'LIDARR',       url: `${PRIMARY_URL}:8686`,      electronConfig: '[Xe] 4f⁶ 6s²',         oxidation: '+3 | +2 | +2* | ionized',       shells: [2,8,18,24,8,2]   },
  { id: 'tunarr',       symbol: 'Eu', name: 'Europium',      z: 63,  mass: '151.964', period: 9,  group: 9,  cat: 'LANTHANIDE', service: 'TUNARR',       url: `${SECONDARY_URL}:8000`,    electronConfig: '[Xe] 4f⁷ 6s²',         oxidation: '+3 | +2 | +2* | excited-f',     shells: [2,8,18,25,8,2]   },
  { id: 'qbittorrent',  symbol: 'Gd', name: 'Gadolinium',    z: 64,  mass: '157.25',  period: 9,  group: 10, cat: 'LANTHANIDE', service: 'QBITTORRENT',  url: `${PRIMARY_URL}:8080`,      electronConfig: '[Xe] 4f⁷ 5d¹ 6s²',    oxidation: '+3 | +1 | +3* | high-spin',     shells: [2,8,18,25,9,2]   },
  { id: 'sabnzbd',      symbol: 'Tb', name: 'Terbium',       z: 65,  mass: '158.925', period: 9,  group: 11, cat: 'LANTHANIDE', service: 'SABNZBD',      url: `${PRIMARY_URL}:8085`,      electronConfig: '[Xe] 4f⁹ 6s²',         oxidation: '+3 | +4 | +4* | ionized',       shells: [2,8,18,27,8,2]   },
  { id: 'prowlarr',     symbol: 'Dy', name: 'Dysprosium',    z: 66,  mass: '162.500', period: 9,  group: 12, cat: 'LANTHANIDE', service: 'PROWLARR',     url: `${PRIMARY_URL}:9696`,      electronConfig: '[Xe] 4f¹⁰ 6s²',        oxidation: '+3 | +2 | +4 | metastable-f',   shells: [2,8,18,28,8,2]   },
  { id: 'cloudflared',  symbol: 'Ho', name: 'Holmium',       z: 67,  mass: '164.930', period: 9,  group: 13, cat: 'LANTHANIDE', service: 'CLOUDFLARED',  url: `${PRIMARY_URL}:20241`,     electronConfig: '[Xe] 4f¹¹ 6s²',        oxidation: '+3 | +3* | +3** | ionized',     shells: [2,8,18,29,8,2]   },
  { id: 'notifiarr',    symbol: 'Er', name: 'Erbium',        z: 68,  mass: '167.259', period: 9,  group: 14, cat: 'LANTHANIDE', service: 'NOTIFIARR',    url: `${PRIMARY_URL}:5454`,      electronConfig: '[Xe] 4f¹² 6s²',        oxidation: '+3 | +3* | +3** | ionized',     shells: [2,8,18,30,8,2]   },
  { id: 'flaresolverr', symbol: 'Tm', name: 'Thulium',       z: 69,  mass: '168.934', period: 9,  group: 15, cat: 'LANTHANIDE', service: 'FLARESOLVERR', url: `${PRIMARY_URL}:8191`,      electronConfig: '[Xe] 4f¹³ 6s²',        oxidation: '+3 | +2 | +2* | ionized',       shells: [2,8,18,31,8,2]   },
  { id: 'protonvpn',    symbol: 'Yb', name: 'Ytterbium',     z: 70,  mass: '173.045', period: 9,  group: 16, cat: 'LANTHANIDE', service: 'GLUETUN/VPN',  url: null,                        electronConfig: '[Xe] 4f¹⁴ 6s²',        oxidation: '0 | +2 | +3 | 0 (shielded)',    shells: [2,8,18,32,8,2]   },
  { id: 'musicbrainz',  symbol: 'Lu', name: 'Lutetium',      z: 71,  mass: '174.967', period: 9,  group: 17, cat: 'LANTHANIDE', service: 'Music Request Page',  url: `${PRIMARY_URL}:5050`,      electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²',   oxidation: '+3 | +3* | +3** | ionized',     shells: [2,8,18,32,9,2]   },
  // ── Actinide series — period 10 f-block (sidecar / infra services) ──────────────────────────────
  { id: 'port-updater',      symbol: 'Ac', name: 'Actinium', z: 89,  mass: '(227)',   period: 10, group: 3,  cat: 'ACTINIDE',   service: 'PORT-UPDATER', url: null,                        electronConfig: '[Rn] 6d¹ 7s²',         oxidation: '+3 | +3* | decay | (sidecar)',   shells: [2,8,18,32,18,9,2] },
  { id: 'musicbrainz-local', symbol: 'Th', name: 'Thorium', z: 90,  mass: '232.038', period: 10, group: 4,  cat: 'ACTINIDE',   service: 'MUSICBRAINZ-DB', url: `${SECONDARY_URL}:5000`, electronConfig: '[Rn] 6d² 7s²',         oxidation: '+4 | +3 | +2 | decay (α)',      shells: [2,8,18,32,18,10,2] },
  { id: 'bazarr',            symbol: 'Pa', name: 'Protactinium', z: 91, mass: '231.036', period: 10, group: 5, cat: 'ACTINIDE',   service: 'BAZARR',       url: `${PRIMARY_URL}:6767`,   electronConfig: '[Rn] 5f² 6d¹ 7s²',     oxidation: '+5 | +4 | +3 | subtitle-decay', shells: [2,8,18,32,20,9,2] },
  { id: 'tautulli-bridge',   symbol: 'Np', name: 'Neptunium',   z: 93, mass: '(237)',   period: 10, group: 7,  cat: 'ACTINIDE',   service: 'TAUTULLI-BRIDGE', url: null,               electronConfig: '[Rn] 5f⁴ 6d¹ 7s²',     oxidation: '+5 | +4 | +3 | bridge-decay',   shells: [2,8,18,32,22,9,2] },
  { id: 'triggercmd',        symbol: 'Pu', name: 'Plutonium',   z: 94, mass: '(244)',   period: 10, group: 8,  cat: 'ACTINIDE',   service: 'TRIGGERCMD',      url: null,               electronConfig: '[Rn] 5f⁶ 7s²',         oxidation: '+4 | +3 | voice-decay | trigger', shells: [2,8,18,32,24,8,2] },
  { id: 'obsidian-remote',   symbol: 'Am', name: 'Americium',   z: 95, mass: '(243)',   period: 10, group: 9,  cat: 'ACTINIDE',   service: 'OBSIDIAN',        url: `${PRIMARY_URL}/obsidian/`, electronConfig: '[Rn] 5f⁷ 7s²',         oxidation: '+3 | +2 | note-decay | vault',    shells: [2,8,18,32,25,8,2] },
  { id: 'hue-bridge',        symbol: 'Cm', name: 'Curium',      z: 96, mass: '(247)',   period: 10, group: 10, cat: 'ACTINIDE',   service: 'HUE-BRIDGE',      url: null,                        electronConfig: '[Rn] 5f⁷ 6d¹ 7s²',     oxidation: '+3 | +4 | light-decay | media',   shells: [2,8,18,32,25,9,2] },
  { id: 'claude-terminal',   symbol: 'Cf', name: 'Californium', z: 98, mass: '(251)',   period: 10, group: 12, cat: 'ACTINIDE',   service: 'CLAUDE-TERMINAL', url: null,                        electronConfig: '[Rn] 5f¹⁰ 7s²',        oxidation: '+3 | +2 | terminal-decay | shell', shells: [2,8,18,32,28,8,2] },
  { id: 'restic-sidecar',    symbol: 'Es', name: 'Einsteinium', z: 99, mass: '(252)',   period: 10, group: 13, cat: 'ACTINIDE',   service: 'RESTIC-BACKUP',   url: null,                        electronConfig: '[Rn] 5f¹¹ 7s²',        oxidation: '+3 | +2 | snapshot-decay | archive', shells: [2,8,18,32,29,8,2] },
  // ── Bot elements — periods 1-6 and 10 ──────────────────────────────────────────
  { id: 'h',  symbol: 'H',  name: 'Hydrogen',   z: 1,  mass: '1.008',    period: 1, group: 1,  cat: 'NONMETAL',   service: 'Trailblazer',       url: null, electronConfig: '1s¹',                     oxidation: '+1 | -1 | trending | global',   shells: [1] },
  { id: 'he', symbol: 'He', name: 'Helium',      z: 2,  mass: '4.003',    period: 1, group: 18, cat: 'NOBLE',      service: 'Animation Buff',    url: null, electronConfig: '1s²',                     oxidation: '0 | 0 | 0 | inert-picks',       shells: [2] },
  { id: 'li', symbol: 'Li', name: 'Lithium',     z: 3,  mass: '6.941',    period: 2, group: 1,  cat: 'ALKALI',     service: 'Mood Ring',         url: null, electronConfig: '[He] 2s¹',                oxidation: '+1 | emotional | reactive',     shells: [2,1] },
  { id: 'c',  symbol: 'C',  name: 'Carbon',      z: 6,  mass: '12.011',   period: 2, group: 14, cat: 'NONMETAL',   service: 'Foundation',        url: null, electronConfig: '[He] 2s² 2p²',            oxidation: '+4 | -4 | +2 | essential',      shells: [2,4] },
  { id: 'o',  symbol: 'O',  name: 'Oxygen',      z: 8,  mass: '15.999',   period: 2, group: 16, cat: 'NONMETAL',   service: 'Mabel',             url: null, electronConfig: '[He] 2s² 2p⁴',            oxidation: '-2 | -1 | comfort | warm',      shells: [2,6] },
  { id: 'ne', symbol: 'Ne', name: 'Neon',        z: 10, mass: '20.180',   period: 2, group: 18, cat: 'NOBLE',      service: 'Retro Rick',        url: null, electronConfig: '[He] 2s² 2p⁶',            oxidation: '0 | 0 | decade | local',        shells: [2,8] },
  { id: 'si', symbol: 'Si', name: 'Silicon',     z: 14, mass: '28.085',   period: 3, group: 14, cat: 'METALLOID',  service: 'Algorithm',         url: null, electronConfig: '[Ne] 3s² 3p²',            oxidation: '+4 | -4 | +2 | similar',        shells: [2,8,4] },
  { id: 's',  symbol: 'S',  name: 'Sulfur',      z: 16, mass: '32.06',    period: 3, group: 16, cat: 'NONMETAL',   service: 'Sonic Boom',        url: null, electronConfig: '[Ne] 3s² 3p⁴',            oxidation: '-2 | +4 | +6 | atmos-decay',    shells: [2,8,6] },
  { id: 'cl', symbol: 'Cl', name: 'Chlorine',    z: 17, mass: '35.45',    period: 3, group: 17, cat: 'HALOGEN',    service: 'Slasher',           url: null, electronConfig: '[Ne] 3s² 3p⁵',            oxidation: '-1 | +1 | +5 | horror',         shells: [2,8,7] },
  { id: 'ti', symbol: 'Ti', name: 'Titanium',    z: 22, mass: '47.867',   period: 4, group: 4,  cat: 'TRANSITION', service: 'Blockbuster',       url: null, electronConfig: '[Ar] 3d² 4s²',            oxidation: '+4 | +3 | +2 | high-budget',    shells: [2,8,10,2] },
  { id: 'v',  symbol: 'V',  name: 'Vanadium',    z: 23, mass: '50.942',   period: 4, group: 5,  cat: 'TRANSITION', service: 'HDR Junkie',        url: null, electronConfig: '[Ar] 3d³ 4s²',            oxidation: '+5 | DV | HDR10+ | hdr-decay',  shells: [2,8,11,2] },
  { id: 'cr', symbol: 'Cr', name: 'Chromium',    z: 24, mass: '51.996',   period: 4, group: 6,  cat: 'TRANSITION', service: 'Purist',            url: null, electronConfig: '[Ar] 3d⁵ 4s¹',            oxidation: '+6 | +3 | remux | bitrate',     shells: [2,8,13,1] },
  { id: 'fe', symbol: 'Fe', name: 'Iron',        z: 26, mass: '55.845',   period: 4, group: 8,  cat: 'TRANSITION', service: 'Future Historian',  url: null, electronConfig: '[Ar] 3d⁶ 4s²',            oxidation: '+3 | +2 | award | classic',     shells: [2,8,14,2] },
  { id: 'cu', symbol: 'Cu', name: 'Copper',      z: 29, mass: '63.546',   period: 4, group: 11, cat: 'TRANSITION', service: 'Bandwidth Miser',   url: null, electronConfig: '[Ar] 3d¹⁰ 4s¹',           oxidation: '+2 | +1 | HEVC | efficient',    shells: [2,8,18,1] },
  { id: 'ag', symbol: 'Ag', name: 'Silver',      z: 47, mass: '107.868',  period: 5, group: 11, cat: 'TRANSITION', service: 'Hidden Gem',        url: null, electronConfig: '[Kr] 4d¹⁰ 5s¹',           oxidation: '+1 | critic | obscure | gem',   shells: [2,8,18,18,1] },
  { id: 'sb', symbol: 'Sb', name: 'Antimony',    z: 51, mass: '121.760',  period: 5, group: 15, cat: 'METALLOID',  service: 'Playlist Alchemist',url: null, electronConfig: '[Kr] 4d¹⁰ 5s² 5p³',      oxidation: '+5 | +3 | -3 | mood-mix',       shells: [2,8,18,18,5] },
  { id: 'au', symbol: 'Au', name: 'Gold',        z: 79, mass: '196.967',  period: 6, group: 11, cat: 'TRANSITION', service: 'The Auteur',        url: null, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',     oxidation: '+3 | +1 | obscure | critical',  shells: [2,8,18,32,18,1] },
  { id: 'hg', symbol: 'Hg', name: 'Mercury',     z: 80, mass: '200.592',  period: 6, group: 12, cat: 'TRANSITION', service: 'Shape-Shifter',     url: null, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²',     oxidation: '+2 | +1 | foreign | liquid',    shells: [2,8,18,32,18,2] },
  { id: 'pb', symbol: 'Pb', name: 'Lead',        z: 82, mass: '207.2',    period: 6, group: 14, cat: 'POST',       service: 'Heavyweight',       url: null, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', oxidation: '+4 | +2 | epic | 3hr+',        shells: [2,8,18,32,18,4] },
  { id: 'u',  symbol: 'U',  name: 'Uranium',     z: 92, mass: '238.029',  period: 10, group: 6, cat: 'ACTINIDE',   service: 'Chaos Gremlin',     url: null, electronConfig: '[Rn] 5f³ 6d¹ 7s²',        oxidation: '+6 | +4 | chaos | genre-clash', shells: [2,8,18,32,21,9,2] },
];

// ─────────────────────────────────────────────
// ALL 118 ELEMENTS for ghost cells
// [symbol, z, period, group, catKey]
// period 9 = lanthanide row, period 10 = actinide row
// ─────────────────────────────────────────────
const ALL_ELEMENTS = [
  ['H',  1,  1,  1,'NONMETAL'],['He', 2,  1, 18,'NOBLE'],
  ['Li', 3,  2,  1,'ALKALI'],  ['Be', 4,  2,  2,'ALKALINE'],['B',  5,  2, 13,'METALLOID'],['C',  6,  2, 14,'NONMETAL'],
  ['N',  7,  2, 15,'NONMETAL'],['O',  8,  2, 16,'NONMETAL'], ['F',  9,  2, 17,'HALOGEN'],  ['Ne', 10, 2, 18,'NOBLE'],
  ['Na', 11, 3,  1,'ALKALI'],  ['Mg', 12, 3,  2,'ALKALINE'],['Al', 13, 3, 13,'POST'],      ['Si', 14, 3, 14,'METALLOID'],
  ['P',  15, 3, 15,'NONMETAL'],['S',  16, 3, 16,'NONMETAL'], ['Cl', 17, 3, 17,'HALOGEN'],  ['Ar', 18, 3, 18,'NOBLE'],
  ['K',  19, 4,  1,'ALKALI'],  ['Ca', 20, 4,  2,'ALKALINE'],['Sc', 21, 4,  3,'TRANSITION'],['Ti', 22, 4,  4,'TRANSITION'],
  ['V',  23, 4,  5,'TRANSITION'],['Cr',24, 4,  6,'TRANSITION'],['Mn',25, 4,  7,'TRANSITION'],['Fe',26, 4,  8,'TRANSITION'],
  ['Co', 27, 4,  9,'TRANSITION'],['Ni',28, 4, 10,'TRANSITION'],['Cu',29, 4, 11,'TRANSITION'],['Zn',30, 4, 12,'TRANSITION'],
  ['Ga', 31, 4, 13,'POST'],    ['Ge', 32, 4, 14,'METALLOID'],['As', 33, 4, 15,'METALLOID'],['Se', 34, 4, 16,'NONMETAL'],
  ['Br', 35, 4, 17,'HALOGEN'], ['Kr', 36, 4, 18,'NOBLE'],
  ['Rb', 37, 5,  1,'ALKALI'],  ['Sr', 38, 5,  2,'ALKALINE'],['Y',  39, 5,  3,'TRANSITION'],['Zr', 40, 5,  4,'TRANSITION'],
  ['Nb', 41, 5,  5,'TRANSITION'],['Mo',42, 5,  6,'TRANSITION'],['Tc',43, 5,  7,'TRANSITION'],['Ru',44, 5,  8,'TRANSITION'],
  ['Rh', 45, 5,  9,'TRANSITION'],['Pd',46, 5, 10,'TRANSITION'],['Ag',47, 5, 11,'TRANSITION'],['Cd',48, 5, 12,'TRANSITION'],
  ['In', 49, 5, 13,'POST'],    ['Sn', 50, 5, 14,'POST'],    ['Sb', 51, 5, 15,'METALLOID'], ['Te', 52, 5, 16,'METALLOID'],
  ['I',  53, 5, 17,'HALOGEN'], ['Xe', 54, 5, 18,'NOBLE'],
  ['Cs', 55, 6,  1,'ALKALI'],  ['Ba', 56, 6,  2,'ALKALINE'],
  ['Hf', 72, 6,  4,'TRANSITION'],['Ta',73, 6,  5,'TRANSITION'],['W', 74, 6,  6,'TRANSITION'],['Re',75, 6,  7,'TRANSITION'],
  ['Os', 76, 6,  8,'TRANSITION'],['Ir',77, 6,  9,'TRANSITION'],['Pt',78, 6, 10,'TRANSITION'],['Au',79, 6, 11,'TRANSITION'],
  ['Hg', 80, 6, 12,'TRANSITION'],['Tl',81, 6, 13,'POST'],    ['Pb', 82, 6, 14,'POST'],    ['Bi', 83, 6, 15,'POST'],
  ['Po', 84, 6, 16,'METALLOID'],['At',85, 6, 17,'HALOGEN'],  ['Rn', 86, 6, 18,'NOBLE'],
  ['Fr', 87, 7,  1,'ALKALI'],  ['Ra', 88, 7,  2,'ALKALINE'],
  ['Rf',104, 7,  4,'TRANSITION'],['Db',105,7,  5,'TRANSITION'],['Sg',106,7,  6,'TRANSITION'],['Bh',107,7,  7,'TRANSITION'],
  ['Hs',108, 7,  8,'TRANSITION'],['Mt',109,7,  9,'TRANSITION'],['Ds',110,7, 10,'TRANSITION'],['Rg',111,7, 11,'TRANSITION'],
  ['Cn',112, 7, 12,'TRANSITION'],['Nh',113,7, 13,'POST'],    ['Fl',114,7, 14,'POST'],     ['Mc',115,7, 15,'POST'],
  ['Lv',116, 7, 16,'POST'],    ['Ts',117, 7, 17,'HALOGEN'],  ['Og',118,7, 18,'NOBLE'],
  // Lanthanides row 9
  ['La', 57, 9,  3,'LANTHANIDE'],['Ce',58, 9,  4,'LANTHANIDE'],['Pr',59, 9,  5,'LANTHANIDE'],['Nd',60, 9,  6,'LANTHANIDE'],
  ['Pm', 61, 9,  7,'LANTHANIDE'],['Sm',62, 9,  8,'LANTHANIDE'],['Eu',63, 9,  9,'LANTHANIDE'],['Gd',64, 9, 10,'LANTHANIDE'],
  ['Tb', 65, 9, 11,'LANTHANIDE'],['Dy',66, 9, 12,'LANTHANIDE'],['Ho',67, 9, 13,'LANTHANIDE'],['Er',68, 9, 14,'LANTHANIDE'],
  ['Tm', 69, 9, 15,'LANTHANIDE'],['Yb',70, 9, 16,'LANTHANIDE'],['Lu',71, 9, 17,'LANTHANIDE'],
  // Actinides row 10
  ['Ac', 89,10,  3,'ACTINIDE'], ['Th',90,10,  4,'ACTINIDE'], ['Pa',91,10,  5,'ACTINIDE'],  ['U', 92,10,  6,'ACTINIDE'],
  ['Np', 93,10,  7,'ACTINIDE'], ['Pu',94,10,  8,'ACTINIDE'], ['Am',95,10,  9,'ACTINIDE'],  ['Cm',96,10, 10,'ACTINIDE'],
  ['Bk', 97,10, 11,'ACTINIDE'], ['Cf',98,10, 12,'ACTINIDE'], ['Es',99,10, 13,'ACTINIDE'],  ['Fm',100,10,14,'ACTINIDE'],
  ['Md',101,10, 15,'ACTINIDE'], ['No',102,10,16,'ACTINIDE'],  ['Lr',103,10,17,'ACTINIDE'],
];

// Build fast lookup: "period-group" → service element
const SERVICE_BY_POS = Object.fromEntries(ELEMENT_REGISTRY.map(e => [`${e.period}-${e.group}`, e]));

// ─────────────────────────────────────────────
// ELECTRON ORBIT
// ─────────────────────────────────────────────
const ElectronOrbit = ({ shells, catBorder }) => {
  const numRings = shells.length;
  const radii = Array.from({ length: numRings }, (_, i) => 8 + i * 5);
  const durations = Array.from({ length: numRings }, (_, i) => 0.8 + i * 0.9);
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ top: 3 }}>
      {Array.from({ length: numRings }, (_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: radii[i] * 2, height: radii[i] * 2,
          border: `0.5px solid ${catBorder}`, opacity: 0.3,
        }}>
          {prefersReducedMotion ? (
            <div className="absolute rounded-full" style={{
              width: 3, height: 3, background: catBorder,
              top: -1.5, left: '50%', marginLeft: -1.5,
            }} />
          ) : (
            <motion.div className="absolute rounded-full" style={{
              width: 3, height: 3, background: catBorder,
              top: -1.5, left: '50%', marginLeft: -1.5,
              transformOrigin: `1.5px ${radii[i]}px`,
            }}
              animate={{ rotate: 360 }}
              transition={{ duration: durations[i], repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// EMPTY CELL (ghost element)
// ─────────────────────────────────────────────
const EmptyCell = ({ symbol, catKey }) => {
  const cat = activeCATRef.current[catKey] || activeCATRef.current.NONMETAL;
  return (
    <div style={{
      ...CELL_SIZE,
      background: cat.bg,
      border: `1px solid ${cat.border}1A`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: 0.07,
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: cat.text, fontFamily: 'sans-serif' }}>{symbol}</span>
    </div>
  );
};

// ─────────────────────────────────────────────
// ELEMENT CARD
// ─────────────────────────────────────────────
const ElementCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = stats.online === false && !stats.stale;
  const isPending = stats.online === null || stats.stale;   // STARTING or STALE

  const cardBg = cat.bg;
  const cardBorder = `${cat.border}4D`;
  const boxShadow = stats.online
    ? `0 0 12px ${cat.glow}, inset 0 0 24px ${cat.glow.replace(/[\d.]+\)$/, '0.04)')}`
    : 'none';

  const dotColor = stats.online ? '#22c55e' : isPending ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      className="cursor-pointer relative overflow-hidden select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        ...CELL_SIZE,
        background: isOffline ? 'rgba(20,20,30,0.6)' : cardBg,
        border: `1px solid ${isOffline ? 'rgba(239,68,68,0.35)' : cardBorder}`,
        filter: isOffline ? 'grayscale(0.6)' : 'none',
        boxShadow, opacity: 1,
      }}
      role="button"
      tabIndex={0}
      title={element.service || element.name}
      onClick={() => onClick(element)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(element); } }}
      whileHover={{ scale: 1.1, zIndex: 20 }}
    >
      {/* Top category strip */}
      <div style={{ height: 3, background: cat.border, opacity: 0.85 }} />

      {/* Atomic number */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 8, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {element.z}
      </div>

      {/* Status dot */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Electron orbits */}
      {stats.online && <ElectronOrbit shells={element.shells} catBorder={cat.border} />}

      {/* Symbol */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        <span style={{
          fontSize: 26, fontWeight: 700, color: cat.text, lineHeight: 1,
          textShadow: stats.online ? `0 0 14px ${cat.glow}` : 'none',
          fontFamily: 'sans-serif',
        }}>
          {element.symbol}
        </span>
      </div>

      {/* Service name */}
      <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 2, fontFamily: MONO, lineHeight: 1 }}>
        {element.service}
      </div>

      {/* Atomic mass */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {element.mass}
      </div>

    </motion.div>
  );
};

// ─────────────────────────────────────────────
// F-BLOCK PLACEHOLDER (lanthanide / actinide ref cell)
// ─────────────────────────────────────────────
const FBlockPlaceholder = ({ rangeLabel, seriesLabel, color, borderOpacity }) => (
  <div style={{
    ...CELL_SIZE,
    background: `${color}07`,
    border: `1px dashed ${color}${borderOpacity}`,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
  }}>
    <span style={{ fontSize: 9, color, opacity: 0.5,  fontFamily: MONO }}>{rangeLabel}</span>
    <span style={{ fontSize: 7, color, opacity: 0.35, fontFamily: MONO }}>{seriesLabel}</span>
  </div>
);

// ─────────────────────────────────────────────
// PERIODIC TABLE GRID
// ─────────────────────────────────────────────
const PeriodicTableGrid = ({ statsMap, onElementClick }) => {
  // Build a set of positions occupied by services
  const servicePositions = new Set(ELEMENT_REGISTRY.map(e => `${e.period}-${e.group}`));

  // Collect all cells to render
  const cells = [];

  // Ghost cells from ALL_ELEMENTS (skip positions occupied by services)
  ALL_ELEMENTS.forEach(([sym, z, period, group, catKey]) => {
    const key = `${period}-${group}`;
    if (!servicePositions.has(key)) {
      cells.push({ key, period, group, isService: false, sym, catKey });
    }
  });

  // Service element cells
  ELEMENT_REGISTRY.forEach(el => {
    cells.push({ key: `${el.period}-${el.group}`, period: el.period, group: el.group, isService: true, el });
  });

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(18, 72px)',
        gridTemplateRows: '80px 80px 80px 80px 80px 80px 80px 18px 80px 80px',
        gap: '2px',
        width: 'max-content',
        margin: '0 auto',
      }}>
        {/* Ghost + service cells */}
        {cells.map(cell => (
          <div key={cell.key} style={{ gridRow: cell.period, gridColumn: cell.group }}>
            {cell.isService
              ? <ElementCard element={cell.el} stats={statsMap[cell.el.id] || defaultStats()} onClick={onElementClick} />
              : <EmptyCell symbol={cell.sym} catKey={cell.catKey} />
            }
          </div>
        ))}

        {/* Period 6 col 3 — lanthanide placeholder */}
        <div key="la-ref" style={{ gridRow: 6, gridColumn: 3 }}>
          <FBlockPlaceholder rangeLabel="57–71" seriesLabel="La–Lu" color="#55EFC4" borderOpacity="40" />
        </div>

        {/* Period 7 col 3 — actinide placeholder */}
        <div key="ac-ref" style={{ gridRow: 7, gridColumn: 3 }}>
          <FBlockPlaceholder rangeLabel="89–103" seriesLabel="Ac–Lr" color="#FFEAA7" borderOpacity="33" />
        </div>

        {/* Row 8 spacer label */}
        <div style={{ gridRow: 8, gridColumn: '1 / span 18', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.15)', fontFamily: MONO, letterSpacing: '0.3em' }}>
            ◆ f-BLOCK SERIES ◆
          </span>
        </div>
      </div>
    </div>
  );
};

const safeHref = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// ELEMENT DETAIL PANEL
// ─────────────────────────────────────────────
const ElementDetailPanel = ({ element, stats, onClose }) => {
  const cat = element ? (activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION) : null;
  const status = element ? getStatusTier(stats.level) : null;
  const panelRef   = React.useRef(null);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    if (!element) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [element, onClose]);

  React.useEffect(() => {
    if (element) {
      triggerRef.current = document.activeElement;
      panelRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [element]);

  React.useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    if (element) {
      main.setAttribute('inert', '');
    } else {
      main.removeAttribute('inert');
    }
    return () => main.removeAttribute('inert');
  }, [element]);

  // NH-21: Live Docker profile — polls /api/docker/status/<id> while panel is open
  const [dockerProfile, setDockerProfile] = React.useState(null);
  const [restarting, setRestarting]       = React.useState(false);
  const [restartMsg, setRestartMsg]       = React.useState(null);

  React.useEffect(() => {
    if (!element?.id) { setDockerProfile(null); return; }
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/docker/status/${element.id}`);
        if (r.ok && alive) setDockerProfile(await r.json());
        else if (alive) setDockerProfile(null);
      } catch { if (alive) setDockerProfile(null); }
    };
    poll();
    const t = setInterval(poll, 15000);
    return () => { alive = false; clearInterval(t); };
  }, [element?.id]);

  const handleRestart = async () => {
    if (restarting || !element?.id) return;
    setRestarting(true);
    setRestartMsg(null);
    try {
      const r = await fetch(`/api/docker/restart/${element.id}`, { method: 'POST' });
      const d = await r.json();
      setRestartMsg(r.ok ? '✓ RESTART_INITIATED' : `✗ ${d.error || 'FAILED'}`);
    } catch { setRestartMsg('✗ NETWORK_ERROR'); }
    setRestarting(false);
    setTimeout(() => setRestartMsg(null), 4000);
  };

  return (
    <AnimatePresence>
      {element && (
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          key="detail-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed bottom-0 left-0 right-0 z-40 font-mono"
          style={{ background: '#0D0F14', borderTop: `2px solid ${cat.border}`, maxHeight: '38vh', outline: 'none' }}
        >
          <div className="max-w-screen-2xl mx-auto px-6 py-4 h-full overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                {/* Big symbol */}
                <div style={{ fontSize: 48, fontWeight: 700, color: cat.text, textShadow: `0 0 20px ${cat.glow}`, lineHeight: 1 }}>
                  {element.symbol}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: cat.text, letterSpacing: '0.2em' }}>{element.name.toUpperCase()}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>Z = {element.z} ◆ {element.mass} u</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.1em' }}>{(CATEGORY_LABELS[element.cat] || element.cat).toUpperCase()}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close detail panel"
                className="text-white/30 hover:text-white/70 transition-colors mt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.6)' }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Chemistry data */}
              <div className="space-y-2">
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>ELECTRON_CONFIGURATION</div>
                <div style={{ fontSize: 12, color: cat.text }}>{element.electronConfig}</div>
                <div style={{ ...SECTION_LABEL_STYLE, marginTop: 8, marginBottom: 4 }}>OXIDATION_STATES ◆ [GROUND | EXCITED | METASTABLE | NUCLEAR_DECAY]</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{element.oxidation}</div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ ...SECTION_LABEL_STYLE }}>CURRENT_STATE: </span>
                  <span style={{ fontSize: 9, color: status.tier > 0 ? status.glowColor : cat.text }}>{status.label}</span>
                </div>
              </div>

              {/* Right: Service stats */}
              <div className="space-y-2">
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>SERVICE_TELEMETRY ◆ {element.service}</div>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  {(() => { const _statusColor = stats.online ? '#22c55e' : (stats.online === null || stats.stale) ? '#f59e0b' : '#ef4444'; const _statusLabel = stats.online ? 'ONLINE' : stats.online === null ? 'STARTING' : stats.stale ? 'STALE' : 'OFFLINE'; return (<><div aria-hidden="true" style={{ ...STATUS_DOT_BASE, background: _statusColor, boxShadow: `0 0 6px ${_statusColor}` }} /><span style={{ fontSize: 9, color: _statusColor }}>{_statusLabel}</span></>); })()}
                </div>
                {safeHref(element.url) ? (
                  <a href={safeHref(element.url)} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', width: '100%', textAlign: 'center',
                      fontFamily: 'monospace', fontSize: 10, letterSpacing: 2,
                      color: 'rgba(100,200,255,0.8)', border: '1px solid rgba(100,200,255,0.3)',
                      padding: '8px 0', marginTop: 8, textDecoration: 'none',
                      cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,200,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    OPEN SERVICE UI →
                  </a>
                ) : (
                  <div style={{ display: 'block', width: '100%', textAlign: 'center',
                    fontFamily: 'monospace', fontSize: 10, letterSpacing: 2,
                    color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 0', marginTop: 8 }}>
                    NO_UI_AVAILABLE
                  </div>
                )}
                {/* Load bar */}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 4, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: status.tier > 0 ? status.glowColor : cat.border, borderRadius: 2 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.level}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                {stats.details?.map((d) => (
                  <div key={d.label} className="flex justify-between" style={{ fontSize: 9, paddingTop: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{d.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{d.value}</span>
                  </div>
                ))}
                {/* NH-37: Cloudflare tunnel connector list + last auth event */}
                {/* NH-26/39: Claude Terminal — host tabs, backend/mode toggles, OPEN + QR buttons */}
                {element?.id === 'claude-terminal' && (() => {
                  const ct = stats._terminal || {};
                  const [selHost, setSelHost] = React.useState('srv1');
                  const getVal = (host, key, def) =>
                    localStorage.getItem(`claude-terminal-${host}-${key}`) ?? def;
                  const setVal = (host, key, val) =>
                    localStorage.setItem(`claude-terminal-${host}-${key}`, val);
                  const [backend, setBackend] = React.useState(getVal(selHost, 'backend', 'clsh'));
                  const [mode, setMode] = React.useState(getVal(selHost, 'mode', 'claude'));

                  const switchBackend = (b) => {
                    setVal(selHost, 'backend', b); setBackend(b);
                    const ep = selHost === 'srv1' ? '/api/claude-terminal/backend' : '/api/claude-terminal-srv2/backend';
                    fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ backend: b }) });
                  };
                  const switchMode = (m) => {
                    setVal(selHost, 'mode', m); setMode(m);
                    const ep = selHost === 'srv1' ? '/api/claude-terminal/mode' : '/api/claude-terminal-srv2/mode';
                    fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: m }) });
                  };
                  const openTerminal = () => {
                    const prefix = selHost === 'srv1' ? '/terminal/' : '/terminal/srv2/';
                    window.open(`${prefix}${backend}/`, '_blank');
                  };
                  const showQR = async () => {
                    const ep = selHost === 'srv1' ? '/api/claude-terminal/qr' : '/api/claude-terminal-srv2/qr';
                    const data = await fetch(ep).then(r => r.json());
                    if (data.found) window.open(data.url, '_blank');
                  };
                  const srv1Online = ct.srv1Online;
                  const srv2Online = ct.srv2Online;

                  return (
                    <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                      {/* Host tab bar */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        {[['srv1', 'SRV-1', srv1Online], ['srv2', 'SRV-2', srv2Online]].map(([h, label, online]) => (
                          <button key={h} onClick={() => setSelHost(h)} style={{
                            fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.1em', cursor: 'pointer',
                            padding: '3px 8px', borderRadius: 3, border: '1px solid',
                            borderColor: selHost === h ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.15)',
                            background: selHost === h ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.04)',
                            color: selHost === h ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                          }}>
                            {label} <span style={{ color: online ? '#4ade80' : '#f87171' }}>●</span>
                          </button>
                        ))}
                      </div>
                      {/* Backend toggle */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                        {['clsh', 'ttyd'].map(b => (
                          <button key={b} onClick={() => switchBackend(b)} style={{
                            fontFamily: 'monospace', fontSize: 7, cursor: 'pointer',
                            padding: '2px 6px', borderRadius: 3, border: '1px solid',
                            borderColor: backend === b ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.1)',
                            background: backend === b ? 'rgba(168,85,247,0.1)' : 'transparent',
                            color: backend === b ? '#c084fc' : 'rgba(255,255,255,0.35)',
                          }}>{b.toUpperCase()}</button>
                        ))}
                        {/* Mode sub-toggle — only relevant for ttyd */}
                        {backend === 'ttyd' && ['claude', 'bash'].map(m => (
                          <button key={m} onClick={() => switchMode(m)} style={{
                            fontFamily: 'monospace', fontSize: 7, cursor: 'pointer',
                            padding: '2px 6px', borderRadius: 3, border: '1px solid',
                            borderColor: mode === m ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)',
                            background: mode === m ? 'rgba(74,222,128,0.08)' : 'transparent',
                            color: mode === m ? '#4ade80' : 'rgba(255,255,255,0.35)',
                          }}>{m.toUpperCase()}</button>
                        ))}
                      </div>
                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button onClick={openTerminal} style={{
                          fontFamily: 'monospace', fontSize: 8, cursor: 'pointer',
                          padding: '4px 10px', borderRadius: 3,
                          border: '1px solid rgba(6,182,212,0.4)',
                          background: 'rgba(6,182,212,0.1)', color: '#38bdf8',
                        }}>⎋ OPEN TERMINAL</button>
                        {backend === 'clsh' && (
                          <button onClick={showQR} style={{
                            fontFamily: 'monospace', fontSize: 8, cursor: 'pointer',
                            padding: '4px 10px', borderRadius: 3,
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)',
                          }}>📱 QR</button>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {/* NH-23: Hue automation + music toggles + room list */}
                {element?.id === 'hue-bridge' && stats._hue && (() => {
                  const d = stats._hue;
                  const toggle = async (key) => {
                    await fetch('/api/hue/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
                  };
                  return (
                    <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        {[['automation_enabled', 'AUTOMATION'], ['music_enabled', 'MUSIC']].map(([key, label]) => (
                          <button key={key} onClick={() => toggle(key)} style={{
                            fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.1em', cursor: 'pointer',
                            padding: '3px 8px', borderRadius: 3, border: '1px solid',
                            borderColor: d[key] ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.15)',
                            background: d[key] ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.04)',
                            color: d[key] ? '#4ade80' : 'rgba(255,255,255,0.4)',
                          }}>{label}: {d[key] ? 'ON' : 'OFF'}</button>
                        ))}
                      </div>
                      {(d.rooms || []).map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, paddingTop: 2, fontFamily: 'monospace' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{r.name}</span>
                          <span style={{ color: r.lights_on ? '#fde047' : 'rgba(255,255,255,0.2)' }}>
                            {r.lights_on ? `💡 ${r.brightness_pct}%` : 'OFF'}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {/* NH-37: Cloudflare tunnel connector list + last auth event */}
                {element?.id === 'cloudflared' && stats._cf && (() => {
                  const { connections = [], auth } = stats._cf;
                  return (
                    <>
                      {connections.length > 0 && (
                        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 4 }}>ACTIVE CONNECTORS</div>
                          {connections.map((c, i) => (
                            <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', paddingTop: 2, display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: 'monospace' }}>{c.colo || '—'}</span>
                              <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{c.origin_ip || '—'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {auth && (
                        <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
                          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 4 }}>LAST AUTH EVENT</div>
                          {auth.available && auth.last_event ? (
                            <>
                              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {auth.last_event.user_email || '—'}
                              </div>
                              <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                                {auth.last_event.created_at || ''}
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                              {auth.reason || 'No auth events'}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
                {/* NH-19: Tautulli-Bridge — TTS history + mDNS device selector + Cast Now */}
                {element?.id === 'tautulli-bridge' && (() => {
                  const { data: tbHistory } = useQuery({
                    queryKey: ['tb-history'],
                    queryFn: () => fetch('/api/tautulli-bridge/api/history').then(r => r.json()),
                    refetchInterval: 30_000,
                    enabled: !!element,
                  });
                  const { data: tbDevices } = useQuery({
                    queryKey: ['tb-devices'],
                    queryFn: () => fetch('/api/tautulli-bridge/api/devices').then(r => r.json()),
                    enabled: !!element,
                    staleTime: 60_000,
                  });
                  const [castText, setCastText] = React.useState('');
                  const [castDevice, setCastDevice] = React.useState('');
                  const [casting, setCasting] = React.useState(false);
                  const [castResult, setCastResult] = React.useState(null);

                  const doCast = async () => {
                    if (!castText.trim()) return;
                    setCasting(true); setCastResult(null);
                    try {
                      const r = await fetch('/api/tautulli-bridge/api/cast', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: castText.trim(), ...(castDevice ? { device_name: castDevice } : {}) }),
                      });
                      const d = await r.json();
                      setCastResult(r.ok ? `QUEUED → ${d.device}` : `ERROR: ${d.error}`);
                      if (r.ok) setCastText('');
                    } catch (e) {
                      setCastResult(`ERROR: ${e.message}`);
                    } finally {
                      setCasting(false);
                    }
                  };

                  const history = Array.isArray(tbHistory) ? tbHistory : [];
                  const devices = Array.isArray(tbDevices) ? tbDevices : [];

                  return (
                    <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                      {/* Recent announcements */}
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 6 }}>RECENT ANNOUNCEMENTS</div>
                      {history.length === 0 ? (
                        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', marginBottom: 8 }}>NO_HISTORY</div>
                      ) : (
                        <div style={{ marginBottom: 8, maxHeight: 80, overflowY: 'auto' }}>
                          {history.slice(0, 6).map((h, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              fontSize: 8, fontFamily: 'monospace', paddingBottom: 3,
                              borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: 3 }}>
                              <span style={{ color: h.success ? '#4ade80' : '#f87171', flexShrink: 0, marginRight: 6 }}>
                                {h.success ? '✓' : '✗'}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.7)', flex: 1, overflow: 'hidden',
                                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.title}</span>
                              <span style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: 6 }}>
                                {h.device_name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Cast Now */}
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 4 }}>CAST NOW</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <input
                          value={castText}
                          onChange={e => setCastText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && doCast()}
                          placeholder="Announce text…"
                          style={{ flex: '1 1 120px', fontFamily: 'monospace', fontSize: 8,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 3, padding: '4px 8px', color: 'rgba(255,255,255,0.8)',
                            outline: 'none' }}
                        />
                        {devices.length > 0 && (
                          <select value={castDevice} onChange={e => setCastDevice(e.target.value)}
                            style={{ fontFamily: 'monospace', fontSize: 8, background: 'rgba(0,0,0,0.5)',
                              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3,
                              padding: '4px 6px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                            <option value="">default</option>
                            {devices.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                          </select>
                        )}
                        <button onClick={doCast} disabled={casting || !castText.trim()} style={{
                          fontFamily: 'monospace', fontSize: 8, cursor: casting ? 'wait' : 'pointer',
                          padding: '4px 10px', borderRadius: 3,
                          border: '1px solid rgba(6,182,212,0.4)',
                          background: 'rgba(6,182,212,0.1)', color: '#38bdf8',
                          opacity: (!castText.trim() || casting) ? 0.4 : 1,
                        }}>{casting ? '…' : '▶ CAST'}</button>
                      </div>
                      {castResult && (
                        <div style={{ marginTop: 4, fontSize: 8, fontFamily: 'monospace',
                          color: castResult.startsWith('ERROR') ? '#f87171' : '#4ade80' }}>
                          {castResult}
                        </div>
                      )}
                    </div>
                  );
                })()}
                {/* NH-21: Docker profile — live status + restart for any container */}
                {dockerProfile && (
                  <div style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 6 }}>CONTAINER_PROFILE</div>
                    <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
                      {/* status pill */}
                      <span style={{
                        fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.15em',
                        padding: '2px 6px', borderRadius: 2,
                        background: dockerProfile.status === 'running' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                        border: `1px solid ${dockerProfile.status === 'running' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                        color: dockerProfile.status === 'running' ? '#4ade80' : '#f87171',
                      }}>{dockerProfile.status.toUpperCase()}</span>
                      {dockerProfile.health !== 'none' && (
                        <span style={{
                          fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.15em',
                          padding: '2px 6px', borderRadius: 2,
                          background: dockerProfile.health === 'healthy' ? 'rgba(74,222,128,0.08)' : dockerProfile.health === 'starting' ? 'rgba(245,158,11,0.08)' : 'rgba(248,113,113,0.08)',
                          border: `1px solid ${dockerProfile.health === 'healthy' ? 'rgba(74,222,128,0.25)' : dockerProfile.health === 'starting' ? 'rgba(245,158,11,0.25)' : 'rgba(248,113,113,0.25)'}`,
                          color: dockerProfile.health === 'healthy' ? '#4ade80' : dockerProfile.health === 'starting' ? '#fbbf24' : '#f87171',
                        }}>{dockerProfile.health.toUpperCase()}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', marginBottom: 2 }}>
                      RESTARTS: {dockerProfile.restart_count}
                      {dockerProfile.started_at ? (
                        <span style={{ marginLeft: 10 }}>UP_SINCE: {new Date(dockerProfile.started_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                      ) : null}
                    </div>
                    {/* Health log — last 3 checks */}
                    {dockerProfile.health_log?.length > 0 && (
                      <div style={{ marginTop: 4, marginBottom: 6 }}>
                        {dockerProfile.health_log.map((h, i) => (
                          <div key={i} style={{ fontSize: 7, fontFamily: 'monospace', color: h.exit_code === 0 ? 'rgba(74,222,128,0.6)' : 'rgba(248,113,113,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {h.exit_code === 0 ? '✓' : '✗'} {h.output || '—'}
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={handleRestart}
                      disabled={restarting}
                      style={{
                        marginTop: 4, fontFamily: 'monospace', fontSize: 8, cursor: restarting ? 'wait' : 'pointer',
                        padding: '4px 10px', borderRadius: 3,
                        border: '1px solid rgba(251,191,36,0.3)',
                        background: 'rgba(251,191,36,0.06)',
                        color: restarting ? 'rgba(255,255,255,0.3)' : 'rgba(251,191,36,0.8)',
                        opacity: restarting ? 0.5 : 1,
                      }}
                      aria-label={`Restart ${element?.id} container`}
                    >{restarting ? '⟳ RESTARTING…' : '⟳ RESTART'}</button>
                    {restartMsg && (
                      <div style={{ marginTop: 4, fontSize: 8, fontFamily: 'monospace',
                        color: restartMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>
                        {restartMsg}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// OrbitalDiagram, ELECTRON_CONFIG, METAL_NAMES, CoordComplex, JablonskiDiagram, SystemMetricsPanel — moved to SystemMetricsPanel.jsx

// ─────────────────────────────────────────────
// DISCOVERY TICKER (auto-scrolling reel)
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// DISCOVERY TICKER (auto-scrolling reel)
// ─────────────────────────────────────────────
const DiscoveryTicker = ({ items, label, sublabel, accentColor = 'indigo', type = 'film' }) => {
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);
  const rafRef    = useRef(null);

  const accentMap = {
    amber:  { dot: '#f59e0b', card: 'from-amber-500/20 to-amber-900/40 border-amber-500/30', icon: <Film size={11} className="text-amber-400" />, typeLabel: 'COMPOUND' },
    blue:   { dot: '#3b82f6', card: 'from-blue-500/20 to-blue-900/40 border-blue-500/30',   icon: <Tv   size={11} className="text-blue-400"  />, typeLabel: 'REACTION' },
    purple: { dot: '#a855f7', card: 'from-purple-500/20 to-purple-900/40 border-purple-500/30', icon: <Disc size={11} className="text-purple-400" />, typeLabel: 'ISOTOPE' },
  };
  const accent = accentMap[accentColor] ?? accentMap.amber;

  useEffect(() => {
    // P1-10: respect prefers-reduced-motion — do not run continuous scroll animation
    if (prefersReducedMotion) return;
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    const tick = () => {
      if (!pausedRef.current && el.scrollWidth > el.clientWidth) {
        pos += 0.6;
        const half = el.scrollWidth / 2;
        if (pos >= half) pos = 0;
        el.scrollLeft = pos;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items]);

  const getRelative = (ts) => {
    const diff = Date.now() / 1000 - ts;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getItemUrl = (item) => {
    if (type === 'film'   && item.tmdbId) return `https://www.themoviedb.org/movie/${item.tmdbId}`;
    if (type === 'series' && item.tvdbId) return `https://www.thetvdb.com/dereferrer/series/${item.tvdbId}`;
    if (type === 'music'  && item.mbid)   return `https://musicbrainz.org/release/${item.mbid}`;
    return null;
  };

  const display = items.length > 0
    ? [...items, ...items]
    : Array.from({ length: 8 }, (_, i) => ({ id: `sk-${i}`, skeleton: true }));

  return (
    <div className="rounded-xl border border-white/10 backdrop-blur-md bg-black/40 shadow-2xl overflow-hidden transition-all duration-500">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b text-[9px] tracking-[0.25em] uppercase border-white/10 text-white/35 bg-white/5">
        <span className="w-1.5 h-1.5 rounded-full motion-safe:animate-pulse" style={{ background: accent.dot }} />
        {label} ◆ {sublabel}
      </div>
      <div className="p-4">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-hidden pb-2"
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {display.map((item, idx) => {
            if (item.skeleton) return (
              <div key={`${item.id}-${idx}`} className="flex-shrink-0 w-32 h-44 rounded-lg bg-white/5 border border-white/5 motion-safe:animate-pulse" />
            );
            // UX guard only — prevents constructing malformed proxy URLs from Plex API data.
            // This is NOT a security control; the authoritative SSRF protection is the
            // nginx arg_url regex in nginx.conf.template (limit_except + regex anchor).
            const isPlexThumb = (t) =>
              typeof t === 'string' &&
              t.startsWith('/library/') &&
              !t.includes('://') &&
              !t.includes('%2f') &&
              !t.includes('%2F');
            const thumbUrl = item.thumb && isPlexThumb(item.thumb)
              ? `/api/plex/photo/:/transcode?width=200&height=280&url=${encodeURIComponent(item.thumb)}`
              : null;
            const itemUrl = getItemUrl(item);
            return (
              <motion.div
                key={`${item.ratingKey}-${idx}`}
                whileHover={itemUrl ? { scale: 1.04, y: -3 } : {}}
                className={`flex-shrink-0 w-32 h-44 rounded-lg border bg-gradient-to-t ${accent.card} overflow-hidden relative group ${itemUrl ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {thumbUrl && (
                  <img src={thumbUrl} alt={`${item.title} ${type === 'music' ? 'album art' : 'poster'}`} loading="lazy" onError={e => e.currentTarget.style.display = 'none'} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 transition-opacity" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {itemUrl && (
                  <a href={itemUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0" aria-label={`Open ${item.title} in external database`}>
                    <span className="absolute top-1.5 right-1.5 text-white/0 group-hover:text-white/60 transition-colors text-[10px] leading-none select-none">↗</span>
                  </a>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 pointer-events-none">
                  <div className="flex items-center gap-1 mb-0.5 opacity-70">
                    {accent.icon}
                    <span className="text-[8px] font-mono uppercase tracking-wider">{accent.typeLabel}</span>
                  </div>
                  <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{item.title}</p>
                  {item.addedAt && (
                    <p className="text-white/40 text-[8px] font-mono mt-0.5">discovered {getRelative(item.addedAt)}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TABBED TICKER
// ─────────────────────────────────────────────
function TabbedTicker({ tabs }) {
  const [activeTab, setActiveTab] = React.useState(0);
  return (
    <div>
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 0 }}>
        {tabs.map((tab, i) => (
          <button key={tab.label} onClick={() => setActiveTab(i)}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/60"
            style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: 2,
              padding: '6px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              color: activeTab === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
              borderBottom: activeTab === i ? '2px solid rgba(100,200,255,0.7)' : '2px solid transparent' }}>
            {tab.label}
          </button>
        ))}
      </div>
      {tabs[activeTab].content}
    </div>
  );
}

// ─────────────────────────────────────────────
// LAB JOURNAL
// ─────────────────────────────────────────────
const LabJournal = ({ logs, title }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [filter, setFilter] = React.useState('ALL');

  const typeStyle = (t) => {
    if (t === 'success') return 'text-emerald-400';
    if (t === 'error')   return 'text-red-400';
    if (t === 'warn')    return 'text-amber-400';
    return 'text-cyan-400';
  };
  const typeGlyph = (t) => {
    if (t === 'success') return '✓';
    if (t === 'error')   return '✗';
    if (t === 'warn')    return '⚠';
    return 'ℹ';
  };

  const services = ['ALL', ...new Set(logs.map(e => e.service).filter(Boolean))];
  const visibleEntries = filter === 'ALL' ? logs : logs.filter(e => e.service === filter);

  return (
    <div className="rounded-xl border border-white/10 backdrop-blur-md bg-black/40 shadow-2xl overflow-hidden font-mono transition-all duration-500">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b text-[9px] tracking-[0.25em] uppercase border-white/10 text-white/35 bg-white/5">
        <Terminal size={10} className="opacity-60" />
        {title ?? 'LAB_JOURNAL ◆ Observation_Log'}
        <span className="ml-auto text-white/20 motion-safe:animate-[blink_1s_step-end_infinite]">█</span>
        <button onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse log' : 'Expand log'}
          aria-controls="lab-journal-entries"
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.4)',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            padding: '1px 6px', cursor: 'pointer', letterSpacing: 1, marginLeft: 8 }}>
          {expanded ? '▲ COLLAPSE' : '▼ EXPAND'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '4px 8px', flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {services.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 1,
              padding: '4px 8px', minHeight: 28, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)',
              background: filter === s ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: filter === s ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
            {s}
          </button>
        ))}
      </div>
      <div id="lab-journal-entries" className="p-4 space-y-1.5 flex flex-col overflow-y-auto"
        style={{ height: expanded ? 'min(60vh, 400px)' : '15rem', transition: 'height 0.3s ease' }}>
        {visibleEntries.map((log) => (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id}
            className="flex gap-3 text-[10px] leading-tight"
          >
            <span className="text-white/20 shrink-0 tabular-nums">[{log.time}]</span>
            <span className={`shrink-0 ${typeStyle(log.type)}`}>{typeGlyph(log.type)}</span>
            <span className={`font-bold shrink-0 ${typeStyle(log.type)}`}>{log.service}:</span>
            <span className="text-white/65">{log.message}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ACTIVE OPERATIONS BAR
// ─────────────────────────────────────────────
function ActiveOperationsBar({ statsMap }) {
  const chips = Object.entries(statsMap)
    .filter(([, s]) => s.online && s.level > 60 && s.details?.length)
    .map(([key, s]) => ({
      key,
      label: key.toUpperCase(),
      detail: `${s.details[0]?.label}: ${s.details[0]?.value}`,
    }));

  if (!chips.length) return null;

  return (
    <div style={{ display: 'flex', gap: 8, padding: '6px 16px', flexWrap: 'wrap',
      borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
      {chips.map(c => (
        <span key={c.key} style={{ fontFamily: 'monospace', fontSize: 10,
          color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3,
          padding: '2px 8px', letterSpacing: 1 }}>
          {c.label}: {c.detail}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// LIVE CLOCK — NH-14
// Extracted to module scope: 1-second tick only re-renders this component,
// not the entire PeriodicHeader.
// ─────────────────────────────────────────────
const LiveClock = () => {
  const [clockTime, setClockTime] = React.useState(
    () => new Date().toLocaleTimeString('en-US', { hour12: false })
  );
  React.useEffect(() => {
    const t = setInterval(
      () => setClockTime(new Date().toLocaleTimeString('en-US', { hour12: false })),
      1000
    );
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)',
      letterSpacing: '0.12em', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4,
      padding: '4px 8px' }}>
      {clockTime}
    </span>
  );
};

// ─────────────────────────────────────────────
// PERIODIC HEADER
// ─────────────────────────────────────────────
const PeriodicHeader = ({ globalTier, lastPolledAt, healthColor, dashboardMode, setDashboardMode, modeThemes }) => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const tier = globalTier || getStatusTier(0);
  // Map tier.color (Tailwind class) to an inline color for the badge
  const badgeColorMap = {
    'text-cyan-400':   { text: '#22d3ee', border: 'rgba(6,182,212,0.3)',  bg: 'rgba(8,51,68,0.2)',   dot: '#22d3ee'  },
    'text-yellow-300': { text: '#fde047', border: 'rgba(250,204,21,0.3)', bg: 'rgba(66,54,8,0.2)',   dot: '#fde047'  },
    'text-amber-400':  { text: '#fb923c', border: 'rgba(245,158,11,0.4)', bg: 'rgba(69,26,3,0.2)',   dot: '#fb923c'  },
    'text-red-400':    { text: '#f87171', border: 'rgba(239,68,68,0.5)',  bg: 'rgba(69,10,10,0.2)',  dot: '#f87171'  },
  };
  const badgeStyle = healthColor || badgeColorMap[tier.color] || badgeColorMap['text-cyan-400'];
  return (
    <header className="px-8 pt-6 pb-4 flex items-center justify-between border-b border-white/5">
      <div>
        <h1 className="text-2xl font-light tracking-tighter text-white">
          ELEMENT_TABLE<span className="text-cyan-400 font-bold">.SYS</span>
        </h1>
        <p className="text-[9px] font-mono text-white/30 tracking-[0.3em] mt-0.5">
          Period 4 ◆ Group {dateStr} ◆ Homelab Services Dashboard
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <DashboardModeToggle mode={dashboardMode} setMode={setDashboardMode} />
        <ThemeSelector dashboardMode={dashboardMode} modeThemes={modeThemes} />
        <RandomizerButton dashboardMode={dashboardMode} setDashboardMode={setDashboardMode} />
        {/* NH-14: live clock — rendered as separate component to isolate 1s re-renders */}
        <LiveClock />
        {lastPolledAt && (
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em' }}>
            LAST_POLL: {lastPolledAt}
          </span>
        )}
        {/* THEME_INVARIANT: badgeColorMap status tier colors (cyan/yellow/amber/red) stay fixed across themes */}
        <div style={{ fontSize: 9, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em',
          padding: '6px 12px', border: `1px solid ${badgeStyle.border}`, borderRadius: 4,
          color: badgeStyle.text, background: badgeStyle.bg, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="motion-safe:animate-pulse" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: badgeStyle.dot }} />
          {tier.label}
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
let logCounter = 0;
// ─────────────────────────────────────────────
// BOT COMPONENTS
// ─────────────────────────────────────────────

const BotDetailPanel = ({ bot, result, onClose }) => {
  const PLEX_BASE = `${PRIMARY_URL}:32400`;
  const panelRef  = useRef(null);
  const triggerRef = useRef(null);

  const [requestStatus, setRequestStatus] = useState({});

  // Capture the element that opened the panel so we can return focus on close
  useEffect(() => {
    if (bot) {
      triggerRef.current = document.activeElement;
      panelRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [bot]);

  // Escape key closes the panel
  useEffect(() => {
    if (!bot) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [bot, onClose]);

  const handleRequest = async (item) => {
    setRequestStatus(s => ({ ...s, [item.tmdb_id]: 'loading' }));
    try {
      const r = await fetch('/api/seerr/api/v1/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaType: item.metadata?.media_type || 'movie',
          mediaId: item.tmdb_id,
        }),
      });
      setRequestStatus(s => ({ ...s, [item.tmdb_id]: r.ok ? 'done' : 'error' }));
    } catch {
      setRequestStatus(s => ({ ...s, [item.tmdb_id]: 'error' }));
    }
  };

  if (!bot) return null;
  const cat = activeCATRef.current[bot.cat] || activeCATRef.current.TRANSITION;
  const items = result?.items ?? [];

  return (
    <AnimatePresence>
      {bot && (
        <>
          <motion.div
            key="bot-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
            onClick={onClose}
          />
          <motion.div
            key="bot-panel"
            ref={panelRef}
            tabIndex={-1}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
              maxHeight: '65vh', overflowY: 'auto',
              background: 'rgba(15,17,23,0.97)',
              borderTop: `2px solid ${cat.border}`,
              backdropFilter: 'blur(16px)',
              padding: '20px 24px 32px',
              fontFamily: MONO,
              outline: 'none',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.3em' }}>
                  GROUP_{bot.group} ◆ BOT_{bot.z}
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, color: cat.text, textShadow: `0 0 12px ${cat.glow}` }}>
                    {bot.symbol}
                  </span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>{bot.bot_name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{bot.desc}</div>
                  </div>
                </div>
                {result && (
                  <div style={{ marginTop: 6, fontSize: 11, color: cat.text }}>
                    {result.load_label} {result.cached ? '· cached' : ''}
                  </div>
                )}
              </div>
              <button onClick={onClose} aria-label="Close bot panel" className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60" style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 12 }}>
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', padding: '24px 0' }}>
                {result?.online === false ? 'Bot offline' : 'No results yet — polling…'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(255,255,255,0.04)', borderRadius: 4,
                    padding: '8px 12px', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {item.poster_path && typeof item.poster_path === 'string' && item.poster_path.startsWith('https://') && (
                      <img src={item.poster_path} alt="" style={{ width: 36, height: 54, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title} {item.year ? <span style={{ color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>({item.year})</span> : null}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{item.reason}</div>
                    </div>
                    {/* Group A/C/D: Plex link */}
                    {item.plex_key && (
                      <button
                        aria-label={`Open ${item.title} in Plex`}
                        onClick={() => window.open(`${PLEX_BASE}/web/#!/server/details?key=${encodeURIComponent(item.plex_key)}`, '_blank')}
                        style={{
                          fontSize: 10, padding: '4px 8px', borderRadius: 3,
                          background: 'rgba(229,160,13,0.15)', border: '1px solid rgba(229,160,13,0.4)',
                          color: '#e5a00d', cursor: 'pointer', flexShrink: 0, fontFamily: MONO,
                        }}
                      >
                        PLEX
                      </button>
                    )}
                    {/* Group B: Request button */}
                    {!item.plex_key && item.tmdb_id && (
                      <button
                        aria-label={`Request ${item.title}`}
                        onClick={() => handleRequest(item)}
                        disabled={requestStatus[item.tmdb_id] === 'done' || requestStatus[item.tmdb_id] === 'loading'}
                        style={{
                          fontSize: 10, padding: '4px 8px', borderRadius: 3,
                          background: requestStatus[item.tmdb_id] === 'done'
                            ? 'rgba(34,197,94,0.15)'
                            : 'rgba(162,155,254,0.15)',
                          border: `1px solid ${requestStatus[item.tmdb_id] === 'done' ? 'rgba(34,197,94,0.4)' : 'rgba(162,155,254,0.4)'}`,
                          color: requestStatus[item.tmdb_id] === 'done' ? '#22c55e' : '#a29bfe',
                          cursor: requestStatus[item.tmdb_id] ? 'default' : 'pointer',
                          opacity: requestStatus[item.tmdb_id] === 'loading' ? 0.6 : 1,
                          flexShrink: 0, fontFamily: MONO,
                        }}
                      >
                        {requestStatus[item.tmdb_id] === 'done' ? 'SENT' :
                         requestStatus[item.tmdb_id] === 'loading' ? '↺' :
                         requestStatus[item.tmdb_id] === 'error' ? 'ERR' : 'REQUEST'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const makeLog = (service, message, type) => ({
  id: `${Date.now()}-${++logCounter}`,
  service,
  message,
  type,
  time: new Date().toLocaleTimeString('en-US', { hour12: false }),
});

// ── DF-08: FreshRSS Headlines Ticker ─────────────────────────────────────────
const FreshRssTickerWidget = () => {
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);
  const rafRef    = useRef(null);
  const [collapsed, setCollapsed] = useState(false);

  const { data, isError } = useQuery({
    queryKey: ['freshrss-headlines'],
    queryFn: () => fetch('/api/flask/freshrss/headlines?limit=20').then(r => r.json()),
    refetchInterval: 15 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const items = Array.isArray(data) ? data : [];
  const unreadCount = items.filter(i => !i.is_read).length;
  // duplicate items for seamless loop
  const doubled = [...items, ...items];

  useEffect(() => {
    if (prefersReducedMotion || collapsed) return;
    const el = scrollRef.current;
    if (!el) return;
    let pos = 0;
    const tick = () => {
      if (!pausedRef.current && el.scrollWidth > el.clientWidth) {
        pos += 0.5;
        const half = el.scrollWidth / 2;
        if (pos >= half) pos = 0;
        el.scrollLeft = pos;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [collapsed, items.length]);

  if (isError || (data && data.error)) return null;
  if (items.length === 0) return null;

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10, padding: '10px 14px', marginBottom: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : 8 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.25em' }}>
          ◆ NEWS_FEED ◆ FreshRSS
          {unreadCount > 0 && (
            <span style={{ marginLeft: 8, background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.4)',
              color: '#38bdf8', padding: '0 5px', borderRadius: 10, fontSize: 7 }}>
              {unreadCount} unread
            </span>
          )}
        </div>
        <button onClick={() => setCollapsed(c => !c)} style={{
          fontFamily: 'monospace', fontSize: 7, cursor: 'pointer',
          background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3,
          color: 'rgba(255,255,255,0.3)', padding: '1px 6px',
        }}>{collapsed ? '▼' : '▲'}</button>
      </div>
      {!collapsed && (
        <div
          ref={scrollRef}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          style={{ display: 'flex', gap: 16, overflowX: 'hidden', cursor: 'default' }}
        >
          {doubled.map((item, i) => (
            <a key={i} href={item.url || '#'} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                textDecoration: 'none', padding: '4px 10px',
                background: 'rgba(255,255,255,0.04)', borderRadius: 5,
                border: '1px solid rgba(255,255,255,0.07)' }}>
              {item.source && (
                <span style={{ fontFamily: 'monospace', fontSize: 7, letterSpacing: '0.1em',
                  color: '#38bdf8', background: 'rgba(6,182,212,0.1)',
                  border: '1px solid rgba(6,182,212,0.25)', borderRadius: 3, padding: '0 4px',
                  flexShrink: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.source}
                </span>
              )}
              <span style={{ fontFamily: 'monospace', fontSize: 8, color: item.is_read ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)',
                whiteSpace: 'nowrap', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </span>
              {item.published_at > 0 && (
                <span style={{ fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
                  {Math.round((Date.now() / 1000 - item.published_at) / 3600)}h
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

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
  const { setCurrentModeThemes } = useContext(ThemeContext) ?? {};

  // ── Dashboard mode ──
  const [dashboardMode, setDashboardMode] = useState(() => {
    const stored = localStorage.getItem('jenkins-media-dashboard-mode');
    // ARCH REQUIREMENT: Object.keys(MODE_THEMES) is the single source of truth for valid modes.
    // CONFLICT RESOLVED ARCH-01: hardcoded array replaced — adding a mode to themeConfig.js
    // now automatically validates here without a manual edit to this line.
    return Object.keys(MODE_THEMES).includes(stored) ? stored : 'CHEM';
  });

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
  const [tautulliStats, setTautulliStats] = useState(defaultStats());
  const [tautulliBridgeStats, setTautulliBridgeStats] = useState(defaultStats());
  const [seerrStats, setSeerrStats] = useState(defaultStats());
  const [tunarrStats, setTunarrStats] = useState(defaultStats());
  const [radarrStats, setRadarrStats] = useState(defaultStats());
  const [sonarrStats, setSonarrStats] = useState(defaultStats());
  const [lidarrStats, setLidarrStats] = useState(defaultStats());
  const [prowlarrStats, setProwlarrStats] = useState(defaultStats());
  const [qbStats, setQbStats] = useState(defaultStats());
  const [sabnzbdStats, setSabnzbdStats] = useState(defaultStats());
  const [qbTorrents, setQbTorrents] = useState([]);
  const [sabnzbdQueue, setSabnzbdQueue] = useState({ slots: [], speed: '0', timeleft: '0:00:00' });
  const [cloudflaredStats, setCloudflaredStats] = useState(defaultStats());
  const [notifiarrStats, setNotifiarrStats] = useState(defaultStats());
  const [flaresolverrStats, setFlaresolverrStats] = useState(defaultStats());
  const [musicbrainzStats, setMusicbrainzStats] = useState(defaultStats());
  const [musicbrainzLocalStats, setMusicbrainzLocalStats] = useState(defaultStats());
  const [bazarrStats, setBazarrStats] = useState(defaultStats());
  const [resticStats, setResticStats] = useState(defaultStats());
  const [hueStats, setHueStats] = useState(defaultStats());
  const [terminalStats, setTerminalStats] = useState(defaultStats());
  const [protonvpnStats, setProtonvpnStats] = useState(defaultStats());
  const [vpnForwardedPort, setVpnForwardedPort] = useState(null);
  const [qbitListenPort, setQbitListenPort] = useState(null);

  // ── Bot state ──
  const [botResults, setBotResults] = useState(
    () => Object.fromEntries(BOT_REGISTRY.map(b => [b.id, null]))
  );
  const [selectedBot, setSelectedBot] = useState(null);
  const botIntervals = useRef([]);

  // ── System metrics — moved to SystemMetricsPanel.jsx ──

  // ── Weather ──
  const [weatherStats, setWeatherStats] = useState({
    temp: null, feelsLike: null, humidity: null, windSpeed: null,
    condition: null, state: 'GROUND_STATE', online: false,
  });

  // ── Quote widget ──
  const [quote, setQuote] = useState({ text: '', author: '', loading: true, error: false });

  // ── On This Day widget ──
  const [history, setHistory] = useState({ events: [], loading: true, error: false });

  // ── Plex recently added ──
  const [recentMovies,  setRecentMovies]  = useState([]);
  const [recentShows,   setRecentShows]   = useState([]);
  const [recentAlbums,  setRecentAlbums]  = useState([]);

  // NH-01, NH-03, NH-06, NH-07 — moved to PlexEcosystemRow.jsx and SecurityBadgeRow.jsx

  // NH-10: Weather forecast (3-day) and data age
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherFetchedAt, setWeatherFetchedAt] = useState(null);
  const [weatherAge, setWeatherAge] = useState(null);

  // NH-12, NH-15 — moved to SecurityBadgeRow.jsx

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

  // ── Selected element for detail panel ──
  const [selectedElement, setSelectedElement] = useState(null);
  // Stable reference — prevents the Escape useEffect in ElementDetailPanel from
  // re-registering the keydown listener on every render.
  const handleClosePanel = useCallback(() => setSelectedElement(null), []);
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

  // ── Bot polling ──
  useEffect(() => {
    const intervals = botIntervals.current;
    const fetchBot = async (bot, idx) => {
      await new Promise(r => setTimeout(r, idx * 2000)); // stagger 2s per bot
      const poll = async () => {
        if (document.hidden) return;
        try {
          const res = await fetch(`/api/media-bot/bots/${bot.id}/recommend`);
          if (!res.ok) throw new Error(`${res.status}`);
          const data = await res.json();
          setBotResults(prev => ({ ...prev, [bot.id]: data }));
        } catch {
          setBotResults(prev => ({ ...prev, [bot.id]: { ...(prev[bot.id] ?? {}), online: false } }));
        }
      };
      poll();
      intervals.push(setInterval(poll, BOT_POLL_MS));
    };
    BOT_REGISTRY.forEach(fetchBot);
    return () => intervals.forEach(clearInterval);
  }, []);

  // ── Bot status summary log (debounced — fires once after all bots have reported) ──
  const botLogTimer = useRef(null);
  useEffect(() => {
    const allReported = BOT_REGISTRY.every(b => botResults[b.id] !== null);
    if (!allReported) return;
    clearTimeout(botLogTimer.current);
    botLogTimer.current = setTimeout(() => {
      const online = BOT_REGISTRY.filter(b => botResults[b.id]?.online !== false).length;
      const total = BOT_REGISTRY.length;
      const type = online === total ? 'success' : online >= total / 2 ? 'warn' : 'error';
      addLog('BOTS', `${online}/${total} Online`, type);
    }, 5000);
    return () => clearTimeout(botLogTimer.current);
  }, [botResults, addLog]);

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

  // NH-01 PLEX LIBRARY STATS — moved to PlexEcosystemRow.jsx

  // ── TAUTULLI ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/tautulli/api/v2?cmd=get_activity`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const streams = parseInt(data?.response?.data?.stream_count ?? 0);
        const level = Math.min((streams / 5) * 100, 100);
        setTautulliStats({
          level, isBoiling: streams > 0, online: true,
          details: [
            { label: 'STREAMS', value: String(streams) },
            { label: 'LAN_BW', value: `${data?.response?.data?.lan_bandwidth ?? 0} kbps` },
          ]
        });
        addLog('TAUTULLI', `Active streams: ${streams}`, 'success');
      } catch (err) {
        setTautulliStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('TAUTULLI', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // NH-03 TAUTULLI HISTORY — moved to PlexEcosystemRow.jsx

  // NH-06 PORT AUDIT — moved to SecurityBadgeRow.jsx

  // NH-07 PLEX ON DECK — moved to PlexEcosystemRow.jsx

  // NH-12 UFW STATUS — moved to SecurityBadgeRow.jsx

  // NH-15 KEY AUDIT — moved to SecurityBadgeRow.jsx

  // ── TAUTULLI-BRIDGE ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/tautulli-bridge/health`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const degraded = data?.status === 'degraded';
        const issues = data?.issues ?? [];
        setTautulliBridgeStats({
          level: degraded ? 50 : 0,
          isBoiling: false,
          online: true,
          details: [
            { label: 'STATUS', value: data?.status?.toUpperCase() ?? 'OK' },
            ...(issues.length ? [{ label: 'ISSUES', value: String(issues.length) }] : []),
          ]
        });
        addLog('TAUTULLI-BRIDGE', degraded ? `Degraded: ${issues.join(', ')}` : 'Healthy', degraded ? 'warn' : 'success');
      } catch (err) {
        setTautulliBridgeStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('TAUTULLI-BRIDGE', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── SEERR ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/seerr/api/v1/request?take=50&skip=0&filter=pending&sort=added`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const pending = data?.pageInfo?.results ?? data?.results?.length ?? 0;
        const level = Math.min((pending / 20) * 100, 100);
        setSeerrStats({
          level, isBoiling: pending > 0, online: true,
          details: [{ label: 'PENDING', value: String(pending) }]
        });
        addLog('SEERR', `Pending requests: ${pending}`, 'success');
      } catch (err) {
        setSeerrStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('SEERR', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── TUNARR (Secondary) ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/tunarr/api/channels`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const channels = Array.isArray(data) ? data : data?.data ?? [];
        const total = channels.length;
        const active = channels.filter(c => c.transcoding || c.active).length;
        const level = total > 0 ? Math.min((active / total) * 100, 100) : 0;
        setTunarrStats({
          level, isBoiling: active > 0, online: true,
          details: [
            { label: 'CHANNELS', value: String(total) },
            { label: 'ACTIVE', value: String(active) },
          ]
        });
        addLog('TUNARR', `Channels: ${active}/${total} active`, 'success');
      } catch (err) {
        setTunarrStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('TUNARR', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── RADARR ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/radarr/api/v3/queue?pageSize=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const count = data?.totalRecords ?? data?.records?.length ?? 0;
        const level = Math.min((count / 20) * 100, 100);
        setRadarrStats({
          level, isBoiling: count > 0, online: true,
          details: [{ label: 'QUEUE', value: String(count) }]
        });
        addLog('RADARR', `Queue: ${count} items`, count > 0 ? 'success' : 'info');
      } catch (err) {
        setRadarrStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('RADARR', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── SONARR ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/sonarr/api/v3/queue?pageSize=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const count = data?.totalRecords ?? data?.records?.length ?? 0;
        const level = Math.min((count / 20) * 100, 100);
        setSonarrStats({
          level, isBoiling: count > 0, online: true,
          details: [{ label: 'QUEUE', value: String(count) }]
        });
        addLog('SONARR', `Queue: ${count} items`, count > 0 ? 'success' : 'info');
      } catch (err) {
        setSonarrStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('SONARR', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── LIDARR ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/lidarr/api/v1/queue?pageSize=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const count = data?.totalRecords ?? data?.records?.length ?? 0;
        const level = Math.min((count / 20) * 100, 100);
        setLidarrStats({
          level, isBoiling: count > 0, online: true,
          details: [{ label: 'QUEUE', value: String(count) }]
        });
        addLog('LIDARR', `Queue: ${count} items`, count > 0 ? 'success' : 'info');
      } catch (err) {
        setLidarrStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('LIDARR', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── PROWLARR ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/prowlarr/api/v1/indexer`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const indexers = Array.isArray(data) ? data : [];
        const enabled = indexers.filter(i => i.enable).length;
        const total = indexers.length;
        const level = total > 0 ? Math.min((enabled / total) * 100, 100) : 0;
        setProwlarrStats({
          level, isBoiling: enabled > 0, online: true,
          details: [
            { label: 'ENABLED', value: String(enabled) },
            { label: 'TOTAL', value: String(total) },
          ]
        });
        addLog('PROWLARR', `Indexers: ${enabled}/${total} enabled`, 'success');
      } catch (err) {
        setProwlarrStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('PROWLARR', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── QBITTORRENT ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        // No explicit login — requires "Bypass authentication for clients on localhost"
        // enabled in qBittorrent WebUI settings (Tools → Options → Web UI).
        const res = await fetch(`/api/qbittorrent/api/v2/torrents/info`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const torrents = await res.json();
        const total = torrents.length;
        const active = torrents.filter(t => ['downloading', 'uploading', 'stalledDL', 'forcedDL', 'forcedUP'].includes(t.state)).length;
        const level = total > 0 ? Math.min((active / total) * 100, 100) : 0;
        const dlSpeed = torrents.reduce((s, t) => s + (t.dlspeed || 0), 0);
        setQbStats({
          level, isBoiling: active > 0, online: true,
          details: [
            { label: 'ACTIVE', value: `${active}/${total}` },
            { label: 'DL_SPEED', value: `${(dlSpeed / 1024 / 1024).toFixed(1)} MB/s` },
          ]
        });
        addLog('QBITTORRENT', `${active} active / ${total} total torrents`, active > 0 ? 'success' : 'info');
      } catch (err) {
        setQbStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('QBITTORRENT', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── SABNZBD ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/sabnzbd/api?mode=queue&output=json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const queue = data?.queue;
        const slots = parseInt(queue?.noofslots ?? 0);
        const kbps = parseFloat(queue?.kbpersec ?? 0);
        const limitKbps = parseFloat(queue?.speedlimit_abs ?? 0);
        const level = limitKbps > 0 ? Math.min((kbps / limitKbps) * 100, 100) : Math.min((slots / 20) * 100, 100);
        setSabnzbdStats({
          level, isBoiling: slots > 0, online: true,
          details: [
            { label: 'QUEUE', value: String(slots) },
            { label: 'SPEED', value: `${(kbps / 1024).toFixed(1)} MB/s` },
          ]
        });
        addLog('SABNZBD', `Queue: ${slots} items @ ${(kbps / 1024).toFixed(1)} MB/s`, 'success');
      } catch (err) {
        setSabnzbdStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('SABNZBD', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── CLOUDFLARED — NH-37: CF API tunnel health ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const [tunnelRes, connRes, authRes] = await Promise.all([
          fetch('/api/flask/cloudflare/tunnel'),
          fetch('/api/flask/cloudflare/tunnel/connections'),
          fetch('/api/flask/cloudflare/tunnel/auth-events'),
        ]);
        const tunnel = tunnelRes.ok ? await tunnelRes.json() : {};
        const connData = connRes.ok ? await connRes.json() : {};
        const authData = authRes.ok ? await authRes.json() : {};
        const healthy = tunnel.status === 'healthy' && (tunnel.connector_count ?? 0) >= 1;
        const degraded = tunnel.status === 'degraded';
        setCloudflaredStats({
          level: healthy ? 30 : degraded ? 60 : 0,
          isBoiling: healthy, online: healthy || degraded,
          details: [
            { label: 'STATUS',     value: (tunnel.status || 'unknown').toUpperCase() },
            { label: 'CONNECTORS', value: String(tunnel.connector_count ?? 0) },
            { label: 'TUNNEL',     value: tunnel.name || '—' },
          ],
          _cf: { tunnel, connections: connData.connections || [], auth: authData },
        });
        addLog('CLOUDFLARED', `Tunnel ${tunnel.status} — ${tunnel.connector_count ?? 0} connector(s)`, healthy ? 'success' : 'warn');
      } catch (err) {
        setCloudflaredStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('CLOUDFLARED', `CF API error: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, 60_000);
    return () => clearInterval(t);
  }, [addLog]);

  // ── NOTIFIARR ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/notifiarr/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setNotifiarrStats({
          level: 0, isBoiling: false, online: true,
          details: [{ label: 'STATUS', value: 'Running' }]
        });
        addLog('NOTIFIARR', `Client online`, 'success');
      } catch (err) {
        setNotifiarrStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('NOTIFIARR', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── FLARESOLVERR ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/flaresolverr/health`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const online = data?.status === 'ok' || data?.status === 'healthy';
        setFlaresolverrStats({
          level: online ? 40 : 0, isBoiling: false, online,
          details: [{ label: 'STATUS', value: data?.status ?? 'unknown' }]
        });
        addLog('FLARESOLVERR', online ? 'Solver online — burning through CAPTCHAs' : 'Solver offline', online ? 'success' : 'warn');
      } catch (err) {
        setFlaresolverrStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('FLARESOLVERR', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── MUSICBRAINZ Applet ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/musicbrainz-applet/');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let level = 50;
        try {
          const d = await res.json();
          const active = d?.active_tasks ?? d?.jobs ?? d?.queue_size ?? 0;
          level = Math.min((active / 10) * 100, 100);
        } catch (_) {}
        setMusicbrainzStats({ level, isBoiling: false, online: true,
          details: [{ label: 'APPLET', value: 'ONLINE' }] });
        addLog('MUSICBRAINZ', 'Applet online', 'success');
      } catch (err) {
        setMusicbrainzStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('MUSICBRAINZ', `Applet offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── MUSICBRAINZ Local DB ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/musicbrainz-local/');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let isBoiling = false;
        try {
          const d = await res.json();
          const activity = d?.active ?? d?.queries_per_second ?? d?.current_load ?? 0;
          isBoiling = activity > 0;
        } catch (_) { isBoiling = true; }
        setMusicbrainzLocalStats({ level: 50, isBoiling, online: true,
          details: [{ label: 'LOCAL_DB', value: isBoiling ? 'ACTIVE' : 'IDLE' }] });
        addLog('MUSICBRAINZ-DB', `Local DB ${isBoiling ? 'active' : 'idle'}`, 'info');
      } catch (err) {
        setMusicbrainzLocalStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('MUSICBRAINZ-DB', `DB offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── BAZARR ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const [statusRes, wantedMovRes, moviesRes, seriesRes] = await Promise.all([
          fetch('/api/bazarr/api/system/status'),
          fetch('/api/bazarr/api/movies/wanted?start=0&length=1'),
          fetch('/api/bazarr/api/movies?start=0&length=1'),
          fetch('/api/bazarr/api/series?start=0&length=500'),
        ]);
        if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
        const wantedMov  = wantedMovRes.ok  ? await wantedMovRes.json()  : { total: 0 };
        const moviesData = moviesRes.ok     ? await moviesRes.json()     : { total: 0 };
        const seriesData = seriesRes.ok     ? await seriesRes.json()     : { data: [] };

        const missingMovies = wantedMov.total ?? 0;
        const totalMovies   = moviesData.total ?? 0;
        const movPct = totalMovies > 0 ? (missingMovies / totalMovies) * 100 : 0;

        const totalEpFiles   = (seriesData.data ?? []).reduce((s, r) => s + (r.episodeFileCount   ?? 0), 0);
        const totalEpMissing = (seriesData.data ?? []).reduce((s, r) => s + (r.episodeMissingCount ?? 0), 0);
        const epPct = totalEpFiles > 0 ? (totalEpMissing / totalEpFiles) * 100 : 0;

        const level = Math.min(Math.max(movPct, epPct), 100);
        setBazarrStats({
          level, isBoiling: missingMovies > 0 || totalEpMissing > 0, online: true,
          details: [
            { label: 'MOVIES_MISSING',   value: `${movPct.toFixed(1)}%` },
            { label: 'EPISODES_MISSING', value: `${epPct.toFixed(1)}%`  },
          ],
        });
        if (missingMovies > 0 || totalEpMissing > 0)
          addLog('BAZARR', `movies ${movPct.toFixed(1)}% · episodes ${epPct.toFixed(1)}% missing subs`, 'warn');
      } catch (_) {
        setBazarrStats(p => ({ ...p, online: false }));
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── GLUETUN / PROTONVPN ──
  // Flask calls Gluetun's API internally (server-side only) and reads the port file.
  // Online signal = Gluetun API reachable, NOT public_ip content — correctly recovers
  // when the tunnel is up but the IP-lookup service is failing.
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/flask/vpn-status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const connected = data.online === true;
        setProtonvpnStats({
          level: connected ? 50 : 0,
          isBoiling: connected,
          online: connected,
          details: [],
        });
        if (data.forwarded_port) setVpnForwardedPort(data.forwarded_port);
        addLog('GLUETUN', connected ? `Tunnel active — fwd port: ${data.forwarded_port ?? '?'}` : 'Tunnel down', connected ? 'success' : 'error');
        // QB-08: qBit listen port for mismatch detection (best-effort)
        try {
          const prefRes = await fetch('/api/qbittorrent/api/v2/app/preferences');
          if (prefRes.ok) {
            const pd = await prefRes.json();
            setQbitListenPort(pd?.listen_port ?? null);
          }
        } catch { /* best-effort */ }
      } catch (err) {
        setProtonvpnStats({ level: 0, isBoiling: false, online: false, details: [] });
        addLog('GLUETUN', `Offline: ${err.message}`, 'error');
      }
    };
    poll();
    const t = setInterval(poll, POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // ── RESTIC BACKUP (NH-27) ──
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/backup/status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.error) { setResticStats(p => ({ ...p, online: false })); return; }
        const lastAge = data.last_backup_time
          ? (Date.now() - new Date(data.last_backup_time)) / 3600000 : Infinity;
        const isStale = lastAge > 25 || data.hc_status === 'down';
        const level = isStale ? 80 : data.hc_status === 'grace' ? 60 : 10;
        setResticStats({
          level, isBoiling: isStale, online: true,
          details: [
            { label: 'LAST_BACKUP', value: data.last_backup_time ? `${lastAge.toFixed(1)}h ago` : 'never' },
            { label: 'SNAPSHOTS',   value: String(data.snapshot_count ?? 0) },
            { label: 'REPO_SIZE',   value: `${data.repo_size_gb ?? 0}GB` },
            { label: 'HC_STATUS',   value: data.hc_status ?? '?' },
          ],
        });
      } catch {
        setResticStats(p => ({ ...p, online: false }));
      }
    };
    poll();
    const t = setInterval(poll, 300_000);  // 5 min
    return () => clearInterval(t);
  }, []);

  // ── HUE-BRIDGE — NH-23: lighting automation status ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/hue/status');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.paired) {
          setHueStats({ level: 0, isBoiling: false, online: false, details: [{ label: 'STATUS', value: 'NOT PAIRED' }] });
          return;
        }
        const autoOn = data.automation_enabled;
        const roomsOn = (data.rooms || []).filter(r => r.lights_on).length;
        setHueStats({
          level: autoOn ? Math.min(roomsOn * 20, 60) : 0,
          isBoiling: autoOn && roomsOn > 0,
          online: true,
          details: [
            { label: 'AUTOMATION', value: autoOn ? 'ON' : 'OFF' },
            { label: 'MUSIC',      value: data.music_enabled ? 'ON' : 'OFF' },
            { label: 'ROOMS_LIT',  value: `${roomsOn}/${(data.rooms || []).length}` },
          ],
          _hue: data,
        });
      } catch {
        setHueStats(p => ({ ...p, online: false }));
      }
    };
    poll();
    const t = setInterval(poll, 60_000);
    return () => clearInterval(t);
  }, []);

  // ── CLAUDE TERMINAL — NH-26/39: dual-sidecar status (SRV-1 + SRV-2) ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const [srv1Res, srv2Res] = await Promise.allSettled([
          fetch('/api/claude-terminal/status'),
          fetch('/api/claude-terminal-srv2/status'),
        ]);
        const srv1 = srv1Res.status === 'fulfilled' && srv1Res.value.ok ? await srv1Res.value.json() : null;
        const srv2 = srv2Res.status === 'fulfilled' && srv2Res.value.ok ? await srv2Res.value.json() : null;
        const srv1Online = !!srv1;
        const srv2Online = !!srv2;
        setTerminalStats({
          level: srv1Online ? 20 : 0,
          isBoiling: false,
          online: srv1Online,
          details: [
            { label: 'SRV-1', value: srv1Online ? `${srv1?.backend?.toUpperCase() ?? 'CLSH'} / ${srv1?.mode?.toUpperCase() ?? 'CLAUDE'}` : 'OFFLINE' },
            { label: 'SRV-2', value: srv2Online ? `${srv2?.backend?.toUpperCase() ?? 'CLSH'} / ${srv2?.mode?.toUpperCase() ?? 'CLAUDE'}` : 'NOT DEPLOYED' },
          ],
          _terminal: { srv1, srv2, srv1Online, srv2Online },
        });
      } catch {
        setTerminalStats(p => ({ ...p, online: false }));
      }
    };
    poll();
    const t = setInterval(poll, 30_000);
    return () => clearInterval(t);
  }, []);

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

  // ── WEATHER (Open-Meteo, proxied) — NH-10 adds daily forecast + fetchedAt ──
  useEffect(() => {
    const poll = async () => {
      try {
        const url = `/api/weather/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&current=temperature_2m,apparent_temperature,weather_code,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const c = data?.current ?? {};
        const wmo = WMO_DESC(c.weather_code ?? 0);
        setWeatherStats({
          temp:       c.temperature_2m         ?? null,
          feelsLike:  c.apparent_temperature   ?? null,
          humidity:   c.relative_humidity_2m   ?? null,
          windSpeed:  c.windspeed_10m           ?? null,
          condition:  wmo.label,
          state:      wmo.state,
          online:     true,
        });
        // NH-10: parse 3-day daily forecast (skip index 0 = today)
        const daily = data?.daily ?? {};
        const forecastDays = [];
        for (let i = 1; i <= 3; i++) {
          const dateStr = daily.time?.[i];
          if (!dateStr) break;
          const d = new Date(`${dateStr}T12:00:00`);
          forecastDays.push({
            day:    d.toLocaleDateString('en-US', { weekday: 'short' }),
            hi:     daily.temperature_2m_max?.[i]             ?? null,
            lo:     daily.temperature_2m_min?.[i]             ?? null,
            precip: daily.precipitation_probability_max?.[i]  ?? null,
          });
        }
        setWeatherForecast(forecastDays);
        setWeatherFetchedAt(new Date());
        addLog('WEATHER', `${wmo.label} — ${Math.round(c.temperature_2m ?? 0)}°F`, 'info');
      } catch (err) {
        setWeatherStats(p => ({ ...p, online: false }));
        addLog('WEATHER', `Probe offline: ${err.message}`, 'warn');
      }
    };
    poll();
    const t = setInterval(poll, WEATHER_POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // NH-10: recalculate "X min ago" label every minute
  useEffect(() => {
    const tick = () => {
      if (!weatherFetchedAt) return;
      const mins = Math.round((Date.now() - weatherFetchedAt.getTime()) / 60_000);
      setWeatherAge(mins < 1 ? 'just now' : `${mins}m ago`);
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [weatherFetchedAt]);

  // ── SYSTEM METRICS (SRV-1, SRV-2, daily speed test) — moved to SystemMetricsPanel.jsx ──

  // ── DOWNLOAD ACTIVITY (SI-04) ──
  useEffect(() => {
    const poll = async () => {
      if (document.hidden) return;
      try {
        const [qbRes, sabRes] = await Promise.allSettled([
          fetch('/api/qbittorrent/api/v2/torrents/info?filter=active'),
          fetch('/api/sabnzbd/api/?mode=queue&output=json&limit=10'),
        ]);
        if (qbRes.status === 'fulfilled' && qbRes.value.ok) {
          const data = await qbRes.value.json();
          setQbTorrents(Array.isArray(data) ? data : []);
        }
        if (sabRes.status === 'fulfilled' && sabRes.value.ok) {
          const data = await sabRes.value.json();
          setSabnzbdQueue({
            slots: data?.queue?.slots ?? [],
            speed: data?.queue?.speed ?? '0',
            timeleft: data?.queue?.timeleft ?? '0:00:00',
          });
        }
      } catch { /* best-effort */ }
    };
    poll();
    const id = setInterval(poll, 20000);
    return () => clearInterval(id);
  }, []);

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
    protonvpn: protonvpnStats, 'port-updater': portUpdaterStats,
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

  return (
    <div className="min-h-screen periodic-dot-grid overflow-x-hidden" style={{ background: 'var(--bg-base, #0F1117)' }}>

      {dashboardMode === 'CHEM'   && <ElementDetailPanel element={selectedElement} stats={selectedStats} onClose={handleClosePanel} />}
      {dashboardMode === 'SPACE'  && <StarDetailPanel element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'NEURAL' && <NeuralDetailPanel element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'ARCANE' && <ArcaneDetailPanel element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'BIO'      && <BioDetailPanel      element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'MOLECULE' && <MoleculeDetailPanel element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'PLANET'   && <PlanetDetailPanel   element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'WEATHER'  && <WeatherDetailPanel  element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'AIRPORT'  && <AirportDetailPanel  element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'DINO'     && <DinoDetailPanel     element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'NOIR'     && <NoirDetailPanel     element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'VINYL'    && <VinylDetailPanel    element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'BAND'     && <BandDetailPanel     element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'PARTICLE' && <ParticleDetailPanel element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'GLOBE'    && <GlobeDetailPanel    element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'FORGE'    && <ForgeDetailPanel    element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}
      {dashboardMode === 'OCEAN'    && <OceanDetailPanel    element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}

      {/* Click-outside to close detail panel */}
      {selectedElement && (
        <div
          className="fixed inset-0 z-30"
          style={{ cursor: 'pointer' }}
          onClick={handleClosePanel}
        />
      )}

      <div data-section="header">
        <PeriodicHeader globalTier={globalTier} lastPolledAt={lastPolledAt} healthColor={healthColor} dashboardMode={dashboardMode} setDashboardMode={setDashboardMode} modeThemes={MODE_THEMES[dashboardMode]} />
      </div>

      <ActiveOperationsBar statsMap={statsMap} />

      <main className="max-w-screen-2xl mx-auto px-6 pt-8 pb-16 space-y-8">

        <div data-section="services">
        {(() => {
          if (dashboardMode === 'SPACE') return <StarMapGrid statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'NEURAL') return <NeuralGrid statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'ARCANE') return <ArcaneGrid statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'BIO')      return <BioGrid      statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'MOLECULE') return <MoleculeGrid statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'PLANET')   return <PlanetGrid   statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'WEATHER')  return <WeatherGrid  statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'AIRPORT')  return <AirportGrid  statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'DINO')     return <DinoGrid     statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'NOIR')     return <NoirGrid     statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'VINYL')    return <VinylGrid    statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'BAND')     return <BandGrid     statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'PARTICLE') return <ParticleGrid statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'GLOBE')    return <GlobeGrid    statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'FORGE')    return <ForgeGrid    statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          if (dashboardMode === 'OCEAN')    return <OceanGrid    statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;
          return <PeriodicTableGrid statsMap={statsMap} onElementClick={handleElementClick} />;
        })()}
        </div>

        {/* AI / Utility Widgets — appended alongside the services grid */}
        <div data-section="ai-row" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <ChatWidget />
          <LotteryWidget />
          <StockWidget />
          <SpotifyWidget />
        </div>

        {/* Category legend strip */}
        <div style={{ display: 'flex', gap: 12, padding: '4px 8px', flexWrap: 'wrap',
          justifyContent: 'center', marginTop: 4 }}>
          {['LANTHANIDE', 'ACTINIDE', 'TRANSITION', 'NOBLE', 'CHALCOGEN', 'METALLOID'].map(key => {
            const cat = activeCATRef.current[key];
            const LEGEND_MAP = { CHEM: CATEGORY_LABELS, SPACE: STELLAR_LABELS, NEURAL: NEURAL_LABELS, ARCANE: ARCANE_LABELS, BIO: BIO_LABELS, MOLECULE: MOLECULE_LABELS, PLANET: PLANET_LABELS, WEATHER: WEATHER_LABELS, AIRPORT: AIRPORT_LABELS, DINO: DINO_LABELS, NOIR: NOIR_LABELS, VINYL: VINYL_LABELS, BAND: BAND_LABELS, PARTICLE: PARTICLE_LABELS, GLOBE: GLOBE_LABELS, FORGE: FORGE_LABELS, OCEAN: OCEAN_LABELS };
            const label = (LEGEND_MAP[dashboardMode] ?? CATEGORY_LABELS)[key];
            return (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.80)',
                letterSpacing: 1 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%',
                  background: cat.border, display: 'inline-block' }} />
                {label}
              </span>
            );
          })}
        </div>

        {/* Weather + VPN + DNS Leak + Quick Launch row */}
        <div data-section="weather-vpn" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <WeatherWidget weatherStats={weatherStats} weatherForecast={weatherForecast} weatherAge={weatherAge} />
          <VpnStatusWidget protonvpnStats={protonvpnStats} vpnForwardedPort={vpnForwardedPort} qbitListenPort={qbitListenPort} />
          <DnsLeakCard />
          <QuickLaunchPanel />
        </div>

        {/* NH-18 — Air Quality Index (OpenAQ, Chicago, keyless, 30min cache) */}
        <AirQualityWidget />

        {/* NH-28/31 — Media Pipeline (Pipeline | Downloads | Plex | Analytics) */}
        <div data-section="plex">
          <MediaPipelineWidget qbTorrents={qbTorrents} sabnzbdQueue={sabnzbdQueue} addLog={addLog} />
        </div>

        {/* NH-06 + NH-12 + NH-15 — Security / audit badge row */}
        <div data-section="security"><SecurityBadgeRow addLog={addLog} /></div>

        {/* NH-38 — Uptime Kuma Incident Timeline */}
        <UptimeTimelineWidget addLog={addLog} />

        {/* NH-30 — ntfy Notification Inbox */}
        <NtfyInboxWidget addLog={addLog} />

        {/* Quote + On This Day row */}
        <div data-section="quote" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuoteWidget quote={quote} onRefresh={fetchQuote} />
          <OnThisDayWidget history={history} />
        </div>

        <div data-section="system-metrics"><SystemMetricsPanel addLog={addLog} transcodingActive={transcodingActive} plexStatsLevel={plexStats.level} /></div>

        {/* THEME_EXEMPT: DiscoveryTicker media-type colors (amber/blue/purple) are fixed by content type */}
        <div data-section="discovery">{(() => {
          const TICKER_LABELS = {
            CHEM:   { films: ['SYNTHESIS_YIELDS', 'Synthesized_Films'],  series: ['CHAIN_REACTIONS',  'Initiated_Series'],   music: ['RARE_EARTH_FINDS', 'Acquired_Specimens'] },
            SPACE:  { films: ['CARGO_MANIFEST',   'Acquired_Films'],     series: ['MISSION_ARCHIVES', 'Tracked_Series'],     music: ['ACOUSTIC_SIGNALS', 'Acquired_Albums']    },
            NEURAL: { films: ['DATA_STREAMS',     'Received_Films'],     series: ['PACKET_LOGS',      'Tracked_Series'],     music: ['SIGNAL_CACHE',     'Indexed_Albums']     },
            ARCANE: { films: ['TOME_REGISTRY',    'Inscribed_Films'],    series: ['CHRONICLE_VAULT',  'Scribed_Series'],     music: ['HARMONIC_CODEX',   'Archived_Albums']    },
            BIO:      { films: ['SPECIMEN_LOG',     'Catalogued_Films'],   series: ['CELL_DIVISION',    'Replicated_Series'],  music: ['VIBRATION_SCAN',   'Sampled_Albums']     },
            MOLECULE: { films: ['COMPOUND_LOG',     'Synthesized_Films'],  series: ['REACTION_SERIES',  'Chained_Series'],     music: ['ISOTOPE_SCAN',     'Refined_Albums']     },
            PLANET:   { films: ['ORBITAL_MANIFEST', 'Surveyed_Films'],     series: ['PLANETARY_LOG',    'Tracked_Series'],     music: ['SIGNAL_ECHOES',    'Received_Albums']    },
            WEATHER:  { films: ['STORM_REPORT',     'Cleared_Films'],      series: ['FORECAST_LOG',     'Tracked_Series'],     music: ['FREQUENCY_SCAN',   'Clear_Albums']       },
            AIRPORT:  { films: ['CARGO_MANIFEST',   'Landed_Films'],       series: ['FLIGHT_LOG',       'Airborne_Series'],    music: ['BOARDING_CALL',    'Cleared_Albums']     },
            DINO:     { films: ['FOSSIL_RECORD',    'Excavated_Films'],    series: ['EPOCH_LOG',        'Traced_Series'],      music: ['RESONANCE_SCAN',   'Preserved_Albums']   },
            NOIR:     { films: ['CASE_FILES',       'Acquired_Films'],     series: ['SURVEILLANCE_LOG', 'Tracked_Series'],     music: ['WIRE_TAP',         'Lifted_Albums']      },
            VINYL:    { films: ['WAX_MANIFEST',     'Pressed_Films'],      series: ['SIDE_B_LOG',       'Tracked_Series'],     music: ['NEEDLE_DROP',      'Spun_Albums']        },
            BAND:     { films: ['SETLIST_FILMS',    'Acquired_Films'],     series: ['TOUR_ARCHIVE',     'Tracked_Series'],     music: ['VAULT_RELEASES',   'Spun_Albums']        },
            PARTICLE: { films: ['COLLIDER_DATA',    'Captured_Films'],     series: ['DECAY_CHAIN',      'Tracked_Series'],     music: ['FREQUENCY_SCAN',   'Sampled_Albums']     },
            GLOBE:    { films: ['EXPEDITION_LOG',   'Mapped_Films'],       series: ['TERRAIN_ARCHIVE',  'Surveyed_Series'],    music: ['SIGNAL_STATIONS',  'Received_Albums']    },
            FORGE:    { films: ['SMELTER_YIELDS',   'Forged_Films'],       series: ['FURNACE_ARCHIVE',  'Tempered_Series'],    music: ['HAMMER_RECORDS',   'Cast_Albums']        },
            OCEAN:    { films: ['DEEP_SURVEY',      'Surveyed_Films'],     series: ['CURRENT_ARCHIVE',  'Tracked_Series'],     music: ['SONAR_PINGS',      'Captured_Albums']    },
          };
          const t = TICKER_LABELS[dashboardMode] ?? TICKER_LABELS.CHEM;
          return (
            <TabbedTicker tabs={[
              { label: 'FILMS',  content: <DiscoveryTicker items={recentMovies} label={t.films[0]}  sublabel={t.films[1]}  accentColor="amber"  type="film"   /> },
              { label: 'SERIES', content: <DiscoveryTicker items={recentShows}  label={t.series[0]} sublabel={t.series[1]} accentColor="blue"   type="series" /> },
              { label: 'MUSIC',  content: <DiscoveryTicker items={recentAlbums} label={t.music[0]}  sublabel={t.music[1]}  accentColor="purple" type="music"  /> },
            ]} />
          );
        })()}</div>

        {/* DF-08: FreshRSS Headlines ticker */}
        <FreshRssTickerWidget />

        {/* THEME_EXEMPT: LabJournal severity badge colors are fixed by log type */}
        <div data-section="lab-journal">{(() => {
          const LOG_TITLES = {
            SPACE:  'MISSION_LOG ◆ Deep_Space_Telemetry',
            NEURAL: 'NETWORK_LOG ◆ Signal_Stream_Analysis',
            ARCANE: 'ARCANE_LOG ◆ Mystical_Event_Registry',
            BIO:      'BIO_LOG ◆ Cellular_Activity_Monitor',
            MOLECULE: 'COMPOUND_LOG ◆ Molecular_Event_Register',
            PLANET:   'ORBIT_LOG ◆ Planetary_Telemetry_Feed',
            WEATHER:  'WEATHER_LOG ◆ Atmospheric_Event_Monitor',
            AIRPORT:  'FLIGHT_LOG ◆ Air_Traffic_Control_Feed',
            DINO:     'FOSSIL_LOG ◆ Prehistoric_Activity_Monitor',
            NOIR:     'CASE_LOG ◆ Detective_Bureau_Register',
            VINYL:    'WAX_LOG ◆ Vinyl_Rotation_Monitor',
            BAND:     'SETLIST_LOG ◆ Tour_Activity_Monitor',
            PARTICLE: 'COLLIDER_LOG ◆ Quantum_Event_Register',
            GLOBE:    'GEO_LOG ◆ Terrain_Activity_Monitor',
            FORGE:    'FORGE_LOG ◆ Workshop_Heat_Monitor',
            OCEAN:    'OCEAN_LOG ◆ Bathymetric_Depth_Monitor',
          };
          return <LabJournal logs={logs} title={LOG_TITLES[dashboardMode]} />;
        })()}</div>


      </main>

      <BotDetailPanel
        bot={selectedBot}
        result={selectedBot ? botResults[selectedBot.id] : null}
        onClose={() => setSelectedBot(null)}
      />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        elementRegistry={ELEMENT_REGISTRY}
        dashboardMode={dashboardMode}
        sectionRefs={{}}
      />

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
