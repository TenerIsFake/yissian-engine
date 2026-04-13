import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import AquariumCard from './AquariumCard.jsx';
import { AQUARIUM_LABELS } from './aquariumConfig.js';

const CARD_W = 72, CARD_H = 80, CW = 1100, CH = 700;
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Reef Tank':    { x: 0.50, y: 0.10 },
  'Deep Sea':     { x: 0.22, y: 0.20 },
  'Pelagic':      { x: 0.78, y: 0.20 },
  'Tidal Pool':   { x: 0.10, y: 0.40 },
  'Kelp Forest':  { x: 0.90, y: 0.40 },
  'Coral Garden': { x: 0.36, y: 0.36 },
  'Estuary':      { x: 0.64, y: 0.36 },
  'Mangrove':     { x: 0.22, y: 0.58 },
  'Plankton':     { x: 0.50, y: 0.54 },
  'Abyss':        { x: 0.78, y: 0.58 },
  'Predator':     { x: 0.12, y: 0.80 },
  'Jellyfish':    { x: 0.88, y: 0.80 },
};
const FALLBACK_SLOTS = [
  { x: 0.36, y: 0.72 }, { x: 0.64, y: 0.72 }, { x: 0.36, y: 0.88 },
  { x: 0.64, y: 0.88 }, { x: 0.50, y: 0.88 }, { x: 0.50, y: 0.72 },
];

function buildLayout(registry) {
  const used = new Set(); let fi = 0;
  return registry.map(el => {
    const label = AQUARIUM_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) { pos = FALLBACK_SLOTS[fi++ % FALLBACK_SLOTS.length]; }
    else { used.add(label); }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

function buildCurrents(layout) {
  const reef = layout.find(p => p.label === 'Reef Tank');
  if (!reef) return [];
  return layout.filter(p => p.label !== 'Reef Tank').slice(0, 10).map(p => {
    const mx = (reef.cx + p.cx) / 2 + (p.cy > reef.cy ? 30 : -30);
    const my = (reef.cy + p.cy) / 2;
    return { key: `current-${p.el.id}`, d: `M${reef.cx},${reef.cy} Q${mx},${my} ${p.cx},${p.cy}` };
  });
}

const AquariumGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const currents = useMemo(() => buildCurrents(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,8,20,0.5) 0%, rgba(0,4,12,0.3) 100%)', borderRadius: 4 }} />
        {/* Water caustics */}
        <div style={{ position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse 80px 30px, rgba(60,180,255,0.02) 0%, transparent 100%)',
          backgroundSize: '120px 80px', pointerEvents: 'none', borderRadius: 4 }} />
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {currents.map(({ key, d }) => (
            <path key={key} d={d} stroke="rgba(60,180,255,0.08)" strokeWidth="2" fill="none" strokeLinecap="round" />
          ))}
        </svg>
        <div aria-hidden="true" style={{ position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(60,180,255,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridTitle || '◆ AQUARIUM ◆'}
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(60,180,255,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridSubtitle || '◆ TANK MAP ◆'}
        </div>
        {layout.map(({ el, cx, cy }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          const level = stats.level ?? 0;
          const breathAnim = prefersReducedMotion ? {} : level > 80 ? { y: [0, -3, 0] } : level > 50 ? { y: [0, -2, 0] } : level > 15 ? { y: [0, -1, 0] } : {};
          const breathTrans = (level > 15 && !prefersReducedMotion) ? { duration: level > 80 ? 0.6 : level > 50 ? 1.0 : 2.0, repeat: Infinity, ease: 'easeInOut' } : {};
          return (
            <motion.div key={el.id} style={{ position: 'absolute', left: cx - CARD_W / 2, top: cy - CARD_H / 2 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }} animate={breathAnim} transition={breathTrans}>
              <AquariumCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AquariumGrid;
