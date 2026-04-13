// ─────────────────────────────────────────────
// SERVICE REGISTRY — service → element mapping
//
// Services are zone-grouped within the periodic table:
//   Period 9 (Lanthanides): MEDIA (g3-6) | LIBRARY (g7-12) | PIPELINE (g13-17)
//   Period 10 (Actinides):  INFRA (g3-8) | TOOLS (g9-11)
//   Periods 1-6:            BOTS (scattered)
//
// `zone` field maps each service to a functional zone
// used by the spatial grid engine (see zoneConfig.js).
// ─────────────────────────────────────────────
import { PRIMARY_URL, SECONDARY_URL } from '../utils/constants.js';

const SEERR_URL = `${SECONDARY_URL}:5055`;  // Overseerr is on SRV-2

const SERVICE_REGISTRY = [
  // ── MEDIA zone — period 9, groups 3–6 (media servers & frontends) ─────────────────
  { id: 'plex',         symbol: 'La', name: 'Lanthanum',     z: 57,  mass: '138.905', period: 9,  group: 3,  cat: 'LANTHANIDE', zone: 'MEDIA',    service: 'PLEX',         url: `${PRIMARY_URL}:32400/web`, electronConfig: '[Xe] 5d¹ 6s²',        oxidation: '+3 | +3* | +3** | ionized',     shells: [2,8,18,18,9,2]   },
  { id: 'overseerr',    symbol: 'Ce', name: 'Cerium',        z: 58,  mass: '140.116', period: 9,  group: 4,  cat: 'LANTHANIDE', zone: 'MEDIA',    service: 'SEERR',        url: SEERR_URL,      electronConfig: '[Xe] 4f¹ 5d¹ 6s²',    oxidation: '+3 | +4 | +4* | ionized',       shells: [2,8,18,19,9,2]   },
  { id: 'tautulli',     symbol: 'Pr', name: 'Praseodymium',  z: 59,  mass: '140.908', period: 9,  group: 5,  cat: 'LANTHANIDE', zone: 'MEDIA',    service: 'TAUTULLI',     url: `${PRIMARY_URL}:8181`,      electronConfig: '[Xe] 4f³ 6s²',         oxidation: '+3 | +4 | +2 | excited-f',      shells: [2,8,18,21,8,2]   },
  { id: 'tunarr',       symbol: 'Nd', name: 'Neodymium',     z: 60,  mass: '144.242', period: 9,  group: 6,  cat: 'LANTHANIDE', zone: 'MEDIA',    service: 'TUNARR',       url: `${SECONDARY_URL}:8000`,    electronConfig: '[Xe] 4f⁴ 6s²',         oxidation: '+3 | +2 | +2* | excited-f',     shells: [2,8,18,22,8,2]   },

  // ── LIBRARY zone — period 9, groups 7–12 (media managers, indexers, metadata) ─────
  { id: 'radarr',       symbol: 'Pm', name: 'Promethium',    z: 61,  mass: '(145)',   period: 9,  group: 7,  cat: 'LANTHANIDE', zone: 'LIBRARY',  service: 'RADARR',       url: `${PRIMARY_URL}:7878`,      electronConfig: '[Xe] 4f⁵ 6s²',         oxidation: '+3 | +2 | +4 | metastable-f',   shells: [2,8,18,23,8,2]   },
  { id: 'sonarr',       symbol: 'Sm', name: 'Samarium',      z: 62,  mass: '150.36',  period: 9,  group: 8,  cat: 'LANTHANIDE', zone: 'LIBRARY',  service: 'SONARR',       url: `${PRIMARY_URL}:8989`,      electronConfig: '[Xe] 4f⁶ 6s²',         oxidation: '+3 | +3* | +3** | decay',       shells: [2,8,18,24,8,2]   },
  { id: 'lidarr',       symbol: 'Eu', name: 'Europium',      z: 63,  mass: '151.964', period: 9,  group: 9,  cat: 'LANTHANIDE', zone: 'LIBRARY',  service: 'LIDARR',       url: `${PRIMARY_URL}:8686`,      electronConfig: '[Xe] 4f⁷ 6s²',         oxidation: '+3 | +2 | +2* | ionized',       shells: [2,8,18,25,8,2]   },
  { id: 'prowlarr',     symbol: 'Gd', name: 'Gadolinium',    z: 64,  mass: '157.25',  period: 9,  group: 10, cat: 'LANTHANIDE', zone: 'LIBRARY',  service: 'PROWLARR',     url: `${PRIMARY_URL}:9696`,      electronConfig: '[Xe] 4f⁷ 5d¹ 6s²',    oxidation: '+3 | +2 | +4 | metastable-f',   shells: [2,8,18,25,9,2]   },
  { id: 'musicbrainz',  symbol: 'Tb', name: 'Terbium',       z: 65,  mass: '158.925', period: 9,  group: 11, cat: 'LANTHANIDE', zone: 'LIBRARY',  service: 'Music Request Page',  url: `${PRIMARY_URL}:5050`,      electronConfig: '[Xe] 4f⁹ 6s²',         oxidation: '+3 | +3* | +3** | ionized',     shells: [2,8,18,27,8,2]   },
  { id: 'musicbrainz-local', symbol: 'Dy', name: 'Dysprosium', z: 66, mass: '162.500', period: 9,  group: 12, cat: 'LANTHANIDE', zone: 'LIBRARY',  service: 'MUSICBRAINZ-DB', url: `${SECONDARY_URL}:5000`, electronConfig: '[Xe] 4f¹⁰ 6s²',        oxidation: '+4 | +3 | +2 | decay (α)',      shells: [2,8,18,28,8,2]   },

  // ── PIPELINE zone — period 9, groups 13–17 (downloaders, VPN, subtitles) ──────────
  { id: 'protonvpn',    symbol: 'Ho', name: 'Holmium',       z: 67,  mass: '164.930', period: 9,  group: 13, cat: 'LANTHANIDE', zone: 'PIPELINE', service: 'GLUETUN/VPN',  url: null,                        electronConfig: '[Xe] 4f¹¹ 6s²',        oxidation: '0 | +2 | +3 | 0 (shielded)',    shells: [2,8,18,29,8,2]   },
  { id: 'qbittorrent',  symbol: 'Er', name: 'Erbium',        z: 68,  mass: '167.259', period: 9,  group: 14, cat: 'LANTHANIDE', zone: 'PIPELINE', service: 'QBITTORRENT',  url: `${PRIMARY_URL}:8080`,      electronConfig: '[Xe] 4f¹² 6s²',        oxidation: '+3 | +1 | +3* | high-spin',     shells: [2,8,18,30,8,2]   },
  { id: 'sabnzbd',      symbol: 'Tm', name: 'Thulium',       z: 69,  mass: '168.934', period: 9,  group: 15, cat: 'LANTHANIDE', zone: 'PIPELINE', service: 'SABNZBD',      url: `${PRIMARY_URL}:8085`,      electronConfig: '[Xe] 4f¹³ 6s²',        oxidation: '+3 | +4 | +4* | ionized',       shells: [2,8,18,31,8,2]   },
  { id: 'bazarr',       symbol: 'Yb', name: 'Ytterbium',     z: 70,  mass: '173.045', period: 9,  group: 16, cat: 'LANTHANIDE', zone: 'PIPELINE', service: 'BAZARR',       url: `${PRIMARY_URL}:6767`,      electronConfig: '[Xe] 4f¹⁴ 6s²',        oxidation: '+5 | +4 | +3 | subtitle-decay', shells: [2,8,18,32,8,2]   },
  { id: 'port-updater', symbol: 'Lu', name: 'Lutetium',      z: 71,  mass: '174.967', period: 9,  group: 17, cat: 'LANTHANIDE', zone: 'PIPELINE', service: 'PORT-UPDATER', url: null,                        electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²',   oxidation: '+3 | +3* | decay | (sidecar)',   shells: [2,8,18,32,9,2] },

  // ── INFRA zone — period 10, groups 3–8 (infrastructure & bridges) ─────────────────
  { id: 'cloudflared',  symbol: 'Ac', name: 'Actinium',      z: 89,  mass: '(227)',   period: 10, group: 3,  cat: 'ACTINIDE',   zone: 'INFRA',    service: 'CLOUDFLARED',  url: `${PRIMARY_URL}:20241`,     electronConfig: '[Rn] 6d¹ 7s²',         oxidation: '+3 | +3* | +3** | ionized',     shells: [2,8,18,32,18,9,2] },
  { id: 'notifiarr',    symbol: 'Th', name: 'Thorium',       z: 90,  mass: '232.038', period: 10, group: 4,  cat: 'ACTINIDE',   zone: 'INFRA',    service: 'NOTIFIARR',    url: `${PRIMARY_URL}:5454`,      electronConfig: '[Rn] 6d² 7s²',         oxidation: '+3 | +3* | +3** | ionized',     shells: [2,8,18,32,18,10,2] },
  { id: 'flaresolverr', symbol: 'Pa', name: 'Protactinium',  z: 91,  mass: '231.036', period: 10, group: 5,  cat: 'ACTINIDE',   zone: 'INFRA',    service: 'FLARESOLVERR', url: `${PRIMARY_URL}:8191`,      electronConfig: '[Rn] 5f² 6d¹ 7s²',     oxidation: '+3 | +2 | +2* | ionized',       shells: [2,8,18,32,20,9,2] },
  { id: 'tautulli-bridge',   symbol: 'U',  name: 'Uranium',       z: 92,  mass: '238.029', period: 10, group: 6,  cat: 'ACTINIDE',   zone: 'INFRA',    service: 'TAUTULLI-BRIDGE', url: null,               electronConfig: '[Rn] 5f³ 6d¹ 7s²',     oxidation: '+5 | +4 | +3 | bridge-decay',   shells: [2,8,18,32,21,9,2] },
  { id: 'hue-bridge',        symbol: 'Np', name: 'Neptunium',    z: 93,  mass: '(237)',   period: 10, group: 7,  cat: 'ACTINIDE',   zone: 'INFRA',    service: 'HUE-BRIDGE',      url: null,                        electronConfig: '[Rn] 5f⁴ 6d¹ 7s²',     oxidation: '+3 | +4 | light-decay | media',   shells: [2,8,18,32,22,9,2] },
  { id: 'restic-sidecar',    symbol: 'Pu', name: 'Plutonium',    z: 94,  mass: '(244)',   period: 10, group: 8,  cat: 'ACTINIDE',   zone: 'INFRA',    service: 'RESTIC-BACKUP',   url: null,                        electronConfig: '[Rn] 5f⁶ 7s²',         oxidation: '+3 | +2 | snapshot-decay | archive', shells: [2,8,18,32,24,8,2] },

  // ── TOOLS zone — period 10, groups 9–11 (tools & terminals) ───────────────────────
  { id: 'triggercmd',        symbol: 'Am', name: 'Americium',    z: 95,  mass: '(243)',   period: 10, group: 9,  cat: 'ACTINIDE',   zone: 'TOOLS',    service: 'TRIGGERCMD',      url: null,               electronConfig: '[Rn] 5f⁷ 7s²',         oxidation: '+4 | +3 | voice-decay | trigger', shells: [2,8,18,32,25,8,2] },
  { id: 'obsidian-remote',   symbol: 'Cm', name: 'Curium',       z: 96,  mass: '(247)',   period: 10, group: 10, cat: 'ACTINIDE',   zone: 'TOOLS',    service: 'OBSIDIAN',        url: `${PRIMARY_URL}:3006`, electronConfig: '[Rn] 5f⁷ 6d¹ 7s²',     oxidation: '+3 | +2 | note-decay | vault',    shells: [2,8,18,32,25,9,2] },
  { id: 'claude-terminal',   symbol: 'Bk', name: 'Berkelium',    z: 97,  mass: '(247)',   period: 10, group: 11, cat: 'ACTINIDE',   zone: 'TOOLS',    service: 'CLAUDE-TERMINAL', url: null,                        electronConfig: '[Rn] 5f⁹ 7s²',         oxidation: '+3 | +2 | terminal-decay | shell', shells: [2,8,18,32,27,8,2] },
  { id: 'lottery',           symbol: 'Cf', name: 'Californium',  z: 98,  mass: '(251)',   period: 10, group: 12, cat: 'ACTINIDE',   zone: 'TOOLS',    service: 'LOTTERY',         url: null,                        electronConfig: '[Rn] 5f¹⁰ 7s²',        oxidation: 'PB | MM | jackpot | draw-decay',    shells: [2,8,18,32,28,8,2] },
  { id: 'snappymail',        symbol: 'Es', name: 'Einsteinium',  z: 99,  mass: '(252)',   period: 10, group: 13, cat: 'ACTINIDE',   zone: 'INFRA',    service: 'MAIL-ARCHIVE',    url: `${SECONDARY_URL}:8086`, electronConfig: '[Rn] 5f¹¹ 7s²',        oxidation: '+3 | +2 | ingest-decay | archive',  shells: [2,8,18,32,29,8,2] },
  { id: 'kometa',            symbol: 'Fm', name: 'Fermium',      z: 100, mass: '(257)',   period: 10, group: 14, cat: 'ACTINIDE',   zone: 'INFRA',    service: 'KOMETA',          url: null,                        electronConfig: '[Rn] 5f¹² 7s²',        oxidation: '+3 | +2 | meta-decay | overlay',    shells: [2,8,18,32,30,8,2] },
  { id: 'bhyve',             symbol: 'Md', name: 'Mendelevium',  z: 101, mass: '(258)',   period: 10, group: 15, cat: 'ACTINIDE',   zone: 'INFRA',    service: 'B-HYVE',          url: null,                        electronConfig: '[Rn] 5f¹³ 7s²',        oxidation: '+3 | +2 | irrigation-decay | zone',  shells: [2,8,18,32,31,8,2] },

  // ── Bot elements — periods 1-6 (scattered through main table) ─────────────────────
  { id: 'h',  symbol: 'H',  name: 'Hydrogen',   z: 1,  mass: '1.008',    period: 1, group: 1,  cat: 'NONMETAL',   zone: 'BOTS', service: 'Trailblazer',       url: null, electronConfig: '1s¹',                     oxidation: '+1 | -1 | trending | global',   shells: [1] },
  { id: 'he', symbol: 'He', name: 'Helium',      z: 2,  mass: '4.003',    period: 1, group: 18, cat: 'NOBLE',      zone: 'BOTS', service: 'Animation Buff',    url: null, electronConfig: '1s²',                     oxidation: '0 | 0 | 0 | inert-picks',       shells: [2] },
  { id: 'li', symbol: 'Li', name: 'Lithium',     z: 3,  mass: '6.941',    period: 2, group: 1,  cat: 'ALKALI',     zone: 'BOTS', service: 'Mood Ring',         url: null, electronConfig: '[He] 2s¹',                oxidation: '+1 | emotional | reactive',     shells: [2,1] },
  { id: 'c',  symbol: 'C',  name: 'Carbon',      z: 6,  mass: '12.011',   period: 2, group: 14, cat: 'NONMETAL',   zone: 'BOTS', service: 'Foundation',        url: null, electronConfig: '[He] 2s² 2p²',            oxidation: '+4 | -4 | +2 | essential',      shells: [2,4] },
  { id: 'o',  symbol: 'O',  name: 'Oxygen',      z: 8,  mass: '15.999',   period: 2, group: 16, cat: 'NONMETAL',   zone: 'BOTS', service: 'Mabel',             url: null, electronConfig: '[He] 2s² 2p⁴',            oxidation: '-2 | -1 | comfort | warm',      shells: [2,6] },
  { id: 'ne', symbol: 'Ne', name: 'Neon',        z: 10, mass: '20.180',   period: 2, group: 18, cat: 'NOBLE',      zone: 'BOTS', service: 'Retro Rick',        url: null, electronConfig: '[He] 2s² 2p⁶',            oxidation: '0 | 0 | decade | local',        shells: [2,8] },
  { id: 'si', symbol: 'Si', name: 'Silicon',     z: 14, mass: '28.085',   period: 3, group: 14, cat: 'METALLOID',  zone: 'BOTS', service: 'Algorithm',         url: null, electronConfig: '[Ne] 3s² 3p²',            oxidation: '+4 | -4 | +2 | similar',        shells: [2,8,4] },
  { id: 's',  symbol: 'S',  name: 'Sulfur',      z: 16, mass: '32.06',    period: 3, group: 16, cat: 'NONMETAL',   zone: 'BOTS', service: 'Sonic Boom',        url: null, electronConfig: '[Ne] 3s² 3p⁴',            oxidation: '-2 | +4 | +6 | atmos-decay',    shells: [2,8,6] },
  { id: 'cl', symbol: 'Cl', name: 'Chlorine',    z: 17, mass: '35.45',    period: 3, group: 17, cat: 'HALOGEN',    zone: 'BOTS', service: 'Slasher',           url: null, electronConfig: '[Ne] 3s² 3p⁵',            oxidation: '-1 | +1 | +5 | horror',         shells: [2,8,7] },
  { id: 'ti', symbol: 'Ti', name: 'Titanium',    z: 22, mass: '47.867',   period: 4, group: 4,  cat: 'TRANSITION', zone: 'BOTS', service: 'Blockbuster',       url: null, electronConfig: '[Ar] 3d² 4s²',            oxidation: '+4 | +3 | +2 | high-budget',    shells: [2,8,10,2] },
  { id: 'v',  symbol: 'V',  name: 'Vanadium',    z: 23, mass: '50.942',   period: 4, group: 5,  cat: 'TRANSITION', zone: 'BOTS', service: 'HDR Junkie',        url: null, electronConfig: '[Ar] 3d³ 4s²',            oxidation: '+5 | DV | HDR10+ | hdr-decay',  shells: [2,8,11,2] },
  { id: 'cr', symbol: 'Cr', name: 'Chromium',    z: 24, mass: '51.996',   period: 4, group: 6,  cat: 'TRANSITION', zone: 'BOTS', service: 'Purist',            url: null, electronConfig: '[Ar] 3d⁵ 4s¹',            oxidation: '+6 | +3 | remux | bitrate',     shells: [2,8,13,1] },
  { id: 'fe', symbol: 'Fe', name: 'Iron',        z: 26, mass: '55.845',   period: 4, group: 8,  cat: 'TRANSITION', zone: 'BOTS', service: 'Future Historian',  url: null, electronConfig: '[Ar] 3d⁶ 4s²',            oxidation: '+3 | +2 | award | classic',     shells: [2,8,14,2] },
  { id: 'cu', symbol: 'Cu', name: 'Copper',      z: 29, mass: '63.546',   period: 4, group: 11, cat: 'TRANSITION', zone: 'BOTS', service: 'Bandwidth Miser',   url: null, electronConfig: '[Ar] 3d¹⁰ 4s¹',           oxidation: '+2 | +1 | HEVC | efficient',    shells: [2,8,18,1] },
  { id: 'u',  symbol: 'Tc', name: 'Technetium',  z: 43, mass: '(98)',     period: 5, group: 7,  cat: 'TRANSITION', zone: 'BOTS', service: 'Chaos Gremlin',     url: null, electronConfig: '[Kr] 4d⁵ 5s²',            oxidation: '+6 | +4 | chaos | genre-clash', shells: [2,8,18,13,2] },
  { id: 'ag', symbol: 'Ag', name: 'Silver',      z: 47, mass: '107.868',  period: 5, group: 11, cat: 'TRANSITION', zone: 'BOTS', service: 'Hidden Gem',        url: null, electronConfig: '[Kr] 4d¹⁰ 5s¹',           oxidation: '+1 | critic | obscure | gem',   shells: [2,8,18,18,1] },
  { id: 'sb', symbol: 'Sb', name: 'Antimony',    z: 51, mass: '121.760',  period: 5, group: 15, cat: 'METALLOID',  zone: 'BOTS', service: 'Playlist Alchemist',url: null, electronConfig: '[Kr] 4d¹⁰ 5s² 5p³',      oxidation: '+5 | +3 | -3 | mood-mix',       shells: [2,8,18,18,5] },
  { id: 'au', symbol: 'Au', name: 'Gold',        z: 79, mass: '196.967',  period: 6, group: 11, cat: 'TRANSITION', zone: 'BOTS', service: 'The Auteur',        url: null, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',     oxidation: '+3 | +1 | obscure | critical',  shells: [2,8,18,32,18,1] },
  { id: 'hg', symbol: 'Hg', name: 'Mercury',     z: 80, mass: '200.592',  period: 6, group: 12, cat: 'TRANSITION', zone: 'BOTS', service: 'Shape-Shifter',     url: null, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²',     oxidation: '+2 | +1 | foreign | liquid',    shells: [2,8,18,32,18,2] },
  { id: 'pb', symbol: 'Pb', name: 'Lead',        z: 82, mass: '207.2',    period: 6, group: 14, cat: 'POST',       zone: 'BOTS', service: 'Heavyweight',       url: null, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', oxidation: '+4 | +2 | epic | 3hr+',        shells: [2,8,18,32,18,4] },
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

export { SERVICE_REGISTRY, ALL_ELEMENTS };
export default SERVICE_REGISTRY;
