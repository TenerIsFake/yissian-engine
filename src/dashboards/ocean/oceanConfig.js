export const OCEAN_LABELS = {
  ALKALI:     'Abyssal Plain',
  ALKALINE:   'Mid-Ocean Ridge',
  TRANSITION: 'Continental Shelf',
  HALOGEN:    'Hydrothermal Vent',
  NOBLE:      'Coral Reef',
  LANTHANIDE: 'Deep Trench',
  POST:       'Seamount',
  METALLOID:  'Kelp Forest',
  NONMETAL:   'Tidal Zone',
  ACTINIDE:   'Cold Seep',
  PNICTOGEN:  'Submarine Canyon',
  CHALCOGEN:  'Brine Pool',
};

export const OCEAN_OVERLAY = {
  plex:                { zone: 'Pacific Reef',        depth: 'Photic Zone',       species: 'Media Coral',          ecology: 'Reef'     },
  overseerr:           { zone: 'Atlantic Shelf',       depth: 'Neritic Zone',      species: 'Request Crab',         ecology: 'Shelf'    },
  tautulli:            { zone: 'Arctic Ridge',         depth: 'Mesopelagic',       species: 'Stat Lanternfish',      ecology: 'Ridge'    },
  radarr:              { zone: 'Mariana Canyon',       depth: 'Bathypelagic',      species: 'Movie Anglerfish',      ecology: 'Trench'   },
  sonarr:              { zone: 'Cascadia Shelf',       depth: 'Neritic Zone',      species: 'Series Eel',            ecology: 'Shelf'    },
  lidarr:              { zone: 'Great Barrier',        depth: 'Photic Zone',       species: 'Music Clownfish',       ecology: 'Reef'     },
  tunarr:              { zone: 'Caribbean Lagoon',     depth: 'Epipelagic',        species: 'Channel Dolphin',       ecology: 'Lagoon'   },
  qbittorrent:         { zone: 'Hadal Trench',         depth: 'Hadopelagic',       species: 'Torrent Isopod',        ecology: 'Trench'   },
  sabnzbd:             { zone: 'Siberian Basin',       depth: 'Abyssopelagic',     species: 'NZB Cephalopod',        ecology: 'Basin'    },
  prowlarr:            { zone: 'South China Current',  depth: 'Mesopelagic',       species: 'Index Squid',           ecology: 'Current'  },
  cloudflared:         { zone: 'Bermuda Deep',         depth: 'Bathypelagic',      species: 'Tunnel Shark',          ecology: 'Deep'     },
  notifiarr:           { zone: 'North Sea Current',    depth: 'Epipelagic',        species: 'Signal Shrimp',         ecology: 'Current'  },
  flaresolverr:        { zone: 'Cold Seep Field',      depth: 'Cold Seep',         species: 'Bypass Tube Worm',      ecology: 'Seep'     },
  protonvpn:           { zone: 'Swiss Deep Water',     depth: 'Bathypelagic',      species: 'Stealth Cuttlefish',    ecology: 'Deep'     },
  musicbrainz:         { zone: 'Mediterranean Gyre',   depth: 'Epipelagic',        species: 'Metadata Jellyfish',    ecology: 'Gyre'     },
  'port-updater':      { zone: 'Gibraltar Shelf',      depth: 'Neritic Zone',      species: 'Port Barnacle',         ecology: 'Shelf'    },
  'musicbrainz-local': { zone: 'Tibetan Basin',        depth: 'Abyssopelagic',     species: 'Local Hydra',           ecology: 'Basin'    },
  bazarr:              { zone: 'Indonesian Reef',      depth: 'Photic Zone',       species: 'Subtitle Seahorse',     ecology: 'Reef'     },
  'tautulli-bridge':   { zone: 'Bridge Current',       depth: 'Mesopelagic',       species: 'TTS Nautilus',          ecology: 'Current'  },
};

export const getOceanStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['CALM', 'RIPPLE', 'SURGE', 'MAELSTROM'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
