import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ApothecaryCard from './ApothecaryCard.jsx';
import { APOTHECARY_LABELS } from './apothecaryConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Elixirs':      { x: 0.50, y: 0.10 },
  'Tinctures':    { x: 0.25, y: 0.20 },
  'Decoctions':   { x: 0.75, y: 0.20 },
  'Salves':       { x: 0.10, y: 0.42 },
  'Essences':     { x: 0.90, y: 0.42 },
  'Tonics':       { x: 0.38, y: 0.38 },
  'Poultices':    { x: 0.62, y: 0.38 },
  'Balms':        { x: 0.25, y: 0.60 },
  'Infusions':    { x: 0.50, y: 0.55 },
  'Distillates':  { x: 0.75, y: 0.60 },
  'Philters':     { x: 0.10, y: 0.80 },
  'Syrups':       { x: 0.90, y: 0.80 },
};

const FALLBACK_SLOTS = [
  { x: 0.38, y: 0.72 }, { x: 0.62, y: 0.72 }, { x: 0.38, y: 0.88 },
  { x: 0.62, y: 0.88 }, { x: 0.50, y: 0.88 }, { x: 0.50, y: 0.72 },
];

function buildLayout(registry) {
  const used = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const label = APOTHECARY_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      used.add(label);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

// Apothecary uses curved tubing connections (alchemical apparatus)
function buildTubing(layout) {
  const elixirs = layout.find(p => p.label === 'Elixirs');
  if (!elixirs) return [];
  return layout
    .filter(p => p.label !== 'Elixirs')
    .slice(0, 10)
    .map(p => ({
      key: `tube-${p.el.id}`,
      x1: elixirs.cx, y1: elixirs.cy,
      x2: p.cx, y2: p.cy,
      cx1: elixirs.cx, cy1: (elixirs.cy + p.cy) * 0.45,
      cx2: p.cx, cy2: (elixirs.cy + p.cy) * 0.55,
    }));
}

const ApothecaryGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const tubes  = useMemo(() => buildTubing(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Apothecary background — dark amber */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,10,5,0.5) 0%, rgba(10,6,2,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Shelf lines */}
        {[0.28, 0.50, 0.72].map(y => (
          <div key={y} aria-hidden="true" style={{
            position: 'absolute', top: `${y * 100}%`, left: '5%', right: '5%',
            height: 1, background: 'rgba(180,130,50,0.06)', pointerEvents: 'none',
          }} />
        ))}

        {/* Warm glow from center */}
        <div style={{
          position: 'absolute', left: '35%', right: '35%', top: '30%', bottom: '30%',
          background: 'radial-gradient(ellipse, rgba(200,150,50,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* SVG: glass tubing connections */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {tubes.map(({ key, x1, y1, x2, y2, cx1, cy1, cx2, cy2 }) => (
            <path key={key}
              d={`M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`}
              stroke="rgba(200,150,50,0.1)" strokeWidth="1.5" fill="none" />
          ))}
          {tubes.map(({ key, x2, y2 }) => (
            <circle key={`n-${key}`} cx={x2} cy={y2} r="2.5"
              fill="none" stroke="rgba(200,150,50,0.2)" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Title */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(200,150,50,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridTitle || '◆ APOTHECARIUM ◆'}
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(200,150,50,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridSubtitle || '◆ REMEDY SHELF ◆'}
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
              <ApothecaryCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ApothecaryGrid;
