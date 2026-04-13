import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import StatusDot from '../../components/StatusDot.jsx';

const MONO = 'monospace';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// ── Fossil type assignment by category ──
const CAT_TYPE = {
  NOBLE: 'skull', LANTHANIDE: 'skull',
  TRANSITION: 'bone', ALKALI: 'bone', ALKALINE: 'bone',
  CHALCOGEN: 'footprint', METALLOID: 'footprint', PNICTOGEN: 'footprint',
  NONMETAL: 'leaf', HALOGEN: 'leaf', POST: 'leaf', ACTINIDE: 'leaf',
};

export const DINO_CARD_SIZES = { skull: 68, bone: 60, footprint: 52, leaf: 44 };

function idHash(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ── SVG fossil silhouettes ──
// Each returns a path string fitting within the given viewBox

const FOSSIL_PATHS = {
  // T-Rex skull silhouette — facing right
  skull: `M 14 38 C 14 28 18 18 28 14 C 34 11 42 10 48 12 C 54 14 58 18 60 22
          L 62 20 L 64 23 L 62 24 C 63 28 62 32 60 36 L 58 36 L 56 38
          C 54 40 50 42 46 42 L 44 44 L 42 42 L 38 44 L 36 42
          C 30 42 24 42 20 40 C 16 38 14 36 14 38 Z
          M 52 22 C 53 22 54 23 54 24 C 54 25 53 26 52 26 C 51 26 50 25 50 24 C 50 23 51 22 52 22 Z
          M 46 34 L 48 32 L 50 34 L 48 35 Z
          M 40 36 L 42 34 L 44 36 L 42 37 Z`,

  // Femur bone — knobby ends, narrow shaft
  bone: `M 18 16 C 14 14 12 18 14 22 C 16 24 18 24 20 22 L 22 24
         C 24 30 30 42 34 48 L 32 50 C 30 52 30 56 34 58
         C 38 60 40 56 38 52 L 36 50 L 38 48
         C 42 42 48 30 50 24 L 52 22 C 54 24 56 24 58 22
         C 60 18 58 14 54 16 C 52 18 50 18 50 20 L 48 22
         C 46 28 40 40 36 46 L 34 46 C 30 40 24 28 22 22
         L 20 20 C 20 18 18 18 18 16 Z`,

  // Three-toed dinosaur track
  footprint: `M 32 48 C 30 42 28 34 26 28 C 24 24 22 20 20 16
              C 22 16 24 18 26 22 L 28 18 C 28 14 28 10 30 8
              C 32 10 32 14 32 18 L 34 22 C 36 18 38 14 40 10
              C 42 12 40 16 38 20 L 36 24
              C 38 30 40 38 42 44 C 44 48 42 52 38 52
              C 36 52 34 50 34 48 L 32 48 Z
              M 28 50 C 26 50 24 52 24 54 C 24 56 26 58 28 58
              C 36 58 40 56 42 54 C 40 56 36 58 32 56
              C 30 54 28 52 28 50 Z`,

  // Fossilized leaf — oval with veins
  leaf: `M 34 8 C 22 14 14 26 14 38 C 14 48 20 54 30 56
         C 32 56 34 56 36 56 C 46 54 52 48 52 38
         C 52 26 44 14 34 8 Z
         M 34 12 L 34 52
         M 24 24 L 34 30
         M 44 24 L 34 30
         M 22 36 L 34 40
         M 46 36 L 34 40
         M 26 48 L 34 50
         M 42 48 L 34 50`,
};

// Crack line patterns per fossil type (seeded by idHash)
function getCrackLines(type, hash) {
  const base = hash % 3;
  const cracks = [];
  if (type === 'skull') {
    if (base >= 0) cracks.push('M 20 20 L 35 28');
    if (base >= 1) cracks.push('M 55 30 L 48 40');
    if (base >= 2) cracks.push('M 30 35 L 22 42');
  } else if (type === 'bone') {
    if (base >= 0) cracks.push('M 28 26 L 38 32');
    if (base >= 1) cracks.push('M 40 38 L 34 46');
    if (base >= 2) cracks.push('M 22 32 L 30 28');
  } else if (type === 'footprint') {
    if (base >= 0) cracks.push('M 26 30 L 36 34');
    if (base >= 1) cracks.push('M 38 40 L 30 48');
    if (base >= 2) cracks.push('M 20 44 L 32 42');
  } else {
    if (base >= 0) cracks.push('M 22 20 L 34 28');
    if (base >= 1) cracks.push('M 44 32 L 34 40');
    if (base >= 2) cracks.push('M 28 44 L 36 50');
  }
  return cracks;
}

const DinoCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;

  const cladeAbbr = cardDisplay?.topLeft ?? element.symbol;
  const species = cardDisplay?.displayName ?? element.service ?? element.name;
  const shortSpecies = species.split(' ')[0];
  const displayName = (shortSpecies.length > 10 ? shortSpecies.slice(0, 9) + '\u2026' : shortSpecies).toUpperCase();

  const fossilType = CAT_TYPE[element.cat] ?? 'leaf';
  const cardSize = DINO_CARD_SIZES[fossilType];
  const hash = idHash(element.id ?? element.symbol ?? 'x');
  const cracks = getCrackLines(fossilType, hash);

  // Fossil texture colors
  const amberGrad1 = `hsla(35, 70%, 45%, ${isOffline ? 0 : 0.25})`;
  const amberGrad2 = `hsla(28, 60%, 30%, ${isOffline ? 0 : 0.15})`;
  const stoneGrad1 = 'rgba(120,115,105,0.25)';
  const stoneGrad2 = 'rgba(80,78,72,0.15)';
  const fillGrad1 = isOffline ? stoneGrad1 : amberGrad1;
  const fillGrad2 = isOffline ? stoneGrad2 : amberGrad2;

  const glowShadow = stats.online
    ? `0 0 10px ${cat.glow}, 0 0 20px ${cat.glow.replace(/[\d.]+\)$/, '0.08)')}`
    : 'none';



  return (
    <motion.button
      className="cursor-pointer relative select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: cardSize,
        height: cardSize + 16,
        overflow: 'visible',
        background: 'transparent',
        border: 'none',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      aria-label={`${element.service || element.name}: ${stats.online ? 'online' : 'offline'}`}
      tabIndex={0}
      title={element.service || element.name}
      onClick={() => onClick(element)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.1, zIndex: 20, rotateY: -3, rotateX: 2 }}
    >
      {/* Clade abbreviation top */}
      <div style={{
        fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8,
        letterSpacing: '0.08em', textAlign: 'center', lineHeight: 1, marginBottom: 2,
      }}>
        {cladeAbbr}
      </div>

      {/* Fossil SVG */}
      <svg
        viewBox="0 0 68 64"
        style={{
          width: cardSize - 4,
          height: cardSize - 8,
          filter: isOffline ? 'grayscale(0.7)' : 'none',
          overflow: 'visible',
        }}
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`fg-${element.id ?? element.symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillGrad1} />
            <stop offset="100%" stopColor={fillGrad2} />
          </linearGradient>
        </defs>

        {/* Excavation frame — dashed dig site outline */}
        <rect
          x={2} y={2} width={64} height={60} rx={6} ry={6}
          fill="none"
          stroke={isOffline ? 'rgba(120,115,105,0.2)' : `${cat.border}44`}
          strokeWidth={0.8}
          strokeDasharray="4 3"
        />

        {/* Background fill — amber/stone */}
        <rect
          x={4} y={4} width={60} height={56} rx={4} ry={4}
          fill={isOffline ? 'rgba(30,28,25,0.5)' : `${cat.bg}`}
          opacity={0.7}
          style={{ boxShadow: glowShadow }}
        />

        {/* Fossil silhouette */}
        <g transform="translate(0, -2)">
          <path
            d={FOSSIL_PATHS[fossilType]}
            fill={isOffline ? 'rgba(160,155,145,0.3)' : `${cat.text}55`}
            stroke={isOffline ? 'rgba(160,155,145,0.4)' : cat.text}
            strokeWidth={0.8}
            opacity={isOffline ? 0.5 : 0.85}
            style={{
              filter: stats.online ? `drop-shadow(0 0 3px ${cat.glow})` : 'none',
            }}
          />
          {/* Vein lines for leaf type rendered as strokes */}
          {fossilType === 'leaf' && (
            <g stroke={isOffline ? 'rgba(160,155,145,0.2)' : `${cat.text}33`} strokeWidth={0.5} fill="none">
              <line x1={34} y1={12} x2={34} y2={52} />
              <line x1={24} y1={24} x2={34} y2={30} />
              <line x1={44} y1={24} x2={34} y2={30} />
              <line x1={22} y1={36} x2={34} y2={40} />
              <line x1={46} y1={36} x2={34} y2={40} />
              <line x1={26} y1={48} x2={34} y2={50} />
              <line x1={42} y1={48} x2={34} y2={50} />
            </g>
          )}
        </g>

        {/* Crack lines across fossil surface */}
        {cracks.map((d, i) => (
          <path
            key={`crack-${i}`}
            d={d}
            fill="none"
            stroke={isOffline ? 'rgba(100,95,85,0.25)' : 'rgba(200,180,140,0.2)'}
            strokeWidth={0.5}
            strokeLinecap="round"
          />
        ))}

        {/* Status dot — WCAG 1.4.1 */}
        <foreignObject x={54} y={2} width={12} height={12}>
          <StatusDot online={stats.online} stale={stats.stale} size={8} />
        </foreignObject>

        {/* Amber glow overlay when online */}
        {stats.online && !prefersReducedMotion && (
          <motion.rect
            x={4} y={4} width={60} height={56} rx={4} ry={4}
            fill={cat.glow}
            opacity={0}
            animate={{ opacity: [0, 0.06, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </svg>

      {/* Species short name below fossil */}
      <div style={{
        textAlign: 'center', fontSize: 8, color: 'rgba(255,255,255,0.6)',
        letterSpacing: '0.04em', fontFamily: MONO, lineHeight: 1, marginTop: 1,
      }}>
        {displayName}
      </div>

      {/* Epoch bottom label */}
      <div style={{
        textAlign: 'center', fontSize: 6.5, fontFamily: MONO,
        color: cat.text, opacity: 0.5, lineHeight: 1, marginTop: 1,
      }}>
        {cardDisplay?.bottomLabel ?? element.mass}
      </div>
    </motion.button>
  );
};

export default DinoCard;
