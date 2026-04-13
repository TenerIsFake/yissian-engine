import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const PERIODS = [
  { name: 'Triassic',     pattern: 'dots',   baseHue: 30 },
  { name: 'Jurassic',     pattern: 'dashes', baseHue: 90 },
  { name: 'Cretaceous',   pattern: 'cross',  baseHue: 180 },
  { name: 'Anthropocene', pattern: 'solid',  baseHue: 280 },
];

// Small fossil fragment shapes per period
const FOSSIL_FRAGMENTS = [
  'M 2 0 C 3 -1 4 0 3 1 C 2 2 1 1 2 0 Z',           // trilobite
  'M 0 0 L 3 -1 L 4 1 L 1 2 Z',                       // bone chip
  'M 0 0 C 1 -2 3 -1 2 1 C 1 2 -1 1 0 0 Z',          // shell
  'M 0 0 L 2 -1 L 3 1 L 2 2 L 0 1 Z',                 // crystal
];

/**
 * GeologicalCoreSample — DINO-mode CPU/RAM diagram.
 * Vertical core sample cylinder with 4 geological layers that light up with load.
 */
const GeologicalCoreSample = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const patternId = useId();

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

  const act = level / 100;
  // How many layers are active (bottom-up)
  const activeCount = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;

  const periodLabel = isCpu ? 'FUSION_STRATUM' : 'PRESSURE_LAYER';
  const statusText = lowSpin ? 'Active' : 'Dormant';

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
            CORE_SAMPLE ◆ {periodLabel}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {statusText} · {PERIODS[activeCount - 1].name}
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

      <svg viewBox="0 0 60 100" style={{ width: size * 0.65, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          {/* Dot pattern */}
          <pattern id={`${patternId}-dots`} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.8" fill={color} opacity="0.3" />
          </pattern>
          {/* Dash pattern */}
          <pattern id={`${patternId}-dashes`} width="8" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2" x2="5" y2="2" stroke={color} strokeWidth="0.6" opacity="0.3" />
          </pattern>
          {/* Cross-hatch pattern */}
          <pattern id={`${patternId}-cross`} width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="6" y2="6" stroke={color} strokeWidth="0.4" opacity="0.25" />
            <line x1="6" y1="0" x2="0" y2="6" stroke={color} strokeWidth="0.4" opacity="0.25" />
          </pattern>
        </defs>

        {/* Cylinder body outline */}
        <rect x={10} y={8} width={40} height={80} rx={3} ry={3}
          fill="none" stroke={color} strokeWidth={0.6} opacity={0.25} />

        {/* Core top ellipse */}
        <ellipse cx={30} cy={8} rx={20} ry={4}
          fill="rgba(40,38,35,0.6)" stroke={color} strokeWidth={0.5} opacity={0.3} />

        {/* 4 geological layers — bottom (Triassic) to top (Anthropocene) */}
        {PERIODS.map((period, i) => {
          const layerH = 20;
          const y = 68 - i * layerH; // bottom-up
          const isActive = i < activeCount;
          const layerHue = isCpu
            ? period.baseHue + hue * 0.3
            : period.baseHue + hue * 0.2;
          const fillColor = online
            ? `hsla(${layerHue}, 50%, 40%, ${isActive ? 0.15 + act * 0.2 : 0.03})`
            : `rgba(80,78,72,${isActive ? 0.1 : 0.03})`;

          const patternUrl = period.pattern === 'solid' ? undefined : `url(#${patternId}-${period.pattern})`;

          const tempGrad = isActive && online
            ? `hsla(${30 + (3 - i) * 50}, 60%, 50%, ${0.05 + act * 0.1})`
            : 'transparent';

          return (
            <g key={period.name}>
              {/* Layer fill */}
              <rect x={10} y={y} width={40} height={layerH}
                fill={fillColor} />
              {/* Layer pattern overlay */}
              {patternUrl && (
                <rect x={10} y={y} width={40} height={layerH}
                  fill={patternUrl} opacity={isActive ? 0.6 : 0.15} />
              )}
              {/* Temperature gradient overlay */}
              <rect x={10} y={y} width={40} height={layerH}
                fill={tempGrad} />

              {/* Fossil fragment in active layers */}
              {isActive && online && (
                <path
                  d={FOSSIL_FRAGMENTS[i]}
                  transform={`translate(${22 + i * 5}, ${y + 10})`}
                  fill={color} opacity={0.35}
                />
              )}

              {/* Layer boundary line */}
              <line x1={10} y1={y} x2={50} y2={y}
                stroke={color} strokeWidth={0.4}
                opacity={isActive ? 0.3 : 0.08}
                strokeDasharray={isActive ? 'none' : '2 2'} />

              {/* Period label */}
              {isActive && (
                <text x={52} y={y + 12} fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.45}>
                  {period.name.slice(0, 4).toUpperCase()}
                </text>
              )}

              {/* Pulse animation for active layers */}
              {isActive && online && !prefersReducedMotion && (
                <motion.rect
                  x={10} y={y} width={40} height={layerH}
                  fill={color} opacity={0}
                  animate={{ opacity: [0, 0.04, 0] }}
                  transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                />
              )}
            </g>
          );
        })}

        {/* Bottom ellipse */}
        <ellipse cx={30} cy={88} rx={20} ry={4}
          fill="rgba(40,38,35,0.4)" stroke={color} strokeWidth={0.5} opacity={0.2} />

        {/* Percentage readout */}
        <text x={30} y={95} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {PERIODS[activeCount - 1].name}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {statusText} | {isCpu ? 'Fusion Rate' : 'Envelope'}
      </div>
    </div>
  );
};

export default GeologicalCoreSample;
