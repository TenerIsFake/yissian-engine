// ─────────────────────────────────────────────
// NEURAL NETWORK DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → cyberpunk network node type labels.

export const NEURAL_LABELS = {
  LANTHANIDE: 'Core Node',
  ACTINIDE:   'Relay Node',
  TRANSITION: 'Mesh Node',
  NOBLE:      'Sentinel Node',
  CHALCOGEN:  'Bridge Node',
  METALLOID:  'Pulse Node',
  NONMETAL:   'Ghost Node',
  ALKALI:     'Hot Node',
  ALKALINE:   'Buffer Node',
  HALOGEN:    'Edge Node',
  POST:       'Shadow Node',
  PNICTOGEN:  'Dim Node',
};

// Neural network metadata overlay — maps service id → neural display values.
export const NEURAL_OVERLAY = {
  plex:              { nodeId: '0x4C41', nodeName: 'PLEX-PRIME',      nodeClass: 'Media Streamer',   signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  overseerr:         { nodeId: '0x4F56', nodeName: 'OVERSEER-NET',    nodeClass: 'Request Broker',   signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  tautulli:          { nodeId: '0x5441', nodeName: 'TAU-OBSERVER',    nodeClass: 'Analytics Node',   signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  radarr:            { nodeId: '0x5244', nodeName: 'RADARR-NODE',     nodeClass: 'Film Indexer',     signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  sonarr:            { nodeId: '0x534E', nodeName: 'SONARR-NODE',     nodeClass: 'Series Indexer',   signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  lidarr:            { nodeId: '0x4C49', nodeName: 'LIDARR-NODE',     nodeClass: 'Audio Indexer',    signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  tunarr:            { nodeId: '0x5455', nodeName: 'TUNARR-RELAY',    nodeClass: 'Channel Router',   signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  qbittorrent:       { nodeId: '0x5142', nodeName: 'QBIT-TORRENT',    nodeClass: 'P2P Mesh Node',    signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  sabnzbd:           { nodeId: '0x5341', nodeName: 'SAB-DOWNLINK',    nodeClass: 'Usenet Receiver',  signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  prowlarr:          { nodeId: '0x5052', nodeName: 'PROWLARR-IDX',    nodeClass: 'Index Aggregator', signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  cloudflared:       { nodeId: '0x4346', nodeName: 'CLOUD-GATE',      nodeClass: 'Tunnel Endpoint',  signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  notifiarr:         { nodeId: '0x4E54', nodeName: 'NOTIF-BEACON',    nodeClass: 'Alert Dispatcher', signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  flaresolverr:      { nodeId: '0x464C', nodeName: 'FLARE-SOLVER',    nodeClass: 'Bypass Processor', signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  protonvpn:         { nodeId: '0x5650', nodeName: 'PROTON-SHIELD',   nodeClass: 'Crypto Gateway',   signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  musicbrainz:       { nodeId: '0x4D42', nodeName: 'MUSIC-BRAIN',     nodeClass: 'Tag Resolution',   signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  'port-updater':    { nodeId: '0x5055', nodeName: 'PORT-UPDATER',    nodeClass: 'Port Sync Agent',  signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  'musicbrainz-local': { nodeId: '0x4D4C', nodeName: 'MB-LOCAL-DB',  nodeClass: 'Local Cache Node', signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
  bazarr:            { nodeId: '0x425A', nodeName: 'BAZARR-SUB',      nodeClass: 'Subtitle Node',    signalStr: 'SIGNAL_STR',   packetRate: 'PKT_RATE' },
};

// Neural-flavored status tiers — same logic, cyberpunk labels.
export const getNeuralStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const neuralLabels = ['IDLE', 'TRANSMITTING', 'OVERLOADED', 'DARK_NODE'];
  return { ...base, label: neuralLabels[base.tier] ?? base.label };
};
