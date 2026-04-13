import React, { useState, useId, useMemo } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * MassSpectrometer — MOLECULE-mode Storage diagram (Server + Media).
 * Horizontal bar chart styled as a mass spectrum — peaks at various m/z positions.
 * Peak heights fill proportional to storage level.
 * Major peak at center, minor peaks at sides (like a real mass spec readout).
 * Warning zone at high fill (red bar tops).
 *
 * Props: label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const MassSpectrometer = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const act = level / 100;

  // Color based on fill level — green to yellow to red
  const hue = 120 - act * 120; // 120 (green) → 0 (red)
  const color = online ? `hsl(${hue}, 75%, 55%)` : '#6b7280';

  const isWarning = level > 80;
  const isCritical = level > 90;

  // Chart area in 100x100 viewBox
  const chartL = 15, chartR = 95, chartTop = 12, chartBot = 78;
  const chartW = chartR - chartL;
  const chartH = chartBot - chartTop;

  // Generate mass spec peaks — 9 peaks with varying relative intensities
  // Major peak (base peak) at center, molecular ion at right, fragments scattered
  const peaks = useMemo(() => {
    const relIntensities = [0.3, 0.15, 0.55, 0.25, 1.0, 0.4, 0.65, 0.2, 0.45];
    const mzLabels = [28, 41, 57, 69, 91, 105, 119, 134, 150];
    return relIntensities.map((rel, i) => {
      const x = chartL + (i + 0.5) * (chartW / relIntensities.length);
      const peakH = rel * act * chartH;
      const barW = chartW / relIntensities.length * 0.5;
      return {
        x: x - barW / 2,
        y: chartBot - peakH,
        w: barW,
        h: peakH,
        rel,
        mz: mzLabels[i],
        isBase: rel === 1.0,
        idx: i,
      };
    });
  }, [act, chartL, chartW, chartH, chartBot]);

  // Warning threshold line
  const warningY = chartBot - 0.8 * chartH;

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
            MASS_SPEC MOLAR_CAPACITY
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {isCritical ? 'CRITICAL SATURATION' : isWarning ? 'HIGH CONCENTRATION' : 'NOMINAL'}
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% storage ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Axes */}
        {/* Y-axis (intensity) */}
        <line x1={chartL} y1={chartTop} x2={chartL} y2={chartBot}
          stroke={color} strokeWidth="0.6" opacity={0.3} />
        {/* X-axis (m/z) */}
        <line x1={chartL} y1={chartBot} x2={chartR} y2={chartBot}
          stroke={color} strokeWidth="0.6" opacity={0.3} />

        {/* Y-axis label */}
        <text x={4} y={chartTop + chartH / 2} textAnchor="middle" fill={color}
          fontSize="3" fontFamily={MONO} opacity={0.3}
          transform={`rotate(-90, 4, ${chartTop + chartH / 2})`}>
          INTENSITY
        </text>

        {/* X-axis label */}
        <text x={chartL + chartW / 2} y={chartBot + 9} textAnchor="middle" fill={color}
          fontSize="3" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
          m/z
        </text>

        {/* Y-axis tick marks */}
        {[25, 50, 75, 100].map(pct => {
          const gy = chartBot - (pct / 100) * chartH;
          return (
            <g key={`ytick-${pct}`}>
              <line x1={chartL - 2} y1={gy} x2={chartL} y2={gy}
                stroke={color} strokeWidth="0.4" opacity={0.2} />
              <text x={chartL - 3} y={gy + 1.2} textAnchor="end"
                fill={color} fontSize="3" fontFamily={MONO} opacity={0.2}>
                {pct}
              </text>
            </g>
          );
        })}

        {/* Warning threshold dashed line */}
        <line x1={chartL} y1={warningY} x2={chartR} y2={warningY}
          stroke="#ef4444" strokeWidth="0.4" strokeDasharray="3 2" opacity={0.25} />

        {/* Spectrum peaks */}
        {peaks.map(p => {
          if (p.h < 0.5) return null;
          const peakExceedsWarning = p.y < warningY;
          const barColor = peakExceedsWarning && isWarning ? '#ef4444' : color;

          const bar = (
            <rect x={p.x} y={p.y} width={p.w} height={p.h}
              fill={barColor} opacity={online ? (p.isBase ? 0.7 : 0.5) : 0.15}
              rx={0.3}
              style={peakExceedsWarning && isCritical ? { filter: `drop-shadow(0 0 2px #ef4444)` } : {}}
            />
          );

          return (
            <g key={`peak-${p.idx}`}>
              {/* Peak bar — pulse if critical */}
              {isCritical && peakExceedsWarning && !prefersReducedMotion ? (
                <motion.g
                  animate={{ opacity: [0.7, 0.4, 0.7] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {bar}
                </motion.g>
              ) : bar}

              {/* Peak cap line (sharp top) */}
              <line x1={p.x} y1={p.y} x2={p.x + p.w} y2={p.y}
                stroke={barColor} strokeWidth="0.5" opacity={online ? 0.6 : 0.1} />

              {/* m/z label below x-axis */}
              <text x={p.x + p.w / 2} y={chartBot + 5} textAnchor="middle"
                fill={color} fontSize="2.8" fontFamily={MONO} opacity={0.25}>
                {p.mz}
              </text>
            </g>
          );
        })}

        {/* Base peak indicator (small diamond above tallest peak) */}
        {peaks.filter(p => p.isBase && p.h > 2).map(p => (
          <text key="base" x={p.x + p.w / 2} y={p.y - 2} textAnchor="middle"
            fill={color} fontSize="3" fontFamily={MONO} opacity={0.4}>
            *
          </text>
        ))}

        {/* Percentage readout */}
        <text x={chartR - 2} y={chartTop + 4} textAnchor="end"
          fill={color} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.7}>
          {level.toFixed(0)}%
        </text>

        {/* Title */}
        <text x={chartL + chartW / 2} y={7} textAnchor="middle" fill={color}
          fontSize="4" fontFamily={MONO} opacity={0.35} letterSpacing="0.08em">
          MASS SPECTRUM
        </text>

        {/* Online dot */}
        <circle cx={93} cy={93} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default MassSpectrometer;
