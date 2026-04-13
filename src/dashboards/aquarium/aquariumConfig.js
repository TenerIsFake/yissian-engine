export const AQUARIUM_LABELS = {
  ALKALI:     'Reef Tank',
  ALKALINE:   'Deep Sea',
  TRANSITION: 'Pelagic',
  HALOGEN:    'Tidal Pool',
  NOBLE:      'Kelp Forest',
  LANTHANIDE: 'Coral Garden',
  POST:       'Estuary',
  METALLOID:  'Mangrove',
  NONMETAL:   'Plankton',
  ACTINIDE:   'Abyss',
  PNICTOGEN:  'Predator',
  CHALCOGEN:  'Jellyfish',
};

export const AQUARIUM_OVERLAY = {
  plex:                { species: 'Great White Shark',    zone: 'Open Ocean', tank: 'A1', feeding: 'Daily' },
  overseerr:           { species: 'Cleaner Wrasse',       zone: 'Reef',       tank: 'B1', feeding: 'Hourly' },
  tautulli:            { species: 'Mantis Shrimp',        zone: 'Reef',       tank: 'B2', feeding: 'Twice Daily' },
  radarr:              { species: 'Blue Tang',            zone: 'Reef',       tank: 'B3', feeding: 'Twice Daily' },
  sonarr:              { species: 'Clownfish',            zone: 'Anemone',    tank: 'B4', feeding: 'Twice Daily' },
  lidarr:              { species: 'Seahorse',             zone: 'Seagrass',   tank: 'C1', feeding: 'Thrice Daily' },
  tunarr:              { species: 'Pufferfish',           zone: 'Reef',       tank: 'B5', feeding: 'Daily' },
  qbittorrent:         { species: 'Giant Pacific Octopus',zone: 'Deep Sea',   tank: 'D1', feeding: 'Every 3 Days' },
  sabnzbd:             { species: 'Moray Eel',            zone: 'Cave',       tank: 'D2', feeding: 'Weekly' },
  prowlarr:            { species: 'Barracuda',            zone: 'Open Water', tank: 'A2', feeding: 'Daily' },
  cloudflared:         { species: 'Cuttlefish',           zone: 'Deep Sea',   tank: 'D3', feeding: 'Daily' },
  notifiarr:           { species: 'Dolphin',              zone: 'Performance',tank: 'E1', feeding: 'Twice Daily' },
  flaresolverr:        { species: 'Electric Eel',         zone: 'Freshwater', tank: 'F1', feeding: 'Weekly' },
  protonvpn:           { species: 'Anglerfish',           zone: 'Deep Abyss', tank: 'G1', feeding: 'Weekly' },
  musicbrainz:         { species: 'Sea Turtle',           zone: 'Lagoon',     tank: 'C2', feeding: 'Daily' },
  'port-updater':      { species: 'Hermit Crab',          zone: 'Tidal Pool', tank: 'H1', feeding: 'Hourly' },
  'musicbrainz-local': { species: 'Starfish',             zone: 'Touch Pool', tank: 'H2', feeding: 'Daily' },
  bazarr:              { species: 'Parrotfish',           zone: 'Reef',       tank: 'B6', feeding: 'Twice Daily' },
  'tautulli-bridge':   { species: 'Beluga Whale',         zone: 'Arctic',     tank: 'I1', feeding: 'Daily' },
};

export const getAquariumStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['CALM', 'SWIMMING', 'AGITATED', 'FRENZY'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
