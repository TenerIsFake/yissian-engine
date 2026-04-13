import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * CargoBay — SPACE-mode replacement for OrbitalDiagram.
 * Vertical fuel/cargo tank with literal liquid fill level, graduation marks,
 * pressure gauge arc at top, and valve indicator at bottom.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const CargoBay = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const clipId = useId();
  const gradId = useId();
  const cat = activeCATRef.current[catKey];

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const act = level / 100;
  // Tank geometry within 100x100 viewBox
  const tankX = 25, tankY = 18, tankW = 50, tankH = 62, tankR = 6;
  const tankBottom = tankY + tankH;
  const fillHeight = act * (tankH - 2); // inset 1px from edges
  const fillY = tankBottom - 1 - fillHeight;

  const isCritical = level > 85;
  const fillOpacity = level <= 50 ? 0.3 : level <= 75 ? 0.5 : level <= 85 ? 0.7 : 0.9;

  // Pressure gauge arc (semi-circle at top)
  const gaugeR = 8;
  const gaugeCx = 50, gaugeCy = 12;
  const gaugeCirc = Math.PI * gaugeR; // half-circle circumference
  const gaugeFill = act * gaugeCirc;

  // Surface wave path
  const sy = fillY;
  const wavePath = `M ${tankX + 1},${sy} Q ${tankX + tankW * 0.3},${sy - 1.5} ${tankX + tankW * 0.5},${sy} Q ${tankX + tankW * 0.7},${sy + 1.5} ${tankX + tankW - 1},${sy}`;

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
            CARGO_BAY ◆ CAPACITY
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
            <rect x={tankX + 1} y={tankY + 1} width={tankW - 2} height={tankH - 2} rx={tankR - 1} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={cat.border} stopOpacity={fillOpacity} />
            <stop offset="100%" stopColor={cat.border} stopOpacity={fillOpacity * 0.5} />
          </linearGradient>
        </defs>

        {/* Pressure gauge arc (top) */}
        <path d={`M ${gaugeCx - gaugeR},${gaugeCy} A ${gaugeR},${gaugeR} 0 0,1 ${gaugeCx + gaugeR},${gaugeCy}`}
          fill="none" stroke={cat.border} strokeWidth="2" opacity={0.1} />
        {online && gaugeFill > 0 && (
          prefersReducedMotion
            ? <path d={`M ${gaugeCx - gaugeR},${gaugeCy} A ${gaugeR},${gaugeR} 0 0,1 ${gaugeCx + gaugeR},${gaugeCy}`}
                fill="none" stroke={cat.border} strokeWidth="2"
                strokeDasharray={`${gaugeFill} ${gaugeCirc}`}
                opacity={0.7} />
            : <motion.path
                d={`M ${gaugeCx - gaugeR},${gaugeCy} A ${gaugeR},${gaugeR} 0 0,1 ${gaugeCx + gaugeR},${gaugeCy}`}
                fill="none" stroke={cat.border} strokeWidth="2"
                strokeDasharray={`${gaugeFill} ${gaugeCirc}`}
                initial={{ strokeDashoffset: gaugeCirc }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                opacity={0.7}
                style={{ filter: `drop-shadow(0 0 2px ${cat.border})` }}
              />
        )}
        {/* Gauge percentage */}
        <text x={gaugeCx} y={gaugeCy + 3} textAnchor="middle" fill={cat.text} fontSize="5" fontFamily={MONO} fontWeight="bold" opacity={0.7}>
          {level.toFixed(0)}%
        </text>

        {/* Tank outline */}
        <rect x={tankX} y={tankY} width={tankW} height={tankH} rx={tankR}
          fill={cat.border} fillOpacity={0.02}
          stroke={cat.border} strokeWidth="1.2" opacity={0.35} />

        {/* Liquid fill */}
        {fillHeight > 0 && (
          <g clipPath={`url(#${clipId})`}>
            {isCritical && !prefersReducedMotion ? (
              <motion.rect x={tankX + 1} y={fillY} width={tankW - 2} height={fillHeight + 1}
                fill={`url(#${gradId})`}
                animate={{ opacity: [fillOpacity, fillOpacity * 0.75, fillOpacity] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <rect x={tankX + 1} y={fillY} width={tankW - 2} height={fillHeight + 1}
                fill={`url(#${gradId})`} />
            )}

            {/* Surface wave line */}
            {fillHeight > 3 && (
              prefersReducedMotion
                ? <path d={wavePath} stroke={cat.border} strokeWidth="0.8" fill="none" opacity={fillOpacity + 0.1} />
                : <motion.path d={wavePath} stroke={cat.border} strokeWidth="0.8" fill="none"
                    opacity={fillOpacity + 0.1}
                    animate={{ d: [
                      wavePath,
                      `M ${tankX + 1},${sy} Q ${tankX + tankW * 0.3},${sy + 1} ${tankX + tankW * 0.5},${sy} Q ${tankX + tankW * 0.7},${sy - 1} ${tankX + tankW - 1},${sy}`,
                      wavePath,
                    ]}}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
            )}
          </g>
        )}

        {/* Graduation marks (left side) */}
        {[25, 50, 75].map(pct => {
          const gy = tankBottom - 1 - (pct / 100) * (tankH - 2);
          return (
            <g key={`grad-${pct}`}>
              <line x1={tankX - 3} y1={gy} x2={tankX} y2={gy}
                stroke={cat.border} strokeWidth="0.5" opacity={0.25} />
              <text x={tankX - 5} y={gy + 1.5} textAnchor="end"
                fill={cat.text} fontSize="4" fontFamily={MONO} opacity={0.3}>
                {pct}
              </text>
            </g>
          );
        })}

        {/* Valve indicator (bottom) */}
        <polygon points={`${50 - 4},${tankBottom + 1} ${50 + 4},${tankBottom + 1} ${50 + 3},${tankBottom + 5} ${50 - 3},${tankBottom + 5}`}
          fill={online ? cat.border : '#374151'} opacity={0.25} />

        {/* Online dot */}
        <circle cx={50} cy={92} r={2.5}
          fill={online ? cat.border : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default CargoBay;
