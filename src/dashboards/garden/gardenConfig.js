export const GARDEN_LABELS = {
  ALKALI:     'Rose Bed',
  ALKALINE:   'Herb Spiral',
  TRANSITION: 'Orchard',
  HALOGEN:    'Greenhouse',
  NOBLE:      'Bonsai',
  LANTHANIDE: 'Meadow',
  POST:       'Compost',
  METALLOID:  'Trellis',
  NONMETAL:   'Moss',
  ACTINIDE:   'Root Cellar',
  PNICTOGEN:  'Vine',
  CHALCOGEN:  'Water Feature',
};

export const GARDEN_OVERLAY = {
  plex:                { plant: 'Oak Tree',         bed: 'Central',  season: 'Perennial', water: 'Weekly' },
  overseerr:           { plant: 'Sunflower',        bed: 'East',     season: 'Summer',    water: 'Daily' },
  tautulli:            { plant: 'Venus Flytrap',    bed: 'Bog',      season: 'Perennial', water: 'Daily' },
  radarr:              { plant: 'Tomato',           bed: 'Kitchen',  season: 'Summer',    water: 'Daily' },
  sonarr:              { plant: 'Climbing Rose',    bed: 'Wall',     season: 'Summer',    water: 'Twice Weekly' },
  lidarr:              { plant: 'Lavender',         bed: 'Herb',     season: 'Summer',    water: 'Weekly' },
  tunarr:              { plant: 'Mint',             bed: 'Herb',     season: 'Perennial', water: 'Daily' },
  qbittorrent:         { plant: 'Pumpkin',          bed: 'Patch',    season: 'Autumn',    water: 'Daily' },
  sabnzbd:             { plant: 'Bamboo',           bed: 'Screen',   season: 'Perennial', water: 'Twice Weekly' },
  prowlarr:            { plant: 'Wisteria',         bed: 'Arbor',    season: 'Spring',    water: 'Weekly' },
  cloudflared:         { plant: 'Fern',             bed: 'Shade',    season: 'Perennial', water: 'Twice Weekly' },
  notifiarr:           { plant: 'Bell Flower',      bed: 'Border',   season: 'Summer',    water: 'Daily' },
  flaresolverr:        { plant: 'Cactus',           bed: 'Rockery',  season: 'Perennial', water: 'Monthly' },
  protonvpn:           { plant: 'Night Jasmine',    bed: 'Fence',    season: 'Summer',    water: 'Weekly' },
  musicbrainz:         { plant: 'Bonsai Maple',     bed: 'Display',  season: 'Perennial', water: 'Daily' },
  'port-updater':      { plant: 'Ground Cover',     bed: 'Path',     season: 'Perennial', water: 'Weekly' },
  'musicbrainz-local': { plant: 'Moss Garden',      bed: 'Stone',    season: 'Perennial', water: 'Daily' },
  bazarr:              { plant: 'Orchid',           bed: 'Greenhouse',season: 'Perennial', water: 'Twice Weekly' },
  'tautulli-bridge':   { plant: 'Morning Glory',    bed: 'Trellis',  season: 'Summer',    water: 'Daily' },
};

export const getGardenStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['DORMANT', 'GROWING', 'BLOOMING', 'OVERGROWN'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
