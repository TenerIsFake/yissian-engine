// ─────────────────────────────────────────────
// Zone config index — imports all mode configs and registers them
// Import this file once at app startup to populate the config cache.
// ─────────────────────────────────────────────
import { registerZoneConfig } from '../ZoneLayoutEngine.js';

import SPACE_ZONES from './space.js';
import NEURAL_ZONES from './neural.js';
import ARCANE_ZONES from './arcane.js';
import BIO_ZONES from './bio.js';
import MOLECULE_ZONES from './molecule.js';
import PLANET_ZONES from './planet.js';
import WEATHER_ZONES from './weather.js';
import AIRPORT_ZONES from './airport.js';
import DINO_ZONES from './dino.js';
import NOIR_ZONES from './noir.js';
import VINYL_ZONES from './vinyl.js';
import BAND_ZONES from './band.js';
import PARTICLE_ZONES from './particle.js';
import GLOBE_ZONES from './globe.js';
import FORGE_ZONES from './forge.js';
import OCEAN_ZONES from './ocean.js';
import TACTICAL_ZONES from './tactical.js';
import STEAM_ZONES from './steam.js';
import ARCADE_ZONES from './arcade.js';
import BLUEPRINT_ZONES from './blueprint.js';
import APOTHECARY_ZONES from './apothecary.js';
import FUNHOUSE_ZONES from './funhouse.js';
import METRO_ZONES from './metro.js';
import SAFARI_ZONES from './safari.js';
import HEIST_ZONES from './heist.js';
import AQUARIUM_ZONES from './aquarium.js';
import GARDEN_ZONES from './garden.js';
import BREW_ZONES from './brew.js';
import LIBRARY_ZONES from './library.js';

registerZoneConfig('SPACE', SPACE_ZONES);
registerZoneConfig('NEURAL', NEURAL_ZONES);
registerZoneConfig('ARCANE', ARCANE_ZONES);
registerZoneConfig('BIO', BIO_ZONES);
registerZoneConfig('MOLECULE', MOLECULE_ZONES);
registerZoneConfig('PLANET', PLANET_ZONES);
registerZoneConfig('WEATHER', WEATHER_ZONES);
registerZoneConfig('AIRPORT', AIRPORT_ZONES);
registerZoneConfig('DINO', DINO_ZONES);
registerZoneConfig('NOIR', NOIR_ZONES);
registerZoneConfig('VINYL', VINYL_ZONES);
registerZoneConfig('BAND', BAND_ZONES);
registerZoneConfig('PARTICLE', PARTICLE_ZONES);
registerZoneConfig('GLOBE', GLOBE_ZONES);
registerZoneConfig('FORGE', FORGE_ZONES);
registerZoneConfig('OCEAN', OCEAN_ZONES);
registerZoneConfig('TACTICAL', TACTICAL_ZONES);
registerZoneConfig('STEAM', STEAM_ZONES);
registerZoneConfig('ARCADE', ARCADE_ZONES);
registerZoneConfig('BLUEPRINT', BLUEPRINT_ZONES);
registerZoneConfig('APOTHECARY', APOTHECARY_ZONES);
registerZoneConfig('FUNHOUSE', FUNHOUSE_ZONES);
registerZoneConfig('METRO', METRO_ZONES);
registerZoneConfig('SAFARI', SAFARI_ZONES);
registerZoneConfig('HEIST', HEIST_ZONES);
registerZoneConfig('AQUARIUM', AQUARIUM_ZONES);
registerZoneConfig('GARDEN', GARDEN_ZONES);
registerZoneConfig('BREW', BREW_ZONES);
registerZoneConfig('LIBRARY', LIBRARY_ZONES);
