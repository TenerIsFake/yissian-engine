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
  bazarr:             'schlenk-sidearm',
  prowlarr:           'long-schlenk',     // sealed long-neck
  qbittorrent:        'schlenk-sidearm',
  sabnzbd:            'cold-trap',
  gluetun:            'schlenk-sidearm',  // VPN sealed under inert atmosphere
  cloudflared:        'allihn',
  notifiarr:          'allihn',
  flaresolverr:       'dimroth',
  'musicbrainz-applet': 'rbf-2neck',

  // ─── LIBRARY zone ───
  audiobookshelf:     'rbf-2neck',
  kavita:             'rbf-2neck',
  snappymail:         'rbf-1neck',

  // ─── PIPELINE zone ───
  // (downloaders already mapped above; this zone pulls them via layout)

  // ─── INFRA zone (Actinides) ───
  prometheus:         'dimroth',
  grafana:            'dimroth',
  cadvisor:           'liebig',
  glances:            'liebig',
  'uptime-kuma':      'allihn',
  'cold-finger':      'cold-finger',
  'diskhealth-bridge': 'cold-finger',
  'restic-sidecar':   'cold-finger',
  'docker-monitor':   'fischer-porter',
  'socket-proxy':     'fischer-porter',
  couchdb:            'fischer-porter',
  syncthing:          'kugelrohr',
  watchtower:         'rbf-1neck',
  ntfy:               'hg-bubbler',
  'braintree-nginx':  'rbf-1neck',

  // ─── TOOLS zone ───
  'port-updater':     'buchner-filter',
  triggercmd:         'addition-funnel',
  'obsidian-remote':  'addition-funnel',
  'claude-terminal':  'addition-funnel',
  'clsh':             'addition-funnel',
  lottery:            'separatory',
  'tautulli-bridge':  'addition-funnel',
  bhyve:              'addition-funnel',
  kometa:             'kjeldahl',         // long-neck digestion
  'media-bot':        'rbf-2neck',
  'hue-bridge':       'buchner-filter',
  'lan-presence':     'buchner-filter',
  'home-assistant':   'rbf-3neck',
  'musicbrainz':      'dimroth',

  // Fallback for unmapped services: DEFAULT_SHAPE (rbf-1neck)
};

/**
 * Look up the glassware shape ID for a service.
 * Falls back to DEFAULT_SHAPE for unknowns.
 */
export function getServiceGlassware(serviceId) {
  return GLASSWARE_BY_SERVICE[serviceId] || DEFAULT_SHAPE;
}
