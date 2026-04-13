import { createModeTiers } from '../paletteHelpers.js';

const t2 = {
  bgBase: '#0A0505',
  accent: '#FF3333',
  dotGridColor: 'rgba(255,51,51,0.03)',
  cat: {
    ALKALI:     { bg: 'rgba(255,51,51,0.09)',     border: '#FF3333', text: '#FF5555', glow: 'rgba(255,51,51,0.45)' },
    ALKALINE:   { bg: 'rgba(200,160,80,0.09)',    border: '#C8A050', text: '#D8B060', glow: 'rgba(200,160,80,0.40)' },
    TRANSITION: { bg: 'rgba(100,100,100,0.09)',   border: '#646464', text: '#787878', glow: 'rgba(100,100,100,0.45)' },
    HALOGEN:    { bg: 'rgba(255,200,50,0.09)',    border: '#FFC832', text: '#FFD850', glow: 'rgba(255,200,50,0.40)' },
    NOBLE:      { bg: 'rgba(180,180,180,0.09)',   border: '#B4B4B4', text: '#C8C8C8', glow: 'rgba(180,180,180,0.45)' },
    LANTHANIDE: { bg: 'rgba(255,100,50,0.09)',    border: '#FF6432', text: '#FF7848', glow: 'rgba(255,100,50,0.40)' },
    POST:       { bg: 'rgba(80,80,80,0.07)',      border: '#505050', text: '#606060', glow: 'rgba(80,80,80,0.30)' },
    METALLOID:  { bg: 'rgba(50,200,50,0.07)',     border: '#32C832', text: '#48D848', glow: 'rgba(50,200,50,0.30)' },
    NONMETAL:   { bg: 'rgba(200,200,200,0.07)',   border: '#C8C8C8', text: '#D8D8D8', glow: 'rgba(200,200,200,0.25)' },
    ACTINIDE:   { bg: 'rgba(140,50,50,0.07)',     border: '#8C3232', text: '#A04242', glow: 'rgba(140,50,50,0.30)' },
    PNICTOGEN:  { bg: 'rgba(255,80,80,0.09)',     border: '#FF5050', text: '#FF6868', glow: 'rgba(255,80,80,0.45)' },
    CHALCOGEN:  { bg: 'rgba(200,200,50,0.09)',    border: '#C8C832', text: '#D8D848', glow: 'rgba(200,200,50,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    { id: 'laserBeam', behavior: 'linear', render: 'trail', spawnRate: [0, 0, 0.14, 0.35, 0.7], speed: [4, 8], angle: [0, 360], size: [0.5, 1], trailLength: 12, color: '#FF3333', opacity: 0.6, lifetime: [10, 20] },
    { id: 'sparkle', behavior: 'flash', render: 'glow', spawnRate: [0, 0, 0.09, 0.21, 0.44], size: [1, 3], glowRadius: 8, color: '#FFD700', opacity: 0.975, lifetime: [8, 18], cascade: true },
    { id: 'smokePuff', behavior: 'rise', render: 'glow', spawnRate: [0, 0, 0, 0.08, 0.26], speed: [0.2, 0.6], size: [3, 6], glowRadius: 10, color: 'rgba(150,150,150,0.2)', opacity: 0.42, lifetime: [40, 100] },
    { id: 'alarmFlash', behavior: 'flash', render: 'glow', spawnRate: [0, 0, 0, 0.06, 0.16], size: [3, 6], glowRadius: 14, color: '#FF2222', opacity: 0.9, lifetime: [5, 12] },
    { id: 'vaultDust', behavior: 'fall', render: 'dot', spawnRate: [0, 0, 0, 0.05, 0.14], speed: [0.3, 0.8], size: [1, 2], color: '#B0A080', opacity: 0.45, lifetime: [50, 120], cascade: true },
    { id: 'lockPick', behavior: 'twinkle', render: 'dot', spawnRate: [0, 0, 0, 0.04, 0.1], size: [1, 2], color: '#CCCCCC', opacity: 0.75, lifetime: [15, 35] },
  ],
};

export default createModeTiers('HEIST', {
  tierNames: ['Casing', 'Planning', 'In Progress', 'Alarm', 'Getaway'],
  tierTooltips: ['Dark recon', 'Red and gold planning', 'Laser grid active', 'Alarm lights flashing', 'Full heist chaos'],
  t1: { bgBase: '#080505', accent: '#886666', dotGridColor: 'rgba(136,102,102,0.03)' },
  t2, sceneConfig, flavorHue: 0,
});
