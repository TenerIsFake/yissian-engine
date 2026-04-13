import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* Rune marks for the spell circle rings */
const INNER_SIGILS = ['\u16A0', '\u16A2', '\u16A6', '\u16B1', '\u16B7', '\u16C1'];
const OUTER_SIGILS = ['\u16A8', '\u16AA', '\u16B2', '\u16B9', '\u16BE', '\u16C7', '\u16C9', '\u16CB'];

/**
 * SpellCircleRelay -- ARCANE-mode Download/Upload bandwidth diagram.
 * Concentric rotating magical circles with rune marks.
 * Inner ring rotates clockwise, outer counter-clockwise.
 * Speed proportional to bandwidth level.
 * Download: energy flows inward. Upload: energy flows outward.
 *
 * Props: { label, level, online, details, variant, size, jablonskiLabel }
 * variant: 'emission' = download (inward), 'excitation' = upload (outward)
 */
const SpellCircleRelay = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const filtId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isDownload = variant === 'emission';
  const act = level / 100;

  /* Fixed arcane color palette for bandwidth */
  const baseHue = isDownload ? 270 : 200; // purple for DL, blue for UL
  const color      = online ? `hsl(${baseHue}, 80%, 65%)` : '#6b7280';
  const colorFaded = online ? `hsla(${baseHue}, 80%, 65%, 0.3)` : 'rgba(107,114,128,0.3)';

  /* Rotation speed: faster with more bandwidth */
  const innerDuration = Math.max(4, 20 - act * 16);  // 20s idle -> 4s at 100%
  const outerDuration = Math.max(6, 25 - act * 19);  // 25s idle -> 6s at 100%

  const dirLabel = isDownload ? 'CONJURE' : 'BANISH';

  /* Energy flow particles (move inward for DL, outward for UL) */
  const particleCount = Math.floor(level / 20) + 1; // 1-6 particles
  const particles = Array.from({ length: Math.min(particleCount, 6) }, (_, i) => {
    const angle = (360 / Math.min(particleCount, 6)) * i;
    return { angle, i };
  });

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
          minWidth: 130, background: 'rgba(0,0,0,0.88)',
          border: `1px solid ${color}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${color}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            {jablonskiLabel || `SPELL_CIRCLE \u25C6 ${dirLabel}`}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% \u2014 ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          <filter id={`${filtId}-glow`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer ring */}
        {prefersReducedMotion ? (
          <g>
            <circle cx={50} cy={50} r={42} fill="none" stroke={color}
              strokeWidth="0.6" opacity={0.2} strokeDasharray="4 3" />
            {OUTER_SIGILS.map((s, i) => {
              const a = (360 / OUTER_SIGILS.length) * i;
              const rad = (a * Math.PI) / 180;
              const sx = 50 + Math.cos(rad) * 42;
              const sy = 50 + Math.sin(rad) * 42;
              return (
                <text key={`os-${i}`} x={sx} y={sy} textAnchor="middle" dominantBaseline="central"
                  fill={color} fontSize="5" fontFamily="serif" opacity={0.2 + act * 0.5}>
                  {s}
                </text>
              );
            })}
          </g>
        ) : (
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: outerDuration, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '50px 50px' }}
          >
            <circle cx={50} cy={50} r={42} fill="none" stroke={color}
              strokeWidth="0.6" opacity={0.2} strokeDasharray="4 3" />
            {OUTER_SIGILS.map((s, i) => {
              const a = (360 / OUTER_SIGILS.length) * i;
              const rad = (a * Math.PI) / 180;
              const sx = 50 + Math.cos(rad) * 42;
              const sy = 50 + Math.sin(rad) * 42;
              return (
                <text key={`os-${i}`} x={sx} y={sy} textAnchor="middle" dominantBaseline="central"
                  fill={color} fontSize="5" fontFamily="serif" opacity={0.2 + act * 0.5}
                  filter={act > 0.5 ? `url(#${filtId}-glow)` : undefined}>
                  {s}
                </text>
              );
            })}
          </motion.g>
        )}

        {/* Inner ring */}
        {prefersReducedMotion ? (
          <g>
            <circle cx={50} cy={50} r={28} fill="none" stroke={color}
              strokeWidth="0.8" opacity={0.25} strokeDasharray="2 4" />
            {INNER_SIGILS.map((s, i) => {
              const a = (360 / INNER_SIGILS.length) * i;
              const rad = (a * Math.PI) / 180;
              const sx = 50 + Math.cos(rad) * 28;
              const sy = 50 + Math.sin(rad) * 28;
              return (
                <text key={`is-${i}`} x={sx} y={sy} textAnchor="middle" dominantBaseline="central"
                  fill={color} fontSize="5.5" fontFamily="serif" opacity={0.3 + act * 0.5}>
                  {s}
                </text>
              );
            })}
          </g>
        ) : (
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: innerDuration, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '50px 50px' }}
          >
            <circle cx={50} cy={50} r={28} fill="none" stroke={color}
              strokeWidth="0.8" opacity={0.25} strokeDasharray="2 4" />
            {INNER_SIGILS.map((s, i) => {
              const a = (360 / INNER_SIGILS.length) * i;
              const rad = (a * Math.PI) / 180;
              const sx = 50 + Math.cos(rad) * 28;
              const sy = 50 + Math.sin(rad) * 28;
              return (
                <text key={`is-${i}`} x={sx} y={sy} textAnchor="middle" dominantBaseline="central"
                  fill={color} fontSize="5.5" fontFamily="serif" opacity={0.3 + act * 0.5}
                  filter={act > 0.5 ? `url(#${filtId}-glow)` : undefined}>
                  {s}
                </text>
              );
            })}
          </motion.g>
        )}

        {/* Center circle — static */}
        <circle cx={50} cy={50} r={14} fill="none" stroke={color}
          strokeWidth="1" opacity={0.3} />

        {/* Energy flow particles */}
        {online && particles.map(({ angle, i: pi }) => {
          const rad = (angle * Math.PI) / 180;
          /* For download, particles move from outer to inner; upload from inner to outer */
          const startR = isDownload ? 40 : 16;
          const endR   = isDownload ? 16 : 40;
          const sx = 50 + Math.cos(rad) * startR;
          const sy = 50 + Math.sin(rad) * startR;
          const ex = 50 + Math.cos(rad) * endR;
          const ey = 50 + Math.sin(rad) * endR;

          return prefersReducedMotion ? (
            <circle key={`p-${pi}`} cx={(sx + ex) / 2} cy={(sy + ey) / 2} r={1.5}
              fill={color} opacity={0.5} />
          ) : (
            <motion.circle key={`p-${pi}`} r={1.5} fill={color}
              animate={{
                cx: [sx, ex, sx],
                cy: [sy, ey, sy],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.max(1.5, 3 - act * 1.5),
                repeat: Infinity,
                ease: 'easeInOut',
                delay: pi * 0.4,
              }}
              style={{ filter: `drop-shadow(0 0 2px ${color})` }}
            />
          );
        })}

        {/* Direction indicator at center */}
        {online && (
          isDownload
            ? <polygon points="46,52 54,52 50,56" fill={color} opacity={0.4 + act * 0.4}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
            : <polygon points="46,52 54,52 50,48" fill={color} opacity={0.4 + act * 0.4}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
        )}

        {/* Center percentage */}
        <text x={50} y={49} textAnchor="middle" fill={color} fontSize="7"
          fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>

        {/* Direction label */}
        <text x={50} y={8} textAnchor="middle" fill={color} fontSize="4.5"
          fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
          {isDownload ? '\u25BC CONJURE' : '\u25B2 BANISH'}
        </text>

        {/* Online dot */}
        <circle cx={88} cy={93} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default SpellCircleRelay;
