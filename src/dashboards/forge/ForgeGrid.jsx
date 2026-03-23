import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ForgeCard from './ForgeCard.jsx';
import { FORGE_LABELS } from './forgeConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Workshop floor stations as % of container
const STATION_POSITIONS = {
  'Blast Furnace': { x: 0.50, y: 0.14 },
  'Forge Hearth':  { x: 0.22, y: 0.22 },
  'Anvil':         { x: 0.78, y: 0.22 },
  'Quench Tank':   { x: 0.10, y: 0.52 },
  'Bellows':       { x: 0.90, y: 0.52 },
  'Crucible':      { x: 0.35, y: 0.38 },
  'Casting Mold':  { x: 0.65, y: 0.38 },
  'Tongs Station': { x: 0.22, y: 0.68 },
  'Flux Bin':      { x: 0.50, y: 0.55 },
  'Coal Hopper':   { x: 0.78, y: 0.68 },
  'Hammer Rack':   { x: 0.10, y: 0.82 },
  'Cooling Rack':  { x: 0.90, y: 0.82 },
};

const FALLBACK_SLOTS = [
  { x: 0.35, y: 0.68 }, { x: 0.65, y: 0.68 }, { x: 0.35, y: 0.82 },
  { x: 0.65, y: 0.82 }, { x: 0.50, y: 0.82 }, { x: 0.50, y: 0.68 },
];

function buildLayout(registry) {
  const usedStations = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const station = FORGE_LABELS[el.cat] ?? '';
    let pos = STATION_POSITIONS[station];
    if (!pos || usedStations.has(station)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      usedStations.add(station);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, station };
  });
}

// Heat ducts from furnace → stations (max 10 connections for readability)
function buildDucts(layout) {
  const furnace = layout.find(p => p.station === 'Blast Furnace');
  if (!furnace) return [];
  return layout
    .filter(p => p.station !== 'Blast Furnace')
    .slice(0, 10)
    .map(p => {
      const mx = (furnace.cx + p.cx) / 2;
      const my = (furnace.cy + p.cy) / 2 + 20;
      return { key: `duct-${p.el.id}`, x1: furnace.cx, y1: furnace.cy, x2: p.cx, y2: p.cy, mx, my };
    });
}

const ForgeGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const ducts  = useMemo(() => buildDucts(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Workshop floor background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(40,15,5,0.5) 0%, rgba(15,8,3,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Furnace glow at top */}
        <div style={{
          position: 'absolute', left: CW * 0.5 - 80, top: 0, width: 160, height: 150,
          background: 'radial-gradient(ellipse, rgba(255,100,10,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Floor grid marks */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '80px 80px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* SVG: heat ducts */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {ducts.map(({ key, x1, y1, x2, y2, mx, my }) => (
            <path key={key} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
              stroke="rgba(255,100,10,0.18)" strokeWidth="1.5" fill="none"
              strokeDasharray="6,5" />
          ))}
          {ducts.map(({ key, x2, y2 }) => (
            <circle key={`j-${key}`} cx={x2} cy={y2} r="2.5" fill="rgba(255,120,20,0.40)" />
          ))}
        </svg>

        {/* Labels */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.03, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          ◆ MASTER HEARTH ◆
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          ◆ WORKSHOP FLOOR ◆
        </div>

        {/* Service cards — FE-09: breathing amplitude modulated by load bucket */}
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
              animate={breathAnim}
              transition={breathTrans}
            >
              <ForgeCard element={el} stats={stats} onClick={onElementClick} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ForgeGrid;
