import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * IngotStack — FORGE-mode server storage diagram (replaces OrbitalDiagram).
 * Rectangular ingot mold with stacked metal bars filling from bottom.
 * Each bar ≈ 20% capacity. Critical (>85%): top ingot pulses white-hot.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const IngotStack = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
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
  const ingotCount = Math.ceil(level / 20); // 0-5 ingots
  const moldX = 25, moldY = 20, moldW = 50, moldH = 60;
  const ingotH = 10;
  const ingotGap = 2;
  const ingotInset = 4;

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
            INGOT_STACK ◆ CAPACITY
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

        {/* Mold outline */}
        <rect x={moldX} y={moldY} width={moldW} height={moldH} rx={3}
          fill={cat.border} fillOpacity={0.02}
          stroke={cat.border} strokeWidth="1.2" opacity={0.25} />

        {/* Ingot bars (bottom → top) */}
        {Array.from({ length: 5 }, (_, i) => {
          const isPresent = i < ingotCount;
          const ix = moldX + ingotInset;
          const iy = moldY + moldH - ingotInset - (i + 1) * (ingotH + ingotGap) + ingotGap;
          const iw = moldW - ingotInset * 2;
          const baseOp = isPresent ? 0.15 + (i / 5) * 0.15 + act * 0.2 : 0.02;
          const isTopIngot = i === ingotCount - 1 && isCritical;

          if (!isPresent) {
            // Empty slot — faint outline
            return (
              <rect key={`slot-${i}`} x={ix} y={iy} width={iw} height={ingotH} rx={1.5}
                fill="none" stroke={cat.border} strokeWidth="0.3" opacity={0.06}
                strokeDasharray="3 3" />
            );
          }

          const ingotEl = (
            <rect x={ix} y={iy} width={iw} height={ingotH} rx={1.5}
              fill={cat.border} opacity={baseOp}
              stroke={cat.border} strokeWidth="0.5" strokeOpacity={0.3}
              style={{ filter: isTopIngot ? `drop-shadow(0 0 4px ${cat.border})` : 'none' }} />
          );

          return isTopIngot && !prefersReducedMotion ? (
            <motion.g key={`ingot-${i}`}
              animate={{ opacity: [baseOp, baseOp * 1.5, baseOp] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {ingotEl}
              {/* Hot glow line on top ingot */}
              <line x1={ix + 2} y1={iy + ingotH / 2} x2={ix + iw - 2} y2={iy + ingotH / 2}
                stroke={cat.border} strokeWidth="1" opacity={0.5}
                style={{ filter: `drop-shadow(0 0 3px ${cat.border})` }} />
            </motion.g>
          ) : (
            <g key={`ingot-${i}`}>{ingotEl}</g>
          );
        })}

        {/* Graduation marks (left side) */}
        {[1, 2, 3, 4, 5].map(n => {
          const gy = moldY + moldH - ingotInset - n * (ingotH + ingotGap) + ingotGap + ingotH / 2;
          return (
            <g key={`mark-${n}`}>
              <line x1={moldX - 3} y1={gy} x2={moldX} y2={gy}
                stroke={cat.border} strokeWidth="0.4" opacity={0.2} />
              <text x={moldX - 5} y={gy + 1.5} textAnchor="end"
                fill={cat.text} fontSize="3.5" fontFamily={MONO} opacity={0.25}>
                {n * 20}
              </text>
            </g>
          );
        })}

        {/* Percentage readout */}
        <text x={50} y={90} textAnchor="middle" fill={cat.border} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={50} cy={96} r={2} fill={online ? cat.border : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default IngotStack;
