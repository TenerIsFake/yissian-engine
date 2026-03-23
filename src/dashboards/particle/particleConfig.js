export const PARTICLE_LABELS = {
  ALKALI:     'Up Quark',
  ALKALINE:   'Down Quark',
  TRANSITION: 'Strange Quark',
  HALOGEN:    'Charm Quark',
  NOBLE:      'Bottom Quark',
  LANTHANIDE: 'Top Quark',
  POST:       'Electron',
  METALLOID:  'Muon',
  NONMETAL:   'Neutrino',
  ACTINIDE:   'Gluon',
  PNICTOGEN:  'Photon',
  CHALCOGEN:  'W/Z Boson',
};

export const PARTICLE_OVERLAY = {
  plex:               { particleName: 'Proton',        symbol: 'p⁺',  charge: '+1',  spin: '½', mass: '938.3 MeV'    },
  overseerr:          { particleName: 'Neutron',       symbol: 'n⁰',  charge: '0',   spin: '½', mass: '939.6 MeV'    },
  tautulli:           { particleName: 'Electron',      symbol: 'e⁻',  charge: '−1',  spin: '½', mass: '0.511 MeV'    },
  radarr:             { particleName: 'Up Quark',      symbol: 'u',   charge: '+⅔',  spin: '½', mass: '2.3 MeV'      },
  sonarr:             { particleName: 'Down Quark',    symbol: 'd',   charge: '−⅓',  spin: '½', mass: '4.8 MeV'      },
  lidarr:             { particleName: 'Strange Quark', symbol: 's',   charge: '−⅓',  spin: '½', mass: '95 MeV'       },
  tunarr:             { particleName: 'Charm Quark',   symbol: 'c',   charge: '+⅔',  spin: '½', mass: '1.28 GeV'     },
  qbittorrent:        { particleName: 'Gluon',         symbol: 'g',   charge: '0',   spin: '1', mass: '0 (massless)' },
  sabnzbd:            { particleName: 'Muon',          symbol: 'μ⁻',  charge: '−1',  spin: '½', mass: '105.7 MeV'    },
  prowlarr:           { particleName: 'Photon',        symbol: 'γ',   charge: '0',   spin: '1', mass: '0 (massless)' },
  cloudflared:        { particleName: 'W Boson',       symbol: 'W⁺',  charge: '+1',  spin: '1', mass: '80.4 GeV'     },
  notifiarr:          { particleName: 'Z Boson',       symbol: 'Z⁰',  charge: '0',   spin: '1', mass: '91.2 GeV'     },
  flaresolverr:       { particleName: 'Tau Lepton',    symbol: 'τ⁻',  charge: '−1',  spin: '½', mass: '1.777 GeV'    },
  protonvpn:          { particleName: 'Neutrino',      symbol: 'ν',   charge: '0',   spin: '½', mass: '<2 eV'        },
  musicbrainz:        { particleName: 'Higgs Boson',   symbol: 'H⁰',  charge: '0',   spin: '0', mass: '125.1 GeV'    },
  'port-updater':     { particleName: 'Pion',          symbol: 'π⁰',  charge: '0',   spin: '0', mass: '134.9 MeV'    },
  'musicbrainz-local':{ particleName: 'Kaon',          symbol: 'K⁰',  charge: '0',   spin: '0', mass: '497.6 MeV'    },
  bazarr:             { particleName: 'Eta Meson',     symbol: 'η',   charge: '0',   spin: '0', mass: '547.9 MeV'    },
};

export const getParticleStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['STABLE', 'EXCITED', 'DECAYING', 'ANNIHILATED'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
