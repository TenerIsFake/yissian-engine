export const STEAM_LABELS = {
  ALKALI:     'Boiler Room',
  ALKALINE:   'Pressure Chamber',
  TRANSITION: 'Gear Train',
  HALOGEN:    'Steam Valve',
  NOBLE:      'Brass Gauge',
  LANTHANIDE: 'Pneumatic Line',
  POST:       'Condenser',
  METALLOID:  'Telegraph',
  NONMETAL:   'Pipe Junction',
  ACTINIDE:   'Furnace Room',
  PNICTOGEN:  'Piston Array',
  CHALCOGEN:  'Exhaust Stack',
};

export const STEAM_OVERLAY = {
  plex:                { mechanism: 'MAIN BOILER',      gauge: 'Primary Pressure',  material: 'Brass & Iron',    patent: 'Patent #001'    },
  overseerr:           { mechanism: 'REQUEST VALVE',     gauge: 'Intake Pressure',   material: 'Copper Pipe',     patent: 'Patent #002'    },
  tautulli:            { mechanism: 'STAT GAUGE',        gauge: 'Analytics Dial',    material: 'Etched Brass',    patent: 'Patent #003'    },
  radarr:              { mechanism: 'FILM PRESS',        gauge: 'Film Pressure',     material: 'Steel Piston',    patent: 'Patent #004'    },
  sonarr:              { mechanism: 'SERIES ENGINE',     gauge: 'Series RPM',        material: 'Cast Iron',       patent: 'Patent #005'    },
  lidarr:              { mechanism: 'MUSIC BOX',         gauge: 'Audio Pressure',    material: 'Copper Coil',     patent: 'Patent #006'    },
  tunarr:              { mechanism: 'CHANNEL TURBINE',   gauge: 'Stream Flow',       material: 'Bronze Gear',     patent: 'Patent #007'    },
  qbittorrent:         { mechanism: 'TORRENT PUMP',      gauge: 'Download PSI',      material: 'Iron Pipe',       patent: 'Patent #008'    },
  sabnzbd:             { mechanism: 'BINARY CONVEYOR',   gauge: 'NZB Throughput',    material: 'Brass Chain',     patent: 'Patent #009'    },
  prowlarr:            { mechanism: 'INDEX TELEGRAPH',   gauge: 'Signal Strength',   material: 'Copper Wire',     patent: 'Patent #010'    },
  cloudflared:         { mechanism: 'TUNNEL BORING',     gauge: 'Tunnel Pressure',   material: 'Riveted Steel',   patent: 'Patent #011'    },
  notifiarr:           { mechanism: 'ALERT WHISTLE',     gauge: 'Signal Volume',     material: 'Brass Bell',      patent: 'Patent #012'    },
  flaresolverr:        { mechanism: 'BYPASS GOVERNOR',   gauge: 'Override RPM',      material: 'Steel Arm',       patent: 'Patent #013'    },
  protonvpn:           { mechanism: 'CRYPTO ENGINE',     gauge: 'Cipher Pressure',   material: 'Titanium Rotor',  patent: 'Patent #014'    },
  musicbrainz:         { mechanism: 'CATALOG PRESS',     gauge: 'Index Fidelity',    material: 'Etched Plate',    patent: 'Patent #015'    },
  'port-updater':      { mechanism: 'PORT GOVERNOR',     gauge: 'Port Rotation',     material: 'Brass Cam',       patent: 'Patent #016'    },
  'musicbrainz-local': { mechanism: 'LOCAL ARCHIVE',     gauge: 'Archive Depth',     material: 'Oak & Brass',     patent: 'Patent #017'    },
  bazarr:              { mechanism: 'SUBTITLE TYPESETTER', gauge: 'Print Speed',     material: 'Lead Type',       patent: 'Patent #018'    },
  'tautulli-bridge':   { mechanism: 'BRIDGE RELAY',      gauge: 'Relay Speed',       material: 'Copper Rod',      patent: 'Patent #019'    },
};

export const getSteamStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['IDLE', 'WARMING', 'FULL_STEAM', 'OVERPRESSURE'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
