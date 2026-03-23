// ─────────────────────────────────────────────
// WEATHER DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → meteorological zone labels.

export const WEATHER_LABELS = {
  LANTHANIDE: 'Rare Weather Event',
  ACTINIDE:   'Fallout Zone',
  TRANSITION: 'Transition Zone',
  NOBLE:      'Stable Air Mass',
  CHALCOGEN:  'Volcanic Ash Cloud',
  METALLOID:  'Metallic Dust Storm',
  NONMETAL:   'Clear Air Turbulence',
  ALKALI:     'Alkali Dust Devil',
  ALKALINE:   'Benign Front',
  HALOGEN:    'Acid Rain Zone',
  POST:       'Post-Frontal Zone',
  PNICTOGEN:  'Fog Bank',
};

// Weather metadata overlay — maps service id → station/phenomena display values.
export const WEATHER_OVERLAY = {
  plex:              { stationId: 'KPLX', phenomena: 'CLEAR STREAM',    weatherType: 'Sunshine',         weatherSymbol: '☀', barometric: '1013 hPa', windSpeed: '8 kt'  },
  overseerr:         { stationId: 'KOVR', phenomena: 'OVERCAST',        weatherType: 'Stratus',           weatherSymbol: '⛅', barometric: '998 hPa',  windSpeed: '12 kt' },
  tautulli:          { stationId: 'KTAU', phenomena: 'FOG BANK',        weatherType: 'Fog',               weatherSymbol: '☁', barometric: '1005 hPa', windSpeed: '3 kt'  },
  radarr:            { stationId: 'KRDR', phenomena: 'RADAR PULSE',     weatherType: 'Squall Line',       weatherSymbol: '⛈', barometric: '990 hPa',  windSpeed: '35 kt' },
  sonarr:            { stationId: 'KSNR', phenomena: 'PRESSURE WAVE',   weatherType: 'Acoustic Front',    weatherSymbol: '≋', barometric: '1008 hPa', windSpeed: '20 kt' },
  lidarr:            { stationId: 'KLDR', phenomena: 'CRYSTAL SHOWER',  weatherType: 'Light Shower',      weatherSymbol: '❄', barometric: '1010 hPa', windSpeed: '10 kt' },
  tunarr:            { stationId: 'KTNR', phenomena: 'SIGNAL WIND',     weatherType: 'Broadcast Storm',   weatherSymbol: '⚡', barometric: '1002 hPa', windSpeed: '15 kt' },
  qbittorrent:       { stationId: 'KQBT', phenomena: 'TORRENT RAIN',    weatherType: 'Heavy Rain',        weatherSymbol: '⛈', barometric: '985 hPa',  windSpeed: '40 kt' },
  sabnzbd:           { stationId: 'KSAB', phenomena: 'DOWN-BURST',      weatherType: 'Downburst',         weatherSymbol: '☁', barometric: '978 hPa',  windSpeed: '55 kt' },
  prowlarr:          { stationId: 'KPRL', phenomena: 'HUNT SQUALL',     weatherType: 'Squall',            weatherSymbol: '⚡', barometric: '994 hPa',  windSpeed: '28 kt' },
  cloudflared:       { stationId: 'KCLD', phenomena: 'CLOUD BANK',      weatherType: 'Cumulus',           weatherSymbol: '☁', barometric: '1015 hPa', windSpeed: '6 kt'  },
  notifiarr:         { stationId: 'KNTF', phenomena: 'ALERT GALE',      weatherType: 'Gale Warning',      weatherSymbol: '⚡', barometric: '968 hPa',  windSpeed: '62 kt' },
  flaresolverr:      { stationId: 'KFLS', phenomena: 'SOLAR FLARE',     weatherType: 'Geomagnetic Storm', weatherSymbol: '☀', barometric: '???hPa',   windSpeed: '???kt' },
  protonvpn:         { stationId: 'KVPN', phenomena: 'ENCRYPTED FOG',   weatherType: 'Dense Fog',         weatherSymbol: '☁', barometric: '1012 hPa', windSpeed: '2 kt'  },
  musicbrainz:       { stationId: 'KMBZ', phenomena: 'HARMONIC WAVE',   weatherType: 'Acoustic Front',    weatherSymbol: '≋', barometric: '1009 hPa', windSpeed: '11 kt' },
  'port-updater':    { stationId: 'KPTU', phenomena: 'PORT GUST',       weatherType: 'Gusty Wind',        weatherSymbol: '⚡', barometric: '1000 hPa', windSpeed: '30 kt' },
  'musicbrainz-local': { stationId: 'KMBL', phenomena: 'LOCAL MIST',    weatherType: 'Mist',              weatherSymbol: '☁', barometric: '1011 hPa', windSpeed: '4 kt'  },
  bazarr:            { stationId: 'KBZR', phenomena: 'SUBTITLE HAZE',   weatherType: 'Haze',              weatherSymbol: '☁', barometric: '1007 hPa', windSpeed: '7 kt'  },
};

// Weather-flavored status tiers — same logic, forecast labels.
export const getWeatherStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['CLEAR', 'ADVISORY', 'WARNING', 'BLACKOUT'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
