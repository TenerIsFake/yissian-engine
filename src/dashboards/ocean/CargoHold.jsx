import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * CargoHold — OCEAN-mode server storage diagram (replaces OrbitalDiagram).
 * Top-down view of a ship's cargo hold with compartments that fill with
 * crates/containers as storage increases. At critical: hold overflows,
 * "TRIM WARNING" as vessel lists from weight, water sloshing.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const CargoHold = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current[catKey];
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const color = online ? cat : '#6b7280';
  const showOverflow = level > 85 && online;

  const tierLabel = level < 25 ? 'Light' : level < 50 ? 'Loaded' : level < 75 ? 'Heavy' : 'Overloaded';

  // Cargo compartments (4 bays) — fill from bow to stern
  const bayCount = 4;
  const filledBays = Math.ceil(act * bayCount);
  const BAYS = [
    { x: 14, y: 28, w: 16, h: 20, label: 'BAY-A' },
    { x: 34, y: 28, w: 16, h: 20, label: 'BAY-B' },
    { x: 54, y: 28, w: 16, h: 20, label: 'BAY-C' },
    { x: 14, y: 52, w: 16, h: 20, label: 'BAY-D' },
  ];

  // Crate positions within a bay
  const getCrates = (bayIdx) => {
    const bay = BAYS[bayIdx];
    const fillAmount = bayIdx < filledBays - 1 ? 1 : bayIdx === filledBays - 1 ? (act * bayCount) % 1 || 1 : 0;
    const crateCount = Math.ceil(fillAmount * 4);
    return Array.from({ length: crateCount }, (_, i) => ({
      x: bay.x + 1 + (i % 2) * (bay.w / 2),
      y: bay.y + 1 + Math.floor(i / 2) * (bay.h / 2),
      w: bay.w / 2 - 2,
      h: bay.h / 2 - 2,
    }));
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
            CARGO_HOLD ◆ MANIFEST
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {filledBays}/{bayCount} bays · {tierLabel}
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

        {/* Ship hull outline (top-down view) */}
        <path d="M 10,25 L 75,25 Q 90,25 90,50 Q 90,75 75,75 L 10,75 Q 5,75 5,50 Q 5,25 10,25 Z"
          fill={color} opacity={0.04} stroke={color} strokeWidth="1" />

        {/* Bow point */}
        <path d="M 75,25 Q 95,40 95,50 Q 95,60 75,75"
          fill="none" stroke={color} strokeWidth="0.8" opacity={0.2} />

        {/* Center keel line */}
        <line x1={5} y1={50} x2={90} y2={50} stroke={color} strokeWidth="0.3" opacity={0.1} />

        {/* Cargo bay outlines */}
        {BAYS.map((bay, i) => (
          <rect key={`bay-${i}`} x={bay.x} y={bay.y} width={bay.w} height={bay.h}
            fill="none" stroke={color} strokeWidth={i < filledBays ? 0.8 : 0.3}
            opacity={i < filledBays ? 0.3 : 0.1} rx={1} />
        ))}

        {/* Additional bays on starboard side for visual balance */}
        <rect x={34} y={52} width={16} height={20} rx={1}
          fill="none" stroke={color} strokeWidth={filledBays > 2 ? 0.6 : 0.3}
          opacity={filledBays > 2 ? 0.25 : 0.08} />
        <rect x={54} y={52} width={16} height={20} rx={1}
          fill="none" stroke={color} strokeWidth={filledBays > 3 ? 0.6 : 0.3}
          opacity={filledBays > 3 ? 0.25 : 0.08} />

        {/* Crates in filled bays */}
        {BAYS.map((_, bayIdx) => (
          getCrates(bayIdx).map((crate, ci) => {
            const crateOp = 0.15 + act * 0.2;
            return prefersReducedMotion || bayIdx >= filledBays ? (
              <rect key={`crate-${bayIdx}-${ci}`} x={crate.x} y={crate.y}
                width={crate.w} height={crate.h} rx={0.5}
                fill={color} opacity={bayIdx < filledBays ? crateOp : 0}
                stroke={color} strokeWidth="0.3" />
            ) : (
              <motion.rect key={`crate-${bayIdx}-${ci}`} x={crate.x} y={crate.y}
                width={crate.w} height={crate.h} rx={0.5}
                fill={color} stroke={color} strokeWidth="0.3"
                animate={{ opacity: [crateOp, crateOp * 1.2, crateOp] }}
                transition={{ duration: 3 + ci * 0.3, repeat: Infinity, ease: 'easeInOut', delay: bayIdx * 0.5 }}
              />
            );
          })
        ))}

        {/* Bay labels */}
        {BAYS.map((bay, i) => (
          i < filledBays && (
            <text key={`blbl-${i}`} x={bay.x + bay.w / 2} y={bay.y + bay.h / 2 + 1.5}
              textAnchor="middle" fill={color} fontSize="3" fontFamily={MONO} opacity={0.35}>
              {bay.label}
            </text>
          )
        ))}

        {/* Trim warning at critical */}
        {showOverflow && (() => {
          const overflowScale = (level - 85) / 15;
          const warning = (
            <g>
              {/* Water sloshing in hull */}
              <path d={`M 8,72 Q 20,${70 - overflowScale * 3} 40,72 Q 60,${74 + overflowScale * 2} 80,72`}
                fill={color} opacity={0.06 + overflowScale * 0.08} />
              {/* Trim indicator (vessel listing) */}
              <line x1={82} y1={35} x2={82} y2={65}
                stroke={color} strokeWidth="0.5" opacity={0.3} />
              <line x1={80} y1={50 + overflowScale * 5} x2={84} y2={50 - overflowScale * 3}
                stroke={color} strokeWidth="1" opacity={0.5 + overflowScale * 0.3} />
              {/* TRIM text */}
              <text x={82} y={32} textAnchor="middle" fill={color}
                fontSize="3" fontFamily={MONO} opacity={0.4 + overflowScale * 0.4}>
                TRIM
              </text>
            </g>
          );
          return prefersReducedMotion ? warning : (
            <motion.g
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              {warning}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{tierLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {filledBays}/{bayCount} Bays
      </div>
    </div>
  );
};

export default CargoHold;
