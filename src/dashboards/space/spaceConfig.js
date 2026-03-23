// ─────────────────────────────────────────────
// SPACE STATION DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → space object type labels.
// Key strings (ALKALI, LANTHANIDE, etc.) are unchanged — only display labels differ.

export const STELLAR_LABELS = {
  LANTHANIDE: 'Stellar Core',
  ACTINIDE:   'Satellite',
  TRANSITION: 'Blue Giant',
  NOBLE:      'Nebula',
  CHALCOGEN:  'Solar Wind',
  METALLOID:  'Pulsar',
  NONMETAL:   'Comet',
  ALKALI:     'Pulsar Flash',
  ALKALINE:   'Gas Giant',
  HALOGEN:    'Quasar',
  POST:       'Dark Matter',
  PNICTOGEN:  'Red Dwarf',
};

// Space metadata overlay — maps service id → space display values.
// Grid positions (period/group) are unchanged; only visual metadata differs.
export const SPACE_OVERLAY = {
  plex:              { designation: 'PLX', stellarName: 'Plex Prime',         spectralType: 'G2V', solarMasses: '1.00 M☉', flavor: 'streaming | active | sessions | live',           orbitLabel: 'Inner orbit ◆ 6 moons' },
  overseerr:         { designation: 'OVR', stellarName: 'Overseer Station',   spectralType: 'G5V', solarMasses: '0.90 M☉', flavor: 'request | pending | approved | denied',          orbitLabel: 'Inner orbit ◆ 5 moons' },
  tautulli:          { designation: 'TAU', stellarName: 'Tau Observatory',    spectralType: 'K0V', solarMasses: '0.85 M☉', flavor: 'watching | history | tracking | logged',         orbitLabel: 'Inner orbit ◆ 5 moons' },
  radarr:            { designation: 'RDR', stellarName: 'Radarr Prime',       spectralType: 'K2V', solarMasses: '0.80 M☉', flavor: 'indexing | grabbing | importing | seeding',      orbitLabel: 'Inner orbit ◆ 5 moons' },
  sonarr:            { designation: 'SNR', stellarName: 'Sonarr Station',     spectralType: 'K3V', solarMasses: '0.78 M☉', flavor: 'monitoring | queued | downloading | done',       orbitLabel: 'Inner orbit ◆ 5 moons' },
  lidarr:            { designation: 'LDR', stellarName: 'Lidarr Prime',       spectralType: 'K5V', solarMasses: '0.75 M☉', flavor: 'scanning | matching | tagging | archived',       orbitLabel: 'Inner orbit ◆ 5 moons' },
  tunarr:            { designation: 'TNR', stellarName: 'Tunarr Gateway',     spectralType: 'M0V', solarMasses: '0.60 M☉', flavor: 'channeling | buffering | streaming | idle',      orbitLabel: 'Inner orbit ◆ 4 moons' },
  qbittorrent:       { designation: 'QBT', stellarName: 'Q-Bit Drive',        spectralType: 'M1V', solarMasses: '0.58 M☉', flavor: 'seeding | leeching | queued | stalled',          orbitLabel: 'Inner orbit ◆ 4 moons' },
  sabnzbd:           { designation: 'SAB', stellarName: 'Sabnzbd Station',    spectralType: 'M2V', solarMasses: '0.56 M☉', flavor: 'downloading | verifying | extracting | done',    orbitLabel: 'Inner orbit ◆ 4 moons' },
  prowlarr:          { designation: 'PRW', stellarName: 'Prowlarr Prime',     spectralType: 'M3V', solarMasses: '0.50 M☉', flavor: 'syncing | indexing | resolving | cached',         orbitLabel: 'Inner orbit ◆ 4 moons' },
  cloudflared:       { designation: 'CFD', stellarName: 'Cloud Gate',         spectralType: 'M4V', solarMasses: '0.48 M☉', flavor: 'tunneled | routing | proxied | shielded',        orbitLabel: 'Inner orbit ◆ 4 moons' },
  notifiarr:         { designation: 'NTF', stellarName: 'Notifiarr Beacon',   spectralType: 'M5V', solarMasses: '0.46 M☉', flavor: 'alerting | relaying | acked | silent',           orbitLabel: 'Inner orbit ◆ 4 moons' },
  flaresolverr:      { designation: 'FLR', stellarName: 'FlareSolverr Node',  spectralType: 'M6V', solarMasses: '0.44 M☉', flavor: 'solving | bypassing | resolved | failed',        orbitLabel: 'Inner orbit ◆ 3 moons' },
  protonvpn:         { designation: 'VPN', stellarName: 'Proton Shield',      spectralType: 'M8V', solarMasses: '0.42 M☉', flavor: 'tunneled | encrypted | routed | 0 (shielded)',   orbitLabel: 'Inner orbit ◆ 3 moons' },
  musicbrainz:       { designation: 'MBZ', stellarName: 'MusicBrainz Portal', spectralType: 'M9V', solarMasses: '0.40 M☉', flavor: 'tagging | matching | requesting | done',         orbitLabel: 'Inner orbit ◆ 3 moons' },
  'port-updater':    { designation: 'UPD', stellarName: 'Port Updater',       spectralType: 'D1',  solarMasses: '0.60 M☉', flavor: 'polling | syncing | updating | idle (sidecar)',   orbitLabel: 'Outer orbit ◆ 3 moons' },
  'musicbrainz-local': { designation: 'MBL', stellarName: 'MB Local DB',      spectralType: 'D2',  solarMasses: '0.55 M☉', flavor: 'indexing | serving | queried | standby',         orbitLabel: 'Outer orbit ◆ 3 moons' },
  bazarr:            { designation: 'BZR', stellarName: 'Bazarr Sub Station', spectralType: 'D3',  solarMasses: '0.50 M☉', flavor: 'scanning | matching | grabbing | synced',         orbitLabel: 'Outer orbit ◆ 3 moons' },
};

// Space-flavored status tiers — same logic and colors as chemistry, only labels change.
// Calls through to getStatusTier and overrides .label.
export const getSpaceStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const spaceLabels = ['MAIN_SEQUENCE', 'SOLAR_FLARE', 'RED_GIANT', 'SUPERNOVA'];
  return { ...base, label: spaceLabels[base.tier] ?? base.label };
};
