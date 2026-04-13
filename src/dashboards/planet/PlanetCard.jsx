import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Deterministic hash for per-element variety
function idHash(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Category → planet type (affects visual)
const CAT_TYPE = {
  NOBLE: 'gas',      LANTHANIDE: 'gas',
  TRANSITION: 'ice',  ALKALI: 'rocky', ALKALINE: 'rocky',
  CHALCOGEN: 'volcanic', METALLOID: 'metallic', PNICTOGEN: 'ice',
  NONMETAL: 'dwarf',  HALOGEN: 'dwarf', POST: 'dwarf', ACTINIDE: 'rocky',
};

// ─────────────────────────────────────────────
// PLANET VISUAL — circular planet with bands, halo, optional rings
// ─────────────────────────────────────────────
const PlanetVisual = ({ online, cat, planetType, hasRing, size }) => {
  const sphereSize = size * 0.6;

  // Surface gradient varies by type
  const surfaceGradient = online ? {
    gas: `linear-gradient(
      180deg,
      ${cat.text}99 0%,
      ${cat.border}AA 25%,
      ${cat.text}BB 40%,
      ${cat.glow.replace(/[\d.]+\)$/, '0.5)')} 55%,
      ${cat.border}88 70%,
      ${cat.text}66 100%
    )`,
    ice: `linear-gradient(
      180deg,
      ${cat.text}88 0%,
      ${cat.border}66 40%,
      ${cat.text}AA 100%
    )`,
    rocky: `radial-gradient(
      circle at 35% 35%,
      ${cat.text}CC 0%,
      ${cat.border}88 50%,
      ${cat.glow.replace(/[\d.]+\)$/, '0.2)')} 100%
    )`,
    volcanic: `radial-gradient(
      circle at 40% 40%,
      ${cat.text}DD 0%,
      #ff660044 40%,
      ${cat.border}66 100%
    )`,
    metallic: `radial-gradient(
      circle at 30% 30%,
      #ffffffBB 0%,
      ${cat.text}99 40%,
      ${cat.border}55 100%
    )`,
    dwarf: `radial-gradient(
      circle at 40% 40%,
      ${cat.text}88 0%,
      ${cat.border}44 100%
    )`,
  }[planetType] || `radial-gradient(circle, ${cat.text}88, ${cat.border}44)` : 'rgba(255,255,255,0.06)';

  return (
    <div style={{
      position: 'relative',
      width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Atmospheric halo */}
      {online && (
        <div style={{
          position: 'absolute',
          width: sphereSize + 10, height: sphereSize + 10,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${cat.glow.replace(/[\d.]+\)$/, '0.12)')} 40%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      )}

      {/* Ring system (behind planet — bottom half) */}
      {hasRing && (
        <div style={{
          position: 'absolute',
          width: sphereSize * 1.7, height: sphereSize * 0.35,
          borderRadius: '50%',
          border: `1.5px solid ${online ? cat.border : 'rgba(255,255,255,0.08)'}`,
          opacity: online ? 0.55 : 0.12,
          transform: 'rotate(-18deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}

      {/* Planet sphere */}
      <div style={{
        width: sphereSize, height: sphereSize,
        borderRadius: '50%',
        background: surfaceGradient,
        boxShadow: online
          ? `inset -${sphereSize * 0.15}px -${sphereSize * 0.1}px ${sphereSize * 0.3}px rgba(0,0,0,0.4), 0 0 ${sphereSize * 0.4}px ${cat.glow.replace(/[\d.]+\)$/, '0.2)')}`
          : 'inset -3px -2px 6px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}>
        {/* Surface bands for gas/ice giants */}
        {online && (planetType === 'gas' || planetType === 'ice') && (
          <>
            <div style={{
              position: 'absolute', top: '28%', left: 0, right: 0, height: 1.5,
              background: `${cat.border}44`, borderRadius: 1,
            }} />
            <div style={{
              position: 'absolute', top: '48%', left: '5%', right: '5%', height: 2,
              background: `${cat.text}33`, borderRadius: 1,
            }} />
            <div style={{
              position: 'absolute', top: '65%', left: '10%', right: '10%', height: 1,
              background: `${cat.border}33`, borderRadius: 1,
            }} />
          </>
        )}

        {/* Specular highlight (light reflection on upper-left) */}
        <div style={{
          position: 'absolute',
          top: '12%', left: '15%',
          width: '35%', height: '25%',
          borderRadius: '50%',
          background: online
            ? 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.25), transparent)'
            : 'none',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Ring system (in front of planet — top half, for 3D illusion) */}
      {hasRing && (
        <div style={{
          position: 'absolute',
          width: sphereSize * 1.7, height: sphereSize * 0.35,
          borderRadius: '50%',
          borderTop: `1.5px solid ${online ? cat.border : 'rgba(255,255,255,0.06)'}`,
          borderLeft: 'none', borderRight: 'none', borderBottom: 'none',
          opacity: online ? 0.4 : 0.08,
          transform: 'rotate(-18deg)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// PLANET CARD — circular planet with text
// ─────────────────────────────────────────────
const CARD_SIZE = 68;

const PlanetCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const planetType = CAT_TYPE[element.cat] || 'rocky';
  const hash = idHash(element.id);
  // ~30% of planets get rings (deterministic per element)
  const hasRing = hash % 10 < 3;

  const orbitalClass = cardDisplay?.topLeft ?? element.symbol;
  const planetName = cardDisplay?.displayName ?? element.service ?? element.name;
  const atmosphere = cardDisplay?.bottomLabel ?? element.mass;
  const shortName = (planetName.length > 8 ? planetName.slice(0, 7) + '…' : planetName).toUpperCase();

  return (
    <motion.button
      aria-label={element.service || element.name}
      onClick={() => onClick(element)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.15, zIndex: 40, rotateY: -4, rotateX: 3 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: CARD_SIZE, height: CARD_SIZE, transformPerspective: 800,
        borderRadius: '50%',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
        padding: 0,
        filter: online ? 'none' : 'grayscale(0.5) brightness(0.6)',
      }}
    >
      {/* Planet visual */}
      <PlanetVisual
        online={online}
        cat={cat}
        planetType={planetType}
        hasRing={hasRing}
        size={CARD_SIZE * 0.85}
      />

      {/* Orbital class — top */}
      <div style={{
        position: 'absolute', top: 1,
        left: '50%', transform: 'translateX(-50%)',
        fontSize: 5.5, fontFamily: MONO, color: cat.text,
        opacity: 0.6, whiteSpace: 'nowrap',
      }}>
        {orbitalClass.split(' ')[0]}
      </div>

      {/* Planet name — bottom */}
      <div style={{
        position: 'absolute', bottom: 3,
        left: '50%', transform: 'translateX(-50%)',
        fontSize: 7, fontFamily: MONO,
        color: 'rgba(255,255,255,0.6)',
        whiteSpace: 'nowrap', letterSpacing: '0.03em',
        lineHeight: 1,
      }}>
        {shortName}
      </div>
    </motion.button>
  );
};

// Export the card size so PlanetGrid can position correctly
export const PLANET_CARD_SIZE = CARD_SIZE;
export default PlanetCard;
