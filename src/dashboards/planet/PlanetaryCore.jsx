import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * PlanetaryCore — PLANET-mode CPU diagram (replaces CoordComplex).
 * Cutaway of a rocky planet showing 4 concentric layers:
 * INNER CORE → OUTER CORE → MANTLE → CRUST.
 * Layers glow outward with load. Critical: crust fractures, lava seeping.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, lowSpin, size
 */
const PlanetaryCore = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
    ? 30 - (level / 100) * 25    // CPU: 30 (warm amber) → 5 (deep red)
    : 200 - (level / 100) * 160;  // RAM: 200 (blue) → 40 (orange)
  const color = online ? `hsl(${hue}, 80%, ${45 + (level / 100) * 20}%)` : '#6b7280';

  const act = level / 100;
  const critThreshold = lowSpin ? 65 : 80;
  const showCritical = level > critThreshold && online;

  const layerCount = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;

  const LAYERS = [
    { r: 8,  label: 'INNER',  opBase: 0.6, hueShift: 0 },
    { r: 16, label: 'OUTER',  opBase: 0.4, hueShift: 10 },
    { r: 26, label: 'MANTLE', opBase: 0.25, hueShift: 20 },
    { r: 36, label: 'CRUST',  opBase: 0.12, hueShift: 30 },
  ];

  const heatLabel = level < 25 ? 'Cool' : level < 50 ? 'Warm' : level < 75 ? 'Hot' : 'Molten';

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
            CORE ◆ {isCpu ? 'HEAT' : 'PRESSURE'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Active' : 'Dormant'} · {heatLabel}
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
          {LAYERS.map((layer, i) => (
            <radialGradient key={i} id={`${gradId}-layer-${i}`}>
              <stop offset="0%" stopColor={`hsl(${hue + layer.hueShift}, 80%, 55%)`}
                stopOpacity={i < layerCount ? layer.opBase + act * 0.3 : 0.02} />
              <stop offset="100%" stopColor={`hsl(${hue + layer.hueShift}, 70%, 35%)`}
                stopOpacity={i < layerCount ? layer.opBase * 0.4 : 0.01} />
            </radialGradient>
          ))}
        </defs>

        {/* Cutaway clip — show right 3/4 of planet as full, left 1/4 as cross-section */}
        {/* Planet outline (full circle) */}
        <circle cx={50} cy={46} r={37} fill="none"
          stroke={color} strokeWidth="0.8" opacity={0.2} />

        {/* Layer fills — concentric circles, drawn outer to inner */}
        {[...LAYERS].reverse().map((layer, ri) => {
          const i = LAYERS.length - 1 - ri;
          const isActive = i < layerCount;
          const baseOp = isActive ? layer.opBase + act * 0.12 : 0.02;

          return prefersReducedMotion || !isActive ? (
            <circle key={`layer-${i}`} cx={50} cy={46} r={layer.r}
              fill={`url(#${gradId}-layer-${i})`} opacity={baseOp} />
          ) : (
            <motion.circle key={`layer-${i}`} cx={50} cy={46} r={layer.r}
              fill={`url(#${gradId}-layer-${i})`}
              animate={{ opacity: [baseOp, baseOp * 1.3, baseOp] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            />
          );
        })}

        {/* Layer boundary rings */}
        {LAYERS.map((layer, i) => (
          <circle key={`ring-${i}`} cx={50} cy={46} r={layer.r}
            fill="none" stroke={color}
            strokeWidth={i < layerCount ? 0.6 : 0.2}
            opacity={i < layerCount ? 0.3 : 0.06}
            strokeDasharray={i === LAYERS.length - 1 ? 'none' : '2 2'} />
        ))}

        {/* Layer labels (right side) */}
        {LAYERS.map((layer, i) => (
          i < layerCount && (
            <text key={`llbl-${i}`} x={50 + layer.r + 3} y={46 + 1.5}
              fill={color} fontSize="3" fontFamily={MONO} opacity={0.35}>
              {layer.label}
            </text>
          )
        ))}

        {/* Heat radiation lines from core */}
        {layerCount >= 2 && online && (
          <g opacity={0.1 + act * 0.15}>
            {[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = angle * Math.PI / 180;
              const x1 = 50 + 10 * Math.cos(rad);
              const y1 = 46 + 10 * Math.sin(rad);
              const x2 = 50 + (14 + act * 6) * Math.cos(rad);
              const y2 = 46 + (14 + act * 6) * Math.sin(rad);
              return (
                <line key={`heat-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color} strokeWidth="0.5" strokeLinecap="round" />
              );
            })}
          </g>
        )}

        {/* Mantle convection currents (subtle curved arrows) */}
        {layerCount >= 3 && online && (
          <g opacity={0.08 + act * 0.06}>
            <path d="M 38,36 Q 32,46 38,56" fill="none" stroke={color} strokeWidth="0.5" />
            <path d="M 62,36 Q 68,46 62,56" fill="none" stroke={color} strokeWidth="0.5" />
          </g>
        )}

        {/* Crust fractures + lava at critical */}
        {showCritical && online && (() => {
          const critScale = (level - critThreshold) / (100 - critThreshold);
          const fractures = (
            <g>
              {/* Crust crack lines */}
              <path d="M 30,30 L 33,34 L 31,38" stroke={color} strokeWidth="0.7"
                fill="none" opacity={0.4 + critScale * 0.4} />
              <path d="M 68,32 L 65,36 L 67,41" stroke={color} strokeWidth="0.6"
                fill="none" opacity={0.35 + critScale * 0.35} />
              <path d="M 42,14 L 44,18 L 41,22" stroke={color} strokeWidth="0.5"
                fill="none" opacity={0.3 + critScale * 0.3} />
              <path d="M 55,75 L 53,71 L 56,68" stroke={color} strokeWidth="0.6"
                fill="none" opacity={0.35 + critScale * 0.3} />
              {/* Lava seeping through cracks */}
              <circle cx={32} cy={36} r={1} fill={color}
                opacity={0.3 + critScale * 0.4}
                style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
              <circle cx={66} cy={38} r={0.8} fill={color}
                opacity={0.25 + critScale * 0.3}
                style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
              {/* Seismic wave ripple */}
              <circle cx={50} cy={46} r={40} fill="none"
                stroke={color} strokeWidth="0.4"
                opacity={0.05 + critScale * 0.1} />
            </g>
          );
          return prefersReducedMotion ? fractures : (
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              {fractures}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{heatLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Active' : 'Dormant'}
      </div>
    </div>
  );
};

export default PlanetaryCore;
