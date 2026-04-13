import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BarometerColumn — WEATHER-mode server storage diagram (replaces OrbitalDiagram).
 * Vertical mercury barometer tube with rising column.
 * Vacuum space at top shrinks as fill increases.
 * Critical (>85%): mercury column glows and "HIGH PRESSURE" appears.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const BarometerColumn = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const gradId = useId();
  const clipId = useId();
  const cat = activeCATRef.current[catKey];
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isCritical = level > 85;

  // Tube geometry (centered, tall narrow column)
  const tubeX = 38, tubeY = 10, tubeW = 12, tubeH = 65, tubeR = 4;
  const tubeBottom = tubeY + tubeH;

  // Basin at bottom
  const basinX = 30, basinY = tubeBottom, basinW = 28, basinH = 10, basinR = 4;

  // Mercury column fill
  const mercuryH = act * (tubeH - 4); // inset from tube edges
  const mercuryY = tubeBottom - 2 - mercuryH;

  // Vacuum label position (top of tube above mercury)
  const vacuumY = tubeY + 4;

  const fillOpacity = level <= 50 ? 0.3 : level <= 75 ? 0.5 : level <= 85 ? 0.7 : 0.9;

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
          minWidth: 120, background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${cat.border}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${cat.border}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            BAROMETER ◆ COLUMN
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: cat.text, letterSpacing: '0.2em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: cat.border, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{d.label}</span>
              <span style={{ color: cat.text }}>{d.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? cat.border : '#374151' }} />
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              {online ? 'ONLINE' : online === null ? 'STARTING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(0)}% load, ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        <defs>
          <clipPath id={clipId}>
            <rect x={tubeX + 1} y={tubeY + 1} width={tubeW - 2} height={tubeH - 2} rx={tubeR - 1} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={cat.border} stopOpacity={fillOpacity * 0.7} />
            <stop offset="50%" stopColor={cat.border} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={cat.border} stopOpacity={fillOpacity * 0.7} />
          </linearGradient>
        </defs>

        {/* Tube outline */}
        <rect x={tubeX} y={tubeY} width={tubeW} height={tubeH} rx={tubeR}
          fill={cat.border} fillOpacity={0.02}
          stroke={cat.border} strokeWidth="0.8" opacity={0.3} />

        {/* Mercury column */}
        {mercuryH > 0 && (
          <g clipPath={`url(#${clipId})`}>
            {isCritical && !prefersReducedMotion ? (
              <motion.rect x={tubeX + 1} y={mercuryY} width={tubeW - 2} height={mercuryH + 2}
                fill={`url(#${gradId})`}
                animate={{ opacity: [fillOpacity, fillOpacity * 0.7, fillOpacity] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: `drop-shadow(0 0 3px ${cat.border})` }}
              />
            ) : (
              <rect x={tubeX + 1} y={mercuryY} width={tubeW - 2} height={mercuryH + 2}
                fill={`url(#${gradId})`}
                style={{ filter: online ? `drop-shadow(0 0 1px ${cat.border})` : 'none' }} />
            )}

            {/* Mercury meniscus (curved top surface) */}
            <path d={`M ${tubeX + 1},${mercuryY + 1} Q ${tubeX + tubeW / 2},${mercuryY - 1} ${tubeX + tubeW - 1},${mercuryY + 1}`}
              stroke={cat.border} strokeWidth="0.6" fill="none" opacity={fillOpacity + 0.1} />
          </g>
        )}

        {/* Vacuum label (above mercury) */}
        {mercuryY > vacuumY + 8 && (
          <text x={tubeX + tubeW / 2} y={vacuumY + 8} textAnchor="middle"
            fill={cat.border} fontSize="3" fontFamily={MONO} opacity={0.2}>
            VACUUM
          </text>
        )}

        {/* Basin (bottom reservoir) */}
        <rect x={basinX} y={basinY} width={basinW} height={basinH} rx={basinR}
          fill={cat.border} fillOpacity={0.04}
          stroke={cat.border} strokeWidth="0.8" opacity={0.3} />
        {/* Basin mercury fill */}
        <rect x={basinX + 2} y={basinY + 2} width={basinW - 4} height={basinH - 4} rx={basinR - 1}
          fill={cat.border} opacity={0.15 + act * 0.1} />

        {/* Graduation marks (left side of tube) */}
        {[25, 50, 75].map(pct => {
          const gy = tubeBottom - 2 - (pct / 100) * (tubeH - 4);
          return (
            <g key={`grad-${pct}`}>
              <line x1={tubeX - 3} y1={gy} x2={tubeX} y2={gy}
                stroke={cat.border} strokeWidth="0.5" opacity={0.25} />
              <text x={tubeX - 5} y={gy + 1.5} textAnchor="end"
                fill={cat.text} fontSize="3.5" fontFamily={MONO} opacity={0.3}>
                {pct}
              </text>
            </g>
          );
        })}

        {/* HIGH PRESSURE label at critical */}
        {isCritical && (
          <text x={tubeX + tubeW + 5} y={mercuryY + 5} fill={cat.border} fontSize="3.5" fontFamily={MONO} opacity={0.6} letterSpacing="0.05em">
            HIGH
          </text>
        )}

        {/* Percentage readout */}
        <text x={tubeX + tubeW / 2} y={basinY + basinH + 10} textAnchor="middle"
          fill={cat.border} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={tubeX + tubeW / 2} cy={basinY + basinH + 16} r={2}
          fill={online ? cat.border : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default BarometerColumn;
