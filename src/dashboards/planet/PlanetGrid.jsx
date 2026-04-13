import React, { useMemo } from 'react';
import PlanetCard, { PLANET_CARD_SIZE } from './PlanetCard.jsx';
import PlanetaryOrbit3D from './PlanetaryOrbit3D.jsx';

const CARD_SZ = PLANET_CARD_SIZE;
const CW = 1200, CH = 760;
const CX = CW / 2, CY = CH / 2;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Orbital rings: radius and period (seconds for one full orbit)
const ORBITAL_RINGS = [
  { r: 105, period: 14 },
  { r: 165, period: 22 },
  { r: 225, period: 32 },
  { r: 285, period: 46 },
  { r: 345, period: 64 },
];

const ringCapacities = [1, 2, 3, 5, 100];

function assignOrbits(registry) {
  const result = [];
  const ringCounts = new Array(ORBITAL_RINGS.length).fill(0);
  let ringIdx = 0;
  registry.forEach(el => {
    if (ringIdx < ORBITAL_RINGS.length - 1 && ringCounts[ringIdx] >= ringCapacities[ringIdx]) {
      ringIdx++;
    }
    const ri = Math.min(ringIdx, ORBITAL_RINGS.length - 1);
    const ring = ORBITAL_RINGS[ri];
    const countInRing = ringCounts[ri];
    const capacity = ringCapacities[ri];
    const startAngle = -90 + (360 / capacity) * countInRing;
    result.push({ el, ring, ri, startAngle });
    ringCounts[ri]++;
  });
  return result;
}

const ORBIT_STYLE = `
  @keyframes planet-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes planet-counter { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
`;

const PlanetGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, cardTransform }) => {
  const orbits = useMemo(() => assignOrbits(elementRegistry), [elementRegistry]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <style>{ORBIT_STYLE}</style>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* SVG: orbit path circles + sun glow */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,200,50,0.35)" />
              <stop offset="60%" stopColor="rgba(255,150,0,0.08)" />
              <stop offset="100%" stopColor="rgba(255,100,0,0)" />
            </radialGradient>
          </defs>
          {/* Sun corona */}
          <circle cx={CX} cy={CY} r="65" fill="url(#sun-glow)" />
          {/* Orbital path rings */}
          {ORBITAL_RINGS.map((ring, i) => (
            <circle key={i} cx={CX} cy={CY} r={ring.r}
              fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.6"
              strokeDasharray="3 10" />
          ))}
        </svg>

        {/* 3D orbit showcase behind sun */}
        <div style={{ position: 'absolute', left: CX - 60, top: CY - 60, zIndex: 4, opacity: 0.5, pointerEvents: 'none' }}>
          <PlanetaryOrbit3D size={120} color="rgba(255,170,0,0.25)" />
        </div>

        {/* Central sun */}
        <div style={{
          position: 'absolute',
          left: CX - 24, top: CY - 24, width: 48, height: 48,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 33%, #fff8e0, #ffbb00 45%, #ff7700 80%, #cc440088)',
          boxShadow: '0 0 24px rgba(255,170,0,0.6), 0 0 50px rgba(255,100,0,0.25), 0 0 80px rgba(255,80,0,0.1)',
          pointerEvents: 'none',
          zIndex: 5,
        }}>
          {/* Specular highlight */}
          <div style={{
            position: 'absolute', top: '15%', left: '20%',
            width: '30%', height: '20%', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.5), transparent)',
          }} />
        </div>

        {/* Planets on orbits */}
        {orbits.map(({ el, ring, ri, startAngle }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          const delayRaw = prefersReducedMotion ? 0 : -(ring.period * ((startAngle + 90) / 360));
          const delay = Number.isFinite(delayRaw) ? delayRaw : 0;
          return (
            <div key={el.id} style={{
              position: 'absolute',
              left: CX, top: CY,
              width: 0, height: 0,
              transformOrigin: '0 0',
              animation: prefersReducedMotion ? 'none' : `planet-orbit ${ring.period}s linear infinite`,
              animationDelay: `${delay.toFixed(4)}s`,
              transform: `rotate(${startAngle}deg)`,
            }}>
              {/* Card positioned on orbit arm, counter-rotated to keep text upright */}
              <div style={{
                position: 'absolute',
                left: ring.r - CARD_SZ / 2,
                top: -CARD_SZ / 2,
                animation: prefersReducedMotion ? 'none' : `planet-counter ${ring.period}s linear infinite`,
                animationDelay: `${delay.toFixed(4)}s`,
              }}>
                <PlanetCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
              </div>
            </div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.08)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          {gridTitle || '◆ SOLAR SYSTEM — LIVE TELEMETRY ◆'}
        </div>
      </div>
    </div>
  );
};

export default PlanetGrid;
