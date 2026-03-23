export const GLOBE_LABELS = {
  ALKALI:     'Continent',
  ALKALINE:   'Ocean',
  TRANSITION: 'Mountain Range',
  HALOGEN:    'Island Chain',
  NOBLE:      'River System',
  LANTHANIDE: 'Desert Region',
  POST:       'Polar Zone',
  METALLOID:  'Rainforest',
  NONMETAL:   'Plateau',
  ACTINIDE:   'Peninsula',
  PNICTOGEN:  'Archipelago',
  CHALCOGEN:  'Tectonic Plate',
};

export const GLOBE_OVERLAY = {
  plex:               { region: 'Pacific Basin',         coordinates: '0°N, 180°W',  climate: 'Maritime',     elevation: 'Sea Level' },
  overseerr:          { region: 'North Atlantic',        coordinates: '45°N, 30°W',  climate: 'Temperate',    elevation: 'Sea Level' },
  tautulli:           { region: 'Arctic Circle',         coordinates: '66°N, 0°E',   climate: 'Polar',        elevation: '0–500 m'   },
  radarr:             { region: 'Rocky Mountains',       coordinates: '40°N, 106°W', climate: 'Alpine',       elevation: '4,400 m'   },
  sonarr:             { region: 'Appalachians',          coordinates: '37°N, 82°W',  climate: 'Temperate',    elevation: '2,037 m'   },
  lidarr:             { region: 'Amazon Basin',          coordinates: '3°S, 60°W',   climate: 'Tropical',     elevation: '200 m'     },
  tunarr:             { region: 'Sahara Desert',         coordinates: '23°N, 13°E',  climate: 'Arid',         elevation: '400 m'     },
  qbittorrent:        { region: 'Mariana Trench',        coordinates: '11°N, 142°E', climate: 'Abyssal',      elevation: '−10,935 m' },
  sabnzbd:            { region: 'Siberian Plateau',      coordinates: '60°N, 100°E', climate: 'Continental',  elevation: '500–1000 m'},
  prowlarr:           { region: 'South China Sea',       coordinates: '15°N, 114°E', climate: 'Tropical',     elevation: 'Sea Level' },
  cloudflared:        { region: 'Bermuda Triangle',      coordinates: '25°N, 71°W',  climate: 'Subtropical',  elevation: 'Sea Level' },
  notifiarr:          { region: 'North Sea',             coordinates: '56°N, 3°E',   climate: 'Maritime',     elevation: 'Sea Level' },
  flaresolverr:       { region: 'Gobi Desert',           coordinates: '42°N, 105°E', climate: 'Arid',         elevation: '1,000 m'   },
  protonvpn:          { region: 'Swiss Alps',            coordinates: '46°N, 8°E',   climate: 'Alpine',       elevation: '4,478 m'   },
  musicbrainz:        { region: 'Mediterranean Sea',     coordinates: '35°N, 18°E',  climate: 'Subtropical',  elevation: 'Sea Level' },
  'port-updater':     { region: 'Strait of Gibraltar',   coordinates: '36°N, 5°W',   climate: 'Mediterranean',elevation: 'Sea Level' },
  'musicbrainz-local':{ region: 'Tibetan Plateau',       coordinates: '32°N, 87°E',  climate: 'Alpine',       elevation: '4,500 m'   },
  bazarr:             { region: 'Indonesian Archipelago',coordinates: '5°S, 120°E',  climate: 'Tropical',     elevation: '100 m'     },
};

export const getGlobeStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['STABLE', 'MONITORING', 'ALERT', 'OFFLINE'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
