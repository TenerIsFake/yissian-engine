export const FORGE_LABELS = {
  ALKALI:     'Blast Furnace',
  ALKALINE:   'Forge Hearth',
  TRANSITION: 'Anvil',
  HALOGEN:    'Quench Tank',
  NOBLE:      'Bellows',
  LANTHANIDE: 'Crucible',
  POST:       'Casting Mold',
  METALLOID:  'Tongs Station',
  NONMETAL:   'Flux Bin',
  ACTINIDE:   'Coal Hopper',
  PNICTOGEN:  'Hammer Rack',
  CHALCOGEN:  'Cooling Rack',
};

export const FORGE_OVERLAY = {
  plex:                { station: 'MASTER HEARTH',      tool: 'Primary Forge',       alloy: 'Media Stream',       temper: 'Hardened'         },
  overseerr:           { station: 'REQUEST ANVIL',       tool: 'Request Hammer',      alloy: 'Request Queue',      temper: 'Drawn'            },
  tautulli:            { station: 'STAT CRUCIBLE',       tool: 'Data Tongs',          alloy: 'Analytics',          temper: 'Annealed'         },
  radarr:              { station: 'FILM FOUNDRY',        tool: 'Movie Tongs',         alloy: 'Film Library',       temper: 'Case-Hardened'    },
  sonarr:              { station: 'SERIES SMELTER',      tool: 'Series Tongs',        alloy: 'Series Library',     temper: 'Normalized'       },
  lidarr:              { station: 'AUDIO FORGE',         tool: 'Music Hammer',        alloy: 'Music Library',      temper: 'Tempered'         },
  tunarr:              { station: 'CHANNEL FURNACE',     tool: 'Stream Bellows',      alloy: 'Live Channels',      temper: 'Annealed'         },
  qbittorrent:         { station: 'TORRENT BLAST',       tool: 'Download Tongs',      alloy: 'BitTorrent',         temper: 'Quenched'         },
  sabnzbd:             { station: 'NZB SMELTER',         tool: 'Binary Hammer',       alloy: 'Usenet',             temper: 'Stress-Relieved'  },
  prowlarr:            { station: 'INDEX CRUCIBLE',      tool: 'Index Tongs',         alloy: 'Indexers',           temper: 'Normalized'       },
  cloudflared:         { station: 'TUNNEL FORGE',        tool: 'Tunnel Hammer',       alloy: 'Cloudflare',         temper: 'Work-Hardened'    },
  notifiarr:           { station: 'ALERT ANVIL',         tool: 'Signal Tongs',        alloy: 'Notifications',      temper: 'Drawn'            },
  flaresolverr:        { station: 'BYPASS FURNACE',      tool: 'Captcha Breaker',     alloy: 'FlareSolverr',       temper: 'Tempered'         },
  protonvpn:           { station: 'SHIELD HEARTH',       tool: 'Encryption Tongs',    alloy: 'VPN Tunnel',         temper: 'Hardened'         },
  musicbrainz:         { station: 'METADATA FORGE',      tool: 'Tag Hammer',          alloy: 'Music Metadata',     temper: 'Annealed'         },
  'port-updater':      { station: 'PORT BELLOWS',        tool: 'Port Tongs',          alloy: 'Port Manager',       temper: 'Normalized'       },
  'musicbrainz-local': { station: 'LOCAL CRUCIBLE',      tool: 'Local Tag Tongs',     alloy: 'Local Metadata',     temper: 'Annealed'         },
  bazarr:              { station: 'SUBTITLE SMELTER',    tool: 'Subtitle Tongs',      alloy: 'Subtitles',          temper: 'Case-Hardened'    },
  'tautulli-bridge':   { station: 'BRIDGE ANVIL',        tool: 'Bridge Hammer',       alloy: 'TTS Bridge',         temper: 'Normalized'       },
};

export const getForgeStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['COLD_IRON', 'WARMING_UP', 'FORGE_HOT', 'SLAG_OVERFLOW'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
