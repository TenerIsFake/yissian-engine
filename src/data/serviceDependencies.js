// ─────────────────────────────────────────────
// SERVICE DEPENDENCY GRAPH
// Encodes the homelab service dependency DAG.
// Used by spatial grids to render connection lines
// between dependent services.
//
// Each edge: [upstream, downstream]
// "upstream" must be running for "downstream" to work.
// ─────────────────────────────────────────────

export const DEPENDENCY_EDGES = [
  // VPN chain — Gluetun is the critical gateway
  ['protonvpn',      'qbittorrent'],    // network_mode: service:gluetun
  ['protonvpn',      'port-updater'],   // reads /tmp/gluetun/forwarded_port

  // Download clients → library managers
  ['qbittorrent',    'radarr'],         // download client
  ['qbittorrent',    'sonarr'],         // download client
  ['qbittorrent',    'lidarr'],         // download client
  ['sabnzbd',        'sonarr'],         // usenet download client

  // Indexer → download management
  ['prowlarr',       'radarr'],         // indexer source
  ['prowlarr',       'sonarr'],         // indexer source
  ['prowlarr',       'lidarr'],         // indexer source

  // Media flow → Plex
  ['radarr',         'plex'],           // movie library
  ['sonarr',         'plex'],           // TV library
  ['lidarr',         'plex'],           // music library

  // Plex ecosystem
  ['plex',           'tautulli'],       // analytics source
  ['plex',           'tautulli-bridge'],// webhook source
  ['plex',           'overseerr'],      // media source for requests

  // Backend → frontend
  ['flask-backend',  'homepage'],       // API proxy
  ['socket-proxy',   'homepage'],       // Docker status API

  // Infrastructure
  ['cloudflared',    'homepage'],       // external access tunnel
  ['cloudflared',    'snappymail'],     // email ingest via CF Worker → tunnel → SRV-2
  ['flaresolverr',   'prowlarr'],       // Cloudflare bypass for indexers
];

/**
 * Build an adjacency map from the edges list.
 * Returns { serviceId: { upstream: [...], downstream: [...] } }
 */
export function buildAdjacencyMap() {
  const map = {};
  const ensure = (id) => {
    if (!map[id]) map[id] = { upstream: [], downstream: [] };
  };
  for (const [up, down] of DEPENDENCY_EDGES) {
    ensure(up);
    ensure(down);
    map[up].downstream.push(down);
    map[down].upstream.push(up);
  }
  return map;
}

/**
 * Get all services that would be affected if `serviceId` goes down.
 * Returns a Set of downstream service IDs (transitive).
 */
export function getCascadeImpact(serviceId) {
  const adj = buildAdjacencyMap();
  const visited = new Set();
  const queue = [serviceId];
  while (queue.length) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    const node = adj[current];
    if (node) {
      for (const down of node.downstream) {
        queue.push(down);
      }
    }
  }
  visited.delete(serviceId); // don't include self
  return visited;
}

/**
 * Get edges relevant to a set of service IDs (for rendering connection lines).
 * Returns array of [upstream, downstream] pairs where both are in the set.
 */
export function getVisibleEdges(serviceIds) {
  const idSet = new Set(serviceIds);
  return DEPENDENCY_EDGES.filter(([up, down]) => idSet.has(up) && idSet.has(down));
}
