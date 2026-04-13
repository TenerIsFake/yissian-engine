import React, { useState, useId, useMemo } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * WaveformEQ — VINYL-mode Speedtest diagram.
 * Audio spectrum analyzer with bouncing vertical frequency bars,
 * green-to-yellow-to-red gradient, and peak hold dots.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const WaveformEQ = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
    ? 200 - (level / 100) * 200
    : 160 - (level / 100) * 130;
  const color = online ? `hsl(${hue}, 80%, 55%)` : '#6b7280';

  const act = level / 100;
  const barCount = 14;
  const barGap = 1.2;
  const chartLeft = 10;
  const chartRight = 90;
  const chartBottom = 82;
  const chartTop = 16;
  const chartH = chartBottom - chartTop;
  const totalBarSpace = chartRight - chartLeft;
  const barW = (totalBarSpace - (barCount - 1) * barGap) / barCount;

  // Generate deterministic bar heights modulated by level
  // Each bar has a base pattern, then scaled by act
  const barSeeds = useMemo(() => {
    const seeds = [];
    for (let i = 0; i < barCount; i++) {
      // Bell curve-ish distribution centered around bar 5-8
      const center = barCount * 0.45;
      const dist = Math.abs(i - center) / center;
      const base = 0.3 + 0.7 * Math.max(0, 1 - dist * dist);
      // Add some variance per bar
      const variance = Math.sin(i * 2.7 + 1.3) * 0.2;
      seeds.push(Math.max(0.1, Math.min(1, base + variance)));
    }
    return seeds;
  }, []);

  const bars = barSeeds.map((seed, i) => {
    const height = seed * act * chartH;
    const x = chartLeft + i * (barW + barGap);
    const y = chartBottom - height;
    const heightPct = height / chartH;
    return { x, y, height, heightPct, index: i };
  });

  // Color per bar segment based on height
  const barColor = (heightPct) => {
    if (heightPct >= 0.83) return 'hsl(0, 85%, 55%)';    // red
    if (heightPct >= 0.6)  return 'hsl(45, 90%, 55%)';   // yellow
    return 'hsl(120, 70%, 45%)';                           // green
  };

  // Peak hold dot is slightly above bar top
  const peakOffset = 3;

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
            SPECTRUM ◆ SPEED
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
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="hsl(120, 70%, 45%)" />
            <stop offset="60%" stopColor="hsl(45, 90%, 55%)" />
            <stop offset="100%" stopColor="hsl(0, 85%, 55%)" />
          </linearGradient>
        </defs>

        {/* Backplate */}
        <rect x={4} y={6} width={92} height={88} rx={4} ry={4}
          fill="rgba(15,15,20,0.7)"
          stroke={color} strokeWidth="0.5" opacity={0.2} />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(pct => {
          const gy = chartBottom - pct * chartH;
          return (
            <line key={pct} x1={chartLeft} y1={gy} x2={chartRight} y2={gy}
              stroke={color} strokeWidth="0.2" opacity={0.1} strokeDasharray="2,2" />
          );
        })}

        {/* Baseline */}
        <line x1={chartLeft} y1={chartBottom} x2={chartRight} y2={chartBottom}
          stroke={color} strokeWidth="0.4" opacity={0.2} />

        {/* Frequency bars */}
        {bars.map((bar) => {
          const bColor = online ? barColor(bar.heightPct) : '#6b7280';
          const barRect = (
            <g key={bar.index}>
              <rect
                x={bar.x}
                y={bar.y}
                width={barW}
                height={Math.max(bar.height, 0.5)}
                rx={0.5}
                fill={online ? `url(#${gradId})` : '#4b5563'}
                opacity={online ? 0.7 + bar.heightPct * 0.3 : 0.15}
                style={online ? { filter: `drop-shadow(0 0 1px ${bColor})` } : {}}
              />
              {/* Peak hold dot */}
              {bar.height > 2 && (
                <rect
                  x={bar.x}
                  y={bar.y - peakOffset}
                  width={barW}
                  height={1}
                  rx={0.5}
                  fill={bColor}
                  opacity={online ? 0.8 : 0.1}
                />
              )}
            </g>
          );

          // Animate bars when online
          if (online && !prefersReducedMotion && bar.height > 1) {
            const bounce = bar.heightPct * 4;
            return (
              <motion.g key={bar.index}
                animate={{
                  y: [-bounce, bounce * 0.5, -bounce * 0.3, bounce * 0.2, 0],
                }}
                transition={{
                  duration: 1.2 + bar.index * 0.08,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: bar.index * 0.06,
                }}
              >
                <rect
                  x={bar.x}
                  y={bar.y}
                  width={barW}
                  height={Math.max(bar.height, 0.5)}
                  rx={0.5}
                  fill={`url(#${gradId})`}
                  opacity={0.7 + bar.heightPct * 0.3}
                  style={{ filter: `drop-shadow(0 0 1px ${bColor})` }}
                />
                {bar.height > 2 && (
                  <rect
                    x={bar.x}
                    y={bar.y - peakOffset}
                    width={barW}
                    height={1}
                    rx={0.5}
                    fill={bColor}
                    opacity={0.8}
                  />
                )}
              </motion.g>
            );
          }
          return barRect;
        })}

        {/* Title label */}
        <text x={50} y={12} textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.35} letterSpacing="0.2em">
          SPECTRUM ANALYZER
        </text>

        {/* Percentage readout */}
        <text x={50} y={94} textAnchor="middle" fill={color} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default WaveformEQ;
