import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * MemoryBank -- NEURAL-mode Storage diagram.
 * Stack of horizontal memory layers (like RAM sticks in a slot).
 * Layers fill from bottom up proportional to level.
 * Activity LEDs blink when near capacity. Electrostatic discharge at >90%.
 *
 * Props match CoordComplex/StellarCoreMonitor interface.
 */
const MemoryBank = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller = false, lowSpin = false, size = 88 }) => {
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
  const color = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.15)` : 'rgba(107,114,128,0.08)';

  const act = level / 100;

  // 8 memory layers stacked vertically
  const LAYER_COUNT = 8;
  const filledLayers = Math.ceil(act * LAYER_COUNT);
  const layerH = 7;
  const layerW = 60;
  const startY = 18;
  const startX = 20;

  const showDischarge = level > 90 && online;

  const storageLabel = level < 25 ? 'LOW' : level < 50 ? 'MODERATE' : level < 75 ? 'HIGH' : level < 90 ? 'NEAR FULL' : 'CRITICAL';

  // Spark lines for electrostatic discharge effect
  const sparks = [];
  if (showDischarge) {
    for (let i = 0; i < 4; i++) {
      const sx = startX + 10 + Math.random() * 40;
      const sy = startY + 2 + Math.random() * (LAYER_COUNT * (layerH + 2));
      const ex = sx + (Math.random() - 0.5) * 16;
      const ey = sy + (Math.random() - 0.5) * 10;
      const mx = (sx + ex) / 2 + (Math.random() - 0.5) * 8;
      const my = (sy + ey) / 2 + (Math.random() - 0.5) * 6;
      sparks.push({ d: `M${sx},${sy} L${mx},${my} L${ex},${ey}`, key: i });
    }
  }

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
            MEMORY_BANK {'\u25C6'} STORAGE
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {storageLabel} {'\u00B7'} {filledLayers}/{LAYER_COUNT} banks
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% -- ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          <linearGradient id={`${gradId}-layer-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="50%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
        </defs>

        {/* Slot housing outline */}
        <rect x={startX - 3} y={startY - 4} width={layerW + 6} height={LAYER_COUNT * (layerH + 2) + 6}
          rx={3} fill="none" stroke={color} strokeWidth={0.5} opacity={0.12} />

        {/* Memory layers -- bottom up */}
        {Array.from({ length: LAYER_COUNT }).map((_, i) => {
          const layerIdx = LAYER_COUNT - 1 - i; // bottom = 0
          const isFilled = layerIdx < filledLayers;
          const y = startY + i * (layerH + 2);
          const isNearCap = isFilled && layerIdx >= filledLayers - 1 && level > 75;

          const layerEl = (
            <g key={i}>
              {/* Layer background */}
              <rect x={startX} y={y} width={layerW} height={layerH}
                rx={1.5}
                fill={isFilled && online ? `url(#${gradId}-layer-fill)` : 'rgba(255,255,255,0.02)'}
                stroke={color}
                strokeWidth={isFilled ? 0.6 : 0.3}
                opacity={isFilled && online ? 0.6 + act * 0.3 : 0.08}
              />

              {/* Chip notches on the layer */}
              {isFilled && online && [0.2, 0.4, 0.6, 0.8].map((t, ci) => (
                <rect key={ci}
                  x={startX + layerW * t - 1.5} y={y + 1}
                  width={3} height={layerH - 2}
                  rx={0.5}
                  fill={color} opacity={0.15}
                />
              ))}

              {/* Activity LED */}
              <circle cx={startX + layerW + 5} cy={y + layerH / 2}
                r={1.5}
                fill={isFilled && online ? color : '#374151'}
                opacity={isFilled && online ? 0.6 : 0.1}
              />
            </g>
          );

          // Blink the LED when near capacity
          if (isNearCap && online && !prefersReducedMotion) {
            return (
              <g key={`anim-${i}`}>
                <rect x={startX} y={y} width={layerW} height={layerH}
                  rx={1.5}
                  fill={`url(#${gradId}-layer-fill)`}
                  stroke={color} strokeWidth={0.6}
                  opacity={0.6 + act * 0.3}
                />
                {[0.2, 0.4, 0.6, 0.8].map((t, ci) => (
                  <rect key={ci}
                    x={startX + layerW * t - 1.5} y={y + 1}
                    width={3} height={layerH - 2}
                    rx={0.5}
                    fill={color} opacity={0.15}
                  />
                ))}
                <motion.circle cx={startX + layerW + 5} cy={y + layerH / 2}
                  r={1.5}
                  fill={color}
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </g>
            );
          }

          return layerEl;
        })}

        {/* Electrostatic discharge sparks at >90% */}
        {showDischarge && sparks.map((spark) => (
          !prefersReducedMotion ? (
            <motion.path key={spark.key}
              d={spark.d}
              fill="none" stroke={color} strokeWidth={0.8}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 2px ${color})` }}
              animate={{ opacity: [0, 0.8, 0], pathLength: [0, 1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: 'easeOut', delay: spark.key * 0.3 }}
            />
          ) : (
            <path key={spark.key} d={spark.d}
              fill="none" stroke={color} strokeWidth={0.8} opacity={0.4} />
          )
        ))}

        {/* Bank index labels */}
        {Array.from({ length: LAYER_COUNT }).map((_, i) => {
          const y = startY + i * (layerH + 2) + layerH / 2 + 1.5;
          return (
            <text key={`lbl-${i}`} x={startX - 1} y={y}
              textAnchor="end" fill={color} fontSize="3" fontFamily={MONO}
              opacity={0.2}>
              B{LAYER_COUNT - 1 - i}
            </text>
          );
        })}

        {/* Percentage readout */}
        <text x={50} y={94} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{storageLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {filledLayers}/{LAYER_COUNT} banks | {level > 90 ? 'DISCHARGE RISK' : 'Nominal'}
      </div>
    </div>
  );
};

export default MemoryBank;
