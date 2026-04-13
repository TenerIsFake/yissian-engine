// ─────────────────────────────────────────────
// NH-63 — Network Topology: Static graph definition
// Derived from vault/00_Meta/ServiceDependencyGraph.md
// Uses fixed grid positions for deterministic layout
// ─────────────────────────────────────────────

export const TOPOLOGY_NODES = [
  // ── SRV-1 (left cluster) ──────────────────
  // VPN chain
  { id: 'gluetun',        label: 'Gluetun',        server: 'srv1', group: 'vpn',        x: 80,  y: 60 },
  { id: 'qbittorrent',    label: 'qBittorrent',    server: 'srv1', group: 'download',   x: 80,  y: 140 },
  { id: 'port-updater',   label: 'Port Updater',   server: 'srv1', group: 'vpn',        x: 20,  y: 100 },
  // Download pipeline
  { id: 'sabnzbd',        label: 'SABnzbd',        server: 'srv1', group: 'download',   x: 180, y: 140 },
  { id: 'prowlarr',       label: 'Prowlarr',       server: 'srv1', group: 'indexer',    x: 130, y: 60 },
  { id: 'radarr',         label: 'Radarr',         server: 'srv1', group: 'media',      x: 80,  y: 220 },
  { id: 'sonarr',         label: 'Sonarr',         server: 'srv1', group: 'media',      x: 155, y: 220 },
  { id: 'lidarr',         label: 'Lidarr',         server: 'srv1', group: 'media',      x: 230, y: 220 },
  { id: 'bazarr',         label: 'Bazarr',         server: 'srv1', group: 'media',      x: 230, y: 160 },
  // Dashboard chain
  { id: 'flask-backend',  label: 'Flask API',      server: 'srv1', group: 'dashboard',  x: 130, y: 300 },
  { id: 'socket-proxy',   label: 'Socket Proxy',   server: 'srv1', group: 'dashboard',  x: 50,  y: 300 },
  { id: 'homepage',       label: 'Homepage',       server: 'srv1', group: 'dashboard',  x: 90,  y: 360 },
  // Media chain
  { id: 'plex',           label: 'Plex',           server: 'srv1', group: 'media',      x: 230, y: 300 },
  { id: 'tautulli',       label: 'Tautulli',       server: 'srv1', group: 'media',      x: 280, y: 260 },
  { id: 'tautulli-bridge',label: 'Tautulli Bridge',server: 'srv1', group: 'media',      x: 280, y: 340 },
  // Infrastructure
  { id: 'glances',        label: 'Glances',        server: 'srv1', group: 'infra',      x: 20,  y: 360 },
  { id: 'syncthing',      label: 'Syncthing',      server: 'srv1', group: 'infra',      x: 20,  y: 200 },
  { id: 'docker-monitor', label: 'Docker Monitor', server: 'srv1', group: 'dashboard',  x: 50,  y: 250 },

  // ── SRV-2 (right cluster) ─────────────────
  { id: 'ntfy',           label: 'ntfy',           server: 'srv2', group: 'infra',      x: 420, y: 60 },
  { id: 'uptime-kuma',    label: 'Uptime Kuma',    server: 'srv2', group: 'infra',      x: 420, y: 140 },
  { id: 'freshrss',       label: 'FreshRSS',       server: 'srv2', group: 'media',      x: 490, y: 140 },
  { id: 'musicbrainz',    label: 'MusicBrainz',    server: 'srv2', group: 'media',      x: 490, y: 220 },
  { id: 'overseerr',      label: 'Overseerr',      server: 'srv2', group: 'media',      x: 420, y: 220 },
  { id: 'tunarr',         label: 'Tunarr',         server: 'srv2', group: 'media',      x: 490, y: 60 },
  { id: 'obsidian',       label: 'Obsidian',       server: 'srv2', group: 'infra',      x: 420, y: 300 },
  { id: 'brain-tree-os',  label: 'Brain Tree',     server: 'srv2', group: 'infra',      x: 490, y: 300 },
];

export const TOPOLOGY_EDGES = [
  // VPN chain
  { from: 'gluetun',        to: 'qbittorrent',    type: 'network', label: 'network_mode' },
  { from: 'gluetun',        to: 'port-updater',   type: 'api',     label: 'forwarded_port' },
  // Download pipeline
  { from: 'qbittorrent',    to: 'radarr',         type: 'download' },
  { from: 'qbittorrent',    to: 'sonarr',         type: 'download' },
  { from: 'qbittorrent',    to: 'lidarr',         type: 'download' },
  { from: 'sabnzbd',        to: 'sonarr',         type: 'download' },
  { from: 'prowlarr',       to: 'radarr',         type: 'api',     label: 'indexer' },
  { from: 'prowlarr',       to: 'sonarr',         type: 'api',     label: 'indexer' },
  { from: 'prowlarr',       to: 'lidarr',         type: 'api',     label: 'indexer' },
  // Dashboard chain
  { from: 'flask-backend',  to: 'homepage',        type: 'api',     label: '/api/flask/*' },
  { from: 'socket-proxy',   to: 'homepage',        type: 'api',     label: 'Docker API' },
  { from: 'docker-monitor', to: 'homepage',        type: 'api',     label: '/api/docker/*' },
  // Media chain
  { from: 'plex',           to: 'tautulli-bridge', type: 'api',     label: 'webhook' },
  // Cross-machine
  { from: 'ntfy',           to: 'uptime-kuma',     type: 'api',     label: 'notifications' },
  { from: 'musicbrainz',    to: 'lidarr',          type: 'api',     label: 'metadata' },
  { from: 'freshrss',       to: 'flask-backend',   type: 'api',     label: 'GReader API' },
];

export const EDGE_COLORS = {
  network:  '#ef4444',  // red — network_mode coupling
  api:      '#06b6d4',  // cyan — API dependency
  download: '#22c55e',  // green — download pipeline
};

export const SERVER_LABELS = {
  srv1: 'SRV-1 (10.0.0.195)',
  srv2: 'SRV-2 (10.0.0.155)',
};
