import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import TacticalCard from './TacticalCard.jsx';
import { TACTICAL_LABELS } from './tacticalConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Command Post':  { x: 0.50, y: 0.12 },
  'Comm Center':   { x: 0.24, y: 0.20 },
  'Fire Team':     { x: 0.76, y: 0.20 },
  'Recon':         { x: 0.10, y: 0.42 },
  'Intel':         { x: 0.90, y: 0.42 },
  'Operations':    { x: 0.38, y: 0.38 },
  'Logistics':     { x: 0.62, y: 0.38 },
  'Signals':       { x: 0.24, y: 0.60 },
  'Supply':        { x: 0.50, y: 0.54 },
  'Support Ops':   { x: 0.76, y: 0.60 },
  'Ordnance':      { x: 0.10, y: 0.80 },
  'Medevac':       { x: 0.90, y: 0.80 },
};

const FALLBACK_SLOTS = [
  { x: 0.38, y: 0.68 }, { x: 0.62, y: 0.68 }, { x: 0.38, y: 0.82 },
  { x: 0.62, y: 0.82 }, { x: 0.50, y: 0.82 }, { x: 0.50, y: 0.68 },
];

function buildLayout(registry) {
  const used = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const label = TACTICAL_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      used.add(label);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

function buildCommsLines(layout) {
  const hq = layout.find(p => p.label === 'Command Post');
  if (!hq) return [];
  return layout
    .filter(p => p.label !== 'Command Post')
    .slice(0, 10)
    .map(p => ({
      key: `comm-${p.el.id}`,
      x1: hq.cx, y1: hq.cy,
      x2: p.cx, y2: p.cy,
      mx: (hq.cx + p.cx) / 2,
      my: (hq.cy + p.cy) / 2 + 15,
    }));
}

const TacticalGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const comms  = useMemo(() => buildCommsLines(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Tactical background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(5,20,10,0.5) 0%, rgba(3,12,6,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,255,100,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* Radar sweep at command post */}
        <div style={{
          position: 'absolute', left: CW * 0.5 - 90, top: 0, width: 180, height: 130,
          background: 'radial-gradient(ellipse, rgba(0,180,80,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* SVG: comm lines */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {comms.map(({ key, x1, y1, x2, y2, mx, my }) => (
            <path key={key} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
              stroke="rgba(0,180,80,0.15)" strokeWidth="1.5" fill="none"
              strokeDasharray="4,6" />
          ))}
          {comms.map(({ key, x2, y2 }) => (
            <circle key={`n-${key}`} cx={x2} cy={y2} r="2" fill="rgba(0,200,100,0.35)" />
          ))}
        </svg>

        {/* Title */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(0,200,100,0.2)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridTitle || '◆ COMMAND CENTER ◆'}
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(0,200,100,0.2)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridSubtitle || '◆ TACTICAL MAP ◆'}
        </div>

        {/* Cards */}
        {layout.map(({ el, cx, cy }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          const level = stats.level ?? 0;
          const breathAnim = prefersReducedMotion ? {} :
            level > 80 ? { y: [0, -3, 0] } :
            level > 50 ? { y: [0, -2, 0] } :
            level > 15 ? { y: [0, -1, 0] } : {};
          const breathTrans = (level > 15 && !prefersReducedMotion)
            ? { duration: level > 80 ? 0.6 : level > 50 ? 1.0 : 2.0, repeat: Infinity, ease: 'easeInOut' }
            : {};
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: cx - CARD_W / 2, top: cy - CARD_H / 2 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }}
              animate={breathAnim} transition={breathTrans}
            >
              <TacticalCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TacticalGrid;
