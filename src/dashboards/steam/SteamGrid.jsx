import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import SteamCard from './SteamCard.jsx';
import { STEAM_LABELS } from './steamConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Boiler Room':      { x: 0.50, y: 0.14 },
  'Pressure Chamber': { x: 0.25, y: 0.22 },
  'Gear Train':       { x: 0.75, y: 0.22 },
  'Steam Valve':      { x: 0.12, y: 0.48 },
  'Brass Gauge':      { x: 0.88, y: 0.48 },
  'Pneumatic Line':   { x: 0.38, y: 0.38 },
  'Condenser':        { x: 0.62, y: 0.38 },
  'Telegraph':        { x: 0.25, y: 0.64 },
  'Pipe Junction':    { x: 0.50, y: 0.55 },
  'Furnace Room':     { x: 0.75, y: 0.64 },
  'Piston Array':     { x: 0.12, y: 0.82 },
  'Exhaust Stack':    { x: 0.88, y: 0.82 },
};

const FALLBACK_SLOTS = [
  { x: 0.38, y: 0.70 }, { x: 0.62, y: 0.70 }, { x: 0.38, y: 0.84 },
  { x: 0.62, y: 0.84 }, { x: 0.50, y: 0.84 }, { x: 0.50, y: 0.70 },
];

function buildLayout(registry) {
  const used = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const label = STEAM_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      used.add(label);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

function buildPipes(layout) {
  const boiler = layout.find(p => p.label === 'Boiler Room');
  if (!boiler) return [];
  return layout
    .filter(p => p.label !== 'Boiler Room')
    .slice(0, 10)
    .map(p => ({
      key: `pipe-${p.el.id}`,
      x1: boiler.cx, y1: boiler.cy,
      x2: p.cx, y2: p.cy,
    }));
}

const SteamGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const pipes  = useMemo(() => buildPipes(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(30,18,8,0.5) 0%, rgba(12,8,4,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Riveted panel grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(180,140,80,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(180,140,80,0.02) 1px, transparent 1px)',
          backgroundSize: '70px 70px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* Boiler glow */}
        <div style={{
          position: 'absolute', left: CW * 0.5 - 100, top: 0, width: 200, height: 140,
          background: 'radial-gradient(ellipse, rgba(180,100,30,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* SVG: pneumatic pipes */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {pipes.map(({ key, x1, y1, x2, y2 }) => {
            // Right-angle pipe routing (horizontal then vertical)
            return (
              <g key={key}>
                <path d={`M${x1},${y1} L${x2},${y1} L${x2},${y2}`}
                  stroke="rgba(180,140,80,0.12)" strokeWidth="2" fill="none" />
                <circle cx={x2} cy={y1} r="2" fill="rgba(180,140,80,0.25)" />
              </g>
            );
          })}
        </svg>

        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(180,140,80,0.2)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridTitle || '◆ BOILER ROOM ◆'}
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(180,140,80,0.2)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridSubtitle || '◆ PNEUMATIC NETWORK ◆'}
        </div>

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
              <SteamCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SteamGrid;
