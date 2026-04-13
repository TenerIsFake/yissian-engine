import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import MetroCard from './MetroCard.jsx';
import { METRO_LABELS } from './metroConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Transit map layout — stations along colored lines
const POSITION_MAP = {
  'Central Station': { x: 0.50, y: 0.12 },
  'Interchange':     { x: 0.25, y: 0.20 },
  'Express Line':    { x: 0.75, y: 0.20 },
  'Local Stop':      { x: 0.10, y: 0.38 },
  'Terminal':         { x: 0.90, y: 0.38 },
  'Junction':        { x: 0.38, y: 0.35 },
  'Platform':        { x: 0.62, y: 0.35 },
  'Depot':           { x: 0.22, y: 0.55 },
  'Concourse':       { x: 0.50, y: 0.52 },
  'Maintenance':     { x: 0.78, y: 0.55 },
  'Transfer':        { x: 0.15, y: 0.78 },
  'Loop':            { x: 0.85, y: 0.78 },
};

const FALLBACK_SLOTS = [
  { x: 0.38, y: 0.68 }, { x: 0.62, y: 0.68 }, { x: 0.38, y: 0.85 },
  { x: 0.62, y: 0.85 }, { x: 0.50, y: 0.85 }, { x: 0.50, y: 0.68 },
];

// Transit line route definitions for SVG
const ROUTES = [
  // Red line: Central → Interchange → Local Stop → Transfer
  { color: 'rgba(255,51,51,0.15)', width: 3, stops: ['Central Station', 'Interchange', 'Local Stop', 'Transfer'] },
  // Yellow line: Central → Junction → Express Line → Terminal
  { color: 'rgba(255,215,0,0.15)', width: 3, stops: ['Central Station', 'Junction', 'Express Line', 'Terminal'] },
  // Green line: Interchange → Depot → Concourse → Maintenance
  { color: 'rgba(51,204,102,0.12)', width: 3, stops: ['Interchange', 'Depot', 'Concourse', 'Maintenance'] },
  // Orange line: Platform → Concourse → Loop
  { color: 'rgba(255,136,51,0.12)', width: 3, stops: ['Platform', 'Concourse', 'Loop'] },
  // Purple line: Depot → Transfer → Loop
  { color: 'rgba(170,102,255,0.12)', width: 3, stops: ['Depot', 'Transfer'] },
];

function buildLayout(registry) {
  const used = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const label = METRO_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      used.add(label);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

function buildRouteLines(layout) {
  const labelMap = {};
  for (const item of layout) {
    if (!labelMap[item.label]) labelMap[item.label] = item;
  }
  const lines = [];
  for (const route of ROUTES) {
    const points = route.stops
      .map(s => labelMap[s])
      .filter(Boolean);
    if (points.length < 2) continue;
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx},${p.cy}`).join(' ');
    lines.push({ key: `route-${route.stops[0]}`, d, color: route.color, width: route.width });
  }
  return lines;
}

const MetroGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const routes = useMemo(() => buildRouteLines(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Metro background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(5,5,15,0.5) 0%, rgba(3,3,10,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(100,150,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(100,150,255,0.015) 1px, transparent 1px)',
          backgroundSize: '50px 50px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* SVG: transit route lines */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {routes.map(({ key, d, color, width }) => (
            <path key={key} d={d}
              stroke={color} strokeWidth={width} fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {/* Station dots at each layout position */}
          {layout.slice(0, 12).map(({ el, cx, cy }) => (
            <circle key={`stn-${el.id}`} cx={cx} cy={cy} r="4"
              fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Title */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(100,150,255,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridTitle || '◆ TRANSIT MAP ◆'}
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(100,150,255,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridSubtitle || '◆ METRO SYSTEM ◆'}
        </div>

        {/* Line legend — bottom left */}
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.05, left: 20,
          display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          {[['Red', '#FF3333'], ['Yellow', '#FFD700'], ['Green', '#33CC66'], ['Orange', '#FF8833'], ['Purple', '#AA66FF']].map(([name, color]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 12, height: 2, background: color, opacity: 0.4 }} />
              <span style={{ fontFamily: 'monospace', fontSize: 6, color: 'rgba(255,255,255,0.2)' }}>{name}</span>
            </div>
          ))}
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
              <MetroCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MetroGrid;
