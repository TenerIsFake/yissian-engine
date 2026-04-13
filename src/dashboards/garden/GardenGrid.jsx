import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import GardenCard from './GardenCard.jsx';
import { GARDEN_LABELS } from './gardenConfig.js';

const CARD_W = 72, CARD_H = 80, CW = 1100, CH = 700;
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Rose Bed':      { x: 0.50, y: 0.10 },
  'Herb Spiral':   { x: 0.22, y: 0.20 },
  'Orchard':       { x: 0.78, y: 0.20 },
  'Greenhouse':    { x: 0.10, y: 0.40 },
  'Bonsai':        { x: 0.90, y: 0.40 },
  'Meadow':        { x: 0.36, y: 0.36 },
  'Compost':       { x: 0.64, y: 0.36 },
  'Trellis':       { x: 0.22, y: 0.58 },
  'Moss':          { x: 0.50, y: 0.54 },
  'Root Cellar':   { x: 0.78, y: 0.58 },
  'Vine':          { x: 0.12, y: 0.80 },
  'Water Feature': { x: 0.88, y: 0.80 },
};
const FALLBACK_SLOTS = [
  { x: 0.36, y: 0.72 }, { x: 0.64, y: 0.72 }, { x: 0.36, y: 0.88 },
  { x: 0.64, y: 0.88 }, { x: 0.50, y: 0.88 }, { x: 0.50, y: 0.72 },
];

function buildLayout(registry) {
  const used = new Set(); let fi = 0;
  return registry.map(el => {
    const label = GARDEN_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) { pos = FALLBACK_SLOTS[fi++ % FALLBACK_SLOTS.length]; }
    else { used.add(label); }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

// Garden paths — stepping stones
function buildPaths(layout) {
  const rose = layout.find(p => p.label === 'Rose Bed');
  if (!rose) return [];
  return layout.filter(p => p.label !== 'Rose Bed').slice(0, 10).map(p => {
    const mx = (rose.cx + p.cx) / 2 + (Math.random() > 0.5 ? 20 : -20);
    const my = (rose.cy + p.cy) / 2 + 15;
    return { key: `path-${p.el.id}`, d: `M${rose.cx},${rose.cy} Q${mx},${my} ${p.cx},${p.cy}` };
  });
}

const GardenGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const paths = useMemo(() => buildPaths(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,12,5,0.5) 0%, rgba(3,8,3,0.3) 100%)', borderRadius: 4 }} />
        {/* Grass texture */}
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle 0.5px, rgba(60,120,40,0.04) 0.5px, transparent 0.5px)',
          backgroundSize: '12px 12px', pointerEvents: 'none', borderRadius: 4 }} />
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {paths.map(({ key, d }) => (
            <path key={key} d={d} stroke="rgba(160,140,100,0.08)" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="6,10" />
          ))}
        </svg>
        <div aria-hidden="true" style={{ position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(100,160,60,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridTitle || '◆ BOTANICAL GARDEN ◆'}
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(100,160,60,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridSubtitle || '◆ GARDEN MAP ◆'}
        </div>
        {layout.map(({ el, cx, cy }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          const level = stats.level ?? 0;
          const breathAnim = prefersReducedMotion ? {} : level > 80 ? { y: [0, -3, 0] } : level > 50 ? { y: [0, -2, 0] } : level > 15 ? { y: [0, -1, 0] } : {};
          const breathTrans = (level > 15 && !prefersReducedMotion) ? { duration: level > 80 ? 0.6 : level > 50 ? 1.0 : 2.0, repeat: Infinity, ease: 'easeInOut' } : {};
          return (
            <motion.div key={el.id} style={{ position: 'absolute', left: cx - CARD_W / 2, top: cy - CARD_H / 2 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }} animate={breathAnim} transition={breathTrans}>
              <GardenCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GardenGrid;
