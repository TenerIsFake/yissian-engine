// ─────────────────────────────────────────────
// BIOLOGICAL CELL DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → cellular organelle type labels.

export const BIO_LABELS = {
  LANTHANIDE: 'Cell Nucleus',
  ACTINIDE:   'Organelle',
  TRANSITION: 'Mitochondria',
  NOBLE:      'Membrane',
  CHALCOGEN:  'Ribosome',
  METALLOID:  'Cytoplasm',
  NONMETAL:   'Vacuole',
  ALKALI:     'Lysosome',
  ALKALINE:   'Vesicle',
  HALOGEN:    'Enzyme',
  POST:       'Protein',
  PNICTOGEN:  'Receptor',
};

// Bio metadata overlay — maps service id → cellular display values.
// bioSymbol: short abbreviation shown in cell center.
export const BIO_OVERLAY = {
  plex:              { bioSymbol: 'Nu',  organelleName: 'Plex-Nucleus',    organelleType: 'Nucleus',      metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  overseerr:         { bioSymbol: 'Rc',  organelleName: 'Overseer-Rcpt',   organelleType: 'Receptor',     metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  tautulli:          { bioSymbol: 'Va',  organelleName: 'Tau-Vacuole',     organelleType: 'Vacuole',      metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  radarr:            { bioSymbol: 'Rb',  organelleName: 'Radarr-Ribo',     organelleType: 'Ribosome',     metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  sonarr:            { bioSymbol: 'Mi',  organelleName: 'Sonarr-Mito',     organelleType: 'Mitochondria', metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  lidarr:            { bioSymbol: 'Cy',  organelleName: 'Lidarr-Cyto',     organelleType: 'Cytoplasm',    metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  tunarr:            { bioSymbol: 'Ve',  organelleName: 'Tunarr-Vesicle',  organelleType: 'Vesicle',      metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  qbittorrent:       { bioSymbol: 'Ly',  organelleName: 'QBit-Lysosome',   organelleType: 'Lysosome',     metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  sabnzbd:           { bioSymbol: 'Pr',  organelleName: 'Sab-Protein',     organelleType: 'Protein',      metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  prowlarr:          { bioSymbol: 'En',  organelleName: 'Prowl-Enzyme',    organelleType: 'Enzyme',       metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  cloudflared:       { bioSymbol: 'Mb',  organelleName: 'Cloud-Membrane',  organelleType: 'Membrane',     metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  notifiarr:         { bioSymbol: 'Sg',  organelleName: 'Notif-Signal',    organelleType: 'Receptor',     metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  flaresolverr:      { bioSymbol: 'Or',  organelleName: 'Flare-Organelle', organelleType: 'Organelle',    metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  protonvpn:         { bioSymbol: 'Nc',  organelleName: 'Proton-Nucleoid', organelleType: 'Nucleus',      metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  musicbrainz:       { bioSymbol: 'Rn',  organelleName: 'Music-RNA',       organelleType: 'Ribosome',     metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  'port-updater':    { bioSymbol: 'Plt', organelleName: 'Port-Platelet',   organelleType: 'Vesicle',      metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  'musicbrainz-local': { bioSymbol: 'Vl', organelleName: 'MB-Vacuole',    organelleType: 'Vacuole',      metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
  bazarr:            { bioSymbol: 'Ps',  organelleName: 'Bazarr-Perox',    organelleType: 'Organelle',    metabolicRate: 'ATP/s', cellularRole: 'CELL_ROLE' },
};

// Bio-flavored status tiers — same logic, cellular labels.
export const getBioStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const bioLabels = ['ACTIVE', 'RESTING', 'REPLICATING', 'APOPTOTIC'];
  return { ...base, label: bioLabels[base.tier] ?? base.label };
};
