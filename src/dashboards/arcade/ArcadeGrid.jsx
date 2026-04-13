import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ArcadeCard from './ArcadeCard.jsx';
import { ARCADE_LABELS } from './arcadeConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const POSITION_MAP = {
  'Final Boss':    { x: 0.50, y: 0.12 },
  'Power-Up Zone': { x: 0.22, y: 0.22 },
  'Battle Arena':  { x: 0.78, y: 0.22 },
  'Warp Pipe':     { x: 0.08, y: 0.48 },
  'Save Point':    { x: 0.92, y: 0.48 },
  'Level Select':  { x: 0.35, y: 0.38 },
  'Bonus Stage':   { x: 0.65, y: 0.38 },
  'Inventory':     { x: 0.22, y: 0.65 },
  'Item Shop':     { x: 0.50, y: 0.55 },
  'Debug Room':    { x: 0.78, y: 0.65 },
  'Boss Rush':     { x: 0.08, y: 0.82 },
  'Credits Roll':  { x: 0.92, y: 0.82 },
};

const FALLBACK_SLOTS = [
  { x: 0.35, y: 0.70 }, { x: 0.65, y: 0.70 }, { x: 0.35, y: 0.85 },
  { x: 0.65, y: 0.85 }, { x: 0.50, y: 0.85 }, { x: 0.50, y: 0.70 },
];

function buildLayout(registry) {
  const used = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const label = ARCADE_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      used.add(label);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

function buildWarpPipes(layout) {
  const boss = layout.find(p => p.label === 'Final Boss');
  if (!boss) return [];
  return layout
    .filter(p => p.label !== 'Final Boss')
    .slice(0, 10)
    .map(p => ({
      key: `warp-${p.el.id}`,
      x1: boss.cx, y1: boss.cy,
      x2: p.cx, y2: p.cy,
      mx: (boss.cx + p.cx) / 2,
      my: (boss.cy + p.cy) / 2 + 25,
    }));
}

const ArcadeGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const pipes  = useMemo(() => buildWarpPipes(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Dark arcade floor */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,5,25,0.6) 0%, rgba(5,2,12,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Neon grid floor */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(120,0,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(120,0,255,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* Boss glow */}
        <div style={{
          position: 'absolute', left: CW * 0.5 - 80, top: 0, width: 160, height: 120,
          background: 'radial-gradient(ellipse, rgba(180,0,255,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* SVG: warp connections */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {pipes.map(({ key, x1, y1, x2, y2, mx, my }) => (
            <path key={key} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
              stroke="rgba(120,0,255,0.15)" strokeWidth="1.5" fill="none"
              strokeDasharray="3,8" />
          ))}
          {pipes.map(({ key, x2, y2 }) => (
            <circle key={`p-${key}`} cx={x2} cy={y2} r="2.5" fill="rgba(180,0,255,0.35)" />
          ))}
        </svg>

        {/* Title */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(180,0,255,0.2)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridTitle || '◆ FINAL BOSS ◆'}
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(180,0,255,0.2)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridSubtitle || '◆ ARCADE FLOOR ◆'}
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
              <ArcadeCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ArcadeGrid;
