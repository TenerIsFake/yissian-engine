import { createModeTiers } from '../paletteHelpers.js';

const t2 = {
  bgBase: '#0A0804',
  accent: '#C89632',
  dotGridColor: 'rgba(200,150,50,0.04)',
  cat: {
    ALKALI:     { bg: 'rgba(200,150,50,0.09)',    border: '#C89632', text: '#D8A642', glow: 'rgba(200,150,50,0.45)' },
    ALKALINE:   { bg: 'rgba(160,100,30,0.09)',    border: '#A0641E', text: '#B0742E', glow: 'rgba(160,100,30,0.40)' },
    TRANSITION: { bg: 'rgba(180,140,60,0.09)',    border: '#B48C3C', text: '#C49C4C', glow: 'rgba(180,140,60,0.45)' },
    HALOGEN:    { bg: 'rgba(120,180,60,0.09)',    border: '#78B43C', text: '#88C44C', glow: 'rgba(120,180,60,0.40)' },
    NOBLE:      { bg: 'rgba(120,80,30,0.09)',     border: '#78501E', text: '#88602E', glow: 'rgba(120,80,30,0.45)' },
    LANTHANIDE: { bg: 'rgba(220,180,80,0.09)',    border: '#DCB450', text: '#ECC460', glow: 'rgba(220,180,80,0.40)' },
    POST:       { bg: 'rgba(100,70,30,0.07)',     border: '#64461E', text: '#74562E', glow: 'rgba(100,70,30,0.30)' },
    METALLOID:  { bg: 'rgba(140,120,60,0.07)',    border: '#8C783C', text: '#9C884C', glow: 'rgba(140,120,60,0.30)' },
    NONMETAL:   { bg: 'rgba(240,220,180,0.07)',   border: '#F0DCB4', text: '#FFECC8', glow: 'rgba(240,220,180,0.25)' },
    ACTINIDE:   { bg: 'rgba(80,50,20,0.07)',      border: '#503214', text: '#604224', glow: 'rgba(80,50,20,0.30)' },
    PNICTOGEN:  { bg: 'rgba(180,120,40,0.09)',    border: '#B47828', text: '#C48838', glow: 'rgba(180,120,40,0.45)' },
    CHALCOGEN:  { bg: 'rgba(255,240,200,0.09)',   border: '#FFF0C8', text: '#FFFFD8', glow: 'rgba(255,240,200,0.40)' },
  },
};

const sceneConfig = {
  particles: [
    { id: 'foam', behavior: 'rise', render: 'dot', spawnRate: [0, 0, 0.18, 0.44, 0.88], speed: [0.2, 0.6], size: [1, 3], color: '#FFF0C8', opacity: 0.42, lifetime: [40, 100] },
    { id: 'carbonation', behavior: 'rise', render: 'dot', spawnRate: [0, 0, 0.14, 0.35, 0.7], speed: [0.5, 1.5], size: [0.5, 1.5], color: '#C89632', opacity: 0.6, lifetime: [30, 80] },
    { id: 'hopSpark', behavior: 'flash', render: 'glow', spawnRate: [0, 0, 0, 0.08, 0.26], size: [1, 3], glowRadius: 6, color: '#78B43C', opacity: 0.83, lifetime: [10, 25], cascade: true },
    { id: 'hopsAroma', behavior: 'rise', render: 'glow', spawnRate: [0, 0, 0.05, 0.12, 0.25], speed: [0.15, 0.5], size: [2, 4], glowRadius: 8, color: '#88C44C', opacity: 0.4, lifetime: [60, 140] },
    { id: 'beerDrip', behavior: 'fall', render: 'trail', spawnRate: [0, 0, 0, 0.06, 0.15], speed: [0.4, 1.2], size: [0.5, 1.5], trailLength: 10, color: '#C89632', opacity: 0.53, lifetime: [30, 80], cascade: true },
    { id: 'caskSteam', behavior: 'drift', render: 'glow', spawnRate: [0, 0, 0.04, 0.1, 0.2], speed: [0.1, 0.4], size: [3, 6], glowRadius: 12, color: 'rgba(200,180,140,0.3)', opacity: 0.4, lifetime: [80, 180] },
  ],
};

export default createModeTiers('BREW', {
  tierNames: ['Empty', 'Mashing', 'Fermenting', 'Conditioning', 'Tap Night'],
  tierTooltips: ['Cold copper', 'Warm amber palette', 'Bubbling fermentation', 'Golden conditioning', 'Full tap room celebration'],
  t1: { bgBase: '#090806', accent: '#998866', dotGridColor: 'rgba(153,136,102,0.03)' },
  t2, sceneConfig, flavorHue: 48,
});
