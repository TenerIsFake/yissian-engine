import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

function idHash(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const CAT_TYPE = {
  NOBLE: 'guitar', LANTHANIDE: 'guitar',
  TRANSITION: 'drum', ALKALI: 'drum', ALKALINE: 'drum',
  CHALCOGEN: 'mic', METALLOID: 'mic', PNICTOGEN: 'mic',
  NONMETAL: 'pick', HALOGEN: 'pick', POST: 'pick', ACTINIDE: 'pick',
};

export const BAND_CARD_SIZES = {
  guitar: { w: 70, h: 60 },
  drum: 58,
  mic: { w: 44, h: 68 },
  pick: { w: 42, h: 48 },
};

function getSize(type) {
  const s = BAND_CARD_SIZES[type];
  if (typeof s === 'number') return { w: s, h: s };
  return s;
}

/* ── SVG instrument paths ── */

// Les Paul-ish electric guitar body silhouette
const GuitarSVG = ({ fill, glow, online, hash }) => (
  <svg viewBox="0 0 70 60" width={70} height={60} style={{ overflow: 'visible' }}>
    <path
      d="M35 2 C25 2, 14 8, 12 18 C10 26, 16 32, 20 34 C18 38, 14 42, 14 48 C14 54, 22 58, 35 58 C48 58, 56 54, 56 48 C56 42, 52 38, 50 34 C54 32, 60 26, 58 18 C56 8, 45 2, 35 2Z"
      fill={online ? fill : 'rgba(255,255,255,0.06)'}
      stroke={online ? fill : 'rgba(255,255,255,0.15)'}
      strokeWidth={0.8}
      opacity={online ? 0.85 : 0.4}
      style={online ? { filter: `drop-shadow(0 0 4px ${glow})` } : {}}
    />
    {/* Strings */}
    {online && !prefersReducedMotion ? (
      [0, 1, 2, 3].map(i => (
        <motion.line key={i}
          x1={28 + i * 5} y1={14} x2={28 + i * 5} y2={50}
          stroke={fill} strokeWidth={0.5} opacity={0.5}
          animate={{ x1: [28 + i * 5 - 0.3, 28 + i * 5 + 0.3, 28 + i * 5 - 0.3] }}
          transition={{ duration: 0.15 + (hash % 5) * 0.03, repeat: Infinity, delay: i * 0.08 }}
        />
      ))
    ) : (
      [0, 1, 2, 3].map(i => (
        <line key={i} x1={28 + i * 5} y1={14} x2={28 + i * 5} y2={50}
          stroke={online ? fill : 'rgba(255,255,255,0.08)'} strokeWidth={0.5} opacity={0.35} />
      ))
    )}
    {/* Pickups */}
    <rect x={26} y={24} width={18} height={3} rx={1} fill={online ? fill : 'rgba(255,255,255,0.08)'} opacity={0.3} />
    <rect x={26} y={36} width={18} height={3} rx={1} fill={online ? fill : 'rgba(255,255,255,0.08)'} opacity={0.3} />
  </svg>
);

// Circular drum, top-down view
const DrumSVG = ({ fill, glow, online, hash }) => (
  <svg viewBox="0 0 58 58" width={58} height={58} style={{ overflow: 'visible' }}>
    {/* Outer rim */}
    <circle cx={29} cy={29} r={27} fill="none"
      stroke={online ? fill : 'rgba(255,255,255,0.15)'} strokeWidth={2.5}
      opacity={online ? 0.7 : 0.3}
      style={online ? { filter: `drop-shadow(0 0 3px ${glow})` } : {}}
    />
    {/* Drum skin */}
    <circle cx={29} cy={29} r={24}
      fill={online ? fill : 'rgba(255,255,255,0.04)'}
      opacity={online ? 0.15 : 0.06}
    />
    {/* Inner ring */}
    <circle cx={29} cy={29} r={18} fill="none"
      stroke={online ? fill : 'rgba(255,255,255,0.08)'} strokeWidth={0.6} opacity={0.3}
    />
    {/* Tension rods */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
      const rad = (angle * Math.PI) / 180;
      return (
        <circle key={angle}
          cx={29 + Math.cos(rad) * 25.5} cy={29 + Math.sin(rad) * 25.5} r={1.5}
          fill={online ? fill : 'rgba(255,255,255,0.12)'} opacity={0.5}
        />
      );
    })}
    {/* Hit animation */}
    {online && !prefersReducedMotion && (
      <motion.circle cx={29} cy={29} r={12}
        fill={fill} opacity={0.1}
        animate={{ r: [10, 20, 10], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 1.8 + (hash % 4) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
      />
    )}
  </svg>
);

// SM58-style microphone silhouette (ball + shaft)
const MicSVG = ({ fill, glow, online, hash }) => (
  <svg viewBox="0 0 44 68" width={44} height={68} style={{ overflow: 'visible' }}>
    {/* Mic ball (grille) */}
    <ellipse cx={22} cy={18} rx={14} ry={16}
      fill={online ? fill : 'rgba(255,255,255,0.05)'}
      stroke={online ? fill : 'rgba(255,255,255,0.15)'}
      strokeWidth={0.8}
      opacity={online ? 0.7 : 0.35}
      style={online ? { filter: `drop-shadow(0 0 4px ${glow})` } : {}}
    />
    {/* Grille lines */}
    {[10, 14, 18, 22, 26].map(y => (
      <line key={y} x1={12} y1={y} x2={32} y2={y}
        stroke={online ? fill : 'rgba(255,255,255,0.08)'}
        strokeWidth={0.4} opacity={0.25}
      />
    ))}
    {/* Shaft */}
    <rect x={18} y={32} width={8} height={30} rx={3}
      fill={online ? fill : 'rgba(255,255,255,0.06)'}
      opacity={online ? 0.45 : 0.2}
    />
    {/* Band ring */}
    <rect x={17} y={33} width={10} height={3} rx={1}
      fill={online ? fill : 'rgba(255,255,255,0.1)'}
      opacity={0.5}
    />
    {/* Pulse animation */}
    {online && !prefersReducedMotion && (
      <motion.ellipse cx={22} cy={18} rx={16} ry={18}
        fill="none" stroke={fill} strokeWidth={0.6}
        animate={{ rx: [16, 20, 16], ry: [18, 22, 18], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2 + (hash % 3) * 0.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    )}
  </svg>
);

// Guitar pick (rounded triangle)
const PickSVG = ({ fill, glow, online, hash }) => (
  <svg viewBox="0 0 42 48" width={42} height={48} style={{ overflow: 'visible' }}>
    <path
      d="M21 4 C12 4, 4 12, 4 22 C4 30, 10 38, 21 46 C32 38, 38 30, 38 22 C38 12, 30 4, 21 4Z"
      fill={online ? fill : 'rgba(255,255,255,0.05)'}
      stroke={online ? fill : 'rgba(255,255,255,0.15)'}
      strokeWidth={0.8}
      opacity={online ? 0.75 : 0.35}
      style={online ? { filter: `drop-shadow(0 0 3px ${glow})` } : {}}
    />
    {/* Inner detail line */}
    <path
      d="M21 10 C15 10, 10 16, 10 22 C10 28, 14 34, 21 40 C28 34, 32 28, 32 22 C32 16, 27 10, 21 10Z"
      fill="none"
      stroke={online ? fill : 'rgba(255,255,255,0.08)'}
      strokeWidth={0.5} opacity={0.25}
    />
    {/* Glow animation */}
    {online && !prefersReducedMotion && (
      <motion.path
        d="M21 4 C12 4, 4 12, 4 22 C4 30, 10 38, 21 46 C32 38, 38 30, 38 22 C38 12, 30 4, 21 4Z"
        fill="none" stroke={glow} strokeWidth={1}
        animate={{ opacity: [0.4, 0.1, 0.4] }}
        transition={{ duration: 2.5 + (hash % 3) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
      />
    )}
  </svg>
);

const INSTRUMENT_MAP = { guitar: GuitarSVG, drum: DrumSVG, mic: MicSVG, pick: PickSVG };

const BandCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const level = stats?.level ?? 0;
  const online = stats?.online;
  const type = CAT_TYPE[element.cat] || 'pick';
  const { w, h } = getSize(type);
  const hash = idHash(element.id ?? element.symbol ?? '');

  // Background equalizer bars (faint, behind instrument)
  const bars = [
    Math.max(6, Math.round(level * 0.22)),
    Math.max(10, Math.round(level * 0.35)),
    Math.max(6, Math.round(level * 0.28)),
    Math.max(8, Math.round(level * 0.30)),
    Math.max(5, Math.round(level * 0.18)),
  ];

  const Instrument = INSTRUMENT_MAP[type];

  return (
    <motion.button
      onClick={onClick}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: 4, rotateX: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: w + 12, height: h + 28, transformPerspective: 800,
        background: cat.bg,
        border: `1px solid ${cat.border}`,
        borderRadius: 3,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        padding: 0,
        position: 'relative',
        overflow: 'visible',
        boxShadow: online ? `0 0 8px ${cat.glow}44` : 'none',
      }}
    >
      {/* Background equalizer bars (faint) */}
      <div style={{
        position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'flex-end', gap: 2, height: h * 0.6,
        opacity: 0.08, pointerEvents: 'none',
      }}>
        {bars.map((bh, i) => (
          <div key={i} style={{
            width: 3, height: bh, background: cat.text, borderRadius: 1,
            transition: 'height 0.6s ease',
          }} />
        ))}
      </div>

      {/* Top label: band member number */}
      <div style={{
        position: 'absolute', top: 2, left: 4,
        fontFamily: 'monospace', fontSize: 7,
        color: 'rgba(255,255,255,0.3)',
      }}>
        {cardDisplay?.topLeft ?? element.number}
      </div>

      {/* Instrument shape */}
      <Instrument fill={cat.text} glow={cat.glow} online={online} hash={hash} />

      {/* Symbol on/below instrument */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 9,
        fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.25)',
        letterSpacing: '0.05em',
        lineHeight: 1,
        marginTop: -2,
      }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>

      {/* Display name */}
      <div style={{
        position: 'absolute', bottom: 2,
        fontFamily: 'monospace', fontSize: 6,
        color: 'rgba(255,255,255,0.3)',
        whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis', maxWidth: w + 8,
        textAlign: 'center',
      }}>
        {cardDisplay?.bottomLabel ?? element.name}
      </div>
    </motion.button>
  );
};

export default BandCard;
