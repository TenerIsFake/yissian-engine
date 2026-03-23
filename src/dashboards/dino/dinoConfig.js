// ─────────────────────────────────────────────
// DINO DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → dinosaur clade labels.

export const DINO_LABELS = {
  LANTHANIDE: 'Ancient Lineage',
  ACTINIDE:   'Apex Predator',
  TRANSITION: 'Pack Hunter',
  NOBLE:      'Dominant Clade',
  CHALCOGEN:  'Coastal Scavenger',
  METALLOID:  'Armored Species',
  NONMETAL:   'Herd Species',
  ALKALI:     'Fast Runner',
  ALKALINE:   'Tank Body',
  HALOGEN:    'Aerial Hunter',
  POST:       'Late Survivor',
  PNICTOGEN:  'Burrowing Species',
};

// Dino metadata overlay — maps service id → species display values.
export const DINO_OVERLAY = {
  plex:              { species: 'Plexosaurus Rex',    clade: 'Theropoda',        epoch: 'Cretaceous',      region: 'North America', cladeAbbr: 'THRP' },
  overseerr:         { species: 'Overseeroptor',      clade: 'Dromaeosauridae',  epoch: 'Late Cretaceous', region: 'Asia',          cladeAbbr: 'DRMS' },
  tautulli:          { species: 'Tautullidon',        clade: 'Ornithopoda',      epoch: 'Jurassic',        region: 'Europe',        cladeAbbr: 'RNTH' },
  radarr:            { species: 'Radarrosaurus',      clade: 'Sauropoda',        epoch: 'Jurassic',        region: 'Africa',        cladeAbbr: 'SRPD' },
  sonarr:            { species: 'Sonarroceratops',    clade: 'Ceratopsia',       epoch: 'Cretaceous',      region: 'Asia',          cladeAbbr: 'CRTP' },
  lidarr:            { species: 'Lidarridactyl',      clade: 'Pterosauria',      epoch: 'Triassic',        region: 'Europe',        cladeAbbr: 'PTRS' },
  tunarr:            { species: 'Tunarrosaur',        clade: 'Mosasauridae',     epoch: 'Late Cretaceous', region: 'Sea',           cladeAbbr: 'MSSD' },
  qbittorrent:       { species: 'Qbittor',            clade: 'Ankylosauria',     epoch: 'Cretaceous',      region: 'North America', cladeAbbr: 'ANKL' },
  sabnzbd:           { species: 'Sabnzdon',           clade: 'Stegosauria',      epoch: 'Jurassic',        region: 'North America', cladeAbbr: 'STGR' },
  prowlarr:          { species: 'Prowlarrsaurus',     clade: 'Theropoda',        epoch: 'Triassic',        region: 'South America', cladeAbbr: 'THRP' },
  cloudflared:       { species: 'Cloudflaridon',      clade: 'Pachycephalosaur.',epoch: 'Cretaceous',      region: 'Asia',          cladeAbbr: 'PCHP' },
  notifiarr:         { species: 'Notifiarrex',        clade: 'Spinosauridae',    epoch: 'Cretaceous',      region: 'Africa',        cladeAbbr: 'SPNS' },
  flaresolverr:      { species: 'Flaresolvasaurus',   clade: 'Abelisauridae',    epoch: 'Cretaceous',      region: 'India',         cladeAbbr: 'ABLS' },
  protonvpn:         { species: 'Protonvpnus',        clade: 'Troodontidae',     epoch: 'Late Cretaceous', region: 'Asia',          cladeAbbr: 'TRDN' },
  musicbrainz:       { species: 'Musicbrainzion',     clade: 'Hadrosauridae',    epoch: 'Cretaceous',      region: 'North America', cladeAbbr: 'HDRS' },
  'port-updater':    { species: 'Portupdatorus',      clade: 'Oviraptoridae',    epoch: 'Late Cretaceous', region: 'Asia',          cladeAbbr: 'OVRP' },
  'musicbrainz-local': { species: 'MB-Localdon',      clade: 'Compsognathidae',  epoch: 'Jurassic',        region: 'Europe',        cladeAbbr: 'CMPG' },
  bazarr:            { species: 'Bazarrosaurus',      clade: 'Diplodocidae',     epoch: 'Jurassic',        region: 'North America', cladeAbbr: 'DPLD' },
};

// Dino-flavored status tiers — same logic, prehistoric activity labels.
export const getDinoStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['ACTIVE', 'DORMANT', 'MIGRATING', 'EXTINCT'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
