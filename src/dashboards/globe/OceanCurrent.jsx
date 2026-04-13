import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * OceanCurrent — GLOBE-mode bandwidth diagram.
 * Stylized ocean current flow map. Flowing arrow/stream lines across a simplified map.
 * Flow speed proportional to bandwidth. Download: warm currents (red arrows).
 * Upload: cold currents (blue arrows). Gyre patterns that spin with activity.
 *
 * Props match diagram interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 *
 * - variant via jablonskiLabel or metal context determines download vs upload
 */
const OceanCurrent = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const maskId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isDownload = variant === 'emission';
  const act = level / 100;

  // Download = warm (red/orange), Upload = cold (blue/cyan)
  const warmHue = 10;   // red-orange
  const coldHue = 200;  // blue-cyan
  const hue = isDownload ? warmHue : coldHue;
  const color = online ? `hsl(${hue}, 85%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 85%, 60%, 0.25)` : 'rgba(107,114,128,0.25)';

  // Flow speed: animation duration inversely proportional to level
  const flowDuration = Math.max(1, 6 - act * 4.5); // 6s at 0% → 1.5s at 100%
  const streamCount = Math.floor(2 + act * 4); // 2-6 streams

  // Stream current paths (flowing curves across the map)
  const STREAMS = [
    { d: 'M 5,30 Q 25,20 50,28 Q 75,36 95,25', arrowX: 90, arrowY: 26, arrowAngle: -15 },
    { d: 'M 5,50 Q 30,42 55,48 Q 80,54 95,45', arrowX: 90, arrowY: 46, arrowAngle: -12 },
    { d: 'M 5,70 Q 20,62 45,68 Q 70,74 95,65', arrowX: 90, arrowY: 66, arrowAngle: -10 },
    { d: 'M 95,20 Q 75,15 50,18 Q 25,22 5,15', arrowX: 10, arrowY: 16, arrowAngle: 165 },
    { d: 'M 95,55 Q 70,60 45,55 Q 20,50 5,58', arrowX: 10, arrowY: 57, arrowAngle: 170 },
    { d: 'M 95,80 Q 70,85 45,78 Q 20,72 5,80', arrowX: 10, arrowY: 79, arrowAngle: 175 },
  ];

  // Gyre (circular eddy) positions
  const GYRES = [
    { cx: 30, cy: 40, r: 8 },
    { cx: 70, cy: 55, r: 6 },
    { cx: 50, cy: 75, r: 5 },
  ];

  const gyreSpeed = Math.max(3, 12 - act * 9); // faster with more activity

  const dirLabel = isDownload ? '▼ DOWNLOAD' : '▲ UPLOAD';
  const flowLabel = isDownload ? 'WARM CURRENT' : 'COLD CURRENT';

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-2"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
            {jablonskiLabel || `CURRENT ◆ ${flowLabel}`}
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

        {/* Ocean background */}
        <rect x="0" y="0" width="100" height="100" rx="3"
          fill={isDownload ? 'rgba(20,5,5,0.3)' : 'rgba(5,10,25,0.3)'} />

        {/* Simplified landmass outlines */}
        <path d="M 15,8 Q 20,5 25,8 L 24,18 Q 20,20 16,16 Z"
          fill={color} opacity={0.04} stroke={color} strokeWidth="0.3" strokeOpacity={0.1} />
        <path d="M 55,5 Q 65,3 70,8 L 68,20 Q 60,22 55,15 Z"
          fill={color} opacity={0.04} stroke={color} strokeWidth="0.3" strokeOpacity={0.1} />

        {/* Stream current lines */}
        {STREAMS.slice(0, streamCount).map((stream, i) => {
          const streamOp = 0.15 + act * 0.5 - i * 0.04;
          const sw = 1 + act * 1.5 - i * 0.1;
          const streamEl = (
            <path d={stream.d}
              fill="none" stroke={color}
              strokeWidth={Math.max(0.5, sw)}
              opacity={Math.max(0.05, streamOp)}
              strokeLinecap="round"
              strokeDasharray={`${6 + act * 4} ${3 + (1 - act) * 4}`}
              style={streamOp > 0.3 ? { filter: `drop-shadow(0 0 2px ${color})` } : {}}
            />
          );

          // Arrow heads at stream ends
          const arrowEl = online && (
            <polygon
              points={`${stream.arrowX},${stream.arrowY - 2} ${stream.arrowX + 3},${stream.arrowY} ${stream.arrowX},${stream.arrowY + 2}`}
              fill={color} opacity={streamOp * 0.8}
              transform={`rotate(${stream.arrowAngle}, ${stream.arrowX}, ${stream.arrowY})`}
            />
          );

          return (!prefersReducedMotion && online) ? (
            <motion.g key={`stream-${i}`}
              animate={{ strokeDashoffset: [0, -(12 + act * 8)] }}
              transition={{ duration: flowDuration + i * 0.3, repeat: Infinity, ease: 'linear' }}
            >
              {streamEl}
              {arrowEl}
            </motion.g>
          ) : (
            <g key={`stream-${i}`}>{streamEl}{arrowEl}</g>
          );
        })}

        {/* Gyre eddies */}
        {online && GYRES.map((gyre, i) => {
          if (act < 0.2 + i * 0.15) return null;
          const gyreOp = 0.1 + act * 0.25;
          const gyreEl = (
            <circle cx={gyre.cx} cy={gyre.cy} r={gyre.r}
              fill="none" stroke={color}
              strokeWidth="0.6"
              opacity={gyreOp}
              strokeDasharray="2 3"
            />
          );
          return (!prefersReducedMotion) ? (
            <motion.g key={`gyre-${i}`}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: gyreSpeed + i * 2, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: `${gyre.cx}px ${gyre.cy}px` }}
            >
              {gyreEl}
              {/* Inner spiral */}
              <circle cx={gyre.cx} cy={gyre.cy} r={gyre.r * 0.5}
                fill="none" stroke={color} strokeWidth="0.4"
                opacity={gyreOp * 0.7} strokeDasharray="1.5 2" />
            </motion.g>
          ) : (
            <g key={`gyre-${i}`}>{gyreEl}</g>
          );
        })}

        {/* Direction label */}
        <text x={50} y={10} textAnchor="middle" fill={color} fontSize="4.5" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
          {dirLabel}
        </text>

        {/* Percentage readout */}
        <text x={50} y={97} textAnchor="middle" fill={color} fontSize="5.5" fontFamily={MONO} opacity={0.75}>
          {level.toFixed(0)}%
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

export default OceanCurrent;
