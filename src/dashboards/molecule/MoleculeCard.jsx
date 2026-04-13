import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Deterministic hash for per-card variety
function idHash(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Size categories — the atom sphere IS the card
const CAT_TYPE = {
  NOBLE: 'heavy', LANTHANIDE: 'heavy',
  TRANSITION: 'standard', ALKALI: 'standard', ALKALINE: 'standard',
  CHALCOGEN: 'standard', METALLOID: 'standard', PNICTOGEN: 'standard',
  NONMETAL: 'light', HALOGEN: 'light', POST: 'light', ACTINIDE: 'light',
};

export const MOLECULE_CARD_SIZES = { heavy: 68, standard: 56, light: 44 };

// Electron counts per size tier
const ELECTRON_COUNTS = { heavy: 5, standard: 3, light: 2 };
const ORBIT_COUNTS = { heavy: 3, standard: 2, light: 1 };
const BOND_COUNTS = { heavy: 4, standard: 3, light: 2 };

const MoleculeCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;

  const formula = cardDisplay?.topLeft ?? element.symbol;
  const shortName = cardDisplay?.displayName ?? element.service ?? element.name;
  const displayName = (shortName.length > 8 ? shortName.slice(0, 7) + '\u2026' : shortName).toUpperCase();

  const tier = CAT_TYPE[element.cat] || 'standard';
  const sz = MOLECULE_CARD_SIZES[tier];
  const half = sz / 2;
  const hash = useMemo(() => idHash(element.id || element.symbol), [element.id, element.symbol]);

  const orbitCount = ORBIT_COUNTS[tier];
  const electronCount = ELECTRON_COUNTS[tier];
  const bondCount = BOND_COUNTS[tier];

  // Generate orbit ellipses with tilts based on hash
  const orbits = useMemo(() => {
    const arr = [];
    for (let i = 0; i < orbitCount; i++) {
      const tilt = ((hash + i * 137) % 120) - 60; // -60 to +60 degrees
      const rx = half * 0.55 + i * (half * 0.12);
      const ry = half * 0.25 + i * (half * 0.06);
      arr.push({ tilt, rx, ry, idx: i });
    }
    return arr;
  }, [hash, orbitCount, half]);

  // Generate electron positions along orbit paths
  const electrons = useMemo(() => {
    const arr = [];
    for (let i = 0; i < electronCount; i++) {
      const orbitIdx = i % orbitCount;
      const orbit = orbits[orbitIdx];
      if (!orbit) continue;
      const angle = ((hash + i * 97) % 360) * (Math.PI / 180);
      const ex = Math.cos(angle) * orbit.rx;
      const ey = Math.sin(angle) * orbit.ry;
      // Apply tilt rotation
      const rad = (orbit.tilt * Math.PI) / 180;
      const rx2 = ex * Math.cos(rad) - ey * Math.sin(rad);
      const ry2 = ex * Math.sin(rad) + ey * Math.cos(rad);
      arr.push({ x: half + rx2, y: half + ry2, orbitIdx, idx: i });
    }
    return arr;
  }, [hash, electronCount, orbitCount, orbits, half]);

  // Bond sticks extending outward from sphere edge
  const bonds = useMemo(() => {
    const arr = [];
    const baseAngle = (hash % 360) * (Math.PI / 180);
    for (let i = 0; i < bondCount; i++) {
      const angle = baseAngle + (i * (2 * Math.PI)) / bondCount;
      const startR = half * 0.82;
      const endR = half * 1.15;
      arr.push({
        x1: half + Math.cos(angle) * startR,
        y1: half + Math.sin(angle) * startR,
        x2: half + Math.cos(angle) * endR,
        y2: half + Math.sin(angle) * endR,
        idx: i,
      });
    }
    return arr;
  }, [hash, bondCount, half]);

  // Nucleus radius scales with tier
  const nucleusR = tier === 'heavy' ? 8 : tier === 'standard' ? 6 : 5;
  const electronR = tier === 'heavy' ? 2.5 : 2;

  // Font sizes scale with card size
  const formulaFs = tier === 'heavy' ? 7 : tier === 'standard' ? 6 : 5;
  const nameFs = tier === 'heavy' ? 7.5 : tier === 'standard' ? 6.5 : 5.5;
  const bottomFs = tier === 'heavy' ? 6 : 5;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 20, rotateY: 5, rotateX: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: sz,
        height: sz,
        borderRadius: '50%',
        background: online
          ? `radial-gradient(circle at 50% 50%, ${cat.bg}, rgba(10,10,20,0.7))`
          : 'rgba(20,20,30,0.5)',
        border: `1px solid ${online ? `${cat.border}55` : 'rgba(100,100,100,0.2)'}`,
        boxShadow: online
          ? `0 0 ${sz * 0.3}px ${cat.glow}40, 0 0 ${sz * 0.15}px ${cat.glow}20`
          : 'none',
        filter: online ? 'none' : 'grayscale(0.6)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'visible',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Van der Waals radius glow (extends beyond sphere) */}
      {online && (
        <div style={{
          position: 'absolute',
          width: sz * 1.35,
          height: sz * 1.35,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${cat.glow}12 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* SVG layer for orbits, electrons, bonds */}
      <svg
        viewBox={`0 0 ${sz} ${sz}`}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: sz, height: sz,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        {/* Bond sticks extending outward */}
        {bonds.map(b => (
          <line
            key={`bond-${b.idx}`}
            x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
            stroke={online ? cat.border : 'rgba(255,255,255,0.08)'}
            strokeWidth={1.2}
            opacity={online ? 0.5 : 0.15}
            strokeLinecap="round"
          />
        ))}

        {/* Orbital ellipses */}
        {orbits.map(o => (
          <ellipse
            key={`orbit-${o.idx}`}
            cx={half} cy={half}
            rx={o.rx} ry={o.ry}
            fill="none"
            stroke={online ? cat.border : 'rgba(255,255,255,0.06)'}
            strokeWidth={0.7}
            strokeDasharray={o.idx === 0 ? '3 2' : '2 3'}
            opacity={online ? 0.4 - o.idx * 0.08 : 0.1}
            transform={`rotate(${o.tilt} ${half} ${half})`}
          />
        ))}

        {/* Nucleus glow */}
        <circle
          cx={half} cy={half} r={nucleusR}
          fill={online ? cat.text : 'rgba(255,255,255,0.08)'}
          opacity={online ? 0.85 : 0.3}
          style={{ filter: online ? `drop-shadow(0 0 ${nucleusR * 0.8}px ${cat.glow})` : 'none' }}
        />

        {/* Electron dots */}
        {electrons.map(e => {
          const el = (
            <circle
              cx={e.x} cy={e.y} r={electronR}
              fill={online ? cat.text : 'rgba(255,255,255,0.1)'}
              opacity={online ? 0.8 : 0.15}
              style={{ filter: online ? `drop-shadow(0 0 2px ${cat.glow})` : 'none' }}
            />
          );
          if (prefersReducedMotion || !online) {
            return <g key={`e-${e.idx}`}>{el}</g>;
          }
          // Animate electrons orbiting
          const orbit = orbits[e.orbitIdx];
          if (!orbit) return <g key={`e-${e.idx}`}>{el}</g>;
          return (
            <motion.g
              key={`e-${e.idx}`}
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 6 + e.orbitIdx * 2 + (hash % 3),
                repeat: Infinity,
                ease: 'linear',
                delay: e.idx * 0.7,
              }}
              style={{ transformOrigin: `${half}px ${half}px` }}
            >
              {el}
            </motion.g>
          );
        })}
      </svg>

      {/* Text labels layered on top */}
      {/* Formula (top) */}
      <div style={{
        position: 'absolute',
        top: tier === 'heavy' ? 5 : tier === 'standard' ? 3 : 2,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: MONO,
        fontSize: formulaFs,
        color: online ? cat.text : 'rgba(255,255,255,0.2)',
        opacity: 0.85,
        lineHeight: 1,
        pointerEvents: 'none',
      }}>
        {formula}
      </div>

      {/* Display name (center, on nucleus) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: MONO,
        fontSize: nameFs,
        fontWeight: 700,
        color: online ? '#fff' : 'rgba(255,255,255,0.2)',
        textAlign: 'center',
        lineHeight: 1,
        letterSpacing: '0.02em',
        pointerEvents: 'none',
        textShadow: online ? `0 0 6px ${cat.glow}` : 'none',
        maxWidth: sz * 0.85,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        {displayName}
      </div>

      {/* Bottom label */}
      <div style={{
        position: 'absolute',
        bottom: tier === 'heavy' ? 5 : tier === 'standard' ? 3 : 1,
        left: 0, right: 0,
        textAlign: 'center',
        fontFamily: MONO,
        fontSize: bottomFs,
        color: online ? cat.text : 'rgba(255,255,255,0.15)',
        opacity: 0.6,
        lineHeight: 1,
        pointerEvents: 'none',
      }}>
        {cardDisplay?.bottomLabel ?? element.mass}
      </div>

      {/* Status indicator - tiny dot */}
      <div style={{
        position: 'absolute',
        top: tier === 'heavy' ? 4 : 2,
        right: tier === 'heavy' ? 6 : tier === 'standard' ? 4 : 2,
        width: 4, height: 4,
        borderRadius: '50%',
        background: online ? '#22c55e' : '#ef4444',
        boxShadow: `0 0 3px ${online ? '#22c55e' : '#ef4444'}`,
        pointerEvents: 'none',
      }} />
    </motion.button>
  );
};

export default MoleculeCard;
