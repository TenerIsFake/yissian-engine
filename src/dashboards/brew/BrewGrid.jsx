import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import BrewCard from './BrewCard.jsx';
import { BREW_LABELS } from './brewConfig.js';

const CARD_W = 72, CARD_H = 80, CW = 1100, CH = 700;
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Kettle':       { x: 0.50, y: 0.10 },
  'Mash Tun':     { x: 0.22, y: 0.20 },
  'Fermenter':    { x: 0.78, y: 0.20 },
  'Hop Back':     { x: 0.10, y: 0.40 },
  'Cask':         { x: 0.90, y: 0.40 },
  'Bottling':     { x: 0.36, y: 0.36 },
  'Grain Silo':   { x: 0.64, y: 0.36 },
  'Yeast Bank':   { x: 0.22, y: 0.58 },
  'Tasting Room': { x: 0.50, y: 0.54 },
  'Cold Storage': { x: 0.78, y: 0.58 },
  'Tap Room':     { x: 0.12, y: 0.80 },
  'Barrel Room':  { x: 0.88, y: 0.80 },
};
const FALLBACK_SLOTS = [
  { x: 0.36, y: 0.72 }, { x: 0.64, y: 0.72 }, { x: 0.36, y: 0.88 },
  { x: 0.64, y: 0.88 }, { x: 0.50, y: 0.88 }, { x: 0.50, y: 0.72 },
];

function buildLayout(registry) {
  const used = new Set(); let fi = 0;
  return registry.map(el => {
    const label = BREW_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) { pos = FALLBACK_SLOTS[fi++ % FALLBACK_SLOTS.length]; }
    else { used.add(label); }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

// Brewery pipes — copper tubing with right angles
function buildPipes(layout) {
  const kettle = layout.find(p => p.label === 'Kettle');
  if (!kettle) return [];
  return layout.filter(p => p.label !== 'Kettle').slice(0, 10).map(p => ({
    key: `pipe-${p.el.id}`,
    d: `M${kettle.cx},${kettle.cy} L${kettle.cx},${p.cy} L${p.cx},${p.cy}`,
  }));
}

const BrewGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const pipes = useMemo(() => buildPipes(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,8,4,0.5) 0%, rgba(8,5,2,0.3) 100%)', borderRadius: 4 }} />
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {pipes.map(({ key, d }) => (
            <path key={key} d={d} stroke="rgba(200,150,60,0.08)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
        <div aria-hidden="true" style={{ position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(200,150,60,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridTitle || '◆ BREWERY ◆'}
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(200,150,60,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridSubtitle || '◆ BREW FLOOR ◆'}
        </div>
        {layout.map(({ el, cx, cy }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          const level = stats.level ?? 0;
          const breathAnim = prefersReducedMotion ? {} : level > 80 ? { y: [0, -3, 0] } : level > 50 ? { y: [0, -2, 0] } : level > 15 ? { y: [0, -1, 0] } : {};
          const breathTrans = (level > 15 && !prefersReducedMotion) ? { duration: level > 80 ? 0.6 : level > 50 ? 1.0 : 2.0, repeat: Infinity, ease: 'easeInOut' } : {};
          return (
            <motion.div key={el.id} style={{ position: 'absolute', left: cx - CARD_W / 2, top: cy - CARD_H / 2 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }} animate={breathAnim} transition={breathTrans}>
              <BrewCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BrewGrid;
