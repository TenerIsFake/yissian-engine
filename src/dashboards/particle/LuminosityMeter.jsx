import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * LuminosityMeter — PARTICLE-mode storage diagram.
 * Vertical bar styled as integrated luminosity readout.
 * Fill from bottom up, beam cross-section at top, warning at >90%.
 * fb^-1 units label.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const LuminosityMeter = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const clipId = useId();
  const gradId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const cat = activeCATRef.current[catKey] ?? activeCATRef.current.TRANSITION;

  const act = level / 100;
  const isCritical = level > 90;

  /* Tank geometry in 100x100 viewBox */
  const barX = 28, barY = 20, barW = 44, barH = 58, barR = 4;
  const barBottom = barY + barH;
  const fillHeight = act * (barH - 2);
  const fillY = barBottom - 1 - fillHeight;

  /* Luminosity value (scaled to look like real fb^-1) */
  const lumiValue = (act * 300).toFixed(0);

  /* Beam cross-section ellipse at top */
  const beamCx = 50, beamCy = 12;
  const beamRx = 10, beamRy = 5;
  const beamOpacity = online ? 0.15 + act * 0.35 : 0.05;

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
            LUMINOSITY ◆ CAPACITY
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: cat.text, letterSpacing: '0.2em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: cat.border, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lumiValue} fb⁻¹ integrated
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
        role="img" aria-label={`${label}: ${level.toFixed(0)}% capacity, ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        <defs>
          <clipPath id={clipId}>
            <rect x={barX + 1} y={barY + 1} width={barW - 2} height={barH - 2} rx={barR - 1} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={cat.border} stopOpacity={isCritical ? 0.85 : 0.5} />
            <stop offset="100%" stopColor={cat.border} stopOpacity={isCritical ? 0.5 : 0.2} />
          </linearGradient>
        </defs>

        {/* Beam cross-section at top */}
        <ellipse cx={beamCx} cy={beamCy} rx={beamRx} ry={beamRy}
          fill={cat.border} opacity={beamOpacity}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }}
        />
        <ellipse cx={beamCx} cy={beamCy} rx={beamRx} ry={beamRy}
          fill="none" stroke={cat.border} strokeWidth={0.6} opacity={online ? 0.35 : 0.1} />
        {/* Cross-section crosshairs */}
        <line x1={beamCx - beamRx} y1={beamCy} x2={beamCx + beamRx} y2={beamCy}
          stroke={cat.border} strokeWidth={0.3} opacity={0.2} />
        <line x1={beamCx} y1={beamCy - beamRy} x2={beamCx} y2={beamCy + beamRy}
          stroke={cat.border} strokeWidth={0.3} opacity={0.2} />

        {/* Luminosity bar outline */}
        <rect x={barX} y={barY} width={barW} height={barH} rx={barR}
          fill={cat.border} fillOpacity={0.02}
          stroke={cat.border} strokeWidth={1.2} opacity={0.3} />

        {/* Fill */}
        {fillHeight > 0 && (
          <g clipPath={`url(#${clipId})`}>
            {isCritical && !prefersReducedMotion ? (
              <motion.rect x={barX + 1} y={fillY} width={barW - 2} height={fillHeight + 1}
                fill={`url(#${gradId})`}
                animate={{ opacity: [0.85, 0.55, 0.85] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <rect x={barX + 1} y={fillY} width={barW - 2} height={fillHeight + 1}
                fill={`url(#${gradId})`} />
            )}

            {/* Luminosity scan lines inside fill */}
            {Array.from({ length: Math.floor(fillHeight / 3) }, (_, i) => (
              <line key={i} x1={barX + 1} y1={barBottom - 1 - i * 3} x2={barX + barW - 1} y2={barBottom - 1 - i * 3}
                stroke={cat.border} strokeWidth={0.3} opacity={0.08} />
            ))}
          </g>
        )}

        {/* Graduation marks (left side) */}
        {[25, 50, 75, 90].map(pct => {
          const gy = barBottom - 1 - (pct / 100) * (barH - 2);
          return (
            <g key={`grad-${pct}`}>
              <line x1={barX - 3} y1={gy} x2={barX} y2={gy}
                stroke={cat.border} strokeWidth={pct === 90 ? 0.8 : 0.5} opacity={pct === 90 ? 0.5 : 0.25} />
              <text x={barX - 5} y={gy + 1.5} textAnchor="end"
                fill={pct === 90 ? '#ef4444' : cat.text} fontSize="3.5" fontFamily={MONO}
                opacity={pct === 90 ? 0.6 : 0.3}>
                {pct}
              </text>
            </g>
          );
        })}

        {/* BEAM DUMP IMMINENT warning */}
        {isCritical && online && (
          prefersReducedMotion ? (
            <text x={50} y={barBottom + 8} textAnchor="middle" fill="#ef4444"
              fontSize="4" fontFamily={MONO} fontWeight="bold" opacity={0.8}>
              BEAM DUMP IMMINENT
            </text>
          ) : (
            <motion.text x={50} y={barBottom + 8} textAnchor="middle" fill="#ef4444"
              fontSize="4" fontFamily={MONO} fontWeight="bold"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.7, repeat: Infinity }}>
              BEAM DUMP IMMINENT
            </motion.text>
          )
        )}

        {/* Percentage in bar center */}
        <text x={50} y={barY + barH / 2 + 3} textAnchor="middle" fill={cat.text}
          fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.8}>
          {level.toFixed(0)}%
        </text>

        {/* fb^-1 units label (right side) */}
        <text x={barX + barW + 4} y={barY + barH / 2 + 2} fill={cat.text}
          fontSize="3.5" fontFamily={MONO} opacity={0.3}>
          fb⁻¹
        </text>

        {/* Online dot */}
        <circle cx={50} cy={93} r={2.5}
          fill={online ? cat.border : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default LuminosityMeter;
