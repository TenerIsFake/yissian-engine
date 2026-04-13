export const SAFARI_LABELS = {
  ALKALI:     'Big Cat',
  ALKALINE:   'Primate',
  TRANSITION: 'Pachyderm',
  HALOGEN:    'Raptor',
  NOBLE:      'Reptile',
  LANTHANIDE: 'Ungulate',
  POST:       'Aquatic',
  METALLOID:  'Nocturnal',
  NONMETAL:   'Insect',
  ACTINIDE:   'Burrower',
  PNICTOGEN:  'Canine',
  CHALCOGEN:  'Marsupial',
};

export const SAFARI_OVERLAY = {
  plex:                { animal: 'African Lion',       habitat: 'Savanna',    diet: 'Carnivore',   enclosure: 'A1' },
  overseerr:           { animal: 'Silverback Gorilla', habitat: 'Rainforest', diet: 'Herbivore',   enclosure: 'B1' },
  tautulli:            { animal: 'Peregrine Falcon',   habitat: 'Cliff Face', diet: 'Carnivore',   enclosure: 'D1' },
  radarr:              { animal: 'African Elephant',   habitat: 'Grassland',  diet: 'Herbivore',   enclosure: 'C1' },
  sonarr:              { animal: 'Bengal Tiger',        habitat: 'Jungle',     diet: 'Carnivore',   enclosure: 'A2' },
  lidarr:              { animal: 'Red Panda',          habitat: 'Bamboo',     diet: 'Omnivore',    enclosure: 'F1' },
  tunarr:              { animal: 'Giraffe',            habitat: 'Savanna',    diet: 'Herbivore',   enclosure: 'F2' },
  qbittorrent:         { animal: 'Hippopotamus',       habitat: 'River',      diet: 'Herbivore',   enclosure: 'C2' },
  sabnzbd:             { animal: 'Cheetah',            habitat: 'Plains',     diet: 'Carnivore',   enclosure: 'A3' },
  prowlarr:            { animal: 'Bald Eagle',         habitat: 'Mountains',  diet: 'Carnivore',   enclosure: 'D2' },
  cloudflared:         { animal: 'Chameleon',          habitat: 'Canopy',     diet: 'Insectivore', enclosure: 'E1' },
  notifiarr:           { animal: 'Howler Monkey',      habitat: 'Treetops',   diet: 'Omnivore',    enclosure: 'B2' },
  flaresolverr:        { animal: 'Komodo Dragon',      habitat: 'Islands',    diet: 'Carnivore',   enclosure: 'E2' },
  protonvpn:           { animal: 'Snow Leopard',       habitat: 'Alpine',     diet: 'Carnivore',   enclosure: 'A4' },
  musicbrainz:         { animal: 'Orangutan',          habitat: 'Borneo',     diet: 'Omnivore',    enclosure: 'B3' },
  'port-updater':      { animal: 'Meerkat',            habitat: 'Desert',     diet: 'Omnivore',    enclosure: 'J1' },
  'musicbrainz-local': { animal: 'Sloth',              habitat: 'Canopy',     diet: 'Herbivore',   enclosure: 'H1' },
  bazarr:              { animal: 'Parrot',             habitat: 'Aviary',     diet: 'Herbivore',   enclosure: 'D3' },
  'tautulli-bridge':   { animal: 'Wolf',               habitat: 'Tundra',     diet: 'Carnivore',   enclosure: 'K1' },
};

export const getSafariStatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['RESTING', 'ACTIVE', 'AGITATED', 'FRENZY'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
