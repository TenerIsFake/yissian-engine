// SCHLENK — service → glassware shape mapping
// Each service ID maps to a shape ID from glasswareRegistry.js.
// Services not mapped here fall back to DEFAULT_SHAPE (rbf-1neck).
// All 20 bots use BOT_GLASSWARE uniformly (nmr-tube in the rack).

export const DEFAULT_SHAPE = 'rbf-1neck';
export const BOT_GLASSWARE = 'nmr-tube';

export const GLASSWARE_BY_SERVICE = {
  // ─── MEDIA zone (Lanthanides) ───
  plex:               'rbf-3neck',        // hero — 3-neck reaction flask
  overseerr:          'rbf-2neck',
  tautulli:           'rbf-2neck',
  radarr:             'rbf-2neck',
  sonarr:             'long-schlenk',     // long-neck sealed
  lidarr:             'pear-flask',
  tunarr:             'pear-flask',
  bazarr:             'dean-stark',       // subtitle separator
  prowlarr:           'long-schlenk',     // sealed long-neck
  qbittorrent:        'schlenk-sidearm',
  sabnzbd:            'cold-trap',
  gluetun:            'schlenk-sidearm',  // VPN sealed under inert atmosphere
  cloudflared:        'fischer-porter',   // pressure-sealed tunnel
  notifiarr:          'hg-bubbler',       // event sink — messages bubble through
  flaresolverr:       'cold-trap',        // captures transient challenges
  'musicbrainz-applet': 'rbf-2neck',

  // ─── LIBRARY zone ───
  audiobookshelf:     'rbf-3neck',        // 3 necks = audio streaming + library + UI
  kavita:             'rbf-2neck',        // reader + admin
  snappymail:         'pear-flask',       // mail digest

  // ─── PIPELINE zone ───
  // (downloaders already mapped above; this zone pulls them via layout)

  // ─── INFRA zone (Actinides) ───
  prometheus:         'dimroth',          // coiled metrics capture
  grafana:            'allihn',           // bulb-train dashboard
  cadvisor:           'liebig',           // straight-tube container metrics
  glances:            'liebig',
  'uptime-kuma':      'allihn',
  'cold-finger':      'cold-finger',
  'diskhealth-bridge': 'cold-finger',
  'restic-sidecar':   'cold-trap',        // snapshot capture
  'docker-monitor':   'fischer-porter',
  'socket-proxy':     'fischer-porter',
  couchdb:            'kjeldahl',         // long-running digestion store
  syncthing:          'kugelrohr',        // bulb-to-bulb sync
  watchtower:         'sublimation',      // passive accumulation
  ntfy:               'hg-bubbler',       // overpressure bubbler
  'braintree-nginx':  'rbf-1neck',

  // ─── TOOLS zone ───
  'port-updater':     'buchner-filter',
  triggercmd:         'addition-funnel',
  'obsidian-remote':  'j-young',          // sealed knowledge vault
  'claude-terminal':  'j-young',          // sealed terminal
  'clsh':             'j-young',          // sealed terminal
  lottery:            'separatory',
  'tautulli-bridge':  'addition-funnel',
  bhyve:              'addition-funnel',  // injects schedule
  kometa:             'sublimation',      // metadata refinement
  'media-bot':        'rbf-2neck',
  'hue-bridge':       'pear-flask',       // small lighting control
  'lan-presence':     'buchner-filter',
  'home-assistant':   'rbf-3neck',        // multi-integration hub
  musicbrainz:        'soxhlet',          // continuous indexing extraction

  // Fallback for unmapped services: DEFAULT_SHAPE (rbf-1neck)
};

/**
 * Look up the glassware shape ID for a service.
 * Falls back to DEFAULT_SHAPE for unknowns.
 */
export function getServiceGlassware(serviceId) {
  return GLASSWARE_BY_SERVICE[serviceId] || DEFAULT_SHAPE;
}
