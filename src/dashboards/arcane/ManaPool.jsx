import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * ManaPool -- ARCANE-mode storage capacity diagram.
 * A top-down view of a glowing magical pool/well.
 * Liquid level rises with storage fill percentage.
 * Surface ripples when near capacity. Magical particles float on surface.
 * Color shifts from deep blue (empty) to bright violet (full).
 *
 * Props: { label, level, online, details, catKey, size }
 */
const ManaPool = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const gradId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const act = level / 100;
  const isCritical = level > 85;
  const showRipples = level > 70 && online;

  /* Color shifts: deep blue (0%) -> indigo (50%) -> bright violet (100%) */
  const hue = 240 - act * 60; // 240 (blue) -> 180 would be too far; use 240 -> 270 (violet)
  const poolHue = 240 + act * 40; // 240 (blue) -> 280 (violet)
  const color      = online ? `hsl(${poolHue}, 75%, ${50 + act * 15}%)` : '#6b7280';
  const colorFaded = online ? `hsla(${poolHue}, 75%, 55%, 0.3)` : 'rgba(107,114,128,0.3)';

  /* Pool geometry - top-down elliptical well */
  const poolCx = 50, poolCy = 50;
  const outerRx = 38, outerRy = 28;
  /* Fill ring grows inward from the well edge */
  const fillRx = outerRx * (0.3 + act * 0.7);
  const fillRy = outerRy * (0.3 + act * 0.7);
  const fillOpacity = 0.2 + act * 0.5;

  /* Floating particles */
  const particleCount = Math.floor(act * 8) + 2;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (360 / particleCount) * i + i * 37; // golden-angle-ish spread
    const rad = (angle * Math.PI) / 180;
    const dist = fillRx * 0.3 + (i % 3) * fillRx * 0.2;
    const distY = fillRy * 0.3 + (i % 3) * fillRy * 0.2;
    return {
      x: poolCx + Math.cos(rad) * dist,
      y: poolCy + Math.sin(rad) * distY,
      r: 0.8 + (i % 3) * 0.4,
      i,
    };
  });

  /* Ripple rings (concentric expanding ellipses) */
  const rippleCount = showRipples ? 3 : 0;

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-2"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute',
          ...(tooltipAbove ? { bottom: 'calc(100% + 8px)', top: 'auto' } : { top: 'calc(100% + 8px)', bottom: 'auto' }),
          left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          minWidth: 120, background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${color}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${color}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            MANA_POOL {'\u25C6'} RESERVOIR
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{d.label}</span>
              <span style={{ color }}>{d.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? color : '#374151' }} />
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              {online ? 'ONLINE' : online === null ? 'STARTING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(0)}% capacity, ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          {/* Pool radial gradient */}
          <radialGradient id={`${gradId}-pool`} cx="50%" cy="50%" rx="50%" ry="50%">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 0.8} />
            <stop offset="60%" stopColor={color} stopOpacity={fillOpacity * 0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={fillOpacity * 0.1} />
          </radialGradient>
          {/* Well edge shadow */}
          <radialGradient id={`${gradId}-edge`} cx="50%" cy="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
          </radialGradient>
        </defs>

        {/* Well outer edge (stone rim) */}
        <ellipse cx={poolCx} cy={poolCy} rx={outerRx + 3} ry={outerRy + 2}
          fill="none" stroke={color} strokeWidth="0.5" opacity={0.1} />
        <ellipse cx={poolCx} cy={poolCy} rx={outerRx + 1} ry={outerRy + 0.5}
          fill="none" stroke={color} strokeWidth="1.2" opacity={0.2}
          strokeDasharray="2 4" />

        {/* Well interior (dark void) */}
        <ellipse cx={poolCx} cy={poolCy} rx={outerRx} ry={outerRy}
          fill="rgba(5,3,15,0.6)" stroke={color} strokeWidth="0.6" opacity={0.3} />

        {/* Edge shadow gradient */}
        <ellipse cx={poolCx} cy={poolCy} rx={outerRx} ry={outerRy}
          fill={`url(#${gradId}-edge)`} />

        {/* Mana liquid fill */}
        {online && (
          isCritical && !prefersReducedMotion ? (
            <motion.ellipse cx={poolCx} cy={poolCy} rx={fillRx} ry={fillRy}
              fill={`url(#${gradId}-pool)`}
              animate={{ opacity: [fillOpacity, fillOpacity * 0.7, fillOpacity] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: `drop-shadow(0 0 ${3 + act * 5}px ${color})` }}
            />
          ) : (
            <ellipse cx={poolCx} cy={poolCy} rx={fillRx} ry={fillRy}
              fill={`url(#${gradId}-pool)`} opacity={fillOpacity}
              style={{ filter: online ? `drop-shadow(0 0 ${2 + act * 3}px ${color})` : 'none' }} />
          )
        )}

        {/* Surface ripples */}
        {showRipples && Array.from({ length: rippleCount }, (_, ri) => {
          const rippleRx = fillRx * (0.5 + ri * 0.25);
          const rippleRy = fillRy * (0.5 + ri * 0.25);
          return prefersReducedMotion ? (
            <ellipse key={`ripple-${ri}`} cx={poolCx} cy={poolCy}
              rx={rippleRx} ry={rippleRy}
              fill="none" stroke={color} strokeWidth="0.4" opacity={0.15} />
          ) : (
            <motion.ellipse key={`ripple-${ri}`} cx={poolCx} cy={poolCy}
              fill="none" stroke={color} strokeWidth="0.4"
              animate={{
                rx: [rippleRx * 0.6, rippleRx * 1.1, rippleRx * 0.6],
                ry: [rippleRy * 0.6, rippleRy * 1.1, rippleRy * 0.6],
                opacity: [0.25, 0.05, 0.25],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: ri * 1 }}
            />
          );
        })}

        {/* Floating magical particles */}
        {online && particles.map(({ x, y, r, i: pi }) => (
          prefersReducedMotion ? (
            <circle key={`fp-${pi}`} cx={x} cy={y} r={r}
              fill={color} opacity={0.4}
              style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
          ) : (
            <motion.circle key={`fp-${pi}`} r={r} fill={color}
              animate={{
                cx: [x - 2, x + 2, x - 2],
                cy: [y - 1, y + 1, y - 1],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + pi * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: pi * 0.3,
              }}
              style={{ filter: `drop-shadow(0 0 2px ${color})` }}
            />
          )
        ))}

        {/* Rune marks around the well rim */}
        {['\u16A0', '\u16B1', '\u16C1', '\u16B7'].map((rune, i) => {
          const a = (360 / 4) * i - 90;
          const rad = (a * Math.PI) / 180;
          const rx = poolCx + Math.cos(rad) * (outerRx + 5);
          const ry = poolCy + Math.sin(rad) * (outerRy + 5);
          return (
            <text key={`wr-${i}`} x={rx} y={ry} textAnchor="middle" dominantBaseline="central"
              fill={color} fontSize="5" fontFamily="serif" opacity={0.2 + act * 0.2}>
              {rune}
            </text>
          );
        })}

        {/* Percentage readout */}
        <text x={poolCx} y={poolCy + 3} textAnchor="middle" fill={color}
          fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={88} cy={92} r={2.5}
          fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default ManaPool;
