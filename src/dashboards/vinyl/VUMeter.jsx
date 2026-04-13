import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * VUMeter — VINYL-mode CPU/RAM diagram.
 * Classic analog VU meter with semicircular dial, sweeping needle,
 * -20 to +3 dB markings, and red zone in the upper range.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const VUMeter = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);

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
  const color = online ? `hsl(${hue}, 80%, 55%)` : '#6b7280';

  const act = level / 100;
  const cx = 50, cy = 62;
  const meterR = 36;

  // Needle sweeps from -135° (0%) to -45° (100%) — 90° arc across the top
  const startAngle = -150;
  const sweepAngle = 120;
  const needleAngle = startAngle + act * sweepAngle;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = meterR - 4;
  const nx = cx + Math.cos(needleRad) * needleLen;
  const ny = cy + Math.sin(needleRad) * needleLen;

  const isCritical = level > 80;

  // dB scale markings: -20, -10, -7, -5, -3, 0, +3
  const dbMarks = [
    { db: '-20', pct: 0 },
    { db: '-10', pct: 0.2 },
    { db: '-7',  pct: 0.35 },
    { db: '-5',  pct: 0.5 },
    { db: '-3',  pct: 0.65 },
    { db: '0',   pct: 0.8 },
    { db: '+3',  pct: 1.0 },
  ];

  const arcPath = (r, startPct, endPct) => {
    const a1 = ((startAngle + startPct * sweepAngle) * Math.PI) / 180;
    const a2 = ((startAngle + endPct * sweepAngle) * Math.PI) / 180;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const x2 = cx + Math.cos(a2) * r;
    const y2 = cy + Math.sin(a2) * r;
    const largeArc = (endPct - startPct) * sweepAngle > 180 ? 1 : 0;
    return `M ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2}`;
  };

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
            VU METER ◆ {isCpu ? 'SIGNAL' : 'GAIN'}
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

      <svg viewBox="0 0 100 80" style={{ width: size, height: size * 0.8 }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Backplate */}
        <rect x={6} y={8} width={88} height={62} rx={6} ry={6}
          fill="rgba(20,18,15,0.8)"
          stroke={color} strokeWidth="0.8" opacity={0.25} />

        {/* Inner bezel */}
        <rect x={10} y={12} width={80} height={50} rx={4} ry={4}
          fill="none"
          stroke={color} strokeWidth="0.5" opacity={0.15} />

        {/* Normal range arc (green zone: 0-80%) */}
        <path d={arcPath(meterR - 2, 0, 0.8)}
          fill="none" stroke={color} strokeWidth="1.2" opacity={0.2} />

        {/* Red zone arc (80-100%) */}
        <path d={arcPath(meterR - 2, 0.8, 1.0)}
          fill="none" stroke="hsl(0, 80%, 55%)" strokeWidth="2" opacity={0.35} />

        {/* Filled arc up to current level */}
        {act > 0.01 && (
          <path d={arcPath(meterR - 2, 0, Math.min(act, 1))}
            fill="none" stroke={color} strokeWidth="1.5" opacity={0.4 + act * 0.3}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
        )}

        {/* dB scale tick marks and labels */}
        {dbMarks.map(({ db, pct }) => {
          const a = ((startAngle + pct * sweepAngle) * Math.PI) / 180;
          const innerTick = meterR - 6;
          const outerTick = meterR - 1;
          const labelR_ = meterR + 3;
          return (
            <g key={db}>
              <line
                x1={cx + Math.cos(a) * innerTick}
                y1={cy + Math.sin(a) * innerTick}
                x2={cx + Math.cos(a) * outerTick}
                y2={cy + Math.sin(a) * outerTick}
                stroke={pct >= 0.8 ? 'hsl(0, 70%, 55%)' : color}
                strokeWidth="0.6" opacity={0.4}
              />
              <text
                x={cx + Math.cos(a) * labelR_}
                y={cy + Math.sin(a) * labelR_ + 1.5}
                textAnchor="middle"
                fill={pct >= 0.8 ? 'hsl(0, 70%, 55%)' : color}
                fontSize="3" fontFamily={MONO} opacity={0.35}
              >
                {db}
              </text>
            </g>
          );
        })}

        {/* Needle */}
        {(() => {
          const needleLine = (
            <line x1={cx} y1={cy} x2={nx} y2={ny}
              stroke={color} strokeWidth="1.2" strokeLinecap="round"
              opacity={0.85}
              style={{ filter: online ? `drop-shadow(0 0 2px ${color})` : 'none' }} />
          );
          return isCritical && !prefersReducedMotion ? (
            <motion.g
              animate={{ rotate: [needleAngle - 1.5, needleAngle + 1.5, needleAngle - 1.5] }}
              transition={{ duration: 0.12, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              <line x1={cx} y1={cy} x2={cx + needleLen} y2={cy}
                stroke={isCritical ? 'hsl(0, 80%, 55%)' : color} strokeWidth="1.2" strokeLinecap="round"
                opacity={0.85}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
            </motion.g>
          ) : needleLine;
        })()}

        {/* Needle pivot hub */}
        <circle cx={cx} cy={cy} r={2.5}
          fill={online ? color : '#374151'}
          opacity={online ? 0.8 : 0.4}
          style={{ filter: online ? `drop-shadow(0 0 2px ${color})` : 'none' }} />

        {/* "VU" label */}
        <text x={cx} y={cy + 10} textAnchor="middle" fill={color} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.5}>
          VU
        </text>

        {/* Percentage readout */}
        <text x={cx} y={72} textAnchor="middle" fill={color} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default VUMeter;
