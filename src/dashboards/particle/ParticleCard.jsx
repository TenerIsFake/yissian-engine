import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* Deterministic hash for per-card visual variation */
function idHash(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* Category → detector type mapping */
const CAT_TYPE = {
  NOBLE: 'heavy', LANTHANIDE: 'heavy',
  TRANSITION: 'medium', ALKALI: 'medium', ALKALINE: 'medium',
  CHALCOGEN: 'medium', METALLOID: 'medium', PNICTOGEN: 'medium',
  NONMETAL: 'light', HALOGEN: 'light', POST: 'light', ACTINIDE: 'light',
};

export const PARTICLE_CARD_SIZES = { heavy: 68, medium: 56, light: 44 };

const ParticleCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const gradId = useId();
  const type = CAT_TYPE[element.cat] || 'medium';
  const sz = PARTICLE_CARD_SIZES[type];
  const half = sz / 2;
  const h = idHash(element.id || element.symbol);

  const trackColor = online ? cat.text : 'rgba(255,255,255,0.12)';
  const trackFaint = online ? cat.border : 'rgba(255,255,255,0.06)';
  const vertexGlow = online ? cat.glow : 'transparent';

  /* Detector ring radii scaled to card size */
  const rings = type === 'heavy'
    ? [half * 0.42, half * 0.68, half * 0.88]
    : type === 'medium'
      ? [half * 0.45, half * 0.78]
      : [half * 0.5, half * 0.85];

  /* --- Track path generators --- */
  const buildHeavyTrack = () => {
    /* Thick spiral curving inward to vertex + collision shower */
    const turns = 2.5;
    const startR = half * 0.82;
    const pts = [];
    for (let t = 0; t <= turns * Math.PI * 2; t += 0.25) {
      const r = startR * (1 - t / (turns * Math.PI * 2) * 0.85);
      const angle = t + (h % 6) * 0.5;
      pts.push(`${half + r * Math.cos(angle)},${half + r * Math.sin(angle)}`);
    }
    const spiralD = `M ${pts[0]} ` + pts.slice(1).map(p => `L ${p}`).join(' ');
    /* Shower rays from center */
    const showerCount = 5 + (h % 4);
    const showers = [];
    for (let i = 0; i < showerCount; i++) {
      const a = (Math.PI * 2 / showerCount) * i + (h % 10) * 0.3;
      const len = half * (0.15 + (((h >> i) % 5) / 10) * 0.2);
      showers.push({ x1: half, y1: half, x2: half + Math.cos(a) * len, y2: half + Math.sin(a) * len });
    }
    return { spiralD, showers };
  };

  const buildMediumTrack = () => {
    /* Curved arc entering from edge, decay point with V-fork */
    const entryAngle = ((h % 8) / 8) * Math.PI * 2;
    const ex = half + Math.cos(entryAngle) * half * 0.9;
    const ey = half + Math.sin(entryAngle) * half * 0.9;
    const decayX = half + Math.cos(entryAngle) * half * 0.15;
    const decayY = half + Math.sin(entryAngle) * half * 0.15;
    /* Control point for curve */
    const cpAngle = entryAngle + (h % 2 === 0 ? 0.6 : -0.6);
    const cpR = half * 0.55;
    const cpx = half + Math.cos(cpAngle) * cpR;
    const cpy = half + Math.sin(cpAngle) * cpR;
    const arcD = `M ${ex},${ey} Q ${cpx},${cpy} ${decayX},${decayY}`;
    /* V-fork from decay point */
    const forkAngle1 = entryAngle + Math.PI + 0.5;
    const forkAngle2 = entryAngle + Math.PI - 0.5;
    const forkLen = half * 0.55;
    const fork1D = `M ${decayX},${decayY} L ${decayX + Math.cos(forkAngle1) * forkLen},${decayY + Math.sin(forkAngle1) * forkLen}`;
    const fork2D = `M ${decayX},${decayY} L ${decayX + Math.cos(forkAngle2) * forkLen},${decayY + Math.sin(forkAngle2) * forkLen}`;
    return { arcD, fork1D, fork2D, decayX, decayY };
  };

  const buildLightTrack = () => {
    /* Straight thin track with slight curve (electron-like) */
    const entryAngle = ((h % 12) / 12) * Math.PI * 2;
    const ex = half + Math.cos(entryAngle) * half * 0.92;
    const ey = half + Math.sin(entryAngle) * half * 0.92;
    const exitAngle = entryAngle + Math.PI + (h % 2 === 0 ? 0.15 : -0.15);
    const outX = half + Math.cos(exitAngle) * half * 0.92;
    const outY = half + Math.sin(exitAngle) * half * 0.92;
    /* Slight deflection */
    const deflect = h % 2 === 0 ? 3 : -3;
    const mx = (ex + outX) / 2 + deflect;
    const my = (ey + outY) / 2 + deflect;
    const trackD = `M ${ex},${ey} Q ${mx},${my} ${outX},${outY}`;
    return { trackD };
  };

  /* Shower particle positions for animation */
  const showerDots = online && !prefersReducedMotion
    ? Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI * 2 / 6) * i + (h % 5) * 0.4;
        return { angle: a, key: i };
      })
    : [];

  return (
    <motion.button
      onClick={onClick}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotateY: 6, rotateX: -4 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: sz, height: sz, transformPerspective: 800,
        background: cat.bg,
        border: 'none',
        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox={`0 0 ${sz} ${sz}`}
        width={sz} height={sz}
        style={{ position: 'absolute', inset: 0 }}
        role="img"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${gradId}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={vertexGlow} stopOpacity={online ? 0.25 : 0} />
            <stop offset="100%" stopColor={vertexGlow} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Hexagonal border outline */}
        <polygon
          points={`${half},${sz * 0.02} ${sz * 0.933},${sz * 0.25} ${sz * 0.933},${sz * 0.75} ${half},${sz * 0.98} ${sz * 0.067},${sz * 0.75} ${sz * 0.067},${sz * 0.25}`}
          fill="none"
          stroke={online ? cat.border : 'rgba(255,255,255,0.08)'}
          strokeWidth={1}
          opacity={online ? 0.6 : 0.3}
        />

        {/* Detector glow */}
        <circle cx={half} cy={half} r={half * 0.95} fill={`url(#${gradId}-glow)`} />

        {/* Detector rings */}
        {rings.map((r, i) => (
          <circle key={i} cx={half} cy={half} r={r}
            fill="none"
            stroke={online ? cat.border : 'rgba(255,255,255,0.06)'}
            strokeWidth={0.6}
            strokeDasharray="3 4"
            opacity={online ? 0.25 + i * 0.08 : 0.08}
          />
        ))}

        {/* Particle tracks */}
        {type === 'heavy' && (() => {
          const { spiralD, showers } = buildHeavyTrack();
          return (
            <>
              <path d={spiralD} fill="none" stroke={trackColor}
                strokeWidth={1.4} strokeDasharray="3 3"
                opacity={online ? 0.65 : 0.15} />
              {showers.map((s, i) => (
                <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                  stroke={trackColor} strokeWidth={0.8}
                  opacity={online ? 0.4 : 0.1} />
              ))}
            </>
          );
        })()}

        {type === 'medium' && (() => {
          const { arcD, fork1D, fork2D, decayX, decayY } = buildMediumTrack();
          return (
            <>
              <path d={arcD} fill="none" stroke={trackColor}
                strokeWidth={1.1} strokeDasharray="2.5 3"
                opacity={online ? 0.6 : 0.15} />
              <path d={fork1D} fill="none" stroke={trackColor}
                strokeWidth={0.8} strokeDasharray="2 3"
                opacity={online ? 0.45 : 0.1} />
              <path d={fork2D} fill="none" stroke={trackColor}
                strokeWidth={0.8} strokeDasharray="2 3"
                opacity={online ? 0.45 : 0.1} />
              {/* Decay vertex marker */}
              <circle cx={decayX} cy={decayY} r={1.5}
                fill={online ? cat.text : 'rgba(255,255,255,0.1)'}
                opacity={online ? 0.7 : 0.15} />
            </>
          );
        })()}

        {type === 'light' && (() => {
          const { trackD } = buildLightTrack();
          return (
            <path d={trackD} fill="none" stroke={trackColor}
              strokeWidth={0.7} strokeDasharray="2 4"
              opacity={online ? 0.5 : 0.12} />
          );
        })()}

        {/* Collision vertex — bright center point */}
        <circle cx={half} cy={half} r={type === 'heavy' ? 2.5 : type === 'medium' ? 2 : 1.5}
          fill={online ? cat.text : 'rgba(255,255,255,0.1)'}
          opacity={online ? 0.9 : 0.2}
          style={{ filter: online ? `drop-shadow(0 0 ${type === 'heavy' ? 4 : 2}px ${cat.glow})` : 'none' }}
        />
        {/* Vertex ray lines */}
        {online && type !== 'light' && [0, 60, 120, 180, 240, 300].map(deg => {
          const rad = (deg * Math.PI) / 180;
          const len = type === 'heavy' ? 5 : 3.5;
          return (
            <line key={deg}
              x1={half} y1={half}
              x2={half + Math.cos(rad) * len} y2={half + Math.sin(rad) * len}
              stroke={cat.text} strokeWidth={0.5} opacity={0.3}
            />
          );
        })}

        {/* Shower animation — dots drifting outward */}
        {showerDots.map(({ angle, key }) => (
          <motion.circle key={key}
            cx={half} cy={half} r={0.8}
            fill={cat.text}
            animate={{
              cx: [half, half + Math.cos(angle) * half * 0.65, half + Math.cos(angle) * half * 0.9],
              cy: [half, half + Math.sin(angle) * half * 0.65, half + Math.sin(angle) * half * 0.9],
              opacity: [0.7, 0.35, 0],
            }}
            transition={{
              duration: 2.5 + (key % 3) * 0.5,
              repeat: Infinity,
              ease: 'easeOut',
              delay: key * 0.4,
            }}
          />
        ))}
      </svg>

      {/* Particle ID — top */}
      <div style={{
        position: 'absolute',
        top: type === 'heavy' ? 5 : type === 'medium' ? 3 : 2,
        left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: type === 'heavy' ? 7 : 6,
        color: 'rgba(255,255,255,0.3)',
        lineHeight: 1, pointerEvents: 'none',
      }}>
        {cardDisplay?.topLeft ?? element.number}
      </div>

      {/* Symbol — center below tracks */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, ${type === 'heavy' ? '20%' : type === 'medium' ? '25%' : '15%'})`,
        fontFamily: 'monospace',
        fontSize: type === 'heavy' ? 10 : type === 'medium' ? 9 : 8,
        fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.2)',
        lineHeight: 1, pointerEvents: 'none',
        textShadow: online ? `0 0 6px ${cat.glow}` : 'none',
      }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>

      {/* Display name — bottom */}
      <div style={{
        position: 'absolute',
        bottom: type === 'heavy' ? 5 : type === 'medium' ? 2 : 1,
        left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace',
        fontSize: type === 'heavy' ? 6 : 5,
        color: 'rgba(255,255,255,0.22)',
        lineHeight: 1, whiteSpace: 'nowrap',
        pointerEvents: 'none', maxWidth: sz - 6,
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {element.displayName ?? element.name}
      </div>
    </motion.button>
  );
};

export default ParticleCard;
