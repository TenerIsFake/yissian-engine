import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * TectonicPlate — GLOBE-mode CPU/RAM diagram.
 * Map view showing tectonic plate boundaries. Plates shift/glow progressively
 * with load — inner plates first. Magma visible at plate boundaries (orange/red
 * lines between plates). 4 geological activity zones matching load quartiles.
 * Earthquake epicenter dots at high load.
 *
 * Props match diagram interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 *
 * - metal: 'Fe'|'Cu' → CPU hue (200→0); 'Co'|'Ni' → RAM hue (160→30)
 */
const TectonicPlate = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
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
    ? 200 - (level / 100) * 200   // CPU: 200 (blue) → 0 (red)
    : 160 - (level / 100) * 130;  // RAM: 160 (teal) → 30 (amber)
  const color      = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.35)` : 'rgba(107,114,128,0.35)';
  const magmaColor = online ? `hsl(${Math.min(hue, 30)}, 95%, 55%)` : '#4b5563';

  const act = level / 100;
  const quartile = level <= 25 ? 0 : level <= 50 ? 1 : level <= 75 ? 2 : 3;

  // 4 tectonic plate boundary paths (inner to outer)
  const PLATES = [
    { path: 'M 30,35 L 50,30 L 70,38 L 65,55 L 40,52 Z', zone: 'CORE' },
    { path: 'M 15,25 L 35,18 L 55,15 L 75,22 L 82,45 L 78,65 L 55,72 L 30,68 L 12,50 Z', zone: 'MANTLE' },
    { path: 'M 5,12 L 25,5 L 55,3 L 85,8 L 95,35 L 92,70 L 75,88 L 40,92 L 10,82 L 2,50 Z', zone: 'OUTER' },
    { path: 'M 0,0 L 100,0 L 100,100 L 0,100 Z', zone: 'CRUST' },
  ];

  // Boundary fault lines between plates (magma channels)
  const FAULTS = [
    'M 30,35 Q 38,25 50,30 Q 60,25 70,38',
    'M 40,52 Q 50,58 65,55',
    'M 15,25 Q 25,20 35,18 Q 45,12 55,15',
    'M 78,65 Q 68,70 55,72 Q 40,75 30,68',
    'M 12,50 Q 10,40 15,25',
    'M 82,45 Q 80,55 78,65',
  ];

  // Epicenter dots (only shown at high load)
  const EPICENTERS = [
    { cx: 50, cy: 33, threshold: 70 },
    { cx: 38, cy: 48, threshold: 75 },
    { cx: 62, cy: 50, threshold: 80 },
    { cx: 45, cy: 25, threshold: 85 },
    { cx: 72, cy: 42, threshold: 90 },
    { cx: 28, cy: 60, threshold: 95 },
  ];

  const zoneLabel = isCpu
    ? ['DORMANT', 'ACTIVE', 'VOLATILE', 'ERUPTING'][quartile]
    : ['STABLE', 'SHIFTING', 'FRACTURING', 'CRITICAL'][quartile];

  const richterScale = (2 + act * 7).toFixed(1);

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
            TECTONIC ◆ {isCpu ? 'SEISMIC_LOAD' : 'PRESSURE'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {zoneLabel} · Richter {richterScale}
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
          <radialGradient id={`${gradId}-heat`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={magmaColor} stopOpacity={act * 0.3} />
            <stop offset="100%" stopColor={magmaColor} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Background heat glow */}
        <rect x="0" y="0" width="100" height="100" fill={`url(#${gradId}-heat)`} />

        {/* Plate fills — outer to inner so inner draws on top */}
        {[...PLATES].reverse().map((plate, ri) => {
          const i = PLATES.length - 1 - ri;
          const isActive = i <= quartile;
          const fillOp = isActive ? 0.04 + (quartile - i) * 0.03 + act * 0.05 : 0.01;
          return (
            <path key={`plate-${i}`} d={plate.path}
              fill={color} opacity={fillOp}
              stroke={color} strokeWidth={isActive ? 0.4 : 0.2}
              strokeOpacity={isActive ? 0.2 : 0.05} />
          );
        })}

        {/* Fault lines (magma boundaries) */}
        {FAULTS.map((fault, i) => {
          const faultAct = i < quartile * 2;
          const faultEl = (
            <path d={fault}
              fill="none"
              stroke={faultAct ? magmaColor : colorFaded}
              strokeWidth={faultAct ? 1.2 + act * 0.8 : 0.5}
              opacity={faultAct ? 0.4 + act * 0.4 : 0.08}
              strokeLinecap="round"
              style={faultAct ? { filter: `drop-shadow(0 0 ${2 + act * 3}px ${magmaColor})` } : {}}
            />
          );
          return (!prefersReducedMotion && faultAct && online) ? (
            <motion.g key={`fault-${i}`}
              animate={{ opacity: [0.4 + act * 0.3, 0.7 + act * 0.3, 0.4 + act * 0.3] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            >
              {faultEl}
            </motion.g>
          ) : (
            <g key={`fault-${i}`}>{faultEl}</g>
          );
        })}

        {/* Epicenter dots */}
        {online && EPICENTERS.map((ep, i) => {
          if (level < ep.threshold) return null;
          const intensity = (level - ep.threshold) / (100 - ep.threshold);
          const epEl = (
            <>
              <circle cx={ep.cx} cy={ep.cy} r={2 + intensity * 2}
                fill="none" stroke={magmaColor}
                strokeWidth="0.6" opacity={0.3 + intensity * 0.4} />
              <circle cx={ep.cx} cy={ep.cy} r={1}
                fill={magmaColor} opacity={0.6 + intensity * 0.4}
                style={{ filter: `drop-shadow(0 0 3px ${magmaColor})` }} />
            </>
          );
          return (!prefersReducedMotion) ? (
            <motion.g key={`ep-${i}`}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              style={{ transformOrigin: `${ep.cx}px ${ep.cy}px` }}
            >
              {epEl}
            </motion.g>
          ) : (
            <g key={`ep-${i}`}>{epEl}</g>
          );
        })}

        {/* Zone labels */}
        {PLATES.slice(0, 3).map((plate, i) => {
          const positions = [[50, 44], [50, 18], [50, 8]];
          return (
            <text key={`zl-${i}`} x={positions[i][0]} y={positions[i][1]}
              textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO}
              opacity={i <= quartile ? 0.35 : 0.08} letterSpacing="0.05em">
              {plate.zone}
            </text>
          );
        })}

        {/* Percentage readout */}
        <text x={50} y={62} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={88} cy={93} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{zoneLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {isCpu ? 'Seismic Load' : 'Mantle Pressure'} | Richter {richterScale}
      </div>
    </div>
  );
};

export default TectonicPlate;
