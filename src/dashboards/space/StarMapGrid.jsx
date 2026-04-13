import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import StarCard from './StarCard.jsx';

const CW = 1300, CH = 760;
const CX = CW / 2, CY = CH / 2;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Category → radial ring index (inner = core services)
const CAT_RING = {
  NOBLE: 0, LANTHANIDE: 0,
  TRANSITION: 1, ALKALI: 1, ALKALINE: 1,
  CHALCOGEN: 2, METALLOID: 2, PNICTOGEN: 2,
  NONMETAL: 3, HALOGEN: 3, POST: 3, ACTINIDE: 3,
};

// Card size per shape (must match StarCard)
const SHAPE_SIZE = { major: 72, cross: 64, diamond: 56, dwarf: 44 };
const CAT_SHAPE = {
  NOBLE: 'major', LANTHANIDE: 'major',
  TRANSITION: 'cross', ALKALI: 'cross', ALKALINE: 'cross',
  CHALCOGEN: 'diamond', METALLOID: 'diamond', PNICTOGEN: 'diamond',
  NONMETAL: 'dwarf', HALOGEN: 'dwarf', POST: 'dwarf', ACTINIDE: 'dwarf',
};

const RING_RADII = [110, 195, 275, 345];

function strHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Static background star field — module-level so it's created once
const BG_STARS = Array.from({ length: 120 }, (_, i) => {
  const h = strHash(`bg-${i}`);
  const bx = (h % CW);
  const by = (strHash(`bgy-${i}`) % CH);
  const sz = 0.4 + (h % 4) * 0.3;
  const opacity = 0.12 + (h % 5) * 0.06;
  return (
    <div key={`bg-${i}`} style={{
      position: 'absolute', left: bx, top: by,
      width: sz, height: sz, borderRadius: '50%',
      background: `rgba(255,255,255,${opacity})`,
      pointerEvents: 'none',
    }} />
  );
});

function buildStarField(registry) {
  const rings = RING_RADII.map(() => []);
  registry.forEach(el => rings[CAT_RING[el.cat] ?? 3].push(el));

  const positions = [];
  rings.forEach((ring, ri) => {
    const n = ring.length;
    const baseAngle = (strHash(ri.toString()) % 360) * (Math.PI / 180);
    ring.forEach((el, i) => {
      const θ = baseAngle + (2 * Math.PI / Math.max(n, 1)) * i;
      const r = RING_RADII[ri] + (strHash(el.id) % 25) - 12;
      const shape = CAT_SHAPE[el.cat] || 'dwarf';
      const sz = SHAPE_SIZE[shape];
      // Position so the card CENTER is at the computed point
      positions.push({
        el, shape, sz,
        cx: CX + r * Math.cos(θ) - sz / 2,
        cy: CY + r * Math.sin(θ) - sz / 2,
        // Absolute center for constellation lines
        centerX: CX + r * Math.cos(θ),
        centerY: CY + r * Math.sin(θ),
        ring: ri, θ,
      });
    });
  });
  return positions;
}

const StarMapGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, cardTransform }) => {
  const positions = useMemo(() => buildStarField(elementRegistry), [elementRegistry]);

  // Pass 1: geometry — depends only on positions (stable between registry changes)
  const constellationGeometry = useMemo(() => {
    const catGroups = {};
    positions.forEach(p => {
      const cat = p.el.cat;
      if (!catGroups[cat]) catGroups[cat] = [];
      catGroups[cat].push(p);
    });
    const lines = [];
    Object.values(catGroups).forEach(group => {
      if (group.length < 2) return;
      const sorted = [...group].sort((a, b) => a.θ - b.θ);
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i], b = sorted[i + 1];
        lines.push({
          key: `${a.el.id}-${b.el.id}`,
          x1: a.centerX, y1: a.centerY,
          x2: b.centerX, y2: b.centerY,
          fromId: a.el.id, toId: b.el.id,
        });
      }
    });
    return lines;
  }, [positions]);

  // Pass 2: online state — cheap O(n) remap
  const constellations = useMemo(() => {
    return constellationGeometry.map(line => ({
      ...line,
      active: statsMap[line.fromId]?.online && statsMap[line.toId]?.online,
    }));
  }, [constellationGeometry, statsMap]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Background star field dots */}
        {BG_STARS}

        {/* SVG: ring markers + constellation lines */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {/* Faint ring circles */}
          {RING_RADII.map((r, i) => (
            <circle key={i} cx={CX} cy={CY} r={r}
              fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.8"
              strokeDasharray="3 12" />
          ))}

          {/* Constellation lines */}
          {constellations.map(({ key, x1, y1, x2, y2, active }) => (
            <line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={active ? 'rgba(180,220,255,0.22)' : 'rgba(255,255,255,0.05)'}
              strokeWidth={active ? 0.7 : 0.4} />
          ))}
        </svg>

        {/* Star cards — positioned so card center aligns with computed star position */}
        {positions.map(({ el, cx, cy, shape }, idx) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: cx, top: cy }}
              animate={prefersReducedMotion ? {} : {
                opacity: stats.online ? [0.85, 1, 0.85] : undefined,
              }}
              transition={{ duration: 3 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.1 }}
            >
              <StarCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.08)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          {gridTitle || '◆ STAR ATLAS — LIVE TELEMETRY ◆'}
        </div>
      </div>
    </div>
  );
};

export default StarMapGrid;
