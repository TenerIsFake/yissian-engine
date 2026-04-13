import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BarometerDial — WEATHER-mode RAM diagram (replaces CoordComplex).
 * Circular aneroid barometer gauge with sweeping needle (0→270°).
 * Sector zones: LOW / MODERATE / HIGH / SEVERE.
 * Critical: needle vibrates.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const BarometerDial = ({ label, level, online, details = [], metal = 'Co', lowSpin = false, size = 88 }) => {
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
    ? 200 - (level / 100) * 200
    : 160 - (level / 100) * 130;
  const color = online ? `hsl(${hue}, 80%, 55%)` : '#6b7280';

  const act = level / 100;
  const cx = 50, cy = 52;
  const outerR = 36;
  const innerR = 30;

  // Needle angle: -135° (0%) → +135° (100%) — 270° sweep
  const startAngle = -135;
  const sweepAngle = 270;
  const needleAngle = startAngle + act * sweepAngle;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = 26;
  const nx = cx + Math.cos(needleRad) * needleLen;
  const ny = cy + Math.sin(needleRad) * needleLen;

  const isCritical = level > 80;
  const severityLabel = level < 25 ? 'LOW' : level < 50 ? 'MODERATE' : level < 75 ? 'HIGH' : 'SEVERE';

  // Sector arcs (4 zones on the dial)
  const sectors = [
    { startPct: 0,    endPct: 0.25, label: 'LOW',  opacity: 0.08 },
    { startPct: 0.25, endPct: 0.50, label: 'MOD',  opacity: 0.12 },
    { startPct: 0.50, endPct: 0.75, label: 'HIGH', opacity: 0.18 },
    { startPct: 0.75, endPct: 1.00, label: 'SEV',  opacity: 0.25 },
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

  // Tick marks at 0, 25, 50, 75, 100
  const ticks = [0, 25, 50, 75, 100].map(pct => {
    const a = ((startAngle + (pct / 100) * sweepAngle) * Math.PI) / 180;
    return {
      pct,
      x1: cx + Math.cos(a) * (outerR - 2),
      y1: cy + Math.sin(a) * (outerR - 2),
      x2: cx + Math.cos(a) * (outerR + 3),
      y2: cy + Math.sin(a) * (outerR + 3),
      lx: cx + Math.cos(a) * (outerR + 7),
      ly: cy + Math.sin(a) * (outerR + 7),
    };
  });

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
            BAROMETER ◆ {isCpu ? 'PRESSURE' : 'HUMIDITY'}
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Outer brass-style ring */}
        <circle cx={cx} cy={cy} r={outerR + 1} fill="none" stroke={color} strokeWidth="1.5" opacity={0.2} />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={color} strokeWidth="0.5" opacity={0.35} />

        {/* Sector arcs */}
        {sectors.map((s, i) => (
          <path key={`sector-${i}`} d={arcPath(innerR + 3, s.startPct, s.endPct)}
            fill="none" stroke={color} strokeWidth="5" opacity={i < Math.ceil(layerForLevel(level)) ? s.opacity + 0.1 : s.opacity}
            strokeLinecap="butt" />
        ))}

        {/* Filled arc up to current level */}
        {act > 0.01 && (
          <path d={arcPath(innerR + 3, 0, act)}
            fill="none" stroke={color} strokeWidth="5" opacity={0.3 + act * 0.3}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
        )}

        {/* Tick marks */}
        {ticks.map(t => (
          <g key={`tick-${t.pct}`}>
            <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={color} strokeWidth="0.8" opacity={0.4} />
            <text x={t.lx} y={t.ly + 1.5} textAnchor="middle"
              fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.3}>
              {t.pct}
            </text>
          </g>
        ))}

        {/* Needle */}
        {(() => {
          const needleLine = (
            <line x1={cx} y1={cy} x2={nx} y2={ny}
              stroke={color} strokeWidth="1.5" strokeLinecap="round"
              opacity={0.85}
              style={{ filter: online ? `drop-shadow(0 0 2px ${color})` : 'none' }} />
          );
          return isCritical && !prefersReducedMotion ? (
            <motion.g
              animate={{ rotate: [needleAngle - 2, needleAngle + 2, needleAngle - 2] }}
              transition={{ duration: 0.15, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              <line x1={cx} y1={cy} x2={cx + needleLen} y2={cy}
                stroke={color} strokeWidth="1.5" strokeLinecap="round"
                opacity={0.85}
                style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
            </motion.g>
          ) : needleLine;
        })()}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r={3}
          fill={online ? color : '#374151'}
          opacity={online ? 0.85 : 0.4}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />

        {/* Percentage readout */}
        <text x={cx} y={cy + 16} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>

        {/* Zone label */}
        <text x={cx} y={cy + 23} textAnchor="middle" fill={color} fontSize="4" fontFamily={MONO} opacity={0.4}>
          {severityLabel}
        </text>
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

function layerForLevel(level) {
  if (level <= 25) return 1;
  if (level <= 50) return 2;
  if (level <= 75) return 3;
  return 4;
}

export default BarometerDial;
