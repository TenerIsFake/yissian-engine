import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import StarCard from './StarCard.jsx';

const CARD_W = 72, CARD_H = 80;
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

const RING_RADII = [100, 180, 260, 340];

function strHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Static background star field — module-level so it's created once, never on re-render.
// strHash is deterministic so positions are identical every time; no need to recompute.
const BG_STARS = Array.from({ length: 80 }, (_, i) => {
  const h = strHash(`bg-${i}`);
  const bx = (h % CW);
  const by = (strHash(`bgy-${i}`) % CH);
  const sz = 0.5 + (h % 3) * 0.5;
  return (
    <div key={`bg-${i}`} style={{
      position: 'absolute', left: bx, top: by,
      width: sz, height: sz, borderRadius: '50%',
      background: 'rgba(255,255,255,0.25)',
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
    const baseAngle = (strHash(ri.toString()) % 360) * (Math.PI / 180); // phase offset per ring
    ring.forEach((el, i) => {
      const θ = baseAngle + (2 * Math.PI / Math.max(n, 1)) * i;
      const r = RING_RADII[ri] + (strHash(el.id) % 25) - 12; // slight radial jitter
      positions.push({ el, cx: CX + r * Math.cos(θ), cy: CY + r * Math.sin(θ), ring: ri, θ });
    });
  });
  return positions;
}

const StarMapGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  const positions = useMemo(() => buildStarField(elementRegistry), [elementRegistry]);

  // T2-02 / CONFLICT RESOLVED C-3: constellations split into two useMemos.
  // Previously the single useMemo depended on [positions, statsMap], causing the
  // full O(n²) geometry calculation to re-run on every stats poll (~5s interval).
  // Geometry (which nodes connect, at what pixel coordinates) is stable as long as
  // positions are stable — only the `active` boolean changes with statsMap.
  // ARCH REQUIREMENT: two-memo pattern retained — simplifier suggestion to merge
  //   back would reintroduce the polling re-computation regression.

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
      // Sort by angle for clean constellation shape
      const sorted = [...group].sort((a, b) => a.θ - b.θ);
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i], b = sorted[i + 1];
        lines.push({
          key: `${a.el.id}-${b.el.id}`,
          x1: a.cx + CARD_W / 2, y1: a.cy + CARD_H / 2,
          x2: b.cx + CARD_W / 2, y2: b.cy + CARD_H / 2,
          fromId: a.el.id, toId: b.el.id,
        });
      }
    });
    return lines;
  }, [positions]);

  // Pass 2: online state — re-runs on stats poll but is a cheap O(n) map over the
  // already-built geometry; no coordinate recalculation needed
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
            <circle key={i} cx={CX} cy={CY} r={r + CARD_W / 2}
              fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8"
              strokeDasharray="4 10" />
          ))}

          {/* Constellation lines */}
          {constellations.map(({ key, x1, y1, x2, y2, active }) => (
            <line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={active ? 'rgba(180,220,255,0.3)' : 'rgba(255,255,255,0.07)'}
              strokeWidth={active ? 0.8 : 0.5} />
          ))}
        </svg>

        {/* Star cards */}
        {positions.map(({ el, cx, cy }, idx) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: cx, top: cy }}
              animate={prefersReducedMotion ? {} : {
                opacity: stats.online ? [0.85, 1, 0.85] : undefined,
              }}
              transition={{ duration: 3 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.1 }}
              // T1-04: guard whileHover — consistent with all other grids
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }}
            >
              <StarCard element={el} stats={stats} onClick={onElementClick} />
            </motion.div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          ◆ STAR ATLAS — LIVE TELEMETRY ◆
        </div>
      </div>
    </div>
  );
};

export default StarMapGrid;
