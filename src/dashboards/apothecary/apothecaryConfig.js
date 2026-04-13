export const APOTHECARY_LABELS = {
  ALKALI:     'Elixirs',
  ALKALINE:   'Tinctures',
  TRANSITION: 'Decoctions',
  HALOGEN:    'Salves',
  NOBLE:      'Essences',
  LANTHANIDE: 'Tonics',
  POST:       'Poultices',
  METALLOID:  'Balms',
  NONMETAL:   'Infusions',
  ACTINIDE:   'Distillates',
  PNICTOGEN:  'Philters',
  CHALCOGEN:  'Syrups',
};

export const APOTHECARY_OVERLAY = {
  plex:                { remedy: 'Panacea Prime',      ingredient: 'Dragon Root',      potency: 'V',   shelf: 'A' },
  overseerr:           { remedy: 'Petition Draught',   ingredient: 'Wishbone Dust',    potency: 'III', shelf: 'A' },
  tautulli:            { remedy: 'Scrying Tonic',      ingredient: 'Crystal Dew',      potency: 'IV',  shelf: 'A' },
  radarr:              { remedy: 'Film Philter',       ingredient: 'Silver Nitrate',   potency: 'IV',  shelf: 'B' },
  sonarr:              { remedy: 'Series Serum',       ingredient: 'Cathode Sap',      potency: 'IV',  shelf: 'B' },
  lidarr:              { remedy: 'Sound Salve',        ingredient: 'Resonance Bark',   potency: 'III', shelf: 'B' },
  tunarr:              { remedy: 'Channel Cordial',    ingredient: 'Ether Bloom',      potency: 'II',  shelf: 'B' },
  qbittorrent:         { remedy: 'Torrent Extract',    ingredient: 'Storm Lichen',     potency: 'V',   shelf: 'C' },
  sabnzbd:             { remedy: 'Binary Balsam',      ingredient: 'Bit Moss',         potency: 'IV',  shelf: 'C' },
  prowlarr:            { remedy: 'Index Infusion',     ingredient: 'Spider Silk',      potency: 'III', shelf: 'B' },
  cloudflared:         { remedy: 'Tunnel Tincture',    ingredient: 'Cave Crystal',     potency: 'IV',  shelf: 'D' },
  notifiarr:           { remedy: 'Alert Ampoule',      ingredient: 'Bell Petal',       potency: 'II',  shelf: 'D' },
  flaresolverr:        { remedy: 'Dissolving Drop',    ingredient: 'Acid Bloom',       potency: 'III', shelf: 'D' },
  protonvpn:           { remedy: 'Cloak Essence',      ingredient: 'Shadow Fern',      potency: 'V',   shelf: 'C' },
  musicbrainz:         { remedy: 'Memory Mead',        ingredient: 'Archive Mold',     potency: 'III', shelf: 'B' },
  'port-updater':      { remedy: 'Port Potion',        ingredient: 'Tide Salt',        potency: 'II',  shelf: 'C' },
  'musicbrainz-local': { remedy: 'Local Liniment',     ingredient: 'Home Herb',        potency: 'II',  shelf: 'B' },
  bazarr:              { remedy: 'Subtitle Syrup',     ingredient: 'Ink Berry',        potency: 'III', shelf: 'B' },
  'tautulli-bridge':   { remedy: 'Voice Vapour',       ingredient: 'Echo Moss',        potency: 'II',  shelf: 'D' },
};

export const getApothecaryStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['DORMANT', 'BREWING', 'VOLATILE', 'TOXIC'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
