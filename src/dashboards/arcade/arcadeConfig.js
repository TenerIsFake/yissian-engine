export const ARCADE_LABELS = {
  ALKALI:     'Final Boss',
  ALKALINE:   'Power-Up Zone',
  TRANSITION: 'Battle Arena',
  HALOGEN:    'Warp Pipe',
  NOBLE:      'Save Point',
  LANTHANIDE: 'Level Select',
  POST:       'Bonus Stage',
  METALLOID:  'Inventory',
  NONMETAL:   'Item Shop',
  ACTINIDE:   'Debug Room',
  PNICTOGEN:  'Boss Rush',
  CHALCOGEN:  'Credits Roll',
};

export const ARCADE_OVERLAY = {
  plex:                { avatar: 'PLAYER ONE',     class: 'Paladin',        level: 'LVL 99',    xp: 'MAX XP'       },
  overseerr:           { avatar: 'QUEST GIVER',    class: 'Sage',           level: 'LVL 80',    xp: '95,420 XP'    },
  tautulli:            { avatar: 'STATISTICIAN',   class: 'Scholar',        level: 'LVL 75',    xp: '88,100 XP'    },
  radarr:              { avatar: 'FILM HUNTER',    class: 'Ranger',         level: 'LVL 85',    xp: '91,200 XP'    },
  sonarr:              { avatar: 'SERIES SCOUT',   class: 'Rogue',          level: 'LVL 82',    xp: '89,800 XP'    },
  lidarr:              { avatar: 'BARD',           class: 'Minstrel',       level: 'LVL 78',    xp: '86,500 XP'    },
  tunarr:              { avatar: 'BROADCASTER',    class: 'Channeler',      level: 'LVL 70',    xp: '82,000 XP'    },
  qbittorrent:         { avatar: 'PACK MULE',      class: 'Berserker',      level: 'LVL 88',    xp: '93,600 XP'    },
  sabnzbd:             { avatar: 'COURIER NPC',    class: 'Merchant',       level: 'LVL 72',    xp: '84,100 XP'    },
  prowlarr:            { avatar: 'INDEX MAGE',     class: 'Diviner',        level: 'LVL 77',    xp: '87,300 XP'    },
  cloudflared:         { avatar: 'TUNNEL WORM',    class: 'Summoner',       level: 'LVL 90',    xp: '96,000 XP'    },
  notifiarr:           { avatar: 'HERALD',         class: 'Cleric',         level: 'LVL 65',    xp: '78,400 XP'    },
  flaresolverr:        { avatar: 'GLITCH',         class: 'Hacker',         level: 'LVL 83',    xp: '90,100 XP'    },
  protonvpn:           { avatar: 'SHADOW',         class: 'Assassin',       level: 'LVL 95',    xp: '98,200 XP'    },
  musicbrainz:         { avatar: 'LOREKEEPER',     class: 'Archivist',      level: 'LVL 74',    xp: '85,700 XP'    },
  'port-updater':      { avatar: 'SWITCH',         class: 'Engineer',       level: 'LVL 60',    xp: '75,000 XP'    },
  'musicbrainz-local': { avatar: 'CODEX',          class: 'Librarian',      level: 'LVL 68',    xp: '80,500 XP'    },
  bazarr:              { avatar: 'TRANSLATOR',     class: 'Linguist',       level: 'LVL 71',    xp: '83,200 XP'    },
  'tautulli-bridge':   { avatar: 'BRIDGE TROLL',   class: 'Guardian',       level: 'LVL 66',    xp: '79,800 XP'    },
};

export const getArcadeStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['IDLE', 'ACTIVE', 'COMBO', 'GAME_OVER'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
