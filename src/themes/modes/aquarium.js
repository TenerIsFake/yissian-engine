import { createModeTiers } from '../paletteHelpers.js';

const t2 = {
  bgBase: '#040810',
  accent: '#3CB4FF',
  dotGridColor: 'rgba(60,180,255,0.03)',
  cat: {
    ALKALI:     { bg: 'rgba(60,180,255,0.09)',    border: '#3CB4FF', text: '#58C8FF', glow: 'rgba(60,180,255,0.45)' },
    ALKALINE:   { bg: 'rgba(20,80,140,0.09)',     border: '#14508C', text: '#28649C', glow: 'rgba(20,80,140,0.40)' },
    TRANSITION: { bg: 'rgba(40,160,200,0.09)',    border: '#28A0C8', text: '#38B0D8', glow: 'rgba(40,160,200,0.45)' },
    HALOGEN:    { bg: 'rgba(80,200,180,0.09)',    border: '#50C8B4', text: '#64D8C4', glow: 'rgba(80,200,180,0.40)' },
    NOBLE:      { bg: 'rgba(20,100,80,0.09)',     border: '#146450', text: '#287860', glow: 'rgba(20,100,80,0.45)' },
    LANTHANIDE: { bg: 'rgba(100,220,200,0.09)',   border: '#64DCC8', text: '#78ECD8', glow: 'rgba(100,220,200,0.40)' },
    POST:       { bg: 'rgba(30,70,100,0.07)',     border: '#1E4664', text: '#2E5674', glow: 'rgba(30,70,100,0.30)' },
    METALLOID:  { bg: 'rgba(40,140,120,0.07)',    border: '#288C78', text: '#389C88', glow: 'rgba(40,140,120,0.30)' },
    NONMETAL:   { bg: 'rgba(160,220,240,0.07)',   border: '#A0DCF0', text: '#B0ECFF', glow: 'rgba(160,220,240,0.25)' },
    ACTINIDE:   { bg: 'rgba(10,50,80,0.07)',      border: '#0A3250', text: '#1A4260', glow: 'rgba(10,50,80,0.30)' },
    PNICTOGEN:  { bg: 'rgba(80,200,255,0.09)',    border: '#50C8FF', text: '#68D8FF', glow: 'rgba(80,200,255,0.45)' },
    CHALCOGEN:  { bg: 'rgba(100,180,160,0.09)',   border: '#64B4A0', text: '#78C4B0', glow: 'rgba(100,180,160,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    { id: 'bubble', behavior: 'rise', render: 'dot', spawnRate: [0, 0, 0.26, 0.6, 1.0], speed: [0.3, 1], size: [1, 3], color: '#3CB4FF', opacity: 0.6, lifetime: [60, 150], driftFreq: 0.03, driftAmplitude: 15 },
    { id: 'plankton', behavior: 'fall', render: 'dot', spawnRate: [0, 0, 0.14, 0.35, 0.7], speed: [0.1, 0.4], size: [0.5, 1.5], color: '#64DCC8', opacity: 0.4, lifetime: [80, 200], driftFreq: 0.02, driftAmplitude: 20 },
    { id: 'biolum', behavior: 'flash', render: 'glow', spawnRate: [0, 0, 0, 0.08, 0.26], size: [2, 5], glowRadius: 10, color: '#58C8FF', opacity: 0.75, lifetime: [15, 35], cascade: true },
    { id: 'fishScale', behavior: 'drift', render: 'dot', spawnRate: [0, 0, 0, 0.05, 0.12], speed: [0.3, 0.8], angle: [170, 190], size: [0.5, 1.5], color: '#B0BEC5', opacity: [0.4, 0.8], lifetime: [60, 150] },
    { id: 'coralSpore', behavior: 'rise', render: 'glow', spawnRate: [0, 0, 0.03, 0.08, 0.18], speed: [0.1, 0.3], size: [1, 2.5], glowRadius: 5, color: '#FF8A80', opacity: [0.4, 0.8], lifetime: [80, 200] },
    { id: 'sandGrain', behavior: 'fall', render: 'dot', spawnRate: [0, 0, 0, 0.04, 0.1], speed: [0.2, 0.5], size: [0.3, 1], color: '#D7CCC8', opacity: [0.4, 0.8], lifetime: [60, 140], driftFreq: 0.01, driftAmplitude: 8 },
  ],
};

export default createModeTiers('AQUARIUM', {
  tierNames: ['Lights Off', 'Daylight', 'Feeding', 'Night Dive', 'Deep Blue'],
  tierTooltips: ['Dark tank', 'Bright aquatic blues', 'Bubbles and feeding frenzy', 'Bioluminescence', 'Full deep ocean'],
  t1: { bgBase: '#040608', accent: '#668899', dotGridColor: 'rgba(102,136,153,0.03)' },
  t2, sceneConfig, flavorHue: 200,
});
