// SCHLENK service positioning — maps each service to (x, y) in scene coords
// given its zone assignment. Uses grid-in-zone packing.

import { ZONES } from './zoneLayout.js';

// Service → zone key mapping (derived from element category + service type)
// Matches zoneConfigs/schlenk.js (deleted) and the broader spec §2.7 layout.
export const SERVICE_TO_ZONE = {
  // MEDIA (lanthanides + media core)
  plex:               'MEDIA',
  overseerr:          'MEDIA',
  tautulli:           'MEDIA',
  radarr:             'MEDIA',
  sonarr:             'MEDIA',
  lidarr:             'MEDIA',
  tunarr:             'MEDIA',
  qbittorrent:        'MEDIA',
  sabnzbd:            'MEDIA',
  prowlarr:           'MEDIA',
  cloudflared:        'MEDIA',
  notifiarr:          'MEDIA',
  flaresolverr:       'MEDIA',
  gluetun:            'MEDIA',
  'musicbrainz-applet': 'MEDIA',

  // LIBRARY
  audiobookshelf:     'LIBRARY',
  kavita:             'LIBRARY',
  snappymail:         'LIBRARY',
  bazarr:             'LIBRARY',

  // PIPELINE
  'port-updater':     'PIPELINE',
  'docker-monitor':   'PIPELINE',
  'socket-proxy':     'PIPELINE',

  // INFRA
  prometheus:         'INFRA',
  grafana:            'INFRA',
  cadvisor:           'INFRA',
  glances:            'INFRA',
  'uptime-kuma':      'INFRA',
  'diskhealth-bridge': 'INFRA',
  'restic-sidecar':   'INFRA',
  couchdb:            'INFRA',
  syncthing:          'INFRA',
  ntfy:               'INFRA',
  watchtower:         'INFRA',
  'braintree-nginx':  'INFRA',
  musicbrainz:        'INFRA',

  // TOOLS
  triggercmd:         'TOOLS',
  'obsidian-remote':  'TOOLS',
  'claude-terminal':  'TOOLS',
  clsh:               'TOOLS',
  lottery:            'TOOLS',
  'tautulli-bridge':  'TOOLS',
  bhyve:              'TOOLS',
  kometa:             'TOOLS',
  'media-bot':        'TOOLS',
  'hue-bridge':       'TOOLS',
  'lan-presence':     'TOOLS',
  'home-assistant':   'TOOLS',
  homeplanner:        'TOOLS',
  kiwix:              'LIBRARY',
};

/**
 * Compute (x,y) position for a service within its zone, using a simple grid.
 * @param {string} serviceId
 * @param {number} orderInZone — 0-based index of this service within its zone
 * @param {number} totalInZone — total services in this zone (for col count)
 * @returns {{ x: number, y: number, zone: string } | null}
 */
export function positionForService(serviceId, orderInZone, totalInZone) {
  const zoneKey = SERVICE_TO_ZONE[serviceId];
  if (!zoneKey) return null;
  const zone = ZONES[zoneKey];
  const cols = Math.ceil(Math.sqrt(totalInZone));
  const rows = Math.ceil(totalInZone / cols);
  const col = orderInZone % cols;
  const row = Math.floor(orderInZone / cols);
  const cellW = zone.w / cols;
  const cellH = zone.h / rows;
  return {
    x: zone.x + col * cellW + cellW / 2,
    y: zone.y + row * cellH + cellH / 2,
    zone: zoneKey,
  };
}

/** Group services by zone. Returns { zoneKey: [serviceId, ...] }. */
export function groupServicesByZone(serviceIds) {
  const out = {};
  for (const svc of serviceIds) {
    const z = SERVICE_TO_ZONE[svc] || 'MEDIA';
    (out[z] ||= []).push(svc);
  }
  return out;
}
