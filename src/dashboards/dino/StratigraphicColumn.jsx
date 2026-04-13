import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const STRATA = [
  { name: 'Bedrock',    pattern: 'dots',   fossilD: 'M 1 0 L 3 -1 L 4 1 L 2 2 Z' },
  { name: 'Sandstone',  pattern: 'dashes', fossilD: 'M 0 0 C 2 -1 3 1 1 2 Z' },
  { name: 'Limestone',  pattern: 'cross',  fossilD: 'M 0 -1 C 2 -2 3 0 2 1 C 1 2 -1 1 0 -1 Z' },
  { name: 'Shale',      pattern: 'dots',   fossilD: 'M 0 0 L 2 -1 L 3 0 L 2 2 L 0 1 Z' },
  { name: 'Topsoil',    pattern: 'dashes', fossilD: 'M 1 0 C 2 -1 3 0 2 1 C 1 2 0 1 1 0 Z' },
];

/**
 * StratigraphicColumn — DINO-mode storage diagram.
 * Geological column showing sediment layers filling from bottom up.
 * Different SVG patterns per layer. Erosion unconformity at >90%.
 */
const StratigraphicColumn = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const patternId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isCpu = metal === 'Fe' || metal === 'Cu';
  const hue = isCpu
    ? 200 - (level / 100) * 200
    : 160 - (level / 100) * 130;
  const color = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';

  const act = level / 100;
  const totalHeight = 80;
  const fillHeight = totalHeight * act;
  const showErosion = level > 90;

  const stratumLabel = level < 20 ? 'Bedrock' : level < 40 ? 'Sandstone' : level < 60 ? 'Limestone' : level < 80 ? 'Shale' : 'Topsoil';
  const statusText = lowSpin ? 'Compacting' : 'Stable';

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
            STRATIGRAPHY ◆ {isCpu ? 'SERVER' : 'MEDIA'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {statusText} · {stratumLabel}
            {showErosion && ' · EROSION WARNING'}
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

      <svg viewBox="0 0 50 100" style={{ width: size * 0.55, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          {/* Dot pattern */}
          <pattern id={`${patternId}-dots`} width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="0.6" fill={color} opacity="0.25" />
          </pattern>
          {/* Dash pattern */}
          <pattern id={`${patternId}-dashes`} width="7" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="1.5" x2="4" y2="1.5" stroke={color} strokeWidth="0.5" opacity="0.25" />
          </pattern>
          {/* Cross-hatch pattern */}
          <pattern id={`${patternId}-cross`} width="5" height="5" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="5" y2="5" stroke={color} strokeWidth="0.3" opacity="0.2" />
            <line x1="5" y1="0" x2="0" y2="5" stroke={color} strokeWidth="0.3" opacity="0.2" />
          </pattern>
        </defs>

        {/* Column outline */}
        <rect x={8} y={6} width={34} height={totalHeight} rx={2} ry={2}
          fill="rgba(20,18,15,0.5)"
          stroke={color} strokeWidth={0.5} opacity={0.25} />

        {/* Sediment layers — fill from bottom */}
        {STRATA.map((stratum, i) => {
          const layerH = totalHeight / STRATA.length;
          const layerTop = 6 + totalHeight - (i + 1) * layerH;
          const layerBottom = layerTop + layerH;
          const fillTop = 6 + totalHeight - fillHeight;

          // Is this layer at least partially filled?
          if (fillTop >= layerBottom) return null;

          const visibleTop = Math.max(layerTop, fillTop);
          const visibleH = layerBottom - visibleTop;

          const layerOpacity = online ? 0.12 + (i / STRATA.length) * 0.15 : 0.05;
          const patternUrl = `url(#${patternId}-${stratum.pattern})`;

          return (
            <g key={stratum.name}>
              {/* Layer fill */}
              <rect x={8} y={visibleTop} width={34} height={visibleH}
                fill={color} opacity={layerOpacity} />

              {/* Pattern overlay */}
              <rect x={8} y={visibleTop} width={34} height={visibleH}
                fill={patternUrl} />

              {/* Fossil icon in layer center */}
              {visibleH > 8 && online && (
                <path
                  d={stratum.fossilD}
                  transform={`translate(${20 + (i % 3) * 4}, ${visibleTop + visibleH / 2})`}
                  fill={color} opacity={0.3}
                />
              )}

              {/* Layer boundary */}
              <line x1={8} y1={layerBottom} x2={42} y2={layerBottom}
                stroke={color} strokeWidth={0.3} opacity={0.15} />

              {/* Stratum label */}
              {visibleH > 10 && (
                <text x={44} y={visibleTop + visibleH / 2 + 2}
                  fill={color} fontSize="3" fontFamily={MONO} opacity={0.35}>
                  {stratum.name.slice(0, 5).toUpperCase()}
                </text>
              )}

              {/* Pulse for active layers */}
              {online && !prefersReducedMotion && (
                <motion.rect
                  x={8} y={visibleTop} width={34} height={visibleH}
                  fill={color} opacity={0}
                  animate={{ opacity: [0, 0.03, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                />
              )}
            </g>
          );
        })}

        {/* Fill level line */}
        {fillHeight > 0 && (
          <line x1={8} y1={6 + totalHeight - fillHeight} x2={42} y2={6 + totalHeight - fillHeight}
            stroke={color} strokeWidth={0.8} opacity={0.5}
            strokeDasharray="3 2" />
        )}

        {/* Erosion unconformity warning at >90% */}
        {showErosion && (
          <g>
            <path
              d={`M 8 ${6 + totalHeight * 0.1} Q 15 ${6 + totalHeight * 0.08} 25 ${6 + totalHeight * 0.12} Q 35 ${6 + totalHeight * 0.08} 42 ${6 + totalHeight * 0.1}`}
              fill="none"
              stroke={online ? '#ef4444' : '#6b7280'}
              strokeWidth={1}
              opacity={0.6}
              strokeDasharray="2 1"
            />
            {online && !prefersReducedMotion && (
              <motion.path
                d={`M 8 ${6 + totalHeight * 0.1} Q 15 ${6 + totalHeight * 0.08} 25 ${6 + totalHeight * 0.12} Q 35 ${6 + totalHeight * 0.08} 42 ${6 + totalHeight * 0.1}`}
                fill="none" stroke="#ef4444" strokeWidth={1.5}
                opacity={0}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <text x={25} y={6 + totalHeight * 0.07} textAnchor="middle"
              fill="#ef4444" fontSize="3.5" fontFamily={MONO} opacity={0.7}>
              UNCONFORMITY
            </text>
          </g>
        )}

        {/* Percentage readout */}
        <text x={25} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {stratumLabel}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {statusText} | {isCpu ? 'Server' : 'Media'}
      </div>
    </div>
  );
};

export default StratigraphicColumn;
