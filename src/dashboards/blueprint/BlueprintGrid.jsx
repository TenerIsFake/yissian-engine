import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import BlueprintCard from './BlueprintCard.jsx';
import { BLUEPRINT_LABELS } from './blueprintConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Foundation':    { x: 0.50, y: 0.10 },
  'Structural':    { x: 0.20, y: 0.18 },
  'Mechanical':    { x: 0.80, y: 0.18 },
  'Electrical':    { x: 0.12, y: 0.40 },
  'Specification': { x: 0.88, y: 0.40 },
  'Assembly':      { x: 0.35, y: 0.35 },
  'Plumbing':      { x: 0.65, y: 0.35 },
  'Insulation':    { x: 0.20, y: 0.58 },
  'Finishing':     { x: 0.50, y: 0.52 },
  'Excavation':    { x: 0.80, y: 0.58 },
  'Ventilation':   { x: 0.12, y: 0.78 },
  'Drainage':      { x: 0.88, y: 0.78 },
};

const FALLBACK_SLOTS = [
  { x: 0.35, y: 0.70 }, { x: 0.65, y: 0.70 }, { x: 0.35, y: 0.85 },
  { x: 0.65, y: 0.85 }, { x: 0.50, y: 0.85 }, { x: 0.50, y: 0.70 },
];

function buildLayout(registry) {
  const used = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const label = BLUEPRINT_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      used.add(label);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

// Blueprint uses right-angle dimension lines (horizontal then vertical)
function buildDimensionLines(layout) {
  const foundation = layout.find(p => p.label === 'Foundation');
  if (!foundation) return [];
  return layout
    .filter(p => p.label !== 'Foundation')
    .slice(0, 10)
    .map(p => {
      const midX = p.cx;
      const midY = foundation.cy;
      return {
        key: `dim-${p.el.id}`,
        d: `M${foundation.cx},${foundation.cy} L${midX},${midY} L${p.cx},${p.cy}`,
      };
    });
}

const BlueprintGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const dims   = useMemo(() => buildDimensionLines(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Blueprint background — dark blue */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(5,10,30,0.5) 0%, rgba(3,6,20,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Grid paper overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(80,140,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(80,140,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* Fine grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(80,140,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(80,140,255,0.015) 1px, transparent 1px)',
          backgroundSize: '10px 10px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* SVG: dimension lines */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {dims.map(({ key, d }) => (
            <path key={key} d={d}
              stroke="rgba(80,140,255,0.12)" strokeWidth="1" fill="none"
              strokeDasharray="6,4" />
          ))}
          {dims.map(({ key, d }) => {
            const match = d.match(/L([\d.]+),([\d.]+)$/);
            if (!match) return null;
            return <circle key={`n-${key}`} cx={match[1]} cy={match[2]} r="2" fill="rgba(80,140,255,0.3)" />;
          })}
        </svg>

        {/* Title block */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(80,140,255,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridTitle || '◆ MASTER PLAN ◆'}
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(80,140,255,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridSubtitle || '◆ ARCHITECTURAL DRAFT ◆'}
        </div>

        {/* Title block frame — bottom right */}
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.04, right: 20,
          width: 140, height: 50,
          border: '1px solid rgba(80,140,255,0.1)',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 6, color: 'rgba(80,140,255,0.2)',
            padding: 4, lineHeight: 1.4,
          }}>
            DRAWN: CLAUDE<br />
            SCALE: 1:1<br />
            SHEET: 1 OF 1
          </div>
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
              <BlueprintCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BlueprintGrid;
