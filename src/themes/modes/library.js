import { createModeTiers } from '../paletteHelpers.js';

const t2 = {
  bgBase: '#080604',
  accent: '#A08060',
  dotGridColor: 'rgba(160,128,96,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(160,128,96,0.09)',    border: '#A08060', text: '#B09070', glow: 'rgba(160,128,96,0.45)' },
    ALKALINE:   { bg: 'rgba(80,120,60,0.09)',     border: '#50783C', text: '#60884C', glow: 'rgba(80,120,60,0.40)' },
    TRANSITION: { bg: 'rgba(120,100,80,0.09)',    border: '#786450', text: '#887460', glow: 'rgba(120,100,80,0.45)' },
    HALOGEN:    { bg: 'rgba(200,180,120,0.09)',   border: '#C8B478', text: '#D8C488', glow: 'rgba(200,180,120,0.40)' },
    NOBLE:      { bg: 'rgba(140,60,60,0.09)',     border: '#8C3C3C', text: '#9C4C4C', glow: 'rgba(140,60,60,0.45)' },
    LANTHANIDE: { bg: 'rgba(180,160,120,0.09)',   border: '#B4A078', text: '#C4B088', glow: 'rgba(180,160,120,0.40)' },
    POST:       { bg: 'rgba(90,80,60,0.07)',      border: '#5A503C', text: '#6A604C', glow: 'rgba(90,80,60,0.30)' },
    METALLOID:  { bg: 'rgba(100,110,80,0.07)',    border: '#646E50', text: '#747E60', glow: 'rgba(100,110,80,0.30)' },
    NONMETAL:   { bg: 'rgba(220,210,190,0.07)',   border: '#DCD2BE', text: '#ECE2CE', glow: 'rgba(220,210,190,0.25)' },
    ACTINIDE:   { bg: 'rgba(80,60,40,0.07)',      border: '#503C28', text: '#604C38', glow: 'rgba(80,60,40,0.30)' },
    PNICTOGEN:  { bg: 'rgba(180,140,80,0.09)',    border: '#B48C50', text: '#C49C60', glow: 'rgba(180,140,80,0.45)' },
    CHALCOGEN:  { bg: 'rgba(100,140,100,0.09)',   border: '#648C64', text: '#749C74', glow: 'rgba(100,140,100,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    { id: 'dustMote', behavior: 'fall', render: 'dot', spawnRate: [0, 0, 0.14, 0.35, 0.7], speed: [0.1, 0.4], size: [0.5, 1.5], color: '#A08060', opacity: 0.4, lifetime: [80, 200], driftFreq: 0.015, driftAmplitude: 10 },
    { id: 'pageFlutter', behavior: 'fall', render: 'dot', spawnRate: [0, 0, 0.05, 0.14, 0.32], speed: [0.3, 1], size: [1, 2], color: '#DCD2BE', opacity: 0.4, lifetime: [40, 100], driftFreq: 0.04, driftAmplitude: 20, cascade: true },
    { id: 'lampGlow', behavior: 'flash', render: 'glow', spawnRate: [0, 0, 0, 0.05, 0.14], size: [3, 6], glowRadius: 12, color: '#FFE0A0', opacity: 0.6, lifetime: [20, 50] },
    { id: 'inkDrop', behavior: 'fall', render: 'glow', spawnRate: [0, 0, 0, 0.03, 0.08], speed: [0.3, 0.7], size: [1, 2.5], glowRadius: 4, color: '#1A237E', opacity: [0.4, 0.8], lifetime: [40, 100] },
    { id: 'bookSpine', behavior: 'twinkle', render: 'dot', count: [0, 0, 200, 350, 600], size: [0.3, 1], color: '#FFD700', opacity: [0.4, 0.8], twinkleSpeed: [0.004, 0.012], lifetime: Infinity },
    { id: 'candleFlicker', behavior: 'flash', render: 'glow', spawnRate: [0, 0, 0, 0.04, 0.1], size: [2, 4], glowRadius: 8, color: '#FFAB40', opacity: [0.4, 0.8], lifetime: [10, 30] },
  ],
};

export default createModeTiers('LIBRARY', {
  tierNames: ['Closed', 'Open', 'Study Hour', 'Late Night', 'Archive Unlocked'],
  tierTooltips: ['Dark shelves', 'Warm reading light', 'Page flutters and dust', 'Candlelit atmosphere', 'Full archive revealed'],
  t1: { bgBase: '#080706', accent: '#887766', dotGridColor: 'rgba(136,119,102,0.03)' },
  t2, sceneConfig, flavorHue: 22,
});
