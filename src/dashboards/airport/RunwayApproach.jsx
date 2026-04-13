import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * RunwayApproach — AIRPORT-mode CPU diagram (replaces CoordComplex).
 * Side view of a runway approach light system (PAPI/VASI).
 * 4 rows of approach lights switch from dim to blazing with load.
 * Critical: strobes flash in sequence (rabbit lights), "RWY OCCUPIED" warning.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, lowSpin, size
 */
const RunwayApproach = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
    ? 45 - (level / 100) * 35    // CPU: 45 (warm amber) → 10 (red)
    : 50 - (level / 100) * 30;   // RAM: 50 (gold) → 20 (orange)
  const color = online ? `hsl(${hue}, 85%, ${50 + (level / 100) * 20}%)` : '#6b7280';

  const act = level / 100;
  const critThreshold = lowSpin ? 65 : 80;
  const showCritical = level > critThreshold && online;

  const rowCount = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;

  const ROWS = [
    { y: 68, label: 'SALS', opBase: 0.55 },
    { y: 56, label: 'MALS', opBase: 0.4 },
    { y: 44, label: 'ALSF', opBase: 0.28 },
    { y: 32, label: 'RAIL', opBase: 0.18 },
  ];

  const thrustLabel = level < 25 ? 'Idle' : level < 50 ? 'Climb' : level < 75 ? 'Cruise' : 'TOGA';

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
            APPROACH ◆ {isCpu ? 'THRUST' : 'FUEL'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Active' : 'Standby'} · {thrustLabel}
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
          <radialGradient id={`${gradId}-glow`}>
            <stop offset="0%" stopColor={color} stopOpacity={0.9} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Runway surface (perspective receding) */}
        <path d="M 30,82 L 70,82 L 60,26 L 40,26 Z"
          fill={color} opacity={0.03} stroke={color} strokeWidth="0.5" />

        {/* Centerline dashes */}
        {[78, 70, 62, 54, 46, 38, 30].map((y, i) => {
          const w = 3 + (82 - y) * 0.05;
          return (
            <rect key={`cl-${i}`} x={50 - w / 2} y={y} width={w} height={2.5}
              fill={color} opacity={0.08} rx={0.3} />
          );
        })}

        {/* Approach light rows */}
        {ROWS.map((row, ri) => {
          const isActive = ri < rowCount;
          const spread = 10 + (82 - row.y) * 0.35;
          const lightCount = 5;
          const baseOp = isActive ? row.opBase + act * 0.25 : 0.04;

          return Array.from({ length: lightCount }, (_, li) => {
            const lx = 50 + (li - 2) * spread;
            const r = isActive ? 1.8 + act * 0.6 : 1;

            return prefersReducedMotion || !isActive ? (
              <React.Fragment key={`light-${ri}-${li}`}>
                {isActive && (
                  <circle cx={lx} cy={row.y} r={r * 2.5}
                    fill={`url(#${gradId}-glow)`} opacity={baseOp * 0.4} />
                )}
                <circle cx={lx} cy={row.y} r={r}
                  fill={isActive ? color : '#374151'} opacity={baseOp} />
              </React.Fragment>
            ) : (
              <React.Fragment key={`light-${ri}-${li}`}>
                <motion.circle cx={lx} cy={row.y} r={r * 2.5}
                  fill={`url(#${gradId}-glow)`}
                  animate={{ opacity: [baseOp * 0.3, baseOp * 0.6, baseOp * 0.3] }}
                  transition={{ duration: 2 + ri * 0.3, repeat: Infinity, ease: 'easeInOut', delay: li * 0.1 }}
                />
                <circle cx={lx} cy={row.y} r={r}
                  fill={color} opacity={baseOp}
                  style={{ filter: `drop-shadow(0 0 ${2 + act * 2}px ${color})` }} />
              </React.Fragment>
            );
          });
        })}

        {/* Row labels (left side) */}
        {ROWS.map((row, ri) => (
          ri < rowCount && (
            <text key={`rlbl-${ri}`} x={12} y={row.y + 1.5}
              textAnchor="end" fill={color} fontSize="3" fontFamily={MONO} opacity={0.35}>
              {row.label}
            </text>
          )
        ))}

        {/* Light mounting poles */}
        {ROWS.map((row, ri) => {
          if (ri >= rowCount) return null;
          const spread = 10 + (82 - row.y) * 0.35;
          return Array.from({ length: 5 }, (_, li) => {
            const lx = 50 + (li - 2) * spread;
            return (
              <line key={`pole-${ri}-${li}`} x1={lx} y1={row.y + 2} x2={lx} y2={row.y + 5}
                stroke={color} strokeWidth="0.3" opacity={0.12} />
            );
          });
        })}

        {/* Rabbit lights (sequenced strobes) at critical */}
        {showCritical && online && (() => {
          const critScale = (level - critThreshold) / (100 - critThreshold);
          const strobes = (
            <g>
              {/* Sequenced flash bars along centerline */}
              {[75, 65, 55, 45, 35].map((y, i) => (
                <rect key={`strobe-${i}`} x={46} y={y} width={8} height={1.5} rx={0.5}
                  fill={color} opacity={0.15 + critScale * 0.3}
                  style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
              ))}
              {/* RWY OCCUPIED warning */}
              <text x={50} y={24} textAnchor="middle" fill={color}
                fontSize="3.5" fontFamily={MONO} opacity={0.5 + critScale * 0.4}
                letterSpacing="0.15em">
                RWY OCCUPIED
              </text>
            </g>
          );
          return prefersReducedMotion ? strobes : (
            <motion.g
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {strobes}
            </motion.g>
          );
        })()}

        {/* Threshold bars */}
        <rect x={32} y={82} width={36} height={1.5} rx={0.3}
          fill={color} opacity={0.15} />

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{thrustLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Active' : 'Standby'}
      </div>
    </div>
  );
};

export default RunwayApproach;
