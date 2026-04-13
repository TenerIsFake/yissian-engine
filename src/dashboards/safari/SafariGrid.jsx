import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import SafariCard from './SafariCard.jsx';
import { SAFARI_LABELS } from './safariConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1100, CH = 700;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Zoo map layout — enclosures arranged along walking paths
const POSITION_MAP = {
  'Big Cat':     { x: 0.50, y: 0.10 },
  'Primate':     { x: 0.22, y: 0.18 },
  'Pachyderm':   { x: 0.78, y: 0.18 },
  'Raptor':      { x: 0.10, y: 0.40 },
  'Reptile':     { x: 0.90, y: 0.40 },
  'Ungulate':    { x: 0.36, y: 0.36 },
  'Aquatic':     { x: 0.64, y: 0.36 },
  'Nocturnal':   { x: 0.22, y: 0.58 },
  'Insect':      { x: 0.50, y: 0.54 },
  'Burrower':    { x: 0.78, y: 0.58 },
  'Canine':      { x: 0.12, y: 0.80 },
  'Marsupial':   { x: 0.88, y: 0.80 },
};

const FALLBACK_SLOTS = [
  { x: 0.36, y: 0.72 }, { x: 0.64, y: 0.72 }, { x: 0.36, y: 0.88 },
  { x: 0.64, y: 0.88 }, { x: 0.50, y: 0.88 }, { x: 0.50, y: 0.72 },
];

function buildLayout(registry) {
  const used = new Set();
  let fallbackIdx = 0;
  return registry.map(el => {
    const label = SAFARI_LABELS[el.cat] ?? '';
    let pos = POSITION_MAP[label];
    if (!pos || used.has(label)) {
      pos = FALLBACK_SLOTS[fallbackIdx++ % FALLBACK_SLOTS.length];
    } else {
      used.add(label);
    }
    return { el, cx: pos.x * CW, cy: pos.y * CH, label };
  });
}

// Walking paths — organic curved trails between enclosures
function buildTrails(layout) {
  const bigCat = layout.find(p => p.label === 'Big Cat');
  if (!bigCat) return [];
  return layout
    .filter(p => p.label !== 'Big Cat')
    .slice(0, 10)
    .map(p => {
      const mx = (bigCat.cx + p.cx) / 2 + (Math.random() - 0.5) * 40;
      const my = (bigCat.cy + p.cy) / 2 + 20;
      return {
        key: `trail-${p.el.id}`,
        d: `M${bigCat.cx},${bigCat.cy} Q${mx},${my} ${p.cx},${p.cy}`,
      };
    });
}

const SafariGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, gridSubtitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const trails = useMemo(() => buildTrails(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Safari background — dark earth tones */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(10,12,5,0.5) 0%, rgba(6,8,3,0.3) 100%)',
          borderRadius: 4,
        }} />

        {/* Grass texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle 0.5px, rgba(80,120,40,0.04) 0.5px, transparent 0.5px)',
          backgroundSize: '15px 15px', borderRadius: 4, pointerEvents: 'none',
        }} />

        {/* Watering hole glow — center */}
        <div style={{
          position: 'absolute', left: '35%', right: '35%', top: '40%', bottom: '25%',
          background: 'radial-gradient(ellipse, rgba(40,80,120,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* SVG: walking trails */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {trails.map(({ key, d }) => (
            <path key={key} d={d}
              stroke="rgba(180,150,100,0.08)" strokeWidth="2.5" fill="none"
              strokeLinecap="round" strokeDasharray="8,6" />
          ))}
          {/* Enclosure markers */}
          {trails.map(({ key, d }) => {
            const match = d.match(/([\d.]+),([\d.]+)$/);
            if (!match) return null;
            return <circle key={`e-${key}`} cx={match[1]} cy={match[2]} r="3"
              fill="none" stroke="rgba(180,150,100,0.12)" strokeWidth="0.5" />;
          })}
        </svg>

        {/* Title */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(180,150,100,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridTitle || '◆ SAFARI PARK ◆'}
        </div>
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: CH * 0.02, left: '50%', transform: 'translateX(-50%)',
          fontSize: 8, fontFamily: 'monospace', color: 'rgba(180,150,100,0.25)',
          letterSpacing: '0.4em', pointerEvents: 'none',
        }}>
          {gridSubtitle || '◆ ZOO MAP ◆'}
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
              <SafariCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SafariGrid;
