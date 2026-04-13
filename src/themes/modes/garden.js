import { createModeTiers } from '../paletteHelpers.js';

const t2 = {
  bgBase: '#060A04',
  accent: '#64A83C',
  dotGridColor: 'rgba(100,168,60,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(200,80,100,0.09)',    border: '#C85064', text: '#D86074', glow: 'rgba(200,80,100,0.45)' },
    ALKALINE:   { bg: 'rgba(80,160,60,0.09)',     border: '#50A03C', text: '#60B04C', glow: 'rgba(80,160,60,0.40)' },
    TRANSITION: { bg: 'rgba(100,180,80,0.09)',    border: '#64B450', text: '#74C460', glow: 'rgba(100,180,80,0.45)' },
    HALOGEN:    { bg: 'rgba(180,200,60,0.09)',    border: '#B4C83C', text: '#C4D84C', glow: 'rgba(180,200,60,0.40)' },
    NOBLE:      { bg: 'rgba(60,120,40,0.09)',     border: '#3C7828', text: '#4C8838', glow: 'rgba(60,120,40,0.45)' },
    LANTHANIDE: { bg: 'rgba(140,200,80,0.09)',    border: '#8CC850', text: '#9CD860', glow: 'rgba(140,200,80,0.40)' },
    POST:       { bg: 'rgba(100,80,50,0.07)',     border: '#645032', text: '#746042', glow: 'rgba(100,80,50,0.30)' },
    METALLOID:  { bg: 'rgba(120,180,100,0.07)',   border: '#78B464', text: '#88C474', glow: 'rgba(120,180,100,0.30)' },
    NONMETAL:   { bg: 'rgba(200,220,180,0.07)',   border: '#C8DCB4', text: '#D8ECC4', glow: 'rgba(200,220,180,0.25)' },
    ACTINIDE:   { bg: 'rgba(80,60,40,0.07)',      border: '#503C28', text: '#604C38', glow: 'rgba(80,60,40,0.30)' },
    PNICTOGEN:  { bg: 'rgba(160,100,180,0.09)',   border: '#A064B4', text: '#B074C4', glow: 'rgba(160,100,180,0.45)' },
    CHALCOGEN:  { bg: 'rgba(60,140,180,0.09)',    border: '#3C8CB4', text: '#4C9CC4', glow: 'rgba(60,140,180,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    { id: 'petal', behavior: 'fall', render: 'dot', spawnRate: [0, 0, 0.2, 0.5, 1.0], speed: [0.2, 0.8], size: [1, 3], color: '#C85064', opacity: 0.6, lifetime: [60, 150], driftFreq: 0.03, driftAmplitude: 25, cascade: true },
    { id: 'pollen', behavior: 'rise', render: 'dot', spawnRate: [0, 0, 0.09, 0.2, 0.44], speed: [0.1, 0.4], size: [0.5, 1.5], color: '#FFE060', opacity: 0.45, lifetime: [80, 200] },
    { id: 'firefly', behavior: 'flash', render: 'glow', spawnRate: [0, 0, 0, 0.06, 0.18], size: [1, 3], glowRadius: 6, color: '#AAFF80', opacity: 0.75, lifetime: [15, 35] },
    { id: 'dewDrop', behavior: 'fall', render: 'glow', spawnRate: [0, 0, 0.03, 0.08, 0.15], speed: [0.15, 0.5], size: [1, 2.5], glowRadius: 4, color: '#B2EBF2', opacity: [0.4, 0.8], lifetime: [50, 120] },
    { id: 'butterflyWing', behavior: 'drift', render: 'shape', spawnRate: [0, 0, 0, 0.03, 0.08], speed: [0.2, 0.6], angle: [240, 300], size: [1.5, 3], color: '#CE93D8', opacity: [0.4, 0.8], lifetime: [80, 200] },
    { id: 'seedPod', behavior: 'fall', render: 'dot', spawnRate: [0, 0, 0, 0.05, 0.12], speed: [0.3, 0.7], size: [0.5, 1.5], color: '#8D6E63', opacity: [0.4, 0.8], lifetime: [60, 150], driftFreq: 0.02, driftAmplitude: 15 },
  ],
};

export default createModeTiers('GARDEN', {
  tierNames: ['Winter', 'Spring', 'Summer', 'Harvest', 'Enchanted'],
  tierTooltips: ['Dormant grey', 'Fresh green palette', 'Petals and pollen', 'Harvest golds', 'Full enchanted garden'],
  t1: { bgBase: '#080A06', accent: '#889977', dotGridColor: 'rgba(136,153,119,0.03)' },
  t2, sceneConfig, flavorHue: 110,
});
