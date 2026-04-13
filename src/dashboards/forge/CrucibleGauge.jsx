import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * CrucibleGauge — FORGE-mode RAM diagram (replaces CoordComplex).
 * Side-view of a tilted crucible with molten metal fill level.
 * Critical: overflow drips down the side.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const CrucibleGauge = ({ label, level, online, details = [], metal = 'Co', lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const gradId = useId();
  const clipId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isCpu = metal === 'Fe' || metal === 'Cu';
  const hue = isCpu
    ? 30 - (level / 100) * 20
    : 40 - (level / 100) * 25;
  const color = online ? `hsl(${hue}, 90%, ${45 + (level / 100) * 20}%)` : '#6b7280';

  const act = level / 100;
  const isCritical = level > 85;

  // Crucible shape — tapered pot
  const potLeft = 25, potRight = 75, potTop = 28, potBottom = 78;
  const potTaperTop = 8; // how much narrower at bottom
  const innerLeft = potLeft + 3;
  const innerRight = potRight - 3;

  // Molten fill
  const fillH = act * (potBottom - potTop - 6);
  const fillY = potBottom - 3 - fillH;
  const fillOpacity = level <= 50 ? 0.35 : level <= 75 ? 0.55 : 0.75;

  // Surface shimmer path
  const surfY = fillY;

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
            CRUCIBLE ◆ {isCpu ? 'MELT_TEMP' : 'FILL_LEVEL'}
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
          <clipPath id={clipId}>
            <path d={`M ${innerLeft},${potTop + 3} L ${innerLeft + potTaperTop},${potBottom - 3} L ${innerRight - potTaperTop},${potBottom - 3} L ${innerRight},${potTop + 3} Z`} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={color} stopOpacity={fillOpacity * 0.5} />
          </linearGradient>
        </defs>

        {/* Tongs / handle (left side) */}
        <path d={`M ${potLeft - 2},${potTop + 10} Q ${potLeft - 10},${potTop + 20} ${potLeft - 5},${potTop + 30}`}
          fill="none" stroke={color} strokeWidth="1.5" opacity={0.2} strokeLinecap="round" />

        {/* Crucible outer shape — tapered pot */}
        <path d={`M ${potLeft},${potTop} L ${potLeft + potTaperTop},${potBottom} Q ${50},${potBottom + 4} ${potRight - potTaperTop},${potBottom} L ${potRight},${potTop}`}
          fill={color} fillOpacity={0.03}
          stroke={color} strokeWidth="1.2" opacity={0.3} />

        {/* Rim at top */}
        <path d={`M ${potLeft - 2},${potTop} L ${potRight + 2},${potTop}`}
          stroke={color} strokeWidth="2" opacity={0.25} strokeLinecap="round" />

        {/* Molten metal fill */}
        {fillH > 0 && (
          <g clipPath={`url(#${clipId})`}>
            {isCritical && !prefersReducedMotion ? (
              <motion.rect x={innerLeft} y={fillY} width={innerRight - innerLeft} height={fillH + 4}
                fill={`url(#${gradId})`}
                animate={{ opacity: [fillOpacity, fillOpacity * 0.7, fillOpacity] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />
            ) : (
              <rect x={innerLeft} y={fillY} width={innerRight - innerLeft} height={fillH + 4}
                fill={`url(#${gradId})`}
                style={{ filter: online ? `drop-shadow(0 0 2px ${color})` : 'none' }} />
            )}

            {/* Surface shimmer */}
            {fillH > 5 && (
              prefersReducedMotion
                ? <path d={`M ${innerLeft + 2},${surfY} Q ${50},${surfY - 2} ${innerRight - 2},${surfY}`}
                    stroke={color} strokeWidth="0.8" fill="none" opacity={fillOpacity + 0.15} />
                : <motion.path
                    d={`M ${innerLeft + 2},${surfY} Q ${50},${surfY - 2} ${innerRight - 2},${surfY}`}
                    stroke={color} strokeWidth="0.8" fill="none"
                    opacity={fillOpacity + 0.15}
                    animate={{ d: [
                      `M ${innerLeft + 2},${surfY} Q ${50},${surfY - 2} ${innerRight - 2},${surfY}`,
                      `M ${innerLeft + 2},${surfY} Q ${50},${surfY + 1.5} ${innerRight - 2},${surfY}`,
                      `M ${innerLeft + 2},${surfY} Q ${50},${surfY - 2} ${innerRight - 2},${surfY}`,
                    ]}}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ filter: `drop-shadow(0 0 2px ${color})` }}
                  />
            )}
          </g>
        )}

        {/* Graduation marks (right side) */}
        {[25, 50, 75].map(pct => {
          const gy = potBottom - 3 - (pct / 100) * (potBottom - potTop - 6);
          return (
            <g key={`grad-${pct}`}>
              <line x1={potRight + 1} y1={gy} x2={potRight + 4} y2={gy}
                stroke={color} strokeWidth="0.5" opacity={0.25} />
              <text x={potRight + 6} y={gy + 1.5} fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.3}>
                {pct}
              </text>
            </g>
          );
        })}

        {/* Overflow drips at critical */}
        {isCritical && online && (() => {
          const drips = (
            <g>
              <path d={`M ${potRight - 1},${potTop + 2} Q ${potRight + 3},${potTop + 8} ${potRight + 1},${potTop + 15}`}
                stroke={color} strokeWidth="1.5" fill="none" opacity={0.6}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
              <circle cx={potRight + 1} cy={potTop + 17} r={1.5} fill={color} opacity={0.5} />
            </g>
          );
          return prefersReducedMotion ? drips : (
            <motion.g
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {drips}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={92} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default CrucibleGauge;
