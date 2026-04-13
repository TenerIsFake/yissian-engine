import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * RevolverCylinder — NOIR-mode CPU/RAM diagram.
 * Top-down view of a revolver cylinder with 6 chambers.
 * Chambers glow progressively with load level.
 * At >83% (5+ chambers): danger red glow.
 *
 * Props: label, level, online, details, metal, isJahnTeller, lowSpin, size
 * metal: 'Fe'|'Cu' -> CPU hue (200->0), 'Co'|'Ni' -> RAM hue (160->30)
 */
const RevolverCylinder = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
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
    ? 200 - (level / 100) * 200   // CPU: 200 (blue) -> 0 (red)
    : 160 - (level / 100) * 130;  // RAM: 160 (teal) -> 30 (amber)
  const color      = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.35)` : 'rgba(107,114,128,0.35)';

  const act = level / 100;
  const litChambers = level < 17 ? 1 : level < 33 ? 2 : level < 50 ? 3 : level < 67 ? 4 : level < 83 ? 5 : 6;
  const isDanger = litChambers >= 5;
  const dangerColor = 'hsl(0, 85%, 55%)';

  // 6 chambers evenly spaced around center
  const cx = 50, cy = 50, chamberR = 9, orbitR = 24;
  const chambers = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    return {
      x: cx + Math.cos(angle) * orbitR,
      y: cy + Math.sin(angle) * orbitR,
      lit: i < litChambers,
      index: i,
    };
  });

  const statusLabel = isCpu
    ? (lowSpin ? 'Cocked' : 'Holstered')
    : (lowSpin ? 'Loaded' : 'Empty');

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
            REVOLVER ◆ {isCpu ? 'FIREPOWER' : 'CHAMBER_PRESSURE'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {litChambers}/6 loaded · {statusLabel}
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

      <motion.svg
        viewBox="0 0 100 100"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${label}: ${level.toFixed(1)}% — ${litChambers}/6 chambers loaded — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}
        animate={online && !prefersReducedMotion ? { rotate: [0, 360] } : {}}
        transition={online && !prefersReducedMotion ? { duration: 30, repeat: Infinity, ease: 'linear' } : {}}
      >
        <defs>
          <radialGradient id={`${gradId}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isDanger ? dangerColor : color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={isDanger ? dangerColor : color} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Outer cylinder ring */}
        <circle cx={cx} cy={cy} r={38} fill="none" stroke={color} strokeWidth="1.5" opacity={0.25} />
        <circle cx={cx} cy={cy} r={36} fill="none" stroke={color} strokeWidth="0.5" opacity={0.1} />

        {/* Cylinder body fill */}
        <circle cx={cx} cy={cy} r={37} fill={color} opacity={0.03} />

        {/* Chambers */}
        {chambers.map((ch) => {
          const chamberFill = ch.lit
            ? (isDanger ? dangerColor : color)
            : 'transparent';
          const chamberOpacity = ch.lit ? 0.5 + act * 0.3 : 0;
          const strokeOpacity = ch.lit ? 0.6 : 0.15;

          const chamberEl = (
            <g key={`ch-${ch.index}`}>
              {/* Chamber glow (lit only) */}
              {ch.lit && (
                <circle cx={ch.x} cy={ch.y} r={chamberR + 2}
                  fill={isDanger ? dangerColor : color}
                  opacity={0.12 + act * 0.1}
                  style={{ filter: `blur(2px)` }} />
              )}
              {/* Chamber body */}
              <circle cx={ch.x} cy={ch.y} r={chamberR}
                fill={chamberFill} opacity={chamberOpacity} />
              {/* Chamber outline */}
              <circle cx={ch.x} cy={ch.y} r={chamberR}
                fill="none" stroke={ch.lit ? (isDanger ? dangerColor : color) : color}
                strokeWidth={ch.lit ? 1.2 : 0.6}
                opacity={strokeOpacity} />
              {/* Bullet shape inside lit chamber */}
              {ch.lit && (
                <circle cx={ch.x} cy={ch.y} r={3.5}
                  fill={isDanger ? dangerColor : color}
                  opacity={0.7}
                  style={{ filter: ch.lit ? `drop-shadow(0 0 3px ${isDanger ? dangerColor : color})` : 'none' }} />
              )}
            </g>
          );

          // Danger pulse for last chambers
          if (ch.lit && isDanger && ch.index >= 4 && !prefersReducedMotion) {
            return (
              <motion.g key={`ch-anim-${ch.index}`}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: ch.index * 0.15 }}
              >
                {chamberEl}
              </motion.g>
            );
          }
          return chamberEl;
        })}

        {/* Center spindle */}
        <circle cx={cx} cy={cy} r={5} fill="none" stroke={color} strokeWidth="1" opacity={0.3} />
        <circle cx={cx} cy={cy} r={2.5}
          fill={online ? color : '#374151'}
          opacity={online ? 0.7 : 0.3}
          style={{ filter: online ? `drop-shadow(0 0 4px ${color})` : 'none' }} />

        {/* Fluting grooves between chambers */}
        {Array.from({ length: 6 }, (_, i) => {
          const a1 = ((i * 60 + 30) - 90) * (Math.PI / 180);
          const sx = cx + Math.cos(a1) * 12;
          const sy = cy + Math.sin(a1) * 12;
          const ex = cx + Math.cos(a1) * 34;
          const ey = cy + Math.sin(a1) * 34;
          return (
            <line key={`flute-${i}`} x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={color} strokeWidth="0.3" opacity={0.08} />
          );
        })}

        {/* Percentage readout */}
        <text x={cx} y={96} textAnchor="middle" fill={isDanger ? dangerColor : color}
          fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </motion.svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color: isDanger ? dangerColor : color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {litChambers}/6 LOADED
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {statusLabel}
      </div>
    </div>
  );
};

export default RevolverCylinder;
