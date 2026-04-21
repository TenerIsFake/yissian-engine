// ─────────────────────────────────────────────
// MODE_REGISTRY — single source of truth for all dashboard mode dispatch
// Adding a new mode = one import + one entry here. No other files need changes.
// ─────────────────────────────────────────────

import { lazy } from 'react';
import { CATEGORY_LABELS } from './themes/themeConfig.js';

// ── Grid components (lazy-loaded — only the active mode's chunk loads) ──
const PeriodicTableGrid = lazy(() => import('./components/PeriodicTableGrid.jsx'));
const StarMapGrid = lazy(() => import('./dashboards/space/StarMapGrid.jsx'));
const NeuralGrid = lazy(() => import('./dashboards/neural/NeuralGrid.jsx'));
const ArcaneGrid = lazy(() => import('./dashboards/arcane/ArcaneGrid.jsx'));
const BioGrid = lazy(() => import('./dashboards/bio/BioGrid.jsx'));
const MoleculeGrid = lazy(() => import('./dashboards/molecule/MoleculeGrid.jsx'));
const PlanetGrid = lazy(() => import('./dashboards/planet/PlanetGrid.jsx'));
const WeatherGrid = lazy(() => import('./dashboards/weather/WeatherGrid.jsx'));
const AirportGrid = lazy(() => import('./dashboards/airport/AirportGrid.jsx'));
const DinoGrid = lazy(() => import('./dashboards/dino/DinoGrid.jsx'));
const NoirGrid = lazy(() => import('./dashboards/noir/NoirGrid.jsx'));
const VinylGrid = lazy(() => import('./dashboards/vinyl/VinylGrid.jsx'));
const BandGrid = lazy(() => import('./dashboards/band/BandGrid.jsx'));
const ParticleGrid = lazy(() => import('./dashboards/particle/ParticleGrid.jsx'));
const GlobeGrid = lazy(() => import('./dashboards/globe/GlobeGrid.jsx'));
const ForgeGrid = lazy(() => import('./dashboards/forge/ForgeGrid.jsx'));
const OceanGrid = lazy(() => import('./dashboards/ocean/OceanGrid.jsx'));
const TacticalGrid = lazy(() => import('./dashboards/tactical/TacticalGrid.jsx'));
const SteamGrid = lazy(() => import('./dashboards/steam/SteamGrid.jsx'));
const ArcadeGrid = lazy(() => import('./dashboards/arcade/ArcadeGrid.jsx'));
const BlueprintGrid = lazy(() => import('./dashboards/blueprint/BlueprintGrid.jsx'));
const ApothecaryGrid = lazy(() => import('./dashboards/apothecary/ApothecaryGrid.jsx'));
const FunhouseGrid = lazy(() => import('./dashboards/funhouse/FunhouseGrid.jsx'));
const MetroGrid = lazy(() => import('./dashboards/metro/MetroGrid.jsx'));
const SafariGrid = lazy(() => import('./dashboards/safari/SafariGrid.jsx'));
const HeistGrid = lazy(() => import('./dashboards/heist/HeistGrid.jsx'));
const AquariumGrid = lazy(() => import('./dashboards/aquarium/AquariumGrid.jsx'));
const GardenGrid = lazy(() => import('./dashboards/garden/GardenGrid.jsx'));
const BrewGrid = lazy(() => import('./dashboards/brew/BrewGrid.jsx'));
const LibraryGrid = lazy(() => import('./dashboards/library/LibraryGrid.jsx'));
const SchlenkBenchScene = lazy(() => import('./dashboards/schlenk/SchlenkBenchScene.jsx'));

// ── Config objects (static — small, needed synchronously) ──
import { STELLAR_LABELS, SPACE_OVERLAY } from './dashboards/space/spaceConfig.js';
import { NEURAL_LABELS, NEURAL_OVERLAY } from './dashboards/neural/neuralConfig.js';
import { ARCANE_LABELS, ARCANE_OVERLAY } from './dashboards/arcane/arcaneConfig.js';
import { BIO_LABELS, BIO_OVERLAY } from './dashboards/bio/bioConfig.js';
import { MOLECULE_LABELS, MOLECULE_OVERLAY } from './dashboards/molecule/moleculeConfig.js';
import { PLANET_LABELS, PLANET_OVERLAY } from './dashboards/planet/planetConfig.js';
import { WEATHER_LABELS, WEATHER_OVERLAY } from './dashboards/weather/weatherConfig.js';
import { AIRPORT_LABELS, AIRPORT_OVERLAY } from './dashboards/airport/airportConfig.js';
import { DINO_LABELS, DINO_OVERLAY } from './dashboards/dino/dinoConfig.js';
import { NOIR_LABELS, NOIR_OVERLAY } from './dashboards/noir/noirConfig.js';
import { VINYL_LABELS, VINYL_OVERLAY } from './dashboards/vinyl/vinylConfig.js';
import { BAND_LABELS, BAND_OVERLAY } from './dashboards/band/bandConfig.js';
import { PARTICLE_LABELS, PARTICLE_OVERLAY } from './dashboards/particle/particleConfig.js';
import { GLOBE_LABELS, GLOBE_OVERLAY } from './dashboards/globe/globeConfig.js';
import { FORGE_LABELS, FORGE_OVERLAY } from './dashboards/forge/forgeConfig.js';
import { OCEAN_LABELS, OCEAN_OVERLAY } from './dashboards/ocean/oceanConfig.js';
import { TACTICAL_LABELS, TACTICAL_OVERLAY } from './dashboards/tactical/tacticalConfig.js';
import { STEAM_LABELS, STEAM_OVERLAY } from './dashboards/steam/steamConfig.js';
import { ARCADE_LABELS, ARCADE_OVERLAY } from './dashboards/arcade/arcadeConfig.js';
import { BLUEPRINT_LABELS, BLUEPRINT_OVERLAY } from './dashboards/blueprint/blueprintConfig.js';
import { APOTHECARY_LABELS, APOTHECARY_OVERLAY } from './dashboards/apothecary/apothecaryConfig.js';
import { FUNHOUSE_LABELS, FUNHOUSE_OVERLAY } from './dashboards/funhouse/funhouseConfig.js';
import { METRO_LABELS, METRO_OVERLAY } from './dashboards/metro/metroConfig.js';
import { SAFARI_LABELS, SAFARI_OVERLAY } from './dashboards/safari/safariConfig.js';
import { HEIST_LABELS, HEIST_OVERLAY } from './dashboards/heist/heistConfig.js';
import { AQUARIUM_LABELS, AQUARIUM_OVERLAY } from './dashboards/aquarium/aquariumConfig.js';
import { GARDEN_LABELS, GARDEN_OVERLAY } from './dashboards/garden/gardenConfig.js';
import { BREW_LABELS, BREW_OVERLAY } from './dashboards/brew/brewConfig.js';
import { LIBRARY_LABELS, LIBRARY_OVERLAY } from './dashboards/library/libraryConfig.js';

// ── SCHLENK-specific imports ──
import ReagentBottle from './dashboards/schlenk/diagrams/ReagentBottle.jsx';
import SolventReservoir from './dashboards/schlenk/diagrams/SolventReservoir.jsx';
import PiraniTrace from './dashboards/schlenk/diagrams/PiraniTrace.jsx';
import { getElementColor } from './dashboards/schlenk/elementColors.js';

// ── Diagram components (lazy-loaded — rendered in SystemMetricsPanel per mode) ──
const StellarCoreMonitor = lazy(() => import('./dashboards/space/StellarCoreMonitor.jsx'));
const SubspaceRelay = lazy(() => import('./dashboards/space/SubspaceRelay.jsx'));
const CargoBay = lazy(() => import('./dashboards/space/CargoBay.jsx'));
const SubspaceTelemetry = lazy(() => import('./dashboards/space/SubspaceTelemetry.jsx'));
const StormCellMonitor = lazy(() => import('./dashboards/weather/StormCellMonitor.jsx'));
const BarometerDial = lazy(() => import('./dashboards/weather/BarometerDial.jsx'));
const PrecipRadar = lazy(() => import('./dashboards/weather/PrecipRadar.jsx'));
const CloudFormation = lazy(() => import('./dashboards/weather/CloudFormation.jsx'));
const BarometerColumn = lazy(() => import('./dashboards/weather/BarometerColumn.jsx'));
const BarographTrace = lazy(() => import('./dashboards/weather/BarographTrace.jsx'));
const BlastFurnace = lazy(() => import('./dashboards/forge/BlastFurnace.jsx'));
const CrucibleGauge = lazy(() => import('./dashboards/forge/CrucibleGauge.jsx'));
const BellowsChimney = lazy(() => import('./dashboards/forge/BellowsChimney.jsx'));
const IngotStack = lazy(() => import('./dashboards/forge/IngotStack.jsx'));
const OreStockpile = lazy(() => import('./dashboards/forge/OreStockpile.jsx'));
const MoltenSparkline = lazy(() => import('./dashboards/forge/MoltenSparkline.jsx'));
const ChromatographyTrace = lazy(() => import('./components/ChromatographyTrace.jsx'));
const CoordComplex = lazy(() => import('./dashboards/chem/CoordComplex.jsx'));
const OrbitalDiagram = lazy(() => import('./dashboards/chem/OrbitalDiagram.jsx'));
const JablonskiDiagram = lazy(() => import('./dashboards/chem/JablonskiDiagram.jsx'));
const SubmarineCrossSection = lazy(() => import('./dashboards/ocean/SubmarineCrossSection.jsx'));
const BathyspherePorthole = lazy(() => import('./dashboards/ocean/BathyspherePorthole.jsx'));
const SubmarineCable = lazy(() => import('./dashboards/ocean/SubmarineCable.jsx'));
const CargoHold = lazy(() => import('./dashboards/ocean/CargoHold.jsx'));
const BallastCompartment = lazy(() => import('./dashboards/ocean/BallastCompartment.jsx'));
const SonarWaterfall = lazy(() => import('./dashboards/ocean/SonarWaterfall.jsx'));
const RunwayApproach = lazy(() => import('./dashboards/airport/RunwayApproach.jsx'));
const BaggageCarousel = lazy(() => import('./dashboards/airport/BaggageCarousel.jsx'));
const FlightBoard = lazy(() => import('./dashboards/airport/FlightBoard.jsx'));
const ControlTower = lazy(() => import('./dashboards/airport/ControlTower.jsx'));
const TerminalMap = lazy(() => import('./dashboards/airport/TerminalMap.jsx'));
const RadarBlipTrail = lazy(() => import('./dashboards/airport/RadarBlipTrail.jsx'));
const PlanetaryCore = lazy(() => import('./dashboards/planet/PlanetaryCore.jsx'));
const GasGiantBands = lazy(() => import('./dashboards/planet/GasGiantBands.jsx'));
const OrbitalTransfer = lazy(() => import('./dashboards/planet/OrbitalTransfer.jsx'));
const GeologicalStrata = lazy(() => import('./dashboards/planet/GeologicalStrata.jsx'));
const PlanetaryBase = lazy(() => import('./dashboards/planet/PlanetaryBase.jsx'));
const SeismographTrace = lazy(() => import('./dashboards/planet/SeismographTrace.jsx'));
const BrainScanMonitor = lazy(() => import('./dashboards/neural/BrainScanMonitor.jsx'));
const SynapseRelay = lazy(() => import('./dashboards/neural/SynapseRelay.jsx'));
const MemoryBank = lazy(() => import('./dashboards/neural/MemoryBank.jsx'));
const NeuralPulseTrace = lazy(() => import('./dashboards/neural/NeuralPulseTrace.jsx'));
const CrystalBallMonitor = lazy(() => import('./dashboards/arcane/CrystalBallMonitor.jsx'));
const SpellCircleRelay = lazy(() => import('./dashboards/arcane/SpellCircleRelay.jsx'));
const ManaPool = lazy(() => import('./dashboards/arcane/ManaPool.jsx'));
const RuneTraceSparkline = lazy(() => import('./dashboards/arcane/RuneTraceSparkline.jsx'));
const MicroscopeView = lazy(() => import('./dashboards/bio/MicroscopeView.jsx'));
const EnzymeReaction = lazy(() => import('./dashboards/bio/EnzymeReaction.jsx'));
const DNAHelix = lazy(() => import('./dashboards/bio/DNAHelix.jsx'));
const HeartbeatTrace = lazy(() => import('./dashboards/bio/HeartbeatTrace.jsx'));
const ReactionVessel = lazy(() => import('./dashboards/molecule/ReactionVessel.jsx'));
const TitrationBurette = lazy(() => import('./dashboards/molecule/TitrationBurette.jsx'));
const MassSpectrometer = lazy(() => import('./dashboards/molecule/MassSpectrometer.jsx'));
const ChemicalTraceSparkline = lazy(() => import('./dashboards/molecule/ChemicalTraceSparkline.jsx'));
const GeologicalCoreSample = lazy(() => import('./dashboards/dino/GeologicalCoreSample.jsx'));
const SeismicWaveform = lazy(() => import('./dashboards/dino/SeismicWaveform.jsx'));
const StratigraphicColumn = lazy(() => import('./dashboards/dino/StratigraphicColumn.jsx'));
const CarbonDatingTrace = lazy(() => import('./dashboards/dino/CarbonDatingTrace.jsx'));
const RevolverCylinder = lazy(() => import('./dashboards/noir/RevolverCylinder.jsx'));
const BourbonGlass = lazy(() => import('./dashboards/noir/BourbonGlass.jsx'));
const FileCabinet = lazy(() => import('./dashboards/noir/FileCabinet.jsx'));
const SmokeTrailSparkline = lazy(() => import('./dashboards/noir/SmokeTrailSparkline.jsx'));
const VUMeter = lazy(() => import('./dashboards/vinyl/VUMeter.jsx'));
const SoundboardFader = lazy(() => import('./dashboards/vinyl/SoundboardFader.jsx'));
const TurntableRPM = lazy(() => import('./dashboards/vinyl/TurntableRPM.jsx'));
const WaveformEQ = lazy(() => import('./dashboards/vinyl/WaveformEQ.jsx'));
const AmpGauge = lazy(() => import('./dashboards/band/AmpGauge.jsx'));
const MixerChannel = lazy(() => import('./dashboards/band/MixerChannel.jsx'));
const StageLightRig = lazy(() => import('./dashboards/band/StageLightRig.jsx'));
const SoundwaveSparkline = lazy(() => import('./dashboards/band/SoundwaveSparkline.jsx'));
const ColliderRing = lazy(() => import('./dashboards/particle/ColliderRing.jsx'));
const DecayChain = lazy(() => import('./dashboards/particle/DecayChain.jsx'));
const LuminosityMeter = lazy(() => import('./dashboards/particle/LuminosityMeter.jsx'));
const ScintillatorTrace = lazy(() => import('./dashboards/particle/ScintillatorTrace.jsx'));
const TectonicPlate = lazy(() => import('./dashboards/globe/TectonicPlate.jsx'));
const OceanCurrent = lazy(() => import('./dashboards/globe/OceanCurrent.jsx'));
const IceCoreSample = lazy(() => import('./dashboards/globe/IceCoreSample.jsx'));
const GlobeSeismographTrace = lazy(() => import('./dashboards/globe/SeismographTrace.jsx'));

// ── Transform factories — reduce per-mode boilerplate ──────────
function makeDetailTransform(overlay, labels, cfg) {
  return (element) => {
    const o = overlay?.[element.id];
    // metaValue2: if metaField2Prefix is set, format as "Prefix: value"; otherwise use raw field
    let mv2 = element.oxidation;
    if (cfg.metaField2Prefix && o) {
      mv2 = `${cfg.metaField2Prefix}: ${o[cfg.metaField2]}`;
    } else if (cfg.metaField2Fn && o) {
      mv2 = cfg.metaField2Fn(o) ?? element.oxidation;
    } else if (o?.[cfg.metaField2] != null) {
      mv2 = o[cfg.metaField2];
    }
    return {
      headerSymbol: o?.[cfg.symbolField],
      title: (o?.[cfg.nameField] ?? element.name).toUpperCase(),
      subtitle: cfg.subtitleFn ? cfg.subtitleFn(o, element)
        : cfg.subtitleLiteral ? `${o?.[cfg.subtitleField] ?? element.symbol} ◆ ${cfg.subtitleLiteral} ${o?.[cfg.subtitleExtra] ?? ''}`
        : `${o?.[cfg.subtitleField] ?? element.symbol} ◆ ${o?.[cfg.subtitleExtra] ?? ''}`,
      categoryLabel: (labels[element.cat] || element.cat).toUpperCase(),
      metadata: [
        { label: cfg.metaLabel1, value: o?.[cfg.metaField1] ?? element.electronConfig },
        { label: cfg.metaLabel2, value: mv2, fontSize: 10, color: 'rgba(255,255,255,0.7)' },
      ],
      statusLabels: cfg.statusLabels,
      serviceLinkColor: cfg.serviceLinkColor ?? 'rgba(100,200,255,0.8)',
    };
  };
}

function makeCardTransform(overlay, cfg) {
  const fb = cfg.fallback ?? 'symbol'; // 'symbol' or 'z'
  return (element) => {
    const o = overlay?.[element.id];
    const fallbackVal = fb === 'z' ? String(element.z) : element.symbol;
    return {
      topLeft: cfg.topLeftFn ? cfg.topLeftFn(o, element) : (o?.[cfg.topLeftField] ?? fallbackVal),
      centerLabel: o?.[cfg.centerField] ?? element.symbol,
      displayName: o?.[cfg.nameField] ?? element.service ?? element.name,
      bottomLabel: o?.[cfg.bottomField] ?? element.mass,
    };
  };
}

const MODE_REGISTRY = {
  CHEM: {
    Grid: PeriodicTableGrid,
    labels: CATEGORY_LABELS,
    tickerLabels: { films: ['SYNTHESIS_YIELDS', 'Synthesized_Films'], series: ['CHAIN_REACTIONS', 'Initiated_Series'], music: ['RARE_EARTH_FINDS', 'Acquired_Specimens'] },
    logTitle: null,
    gridProps: 'chem',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Coordination_Complex', storage: '◆ Storage_Drives ◆ Orbital_Fill_Diagram', srv2: '◆ SRV-2 ◆ Coordination_Complex' },
    glancesLabels: { cpu: 'CPU_LOAD', ram: 'RAM_USAGE', netDown: 'NET_DOWN', netUp: 'NET_UP' },
    storageLabels: { srv1: 'SRV-1', tv: 'TV', movies: 'MOVIES', musicPhotos: 'MUSIC_PHOTOS', srv2: 'SRV-2' },
    widgetLabels: {
      chat: '◆ AI_ASSISTANT ◆ Gemini_Chat', lottery: '◆ LOTTERY_GENERATOR ◆ Random_Numbers', stocks: '◆ MARKET_WATCH ◆ Live_Equities', spotify: '◆ SERVER_SOUNDTRACK ◆ Spotify_Feed',
      dockerHealth: '◆ UPTIME_TIMELINE ◆ 7d_Heartbeat', quote: '◆ DAILY_CATALYST ◆ ZenQuotes', freshRss: '◆ NEWS_FEED ◆ FreshRSS', weather: '◆ ATMOSPHERIC_PROBE ◆ Open-Meteo',
      vpnStatus: '◆ VPN_STATUS ◆ ProtonVPN·Gluetun', dnsLeak: '◆ QBIT_VPN ◆ Gluetun·Integrity', quickLaunch: '◆ Quick_Launch ◆ Service_Portals', airQuality: '◆ AIR_QUALITY ◆ Chicago_OpenAQ',
      plexLibrary: '◆ LIBRARY_STATS ◆ Plex_Counts', plexSessions: '◆ LIVE_SESSIONS ◆ Plex_Active_Streams', plexOnDeck: '◆ ON_DECK ◆ Plex_In_Progress',
      cronMonitor: '◆ CRON_MONITOR ◆', lanPresence: '◆ LAN_PRESENCE ◆', onThisDay: '◆ TEMPORAL_DECAY ◆',
    },
    headerTitle: { main: 'ELEMENT_TABLE', accent: '.SYS' },
    headerSubtitle: 'Period 4 ◆ Group {date} ◆ Homelab Services Dashboard',
    gridTitle: '◆ f-BLOCK SERIES ◆',
    jablonskiLabels: { emission: 'JABLONSKI ◆ EMISSION', excitation: 'JABLONSKI ◆ EXCITATION' },
    CpuDiagram: CoordComplex,
    RamDiagram: CoordComplex,
    DownloadDiagram: JablonskiDiagram,
    UploadDiagram: JablonskiDiagram,
    ServerStorageDiagram: OrbitalDiagram,
    MediaStorageDiagram: OrbitalDiagram,
    SpeedtestDiagram: ChromatographyTrace,
    detailTransform: (element) => ({
      title: element.name.toUpperCase(),
      subtitle: `Z = ${element.z} ◆ ${element.mass} u`,
      categoryLabel: (CATEGORY_LABELS[element.cat] || element.cat).toUpperCase(),
      metadata: [
        { label: 'ELECTRON_CONFIGURATION', value: element.electronConfig },
        { label: 'OXIDATION_STATES ◆ [GROUND | EXCITED | METASTABLE | NUCLEAR_DECAY]', value: element.oxidation, fontSize: 10, color: 'rgba(255,255,255,0.7)' },
      ],
      statusLabels: ['GROUND', 'EXCITED', 'METASTABLE', 'NUCLEAR_DECAY'],
      serviceLinkColor: 'rgba(100,200,255,0.8)',
    }),
    cardTransform: (element) => ({
      topLeft: String(element.z),
      centerLabel: element.symbol,
      displayName: element.service || element.name,
      bottomLabel: element.mass,
    }),
  },
  SPACE: {
    Grid: StarMapGrid,
    labels: STELLAR_LABELS,
    tickerLabels: { films: ['CARGO_MANIFEST', 'Acquired_Films'], series: ['MISSION_ARCHIVES', 'Tracked_Series'], music: ['ACOUSTIC_SIGNALS', 'Acquired_Albums'] },
    logTitle: 'MISSION_LOG ◆ Deep_Space_Telemetry',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Primary_Bridge', storage: '◆ Cargo_Bays ◆ Mass_Distribution', srv2: '◆ SRV-2 ◆ Relay_Station' },
    glancesLabels: { cpu: 'CORE_TEMP', ram: 'FUEL_CELLS', netDown: 'DOWNLINK', netUp: 'UPLINK' },
    storageLabels: { srv1: 'BRIDGE', tv: 'HOLO_ARCHIVE', movies: 'VISUAL_LOGS', musicPhotos: 'SIGNAL_BANK', srv2: 'RELAY' },
    widgetLabels: {
      chat: '◆ COMM_LINK ◆ AI_Copilot', lottery: '◆ QUANTUM_FLUX ◆ Random_Coordinates', stocks: '◆ TRADE_ROUTES ◆ Galactic_Markets', spotify: '◆ SUBSPACE_AUDIO ◆ Ship_Radio',
      dockerHealth: '◆ HULL_INTEGRITY ◆ 7d_Telemetry', quote: '◆ CAPTAINS_LOG ◆ Star_Wisdom', freshRss: '◆ SUBSPACE_FEED ◆ Deep_Space_News', weather: '◆ SOLAR_WIND ◆ Space_Weather',
      vpnStatus: '◆ CLOAK_STATUS ◆ Stealth_Field', dnsLeak: '◆ SHIELD_SCAN ◆ Hull_Integrity', quickLaunch: '◆ Shuttle_Bay ◆ Quick_Launch', airQuality: '◆ ATMO_SCAN ◆ Life_Support',
      plexLibrary: '◆ DATABANK ◆ Ship_Archives', plexSessions: '◆ HOLODECK ◆ Active_Projections', plexOnDeck: '◆ READY_ROOM ◆ Queued_Missions',
      cronMonitor: '◆ AUTOMATION_BAY ◆', lanPresence: '◆ CREW_MANIFEST ◆', onThisDay: '◆ STARDATE_LOG ◆',
    },
    headerTitle: { main: 'STAR_ATLAS', accent: '.NAV' },
    headerSubtitle: 'Sector 7 ◆ Stardate {date} ◆ Deep Space Command',
    gridTitle: '◆ STAR ATLAS — LIVE TELEMETRY ◆',
    jablonskiLabels: { emission: 'SIGNAL ◆ DOWNLINK', excitation: 'SIGNAL ◆ UPLINK' },
    CpuDiagram: StellarCoreMonitor,
    RamDiagram: StellarCoreMonitor,
    DownloadDiagram: SubspaceRelay,
    UploadDiagram: SubspaceRelay,
    ServerStorageDiagram: CargoBay,
    MediaStorageDiagram: CargoBay,
    SpeedtestDiagram: SubspaceTelemetry,
    detailTransform: makeDetailTransform(SPACE_OVERLAY, STELLAR_LABELS, {
      symbolField: 'designation', nameField: 'stellarName', subtitleField: 'spectralType', subtitleExtra: 'solarMasses',
      metaLabel1: 'ORBITAL_PARAMETERS', metaField1: 'orbitLabel',
      metaLabel2: 'MISSION_STATES ◆ [MAIN_SEQUENCE | SOLAR_FLARE | RED_GIANT | SUPERNOVA]', metaField2: 'flavor',
      statusLabels: ['MAIN_SEQUENCE', 'SOLAR_FLARE', 'RED_GIANT', 'SUPERNOVA'],
    }),
    cardTransform: makeCardTransform(SPACE_OVERLAY, {
      topLeftField: 'designation', centerField: 'designation', nameField: 'stellarName', bottomField: 'spectralType',
    }),
  },
  NEURAL: {
    Grid: NeuralGrid,
    labels: NEURAL_LABELS,
    tickerLabels: { films: ['DATA_STREAMS', 'Received_Films'], series: ['PACKET_LOGS', 'Tracked_Series'], music: ['SIGNAL_CACHE', 'Indexed_Albums'] },
    logTitle: 'NETWORK_LOG ◆ Signal_Stream_Analysis',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Primary_Cortex', storage: '◆ Memory_Banks ◆ Synaptic_Fill', srv2: '◆ SRV-2 ◆ Secondary_Cortex' },
    glancesLabels: { cpu: 'CLOCK_RATE', ram: 'BUFFER_POOL', netDown: 'RX_PACKETS', netUp: 'TX_PACKETS' },
    storageLabels: { srv1: 'CORTEX', tv: 'VISUAL_BUFFER', movies: 'MEDIA_CACHE', musicPhotos: 'AUDIO_BANK', srv2: 'NODE_2' },
    widgetLabels: {
      chat: '◆ LANGUAGE_MODEL ◆ Neural_Chat', lottery: '◆ STOCHASTIC_NODE ◆ Random_Weights', stocks: '◆ PREDICTION_NET ◆ Market_Signals', spotify: '◆ AUDIO_CORTEX ◆ Signal_Stream',
      dockerHealth: '◆ UPTIME_MESH ◆ 7d_Pulse', quote: '◆ INSIGHT_NODE ◆ Pattern_Match', freshRss: '◆ DATA_FEED ◆ RSS_Synapse', weather: '◆ SENSOR_ARRAY ◆ Atmospheric_Data',
      vpnStatus: '◆ FIREWALL_NODE ◆ Tunnel_Status', dnsLeak: '◆ PACKET_GUARD ◆ Leak_Detection', quickLaunch: '◆ Quick_Synapse ◆ Node_Portals', airQuality: '◆ ENV_SENSOR ◆ Air_Analysis',
      plexLibrary: '◆ MEMORY_INDEX ◆ Data_Counts', plexSessions: '◆ ACTIVE_THREADS ◆ Processing', plexOnDeck: '◆ QUEUE_BUFFER ◆ Pending_Tasks',
      cronMonitor: '◆ SCHEDULER ◆', lanPresence: '◆ CONNECTED_NODES ◆', onThisDay: '◆ TEMPORAL_PATTERN ◆',
    },
    headerTitle: { main: 'NEURAL_MESH', accent: '.NET' },
    headerSubtitle: 'Layer 4 ◆ Epoch {date} ◆ Neural Operations Center',
    gridTitle: '◆ NEURAL MESH — LIVE TOPOLOGY ◆',
    jablonskiLabels: { emission: 'PACKET ◆ RX_STREAM', excitation: 'PACKET ◆ TX_STREAM' },
    detailTransform: makeDetailTransform(NEURAL_OVERLAY, NEURAL_LABELS, {
      symbolField: 'nodeId', nameField: 'nodeName', subtitleField: 'nodeId', subtitleExtra: 'nodeClass',
      metaLabel1: 'NODE_PARAMETERS', metaField1: 'signalStr',
      metaLabel2: 'TRANSMISSION_STATES ◆ [IDLE | TRANSMITTING | OVERLOADED | DARK_NODE]', metaField2: 'packetRate',
      statusLabels: ['IDLE', 'TRANSMITTING', 'OVERLOADED', 'DARK_NODE'],
    }),
    CpuDiagram: BrainScanMonitor,
    RamDiagram: BrainScanMonitor,
    DownloadDiagram: SynapseRelay,
    UploadDiagram: SynapseRelay,
    ServerStorageDiagram: MemoryBank,
    MediaStorageDiagram: MemoryBank,
    SpeedtestDiagram: NeuralPulseTrace,
    cardTransform: makeCardTransform(NEURAL_OVERLAY, {
      topLeftField: 'nodeId', centerField: 'nodeId', nameField: 'nodeName', bottomField: 'nodeClass',
    }),
  },
  ARCANE: {
    Grid: ArcaneGrid,
    labels: ARCANE_LABELS,
    tickerLabels: { films: ['TOME_REGISTRY', 'Inscribed_Films'], series: ['CHRONICLE_VAULT', 'Scribed_Series'], music: ['HARMONIC_CODEX', 'Archived_Albums'] },
    logTitle: 'ARCANE_LOG ◆ Mystical_Event_Registry',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Primary_Sanctum', storage: '◆ Vault_Chambers ◆ Rune_Capacity', srv2: '◆ SRV-2 ◆ Mirror_Sanctum' },
    glancesLabels: { cpu: 'MANA_FLUX', ram: 'ETHER_POOL', netDown: 'SCRY_IN', netUp: 'SCRY_OUT' },
    storageLabels: { srv1: 'SANCTUM', tv: 'SCROLL_VAULT', movies: 'VISION_TOME', musicPhotos: 'ECHO_CHAMBER', srv2: 'MIRROR' },
    widgetLabels: {
      chat: '◆ ORACLE ◆ Arcane_Whisper', lottery: '◆ RUNE_CAST ◆ Fate_Numbers', stocks: '◆ GUILD_LEDGER ◆ Market_Augury', spotify: '◆ BARD_SONG ◆ Enchanted_Melody',
      dockerHealth: '◆ WARD_STATUS ◆ 7d_Vigil', quote: '◆ PROPHECY ◆ Ancient_Wisdom', freshRss: '◆ SCROLL_FEED ◆ Arcane_Headlines', weather: '◆ ELEMENTAL_PROBE ◆ Aether_Forecast',
      vpnStatus: '◆ VEIL_STATUS ◆ Shadow_Cloak', dnsLeak: '◆ WARD_SCAN ◆ Barrier_Check', quickLaunch: '◆ Portal_Circle ◆ Quick_Summon', airQuality: '◆ AETHER_QUALITY ◆ Mana_Purity',
      plexLibrary: '◆ GRIMOIRE ◆ Tome_Registry', plexSessions: '◆ SCRYING_POOL ◆ Active_Visions', plexOnDeck: '◆ RITUAL_QUEUE ◆ Pending_Spells',
      cronMonitor: '◆ ENCHANTMENT_CYCLE ◆', lanPresence: '◆ FAMILIAR_BOND ◆', onThisDay: '◆ CHRONICLE ◆',
    },
    headerTitle: { main: 'GRIMOIRE', accent: '.ARC' },
    headerSubtitle: 'Circle 4 ◆ Moon {date} ◆ Arcane Command Sanctum',
    gridTitle: '◆ SUMMONING CIRCLE — ACTIVE ◆',
    jablonskiLabels: { emission: 'SCRYING ◆ INBOUND', excitation: 'SCRYING ◆ OUTBOUND' },
    detailTransform: makeDetailTransform(ARCANE_OVERLAY, ARCANE_LABELS, {
      symbolField: 'runeSymbol', nameField: 'tomeTitle', subtitleField: 'runeSymbol', subtitleExtra: 'tomeType',
      metaLabel1: 'TOME_PARAMETERS', metaField1: 'bindingPower',
      metaLabel2: 'ARCANE_STATES ◆ [AWAKENED | DORMANT | CORRUPTED | SEALED]', metaField2: 'accessTier',
      statusLabels: ['AWAKENED', 'DORMANT', 'CORRUPTED', 'SEALED'],
    }),
    CpuDiagram: CrystalBallMonitor,
    RamDiagram: CrystalBallMonitor,
    DownloadDiagram: SpellCircleRelay,
    UploadDiagram: SpellCircleRelay,
    ServerStorageDiagram: ManaPool,
    MediaStorageDiagram: ManaPool,
    SpeedtestDiagram: RuneTraceSparkline,
    cardTransform: makeCardTransform(ARCANE_OVERLAY, {
      topLeftField: 'runeSymbol', centerField: 'runeSymbol', nameField: 'tomeTitle', bottomField: 'tomeType',
    }),
  },
  BIO: {
    Grid: BioGrid,
    labels: BIO_LABELS,
    tickerLabels: { films: ['SPECIMEN_LOG', 'Catalogued_Films'], series: ['CELL_DIVISION', 'Replicated_Series'], music: ['VIBRATION_SCAN', 'Sampled_Albums'] },
    logTitle: 'BIO_LOG ◆ Cellular_Activity_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Primary_Organism', storage: '◆ Tissue_Banks ◆ Cell_Density', srv2: '◆ SRV-2 ◆ Symbiont_Organism' },
    glancesLabels: { cpu: 'METABOLIC_RATE', ram: 'CYTOPLASM', netDown: 'INTAKE', netUp: 'EXCRETION' },
    storageLabels: { srv1: 'NUCLEUS', tv: 'GOLGI_STORE', movies: 'MEDIA_VACUOLE', musicPhotos: 'AUDIO_VESICLE', srv2: 'SYMBIONT' },
    widgetLabels: {
      chat: '◆ NEURAL_LINK ◆ Cell_Signaling', lottery: '◆ MUTATION_ENGINE ◆ Random_Codons', stocks: '◆ ECOSYSTEM ◆ Nutrient_Markets', spotify: '◆ AUDITORY_NERVE ◆ Bio_Rhythm',
      dockerHealth: '◆ VITAL_SIGNS ◆ 7d_Pulse', quote: '◆ GENOME_WISDOM ◆ Cell_Proverb', freshRss: '◆ HORMONE_FEED ◆ Bio_Signal', weather: '◆ BIOME_PROBE ◆ Climate_Sense',
      vpnStatus: '◆ MEMBRANE ◆ Barrier_Status', dnsLeak: '◆ IMMUNE_SCAN ◆ Pathogen_Check', quickLaunch: '◆ Organelle_Map ◆ Quick_Divide', airQuality: '◆ RESPIRATION ◆ O2_Levels',
      plexLibrary: '◆ DNA_ARCHIVE ◆ Gene_Counts', plexSessions: '◆ ACTIVE_MITOSIS ◆ Cell_Division', plexOnDeck: '◆ RIBOSOME_QUEUE ◆ Pending_Synthesis',
      cronMonitor: '◆ CIRCADIAN_CYCLE ◆', lanPresence: '◆ COLONY_COUNT ◆', onThisDay: '◆ FOSSIL_RECORD ◆',
    },
    headerTitle: { main: 'CELL_SCOPE', accent: '.BIO' },
    headerSubtitle: 'Phylum 4 ◆ Gen {date} ◆ Biolab Operations Center',
    gridTitle: '◆ EUKARYOTIC CELL — LIVE VIEW ◆',
    jablonskiLabels: { emission: 'OSMOSIS ◆ INTAKE', excitation: 'OSMOSIS ◆ OUTPUT' },
    detailTransform: makeDetailTransform(BIO_OVERLAY, BIO_LABELS, {
      symbolField: 'bioSymbol', nameField: 'organelleName', subtitleField: 'bioSymbol', subtitleExtra: 'organelleType',
      metaLabel1: 'CELL_PARAMETERS', metaField1: 'metabolicRate',
      metaLabel2: 'CELLULAR_STATES ◆ [ACTIVE | RESTING | REPLICATING | APOPTOTIC]', metaField2: 'cellularRole',
      statusLabels: ['ACTIVE', 'RESTING', 'REPLICATING', 'APOPTOTIC'],
    }),
    CpuDiagram: MicroscopeView,
    RamDiagram: MicroscopeView,
    DownloadDiagram: EnzymeReaction,
    UploadDiagram: EnzymeReaction,
    ServerStorageDiagram: DNAHelix,
    MediaStorageDiagram: DNAHelix,
    SpeedtestDiagram: HeartbeatTrace,
    cardTransform: makeCardTransform(BIO_OVERLAY, {
      topLeftField: 'bioSymbol', centerField: 'bioSymbol', nameField: 'organelleName', bottomField: 'organelleType',
    }),
  },
  MOLECULE: {
    Grid: MoleculeGrid,
    labels: MOLECULE_LABELS,
    tickerLabels: { films: ['COMPOUND_LOG', 'Synthesized_Films'], series: ['REACTION_SERIES', 'Chained_Series'], music: ['ISOTOPE_SCAN', 'Refined_Albums'] },
    logTitle: 'COMPOUND_LOG ◆ Molecular_Event_Register',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Reaction_Vessel_A', storage: '◆ Reagent_Storage ◆ Molar_Capacity', srv2: '◆ SRV-2 ◆ Reaction_Vessel_B' },
    glancesLabels: { cpu: 'BOND_ENERGY', ram: 'SOLVENT_VOL', netDown: 'ABSORPTION', netUp: 'EMISSION' },
    storageLabels: { srv1: 'VESSEL_A', tv: 'REAGENT_SHELF', movies: 'SOLVENT_STORE', musicPhotos: 'ISOTOPE_BANK', srv2: 'VESSEL_B' },
    widgetLabels: {
      chat: '◆ CATALYST ◆ Reaction_Chat', lottery: '◆ ENTROPY_GEN ◆ Random_Isomers', stocks: '◆ COMMODITY ◆ Reagent_Markets', spotify: '◆ RESONANCE ◆ Harmonic_Freq',
      dockerHealth: '◆ STABILITY_INDEX ◆ 7d_Reaction', quote: '◆ PERIODIC_WISDOM ◆ Element_Proverb', freshRss: '◆ COMPOUND_FEED ◆ Molecule_News', weather: '◆ VAPOR_PRESSURE ◆ Ambient_Conditions',
      vpnStatus: '◆ INERT_GAS ◆ Shielding_Status', dnsLeak: '◆ PURITY_SCAN ◆ Contaminant_Check', quickLaunch: '◆ Pipette_Rack ◆ Quick_Dispense', airQuality: '◆ FUME_HOOD ◆ Air_Purity',
      plexLibrary: '◆ COMPOUND_INDEX ◆ Formula_Counts', plexSessions: '◆ ACTIVE_REACTIONS ◆ In_Progress', plexOnDeck: '◆ PRECIPITATE_QUEUE ◆ Pending_Reactions',
      cronMonitor: '◆ TITRATION_CYCLE ◆', lanPresence: '◆ SOLUTION_COUNT ◆', onThisDay: '◆ HALF_LIFE_LOG ◆',
    },
    headerTitle: { main: 'BOND_MAP', accent: '.MOL' },
    headerSubtitle: 'Shell 4 ◆ Batch {date} ◆ Molecular Lab Control',
    gridTitle: '◆ MOLECULAR BOND DIAGRAM ◆',
    jablonskiLabels: { emission: 'PHOTON ◆ ABSORPTION', excitation: 'PHOTON ◆ EMISSION' },
    detailTransform: makeDetailTransform(MOLECULE_OVERLAY, MOLECULE_LABELS, {
      symbolField: 'formula', nameField: 'compoundName', subtitleField: 'formula', subtitleExtra: 'compoundType',
      metaLabel1: 'MOLECULAR_PARAMETERS', metaField1: 'bondType',
      metaLabel2: 'BOND_STATES ◆ [BONDED | REACTING | UNSTABLE | DISSOCIATED]', metaField2: 'molarMass',
      statusLabels: ['BONDED', 'REACTING', 'UNSTABLE', 'DISSOCIATED'],
    }),
    CpuDiagram: ReactionVessel,
    RamDiagram: ReactionVessel,
    DownloadDiagram: TitrationBurette,
    UploadDiagram: TitrationBurette,
    ServerStorageDiagram: MassSpectrometer,
    MediaStorageDiagram: MassSpectrometer,
    SpeedtestDiagram: ChemicalTraceSparkline,
    cardTransform: makeCardTransform(MOLECULE_OVERLAY, {
      topLeftField: 'formula', centerField: 'formula', nameField: 'compoundName', bottomField: 'compoundType',
    }),
  },
  PLANET: {
    Grid: PlanetGrid,
    labels: PLANET_LABELS,
    tickerLabels: { films: ['ORBITAL_MANIFEST', 'Surveyed_Films'], series: ['PLANETARY_LOG', 'Tracked_Series'], music: ['SIGNAL_ECHOES', 'Received_Albums'] },
    logTitle: 'ORBIT_LOG ◆ Planetary_Telemetry_Feed',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Inner_Planet', storage: '◆ Asteroid_Belt ◆ Orbital_Fill', srv2: '◆ SRV-2 ◆ Outer_Planet' },
    glancesLabels: { cpu: 'CORE_HEAT', ram: 'ATMO_PRESSURE', netDown: 'GRAVITY_PULL', netUp: 'ESCAPE_VEL' },
    storageLabels: { srv1: 'INNER_CORE', tv: 'MOON_ARCHIVE', movies: 'RING_SYSTEM', musicPhotos: 'SIGNAL_ARRAY', srv2: 'OUTER_BODY' },
    widgetLabels: {
      chat: '◆ GROUND_CONTROL ◆ Mission_Chat', lottery: '◆ ASTEROID_DRIFT ◆ Random_Orbits', stocks: '◆ MINERAL_EXCHANGE ◆ Resource_Markets', spotify: '◆ COSMIC_HUM ◆ Orbital_Frequency',
      dockerHealth: '◆ ORBIT_STABILITY ◆ 7d_Trajectory', quote: '◆ ASTRONOMERS_NOTE ◆ Celestial_Wisdom', freshRss: '◆ TELEMETRY_FEED ◆ Orbital_News', weather: '◆ ATMOSPHERE ◆ Surface_Conditions',
      vpnStatus: '◆ MAGNETOSPHERE ◆ Shield_Status', dnsLeak: '◆ RADIATION_SCAN ◆ Belt_Integrity', quickLaunch: '◆ Launch_Pad ◆ Quick_Orbit', airQuality: '◆ EXOSPHERE ◆ Gas_Composition',
      plexLibrary: '◆ SURVEY_DATA ◆ Catalog_Counts', plexSessions: '◆ ACTIVE_PROBES ◆ Scanning', plexOnDeck: '◆ LAUNCH_QUEUE ◆ Pending_Missions',
      cronMonitor: '◆ ORBITAL_CYCLE ◆', lanPresence: '◆ SATELLITE_COUNT ◆', onThisDay: '◆ EPOCH_LOG ◆',
    },
    headerTitle: { main: 'ORBIT_VIEW', accent: '.PLN' },
    headerSubtitle: 'Orbit 4 ◆ Sol {date} ◆ Planetary Command Center',
    gridTitle: '◆ SOLAR SYSTEM — LIVE TELEMETRY ◆',
    jablonskiLabels: { emission: 'GRAVITY ◆ PULL', excitation: 'GRAVITY ◆ ESCAPE' },
    CpuDiagram: PlanetaryCore,
    RamDiagram: GasGiantBands,
    DownloadDiagram: OrbitalTransfer,
    UploadDiagram: OrbitalTransfer,
    ServerStorageDiagram: GeologicalStrata,
    MediaStorageDiagram: PlanetaryBase,
    SpeedtestDiagram: SeismographTrace,
    detailTransform: makeDetailTransform(PLANET_OVERLAY, PLANET_LABELS, {
      symbolField: 'planetName?.[0]', nameField: 'planetName', subtitleField: 'orbitalClass', subtitleExtra: 'atmosphere',
      metaLabel1: 'ORBITAL_PARAMETERS', metaField1: 'atmosphere',
      metaLabel2: 'ORBITAL_STATES ◆ [ORBITING | ACTIVE | STORM | DARK_SIDE]', metaField2: 'surfaceTemp',
      statusLabels: ['ORBITING', 'ACTIVE', 'STORM', 'DARK_SIDE'],
    }),
    cardTransform: makeCardTransform(PLANET_OVERLAY, {
      topLeftField: 'planetName?.[0]', centerField: 'orbitalClass', nameField: 'planetName', bottomField: 'atmosphere',
    }),
  },
  WEATHER: {
    Grid: WeatherGrid,
    labels: WEATHER_LABELS,
    tickerLabels: { films: ['STORM_REPORT', 'Cleared_Films'], series: ['FORECAST_LOG', 'Tracked_Series'], music: ['FREQUENCY_SCAN', 'Clear_Albums'] },
    logTitle: 'WEATHER_LOG ◆ Atmospheric_Event_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Station_Alpha', storage: '◆ Data_Silos ◆ Barometric_Fill', srv2: '◆ SRV-2 ◆ Station_Bravo' },
    glancesLabels: { cpu: 'PRESSURE_hPa', ram: 'HUMIDITY_%', netDown: 'PRECIP_IN', netUp: 'EVAP_OUT' },
    storageLabels: { srv1: 'STATION_A', tv: 'RADAR_BANK', movies: 'SAT_IMAGERY', musicPhotos: 'FREQ_LOG', srv2: 'STATION_B' },
    widgetLabels: {
      chat: '◆ FORECAST_AI ◆ Weather_Chat', lottery: '◆ CHAOS_MODEL ◆ Random_Patterns', stocks: '◆ COMMODITY_INDEX ◆ Crop_Markets', spotify: '◆ STORM_TRACK ◆ Ambient_Sounds',
      dockerHealth: '◆ BAROMETER ◆ 7d_Pressure', quote: '◆ ALMANAC ◆ Weather_Lore', freshRss: '◆ ADVISORY_FEED ◆ NWS_Bulletins', weather: '◆ SYNOPTIC ◆ Surface_Analysis',
      vpnStatus: '◆ ENCRYPTION ◆ Secure_Channel', dnsLeak: '◆ DOPPLER_SCAN ◆ Interference_Check', quickLaunch: '◆ Radar_Map ◆ Quick_Scan', airQuality: '◆ PARTICULATE ◆ AQI_Reading',
      plexLibrary: '◆ ARCHIVE ◆ Historical_Records', plexSessions: '◆ ACTIVE_FRONTS ◆ Tracking', plexOnDeck: '◆ WATCH_BOX ◆ Pending_Alerts',
      cronMonitor: '◆ OBSERVATION_CYCLE ◆', lanPresence: '◆ SENSOR_NETWORK ◆', onThisDay: '◆ HISTORICAL_WEATHER ◆',
    },
    headerTitle: { main: 'SYNOPTIC', accent: '.WX' },
    headerSubtitle: 'Zone 4 ◆ UTC {date} ◆ Weather Operations Center',
    gridTitle: '◆ SYNOPTIC ANALYSIS — SURFACE ◆',
    jablonskiLabels: { emission: 'PRECIP ◆ INFLOW', excitation: 'PRECIP ◆ OUTFLOW' },
    CpuDiagram: StormCellMonitor,
    RamDiagram: BarometerDial,
    DownloadDiagram: PrecipRadar,
    UploadDiagram: PrecipRadar,
    ServerStorageDiagram: BarometerColumn,
    MediaStorageDiagram: CloudFormation,
    SpeedtestDiagram: BarographTrace,
    detailTransform: makeDetailTransform(WEATHER_OVERLAY, WEATHER_LABELS, {
      symbolField: 'weatherSymbol', nameField: 'phenomena', subtitleField: 'stationId', subtitleExtra: 'barometric',
      metaLabel1: 'WEATHER_PARAMETERS', metaField1: 'weatherType',
      metaLabel2: 'FORECAST_STATES ◆ [CLEAR | ADVISORY | WARNING | BLACKOUT]', metaField2: 'windSpeed', metaField2Prefix: 'Wind', statusLabels: ['CLEAR', 'ADVISORY', 'WARNING', 'BLACKOUT'],
    }),
    cardTransform: makeCardTransform(WEATHER_OVERLAY, {
      topLeftField: 'stationId', centerField: 'weatherSymbol', nameField: 'phenomena', bottomField: 'weatherType',
    }),
  },
  AIRPORT: {
    Grid: AirportGrid,
    labels: AIRPORT_LABELS,
    tickerLabels: { films: ['CARGO_MANIFEST', 'Landed_Films'], series: ['FLIGHT_LOG', 'Airborne_Series'], music: ['BOARDING_CALL', 'Cleared_Albums'] },
    logTitle: 'FLIGHT_LOG ◆ Air_Traffic_Control_Feed',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Terminal_A', storage: '◆ Cargo_Hold ◆ Bay_Capacity', srv2: '◆ SRV-2 ◆ Terminal_B' },
    glancesLabels: { cpu: 'ENGINE_THRUST', ram: 'FUEL_LEVEL', netDown: 'ARRIVALS', netUp: 'DEPARTURES' },
    storageLabels: { srv1: 'TERMINAL_A', tv: 'GATE_BANK', movies: 'CARGO_BAY', musicPhotos: 'FREQ_LOG', srv2: 'TERMINAL_B' },
    widgetLabels: {
      chat: '◆ ATC_COMM ◆ Tower_Chat', lottery: '◆ GATE_LOTTERY ◆ Random_Assignments', stocks: '◆ FUEL_INDEX ◆ Commodity_Markets', spotify: '◆ LOUNGE_MUSIC ◆ Terminal_Audio',
      dockerHealth: '◆ FLIGHT_STATUS ◆ 7d_Departures', quote: '◆ PILOTS_BRIEF ◆ Aviation_Wisdom', freshRss: '◆ NOTAM_FEED ◆ Aviation_Alerts', weather: '◆ METAR ◆ Field_Conditions',
      vpnStatus: '◆ RADAR_CLOAK ◆ Transponder_Status', dnsLeak: '◆ IFF_SCAN ◆ Squawk_Check', quickLaunch: '◆ Gate_Map ◆ Quick_Board', airQuality: '◆ CABIN_PRESSURE ◆ Air_Quality',
      plexLibrary: '◆ MANIFEST ◆ Passenger_Counts', plexSessions: '◆ ACTIVE_FLIGHTS ◆ In_Transit', plexOnDeck: '◆ BOARDING_QUEUE ◆ Pending_Flights',
      cronMonitor: '◆ SCHEDULE_CYCLE ◆', lanPresence: '◆ AIRCRAFT_ON_GROUND ◆', onThisDay: '◆ FLIGHT_LOG ◆',
    },
    headerTitle: { main: 'FLIGHT_OPS', accent: '.ATC' },
    headerSubtitle: 'Terminal 4 ◆ Schedule {date} ◆ Air Traffic Control',
    gridTitle: '◆ DEPARTURES ◆',
    jablonskiLabels: { emission: 'TRAFFIC ◆ ARRIVALS', excitation: 'TRAFFIC ◆ DEPARTURES' },
    CpuDiagram: RunwayApproach,
    RamDiagram: BaggageCarousel,
    DownloadDiagram: FlightBoard,
    UploadDiagram: FlightBoard,
    ServerStorageDiagram: ControlTower,
    MediaStorageDiagram: TerminalMap,
    SpeedtestDiagram: RadarBlipTrail,
    detailTransform: makeDetailTransform(AIRPORT_OVERLAY, AIRPORT_LABELS, {
      symbolField: 'icao', nameField: 'flightDesig', subtitleField: 'icao', subtitleExtra: 'gateInfo',
      metaLabel1: 'FLIGHT_PARAMETERS', metaField1: 'terminal',
      metaLabel2: 'FLIGHT_STATES ◆ [TAXIING | AIRBORNE | HOLDING | GROUNDED]', metaField2: 'runway',
      statusLabels: ['TAXIING', 'AIRBORNE', 'HOLDING', 'GROUNDED'],
    }),
    cardTransform: makeCardTransform(AIRPORT_OVERLAY, {
      topLeftField: 'icao', centerField: 'icao', nameField: 'flightDesig', bottomField: 'gateInfo',
    }),
  },
  DINO: {
    Grid: DinoGrid,
    labels: DINO_LABELS,
    tickerLabels: { films: ['FOSSIL_RECORD', 'Excavated_Films'], series: ['EPOCH_LOG', 'Traced_Series'], music: ['RESONANCE_SCAN', 'Preserved_Albums'] },
    logTitle: 'FOSSIL_LOG ◆ Prehistoric_Activity_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Dig_Site_Alpha', storage: '◆ Bone_Archive ◆ Strata_Fill', srv2: '◆ SRV-2 ◆ Dig_Site_Beta' },
    glancesLabels: { cpu: 'SEISMIC_LOAD', ram: 'SEDIMENT_LVL', netDown: 'FOSSIL_IN', netUp: 'SAMPLE_OUT' },
    storageLabels: { srv1: 'SITE_ALPHA', tv: 'FOSSIL_VAULT', movies: 'SPECIMEN_HALL', musicPhotos: 'AUDIO_ARCHIVE', srv2: 'SITE_BETA' },
    widgetLabels: {
      chat: '◆ FIELD_RADIO ◆ Expedition_Chat', lottery: '◆ MUTATION_DICE ◆ Random_Traits', stocks: '◆ FOSSIL_MARKET ◆ Specimen_Exchange', spotify: '◆ JURASSIC_RADIO ◆ Ambient_Sounds',
      dockerHealth: '◆ GEOLOGICAL_SURVEY ◆ 7d_Seismic', quote: '◆ DARWIN_NOTES ◆ Evolutionary_Wisdom', freshRss: '◆ EXCAVATION_FEED ◆ Dig_Reports', weather: '◆ PALEOCLIMATE ◆ Ancient_Conditions',
      vpnStatus: '◆ CAMOUFLAGE ◆ Stealth_Status', dnsLeak: '◆ PERIMETER_SCAN ◆ Fence_Integrity', quickLaunch: '◆ Field_Kit ◆ Quick_Excavate', airQuality: '◆ MESOZOIC_AIR ◆ Prehistoric_AQI',
      plexLibrary: '◆ FOSSIL_RECORD ◆ Specimen_Counts', plexSessions: '◆ ACTIVE_DIGS ◆ Excavating', plexOnDeck: '◆ PREP_LAB ◆ Pending_Analysis',
      cronMonitor: '◆ EROSION_CYCLE ◆', lanPresence: '◆ HERD_TRACKER ◆', onThisDay: '◆ EXTINCTION_LOG ◆',
    },
    headerTitle: { main: 'FOSSIL_DB', accent: '.GEO' },
    headerSubtitle: 'Stratum 4 ◆ Epoch {date} ◆ Paleontology Field Lab',
    gridTitle: '◆ GEOLOGICAL RECORD — MESOZOIC ERA ◆',
    jablonskiLabels: { emission: 'SEISMIC ◆ INTAKE', excitation: 'SEISMIC ◆ SAMPLE_OUT' },
    detailTransform: makeDetailTransform(DINO_OVERLAY, DINO_LABELS, {
      symbolField: 'cladeAbbr', nameField: 'species', subtitleField: 'cladeAbbr', subtitleExtra: 'epoch',
      metaLabel1: 'SPECIMEN_PARAMETERS', metaField1: 'clade',
      metaLabel2: 'ACTIVITY_STATES ◆ [ACTIVE | DORMANT | MIGRATING | EXTINCT]', metaField2: 'region',
      statusLabels: ['ACTIVE', 'DORMANT', 'MIGRATING', 'EXTINCT'],
    }),
    CpuDiagram: GeologicalCoreSample,
    RamDiagram: GeologicalCoreSample,
    DownloadDiagram: SeismicWaveform,
    UploadDiagram: SeismicWaveform,
    ServerStorageDiagram: StratigraphicColumn,
    MediaStorageDiagram: StratigraphicColumn,
    SpeedtestDiagram: CarbonDatingTrace,
    cardTransform: makeCardTransform(DINO_OVERLAY, {
      topLeftField: 'cladeAbbr', centerField: 'cladeAbbr', nameField: 'species', bottomField: 'epoch',
    }),
  },
  NOIR: {
    Grid: NoirGrid,
    labels: NOIR_LABELS,
    tickerLabels: { films: ['CASE_FILES', 'Acquired_Films'], series: ['SURVEILLANCE_LOG', 'Tracked_Series'], music: ['WIRE_TAP', 'Lifted_Albums'] },
    logTitle: 'CASE_LOG ◆ Detective_Bureau_Register',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Precinct_One', storage: '◆ Evidence_Locker ◆ Case_Capacity', srv2: '◆ SRV-2 ◆ Precinct_Two' },
    glancesLabels: { cpu: 'HEAT_LEVEL', ram: 'CASE_LOAD', netDown: 'TIPS_IN', netUp: 'LEADS_OUT' },
    storageLabels: { srv1: 'PRECINCT', tv: 'FILM_VAULT', movies: 'EVIDENCE_ROOM', musicPhotos: 'WIRETAP_REEL', srv2: 'SAFEHOUSE' },
    widgetLabels: {
      chat: '◆ INFORMANT ◆ Back_Channel', lottery: '◆ NUMBERS_GAME ◆ Street_Odds', stocks: '◆ BLACK_MARKET ◆ Underground_Rates', spotify: '◆ JUKEBOX ◆ Smoky_Bar_Radio',
      dockerHealth: '◆ STAKEOUT_LOG ◆ 7d_Surveillance', quote: '◆ HARD_BOILED ◆ Street_Wisdom', freshRss: '◆ TIPOFF_WIRE ◆ Crime_Beat', weather: '◆ FOG_REPORT ◆ City_Conditions',
      vpnStatus: '◆ ALIAS ◆ Cover_Identity', dnsLeak: '◆ TAIL_CHECK ◆ Blown_Cover', quickLaunch: '◆ Case_Board ◆ Quick_Dispatch', airQuality: '◆ SMOG_INDEX ◆ City_Air',
      plexLibrary: '◆ CASE_FILES ◆ Open_Cases', plexSessions: '◆ ACTIVE_TAILS ◆ Surveillance', plexOnDeck: '◆ COLD_CASES ◆ Reopened',
      cronMonitor: '◆ PATROL_SCHEDULE ◆', lanPresence: '◆ KNOWN_ASSOCIATES ◆', onThisDay: '◆ COLD_CASE_FILE ◆',
    },
    headerTitle: { main: 'CASE_FILE', accent: '.DET' },
    headerSubtitle: 'District 4 ◆ Case {date} ◆ Detective Bureau HQ',
    gridTitle: '◆ CASE ROOM — RESTRICTED ACCESS ◆',
    jablonskiLabels: { emission: 'INTEL ◆ TIPS_IN', excitation: 'INTEL ◆ LEADS_OUT' },
    detailTransform: makeDetailTransform(NOIR_OVERLAY, NOIR_LABELS, {
      symbolField: 'alias?.[0]', nameField: 'alias', subtitleField: 'caseNum', subtitleExtra: 'rank',
      metaLabel1: 'CASE_PARAMETERS', metaField1: 'bureau',
      metaLabel2: 'OPERATIVE_STATES ◆ [ACTIVE | TAILING | COMPROMISED | GONE_DARK]', metaField2: 'specialty',
      statusLabels: ['ACTIVE', 'TAILING', 'COMPROMISED', 'GONE_DARK'],
    }),
    CpuDiagram: RevolverCylinder,
    RamDiagram: RevolverCylinder,
    DownloadDiagram: BourbonGlass,
    UploadDiagram: BourbonGlass,
    ServerStorageDiagram: FileCabinet,
    MediaStorageDiagram: FileCabinet,
    SpeedtestDiagram: SmokeTrailSparkline,
    cardTransform: makeCardTransform(NOIR_OVERLAY, {
      topLeftField: 'caseNum', centerField: 'caseNum', nameField: 'alias', bottomField: 'rank',
    }),
  },
  VINYL: {
    Grid: VinylGrid,
    labels: VINYL_LABELS,
    tickerLabels: { films: ['WAX_MANIFEST', 'Pressed_Films'], series: ['SIDE_B_LOG', 'Tracked_Series'], music: ['NEEDLE_DROP', 'Spun_Albums'] },
    logTitle: 'WAX_LOG ◆ Vinyl_Rotation_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Turntable_A', storage: '◆ Record_Crate ◆ Shelf_Capacity', srv2: '◆ SRV-2 ◆ Turntable_B' },
    glancesLabels: { cpu: 'RPM', ram: 'GROOVE_DEPTH', netDown: 'NEEDLE_IN', netUp: 'SIGNAL_OUT' },
    storageLabels: { srv1: 'DECK_A', tv: 'VIDEO_SHELF', movies: 'FILM_RACK', musicPhotos: 'PHOTO_SLEEVE', srv2: 'DECK_B' },
    widgetLabels: {
      chat: '◆ DJ_BOOTH ◆ Request_Line', lottery: '◆ CRATE_DIG ◆ Random_Picks', stocks: '◆ RECORD_EXCHANGE ◆ Vinyl_Market', spotify: '◆ NOW_SPINNING ◆ Live_Feed',
      dockerHealth: '◆ NEEDLE_HOURS ◆ 7d_Playtime', quote: '◆ LINER_NOTES ◆ Album_Wisdom', freshRss: '◆ PRESS_RELEASE ◆ Label_News', weather: '◆ HUMIDITY_GAUGE ◆ Storage_Conditions',
      vpnStatus: '◆ BOOTLEG_SHIELD ◆ Copy_Protection', dnsLeak: '◆ GROOVE_CHECK ◆ Skip_Detection', quickLaunch: '◆ Crate_Index ◆ Quick_Spin', airQuality: '◆ DUST_LEVEL ◆ Static_Count',
      plexLibrary: '◆ CATALOG ◆ Collection_Counts', plexSessions: '◆ NOW_PLAYING ◆ Active_Spins', plexOnDeck: '◆ UP_NEXT ◆ Queued_Tracks',
      cronMonitor: '◆ ROTATION_SCHEDULE ◆', lanPresence: '◆ LISTENERS ◆', onThisDay: '◆ THIS_DAY_IN_MUSIC ◆',
    },
    headerTitle: { main: 'WAX_ARCHIVE', accent: '.LP' },
    headerSubtitle: 'Side A ◆ Pressing {date} ◆ Record Store Operations',
    gridTitle: '◆ RECORD CRATE ◆',
    jablonskiLabels: { emission: 'NEEDLE ◆ INPUT', excitation: 'NEEDLE ◆ OUTPUT' },
    detailTransform: makeDetailTransform(VINYL_OVERLAY, VINYL_LABELS, {
      symbolField: 'catalogNum', nameField: 'artist',
      subtitleFn: (o, el) => `${o?.catalogNum ?? el.symbol} ◆ ${o?.rpm ?? ''} RPM`, metaLabel1: 'RECORD_PARAMETERS',
      metaField1: 'genre', metaLabel2: 'PLAYBACK_STATES ◆ [SPINNING | CUED | WARPED | SCRATCHED]', metaField2: 'label',
      metaField2Prefix: 'Label', statusLabels: ['SPINNING', 'CUED', 'WARPED', 'SCRATCHED'],
    }),
    cardTransform: makeCardTransform(VINYL_OVERLAY, {
      topLeftField: 'catalogNum', centerField: 'catalogNum', nameField: 'artist', bottomField: 'genre',
    }),
    CpuDiagram: VUMeter,
    RamDiagram: VUMeter,
    DownloadDiagram: SoundboardFader,
    UploadDiagram: SoundboardFader,
    ServerStorageDiagram: TurntableRPM,
    MediaStorageDiagram: TurntableRPM,
    SpeedtestDiagram: WaveformEQ,
  },
  BAND: {
    Grid: BandGrid,
    labels: BAND_LABELS,
    tickerLabels: { films: ['SETLIST_FILMS', 'Acquired_Films'], series: ['TOUR_ARCHIVE', 'Tracked_Series'], music: ['VAULT_RELEASES', 'Spun_Albums'] },
    logTitle: 'SETLIST_LOG ◆ Tour_Activity_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Main_Stage', storage: '◆ Gear_Vault ◆ Rack_Capacity', srv2: '◆ SRV-2 ◆ Side_Stage' },
    glancesLabels: { cpu: 'AMP_WATTS', ram: 'MIX_LEVEL', netDown: 'MIC_INPUT', netUp: 'PA_OUTPUT' },
    storageLabels: { srv1: 'MAIN_AMP', tv: 'VIDEO_WALL', movies: 'FOOTAGE_VAULT', musicPhotos: 'MERCH_CLOSET', srv2: 'MONITOR_AMP' },
    CpuDiagram: AmpGauge,
    RamDiagram: AmpGauge,
    DownloadDiagram: MixerChannel,
    UploadDiagram: MixerChannel,
    ServerStorageDiagram: StageLightRig,
    MediaStorageDiagram: StageLightRig,
    SpeedtestDiagram: SoundwaveSparkline,
    widgetLabels: {
      chat: '◆ INTERCOM ◆ Backstage_Chat', lottery: '◆ SETLIST_SHUFFLE ◆ Random_Tracks', stocks: '◆ MERCH_TABLE ◆ Tour_Revenue', spotify: '◆ STAGE_MONITOR ◆ Live_Feed',
      dockerHealth: '◆ TOUR_SCHEDULE ◆ 7d_Gigs', quote: '◆ ROCK_WISDOM ◆ Backstage_Quote', freshRss: '◆ MUSIC_PRESS ◆ Industry_Feed', weather: '◆ OUTDOOR_STAGE ◆ Weather_Report',
      vpnStatus: '◆ SOUNDCHECK ◆ Channel_Secure', dnsLeak: '◆ FEEDBACK_SCAN ◆ Ground_Loop_Check', quickLaunch: '◆ Pedal_Board ◆ Quick_Switch', airQuality: '◆ VENUE_AIR ◆ Smoke_Level',
      plexLibrary: '◆ DISCOGRAPHY ◆ Album_Counts', plexSessions: '◆ LIVE_SET ◆ Now_Playing', plexOnDeck: '◆ ENCORE_LIST ◆ Queued_Songs',
      cronMonitor: '◆ REHEARSAL_SCHEDULE ◆', lanPresence: '◆ AUDIENCE_COUNT ◆', onThisDay: '◆ ON_THIS_DATE_IN_ROCK ◆',
    },
    headerTitle: { main: 'TOUR_BOARD', accent: '.GIG' },
    headerSubtitle: 'Stage 4 ◆ Tour {date} ◆ Band Operations Center',
    gridTitle: '◆ AUDIENCE ◆',
    gridSubtitle: '◆ BACKLINE ◆',
    jablonskiLabels: { emission: 'MIC ◆ INPUT', excitation: 'PA ◆ OUTPUT' },
    detailTransform: makeDetailTransform(BAND_OVERLAY, BAND_LABELS, {
      symbolField: 'role?.[0]', nameField: 'bandName', subtitleField: 'role', subtitleExtra: 'era',
      metaLabel1: 'BAND_PARAMETERS', metaField1: 'instrument',
      metaLabel2: 'PERFORMANCE_STATES ◆ [TOURING | REHEARSING | RECORDING | DISBANDED]', metaField2: 'role',
      statusLabels: ['TOURING', 'REHEARSING', 'RECORDING', 'DISBANDED'],
    }),
    cardTransform: makeCardTransform(BAND_OVERLAY, {
      topLeftFn: (o, el) => o?.role?.[0] ?? String(el.z), fallback: 'z', nameField: 'bandName', bottomField: 'instrument',
    }),
  },
  PARTICLE: {
    Grid: ParticleGrid,
    labels: PARTICLE_LABELS,
    tickerLabels: { films: ['COLLIDER_DATA', 'Captured_Films'], series: ['DECAY_CHAIN', 'Tracked_Series'], music: ['FREQUENCY_SCAN', 'Sampled_Albums'] },
    logTitle: 'COLLIDER_LOG ◆ Quantum_Event_Register',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Detector_Array_A', storage: '◆ Data_Rings ◆ Buffer_Capacity', srv2: '◆ SRV-2 ◆ Detector_Array_B' },
    glancesLabels: { cpu: 'BEAM_ENERGY', ram: 'LUMINOSITY', netDown: 'COLLISION_IN', netUp: 'DECAY_OUT' },
    storageLabels: { srv1: 'DETECTOR_A', tv: 'EVENT_BUFFER', movies: 'COLLISION_LOG', musicPhotos: 'SPECTRUM_DATA', srv2: 'DETECTOR_B' },
    widgetLabels: {
      chat: '◆ THEORY_LINK ◆ Quantum_Chat', lottery: '◆ DECAY_DICE ◆ Random_Particles', stocks: '◆ ENERGY_MARKET ◆ Fuel_Costs', spotify: '◆ BACKGROUND_RADIATION ◆ Cosmic_Hum',
      dockerHealth: '◆ ACCELERATOR ◆ 7d_Beam_Status', quote: '◆ FEYNMAN_QUOTE ◆ Quantum_Wisdom', freshRss: '◆ PREPRINT_FEED ◆ arXiv_Alerts', weather: '◆ COSMIC_RAY ◆ Flux_Report',
      vpnStatus: '◆ CONTAINMENT ◆ Field_Integrity', dnsLeak: '◆ LEPTON_SCAN ◆ Charge_Parity', quickLaunch: '◆ Control_Panel ◆ Quick_Collide', airQuality: '◆ CLEAN_ROOM ◆ Particulate_Level',
      plexLibrary: '◆ EVENT_DATA ◆ Collision_Counts', plexSessions: '◆ ACTIVE_BEAMS ◆ Colliding', plexOnDeck: '◆ RUN_QUEUE ◆ Pending_Runs',
      cronMonitor: '◆ BEAM_SCHEDULE ◆', lanPresence: '◆ DETECTORS_ONLINE ◆', onThisDay: '◆ DISCOVERY_LOG ◆',
    },
    headerTitle: { main: 'COLLIDER', accent: '.QCD' },
    headerSubtitle: 'Ring 4 ◆ Run {date} ◆ Particle Physics Control',
    gridTitle: '◆ BUBBLE CHAMBER — EVENT DISPLAY ◆',
    jablonskiLabels: { emission: 'BEAM ◆ COLLISION', excitation: 'BEAM ◆ DECAY' },
    detailTransform: makeDetailTransform(PARTICLE_OVERLAY, PARTICLE_LABELS, {
      symbolField: 'symbol', nameField: 'particleName', subtitleField: 'symbol', subtitleLiteral: 'charge',
      subtitleExtra: 'charge', metaLabel1: 'PARTICLE_PARAMETERS', metaField1: 'mass',
      metaLabel2: 'QUANTUM_STATES ◆ [STABLE | EXCITED | DECAYING | ANNIHILATED]', metaField2: 'spin',
      metaField2Prefix: 'Spin', statusLabels: ['STABLE', 'EXCITED', 'DECAYING', 'ANNIHILATED'],
    }),
    cardTransform: makeCardTransform(PARTICLE_OVERLAY, {
      topLeftField: 'symbol', centerField: 'symbol', nameField: 'particleName', bottomField: 'charge',
    }),
    CpuDiagram: ColliderRing,
    RamDiagram: ColliderRing,
    DownloadDiagram: DecayChain,
    UploadDiagram: DecayChain,
    ServerStorageDiagram: LuminosityMeter,
    MediaStorageDiagram: LuminosityMeter,
    SpeedtestDiagram: ScintillatorTrace,
  },
  GLOBE: {
    Grid: GlobeGrid,
    labels: GLOBE_LABELS,
    tickerLabels: { films: ['EXPEDITION_LOG', 'Mapped_Films'], series: ['TERRAIN_ARCHIVE', 'Surveyed_Series'], music: ['SIGNAL_STATIONS', 'Received_Albums'] },
    logTitle: 'GEO_LOG ◆ Terrain_Activity_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Base_Camp_Alpha', storage: '◆ Supply_Cache ◆ Terrain_Coverage', srv2: '◆ SRV-2 ◆ Base_Camp_Bravo' },
    glancesLabels: { cpu: 'ELEVATION', ram: 'PROVISIONS', netDown: 'RECON_IN', netUp: 'DISPATCH_OUT' },
    storageLabels: { srv1: 'BASE_ALPHA', tv: 'MAP_ROOM', movies: 'EXPEDITION_LOG', musicPhotos: 'FIELD_RECORDING', srv2: 'BASE_BRAVO' },
    widgetLabels: {
      chat: '◆ FIELD_RADIO ◆ Expedition_Chat', lottery: '◆ COMPASS_SPIN ◆ Random_Bearing', stocks: '◆ TRADE_POST ◆ Commodity_Prices', spotify: '◆ WORLD_MUSIC ◆ Regional_Radio',
      dockerHealth: '◆ EXPEDITION_LOG ◆ 7d_Progress', quote: '◆ EXPLORERS_NOTE ◆ Cartographic_Wisdom', freshRss: '◆ DISPATCH_FEED ◆ Field_Reports', weather: '◆ TERRAIN_WEATHER ◆ Field_Conditions',
      vpnStatus: '◆ CONCEALMENT ◆ Route_Encrypted', dnsLeak: '◆ COMPASS_CHECK ◆ Bearing_Verified', quickLaunch: '◆ Map_Table ◆ Quick_Navigate', airQuality: '◆ ALTITUDE_AIR ◆ Elevation_AQI',
      plexLibrary: '◆ SURVEY_INDEX ◆ Region_Counts', plexSessions: '◆ ACTIVE_EXPEDITIONS ◆ In_Field', plexOnDeck: '◆ STAGING_AREA ◆ Pending_Missions',
      cronMonitor: '◆ SURVEY_SCHEDULE ◆', lanPresence: '◆ FIELD_TEAMS ◆', onThisDay: '◆ EXPLORATION_LOG ◆',
    },
    headerTitle: { main: 'TERRA_MAP', accent: '.GEO' },
    headerSubtitle: 'Latitude 4 ◆ Survey {date} ◆ Expedition Command',
    gridTitle: '◆ MERCATOR PROJECTION — WGS84 ◆',
    jablonskiLabels: { emission: 'RECON ◆ INBOUND', excitation: 'RECON ◆ OUTBOUND' },
    detailTransform: makeDetailTransform(GLOBE_OVERLAY, GLOBE_LABELS, {
      symbolField: 'region?.[0]', nameField: 'region', subtitleField: 'coordinates', subtitleExtra: 'climate',
      metaLabel1: 'GEO_PARAMETERS', metaField1: 'elevation',
      metaLabel2: 'TERRAIN_STATES ◆ [STABLE | MONITORING | ALERT | OFFLINE]', metaField2: 'climate',
      statusLabels: ['STABLE', 'MONITORING', 'ALERT', 'OFFLINE'],
    }),
    cardTransform: makeCardTransform(GLOBE_OVERLAY, {
      topLeftField: 'coordinates', centerField: 'coordinates', nameField: 'region', bottomField: 'climate',
    }),
    CpuDiagram: TectonicPlate,
    RamDiagram: TectonicPlate,
    DownloadDiagram: OceanCurrent,
    UploadDiagram: OceanCurrent,
    ServerStorageDiagram: IceCoreSample,
    MediaStorageDiagram: IceCoreSample,
    SpeedtestDiagram: GlobeSeismographTrace,
  },
  FORGE: {
    Grid: ForgeGrid,
    labels: FORGE_LABELS,
    tickerLabels: { films: ['SMELTER_YIELDS', 'Forged_Films'], series: ['FURNACE_ARCHIVE', 'Tempered_Series'], music: ['HAMMER_RECORDS', 'Cast_Albums'] },
    logTitle: 'FORGE_LOG ◆ Workshop_Heat_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Primary_Furnace', storage: '◆ Ore_Stockpile ◆ Ingot_Capacity', srv2: '◆ SRV-2 ◆ Secondary_Furnace' },
    glancesLabels: { cpu: 'FURNACE_TEMP', ram: 'CRUCIBLE_LVL', netDown: 'ORE_IN', netUp: 'SLAG_OUT' },
    storageLabels: { srv1: 'MAIN_HEARTH', tv: 'PATTERN_VAULT', movies: 'MOLD_ARCHIVE', musicPhotos: 'BELLOWS_LOG', srv2: 'AUX_HEARTH' },
    widgetLabels: {
      chat: '◆ APPRENTICE ◆ Workshop_Chat', lottery: '◆ ALLOY_DICE ◆ Random_Metals', stocks: '◆ METAL_EXCHANGE ◆ Ore_Prices', spotify: '◆ ANVIL_RHYTHM ◆ Forge_Beats',
      dockerHealth: '◆ FIRE_WATCH ◆ 7d_Heat_Log', quote: '◆ BLACKSMITH_CREED ◆ Forge_Wisdom', freshRss: '◆ TRADE_GAZETTE ◆ Smithing_News', weather: '◆ WIND_GAUGE ◆ Forge_Draft',
      vpnStatus: '◆ QUENCH_TANK ◆ Cooling_Status', dnsLeak: '◆ TEMPER_CHECK ◆ Steel_Integrity', quickLaunch: '◆ Tool_Wall ◆ Quick_Forge', airQuality: '◆ CHIMNEY_DRAW ◆ Smoke_Level',
      plexLibrary: '◆ PATTERN_BOOK ◆ Design_Counts', plexSessions: '◆ ACTIVE_HEATS ◆ Smelting', plexOnDeck: '◆ QUENCH_QUEUE ◆ Cooling',
      cronMonitor: '◆ SHIFT_SCHEDULE ◆', lanPresence: '◆ WORKERS_PRESENT ◆', onThisDay: '◆ FORGE_CHRONICLE ◆',
    },
    headerTitle: { main: 'ANVIL_OPS', accent: '.FRG' },
    headerSubtitle: 'Hearth 4 ◆ Heat {date} ◆ Forge Operations Center',
    gridTitle: '◆ MASTER HEARTH ◆',
    gridSubtitle: '◆ WORKSHOP FLOOR ◆',
    jablonskiLabels: { emission: 'ORE ◆ INTAKE', excitation: 'SLAG ◆ OUTPUT' },
    CpuDiagram: BlastFurnace,
    RamDiagram: CrucibleGauge,
    DownloadDiagram: BellowsChimney,
    UploadDiagram: BellowsChimney,
    ServerStorageDiagram: IngotStack,
    MediaStorageDiagram: OreStockpile,
    SpeedtestDiagram: MoltenSparkline,
    detailTransform: makeDetailTransform(FORGE_OVERLAY, FORGE_LABELS, {
      symbolField: 'station?.[0]', nameField: 'station', subtitleField: 'tool', subtitleExtra: 'alloy',
      metaLabel1: 'FORGE_PARAMETERS', metaField1: 'temper',
      metaLabel2: 'HEAT_STATES ◆ [COLD_IRON | WARMING_UP | FORGE_HOT | SLAG_OVERFLOW]', metaField2: 'alloy', metaField2Prefix: 'Alloy', statusLabels: ['COLD_IRON', 'WARMING_UP', 'FORGE_HOT', 'SLAG_OVERFLOW'], serviceLinkColor: 'rgba(255,140,40,0.8)',
    }),
    cardTransform: makeCardTransform(FORGE_OVERLAY, {
      fallback: 'z', nameField: 'station', bottomField: 'alloy',
    }),
  },
  OCEAN: {
    Grid: OceanGrid,
    labels: OCEAN_LABELS,
    tickerLabels: { films: ['DEEP_SURVEY', 'Surveyed_Films'], series: ['CURRENT_ARCHIVE', 'Tracked_Series'], music: ['SONAR_PINGS', 'Captured_Albums'] },
    logTitle: 'OCEAN_LOG ◆ Bathymetric_Depth_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Research_Vessel', storage: '◆ Cargo_Tanks ◆ Ballast_Capacity', srv2: '◆ SRV-2 ◆ Submersible' },
    glancesLabels: { cpu: 'DEPTH_PRESSURE', ram: 'O2_RESERVE', netDown: 'SONAR_IN', netUp: 'SONAR_OUT' },
    storageLabels: { srv1: 'VESSEL', tv: 'SONAR_ROOM', movies: 'DIVE_FOOTAGE', musicPhotos: 'HYDROPHONE', srv2: 'SUBMERSIBLE' },
    widgetLabels: {
      chat: '◆ RADIO_ROOM ◆ Ship_Comm', lottery: '◆ DRIFT_BOTTLE ◆ Random_Coordinates', stocks: '◆ FISHERY_INDEX ◆ Cargo_Markets', spotify: '◆ WHALE_SONG ◆ Deep_Audio',
      dockerHealth: '◆ HULL_STATUS ◆ 7d_Dive_Log', quote: '◆ MARINERS_LOG ◆ Nautical_Wisdom', freshRss: '◆ MARITIME_FEED ◆ Coast_Alerts', weather: '◆ SEA_STATE ◆ Surface_Conditions',
      vpnStatus: '◆ SILENT_RUNNING ◆ Sonar_Cloak', dnsLeak: '◆ HULL_SCAN ◆ Pressure_Check', quickLaunch: '◆ Nav_Chart ◆ Quick_Dive', airQuality: '◆ O2_SCRUBBER ◆ Cabin_Air',
      plexLibrary: '◆ SPECIMEN_LOG ◆ Catch_Counts', plexSessions: '◆ ACTIVE_DIVES ◆ Submerged', plexOnDeck: '◆ DIVE_PLAN ◆ Pending_Dives',
      cronMonitor: '◆ TIDE_SCHEDULE ◆', lanPresence: '◆ VESSELS_NEARBY ◆', onThisDay: '◆ MARITIME_LOG ◆',
    },
    headerTitle: { main: 'DEPTH_CHART', accent: '.MAR' },
    headerSubtitle: 'Depth 4 ◆ Log {date} ◆ Maritime Operations Center',
    gridTitle: '◆ BATHYMETRIC DEPTH CHART ◆',
    jablonskiLabels: { emission: 'SONAR ◆ PING', excitation: 'SONAR ◆ RETURN' },
    CpuDiagram: SubmarineCrossSection,
    RamDiagram: BathyspherePorthole,
    DownloadDiagram: SubmarineCable,
    UploadDiagram: SubmarineCable,
    ServerStorageDiagram: CargoHold,
    MediaStorageDiagram: BallastCompartment,
    SpeedtestDiagram: SonarWaterfall,
    detailTransform: makeDetailTransform(OCEAN_OVERLAY, OCEAN_LABELS, {
      symbolField: 'zone?.[0]', nameField: 'zone', subtitleField: 'depth', subtitleExtra: 'species',
      metaLabel1: 'OCEAN_PARAMETERS', metaField1: 'depth',
      metaLabel2: 'CURRENT_STATES ◆ [CALM | RIPPLE | SURGE | MAELSTROM]', metaField2Fn: (o) => `Ecology: ${o.ecology} — ${o.species}`, statusLabels: ['CALM', 'RIPPLE', 'SURGE', 'MAELSTROM'],
    }),
    cardTransform: makeCardTransform(OCEAN_OVERLAY, {
      fallback: 'z', nameField: 'zone', bottomField: 'depth',
    }),
  },
  TACTICAL: {
    Grid: TacticalGrid,
    labels: TACTICAL_LABELS,
    tickerLabels: { films: ['INTEL_BRIEF', 'Recon_Films'], series: ['OPS_ARCHIVE', 'Tracked_Series'], music: ['COMMS_LOG', 'Signal_Albums'] },
    logTitle: 'SITREP_LOG ◆ Tactical_Operations_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Primary_FOB', storage: '◆ Supply_Depot ◆ Ammo_Capacity', srv2: '◆ SRV-2 ◆ Secondary_FOB' },
    glancesLabels: { cpu: 'CPU_LOAD', ram: 'MEM_ALLOC', netDown: 'DATA_IN', netUp: 'DATA_OUT' },
    storageLabels: { srv1: 'FOB_ALPHA', tv: 'INTEL_VAULT', movies: 'RECON_ARCHIVE', musicPhotos: 'COMMS_LOG', srv2: 'FOB_BRAVO' },
    widgetLabels: {
      chat: '◆ COMMAND ◆ Tactical_Comms', lottery: '◆ SORTIE ◆ Random_Ops', stocks: '◆ SUPPLY ◆ Resource_Prices', spotify: '◆ CADENCE ◆ March_Music',
      dockerHealth: '◆ PATROL_LOG ◆ 7d_Uptime', quote: '◆ ORDERS ◆ Command_Wisdom', freshRss: '◆ DISPATCH ◆ Intel_Feed', weather: '◆ WEATHER_OPS ◆ Field_Conditions',
      vpnStatus: '◆ SECURE_LINE ◆ Encrypted_Link', dnsLeak: '◆ OPSEC ◆ Leak_Check', quickLaunch: '◆ QUICK_DEPLOY ◆ Rapid_Access', airQuality: '◆ NBC ◆ Air_Quality',
      plexLibrary: '◆ ARSENAL ◆ Asset_Counts', plexSessions: '◆ ACTIVE_OPS ◆ Engagements', plexOnDeck: '◆ STAGING ◆ Ready_Queue',
      cronMonitor: '◆ WATCH_SCHEDULE ◆', lanPresence: '◆ PERSONNEL ◆', onThisDay: '◆ WAR_DIARY ◆',
    },
    headerTitle: { main: 'TACTICAL_OPS', accent: '.MIL' },
    headerSubtitle: 'Sector 7 ◆ Op {date} ◆ Tactical Operations Center',
    gridTitle: '◆ COMMAND CENTER ◆',
    gridSubtitle: '◆ TACTICAL MAP ◆',
    jablonskiLabels: { emission: 'INTEL ◆ INBOUND', excitation: 'ORDERS ◆ OUTBOUND' },
    detailTransform: makeDetailTransform(TACTICAL_OVERLAY, TACTICAL_LABELS, {
      symbolField: 'callsign?.[0]', nameField: 'callsign', subtitleField: 'role', subtitleExtra: 'sector',
      metaLabel1: 'CLEARANCE', metaField1: 'clearance',
      metaLabel2: 'STATUS ◆ [STANDBY | ALERT | ENGAGED | CRITICAL]', metaField2: 'sector', metaField2Prefix: 'Sector', statusLabels: ['STANDBY', 'ALERT', 'ENGAGED', 'CRITICAL'], serviceLinkColor: 'rgba(0,200,100,0.8)',
    }),
    cardTransform: makeCardTransform(TACTICAL_OVERLAY, {
      fallback: 'z', nameField: 'callsign', bottomField: 'sector',
    }),
  },
  STEAM: {
    Grid: SteamGrid,
    labels: STEAM_LABELS,
    tickerLabels: { films: ['BLUEPRINT_PRESS', 'Printed_Films'], series: ['PATENT_OFFICE', 'Filed_Series'], music: ['MUSIC_BOX', 'Wound_Albums'] },
    logTitle: 'STEAM_LOG ◆ Pressure_Gauge_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Main_Engine', storage: '◆ Coal_Bunker ◆ Fuel_Capacity', srv2: '◆ SRV-2 ◆ Aux_Engine' },
    glancesLabels: { cpu: 'BOILER_PSI', ram: 'WATER_LVL', netDown: 'STEAM_IN', netUp: 'EXHAUST_OUT' },
    storageLabels: { srv1: 'MAIN_BOILER', tv: 'PATTERN_DRUM', movies: 'BLUEPRINT_VAULT', musicPhotos: 'MUSIC_BOX_LOG', srv2: 'AUX_BOILER' },
    widgetLabels: {
      chat: '◆ TELEGRAPH ◆ Operator_Chat', lottery: '◆ LOTTERY_WHEEL ◆ Random_Patents', stocks: '◆ EXCHANGE ◆ Commodity_Prices', spotify: '◆ PHONOGRAPH ◆ Cylinder_Music',
      dockerHealth: '◆ BOILER_LOG ◆ 7d_Pressure', quote: '◆ INVENTOR ◆ Patent_Wisdom', freshRss: '◆ GAZETTE ◆ Telegraph_Feed', weather: '◆ BAROMETER ◆ Atmospheric',
      vpnStatus: '◆ CIPHER ◆ Encrypted_Line', dnsLeak: '◆ LEAK_CHECK ◆ Pipe_Integrity', quickLaunch: '◆ QUICK_VALVE ◆ Rapid_Access', airQuality: '◆ CHIMNEY ◆ Smoke_Level',
      plexLibrary: '◆ CATALOG ◆ Archive_Counts', plexSessions: '◆ ACTIVE_ENGINES ◆ Running', plexOnDeck: '◆ QUEUE ◆ Awaiting_Steam',
      cronMonitor: '◆ SHIFT_CLOCK ◆', lanPresence: '◆ CREW_MANIFEST ◆', onThisDay: '◆ PATENT_DIARY ◆',
    },
    headerTitle: { main: 'STEAM_WORKS', accent: '.VIC' },
    headerSubtitle: 'Engine Room ◆ Log {date} ◆ Steam Operations Bureau',
    gridTitle: '◆ BOILER ROOM ◆',
    gridSubtitle: '◆ PNEUMATIC NETWORK ◆',
    jablonskiLabels: { emission: 'COAL ◆ INPUT', excitation: 'STEAM ◆ OUTPUT' },
    detailTransform: makeDetailTransform(STEAM_OVERLAY, STEAM_LABELS, {
      symbolField: 'mechanism?.[0]', nameField: 'mechanism', subtitleField: 'gauge', subtitleExtra: 'material',
      metaLabel1: 'PATENT_NUMBER', metaField1: 'patent',
      metaLabel2: 'PRESSURE ◆ [IDLE | WARMING | FULL_STEAM | OVERPRESSURE]', metaField2: 'material', metaField2Prefix: 'Material', statusLabels: ['IDLE', 'WARMING', 'FULL_STEAM', 'OVERPRESSURE'], serviceLinkColor: 'rgba(184,134,11,0.8)',
    }),
    cardTransform: makeCardTransform(STEAM_OVERLAY, {
      fallback: 'z', nameField: 'mechanism', bottomField: 'material',
    }),
  },
  ARCADE: {
    Grid: ArcadeGrid,
    labels: ARCADE_LABELS,
    tickerLabels: { films: ['CUTSCENE_LOG', 'Unlocked_Films'], series: ['CAMPAIGN_MODE', 'Completed_Series'], music: ['SOUNDTRACK', 'BGM_Albums'] },
    logTitle: 'GAME_LOG ◆ Debug_Console',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Player_1', storage: '◆ Inventory ◆ Item_Capacity', srv2: '◆ SRV-2 ◆ Player_2' },
    glancesLabels: { cpu: 'CPU_CLOCK', ram: 'VRAM', netDown: 'DOWNLOAD', netUp: 'UPLOAD' },
    storageLabels: { srv1: 'SAVE_SLOT_1', tv: 'QUEST_LOG', movies: 'CUTSCENE_VAULT', musicPhotos: 'BGM_ARCHIVE', srv2: 'SAVE_SLOT_2' },
    widgetLabels: {
      chat: '◆ PARTY_CHAT ◆ Guild_Chat', lottery: '◆ LOOT_BOX ◆ Random_Drop', stocks: '◆ AUCTION ◆ Item_Prices', spotify: '◆ JUKEBOX ◆ Game_Music',
      dockerHealth: '◆ PLAY_TIME ◆ 7d_Sessions', quote: '◆ LOADING_TIP ◆ Game_Wisdom', freshRss: '◆ NEWS_TICKER ◆ Patch_Notes', weather: '◆ BIOME ◆ Zone_Weather',
      vpnStatus: '◆ STEALTH ◆ Cloak_Status', dnsLeak: '◆ ANTICHEAT ◆ Integrity', quickLaunch: '◆ HOTBAR ◆ Quick_Slots', airQuality: '◆ POISON ◆ Debuff_Level',
      plexLibrary: '◆ COLLECTION ◆ Achievement_Count', plexSessions: '◆ ACTIVE_GAMES ◆ Players_Online', plexOnDeck: '◆ QUEUE ◆ Next_Up',
      cronMonitor: '◆ EVENT_TIMER ◆', lanPresence: '◆ PARTY_LIST ◆', onThisDay: '◆ GAME_HISTORY ◆',
    },
    headerTitle: { main: 'ARCADE_OPS', accent: '.GG' },
    headerSubtitle: 'Floor 1 ◆ Session {date} ◆ Game Operations Center',
    gridTitle: '◆ FINAL BOSS ◆',
    gridSubtitle: '◆ ARCADE FLOOR ◆',
    jablonskiLabels: { emission: 'INPUT ◆ COMMANDS', excitation: 'OUTPUT ◆ FRAMES' },
    detailTransform: makeDetailTransform(ARCADE_OVERLAY, ARCADE_LABELS, {
      symbolField: 'avatar?.[0]', nameField: 'avatar', subtitleField: 'class', subtitleExtra: 'level',
      metaLabel1: 'CLASS', metaField1: 'class',
      metaLabel2: 'STATUS ◆ [IDLE | ACTIVE | COMBO | GAME_OVER]', metaField2: 'xp', metaField2Prefix: 'XP', statusLabels: ['IDLE', 'ACTIVE', 'COMBO', 'GAME_OVER'], serviceLinkColor: 'rgba(200,0,255,0.8)',
    }),
    cardTransform: makeCardTransform(ARCADE_OVERLAY, {
      topLeftField: 'level', centerField: 'level', nameField: 'avatar', bottomField: 'xp',
    }),
  },
  BLUEPRINT: {
    Grid: BlueprintGrid,
    labels: BLUEPRINT_LABELS,
    tickerLabels: { films: ['SPEC_SHEET', 'Drafted_Films'], series: ['REVISION_LOG', 'Filed_Series'], music: ['FREQUENCY_PLAN', 'Charted_Albums'] },
    logTitle: 'BUILD_LOG ◆ Construction_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Site_Alpha', storage: '◆ Material_Yard ◆ Stock_Capacity', srv2: '◆ SRV-2 ◆ Site_Bravo' },
    glancesLabels: { cpu: 'CPU_LOAD', ram: 'MEM_ALLOC', netDown: 'DATA_IN', netUp: 'DATA_OUT' },
    storageLabels: { srv1: 'SITE_ALPHA', tv: 'PLAN_VAULT', movies: 'SPEC_ARCHIVE', musicPhotos: 'FREQ_PLANS', srv2: 'SITE_BRAVO' },
    widgetLabels: {
      chat: '◆ DRAFTING ◆ Design_Comms', lottery: '◆ LOTTERY ◆ Random_Spec', stocks: '◆ MATERIAL ◆ Supply_Cost', spotify: '◆ WORKSHOP ◆ Build_Music',
      dockerHealth: '◆ PROJECT_LOG ◆ 7d_Uptime', quote: '◆ SPEC_NOTE ◆ Builder_Wisdom', freshRss: '◆ BULLETIN ◆ Trade_News', weather: '◆ SITE_COND ◆ Field_Weather',
      vpnStatus: '◆ TUNNEL ◆ Secure_Bore', dnsLeak: '◆ INTEGRITY ◆ Seal_Check', quickLaunch: '◆ TOOL_BELT ◆ Quick_Access', airQuality: '◆ DUST ◆ Air_Quality',
      plexLibrary: '◆ INVENTORY ◆ Asset_Counts', plexSessions: '◆ ACTIVE_JOBS ◆ Crews_Working', plexOnDeck: '◆ NEXT_PHASE ◆ Ready_Queue',
      cronMonitor: '◆ SCHEDULE ◆', lanPresence: '◆ CREW_LIST ◆', onThisDay: '◆ BUILD_DIARY ◆',
    },
    headerTitle: { main: 'BLUEPRINT', accent: '.DWG' },
    headerSubtitle: 'Sheet 1 ◆ Rev {date} ◆ Master Architectural Plan',
    gridTitle: '◆ MASTER PLAN ◆',
    gridSubtitle: '◆ ARCHITECTURAL DRAFT ◆',
    jablonskiLabels: { emission: 'SPEC ◆ OUTPUT', excitation: 'INPUT ◆ REQUIREMENTS' },
    detailTransform: makeDetailTransform(BLUEPRINT_OVERLAY, BLUEPRINT_LABELS, {
      symbolField: 'designation?.[0]', nameField: 'designation', subtitleField: 'system', subtitleExtra: 'floor',
      metaLabel1: 'REVISION', metaField1: 'revision',
      metaLabel2: 'STATUS ◆ [ON SPEC | DEVIATION | OVER LOAD | CRITICAL]', metaField2: 'floor', metaField2Prefix: 'Floor', statusLabels: ['ON SPEC', 'DEVIATION', 'OVER LOAD', 'CRITICAL'], serviceLinkColor: 'rgba(80,140,255,0.8)',
    }),
    cardTransform: makeCardTransform(BLUEPRINT_OVERLAY, {
      topLeftField: 'designation', centerField: 'designation', nameField: 'system', bottomField: 'revision',
    }),
  },
  APOTHECARY: {
    Grid: ApothecaryGrid,
    labels: APOTHECARY_LABELS,
    tickerLabels: { films: ['RECIPE_SCROLL', 'Brewed_Films'], series: ['CODEX_PAGE', 'Distilled_Series'], music: ['CHANT_LOG', 'Enchanted_Albums'] },
    logTitle: 'BREW_LOG ◆ Apothecary_Ledger',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Main_Cauldron', storage: '◆ Pantry ◆ Ingredient_Stock', srv2: '◆ SRV-2 ◆ Aux_Mortar' },
    glancesLabels: { cpu: 'HEAT', ram: 'VOLUME', netDown: 'INFLOW', netUp: 'DISTILLATE' },
    storageLabels: { srv1: 'CAULDRON_1', tv: 'RECIPE_VAULT', movies: 'POTION_ARCHIVE', musicPhotos: 'CHANT_SCROLLS', srv2: 'CAULDRON_2' },
    widgetLabels: {
      chat: '◆ CONSULT ◆ Healer_Chat', lottery: '◆ FORTUNE ◆ Random_Brew', stocks: '◆ MARKET ◆ Ingredient_Price', spotify: '◆ CHANT ◆ Ritual_Music',
      dockerHealth: '◆ BREW_TIME ◆ 7d_Batches', quote: '◆ PROVERB ◆ Healer_Wisdom', freshRss: '◆ GAZETTE ◆ Herb_News', weather: '◆ SEASON ◆ Growing_Conditions',
      vpnStatus: '◆ WARD ◆ Protection_Seal', dnsLeak: '◆ PURITY ◆ Contamination', quickLaunch: '◆ POUCH ◆ Quick_Remedies', airQuality: '◆ FUMES ◆ Vapour_Level',
      plexLibrary: '◆ SHELF ◆ Remedy_Counts', plexSessions: '◆ PATIENTS ◆ Active_Treatments', plexOnDeck: '◆ NEXT_BATCH ◆ Ready_Queue',
      cronMonitor: '◆ MOON_PHASE ◆', lanPresence: '◆ GUILD_ROLL ◆', onThisDay: '◆ HERB_DIARY ◆',
    },
    headerTitle: { main: 'APOTHECARY', accent: '.RX' },
    headerSubtitle: 'Shelf A ◆ Batch {date} ◆ Master Apothecarium',
    gridTitle: '◆ APOTHECARIUM ◆',
    gridSubtitle: '◆ REMEDY SHELF ◆',
    jablonskiLabels: { emission: 'REMEDY ◆ OUTPUT', excitation: 'AILMENT ◆ INPUT' },
    detailTransform: makeDetailTransform(APOTHECARY_OVERLAY, APOTHECARY_LABELS, {
      symbolField: 'remedy?.[0]', nameField: 'remedy', subtitleField: 'ingredient', subtitleLiteral: 'Potency',
      subtitleExtra: 'potency', metaLabel1: 'INGREDIENT', metaField1: 'ingredient',
      metaLabel2: 'STATUS ◆ [DORMANT | BREWING | VOLATILE | TOXIC]', metaField2: 'shelf', metaField2Prefix: 'Shelf',
      statusLabels: ['DORMANT', 'BREWING', 'VOLATILE', 'TOXIC'], serviceLinkColor: 'rgba(139,107,47,0.8)',
    }),
    cardTransform: makeCardTransform(APOTHECARY_OVERLAY, {
      topLeftField: 'potency', centerField: 'potency', nameField: 'remedy', bottomField: 'ingredient',
    }),
  },
  FUNHOUSE: {
    Grid: FunhouseGrid,
    labels: FUNHOUSE_LABELS,
    tickerLabels: { films: ['MARQUEE_REEL', 'Featured_Films'], series: ['EPISODE_RIDE', 'Binge_Series'], music: ['CALLIOPE', 'Carnival_Albums'] },
    logTitle: 'RIDE_LOG ◆ Funhouse_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Main_Gate', storage: '◆ Prize_Room ◆ Ticket_Stock', srv2: '◆ SRV-2 ◆ Back_Lot' },
    glancesLabels: { cpu: 'THRILL', ram: 'CAPACITY', netDown: 'GUESTS_IN', netUp: 'GUESTS_OUT' },
    storageLabels: { srv1: 'MAIN_GATE', tv: 'SHOW_TENT', movies: 'CINEMA_RIDE', musicPhotos: 'MUSIC_BOX', srv2: 'BACK_LOT' },
    widgetLabels: {
      chat: '◆ BARKER ◆ Crowd_Chat', lottery: '◆ RAFFLE ◆ Lucky_Draw', stocks: '◆ TICKETS ◆ Ride_Prices', spotify: '◆ CALLIOPE ◆ Carnival_Music',
      dockerHealth: '◆ HOURS ◆ 7d_Attendance', quote: '◆ FORTUNE ◆ Cookie_Wisdom', freshRss: '◆ POSTER ◆ Event_News', weather: '◆ SKIES ◆ Fair_Weather',
      vpnStatus: '◆ BACKSTAGE ◆ Hidden_Pass', dnsLeak: '◆ SAFETY ◆ Ride_Check', quickLaunch: '◆ FAST_PASS ◆ Skip_Line', airQuality: '◆ SMOKE ◆ Machine_Fog',
      plexLibrary: '◆ PRIZES ◆ Attraction_Count', plexSessions: '◆ RIDERS ◆ Active_Queues', plexOnDeck: '◆ NEXT_RIDE ◆ Ready_Queue',
      cronMonitor: '◆ SHOWTIME ◆', lanPresence: '◆ GUEST_LIST ◆', onThisDay: '◆ PARK_DIARY ◆',
    },
    headerTitle: { main: 'FUNHOUSE', accent: '.FUN' },
    headerSubtitle: 'Gate 1 ◆ Day {date} ◆ Grand Carnival Midway',
    gridTitle: '◆ WELCOME TO THE FUNHOUSE ◆',
    gridSubtitle: '◆ CARNIVAL MIDWAY ◆',
    jablonskiLabels: { emission: 'OUTPUT ◆ THRILLS', excitation: 'INPUT ◆ TICKETS' },
    detailTransform: makeDetailTransform(FUNHOUSE_OVERLAY, FUNHOUSE_LABELS, {
      symbolField: 'attraction?.[0]', nameField: 'attraction', subtitleField: 'ticket', subtitleLiteral: 'Booth',
      subtitleExtra: 'booth', metaLabel1: 'TICKET', metaField1: 'ticket',
      metaLabel2: 'STATUS ◆ [IDLE | FUN | WILD | CHAOS]', metaField2: 'color', metaField2Prefix: 'Color',
      statusLabels: ['IDLE', 'FUN', 'WILD', 'CHAOS'], serviceLinkColor: 'rgba(255,107,157,0.8)',
    }),
    cardTransform: makeCardTransform(FUNHOUSE_OVERLAY, {
      topLeftFn: (o, el) => o?.booth ? `#${o.booth}` : String(el.z), fallback: 'z', nameField: 'attraction', bottomField: 'color',
    }),
  },
  METRO: {
    Grid: MetroGrid,
    labels: METRO_LABELS,
    tickerLabels: { films: ['CINEMA_LINE', 'Screened_Films'], series: ['SERIES_ROUTE', 'Tracked_Series'], music: ['BUSKER_SET', 'Platform_Albums'] },
    logTitle: 'TRANSIT_LOG ◆ Operations_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Line_Alpha', storage: '◆ Depot ◆ Rolling_Stock', srv2: '◆ SRV-2 ◆ Line_Bravo' },
    glancesLabels: { cpu: 'LOAD', ram: 'CAPACITY', netDown: 'INBOUND', netUp: 'OUTBOUND' },
    storageLabels: { srv1: 'LINE_ALPHA', tv: 'SCHEDULE_DB', movies: 'ROUTE_ARCHIVE', musicPhotos: 'BUSKER_LOG', srv2: 'LINE_BRAVO' },
    widgetLabels: {
      chat: '◆ INTERCOM ◆ Control_Chat', lottery: '◆ LUCKY_DIP ◆ Random_Route', stocks: '◆ FARES ◆ Ticket_Prices', spotify: '◆ BUSKER ◆ Platform_Music',
      dockerHealth: '◆ SCHEDULE ◆ 7d_Punctuality', quote: '◆ ANNOUNCE ◆ Platform_Wisdom', freshRss: '◆ TICKER ◆ Transit_News', weather: '◆ SURFACE ◆ Above_Ground',
      vpnStatus: '◆ TUNNEL ◆ Secure_Line', dnsLeak: '◆ SIGNAL ◆ Track_Circuit', quickLaunch: '◆ OYSTER ◆ Tap_Access', airQuality: '◆ VENTILATION ◆ Air_Quality',
      plexLibrary: '◆ NETWORK ◆ Station_Count', plexSessions: '◆ TRAINS ◆ Active_Services', plexOnDeck: '◆ NEXT_TRAIN ◆ Arriving_Soon',
      cronMonitor: '◆ TIMETABLE ◆', lanPresence: '◆ PASSENGERS ◆', onThisDay: '◆ HISTORY ◆',
    },
    headerTitle: { main: 'METRO', accent: '.MAP' },
    headerSubtitle: 'Zone 1 ◆ Service {date} ◆ Transit Operations Center',
    gridTitle: '◆ TRANSIT MAP ◆',
    gridSubtitle: '◆ METRO SYSTEM ◆',
    jablonskiLabels: { emission: 'DEPART ◆ OUTBOUND', excitation: 'ARRIVE ◆ INBOUND' },
    detailTransform: makeDetailTransform(METRO_OVERLAY, METRO_LABELS, {
      symbolField: 'station?.[0]', nameField: 'station',
      subtitleFn: (o, el) => `${o?.line ?? el.symbol} Line ◆ Zone ${o?.zone ?? ''}`, metaLabel1: 'LINE',
      metaField1: 'line', metaLabel2: 'STATUS ◆ [IDLE | RUNNING | DELAYED | SUSPENDED]', metaField2: 'passengers',
      metaField2Prefix: 'Passengers', statusLabels: ['IDLE', 'RUNNING', 'DELAYED', 'SUSPENDED'],
      serviceLinkColor: 'rgba(68,136,255,0.8)',
    }),
    cardTransform: makeCardTransform(METRO_OVERLAY, {
      topLeftFn: (o, el) => o?.zone ? `Z${o.zone}` : String(el.z), fallback: 'z', nameField: 'station', bottomField: 'line',
    }),
  },
  SAFARI: {
    Grid: SafariGrid,
    labels: SAFARI_LABELS,
    tickerLabels: { films: ['WILDLIFE_REEL', 'Captured_Films'], series: ['NATURE_DOC', 'Tracked_Series'], music: ['BUSH_RADIO', 'Safari_Albums'] },
    logTitle: 'FIELD_LOG ◆ Safari_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Main_Reserve', storage: '◆ Feed_Store ◆ Supply_Level', srv2: '◆ SRV-2 ◆ Aux_Reserve' },
    glancesLabels: { cpu: 'ACTIVITY', ram: 'TERRITORY', netDown: 'ARRIVALS', netUp: 'DEPARTURES' },
    storageLabels: { srv1: 'RESERVE_A', tv: 'CAMERA_TRAP', movies: 'FOOTAGE_VAULT', musicPhotos: 'SOUND_LOG', srv2: 'RESERVE_B' },
    widgetLabels: {
      chat: '◆ RANGER ◆ Field_Comms', lottery: '◆ SIGHTING ◆ Random_Spot', stocks: '◆ MARKET ◆ Feed_Prices', spotify: '◆ BUSH ◆ Nature_Sounds',
      dockerHealth: '◆ PATROL ◆ 7d_Activity', quote: '◆ WISDOM ◆ Naturalist_Quote', freshRss: '◆ GAZETTE ◆ Wildlife_News', weather: '◆ CLIMATE ◆ Reserve_Weather',
      vpnStatus: '◆ CAMOUFLAGE ◆ Hidden_Trail', dnsLeak: '◆ TRACKING ◆ Signal_Check', quickLaunch: '◆ BINOCULARS ◆ Quick_View', airQuality: '◆ POLLEN ◆ Air_Quality',
      plexLibrary: '◆ CENSUS ◆ Species_Count', plexSessions: '◆ ACTIVE ◆ Animal_Sightings', plexOnDeck: '◆ NEXT_FEED ◆ Schedule',
      cronMonitor: '◆ FEEDING_TIME ◆', lanPresence: '◆ VISITORS ◆', onThisDay: '◆ NATURE_DIARY ◆',
    },
    headerTitle: { main: 'SAFARI', accent: '.WILD' },
    headerSubtitle: 'Zone A ◆ Day {date} ◆ Wildlife Reserve Monitor',
    gridTitle: '◆ SAFARI PARK ◆',
    gridSubtitle: '◆ ZOO MAP ◆',
    jablonskiLabels: { emission: 'SIGHTING ◆ OUTBOUND', excitation: 'STIMULUS ◆ INBOUND' },
    detailTransform: makeDetailTransform(SAFARI_OVERLAY, SAFARI_LABELS, {
      symbolField: 'animal?.[0]', nameField: 'animal', subtitleField: 'habitat', subtitleExtra: 'diet',
      metaLabel1: 'HABITAT', metaField1: 'habitat',
      metaLabel2: 'STATUS ◆ [RESTING | ACTIVE | AGITATED | FRENZY]', metaField2: 'enclosure', metaField2Prefix: 'Enclosure', statusLabels: ['RESTING', 'ACTIVE', 'AGITATED', 'FRENZY'], serviceLinkColor: 'rgba(200,160,80,0.8)',
    }),
    cardTransform: makeCardTransform(SAFARI_OVERLAY, {
      topLeftField: 'enclosure', centerField: 'enclosure', nameField: 'animal', bottomField: 'habitat',
    }),
  },
  HEIST: {
    Grid: HeistGrid,
    labels: HEIST_LABELS,
    tickerLabels: { films: ['SURVEILLANCE', 'Cased_Films'], series: ['CASE_FILE', 'Tracked_Series'], music: ['GETAWAY_MIX', 'Heist_Albums'] },
    logTitle: 'CREW_LOG ◆ Operations_Feed',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Safe_House_A', storage: '◆ Vault ◆ Loot_Capacity', srv2: '◆ SRV-2 ◆ Safe_House_B' },
    glancesLabels: { cpu: 'HEAT', ram: 'STASH', netDown: 'INTEL_IN', netUp: 'INTEL_OUT' },
    storageLabels: { srv1: 'SAFE_A', tv: 'SURVEILLANCE', movies: 'CASE_FILES', musicPhotos: 'WIRE_TAPS', srv2: 'SAFE_B' },
    widgetLabels: {
      chat: '◆ BURNER ◆ Crew_Comms', lottery: '◆ ODDS ◆ Random_Chance', stocks: '◆ FENCE ◆ Black_Market', spotify: '◆ GETAWAY ◆ Driver_Mix',
      dockerHealth: '◆ PATROL_LOG ◆ 7d_Sweep', quote: '◆ CODE ◆ Criminal_Wisdom', freshRss: '◆ SCANNER ◆ Police_Band', weather: '◆ FORECAST ◆ Escape_Weather',
      vpnStatus: '◆ ALIAS ◆ Cover_Identity', dnsLeak: '◆ TRACES ◆ Evidence_Check', quickLaunch: '◆ KIT ◆ Tools_of_Trade', airQuality: '◆ SMOKE ◆ Cover_Level',
      plexLibrary: '◆ LOOT ◆ Score_Count', plexSessions: '◆ ACTIVE ◆ Crew_at_Work', plexOnDeck: '◆ NEXT_JOB ◆ Queued',
      cronMonitor: '◆ TIMING ◆', lanPresence: '◆ CREW ◆', onThisDay: '◆ RAP_SHEET ◆',
    },
    headerTitle: { main: 'HEIST', accent: '.JOB' },
    headerSubtitle: 'Op {date} ◆ The Big Score',
    gridTitle: '◆ THE HEIST ◆',
    gridSubtitle: '◆ FLOOR PLAN ◆',
    jablonskiLabels: { emission: 'LOOT ◆ OUT', excitation: 'INTEL ◆ IN' },
    detailTransform: makeDetailTransform(HEIST_OVERLAY, HEIST_LABELS, {
      symbolField: 'alias?.[0]', nameField: 'alias', subtitleField: 'role', subtitleLiteral: 'Cut:',
      subtitleExtra: 'cut', metaLabel1: 'ROLE', metaField1: 'role', metaLabel2: 'HEAT', metaField2: 'heat',
      statusLabels: ['CASING', 'IN PROGRESS', 'ALARM', 'BUSTED'], serviceLinkColor: 'rgba(255,51,51,0.8)',
    }),
    cardTransform: makeCardTransform(HEIST_OVERLAY, {
      topLeftField: 'cut', centerField: 'cut', nameField: 'alias', bottomField: 'heat',
    }),
  },
  AQUARIUM: {
    Grid: AquariumGrid,
    labels: AQUARIUM_LABELS,
    tickerLabels: { films: ['DEEP_DIVE', 'Screened_Films'], series: ['CURRENT', 'Tracked_Series'], music: ['WHALE_SONG', 'Ocean_Albums'] },
    logTitle: 'TANK_LOG ◆ Aquarium_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Main_Tank', storage: '◆ Feed_Store ◆ Stock_Level', srv2: '◆ SRV-2 ◆ Quarantine' },
    glancesLabels: { cpu: 'TEMP', ram: 'SALINITY', netDown: 'INFLOW', netUp: 'OUTFLOW' },
    storageLabels: { srv1: 'MAIN_TANK', tv: 'REEF_CAM', movies: 'DIVE_LOG', musicPhotos: 'HYDROPHONE', srv2: 'QUARANTINE' },
    widgetLabels: {
      chat: '◆ DIVER ◆ Comm_Channel', lottery: '◆ CATCH ◆ Random_Species', stocks: '◆ MARKET ◆ Fish_Prices', spotify: '◆ OCEAN ◆ Ambient_Sounds',
      dockerHealth: '◆ TIDE ◆ 7d_Cycles', quote: '◆ DEEP ◆ Ocean_Wisdom', freshRss: '◆ CURRENT ◆ Marine_News', weather: '◆ SURFACE ◆ Sea_State',
      vpnStatus: '◆ DEPTH ◆ Pressure_Seal', dnsLeak: '◆ FILTER ◆ Water_Quality', quickLaunch: '◆ TOOLS ◆ Quick_Access', airQuality: '◆ O2 ◆ Dissolved_Oxygen',
      plexLibrary: '◆ SPECIES ◆ Census', plexSessions: '◆ ACTIVE ◆ Swimming', plexOnDeck: '◆ FEEDING ◆ Next_Schedule',
      cronMonitor: '◆ TIDE_TABLE ◆', lanPresence: '◆ VISITORS ◆', onThisDay: '◆ MARINE_LOG ◆',
    },
    headerTitle: { main: 'AQUARIUM', accent: '.SEA' },
    headerSubtitle: 'Tank A ◆ Log {date} ◆ Marine Operations',
    gridTitle: '◆ AQUARIUM ◆',
    gridSubtitle: '◆ TANK MAP ◆',
    jablonskiLabels: { emission: 'OUTPUT ◆ CURRENT', excitation: 'INPUT ◆ FEED' },
    detailTransform: makeDetailTransform(AQUARIUM_OVERLAY, AQUARIUM_LABELS, {
      symbolField: 'species?.[0]', nameField: 'species', subtitleField: 'zone', subtitleLiteral: 'Tank',
      subtitleExtra: 'tank', metaLabel1: 'ZONE', metaField1: 'zone', metaLabel2: 'FEEDING', metaField2: 'feeding',
      statusLabels: ['CALM', 'SWIMMING', 'AGITATED', 'FRENZY'], serviceLinkColor: 'rgba(60,180,255,0.8)',
    }),
    cardTransform: makeCardTransform(AQUARIUM_OVERLAY, {
      topLeftField: 'tank', centerField: 'tank', nameField: 'species', bottomField: 'zone',
    }),
  },
  GARDEN: {
    Grid: GardenGrid,
    labels: GARDEN_LABELS,
    tickerLabels: { films: ['NATURE_REEL', 'Filmed_Gardens'], series: ['SEASON_ARC', 'Growing_Series'], music: ['BIRDSONG', 'Garden_Albums'] },
    logTitle: 'GARDEN_LOG ◆ Growth_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Main_Plot', storage: '◆ Shed ◆ Seed_Stock', srv2: '◆ SRV-2 ◆ Greenhouse' },
    glancesLabels: { cpu: 'SUNLIGHT', ram: 'MOISTURE', netDown: 'RAIN', netUp: 'EVAPORATION' },
    storageLabels: { srv1: 'MAIN_PLOT', tv: 'TIMELAPSE', movies: 'PLANT_GUIDE', musicPhotos: 'BIRDSONG', srv2: 'GREENHOUSE' },
    widgetLabels: {
      chat: '◆ GARDENER ◆ Plot_Chat', lottery: '◆ SEED ◆ Random_Plant', stocks: '◆ MARKET ◆ Seed_Prices', spotify: '◆ NATURE ◆ Garden_Sounds',
      dockerHealth: '◆ SEASON ◆ 7d_Growth', quote: '◆ PROVERB ◆ Garden_Wisdom', freshRss: '◆ ALMANAC ◆ Garden_News', weather: '◆ CLIMATE ◆ Growing_Conditions',
      vpnStatus: '◆ FENCE ◆ Garden_Wall', dnsLeak: '◆ PEST ◆ Slug_Check', quickLaunch: '◆ TOOLS ◆ Quick_Access', airQuality: '◆ POLLEN ◆ Count',
      plexLibrary: '◆ SPECIES ◆ Plant_Count', plexSessions: '◆ GROWING ◆ Active_Plots', plexOnDeck: '◆ HARVEST ◆ Ready_Soon',
      cronMonitor: '◆ WATERING ◆', lanPresence: '◆ VISITORS ◆', onThisDay: '◆ GARDEN_DIARY ◆',
    },
    headerTitle: { main: 'GARDEN', accent: '.BOT' },
    headerSubtitle: 'Plot A ◆ Season {date} ◆ Botanical Monitor',
    gridTitle: '◆ BOTANICAL GARDEN ◆',
    gridSubtitle: '◆ GARDEN MAP ◆',
    jablonskiLabels: { emission: 'BLOOM ◆ OUTPUT', excitation: 'WATER ◆ INPUT' },
    detailTransform: makeDetailTransform(GARDEN_OVERLAY, GARDEN_LABELS, {
      symbolField: 'plant?.[0]', nameField: 'plant', subtitleField: 'bed', subtitleExtra: 'season',
      metaLabel1: 'BED', metaField1: 'bed',
      metaLabel2: 'WATERING', metaField2: 'water',
      statusLabels: ['DORMANT', 'GROWING', 'BLOOMING', 'OVERGROWN'],
      serviceLinkColor: 'rgba(100,168,60,0.8)',
    }),
    cardTransform: makeCardTransform(GARDEN_OVERLAY, {
      topLeftFn: (o, el) => o?.season?.[0] ?? String(el.z), fallback: 'z', nameField: 'plant', bottomField: 'bed',
    }),
  },
  BREW: {
    Grid: BrewGrid,
    labels: BREW_LABELS,
    tickerLabels: { films: ['BREW_REEL', 'Screened_Films'], series: ['BATCH_LOG', 'Fermented_Series'], music: ['PUB_JUKEBOX', 'Tap_Albums'] },
    logTitle: 'BREW_LOG ◆ Fermentation_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Brewhouse', storage: '◆ Cellar ◆ Barrel_Stock', srv2: '◆ SRV-2 ◆ Tap_Room' },
    glancesLabels: { cpu: 'TEMP', ram: 'GRAVITY', netDown: 'INFLOW', netUp: 'CO2_OUT' },
    storageLabels: { srv1: 'BREWHOUSE', tv: 'RECIPE_DB', movies: 'BATCH_ARCHIVE', musicPhotos: 'PUB_MUSIC', srv2: 'TAP_ROOM' },
    widgetLabels: {
      chat: '◆ BREWER ◆ Batch_Chat', lottery: '◆ FLIGHT ◆ Random_Pour', stocks: '◆ HOP_MARKET ◆ Ingredient_Price', spotify: '◆ PUB ◆ Tap_Room_Music',
      dockerHealth: '◆ FERMENT ◆ 7d_Activity', quote: '◆ TOAST ◆ Brewer_Wisdom', freshRss: '◆ TAP_LIST ◆ Beer_News', weather: '◆ CLIMATE ◆ Cellar_Conditions',
      vpnStatus: '◆ SEAL ◆ Airlock_Status', dnsLeak: '◆ PURITY ◆ Contamination', quickLaunch: '◆ TAP ◆ Quick_Pour', airQuality: '◆ YEAST ◆ Spore_Count',
      plexLibrary: '◆ RECIPES ◆ Beer_Count', plexSessions: '◆ FERMENTING ◆ Active_Batches', plexOnDeck: '◆ READY ◆ On_Tap',
      cronMonitor: '◆ SCHEDULE ◆', lanPresence: '◆ PATRONS ◆', onThisDay: '◆ BREW_DIARY ◆',
    },
    headerTitle: { main: 'BREW', accent: '.ALE' },
    headerSubtitle: 'Batch {date} ◆ Craft Brewery Operations',
    gridTitle: '◆ BREWERY ◆',
    gridSubtitle: '◆ BREW FLOOR ◆',
    jablonskiLabels: { emission: 'POUR ◆ OUTPUT', excitation: 'GRAIN ◆ INPUT' },
    detailTransform: makeDetailTransform(BREW_OVERLAY, BREW_LABELS, {
      symbolField: 'beer?.[0]', nameField: 'beer', subtitleField: 'stage', subtitleLiteral: 'ABV', subtitleExtra: 'abv',
      metaLabel1: 'STAGE', metaField1: 'stage', metaLabel2: 'BATCH', metaField2: 'batch',
      statusLabels: ['RESTING', 'FERMENTING', 'VIGOROUS', 'OVERFLOW'], serviceLinkColor: 'rgba(200,150,50,0.8)',
    }),
    cardTransform: makeCardTransform(BREW_OVERLAY, {
      topLeftField: 'abv', centerField: 'abv', nameField: 'beer', bottomField: 'stage',
    }),
  },
  LIBRARY: {
    Grid: LibraryGrid,
    labels: LIBRARY_LABELS,
    tickerLabels: { films: ['FILM_SECTION', 'Shelved_Films'], series: ['SERIAL_SHELF', 'Bound_Series'], music: ['RECORD_ROOM', 'Cataloged_Albums'] },
    logTitle: 'CIRCULATION_LOG ◆ Library_Monitor',
    sectionLabels: { srv1: '◆ SRV-1 ◆ Main_Stack', storage: '◆ Archive ◆ Shelf_Capacity', srv2: '◆ SRV-2 ◆ Annex' },
    glancesLabels: { cpu: 'ACTIVITY', ram: 'SHELF_USE', netDown: 'BORROWS', netUp: 'RETURNS' },
    storageLabels: { srv1: 'MAIN_STACK', tv: 'MEDIA_ROOM', movies: 'FILM_SHELF', musicPhotos: 'RECORD_ROOM', srv2: 'ANNEX' },
    widgetLabels: {
      chat: '◆ DESK ◆ Librarian_Help', lottery: '◆ LUCKY_DIP ◆ Random_Book', stocks: '◆ RARE ◆ Book_Values', spotify: '◆ QUIET ◆ Study_Music',
      dockerHealth: '◆ HOURS ◆ 7d_Visits', quote: '◆ QUOTE ◆ Literary_Wisdom', freshRss: '◆ REVIEWS ◆ Book_News', weather: '◆ OUTSIDE ◆ Reading_Weather',
      vpnStatus: '◆ ARCHIVE ◆ Vault_Seal', dnsLeak: '◆ CATALOG ◆ Index_Check', quickLaunch: '◆ BOOKMARK ◆ Quick_Access', airQuality: '◆ DUST ◆ Air_Quality',
      plexLibrary: '◆ CATALOG ◆ Volume_Count', plexSessions: '◆ READERS ◆ Active_Loans', plexOnDeck: '◆ HOLDS ◆ Reserved',
      cronMonitor: '◆ DUE_DATE ◆', lanPresence: '◆ PATRONS ◆', onThisDay: '◆ LITERARY_DIARY ◆',
    },
    headerTitle: { main: 'LIBRARY', accent: '.LIB' },
    headerSubtitle: 'Stack A ◆ Date {date} ◆ Public Library System',
    gridTitle: '◆ LIBRARY ◆',
    gridSubtitle: '◆ FLOOR PLAN ◆',
    jablonskiLabels: { emission: 'BORROW ◆ OUT', excitation: 'RETURN ◆ IN' },
    detailTransform: makeDetailTransform(LIBRARY_OVERLAY, LIBRARY_LABELS, {
      symbolField: 'title?.[0]', nameField: 'title', subtitleField: 'section', subtitleLiteral: 'Dewey',
      subtitleExtra: 'dewey', metaLabel1: 'DEWEY', metaField1: 'dewey', metaLabel2: 'STATUS', metaField2: 'status',
      statusLabels: ['QUIET', 'BROWSING', 'BUSY', 'OVERDUE'], serviceLinkColor: 'rgba(160,128,96,0.8)',
    }),
    cardTransform: makeCardTransform(LIBRARY_OVERLAY, {
      topLeftField: 'dewey', centerField: 'dewey', nameField: 'title', bottomField: 'section',
    }),
  },
  SCHLENK: {
    Grid: SchlenkBenchScene,
    labels: CATEGORY_LABELS,
    tickerLabels: {
      films: ['DISTILLATE ·', 'Fractions_Collected'],
      series: ['FRACTIONS ·', 'Reaction_Series'],
      music: ['CONDENSATE ·', 'Pure_Samples'],
    },
    logTitle: 'LAB_NOTEBOOK ◆ Bench_Log',
    gridProps: 'chem',
    sectionLabels: {
      srv1: '◆ SRV-1 ◆ Reaction_Vessel',
      storage: '◆ Storage ◆ Reagent_Inventory',
      srv2: '◆ SRV-2 ◆ Distillation_Column',
    },
    glancesLabels: { cpu: 'THERMAL_LOAD', ram: 'HEADSPACE', netDown: 'DOWN_FLUX', netUp: 'UP_FLUX' },
    storageLabels: { srv1: 'RBF_A', tv: 'RBF_B', movies: 'RBF_C', musicPhotos: 'RBF_D', srv2: 'COLUMN' },
    widgetLabels: {
      chat: '◆ BENCH_ASSISTANT ◆ Gemini_Chat',
      lottery: '◆ LOTTERY ◆ Random_Draw',
      stocks: '◆ MARKET ◆ Equities',
      spotify: '◆ BENCH_RADIO ◆ Spotify',
      dockerHealth: '◆ APPARATUS_STATE ◆ 7d',
      quote: '◆ CATALYST_OF_THE_DAY ◆ ZenQuotes',
      freshRss: '◆ LIT_FEED ◆ FreshRSS',
      weather: '◆ ATMOSPHERE ◆ Open-Meteo',
      vpnStatus: '◆ INERT_ATMOSPHERE ◆ Gluetun',
      dnsLeak: '◆ LEAK_CHECK ◆ VPN_Integrity',
      quickLaunch: '◆ Quick_Launch',
      airQuality: '◆ FUME_HOOD ◆ AQI',
      plexLibrary: '◆ LIBRARY ◆ Plex_Counts',
      plexSessions: '◆ LIVE_SESSIONS ◆ Plex_Streams',
      plexOnDeck: '◆ ON_DECK ◆ Queue',
      cronMonitor: '◆ SCHEDULE ◆',
      lanPresence: '◆ PRESENCE ◆',
      onThisDay: '◆ CHEMISTRY_HISTORY ◆',
    },
    headerTitle: { main: 'SCHLENK_BENCH', accent: '.LAB' },
    headerSubtitle: 'Bench {date} ◆ Schlenk-Line Homelab',
    gridTitle: '◆ WORKING BENCH — LIVE REACTIONS ◆',
    jablonskiLabels: { emission: 'FLUX ◆ DOWN', excitation: 'FLUX ◆ UP' },
    CpuDiagram: CoordComplex,
    RamDiagram: CoordComplex,
    DownloadDiagram: JablonskiDiagram,
    UploadDiagram: JablonskiDiagram,
    ServerStorageDiagram: ReagentBottle,
    MediaStorageDiagram: SolventReservoir,
    SpeedtestDiagram: PiraniTrace,
    detailTransform: (element) => {
      const c = getElementColor(element.symbol);
      return {
        title: element.name.toUpperCase(),
        subtitle: `Z = ${element.z} ◆ ${c.compound}`,
        categoryLabel: (CATEGORY_LABELS[element.cat] || element.cat).toUpperCase(),
        metadata: [
          { label: 'ELECTRON_CONFIGURATION', value: element.electronConfig },
          { label: 'COMPOUND_REFERENCE', value: c.compound },
        ],
        statusLabels: ['INERT', 'BUBBLING', 'REFLUX', 'BUMPING'],
        serviceLinkColor: c.color,
      };
    },
    cardTransform: (element) => {
      const c = getElementColor(element.symbol);
      return {
        topLeft: String(element.z),
        centerLabel: element.symbol,
        displayName: element.service || element.name,
        bottomLabel: element.mass,
        liquidColor: c.color,
      };
    },
  },
};

export default MODE_REGISTRY;
