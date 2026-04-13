export const FUNHOUSE_LABELS = {
  ALKALI:     'Big Top',
  ALKALINE:   'Hall of Mirrors',
  TRANSITION: 'Bumper Cars',
  HALOGEN:    'Ring Toss',
  NOBLE:      'Fortune Teller',
  LANTHANIDE: 'Carousel',
  POST:       'Balloon Pop',
  METALLOID:  'Whack-a-Mole',
  NONMETAL:   'Prize Counter',
  ACTINIDE:   'Tunnel of Love',
  PNICTOGEN:  'Tilt-a-Whirl',
  CHALCOGEN:  'Cotton Candy',
};

export const FUNHOUSE_OVERLAY = {
  plex:                { attraction: 'The Main Stage',     ticket: 'VIP PASS',        color: 'Red',     booth: '1' },
  overseerr:           { attraction: 'Wish Booth',         ticket: 'REQUEST SLIP',    color: 'Blue',    booth: '2' },
  tautulli:            { attraction: 'Crystal Ball',       ticket: 'FORTUNE CARD',    color: 'Purple',  booth: '3' },
  radarr:              { attraction: 'Movie Reel Ride',    ticket: 'FILM PASS',       color: 'Orange',  booth: '4' },
  sonarr:              { attraction: 'TV Tunnel',          ticket: 'SERIES TICKET',   color: 'Cyan',    booth: '5' },
  lidarr:              { attraction: 'Sound Swing',        ticket: 'MUSIC WRISTBAND', color: 'Pink',    booth: '6' },
  tunarr:              { attraction: 'Channel Spinner',    ticket: 'DIAL TOKEN',      color: 'Yellow',  booth: '7' },
  qbittorrent:         { attraction: 'Gravity Drop',      ticket: 'THRILL PASS',     color: 'Green',   booth: '8' },
  sabnzbd:             { attraction: 'Zip Line',           ticket: 'SPEED TICKET',    color: 'Lime',    booth: '9' },
  prowlarr:            { attraction: 'Scavenger Hunt',     ticket: 'CLUE CARD',       color: 'Teal',    booth: '10' },
  cloudflared:         { attraction: 'Secret Passage',     ticket: 'MYSTERY PASS',    color: 'Black',   booth: '11' },
  notifiarr:           { attraction: 'Bell Tower',         ticket: 'RING TOKEN',      color: 'Gold',    booth: '12' },
  flaresolverr:        { attraction: 'Puzzle Room',        ticket: 'SOLVE BADGE',     color: 'Silver',  booth: '13' },
  protonvpn:           { attraction: 'Invisible Maze',     ticket: 'VANISH PASS',     color: 'Indigo',  booth: '14' },
  musicbrainz:         { attraction: 'Memory Lane',        ticket: 'NOSTALGIA COIN',  color: 'Bronze',  booth: '15' },
  'port-updater':      { attraction: 'Slot Machine',       ticket: 'LUCKY TOKEN',     color: 'Cherry',  booth: '16' },
  'musicbrainz-local': { attraction: 'Record Player',      ticket: 'VINYL STUB',      color: 'Copper',  booth: '17' },
  bazarr:              { attraction: 'Subtitle Bingo',     ticket: 'BINGO CARD',      color: 'Magenta', booth: '18' },
  'tautulli-bridge':   { attraction: 'Echo Chamber',       ticket: 'SPEAKER PASS',    color: 'Coral',   booth: '19' },
};

export const getFunhouseStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['IDLE', 'FUN', 'WILD', 'CHAOS'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
