import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import HeistCard from './HeistCard.jsx';
import { HEIST_LABELS } from './heistConfig.js';

const CARD_W = 72, CARD_H = 80, CW = 1100, CH = 700;
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'The Vault':   { x: 0.50, y: 0.10 },
  'Safe House':  { x: 0.20, y: 0.20 },
  'Getaway':     { x: 0.80, y: 0.20 },
  'Surveillance':{ x: 0.10, y: 0.40 },
  'The Mark':    { x: 0.90, y: 0.40 },
  'Crew':        { x: 0.36, y: 0.36 },
  'Fence':       { x: 0.64, y: 0.36 },
  'Tech':        { x: 0.22, y: 0.58 },
  'Lookout':     { x: 0.50, y: 0.54 },
  'Tunnels':     { x: 0.78, y: 0.58 },
  'Muscle':      { x: 0.12, y: 0.80 },
  'Inside Man':  { x: 0.88, y: 0.80 },
};
const FALLBACK_SLOTS = [
  { x: 0.36, y: 0.72 }, { x: 0.64, y: 0.72 }, { x: 0.36, y: 0.88 },
  { x: 0.64, y: 0.88 }, { x: 0.50, y: 0.88 }, { x: 0.50, y: 0.72 },
];

function buildLayout(registry) {
  const used = new Set(); let fi = 0;
  return registry.map(el => {
    const label = HEIST_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) { pos = FALLBACK_SLOTS[fi++ % FALLBACK_SLOTS.length]; }
    else { used.add(label); }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

function buildLaserGrid(layout) {
  const vault = layout.find(p => p.label === 'The Vault');
  if (!vault) return [];
  return layout.filter(p => p.label !== 'The Vault').slice(0, 10).map(p => ({
    key: `laser-${p.el.id}`, x1: vault.cx, y1: vault.cy, x2: p.cx, y2: p.cy,
  }));
}

const HeistGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const lasers = useMemo(() => buildLaserGrid(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,5,5,0.5) 0%, rgba(5,2,2,0.3) 100%)', borderRadius: 4 }} />
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {lasers.map(({ key, x1, y1, x2, y2 }) => (
            <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,50,50,0.06)" strokeWidth="1" strokeDasharray="3,8" />
          ))}
        </svg>
        <div aria-hidden="true" style={{ position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,50,50,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridTitle || '◆ THE HEIST ◆'}
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,50,50,0.25)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
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
              <HeistCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HeistGrid;
