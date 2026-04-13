export const TACTICAL_LABELS = {
  ALKALI:     'Command Post',
  ALKALINE:   'Comm Center',
  TRANSITION: 'Fire Team',
  HALOGEN:    'Recon',
  NOBLE:      'Intel',
  LANTHANIDE: 'Operations',
  POST:       'Logistics',
  METALLOID:  'Signals',
  NONMETAL:   'Supply',
  ACTINIDE:   'Support Ops',
  PNICTOGEN:  'Ordnance',
  CHALCOGEN:  'Medevac',
};

export const TACTICAL_OVERLAY = {
  plex:                { callsign: 'OVERLORD',        role: 'Command & Control',   sector: 'Alpha',   clearance: 'TOP SECRET'    },
  overseerr:           { callsign: 'GATEWAY',         role: 'Request Handler',     sector: 'Alpha',   clearance: 'SECRET'        },
  tautulli:            { callsign: 'WATCHDOG',        role: 'Intelligence',        sector: 'Alpha',   clearance: 'SECRET'        },
  radarr:              { callsign: 'HAWKEYE',         role: 'Film Acquisition',    sector: 'Bravo',   clearance: 'CLASSIFIED'    },
  sonarr:              { callsign: 'SONAR',           role: 'Series Tracking',     sector: 'Bravo',   clearance: 'CLASSIFIED'    },
  lidarr:              { callsign: 'ECHO',            role: 'Audio Operations',    sector: 'Bravo',   clearance: 'CLASSIFIED'    },
  tunarr:              { callsign: 'BROADCAST',       role: 'Channel Ops',         sector: 'Alpha',   clearance: 'SECRET'        },
  qbittorrent:         { callsign: 'MULE',            role: 'Heavy Transport',     sector: 'Charlie', clearance: 'RESTRICTED'    },
  sabnzbd:             { callsign: 'COURIER',         role: 'Binary Transport',    sector: 'Charlie', clearance: 'RESTRICTED'    },
  prowlarr:            { callsign: 'SPOTTER',         role: 'Index Recon',         sector: 'Bravo',   clearance: 'CLASSIFIED'    },
  cloudflared:         { callsign: 'TUNNEL RAT',      role: 'Secure Comms',        sector: 'Delta',   clearance: 'TOP SECRET'    },
  notifiarr:           { callsign: 'DISPATCH',        role: 'Alert Relay',         sector: 'Delta',   clearance: 'RESTRICTED'    },
  flaresolverr:        { callsign: 'GHOST',           role: 'Countermeasures',     sector: 'Delta',   clearance: 'SECRET'        },
  protonvpn:           { callsign: 'PHANTOM',         role: 'Encrypted Link',      sector: 'Charlie', clearance: 'TOP SECRET'    },
  musicbrainz:         { callsign: 'ORACLE',          role: 'Metadata Intel',      sector: 'Bravo',   clearance: 'CLASSIFIED'    },
  'port-updater':      { callsign: 'RELAY',           role: 'Port Rotation',       sector: 'Charlie', clearance: 'RESTRICTED'    },
  'musicbrainz-local': { callsign: 'ARCHIVE',         role: 'Local Intel DB',      sector: 'Bravo',   clearance: 'CLASSIFIED'    },
  bazarr:              { callsign: 'TRANSLATOR',      role: 'Subtitle Ops',        sector: 'Bravo',   clearance: 'CLASSIFIED'    },
  'tautulli-bridge':   { callsign: 'BRIDGE',          role: 'TTS Relay',           sector: 'Delta',   clearance: 'RESTRICTED'    },
};

export const getTacticalStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['STANDBY', 'ALERT', 'ENGAGED', 'CRITICAL'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
