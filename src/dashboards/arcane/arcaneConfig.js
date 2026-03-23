// ─────────────────────────────────────────────
// ARCANE GRIMOIRE DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → mystical tome type labels.

export const ARCANE_LABELS = {
  LANTHANIDE: 'Grand Grimoire',
  ACTINIDE:   'Dark Scroll',
  TRANSITION: 'Battle Tome',
  NOBLE:      'Arcane Seal',
  CHALCOGEN:  'Nature Codex',
  METALLOID:  'Sigil Stone',
  NONMETAL:   'Wind Script',
  ALKALI:     'Fire Rune',
  ALKALINE:   'Earth Rune',
  HALOGEN:    'Void Glyph',
  POST:       'Dust Artifact',
  PNICTOGEN:  'Shadow Scroll',
};

// Arcane metadata overlay — maps service id → mystical display values.
// runeSymbol: Elder Futhark rune character for the card center.
export const ARCANE_OVERLAY = {
  plex:              { runeSymbol: 'ᛚ', tomeTitle: 'PLEX_CODEX',       tomeType: 'Grimoire', bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  overseerr:         { runeSymbol: 'ᚷ', tomeTitle: 'OVERSEER_TOME',    tomeType: 'Codex',    bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  tautulli:          { runeSymbol: 'ᚾ', tomeTitle: 'TAUTULLI_SCROLL',  tomeType: 'Scroll',   bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  radarr:            { runeSymbol: 'ᚱ', tomeTitle: 'RADARR_GRIMOIRE',  tomeType: 'Grimoire', bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  sonarr:            { runeSymbol: 'ᛋ', tomeTitle: 'SONARR_CODEX',     tomeType: 'Codex',    bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  lidarr:            { runeSymbol: 'ᛏ', tomeTitle: 'LIDARR_SCROLL',    tomeType: 'Scroll',   bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  tunarr:            { runeSymbol: 'ᛜ', tomeTitle: 'TUNARR_ARTIFACT',  tomeType: 'Artifact', bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  qbittorrent:       { runeSymbol: 'ᛈ', tomeTitle: 'QBIT_GRIMOIRE',    tomeType: 'Grimoire', bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  sabnzbd:           { runeSymbol: 'ᚠ', tomeTitle: 'SAB_CODEX',        tomeType: 'Codex',    bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  prowlarr:          { runeSymbol: 'ᚨ', tomeTitle: 'PROWLARR_SCROLL',  tomeType: 'Scroll',   bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  cloudflared:       { runeSymbol: 'ᛁ', tomeTitle: 'CLOUDGATE_SEAL',   tomeType: 'Artifact', bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  notifiarr:         { runeSymbol: 'ᛉ', tomeTitle: 'NOTIF_RUNE',       tomeType: 'Scroll',   bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  flaresolverr:      { runeSymbol: 'ᛗ', tomeTitle: 'FLARE_ARTIFACT',   tomeType: 'Artifact', bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  protonvpn:         { runeSymbol: 'ᚢ', tomeTitle: 'PROTON_WARD',      tomeType: 'Codex',    bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  musicbrainz:       { runeSymbol: 'ᛒ', tomeTitle: 'MUSIC_GRIMOIRE',   tomeType: 'Grimoire', bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  'port-updater':    { runeSymbol: 'ᛞ', tomeTitle: 'PORT_SCROLL',      tomeType: 'Scroll',   bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  'musicbrainz-local': { runeSymbol: 'ᚦ', tomeTitle: 'MB_LOCAL_TOME', tomeType: 'Codex',    bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
  bazarr:            { runeSymbol: 'ᚹ', tomeTitle: 'BAZARR_CODEX',     tomeType: 'Codex',    bindingPower: 'BINDING_PWR', accessTier: 'ACCESS_TIER' },
};

// Arcane-flavored status tiers — same logic, mystical labels.
export const getArcaneStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const arcaneLabels = ['AWAKENED', 'DORMANT', 'CORRUPTED', 'SEALED'];
  return { ...base, label: arcaneLabels[base.tier] ?? base.label };
};
