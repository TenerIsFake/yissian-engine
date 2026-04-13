import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import FunhouseCard from './FunhouseCard.jsx';
import { FUNHOUSE_LABELS } from './funhouseConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Circular carnival layout — rides arranged in a midway ring
const POSITION_MAP = {
  'Big Top':         { x: 0.50, y: 0.12 },
  'Hall of Mirrors': { x: 0.22, y: 0.18 },
  'Bumper Cars':     { x: 0.78, y: 0.18 },
  'Ring Toss':       { x: 0.08, y: 0.42 },
  'Fortune Teller':  { x: 0.92, y: 0.42 },
  'Carousel':        { x: 0.35, y: 0.38 },
  'Balloon Pop':     { x: 0.65, y: 0.38 },
  'Whack-a-Mole':   { x: 0.22, y: 0.62 },
  'Prize Counter':   { x: 0.50, y: 0.55 },
  'Tunnel of Love':  { x: 0.78, y: 0.62 },
  'Tilt-a-Whirl':   { x: 0.12, y: 0.82 },
  'Cotton Candy':    { x: 0.88, y: 0.82 },
};

const FALLBACK_SLOTS = [
  { x: 0.35, y: 0.72 }, { x: 0.65, y: 0.72 }, { x: 0.35, y: 0.88 },
  { x: 0.65, y: 0.88 }, { x: 0.50, y: 0.88 }, { x: 0.50, y: 0.72 },
];

function buildLayout(registry) {
  const used = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const label = FUNHOUSE_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      used.add(label);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

// Funhouse uses zigzag paths (like a carnival midway walkway)
function buildMidwayPaths(layout) {
  const bigTop = layout.find(p => p.label === 'Big Top');
  if (!bigTop) return [];
  return layout
    .filter(p => p.label !== 'Big Top')
    .slice(0, 10)
    .map(p => {
      const dx = p.cx - bigTop.cx;
      const dy = p.cy - bigTop.cy;
      const zigX = bigTop.cx + dx * 0.33 + (dy > 0 ? 20 : -20);
      const zigY = bigTop.cy + dy * 0.33;
      const zagX = bigTop.cx + dx * 0.66 + (dy > 0 ? -20 : 20);
      const zagY = bigTop.cy + dy * 0.66;
      return {
        key: `path-${p.el.id}`,
        d: `M${bigTop.cx},${bigTop.cy} L${zigX},${zigY} L${zagX},${zagY} L${p.cx},${p.cy}`,
      };
    });
}

const FunhouseGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const paths  = useMemo(() => buildMidwayPaths(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Carnival background — dark with warm tones */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,5,20,0.5) 0%, rgba(8,3,12,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Marquee light dots */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle 1px, rgba(255,200,50,0.03) 1px, transparent 1px)',
          backgroundSize: '30px 30px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* Center ring glow */}
        <div style={{
          position: 'absolute', left: '30%', right: '30%', top: '25%', bottom: '25%',
          background: 'radial-gradient(ellipse, rgba(255,100,200,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* SVG: midway zigzag paths */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {paths.map(({ key, d }) => (
            <path key={key} d={d}
              stroke="rgba(255,200,50,0.08)" strokeWidth="2" fill="none"
              strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {/* Ride lights at endpoints */}
          {paths.map(({ key, d }) => {
            const match = d.match(/L([\d.]+),([\d.]+)$/);
            if (!match) return null;
            return <circle key={`n-${key}`} cx={match[1]} cy={match[2]} r="3"
              fill="rgba(255,200,50,0.15)" />;
          })}
        </svg>

        {/* Title */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,200,50,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridTitle || '◆ WELCOME TO THE FUNHOUSE ◆'}
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,200,50,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridSubtitle || '◆ CARNIVAL MIDWAY ◆'}
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
              <FunhouseCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FunhouseGrid;
