import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * MicroscopeView — BIO-mode CPU/RAM diagram.
 * Circular microscope viewport with crosshairs, cell specimens inside.
 * Count/activity increases with load. At high load: mitosis (cells splitting).
 * 4 magnification levels matching load quartiles.
 *
 * Props: { label, level, online, details, metal, isJahnTeller, lowSpin, size }
 * metal: 'Fe'|'Cu' → CPU hue (200→0 blue→red), 'Co'|'Ni' → RAM hue (160→30 teal→amber)
 */
const MicroscopeView = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const clipId = useId();
  const gradId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isCpu = metal === 'Fe' || metal === 'Cu';
  const hue = isCpu
    ? 200 - (level / 100) * 200
    : 160 - (level / 100) * 130;
  const color = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.35)` : 'rgba(107,114,128,0.35)';

  const act = level / 100;
  const magnification = level <= 25 ? '4x' : level <= 50 ? '10x' : level <= 75 ? '40x' : '100x';
  const cellCount = Math.floor(2 + act * 8); // 2-10 cells visible
  const showMitosis = level > 75 && online;

  // Generate cell positions deterministically
  const cells = [];
  for (let i = 0; i < cellCount; i++) {
    const angle = (i * 137.508) * Math.PI / 180; // golden angle
    const r = 8 + (i * 7) % 25;
    const cx = 50 + Math.cos(angle) * r;
    const cy = 50 + Math.sin(angle) * r;
    const cellR = 3 + (i % 3);
    const isMitotic = showMitosis && i < 2;
    cells.push({ cx, cy, r: cellR, isMitotic, i });
  }

  const statusLabel = isCpu ? 'CELL_ACTIVITY' : 'OSMOTIC_PRESSURE';

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
            MICROSCOPE ◆ {statusLabel}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            Magnification: {magnification} · {cellCount} specimens
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
          <clipPath id={clipId}>
            <circle cx={50} cy={50} r={38} />
          </clipPath>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={0.08} />
            <stop offset="80%" stopColor={color} stopOpacity={0.02} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Objective lens ring (outer) */}
        <circle cx={50} cy={50} r={42} fill="none" stroke={color} strokeWidth="2.5" opacity={0.15} />
        <circle cx={50} cy={50} r={40} fill="none" stroke={color} strokeWidth="0.8" opacity={0.25} />

        {/* Viewport background */}
        <circle cx={50} cy={50} r={38} fill={`url(#${gradId})`} />

        {/* Content clipped to viewport */}
        <g clipPath={`url(#${clipId})`}>
          {/* Cell specimens */}
          {cells.map(({ cx: cellX, cy: cellY, r: cellR, isMitotic, i: ci }) => {
            if (isMitotic) {
              // Mitosis: cell pinching into two
              const offset = 2.5;
              const splitEl = (
                <g>
                  <ellipse cx={cellX - offset} cy={cellY} rx={cellR * 0.7} ry={cellR}
                    fill={color} opacity={0.2} stroke={color} strokeWidth="0.4" />
                  <ellipse cx={cellX + offset} cy={cellY} rx={cellR * 0.7} ry={cellR}
                    fill={color} opacity={0.2} stroke={color} strokeWidth="0.4" />
                  {/* Nucleus dots */}
                  <circle cx={cellX - offset} cy={cellY} r={1} fill={color} opacity={0.5} />
                  <circle cx={cellX + offset} cy={cellY} r={1} fill={color} opacity={0.5} />
                  {/* Pinch bridge */}
                  <line x1={cellX - offset + cellR * 0.5} y1={cellY}
                    x2={cellX + offset - cellR * 0.5} y2={cellY}
                    stroke={color} strokeWidth="0.3" opacity={0.3} />
                </g>
              );
              return prefersReducedMotion ? (
                <g key={`cell-${ci}`}>{splitEl}</g>
              ) : (
                <motion.g key={`cell-${ci}`}
                  animate={{ scaleX: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: ci * 0.5 }}
                  style={{ transformOrigin: `${cellX}px ${cellY}px` }}
                >
                  {splitEl}
                </motion.g>
              );
            }

            // Normal cell
            const cellEl = (
              <g>
                {/* Cell membrane */}
                <circle cx={cellX} cy={cellY} r={cellR}
                  fill={color} opacity={0.12 + act * 0.08}
                  stroke={color} strokeWidth="0.4" />
                {/* Nucleus */}
                <circle cx={cellX + 0.5} cy={cellY - 0.5} r={cellR * 0.35}
                  fill={color} opacity={0.4 + act * 0.3} />
              </g>
            );

            return prefersReducedMotion ? (
              <g key={`cell-${ci}`}>{cellEl}</g>
            ) : (
              <motion.g key={`cell-${ci}`}
                animate={{
                  x: [0, (ci % 2 === 0 ? 1 : -1) * (1 + act * 1.5), 0],
                  y: [0, (ci % 3 === 0 ? 0.8 : -0.8) * (1 + act), 0],
                }}
                transition={{ duration: 3 + ci * 0.4, repeat: Infinity, ease: 'easeInOut', delay: ci * 0.3 }}
              >
                {cellEl}
              </motion.g>
            );
          })}
        </g>

        {/* Crosshairs */}
        <line x1={50} y1={12} x2={50} y2={30} stroke={color} strokeWidth="0.4" opacity={0.2} />
        <line x1={50} y1={70} x2={50} y2={88} stroke={color} strokeWidth="0.4" opacity={0.2} />
        <line x1={12} y1={50} x2={30} y2={50} stroke={color} strokeWidth="0.4" opacity={0.2} />
        <line x1={70} y1={50} x2={88} y2={50} stroke={color} strokeWidth="0.4" opacity={0.2} />
        {/* Center cross */}
        <line x1={48} y1={50} x2={52} y2={50} stroke={color} strokeWidth="0.3" opacity={0.35} />
        <line x1={50} y1={48} x2={50} y2={52} stroke={color} strokeWidth="0.3" opacity={0.35} />

        {/* Magnification label */}
        <text x={16} y={90} fill={color} fontSize="5" fontFamily={MONO} opacity={0.4}>
          {magnification}
        </text>

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={88} cy={90} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{magnification}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Active' : 'Quiescent'} | {statusLabel}
      </div>
    </div>
  );
};

export default MicroscopeView;
