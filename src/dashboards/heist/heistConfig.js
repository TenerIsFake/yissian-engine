export const HEIST_LABELS = {
  ALKALI:     'The Vault',
  ALKALINE:   'Safe House',
  TRANSITION: 'Getaway',
  HALOGEN:    'Surveillance',
  NOBLE:      'The Mark',
  LANTHANIDE: 'Crew',
  POST:       'Fence',
  METALLOID:  'Tech',
  NONMETAL:   'Lookout',
  ACTINIDE:   'Tunnels',
  PNICTOGEN:  'Muscle',
  CHALCOGEN:  'Inside Man',
};

export const HEIST_OVERLAY = {
  plex:                { alias: 'The Mastermind',   role: 'Planner',         cut: '30%', heat: 'Cold' },
  overseerr:           { alias: 'The Fixer',        role: 'Request Handler', cut: '5%',  heat: 'Cold' },
  tautulli:            { alias: 'The Eye',          role: 'Surveillance',    cut: '5%',  heat: 'Warm' },
  radarr:              { alias: 'The Collector',    role: 'Film Acquisition',cut: '10%', heat: 'Cold' },
  sonarr:              { alias: 'The Watcher',      role: 'Series Scout',    cut: '10%', heat: 'Cold' },
  lidarr:              { alias: 'The DJ',           role: 'Audio Expert',    cut: '5%',  heat: 'Cold' },
  tunarr:              { alias: 'The Switcher',     role: 'Channel Ops',     cut: '3%',  heat: 'Cold' },
  qbittorrent:         { alias: 'The Mule',         role: 'Heavy Transport', cut: '8%',  heat: 'Hot' },
  sabnzbd:             { alias: 'The Courier',      role: 'Binary Drops',    cut: '5%',  heat: 'Warm' },
  prowlarr:            { alias: 'The Scout',        role: 'Recon',           cut: '5%',  heat: 'Cold' },
  cloudflared:         { alias: 'The Ghost',        role: 'Tunnel Rat',      cut: '3%',  heat: 'Cold' },
  notifiarr:           { alias: 'The Messenger',    role: 'Dead Drops',      cut: '2%',  heat: 'Cold' },
  flaresolverr:        { alias: 'The Locksmith',    role: 'Bypass',          cut: '3%',  heat: 'Warm' },
  protonvpn:           { alias: 'The Shadow',       role: 'Cover Identity',  cut: '3%',  heat: 'Cold' },
  musicbrainz:         { alias: 'The Archivist',    role: 'Intel',           cut: '2%',  heat: 'Cold' },
  'port-updater':      { alias: 'The Janitor',      role: 'Clean-Up',        cut: '1%',  heat: 'Cold' },
  'musicbrainz-local': { alias: 'The Librarian',    role: 'Local Intel',     cut: '1%',  heat: 'Cold' },
  bazarr:              { alias: 'The Translator',   role: 'Comms',           cut: '2%',  heat: 'Cold' },
  'tautulli-bridge':   { alias: 'The Voice',        role: 'Announcer',       cut: '1%',  heat: 'Cold' },
};

export const getHeistStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['CASING', 'IN PROGRESS', 'ALARM', 'BUSTED'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
