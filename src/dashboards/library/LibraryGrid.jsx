import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import LibraryCard from './LibraryCard.jsx';
import { LIBRARY_LABELS } from './libraryConfig.js';

const CARD_W = 72, CARD_H = 80, CW = 1100, CH = 700;
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Reference':    { x: 0.50, y: 0.10 },
  'Fiction':      { x: 0.22, y: 0.20 },
  'Non-Fiction':  { x: 0.78, y: 0.20 },
  'Periodicals':  { x: 0.10, y: 0.40 },
  'Rare Books':   { x: 0.90, y: 0.40 },
  'Archives':     { x: 0.36, y: 0.36 },
  'Returns':      { x: 0.64, y: 0.36 },
  'Study Room':   { x: 0.22, y: 0.58 },
  'Children':     { x: 0.50, y: 0.54 },
  'Basement':     { x: 0.78, y: 0.58 },
  'New Arrivals': { x: 0.12, y: 0.80 },
  'Digital':      { x: 0.88, y: 0.80 },
};
const FALLBACK_SLOTS = [
  { x: 0.36, y: 0.72 }, { x: 0.64, y: 0.72 }, { x: 0.36, y: 0.88 },
  { x: 0.64, y: 0.88 }, { x: 0.50, y: 0.88 }, { x: 0.50, y: 0.72 },
];

function buildLayout(registry) {
  const used = new Set(); let fi = 0;
  return registry.map(el => {
    const label = LIBRARY_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) { pos = FALLBACK_SLOTS[fi++ % FALLBACK_SLOTS.length]; }
    else { used.add(label); }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

// Library aisles — straight horizontal shelf lines
function buildAisles(layout) {
  const ref = layout.find(p => p.label === 'Reference');
  if (!ref) return [];
  return layout.filter(p => p.label !== 'Reference').slice(0, 10).map(p => ({
    key: `aisle-${p.el.id}`,
    d: `M${ref.cx},${ref.cy} L${ref.cx},${(ref.cy + p.cy) / 2} L${p.cx},${(ref.cy + p.cy) / 2} L${p.cx},${p.cy}`,
  }));
}

const LibraryGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const aisles = useMemo(() => buildAisles(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,5,0.5) 0%, rgba(6,5,3,0.3) 100%)', borderRadius: 4 }} />
        {/* Shelf lines */}
        {[0.28, 0.48, 0.68].map(y => (
          <div key={y} aria-hidden="true" style={{ position: 'absolute', top: `${y * 100}%`, left: '5%', right: '5%',
            height: 1, background: 'rgba(160,140,100,0.05)', pointerEvents: 'none' }} />
        ))}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {aisles.map(({ key, d }) => (
            <path key={key} d={d} stroke="rgba(160,140,100,0.06)" strokeWidth="1" fill="none" strokeDasharray="4,8" />
          ))}
        </svg>
        <div aria-hidden="true" style={{ position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(160,140,100,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridTitle || '◆ LIBRARY ◆'}
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(160,140,100,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridSubtitle || '◆ FLOOR PLAN ◆'}
        </div>
        {layout.map(({ el, cx, cy }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          const level = stats.level ?? 0;
          const breathAnim = prefersReducedMotion ? {} : level > 80 ? { y: [0, -3, 0] } : level > 50 ? { y: [0, -2, 0] } : level > 15 ? { y: [0, -1, 0] } : {};
          const breathTrans = (level > 15 && !prefersReducedMotion) ? { duration: level > 80 ? 0.6 : level > 50 ? 1.0 : 2.0, repeat: Infinity, ease: 'easeInOut' } : {};
          return (
            <motion.div key={el.id} style={{ position: 'absolute', left: cx - CARD_W / 2, top: cy - CARD_H / 2 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }} animate={breathAnim} transition={breathTrans}>
              <LibraryCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryGrid;
