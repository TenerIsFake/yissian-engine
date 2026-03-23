export const BAND_LABELS = {
  ALKALI:     'Lead Vocalist',
  ALKALINE:   'Lead Guitar',
  TRANSITION: 'Rhythm Guitar',
  HALOGEN:    'Bass Guitar',
  NOBLE:      'Drums',
  LANTHANIDE: 'Keyboards',
  POST:       'Backing Vocals',
  METALLOID:  'Rhythm Section',
  NONMETAL:   'Horn Section',
  ACTINIDE:   'String Section',
  PNICTOGEN:  'Turntablist',
  CHALCOGEN:  'Roadie Crew',
};

export const BAND_OVERLAY = {
  plex:               { bandName: 'PLEX COLLECTIVE',      role: 'Lead Vocalist',  instrument: 'Main Stage',       era: '2009–present' },
  overseerr:          { bandName: 'REQUEST FRONT',        role: 'Tour Manager',   instrument: 'Requests Desk',    era: '2020–present' },
  tautulli:           { bandName: 'STAT TRACKERS',        role: 'Sound Engineer', instrument: 'Mixing Board',     era: '2015–present' },
  radarr:             { bandName: 'FILM FINDERS',         role: 'Rhythm Guitar',  instrument: 'Acquisition Rig',  era: '2016–present' },
  sonarr:             { bandName: 'SERIES SEEKERS',       role: 'Rhythm Guitar',  instrument: 'Acquisition Rig',  era: '2014–present' },
  lidarr:             { bandName: 'AUDIO HUNTERS',        role: 'Lead Guitar',    instrument: 'Music Rig',        era: '2018–present' },
  tunarr:             { bandName: 'CHANNEL MASTERS',      role: 'Keyboards',      instrument: 'Live Stream',      era: '2022–present' },
  qbittorrent:        { bandName: 'TORRENT CREW',         role: 'Bass Guitar',    instrument: 'Download Line',    era: '2001–present' },
  sabnzbd:            { bandName: 'BINARY DOWNLOADERS',   role: 'Drums',          instrument: 'NZB Kit',          era: '2006–present' },
  prowlarr:           { bandName: 'INDEX MASTERS',        role: 'Rhythm Section', instrument: 'Index Board',      era: '2021–present' },
  cloudflared:        { bandName: 'TUNNEL CREW',          role: 'Roadie',         instrument: 'Networking Rig',   era: '2020–present' },
  notifiarr:          { bandName: 'NOTIFICATION CREW',    role: 'Backing Vocals', instrument: 'PA System',        era: '2020–present' },
  flaresolverr:       { bandName: 'CAPTCHA BUSTERS',      role: 'Turntablist',    instrument: 'Bypass Deck',      era: '2020–present' },
  protonvpn:          { bandName: 'STEALTH NETWORK',      role: 'Security',       instrument: 'Encryption Box',   era: '2014–present' },
  musicbrainz:        { bandName: 'METADATA MASTERS',     role: 'Horn Section',   instrument: 'Brass Ensemble',   era: '2000–present' },
  'port-updater':     { bandName: 'PORT CREW',            role: 'Roadie',         instrument: 'Stage Manager',    era: '2024–present' },
  'musicbrainz-local':{ bandName: 'LOCAL DB',             role: 'String Section', instrument: 'String Ensemble',  era: '2000–present' },
  bazarr:             { bandName: 'SUBTITLE CREW',        role: 'Lyricist',       instrument: 'Transcript Desk',  era: '2018–present' },
};

export const getBandStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['TOURING', 'REHEARSING', 'RECORDING', 'DISBANDED'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
