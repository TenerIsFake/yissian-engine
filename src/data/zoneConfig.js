// ─────────────────────────────────────────────
// ZONE CONFIGURATION — Spatial Grid Engine
//
// 8 functional zones that group homelab services
// by their role. Every mode renders these zones
// with its own metaphor vocabulary.
// ─────────────────────────────────────────────

export const ZONES = {
  CORE:     'CORE',
  LIBRARY:  'LIBRARY',
  PIPELINE: 'PIPELINE',
  MONITOR:  'MONITOR',
  SECURITY: 'SECURITY',
  SUPPORT:  'SUPPORT',
  UTILITY:  'UTILITY',
  BOTS:     'BOTS',
};

// Ordered list for consistent rendering
export const ZONE_ORDER = [
  ZONES.CORE, ZONES.LIBRARY, ZONES.PIPELINE, ZONES.MONITOR,
  ZONES.SECURITY, ZONES.SUPPORT, ZONES.UTILITY, ZONES.BOTS,
];

// Per-mode zone name translations
// Each mode maps the 8 functional zones to its own vocabulary
export const MODE_ZONE_NAMES = {
  CHEM:       { CORE: 'Reaction Chamber',    LIBRARY: 'Reagent Shelf',       PIPELINE: 'Distillation Column', MONITOR: 'Fume Hood Sensors',  SECURITY: 'Hazmat Locker',      SUPPORT: 'Lab Services',      UTILITY: 'Instrument Bench',      BOTS: 'Research Assistants' },
  SPACE:      { CORE: 'Bridge',              LIBRARY: 'Star Charts',         PIPELINE: 'Cargo Bay',           MONITOR: 'Sensor Array',       SECURITY: 'Shields',            SUPPORT: 'Engineering',       UTILITY: 'Science Lab',           BOTS: 'Probes' },
  NEURAL:     { CORE: 'Core Processor',      LIBRARY: 'Memory Banks',        PIPELINE: 'Data Pipeline',       MONITOR: 'Diagnostic Nodes',   SECURITY: 'Firewall',           SUPPORT: 'Kernel Services',   UTILITY: 'I/O Ports',             BOTS: 'Neural Agents' },
  ARCANE:     { CORE: 'Inner Sanctum',       LIBRARY: 'Library of Tomes',    PIPELINE: 'Alchemy Lab',         MONITOR: 'Scrying Pool',       SECURITY: 'Ward Chamber',       SUPPORT: 'Familiar Quarters', UTILITY: 'Enchanting Table',      BOTS: 'Homunculi' },
  BIO:        { CORE: 'Nucleus',             LIBRARY: 'Ribosomes',           PIPELINE: 'Endoplasmic Reticulum', MONITOR: 'Lysosomes',        SECURITY: 'Cell Membrane',      SUPPORT: 'Mitochondria',      UTILITY: 'Golgi Apparatus',       BOTS: 'Antibodies' },
  MOLECULE:   { CORE: 'Core Bonds',          LIBRARY: 'Valence Shell',       PIPELINE: 'Reaction Pathway',    MONITOR: 'Spectroscopy',       SECURITY: 'Activation Barrier', SUPPORT: 'Catalyst Layer',    UTILITY: 'Functional Groups',     BOTS: 'Free Radicals' },
  PLANET:     { CORE: 'Star',                LIBRARY: 'Inner Planets',       PIPELINE: 'Asteroid Belt',       MONITOR: 'Observation Post',   SECURITY: 'Magnetosphere',      SUPPORT: 'Orbital Station',   UTILITY: 'Moon System',           BOTS: 'Satellite Swarm' },
  WEATHER:    { CORE: 'Storm Center',        LIBRARY: 'Observation Network', PIPELINE: 'Jet Stream',          MONITOR: 'Radar Array',        SECURITY: 'Warning Center',     SUPPORT: 'Ground Stations',   UTILITY: 'Forecast Desk',         BOTS: 'Weather Balloons' },
  AIRPORT:    { CORE: 'Gate A — Media',      LIBRARY: 'Gate B — Arr Suite',  PIPELINE: 'Runway',              MONITOR: 'Control Tower',      SECURITY: 'Security',           SUPPORT: 'Ground Crew',       UTILITY: 'Lounge',                BOTS: 'Flight Crew' },
  DINO:       { CORE: 'Alpha Pack',          LIBRARY: 'Nesting Ground',      PIPELINE: 'Migration Trail',     MONITOR: 'Watchtower',         SECURITY: 'Tar Pits',           SUPPORT: 'Volcano Base',      UTILITY: 'Watering Hole',         BOTS: 'Hatchlings' },
  NOIR:       { CORE: 'Crime Scene',         LIBRARY: 'Evidence Room',       PIPELINE: 'Supply Chain',        MONITOR: 'Surveillance',       SECURITY: 'Precinct',           SUPPORT: 'Informants',        UTILITY: 'Safe House',            BOTS: 'Undercovers' },
  VINYL:      { CORE: 'Main Stage',          LIBRARY: 'Record Crates',       PIPELINE: 'Pressing Plant',      MONITOR: 'Sound Board',        SECURITY: 'Bouncer Station',    SUPPORT: 'Roadies',           UTILITY: 'Merch Table',           BOTS: 'Session Players' },
  BAND:       { CORE: 'Lead Singer',         LIBRARY: 'Setlist',             PIPELINE: 'Tour Bus',            MONITOR: 'Soundcheck',         SECURITY: 'Stage Security',     SUPPORT: 'Crew',              UTILITY: 'Green Room',            BOTS: 'Backup Singers' },
  PARTICLE:   { CORE: 'Collision Point',     LIBRARY: 'Detector Ring',       PIPELINE: 'Beam Line',           MONITOR: 'Calorimeter',        SECURITY: 'Containment',        SUPPORT: 'Cryogenics',        UTILITY: 'Control Room',          BOTS: 'Sensor Array' },
  GLOBE:      { CORE: 'Capital',             LIBRARY: 'Archive',             PIPELINE: 'Trade Route',         MONITOR: 'Lighthouse',         SECURITY: 'Fortress',           SUPPORT: 'Harbor',            UTILITY: 'Market',                BOTS: 'Scouts' },
  FORGE:      { CORE: 'Crucible',            LIBRARY: 'Armory',              PIPELINE: 'Supply Chain',        MONITOR: 'Quench Tank',        SECURITY: 'Vault',              SUPPORT: 'Bellows',           UTILITY: 'Workshop',              BOTS: 'Apprentices' },
  OCEAN:      { CORE: 'Coral Palace',        LIBRARY: 'Kelp Library',        PIPELINE: 'Deep Current',        MONITOR: 'Sonar Net',          SECURITY: 'Shell Armor',        SUPPORT: 'Thermal Vents',     UTILITY: 'Tidal Pool',            BOTS: 'School of Fish' },
  // ── New modes (Batch A-G) ──
  TACTICAL:   { CORE: 'Command Center',      LIBRARY: 'Intel Vault',         PIPELINE: 'Supply Line',         MONITOR: 'Radar Station',      SECURITY: 'Perimeter',          SUPPORT: 'Barracks',          UTILITY: 'Comm Tower',            BOTS: 'Recon Units' },
  STEAM:      { CORE: 'Boiler Room',         LIBRARY: 'Blueprint Archive',   PIPELINE: 'Pneumatic Tubes',     MONITOR: 'Pressure Gauges',    SECURITY: 'Vault Door',         SUPPORT: 'Furnace Room',      UTILITY: 'Telegraph Office',      BOTS: 'Automata' },
  ARCADE:     { CORE: 'Final Boss',          LIBRARY: 'Level Select',        PIPELINE: 'Power-Up Pipe',       MONITOR: 'HUD Display',        SECURITY: 'Shield Generator',   SUPPORT: 'Save Point',        UTILITY: 'Inventory',             BOTS: 'NPCs' },
  METRO:      { CORE: 'Main Concourse',      LIBRARY: 'Platform 1',          PIPELINE: 'Platform 2',          MONITOR: 'Control Tower',      SECURITY: 'Security Check',     SUPPORT: 'Maintenance Yard',  UTILITY: 'Arrivals/Departures',   BOTS: 'Conductors' },
  BLUEPRINT:  { CORE: 'Foundation',          LIBRARY: 'Wing A Plans',        PIPELINE: 'Utility Runs',        MONITOR: 'Inspector Office',   SECURITY: 'Fire Exit',          SUPPORT: 'Mechanical Room',   UTILITY: 'Reception',             BOTS: 'Survey Team' },
  APOTHECARY: { CORE: 'Brewing Cauldron',    LIBRARY: 'Ingredient Cabinet',  PIPELINE: 'Distillery',          MONITOR: 'Crystal Ball',       SECURITY: 'Poison Locker',      SUPPORT: 'Herb Garden',       UTILITY: 'Dispensary',            BOTS: 'Familiars' },
  FUNHOUSE:   { CORE: 'Main Attraction',     LIBRARY: 'Prize Counter',       PIPELINE: 'Conveyor Belt',       MONITOR: 'Ticket Booth',       SECURITY: 'Lost & Found',       SUPPORT: 'Backstage',         UTILITY: 'Gift Shop',             BOTS: 'Mascots' },
  SAFARI:     { CORE: 'Watering Hole',       LIBRARY: 'Field Guide Station', PIPELINE: 'Migration Path',      MONITOR: 'Lookout Tower',      SECURITY: 'Ranger Station',     SUPPORT: 'Base Camp',         UTILITY: 'Visitor Center',        BOTS: 'Tracking Dogs' },
  HEIST:      { CORE: 'The Vault',           LIBRARY: 'Blueprints Room',     PIPELINE: 'Escape Tunnel',       MONITOR: 'Security Cams',      SECURITY: 'Laser Grid',         SUPPORT: 'Getaway Car',       UTILITY: 'Safe House',            BOTS: 'Crew' },
  AQUARIUM:   { CORE: 'Main Tank',           LIBRARY: 'Specimen Archive',    PIPELINE: 'Filter System',       MONITOR: 'pH Sensors',         SECURITY: 'Quarantine Tank',    SUPPORT: 'Life Support',      UTILITY: 'Gift Shop',             BOTS: 'Cleaner Fish' },
  GARDEN:     { CORE: 'Greenhouse',          LIBRARY: 'Seed Vault',          PIPELINE: 'Irrigation',          MONITOR: 'Weather Station',    SECURITY: 'Pest Control',       SUPPORT: 'Compost',           UTILITY: 'Potting Shed',          BOTS: 'Pollinators' },
  BREW:       { CORE: 'Mash Tun',            LIBRARY: 'Recipe Cellar',       PIPELINE: 'Fermentation',        MONITOR: 'Hydrometer',         SECURITY: 'Quality Lab',        SUPPORT: 'Barrel Room',       UTILITY: 'Taproom',               BOTS: 'Yeast Cultures' },
  LIBRARY:    { CORE: 'Reading Room',        LIBRARY: 'Stacks',              PIPELINE: 'Book Drop',           MONITOR: 'Catalog Desk',       SECURITY: 'Restricted Section', SUPPORT: 'Basement Archive',  UTILITY: 'Circulation Desk',      BOTS: 'Research Aides' },
};

/**
 * Get services grouped by zone.
 * @param {Array} services — SERVICE_REGISTRY array (each entry must have a `zone` field)
 * @returns {Object} { CORE: [...], LIBRARY: [...], ... }
 */
export function groupByZone(services) {
  const groups = {};
  for (const z of ZONE_ORDER) groups[z] = [];
  for (const svc of services) {
    const zone = svc.zone || ZONES.UTILITY; // default fallback
    if (groups[zone]) groups[zone].push(svc);
    else groups[ZONES.UTILITY].push(svc);
  }
  return groups;
}

/**
 * Get the mode-specific zone name.
 * @param {string} mode — dashboard mode ID
 * @param {string} zone — zone constant (e.g. 'CORE')
 * @returns {string} mode-specific name or fallback to zone ID
 */
export function getZoneName(mode, zone) {
  return MODE_ZONE_NAMES[mode]?.[zone] || zone;
}
