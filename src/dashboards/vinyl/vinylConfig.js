// ─────────────────────────────────────────────
// VINYL DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → vinyl record genre labels.

export const VINYL_LABELS = {
  LANTHANIDE: "Collector's Pressing",
  ACTINIDE:   'Heavy Metal',
  TRANSITION: 'B-Side Cut',
  NOBLE:      'Original Pressing',
  CHALCOGEN:  'Live Recording',
  METALLOID:  'EP Single',
  NONMETAL:   'Spoken Word',
  ALKALI:     'Debut Album',
  ALKALINE:   'Studio Album',
  HALOGEN:    'Bootleg Copy',
  POST:       'Reissue',
  PNICTOGEN:  'White Label',
};

// Vinyl metadata overlay — maps service id → record display values.
export const VINYL_OVERLAY = {
  plex:              { catalogNum: 'PLX-001-A', artist: 'PLEX ENSEMBLE',       genre: 'Jazz Fusion',   rpm: '33\u2153', label: 'StreamWorks'     },
  overseerr:         { catalogNum: 'OVR-200-B', artist: 'THE OVERSEERS',       genre: 'Soul',          rpm: '33\u2153', label: 'RequestRecords'  },
  tautulli:          { catalogNum: 'TAU-303-A', artist: 'TAUTULLI TRIO',       genre: 'Ambient',       rpm: '45',       label: 'StatRecords'     },
  radarr:            { catalogNum: 'RDR-400-B', artist: 'RADARR QUARTET',      genre: 'Electronic',    rpm: '33\u2153', label: 'FilmSounds'      },
  sonarr:            { catalogNum: 'SNR-501-A', artist: 'SONARR COLLECTIVE',   genre: 'Post-Rock',     rpm: '33\u2153', label: 'SeriesTunes'     },
  lidarr:            { catalogNum: 'LDR-600-B', artist: 'LIDARR DUO',          genre: 'Acoustic',      rpm: '45',       label: 'AudioHunt'       },
  tunarr:            { catalogNum: 'TNR-707-A', artist: 'TUNARR SESSIONS',     genre: 'Broadcast Jazz',rpm: '78',       label: 'ChannelSounds'   },
  qbittorrent:       { catalogNum: 'QBT-800-B', artist: 'THE P2P COLLECTIVE',  genre: 'Industrial',    rpm: '33\u2153', label: 'TorrentTunes'    },
  sabnzbd:           { catalogNum: 'SAB-900-A', artist: 'SABNZBD ORCHESTRA',   genre: 'Classical',     rpm: '33\u2153', label: 'UsenetClassics'  },
  prowlarr:          { catalogNum: 'PRL-100-B', artist: 'THE PROWLARR FIVE',   genre: 'Funk',          rpm: '45',       label: 'IndexSounds'     },
  cloudflared:       { catalogNum: 'CLD-110-A', artist: 'CLOUDFLARE BAND',     genre: 'Synthwave',     rpm: '33\u2153', label: 'TunnelTracks'    },
  notifiarr:         { catalogNum: 'NTF-120-B', artist: 'THE NOTIFIERS',       genre: 'Punk',          rpm: '45',       label: 'AlertSounds'     },
  flaresolverr:      { catalogNum: 'FLS-130-A', artist: 'FLARESOLVER',         genre: 'Noise Rock',    rpm: '45',       label: 'BypassBeats'     },
  protonvpn:         { catalogNum: 'VPN-140-B', artist: 'PROTON SHIELD',       genre: 'Dark Ambient',  rpm: '33\u2153', label: 'GhostRecords'    },
  musicbrainz:       { catalogNum: 'MBZ-150-A', artist: 'MUSICBRAINZ ARCHIVE', genre: 'World Music',   rpm: '33\u2153', label: 'BrainVault'      },
  'port-updater':    { catalogNum: 'PTU-160-B', artist: 'PORT UPDATER BAND',   genre: 'Minimalist',    rpm: '78',       label: 'SyncSounds'      },
  'musicbrainz-local': { catalogNum: 'MBL-170-A', artist: 'MB LOCAL SESSIONS', genre: 'Folk',          rpm: '45',       label: 'LocalGrooves'    },
  bazarr:            { catalogNum: 'BZR-180-B', artist: 'BAZARR STRINGS',      genre: 'World Music',   rpm: '33\u2153', label: 'SubtitleSounds'  },
};

// Vinyl-flavored status tiers — same logic, playback labels.
export const getVinylStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['SPINNING', 'CUED', 'WARPED', 'SCRATCHED'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
