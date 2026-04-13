export const BLUEPRINT_LABELS = {
  ALKALI:     'Foundation',
  ALKALINE:   'Structural',
  TRANSITION: 'Mechanical',
  HALOGEN:    'Electrical',
  NOBLE:      'Specification',
  LANTHANIDE: 'Assembly',
  POST:       'Plumbing',
  METALLOID:  'Insulation',
  NONMETAL:   'Finishing',
  ACTINIDE:   'Excavation',
  PNICTOGEN:  'Ventilation',
  CHALCOGEN:  'Drainage',
};

export const BLUEPRINT_OVERLAY = {
  plex:                { designation: 'A-001',      system: 'Main Frame',       floor: 'Ground',   revision: 'Rev. D' },
  overseerr:           { designation: 'A-002',      system: 'Request Intake',   floor: 'Ground',   revision: 'Rev. C' },
  tautulli:            { designation: 'A-003',      system: 'Usage Monitor',    floor: 'Ground',   revision: 'Rev. B' },
  radarr:              { designation: 'B-101',      system: 'Film Retrieval',   floor: '1st',      revision: 'Rev. E' },
  sonarr:              { designation: 'B-102',      system: 'Series Tracker',   floor: '1st',      revision: 'Rev. E' },
  lidarr:              { designation: 'B-103',      system: 'Audio Pipeline',   floor: '1st',      revision: 'Rev. C' },
  tunarr:              { designation: 'B-104',      system: 'Channel Router',   floor: '1st',      revision: 'Rev. A' },
  qbittorrent:         { designation: 'C-201',      system: 'Heavy Loader',     floor: 'Basement', revision: 'Rev. F' },
  sabnzbd:             { designation: 'C-202',      system: 'Binary Loader',    floor: 'Basement', revision: 'Rev. D' },
  prowlarr:            { designation: 'B-105',      system: 'Index Scanner',    floor: '1st',      revision: 'Rev. C' },
  cloudflared:         { designation: 'D-301',      system: 'Tunnel Bore',      floor: 'Sub-Base', revision: 'Rev. B' },
  notifiarr:           { designation: 'D-302',      system: 'Signal Wire',      floor: 'Sub-Base', revision: 'Rev. A' },
  flaresolverr:        { designation: 'D-303',      system: 'Bypass Valve',     floor: 'Sub-Base', revision: 'Rev. B' },
  protonvpn:           { designation: 'C-203',      system: 'Sealed Conduit',   floor: 'Basement', revision: 'Rev. C' },
  musicbrainz:         { designation: 'B-106',      system: 'Data Vault',       floor: '1st',      revision: 'Rev. B' },
  'port-updater':      { designation: 'C-204',      system: 'Port Regulator',   floor: 'Basement', revision: 'Rev. B' },
  'musicbrainz-local': { designation: 'B-107',      system: 'Local Ref DB',     floor: '1st',      revision: 'Rev. A' },
  bazarr:              { designation: 'B-108',      system: 'Caption Overlay',  floor: '1st',      revision: 'Rev. C' },
  'tautulli-bridge':   { designation: 'D-304',      system: 'Announce Horn',    floor: 'Sub-Base', revision: 'Rev. A' },
};

export const getBlueprintStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['ON SPEC', 'DEVIATION', 'OVER LOAD', 'CRITICAL'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
