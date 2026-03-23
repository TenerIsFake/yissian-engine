// ─────────────────────────────────────────────
// NOIR DASHBOARD — Configuration
// ─────────────────────────────────────────────
// Maps chemistry category keys → detective bureau rank labels.

export const NOIR_LABELS = {
  LANTHANIDE: 'Senior Detective',
  ACTINIDE:   'Heavy Muscle',
  TRANSITION: 'Beat Cop',
  NOBLE:      'Police Chief',
  CHALCOGEN:  'Harbor Rat',
  METALLOID:  'Fixer',
  NONMETAL:   'Street Informant',
  ALKALI:     'Hothead',
  ALKALINE:   'By-the-Book',
  HALOGEN:    'Acid Tongue',
  POST:       'Washed-Up Detective',
  PNICTOGEN:  'Shadowy Contact',
};

// Noir metadata overlay — maps service id → case/alias display values.
export const NOIR_OVERLAY = {
  plex:              { alias: 'THE PROJECTIONIST', caseNum: 'CASE-4401', bureau: 'Entertainment Div.',  specialty: 'Media Distribution',    rank: 'Director'       },
  overseerr:         { alias: 'THE OVERSEER',      caseNum: 'CASE-4402', bureau: 'Request Bureau',      specialty: 'Asset Acquisition',     rank: 'Chief Inspector' },
  tautulli:          { alias: 'THE WATCHER',       caseNum: 'CASE-4403', bureau: 'Surveillance Dept.',  specialty: 'Analytics & Intel',     rank: 'Inspector'      },
  radarr:            { alias: 'RADAR MAN',         caseNum: 'CASE-4404', bureau: 'Film Division',       specialty: 'Acquisition Detail',    rank: 'Detective'      },
  sonarr:            { alias: 'SOUND MAN',         caseNum: 'CASE-4405', bureau: 'Series Division',     specialty: 'Surveillance',          rank: 'Detective'      },
  lidarr:            { alias: 'THE TUNESMITH',     caseNum: 'CASE-4406', bureau: 'Music Division',      specialty: 'Audio Evidence',        rank: 'Specialist'     },
  tunarr:            { alias: 'BROADCASTER',       caseNum: 'CASE-4407', bureau: 'Broadcast Unit',      specialty: 'Channel Operations',    rank: 'Operator'       },
  qbittorrent:       { alias: 'THE DOWNLOADER',    caseNum: 'CASE-4408', bureau: 'P2P Division',        specialty: 'Dark Transfer Ops',     rank: 'Agent'          },
  sabnzbd:           { alias: 'THE NEWSHAND',      caseNum: 'CASE-4409', bureau: 'Usenet Bureau',       specialty: 'News Feed Access',      rank: 'Operative'      },
  prowlarr:          { alias: 'THE PROWLER',       caseNum: 'CASE-4410', bureau: 'Index Division',      specialty: 'Information Brokerage', rank: 'Informant'      },
  cloudflared:       { alias: 'TUNNEL RAT',        caseNum: 'CASE-4411', bureau: 'Infrastructure Div.', specialty: 'Covert Tunneling',      rank: 'Engineer'       },
  notifiarr:         { alias: 'THE TIPSTER',       caseNum: 'CASE-4412', bureau: 'Intelligence Desk',   specialty: 'Notification Ops',      rank: 'Tipster'        },
  flaresolverr:      { alias: 'BYPASS KID',        caseNum: 'CASE-4413', bureau: 'Counter-CAPTCHA Unit',specialty: 'Evasion Tactics',       rank: 'Specialist'     },
  protonvpn:         { alias: 'THE GHOST',         caseNum: 'CASE-4414', bureau: 'VPN Division',        specialty: 'Identity Cloaking',     rank: 'Field Agent'    },
  musicbrainz:       { alias: 'THE ARCHIVIST',     caseNum: 'CASE-4415', bureau: 'Records Division',    specialty: 'Tag Analysis',          rank: 'Analyst'        },
  'port-updater':    { alias: 'PORT HAND',         caseNum: 'CASE-4416', bureau: 'Network Division',    specialty: 'Port Management',       rank: 'Technician'     },
  'musicbrainz-local': { alias: 'LOCAL FIXER',     caseNum: 'CASE-4417', bureau: 'Local Branch',        specialty: 'Local Records Cache',   rank: 'Clerk'          },
  bazarr:            { alias: 'SUBTITLE MAN',      caseNum: 'CASE-4418', bureau: 'Translation Bureau',  specialty: 'Subtitle Acquisition',  rank: 'Linguist'       },
};

// Noir-flavored status tiers — same logic, operative status labels.
export const getNoirStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['ACTIVE', 'TAILING', 'COMPROMISED', 'GONE_DARK'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
