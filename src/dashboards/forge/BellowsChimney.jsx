import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BellowsChimney — FORGE-mode bandwidth diagram (replaces JablonskiDiagram).
 * DOWNLOAD (emission / ORE_IN): Bellows pumping air into furnace opening.
 * UPLOAD (excitation / SLAG_OUT): Chimney exhausting smoke/heat upward.
 *
 * Props match JablonskiDiagram interface:
 *   label, level, online, details, variant, size, jablonskiLabel
 */
const BellowsChimney = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current.NOBLE;
  const isDownload = variant === 'emission';
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const color = cat.border;
  const blastCount = Math.floor(level / 20) + 1; // 1-6 air/smoke lines

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
            {jablonskiLabel || (isDownload ? 'ORE ◆ INTAKE' : 'SLAG ◆ OUTPUT')}
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

        {isDownload ? (
          /* ── DOWNLOAD: Bellows pumping into furnace ── */
          <g>
            {/* Furnace opening (right side) */}
            <rect x={68} y={35} width={18} height={30} rx={3}
              fill={color} fillOpacity={0.05}
              stroke={color} strokeWidth="1" opacity={0.3} />
            {/* Fire glow inside furnace */}
            <rect x={70} y={38} width={14} height={24} rx={2}
              fill={color} opacity={0.05 + act * 0.15} />

            {/* Bellows body (left side — accordion shape) */}
            {(() => {
              const compression = 0.3 + act * 0.7; // 0.3 = extended, 1.0 = compressed
              const bx = 12, by = 40;
              const fullW = 40, bh = 20;
              const w = fullW * (1 - compression * 0.5);
              const folds = 5;
              const foldW = w / folds;
              let path = `M ${bx},${by}`;
              for (let f = 0; f < folds; f++) {
                const x1 = bx + f * foldW + foldW * 0.5;
                const x2 = bx + (f + 1) * foldW;
                const yOff = f % 2 === 0 ? -3 * compression : 3 * compression;
                path += ` Q ${x1},${by + yOff} ${x2},${by}`;
              }
              path += ` L ${bx + w},${by + bh}`;
              for (let f = folds - 1; f >= 0; f--) {
                const x2 = bx + f * foldW;
                const x1 = bx + f * foldW + foldW * 0.5;
                const yOff = f % 2 === 0 ? -3 * compression : 3 * compression;
                path += ` Q ${x1},${by + bh + yOff} ${x2},${by + bh}`;
              }
              path += ' Z';
              return (
                <path d={path} fill={color} fillOpacity={0.06}
                  stroke={color} strokeWidth="0.8" opacity={0.3} />
              );
            })()}

            {/* Nozzle */}
            <path d={`M ${52},${45} L ${68},${48} L ${68},${52} L ${52},${55} Z`}
              fill={color} fillOpacity={0.04}
              stroke={color} strokeWidth="0.6" opacity={0.25} />

            {/* Air blast lines */}
            {online && Array.from({ length: Math.min(blastCount, 5) }, (_, i) => {
              const lineY = 44 + i * 3;
              const lineOp = (0.15 + act * 0.5) * (1 - i * 0.1);
              const lineEl = (
                <line x1={54} y1={lineY} x2={66} y2={lineY + (i % 2 === 0 ? 1 : -1)}
                  stroke={color} strokeWidth={0.8 + act * 0.5} opacity={lineOp}
                  strokeDasharray={act > 0.5 ? 'none' : '2 2'}
                  style={{ filter: lineOp > 0.3 ? `drop-shadow(0 0 2px ${color})` : 'none' }} />
              );
              return prefersReducedMotion ? (
                <g key={`blast-${i}`}>{lineEl}</g>
              ) : (
                <motion.g key={`blast-${i}`}
                  animate={{ opacity: [lineOp * 0.5, lineOp, lineOp * 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                >
                  {lineEl}
                </motion.g>
              );
            })}

            {/* Sparks inside furnace at high level */}
            {level > 60 && online && [72, 78, 82].map((sx, i) => (
              prefersReducedMotion ? (
                <circle key={`spark-${i}`} cx={sx} cy={42 + i * 5} r={0.8} fill={color} opacity={0.4} />
              ) : (
                <motion.circle key={`spark-${i}`} cx={sx} r={0.8} fill={color}
                  animate={{ cy: [50, 38], opacity: [0.6, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut', delay: i * 0.3 }}
                />
              )
            ))}

            {/* Direction label */}
            <text x={50} y={10} textAnchor="middle" fill={color} fontSize="4" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
              ▶ ORE IN
            </text>
          </g>
        ) : (
          /* ── UPLOAD: Chimney exhaust ── */
          <g>
            {/* Chimney stack */}
            <rect x={40} y={20} width={20} height={50} rx={2}
              fill={color} fillOpacity={0.03}
              stroke={color} strokeWidth="1" opacity={0.3} />
            {/* Chimney cap */}
            <path d={`M 36,20 L 64,20 L 62,16 L 38,16 Z`}
              fill={color} fillOpacity={0.05}
              stroke={color} strokeWidth="0.6" opacity={0.25} />
            {/* Furnace base */}
            <rect x={32} y={70} width={36} height={14} rx={3}
              fill={color} fillOpacity={0.04}
              stroke={color} strokeWidth="0.8" opacity={0.2} />
            {/* Fire glow at base */}
            <rect x={42} y={72} width={16} height={10} rx={2}
              fill={color} opacity={0.06 + act * 0.12} />

            {/* Smoke plumes rising from chimney */}
            {online && Array.from({ length: Math.min(blastCount, 5) }, (_, i) => {
              const smokeX = 45 + (i % 3) * 5;
              const amplitude = 3 + i * 1.5;
              const smokePath = `M ${smokeX},18 Q ${smokeX - amplitude},${12 - i * 3} ${smokeX},${6 - i * 4} Q ${smokeX + amplitude},${0 - i * 3} ${smokeX},${-6 - i * 4}`;
              const smokeOp = (0.1 + act * 0.4) * (1 - i * 0.12);
              const smokeEl = (
                <path d={smokePath} stroke={color} strokeWidth={1.2 - i * 0.1} fill="none"
                  opacity={smokeOp}
                  style={{ filter: smokeOp > 0.3 ? `drop-shadow(0 0 2px ${color})` : 'none' }} />
              );
              return prefersReducedMotion ? (
                <g key={`smoke-${i}`}>{smokeEl}</g>
              ) : (
                <motion.g key={`smoke-${i}`}
                  animate={{ opacity: [smokeOp * 0.5, smokeOp, smokeOp * 0.5], y: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                >
                  {smokeEl}
                </motion.g>
              );
            })}

            {/* Internal heat glow in chimney */}
            <rect x={42} y={30} width={16} height={38} rx={1}
              fill={color} opacity={0.02 + act * 0.06} />

            {/* Direction label */}
            <text x={50} y={96} textAnchor="middle" fill={color} fontSize="4" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
              ▲ SLAG OUT
            </text>
          </g>
        )}

        {/* Percentage readout */}
        <text x={isDownload ? 50 : 80} y={isDownload ? 96 : 50} textAnchor="middle" fill={color} fontSize="5.5" fontFamily={MONO} opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={isDownload ? 88 : 12} cy={93} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default BellowsChimney;
