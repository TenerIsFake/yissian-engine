import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * TurntableRPM — VINYL-mode Storage diagram (Server Storage + Media Storage).
 * Top-down view of a turntable platter with fill level, strobe dots,
 * RPM zone indicators, and center spindle.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const TurntableRPM = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
  const isCritical = level > 85;

  const cx = 50, cy = 50;
  const platterR = 38;
  const matR = 34;
  const labelR = 14;
  const spindleR = 2.5;

  // Strobe dots around the platter edge (speed verification marks)
  const strobeDotCount = 24;
  const strobeDots = Array.from({ length: strobeDotCount }).map((_, i) => {
    const a = (i / strobeDotCount) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + Math.cos(a) * (platterR - 1),
      y: cy + Math.sin(a) * (platterR - 1),
    };
  });

  // RPM zone indicators (concentric rings at 33, 45, 78 positions)
  const rpmZones = [
    { label: '33', r: matR - 2, opacity: 0.15 },
    { label: '45', r: matR - 8, opacity: 0.12 },
    { label: '78', r: labelR + 4, opacity: 0.1 },
  ];

  // Fill arc representing storage usage
  const fillAngle = act * 360;

  const describeArc = (r, startDeg, endDeg) => {
    const toRad = (d) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + Math.cos(toRad(startDeg)) * r;
    const y1 = cy + Math.sin(toRad(startDeg)) * r;
    const x2 = cx + Math.cos(toRad(endDeg)) * r;
    const y2 = cy + Math.sin(toRad(endDeg)) * r;
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2}`;
  };

  // Spin speed scales with level (more full = slower conceptually, but we keep a constant speed)
  const spinDuration = 6;

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
            PLATTER ◆ {isCpu ? 'SERVER' : 'MEDIA'}
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
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={0.08} />
            <stop offset="70%" stopColor={color} stopOpacity={0.03} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </radialGradient>
        </defs>

        {/* Platter base ring */}
        <circle cx={cx} cy={cy} r={platterR} fill="none"
          stroke={color} strokeWidth="1.2" opacity={0.2} />

        {/* Platter mat (textured background) */}
        <circle cx={cx} cy={cy} r={matR} fill={`url(#${gradId})`}
          stroke={color} strokeWidth="0.4" opacity={0.15} />

        {/* Spinning group — platter content rotates */}
        {online && !prefersReducedMotion ? (
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: spinDuration, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            <PlatterContent
              cx={cx} cy={cy} matR={matR} labelR={labelR} color={color}
              rpmZones={rpmZones} strobeDots={strobeDots} act={act}
              fillAngle={fillAngle} describeArc={describeArc} online={online}
              isCritical={isCritical}
            />
          </motion.g>
        ) : (
          <PlatterContent
            cx={cx} cy={cy} matR={matR} labelR={labelR} color={color}
            rpmZones={rpmZones} strobeDots={strobeDots} act={act}
            fillAngle={fillAngle} describeArc={describeArc} online={online}
            isCritical={isCritical}
          />
        )}

        {/* Center label area (doesn't spin) */}
        <circle cx={cx} cy={cy} r={labelR}
          fill="rgba(20,20,25,0.9)"
          stroke={color} strokeWidth="0.8" opacity={0.3} />

        {/* Spindle */}
        <circle cx={cx} cy={cy} r={spindleR}
          fill={online ? color : '#374151'}
          opacity={online ? 0.7 : 0.3}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />

        {/* Percentage on label */}
        <text x={cx} y={cy + 8} textAnchor="middle" fill={color} fontSize="5.5" fontFamily={MONO} fontWeight="bold" opacity={0.8}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

/** Extracted platter content so it can be optionally wrapped in motion.g */
const PlatterContent = ({ cx, cy, matR, labelR, color, rpmZones, strobeDots, act, fillAngle, describeArc, online, isCritical }) => (
  <g>
    {/* RPM zone rings */}
    {rpmZones.map(({ label: lbl, r, opacity }) => (
      <g key={lbl}>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="0.3" opacity={opacity} />
        <text x={cx + r - 4} y={cy - 1.5} fill={color} fontSize="2.5" fontFamily="monospace" opacity={opacity + 0.1}>
          {lbl}
        </text>
      </g>
    ))}

    {/* Strobe dots */}
    {strobeDots.map((dot, i) => (
      <circle key={i} cx={dot.x} cy={dot.y} r={0.8}
        fill={color} opacity={online ? 0.25 : 0.08} />
    ))}

    {/* Storage fill arc (colored arc showing usage) */}
    {fillAngle > 1 && (
      <path
        d={describeArc(matR - 5, 0, Math.min(fillAngle, 359.9))}
        fill="none"
        stroke={color}
        strokeWidth="4"
        opacity={0.2 + act * 0.35}
        strokeLinecap="round"
        style={{ filter: online ? `drop-shadow(0 0 2px ${color})` : 'none' }}
      />
    )}

    {/* Mat texture — subtle concentric grooves */}
    {[0.3, 0.5, 0.7, 0.85].map((f, i) => (
      <circle key={`groove-${i}`} cx={cx} cy={cy} r={labelR + f * (matR - labelR)}
        fill="none" stroke={color} strokeWidth="0.2" opacity={0.06} />
    ))}
  </g>
);

export default TurntableRPM;
