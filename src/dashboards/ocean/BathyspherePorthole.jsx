import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BathyspherePorthole — OCEAN-mode RAM diagram (replaces CoordComplex).
 * Thick brass-rimmed porthole window. Water darkens from clear blue (low RAM)
 * to pitch-black abyss (high RAM). Marine snow drifts past.
 * Critical: colossal squid eye appears, glass stress cracks.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, lowSpin, size
 */
const BathyspherePorthole = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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

  const isCpu = metal === 'Fe' || metal === 'Cu';
  const hue = isCpu
    ? 200 - (level / 100) * 180
    : 180 - (level / 100) * 150;
  const color = online ? `hsl(${hue}, 75%, ${40 + (level / 100) * 25}%)` : '#6b7280';

  const act = level / 100;
  const showSquid = level > 85 && online;

  // Water darkness — transitions from clear blue to deep black
  const waterLightness = Math.max(5, 55 - act * 50);
  const waterColor = online ? `hsl(210, 60%, ${waterLightness}%)` : '#1a1a2e';

  const depthLabel = level < 25 ? 'Photic' : level < 50 ? 'Twilight' : level < 75 ? 'Midnight' : 'Hadal';

  // Marine snow particles — more visible at depth
  const snowParticles = Array.from({ length: 8 }, (_, i) => ({
    cx: 30 + (i * 37 + i * i * 7) % 40,
    cy: 28 + (i * 23 + i * 13) % 44,
    r: 0.4 + (i % 3) * 0.3,
    opacity: 0.1 + act * 0.15 + (i % 2) * 0.05,
  }));

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-1"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          ...(tooltipAbove ? { bottom: 'calc(100% + 8px)', top: 'auto' } : { top: 'calc(100% + 8px)', bottom: 'auto' }),
          left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          minWidth: 140, background: 'rgba(0,0,0,0.88)',
          border: `1px solid ${color}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${color}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            BATHYSPHERE ◆ {isCpu ? 'PRESSURE' : 'O2'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            Depth Zone: {depthLabel}
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          <radialGradient id={`${gradId}-water`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={waterColor} stopOpacity={0.6} />
            <stop offset="100%" stopColor={waterColor} stopOpacity={0.95} />
          </radialGradient>
          <clipPath id={`${gradId}-glass`}>
            <circle cx={50} cy={50} r={28} />
          </clipPath>
        </defs>

        {/* Outer brass ring (thick bezel) */}
        <circle cx={50} cy={50} r={36} fill="none"
          stroke={color} strokeWidth="3" opacity={0.2} />
        <circle cx={50} cy={50} r={34} fill="none"
          stroke={color} strokeWidth="1" opacity={0.1} />

        {/* Bolt heads around the bezel */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const bx = 50 + 35 * Math.cos(angle);
          const by = 50 + 35 * Math.sin(angle);
          return (
            <circle key={`bolt-${i}`} cx={bx} cy={by} r={1.8}
              fill={color} opacity={0.15} stroke={color} strokeWidth="0.3" />
          );
        })}

        {/* Glass area — clipped circle */}
        <g clipPath={`url(#${gradId}-glass)`}>
          {/* Water fill */}
          <circle cx={50} cy={50} r={28} fill={`url(#${gradId}-water)`} />

          {/* Marine snow particles */}
          {online && snowParticles.map((p, i) => (
            prefersReducedMotion ? (
              <circle key={`snow-${i}`} cx={p.cx} cy={p.cy} r={p.r}
                fill="white" opacity={p.opacity} />
            ) : (
              <motion.circle key={`snow-${i}`} cx={p.cx} r={p.r}
                fill="white" opacity={p.opacity}
                animate={{ cy: [p.cy - 5, p.cy + 5] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: i * 0.4 }}
              />
            )
          ))}

          {/* Caustic light rays (only at shallow depths) */}
          {act < 0.5 && online && (
            <g opacity={0.08 * (1 - act * 2)}>
              <line x1={30} y1={25} x2={38} y2={70} stroke="white" strokeWidth="3" />
              <line x1={45} y1={22} x2={52} y2={72} stroke="white" strokeWidth="2" />
              <line x1={60} y1={24} x2={65} y2={68} stroke="white" strokeWidth="2.5" />
            </g>
          )}

          {/* Colossal squid eye at critical */}
          {showSquid && (() => {
            const squidScale = (level - 85) / 15;
            const eye = (
              <g>
                {/* Outer eye */}
                <ellipse cx={50} cy={50} rx={12 * squidScale} ry={14 * squidScale}
                  fill="none" stroke={color} strokeWidth="1.5" opacity={0.4 + squidScale * 0.4} />
                {/* Iris */}
                <ellipse cx={50} cy={50} rx={6 * squidScale} ry={10 * squidScale}
                  fill={color} opacity={0.2 + squidScale * 0.3} />
                {/* Pupil slit */}
                <ellipse cx={50} cy={50} rx={2 * squidScale} ry={8 * squidScale}
                  fill="black" opacity={0.6 * squidScale} />
                {/* Eye gleam */}
                <circle cx={47} cy={45} r={1.5 * squidScale}
                  fill="white" opacity={0.3 * squidScale} />
              </g>
            );
            return prefersReducedMotion ? eye : (
              <motion.g
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {eye}
              </motion.g>
            );
          })()}
        </g>

        {/* Glass reflection arc (top-left) */}
        <path d="M 32,30 Q 40,26 50,28" fill="none"
          stroke="white" strokeWidth="1" opacity={0.08} strokeLinecap="round" />

        {/* Inner glass bevel ring */}
        <circle cx={50} cy={50} r={28} fill="none"
          stroke={color} strokeWidth="0.8" opacity={0.25} />

        {/* Stress cracks at critical */}
        {showSquid && (
          <g opacity={0.2 + ((level - 85) / 15) * 0.3}>
            <path d="M 30,35 L 35,40 L 33,46" stroke={color} strokeWidth="0.5" fill="none" />
            <path d="M 65,62 L 62,56 L 66,52" stroke={color} strokeWidth="0.5" fill="none" />
            <path d="M 38,70 L 42,65 L 40,60" stroke={color} strokeWidth="0.4" fill="none" />
          </g>
        )}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{depthLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        Depth Zone
      </div>
    </div>
  );
};

export default BathyspherePorthole;
