export const METRO_LABELS = {
  ALKALI:     'Central Station',
  ALKALINE:   'Interchange',
  TRANSITION: 'Express Line',
  HALOGEN:    'Local Stop',
  NOBLE:      'Terminal',
  LANTHANIDE: 'Junction',
  POST:       'Platform',
  METALLOID:  'Depot',
  NONMETAL:   'Concourse',
  ACTINIDE:   'Maintenance',
  PNICTOGEN:  'Transfer',
  CHALCOGEN:  'Loop',
};

export const METRO_OVERLAY = {
  plex:                { station: 'Grand Central',      line: 'Red',     zone: '1', passengers: 'Peak' },
  overseerr:           { station: 'Request Junction',   line: 'Blue',    zone: '1', passengers: 'Moderate' },
  tautulli:            { station: 'Monitor Square',     line: 'Red',     zone: '1', passengers: 'Light' },
  radarr:              { station: 'Film Avenue',        line: 'Yellow',  zone: '2', passengers: 'Peak' },
  sonarr:              { station: 'Series Boulevard',   line: 'Yellow',  zone: '2', passengers: 'Peak' },
  lidarr:              { station: 'Audio Park',         line: 'Green',   zone: '2', passengers: 'Moderate' },
  tunarr:              { station: 'Channel Cross',      line: 'Green',   zone: '2', passengers: 'Light' },
  qbittorrent:         { station: 'Torrent Terminus',   line: 'Orange',  zone: '3', passengers: 'Heavy' },
  sabnzbd:             { station: 'Binary Bridge',      line: 'Orange',  zone: '3', passengers: 'Moderate' },
  prowlarr:            { station: 'Index Circle',       line: 'Yellow',  zone: '2', passengers: 'Light' },
  cloudflared:         { station: 'Tunnel End',         line: 'Purple',  zone: '4', passengers: 'Light' },
  notifiarr:           { station: 'Alert Alley',        line: 'Purple',  zone: '4', passengers: 'Sparse' },
  flaresolverr:        { station: 'Bypass Lane',        line: 'Purple',  zone: '4', passengers: 'Sparse' },
  protonvpn:           { station: 'Encrypted Crossing', line: 'Orange',  zone: '3', passengers: 'Light' },
  musicbrainz:         { station: 'Metadata Mews',      line: 'Green',   zone: '2', passengers: 'Light' },
  'port-updater':      { station: 'Port Side',          line: 'Orange',  zone: '3', passengers: 'Sparse' },
  'musicbrainz-local': { station: 'Archive Row',        line: 'Green',   zone: '2', passengers: 'Sparse' },
  bazarr:              { station: 'Subtitle Street',    line: 'Yellow',  zone: '2', passengers: 'Sparse' },
  'tautulli-bridge':   { station: 'Bridge Platform',    line: 'Purple',  zone: '4', passengers: 'Sparse' },
};

export const getMetroStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['IDLE', 'RUNNING', 'DELAYED', 'SUSPENDED'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
