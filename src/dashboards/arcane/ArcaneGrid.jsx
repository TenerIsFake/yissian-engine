import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import ArcaneCard from './ArcaneCard.jsx';

const CARD_W = 72, CARD_H = 80;
const CW = 1200, CH = 760;
const CX = CW / 2, CY = CH / 2;

const RING_RADII = [130, 240, 355];
// Ring sizes: first 4 → ring 0, next 8 → ring 1, rest → ring 2
const RING_SIZES = [4, 8, Infinity];

// CONFLICT RESOLVED C1 / T1-04:
//   (a) RING_PERIODS[2] changed from -400 to 400. A negative duration value would be
//       treated as 0 by Framer Motion (instant snap) if ring 2 is ever connected to
//       an animation. Counter-clockwise rotation should be expressed via animate target
//       (rotate: -360), not a negative duration.
//   (b) The dead motion.div for Ring 1 (lines 118-122 in original) is removed below.
//       It had position:absolute, inset:0, pointerEvents:'none', no children, and an
//       animate={{ rotate:360 }} — it produced zero visual output while consuming a
//       Framer Motion animation slot on the compositor thread every render.
// Ring 1 clockwise period: 240s. Ring 2 counter-clockwise period: 400s (positive).
const RING_PERIODS = [null, 240, 400]; // null = static inner ring; ring 2 uses rotate:-360

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

function assignRings(registry) {
  const rings = [[], [], []];
  let remaining = [...registry];
  for (let r = 0; r < 3; r++) {
    const size = RING_SIZES[r];
    rings[r] = remaining.splice(0, size);
  }
  return rings;
}

function ringPositions(items, r, offsetAngle = 0) {
  return items.map((el, i) => {
    const θ = (2 * Math.PI / items.length) * i + offsetAngle - Math.PI / 2;
    return { el, x: CX + r * Math.cos(θ), y: CY + r * Math.sin(θ), θ };
  });
}

// Build sacred geometry SVG paths between ring members
function buildGeometry(items, r) {
  const n = items.length;
  if (n < 3) return null;
  const points = items.map((_, i) => {
    const θ = (2 * Math.PI / n) * i - Math.PI / 2;
    return [CX + r * Math.cos(θ), CY + r * Math.sin(θ)];
  });
  // Connect every other point (star polygon)
  const step = n >= 6 ? 2 : 1;
  const d = points.map((p, i) => {
    const j = (i + step) % n;
    return `M${p[0]},${p[1]} L${points[j][0]},${points[j][1]}`;
  }).join(' ');
  return d;
}

const ArcaneGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, cardTransform }) => {
  const rings = useMemo(() => assignRings(elementRegistry), [elementRegistry]);

  const ringLayouts = useMemo(() => rings.map((items, r) => ringPositions(items, RING_RADII[r])), [rings]);

  const geometryPaths = useMemo(() => rings.map((items, r) => buildGeometry(items, RING_RADII[r])), [rings]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* SVG: ring circles + sacred geometry */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          <defs>
            <filter id="arc-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Outer decorative ring circles */}
          {RING_RADII.map((r, i) => (
            <circle key={`ring-${i}`} cx={CX} cy={CY} r={r + CARD_W / 2 + 6}
              fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
              strokeDasharray="3 6" />
          ))}

          {/* Sacred geometry paths per ring */}
          {geometryPaths.map((d, ri) => d && (
            <path key={`geo-${ri}`} d={d}
              stroke={`rgba(255,255,255,${0.06 + ri * 0.02})`}
              strokeWidth="0.8" fill="none" filter="url(#arc-glow)" />
          ))}

          {/* Cross-ring radial spokes from center to inner ring */}
          {ringLayouts[0].map(({ x, y }, i) => (
            <line key={`spoke-${i}`} x1={CX} y1={CY} x2={x} y2={y}
              stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
          ))}
        </svg>

        {/* Central glyph */}
        <motion.div
          style={{ position: 'absolute', left: CX - 18, top: CY - 18, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: 'rgba(255,255,255,0.5)', pointerEvents: 'none',
            textShadow: '0 0 12px rgba(180,100,255,0.6)',
          }}
          animate={prefersReducedMotion ? {} : { scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.div>

        {/* Ring 0 — static inner ring */}
        {ringLayouts[0].map(({ el, x, y }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <div key={el.id} style={{ position: 'absolute', left: x - CARD_W / 2, top: y - CARD_H / 2 }}>
              <ArcaneCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </div>
          );
        })}

        {/*
          Ring 1 — slow clockwise rotation.
          CONFLICT RESOLVED C1 / T1-04: The dead empty motion.div that previously appeared
          here (animate={{ rotate:360 }}, no children, pointerEvents:'none') has been removed.
          It was burning a compositor animation slot with zero visual output — its rotation
          was never connected to the card positions, which are placed at absolute coordinates
          computed from ringLayouts[1]. Cards remain stationary as before; the dead div is gone.
        */}
        {ringLayouts[1].map(({ el, x, y }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <div key={el.id} style={{ position: 'absolute', left: x - CARD_W / 2, top: y - CARD_H / 2, pointerEvents: 'auto' }}>
              <ArcaneCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </div>
          );
        })}

        {/* Ring 2 — slow counter-clockwise */}
        {ringLayouts[2].map(({ el, x, y }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <div key={el.id} style={{ position: 'absolute', left: x - CARD_W / 2, top: y - CARD_H / 2 }}>
              <ArcaneCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </div>
          );
        })}

        {/* Ambient outer glow rings */}
        {[280, 370, 460].map((r, i) => (
          <div key={`glow-${i}`} style={{
            position: 'absolute',
            left: CX - r, top: CY - r, width: r * 2, height: r * 2,
            borderRadius: '50%',
            border: `1px solid rgba(180,100,255,${0.04 - i * 0.01})`,
            pointerEvents: 'none',
          }} />
        ))}

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          {gridTitle || '◆ SUMMONING CIRCLE — ACTIVE ◆'}
        </div>
      </div>
    </div>
  );
};

export default ArcaneGrid;
