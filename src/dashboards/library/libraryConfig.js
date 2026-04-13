export const LIBRARY_LABELS = {
  ALKALI:     'Reference',
  ALKALINE:   'Fiction',
  TRANSITION: 'Non-Fiction',
  HALOGEN:    'Periodicals',
  NOBLE:      'Rare Books',
  LANTHANIDE: 'Archives',
  POST:       'Returns',
  METALLOID:  'Study Room',
  NONMETAL:   'Children',
  ACTINIDE:   'Basement',
  PNICTOGEN:  'New Arrivals',
  CHALCOGEN:  'Digital',
};

export const LIBRARY_OVERLAY = {
  plex:                { title: 'Encyclopedia',      section: 'Reference',  dewey: '000', status: 'Available' },
  overseerr:           { title: 'Request Form',      section: 'Circulation',dewey: '020', status: 'Processing' },
  tautulli:            { title: 'The Observer',       section: 'Periodical', dewey: '050', status: 'In Use' },
  radarr:              { title: 'Film Studies',       section: 'Arts',       dewey: '791', status: 'Available' },
  sonarr:              { title: 'Television History', section: 'Media',      dewey: '384', status: 'Available' },
  lidarr:              { title: 'Music Theory',       section: 'Arts',       dewey: '780', status: 'Available' },
  tunarr:              { title: 'Broadcasting',       section: 'Media',      dewey: '384', status: 'Checked Out' },
  qbittorrent:         { title: 'Data Transfer',      section: 'Computing',  dewey: '004', status: 'In Use' },
  sabnzbd:             { title: 'Binary Code',        section: 'Computing',  dewey: '005', status: 'Available' },
  prowlarr:            { title: 'Index Volume',       section: 'Reference',  dewey: '025', status: 'Available' },
  cloudflared:         { title: 'Secret Passages',    section: 'Fiction',    dewey: '813', status: 'Available' },
  notifiarr:           { title: 'The Bell',           section: 'Periodical', dewey: '050', status: 'Available' },
  flaresolverr:        { title: 'Puzzle Book',        section: 'Games',      dewey: '793', status: 'Available' },
  protonvpn:           { title: 'Cryptography',       section: 'Science',    dewey: '652', status: 'Available' },
  musicbrainz:         { title: 'Music Archive',      section: 'Reference',  dewey: '780', status: 'Available' },
  'port-updater':      { title: 'Maintenance Log',    section: 'Admin',      dewey: '025', status: 'Staff Only' },
  'musicbrainz-local': { title: 'Local History',      section: 'Reference',  dewey: '976', status: 'Available' },
  bazarr:              { title: 'Translation Dict',   section: 'Language',   dewey: '400', status: 'Available' },
  'tautulli-bridge':   { title: 'Audio Guide',        section: 'Media',      dewey: '384', status: 'Available' },
};

export const getLibraryStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['QUIET', 'BROWSING', 'BUSY', 'OVERDUE'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
