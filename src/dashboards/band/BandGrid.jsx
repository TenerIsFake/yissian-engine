import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import BandCard from './BandCard.jsx';
import { BAND_OVERLAY } from './bandConfig.js';

const CARD_W = 82, CARD_H = 88;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Stage plot coordinates as % of container
const STAGE_POSITIONS = {
  'Lead Vocalist':  { x: 0.50, y: 0.76 },
  'Tour Manager':   { x: 0.50, y: 0.91 },
  'Sound Engineer': { x: 0.08, y: 0.88 },
  'Rhythm Guitar':  { x: 0.66, y: 0.55 },
  'Lead Guitar':    { x: 0.34, y: 0.55 },
  'Bass Guitar':    { x: 0.18, y: 0.48 },
  'Drums':          { x: 0.50, y: 0.20 },
  'Keyboards':      { x: 0.82, y: 0.30 },
  'Backing Vocals': { x: 0.50, y: 0.42 },
  'Rhythm Section': { x: 0.30, y: 0.35 },
  'Horn Section':   { x: 0.70, y: 0.35 },
  'Turntablist':    { x: 0.85, y: 0.52 },
  'Roadie':         { x: 0.92, y: 0.88 },
  'Security':       { x: 0.08, y: 0.50 },
  'String Section': { x: 0.18, y: 0.26 },
  'Lyricist':       { x: 0.82, y: 0.65 },
};

const FALLBACK_SLOTS = [
  { x: 0.28, y: 0.64 }, { x: 0.72, y: 0.64 }, { x: 0.15, y: 0.72 },
  { x: 0.85, y: 0.72 }, { x: 0.42, y: 0.28 }, { x: 0.58, y: 0.28 },
];

function buildLayout(registry) {
  const usedRoles = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const role = BAND_OVERLAY[el.id]?.role ?? '';
    let pos = STAGE_POSITIONS[role];
    if (!pos || usedRoles.has(role)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      usedRoles.add(role);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, role };
  });
}

const BandGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);

  // XLR cable connections from FOH/Sound Engineer → performers
  const cables = useMemo(() => {
    const foh = layout.filter(p => ['Sound Engineer', 'Tour Manager'].includes(p.role));
    const performers = layout.filter(p => !['Sound Engineer', 'Tour Manager', 'Roadie'].includes(p.role));
    const lines = [];
    foh.forEach(f => {
      performers.slice(0, 7).forEach(p => {
        const mx = (f.cx + p.cx) / 2, my = (f.cy + p.cy) / 2 + 25;
        lines.push({ key: `m-${f.el.id}-${p.el.id}`, x1: f.cx, y1: f.cy, x2: p.cx, y2: p.cy, mx, my, monitor: true });
      });
    });
    for (let i = 0; i < performers.length - 1; i++) {
      const a = performers[i], b = performers[i + 1];
      lines.push({ key: `c-${i}`, x1: a.cx, y1: a.cy, x2: b.cx, y2: b.cy, mx: (a.cx + b.cx) / 2, my: (a.cy + b.cy) / 2 + 18, monitor: false });
    }
    return lines;
  }, [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Stage platform */}
        <div style={{ position: 'absolute', left: CW * 0.05, right: CW * 0.05, top: CH * 0.12, height: CH * 0.70,
          background: 'rgba(255,255,255,0.013)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }} />
        {/* Stage front lip */}
        <div style={{ position: 'absolute', left: CW * 0.05, right: CW * 0.05, top: CH * 0.80, height: 2, background: 'rgba(255,255,255,0.1)' }} />
        {/* Audience area */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: CH * 0.17,
          background: 'rgba(0,0,0,0.2)', borderTop: '1px dashed rgba(255,255,255,0.07)' }} />

        <div style={{ position: 'absolute', bottom: CH * 0.04, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridTitle || '◆ AUDIENCE ◆'}
        </div>
        <div style={{ position: 'absolute', top: CH * 0.03, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.4em', pointerEvents: 'none' }}>
          {gridSubtitle || '◆ BACKLINE ◆'}
        </div>

        {/* XLR cables SVG */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {cables.map(({ key, x1, y1, x2, y2, mx, my, monitor }) => (
            <path key={key} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
              stroke={monitor ? 'rgba(100,200,255,0.22)' : 'rgba(255,185,55,0.16)'}
              strokeWidth={monitor ? 1 : 0.8} fill="none"
              strokeDasharray={monitor ? '4,5' : undefined} />
          ))}
          {cables.filter(c => !c.monitor).map(c => (
            <g key={`j-${c.key}`}>
              <circle cx={c.x1} cy={c.y1} r="2.5" fill="rgba(255,185,55,0.45)" />
              <circle cx={c.x2} cy={c.y2} r="2.5" fill="rgba(255,185,55,0.45)" />
            </g>
          ))}
        </svg>

        {/* Spotlight on vocalist */}
        <div style={{ position: 'absolute', left: CW * 0.5 - 55, top: CH * 0.76 - 55,
          width: 110, height: 110, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(255,220,80,0.07) 0%, transparent 70%)' }} />

        {/* Service cards */}
        {layout.map(({ el, cx, cy, role }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: cx - CARD_W / 2, top: cy - CARD_H / 2 }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }}
              animate={prefersReducedMotion ? {} :
                role === 'Lead Vocalist' ? { scale: [1, 1.025, 1] } :
                role === 'Drums' ? { y: [0, -1.5, 0] } : {}
              }
              transition={(!prefersReducedMotion && (role === 'Lead Vocalist' || role === 'Drums'))
                ? { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
              <BandCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BandGrid;
