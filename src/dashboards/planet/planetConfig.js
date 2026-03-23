// ─────────────────────────────────────────────
// PLANET DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → planetary body type labels.

export const PLANET_LABELS = {
  LANTHANIDE: 'Rare World',
  ACTINIDE:   'Radioactive Body',
  TRANSITION: 'Main Belt Object',
  NOBLE:      'Gas Giant',
  CHALCOGEN:  'Volcanic World',
  METALLOID:  'Metallic Asteroid',
  NONMETAL:   'Ice Body',
  ALKALI:     'Inner Planet',
  ALKALINE:   'Rocky Planet',
  HALOGEN:    'Comet',
  POST:       'Dwarf Planet',
  PNICTOGEN:  'Outer Moon',
};

// Planet metadata overlay — maps service id → planetary display values.
export const PLANET_OVERLAY = {
  plex:              { planetName: 'PLEXUS PRIME',  orbitalClass: 'Gas Giant',      atmosphere: 'Hydrogen-Rich',  surfaceTemp: '-145°C' },
  overseerr:         { planetName: 'OVERSEER',       orbitalClass: 'Terrestrial',    atmosphere: 'Dense CO₂',      surfaceTemp: '+460°C' },
  tautulli:          { planetName: 'TAUTULLI IV',    orbitalClass: 'Ice Giant',      atmosphere: 'Methane-Haze',   surfaceTemp: '-220°C' },
  radarr:            { planetName: 'RADARR',         orbitalClass: 'Rocky World',    atmosphere: 'Thin N₂',        surfaceTemp: '-63°C'  },
  sonarr:            { planetName: 'SONARRIA',       orbitalClass: 'Oceanic World',  atmosphere: 'Water-Vapor',    surfaceTemp: '+15°C'  },
  lidarr:            { planetName: 'LIDAR BELT',     orbitalClass: 'Asteroid Belt',  atmosphere: 'Trace O₂',       surfaceTemp: '-80°C'  },
  tunarr:            { planetName: 'TUNARR',         orbitalClass: 'Desert World',   atmosphere: 'Dust Storms',    surfaceTemp: '+30°C'  },
  qbittorrent:       { planetName: 'QBITTON',        orbitalClass: 'Rogue Planet',   atmosphere: 'Dark Matter',    surfaceTemp: '-270°C' },
  sabnzbd:           { planetName: 'SABNUS',         orbitalClass: 'Gas Giant',      atmosphere: 'Ammonia-Rich',   surfaceTemp: '-178°C' },
  prowlarr:          { planetName: 'PROWLARR',       orbitalClass: 'Pulsar Moon',    atmosphere: 'Ionized Gas',    surfaceTemp: '+3000°C'},
  cloudflared:       { planetName: 'CLOUD-9',        orbitalClass: 'Cloud World',    atmosphere: 'Dense H₂O',      surfaceTemp: '-20°C'  },
  notifiarr:         { planetName: 'NOTIF-7',        orbitalClass: 'Signal Beacon',  atmosphere: 'Plasma Fields',  surfaceTemp: '+2000°C'},
  flaresolverr:      { planetName: 'FLARESTAR',      orbitalClass: 'Flare Star',     atmosphere: 'Stellar Wind',   surfaceTemp: '+5000°C'},
  protonvpn:         { planetName: 'PROTON VEIL',    orbitalClass: 'Cloaked World',  atmosphere: 'Quantum Fog',    surfaceTemp: '???°C'  },
  musicbrainz:       { planetName: 'HARMONIA',       orbitalClass: 'Resonant World', atmosphere: 'Sonic Plasma',   surfaceTemp: '-55°C'  },
  'port-updater':    { planetName: 'PORT-9',         orbitalClass: 'Relay Moon',     atmosphere: 'Trace Helium',   surfaceTemp: '-200°C' },
  'musicbrainz-local': { planetName: 'MB-LOCAL',     orbitalClass: 'Inner Moon',     atmosphere: 'None',           surfaceTemp: '-250°C' },
  bazarr:            { planetName: 'BAZAAR',         orbitalClass: 'Trading Post',   atmosphere: 'Mixed O₂/N₂',   surfaceTemp: '+22°C'  },
};

// Planet-flavored status tiers — same logic, orbital labels.
export const getPlanetStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['ORBITING', 'ACTIVE', 'STORM', 'DARK_SIDE'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
