import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * OreStockpile — FORGE-mode media storage diagram (replaces OrbitalDiagram).
 * Pyramidal ore pile that grows with fill level.
 * Different catKey = different ore color tint.
 * Critical (>85%): ore glows from internal heat.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const OreStockpile = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
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

  const isCritical = level > 85;
  // Pile dimensions scale with level
  const baseY = 80;
  const baseW = 20 + act * 50; // 20 → 70 wide
  const peakH = 5 + act * 45;  // 5 → 50 tall
  const peakY = baseY - peakH;
  const leftX = 50 - baseW / 2;
  const rightX = 50 + baseW / 2;
  const fillOpacity = level <= 30 ? 0.1 : level <= 60 ? 0.15 + act * 0.1 : 0.2 + act * 0.2;

  // Pile outline — rough pyramid with irregular surface
  const pilePath = level <= 15
    ? `M ${leftX},${baseY} Q ${50},${peakY} ${rightX},${baseY} Z`
    : `M ${leftX},${baseY} Q ${leftX + baseW * 0.15},${peakY + peakH * 0.4} ${50 - baseW * 0.1},${peakY + 3} Q ${50},${peakY - 1} ${50 + baseW * 0.1},${peakY + 3} Q ${rightX - baseW * 0.15},${peakY + peakH * 0.4} ${rightX},${baseY} Z`;

  // Ore chunk positions (scattered on pile surface)
  const chunkCount = Math.min(Math.floor(level / 10) + 1, 10);
  const chunks = Array.from({ length: chunkCount }, (_, i) => {
    const t = (i + 0.5) / chunkCount; // 0→1 spread across pile
    const cx = leftX + t * baseW;
    const surfaceY = baseY - (1 - Math.abs(t - 0.5) * 2) * peakH * 0.85;
    const cy = surfaceY + (i % 3) * 2 - 1;
    const r = 1.5 + (i % 3) * 0.8;
    return { cx, cy: Math.min(cy, baseY - 3), r };
  });

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
            ORE_STOCKPILE ◆ FILL
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

        {/* Ground line */}
        <line x1={15} y1={baseY} x2={85} y2={baseY} stroke={cat.border} strokeWidth="0.5" opacity={0.15} />

        {/* Pile fill */}
        {level > 0 && (
          isCritical && !prefersReducedMotion ? (
            <motion.path d={pilePath} fill={cat.border} opacity={fillOpacity}
              stroke={cat.border} strokeWidth="0.8" strokeOpacity={0.3}
              animate={{ opacity: [fillOpacity, fillOpacity * 0.7, fillOpacity] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: `drop-shadow(0 0 4px ${cat.border})` }}
            />
          ) : (
            <path d={pilePath} fill={cat.border} opacity={fillOpacity}
              stroke={cat.border} strokeWidth="0.8" strokeOpacity={0.3} />
          )
        )}

        {/* Ore chunks on surface */}
        {chunks.map((chunk, i) => (
          <g key={`chunk-${i}`}>
            <circle cx={chunk.cx} cy={chunk.cy} r={chunk.r}
              fill={cat.border} opacity={fillOpacity + 0.05}
              stroke={cat.border} strokeWidth="0.3" strokeOpacity={0.2} />
            {/* Facet highlight */}
            <circle cx={chunk.cx - chunk.r * 0.3} cy={chunk.cy - chunk.r * 0.3} r={chunk.r * 0.4}
              fill={cat.border} opacity={0.1} />
          </g>
        ))}

        {/* Internal glow at critical */}
        {isCritical && online && (
          <g>
            {[0.3, 0.5, 0.7].map((t, i) => {
              const gx = leftX + t * baseW;
              const gy = baseY - (1 - Math.abs(t - 0.5) * 2) * peakH * 0.5;
              return prefersReducedMotion ? (
                <circle key={`glow-${i}`} cx={gx} cy={gy} r={3} fill={cat.border} opacity={0.15} />
              ) : (
                <motion.circle key={`glow-${i}`} cx={gx} cy={gy} r={3} fill={cat.border}
                  animate={{ opacity: [0.08, 0.2, 0.08], r: [2, 4, 2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                  style={{ filter: `drop-shadow(0 0 3px ${cat.border})` }}
                />
              );
            })}
          </g>
        )}

        {/* Percentage readout */}
        <text x={50} y={92} textAnchor="middle" fill={cat.border} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={50} cy={98} r={2} fill={online ? cat.border : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default OreStockpile;
