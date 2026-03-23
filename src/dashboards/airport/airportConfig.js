// ─────────────────────────────────────────────
// AIRPORT DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → airport zone labels.

export const AIRPORT_LABELS = {
  LANTHANIDE: 'VIP Lounge',
  ACTINIDE:   'Security Zone',
  TRANSITION: 'Connecting Gate',
  NOBLE:      'International Dep.',
  CHALCOGEN:  'Cargo Bay',
  METALLOID:  'Maintenance Hangar',
  NONMETAL:   'Domestic Terminal',
  ALKALI:     'Express Gate',
  ALKALINE:   'Regional Terminal',
  HALOGEN:    'Customs & Immigr.',
  POST:       'Baggage Claim',
  PNICTOGEN:  'Remote Stand',
};

// Airport metadata overlay — maps service id → flight/gate display values.
export const AIRPORT_OVERLAY = {
  plex:              { icao: 'KPLX', flightDesig: 'PLX-001', gateInfo: 'GATE A1', terminal: 'Terminal A', runway: 'RWY 27L' },
  overseerr:         { icao: 'KOVR', flightDesig: 'OVR-200', gateInfo: 'GATE B4', terminal: 'Terminal B', runway: 'RWY 09R' },
  tautulli:          { icao: 'KTAU', flightDesig: 'TAU-303', gateInfo: 'GATE C7', terminal: 'Terminal C', runway: 'RWY 36'  },
  radarr:            { icao: 'KRDR', flightDesig: 'RDR-400', gateInfo: 'GATE D2', terminal: 'Terminal D', runway: 'RWY 18L' },
  sonarr:            { icao: 'KSNR', flightDesig: 'SNR-501', gateInfo: 'GATE E5', terminal: 'Terminal E', runway: 'RWY 27R' },
  lidarr:            { icao: 'KLDR', flightDesig: 'LDR-600', gateInfo: 'GATE F3', terminal: 'Terminal F', runway: 'RWY 09L' },
  tunarr:            { icao: 'KTNR', flightDesig: 'TNR-707', gateInfo: 'GATE G8', terminal: 'Terminal G', runway: 'RWY 18R' },
  qbittorrent:       { icao: 'KQBT', flightDesig: 'QBT-800', gateInfo: 'GATE H1', terminal: 'Terminal H', runway: 'RWY 36L' },
  sabnzbd:           { icao: 'KSAB', flightDesig: 'SAB-900', gateInfo: 'GATE J6', terminal: 'Terminal J', runway: 'RWY 36R' },
  prowlarr:          { icao: 'KPRL', flightDesig: 'PRL-100', gateInfo: 'GATE K9', terminal: 'Terminal K', runway: 'RWY 27'  },
  cloudflared:       { icao: 'KCLD', flightDesig: 'CLD-110', gateInfo: 'GATE L2', terminal: 'Terminal L', runway: 'RWY 09'  },
  notifiarr:         { icao: 'KNTF', flightDesig: 'NTF-120', gateInfo: 'GATE M4', terminal: 'Terminal M', runway: 'RWY 18'  },
  flaresolverr:      { icao: 'KFLS', flightDesig: 'FLS-130', gateInfo: 'GATE N7', terminal: 'Terminal N', runway: 'RWY 36'  },
  protonvpn:         { icao: 'KVPN', flightDesig: 'VPN-140', gateInfo: 'GATE P3', terminal: 'Terminal P', runway: 'RWY 27L' },
  musicbrainz:       { icao: 'KMBZ', flightDesig: 'MBZ-150', gateInfo: 'GATE Q1', terminal: 'Terminal Q', runway: 'RWY 09R' },
  'port-updater':    { icao: 'KPTU', flightDesig: 'PTU-160', gateInfo: 'GATE R5', terminal: 'Terminal R', runway: 'RWY 18L' },
  'musicbrainz-local': { icao: 'KMBL', flightDesig: 'MBL-170', gateInfo: 'GATE S8', terminal: 'Terminal S', runway: 'RWY 27R' },
  bazarr:            { icao: 'KBZR', flightDesig: 'BZR-180', gateInfo: 'GATE T2', terminal: 'Terminal T', runway: 'RWY 09'  },
};

// Airport-flavored status tiers — same logic, flight status labels.
export const getAirportStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['TAXIING', 'AIRBORNE', 'HOLDING', 'GROUNDED'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
