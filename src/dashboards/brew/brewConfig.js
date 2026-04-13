export const BREW_LABELS = {
  ALKALI:     'Kettle',
  ALKALINE:   'Mash Tun',
  TRANSITION: 'Fermenter',
  HALOGEN:    'Hop Back',
  NOBLE:      'Cask',
  LANTHANIDE: 'Bottling',
  POST:       'Grain Silo',
  METALLOID:  'Yeast Bank',
  NONMETAL:   'Tasting Room',
  ACTINIDE:   'Cold Storage',
  PNICTOGEN:  'Tap Room',
  CHALCOGEN:  'Barrel Room',
};

export const BREW_OVERLAY = {
  plex:                { beer: 'Imperial Stout',    stage: 'Conditioning', abv: '9.5%', batch: '#001' },
  overseerr:           { beer: 'Session IPA',       stage: 'Fermenting',   abv: '4.2%', batch: '#002' },
  tautulli:            { beer: 'Amber Ale',         stage: 'Monitoring',   abv: '5.8%', batch: '#003' },
  radarr:              { beer: 'Double IPA',        stage: 'Dry Hopping',  abv: '8.0%', batch: '#004' },
  sonarr:              { beer: 'Pilsner',           stage: 'Lagering',     abv: '4.8%', batch: '#005' },
  lidarr:              { beer: 'Wheat Beer',        stage: 'Fermenting',   abv: '5.0%', batch: '#006' },
  tunarr:              { beer: 'Blonde Ale',        stage: 'Bottling',     abv: '4.5%', batch: '#007' },
  qbittorrent:         { beer: 'Barleywine',        stage: 'Aging',        abv: '11%',  batch: '#008' },
  sabnzbd:             { beer: 'Porter',            stage: 'Fermenting',   abv: '6.2%', batch: '#009' },
  prowlarr:            { beer: 'Pale Ale',          stage: 'Hopping',      abv: '5.5%', batch: '#010' },
  cloudflared:         { beer: 'Dark Lager',        stage: 'Conditioning', abv: '5.0%', batch: '#011' },
  notifiarr:           { beer: 'Kölsch',            stage: 'Ready',        abv: '4.8%', batch: '#012' },
  flaresolverr:        { beer: 'Sour Ale',          stage: 'Wild Ferm',    abv: '4.0%', batch: '#013' },
  protonvpn:           { beer: 'Belgian Tripel',    stage: 'Bottle Cond',  abv: '9.0%', batch: '#014' },
  musicbrainz:         { beer: 'Brown Ale',         stage: 'Maturing',     abv: '5.5%', batch: '#015' },
  'port-updater':      { beer: 'Mild',              stage: 'Ready',        abv: '3.5%', batch: '#016' },
  'musicbrainz-local': { beer: 'Bitter',            stage: 'Cask Cond',    abv: '4.0%', batch: '#017' },
  bazarr:              { beer: 'Saison',            stage: 'Fermenting',   abv: '6.5%', batch: '#018' },
  'tautulli-bridge':   { beer: 'Stout',             stage: 'Nitrogenating',abv: '5.0%', batch: '#019' },
};

export const getBrewStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['RESTING', 'FERMENTING', 'VIGOROUS', 'OVERFLOW'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
