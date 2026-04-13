import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Category → star visual shape (matches CAT_RING in StarMapGrid)
const CAT_SHAPE = {
  NOBLE: 'major', LANTHANIDE: 'major',
  TRANSITION: 'cross', ALKALI: 'cross', ALKALINE: 'cross',
  CHALCOGEN: 'diamond', METALLOID: 'diamond', PNICTOGEN: 'diamond',
  NONMETAL: 'dwarf', HALOGEN: 'dwarf', POST: 'dwarf', ACTINIDE: 'dwarf',
};

// 4-pointed star clip path — 30% indent on sides
const STAR_CLIP = 'polygon(50% 0%, 62% 35%, 100% 50%, 62% 65%, 50% 100%, 38% 65%, 0% 50%, 38% 35%)';
// Diamond clip path
const DIAMOND_CLIP = 'polygon(50% 4%, 96% 50%, 50% 96%, 4% 50%)';

// ─────────────────────────────────────────────
// CORONA RAYS — emanating glow lines for major stars
// ─────────────────────────────────────────────
const CoronaRays = ({ color, count = 6 }) => {
  const rays = Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    return (
      <div key={i} style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 1, height: 18,
        background: `linear-gradient(to top, ${color}, transparent)`,
        opacity: 0.35,
        transformOrigin: '50% 0%',
        transform: `translate(-50%, 0) rotate(${angle}deg)`,
        pointerEvents: 'none',
      }} />
    );
  });
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{rays}</div>;
};

// ─────────────────────────────────────────────
// MAJOR STAR — large glowing circle with corona
// ─────────────────────────────────────────────
const MajorStarVisual = ({ online, cat }) => (
  <div style={{
    position: 'relative',
    width: 40, height: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {/* Corona rays */}
    {online && <CoronaRays color={cat.glow.replace(/[\d.]+\)$/, '0.5)')} count={8} />}
    {/* Outer halo */}
    <div style={{
      position: 'absolute',
      width: 38, height: 38,
      borderRadius: '50%',
      background: online
        ? `radial-gradient(circle, ${cat.glow.replace(/[\d.]+\)$/, '0.15)')} 0%, transparent 70%)`
        : 'none',
      pointerEvents: 'none',
    }} />
    {/* Core */}
    <div style={{
      width: 22, height: 22,
      borderRadius: '50%',
      background: online
        ? `radial-gradient(circle at 38% 38%, #fff, ${cat.text}CC 40%, ${cat.glow.replace(/[\d.]+\)$/, '0.3)')} 75%, transparent)`
        : 'rgba(255,255,255,0.06)',
      boxShadow: online
        ? `0 0 12px ${cat.glow}, 0 0 24px ${cat.glow.replace(/[\d.]+\)$/, '0.3)')}, 0 0 4px #fff`
        : 'none',
    }} />
  </div>
);

// ─────────────────────────────────────────────
// CROSS STAR — 4-pointed star shape
// ─────────────────────────────────────────────
const CrossStarVisual = ({ online, cat }) => (
  <div style={{
    width: 32, height: 32,
    clipPath: STAR_CLIP,
    background: online
      ? `radial-gradient(circle at 50% 50%, ${cat.text}, ${cat.glow.replace(/[\d.]+\)$/, '0.4)')} 60%, ${cat.bg})`
      : 'rgba(255,255,255,0.06)',
    boxShadow: online ? `0 0 10px ${cat.glow}` : 'none',
    position: 'relative',
  }}>
    {/* Bright center point */}
    {online && <div style={{
      position: 'absolute', top: '50%', left: '50%',
      width: 6, height: 6, borderRadius: '50%',
      background: '#fff',
      transform: 'translate(-50%, -50%)',
      boxShadow: `0 0 6px #fff, 0 0 10px ${cat.glow}`,
    }} />}
  </div>
);

// ─────────────────────────────────────────────
// DIAMOND — rotated square, crystalline
// ─────────────────────────────────────────────
const DiamondVisual = ({ online, cat }) => (
  <div style={{
    width: 26, height: 26,
    clipPath: DIAMOND_CLIP,
    background: online
      ? `linear-gradient(135deg, ${cat.text}DD, ${cat.glow.replace(/[\d.]+\)$/, '0.35)')} 50%, ${cat.border}44)`
      : 'rgba(255,255,255,0.05)',
    boxShadow: online ? `0 0 8px ${cat.glow}` : 'none',
    position: 'relative',
  }}>
    {online && <div style={{
      position: 'absolute', top: '50%', left: '50%',
      width: 4, height: 4, borderRadius: '50%',
      background: '#ffffffCC',
      transform: 'translate(-50%, -50%)',
      boxShadow: `0 0 4px #fff`,
    }} />}
  </div>
);

// ─────────────────────────────────────────────
// DWARF STAR — small dim circle
// ─────────────────────────────────────────────
const DwarfVisual = ({ online, cat }) => (
  <div style={{
    width: 14, height: 14,
    borderRadius: '50%',
    background: online
      ? `radial-gradient(circle at 40% 40%, ${cat.text}BB, ${cat.glow.replace(/[\d.]+\)$/, '0.2)')} 70%, transparent)`
      : 'rgba(255,255,255,0.04)',
    boxShadow: online ? `0 0 6px ${cat.glow}` : 'none',
  }} />
);

// ─────────────────────────────────────────────
// STAR CARD — shape varies by element category
// ─────────────────────────────────────────────
const StarCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const shape = CAT_SHAPE[element.cat] || 'dwarf';

  const designation = cardDisplay?.topLeft ?? element.symbol;
  const displayName = cardDisplay?.displayName ?? element.service ?? element.name;
  const spectralType = cardDisplay?.bottomLabel ?? element.mass;
  const shortName = (displayName.length > 10 ? displayName.slice(0, 9) + '…' : displayName).toUpperCase();

  // Shape-dependent sizing
  const size = shape === 'major' ? 72 : shape === 'cross' ? 64 : shape === 'diamond' ? 56 : 44;
  const isCompact = shape === 'dwarf';

  // All shapes use circular bounding for the star field aesthetic
  const outerStyle = {
    width: size, height: size,
    borderRadius: '50%',
    background: online ? `${cat.bg}CC` : 'rgba(15,15,25,0.5)',
    border: `1px solid ${online ? `${cat.border}33` : 'rgba(255,255,255,0.06)'}`,
    filter: online ? 'none' : 'grayscale(0.5)',
    boxShadow: online && shape === 'major'
      ? `0 0 20px ${cat.glow.replace(/[\d.]+\)$/, '0.25)')}, 0 0 40px ${cat.glow.replace(/[\d.]+\)$/, '0.1)')}`
      : online
        ? `0 0 8px ${cat.glow.replace(/[\d.]+\)$/, '0.15)')}`
        : 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
    cursor: 'pointer',
    padding: 0,
  };

  const Visual = shape === 'major' ? MajorStarVisual
    : shape === 'cross' ? CrossStarVisual
    : shape === 'diamond' ? DiamondVisual
    : DwarfVisual;

  return (
    <motion.button
      aria-label={element.service || element.name}
      onClick={() => onClick(element)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.15, zIndex: 80, rotateY: 5, rotateX: -3 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{ ...outerStyle, transformPerspective: 800 }}
    >
      {/* Star visual */}
      <Visual online={online} cat={cat} />

      {/* Designation — top for non-compact */}
      {!isCompact && (
        <div style={{
          position: 'absolute',
          top: shape === 'major' ? 4 : 2,
          left: '50%', transform: 'translateX(-50%)',
          fontSize: 6, fontFamily: MONO, color: cat.text,
          opacity: 0.7, whiteSpace: 'nowrap',
        }}>
          {designation}
        </div>
      )}

      {/* Stellar name — below visual for non-compact */}
      {!isCompact && (
        <div style={{
          position: 'absolute',
          bottom: shape === 'major' ? 10 : shape === 'cross' ? 6 : 4,
          left: '50%', transform: 'translateX(-50%)',
          fontSize: shape === 'major' ? 8 : 7,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: MONO, lineHeight: 1,
          whiteSpace: 'nowrap', letterSpacing: '0.03em',
        }}>
          {shortName}
        </div>
      )}

      {/* Spectral type — absolute bottom for major only */}
      {shape === 'major' && (
        <div style={{
          position: 'absolute', bottom: 2,
          left: '50%', transform: 'translateX(-50%)',
          fontSize: 6, fontFamily: MONO, color: cat.text, opacity: 0.45,
          whiteSpace: 'nowrap',
        }}>
          {spectralType}
        </div>
      )}

      {/* Tooltip for compact cards (dwarf) shows name on hover via title */}
    </motion.button>
  );
};

export default StarCard;
