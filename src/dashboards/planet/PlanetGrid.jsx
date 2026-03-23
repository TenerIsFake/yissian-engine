import React, { useMemo } from 'react';
// CONFLICT RESOLVED C4: activeCATRef import removed — `cat` variable was assigned but
// never used in JSX. PlanetCard accesses activeCATRef internally.
import PlanetCard from './PlanetCard.jsx';

const CARD_W = 72, CARD_H = 80;
const CW = 1200, CH = 760;
const CX = CW / 2, CY = CH / 2;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Orbital rings: radius and period (seconds for one full orbit)
const ORBITAL_RINGS = [
  { r: 105, period: 12 },
  { r: 160, period: 20 },
  { r: 215, period: 30 },
  { r: 270, period: 44 },
  { r: 330, period: 62 },
];

// CONFLICT RESOLVED C4 / T2-01: ringCapacities trimmed from 7 entries to 5 to match
// ORBITAL_RINGS.length. The two extra entries (6, 7) were dead capacity that could never
// be reached because ringIdx is clamped to ORBITAL_RINGS.length - 1.
const ringCapacities = [1, 2, 3, 4, 5];

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
    result.push({ el, ring, startAngle });
    ringCounts[ri]++;
  });
  return result;
}

// Module-level constant — do NOT interpolate runtime/prop data here.
// Static CSS only; any dynamic value would be a CSS injection risk.
const ORBIT_STYLE = `
  @keyframes planet-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes planet-spin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
`;

const PlanetGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  const orbits = useMemo(() => assignOrbits(elementRegistry), [elementRegistry]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <style>{ORBIT_STYLE}</style>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* SVG: orbit path circles + corona glow on sun */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          <defs>
            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,200,50,0.3)" />
              <stop offset="100%" stopColor="rgba(255,150,0,0)" />
            </radialGradient>
          </defs>
          {/* Sun corona */}
          <circle cx={CX} cy={CY} r="55" fill="url(#sun-glow)" />
          {/* Orbital path rings */}
          {ORBITAL_RINGS.map((ring, i) => (
            <circle key={i} cx={CX} cy={CY} r={ring.r}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8"
              strokeDasharray="4 8" />
          ))}
        </svg>

        {/* Central sun */}
        <div style={{
          position: 'absolute',
          left: CX - 20, top: CY - 20, width: 40, height: 40,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, #fff5d0, #ffaa00 50%, #ff6600)',
          boxShadow: '0 0 20px rgba(255,160,0,0.6), 0 0 40px rgba(255,100,0,0.3)',
          pointerEvents: 'none',
          zIndex: 5,
        }} />

        {/* Planets on orbits */}
        {orbits.map(({ el, ring, startAngle }) => {
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
              {/*
                T1-01 / CONFLICT RESOLVED C4: The orbit-arm wrapper div previously had
                onClick={() => onElementClick(el) and PlanetCard received onClick={() => {}}.
                That suppressed PlanetCard's own handler (role="button", tabIndex=0, onKeyDown),
                making cards unreachable via keyboard and unreliable via mouse when the card
                interior captured the click before the wrapper. Fix: remove the wrapper onClick
                and pass onElementClick directly to PlanetCard, which already has full ARIA
                semantics. This also resolves T2-10 (keyboard access).
                SECURITY OVERRIDE: none required — no security/simplifier conflict here.
              */}
              <div style={{
                position: 'absolute',
                left: ring.r - CARD_W / 2,
                top: -CARD_H / 2,
              }}>
                <PlanetCard element={el} stats={stats} onClick={onElementClick} />
              </div>
            </div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          ◆ SOLAR SYSTEM — LIVE TELEMETRY ◆
        </div>
      </div>
    </div>
  );
};

export default PlanetGrid;
