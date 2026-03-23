// ─────────────────────────────────────────────
// MOLECULE DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → compound type labels.

export const MOLECULE_LABELS = {
  LANTHANIDE: 'Rare Earth Compound',
  ACTINIDE:   'Heavy Isotope',
  TRANSITION: 'Transition Complex',
  NOBLE:      'Noble Gas Compound',
  CHALCOGEN:  'Chalcogenide',
  METALLOID:  'Metalloid Compound',
  NONMETAL:   'Nonmetal Molecule',
  ALKALI:     'Alkali Salt',
  ALKALINE:   'Alkaline Earth Cpd',
  HALOGEN:    'Halide',
  POST:       'Post-Transition Cpd',
  PNICTOGEN:  'Pnictide',
};

// Molecule metadata overlay — maps service id → compound display values.
export const MOLECULE_OVERLAY = {
  plex:              { formula: 'Pl₄X',   compoundName: 'PLEXONIUM',      compoundType: 'Organic',    bondType: 'Covalent',     molarMass: '484.8 g/mol' },
  overseerr:         { formula: 'OvSr₂',  compoundName: 'OVERSEERITE',    compoundType: 'Complex',    bondType: 'Ionic',        molarMass: '312.4 g/mol' },
  tautulli:          { formula: 'TaU₃',   compoundName: 'TAUTULLINE',     compoundType: 'Aromatic',   bondType: 'Metallic',     molarMass: '228.6 g/mol' },
  radarr:            { formula: 'Ra²Ar',  compoundName: 'RADARRITE',      compoundType: 'Polar',      bondType: 'Covalent',     molarMass: '195.2 g/mol' },
  sonarr:            { formula: 'So₂Nr',  compoundName: 'SONARRIDE',      compoundType: 'Nonpolar',   bondType: 'Covalent',     molarMass: '210.3 g/mol' },
  lidarr:            { formula: 'LiDr₃',  compoundName: 'LIDARRINE',      compoundType: 'Organic',    bondType: 'Hydrogen',     molarMass: '178.9 g/mol' },
  tunarr:            { formula: 'TuNr₂',  compoundName: 'TUNARRATE',      compoundType: 'Inorganic',  bondType: 'Ionic',        molarMass: '164.7 g/mol' },
  qbittorrent:       { formula: 'QBt₄',   compoundName: 'QBITTORITE',     compoundType: 'Polymer',    bondType: 'Van der Waals',molarMass: '390.5 g/mol' },
  sabnzbd:           { formula: 'SbNz₂',  compoundName: 'SABNZITE',       compoundType: 'Inorganic',  bondType: 'Ionic',        molarMass: '285.1 g/mol' },
  prowlarr:          { formula: 'PrAr₂',  compoundName: 'PROWLARITE',     compoundType: 'Aromatic',   bondType: 'Covalent',     molarMass: '244.8 g/mol' },
  cloudflared:       { formula: 'CfD₃',   compoundName: 'CLOUDFLITE',     compoundType: 'Polar',      bondType: 'Covalent',     molarMass: '340.2 g/mol' },
  notifiarr:         { formula: 'NtAr',   compoundName: 'NOTIFIARITE',    compoundType: 'Organic',    bondType: 'Hydrogen',     molarMass: '156.4 g/mol' },
  flaresolverr:      { formula: 'FlSv₂',  compoundName: 'FLARESOLVITE',   compoundType: 'Complex',    bondType: 'Metallic',     molarMass: '298.7 g/mol' },
  protonvpn:         { formula: 'PrVn₃',  compoundName: 'PROTONITE',      compoundType: 'Nonpolar',   bondType: 'Covalent',     molarMass: '275.3 g/mol' },
  musicbrainz:       { formula: 'MuBz',   compoundName: 'MUSICBRAINITE',  compoundType: 'Aromatic',   bondType: 'Van der Waals',molarMass: '220.8 g/mol' },
  'port-updater':    { formula: 'PtUp₂',  compoundName: 'PORTUPDITE',     compoundType: 'Inorganic',  bondType: 'Ionic',        molarMass: '182.5 g/mol' },
  'musicbrainz-local': { formula: 'MbLc', compoundName: 'MB-LOCALITE',    compoundType: 'Polymer',    bondType: 'Van der Waals',molarMass: '198.3 g/mol' },
  bazarr:            { formula: 'BzAr',   compoundName: 'BAZARRITE',      compoundType: 'Organic',    bondType: 'Covalent',     molarMass: '145.6 g/mol' },
};

// Molecule-flavored status tiers — same logic, chemistry labels.
export const getMoleculeStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['BONDED', 'REACTING', 'UNSTABLE', 'DISSOCIATED'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
