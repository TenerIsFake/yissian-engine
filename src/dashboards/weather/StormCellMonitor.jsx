import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * StormCellMonitor — WEATHER-mode CPU diagram (replaces CoordComplex).
 * Vertical atmospheric cross-section with 4 layers that activate bottom→up.
 * At critical load (>80%, or >65% if lowSpin): cumulonimbus anvil + lightning bolts.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const StormCellMonitor = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
    ? 200 - (level / 100) * 200   // CPU: 200 (blue) → 0 (red)
    : 160 - (level / 100) * 130;  // RAM: 160 (teal) → 30 (amber)
  const color      = online ? `hsl(${hue}, 80%, 55%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 80%, 55%, 0.35)` : 'rgba(107,114,128,0.35)';

  const act = level / 100;
  const flareThreshold = lowSpin ? 65 : 80;
  const showStorm = level > flareThreshold && online;

  // 4 atmospheric layers (bottom → top)
  const layerCount = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;
  const LAYERS = [
    { y: 70, h: 16, label: 'SURFACE',   opBase: 0.5 },
    { y: 52, h: 18, label: 'TROPO',     opBase: 0.35 },
    { y: 34, h: 18, label: 'STRATO',    opBase: 0.25 },
    { y: 16, h: 18, label: 'MESO',      opBase: 0.15 },
  ];

  const severityLabel = level < 25 ? 'Calm' : level < 50 ? 'Fair' : level < 75 ? 'Unsettled' : 'Severe';

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
            STORM_CELL ◆ {isCpu ? 'PRESSURE' : 'HUMIDITY'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Active' : 'Quiescent'} · {severityLabel}
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
            <linearGradient key={i} id={`${gradId}-layer-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={i < layerCount ? layer.opBase + act * 0.25 : 0.02} />
              <stop offset="100%" stopColor={color} stopOpacity={i < layerCount ? layer.opBase * 0.5 : 0.01} />
            </linearGradient>
          ))}
        </defs>

        {/* Ground line */}
        <line x1={15} y1={86} x2={85} y2={86} stroke={color} strokeWidth="1" opacity={0.3} />

        {/* Layer fills (bottom → top) */}
        {LAYERS.map((layer, i) => {
          const isActive = i < layerCount;
          const baseOp = isActive ? layer.opBase + act * 0.15 : 0.02;
          return prefersReducedMotion || !isActive ? (
            <rect key={`fill-${i}`} x={20} y={layer.y} width={60} height={layer.h}
              fill={`url(#${gradId}-layer-${i})`} opacity={baseOp} rx={2} />
          ) : (
            <motion.rect key={`fill-${i}`} x={20} y={layer.y} width={60} height={layer.h}
              fill={`url(#${gradId}-layer-${i})`} rx={2}
              animate={{ opacity: [baseOp, baseOp * 1.2, baseOp] }}
              transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            />
          );
        })}

        {/* Layer boundary lines */}
        {LAYERS.map((layer, i) => (
          <line key={`line-${i}`} x1={20} y1={layer.y} x2={80} y2={layer.y}
            stroke={color} strokeWidth={i < layerCount ? 0.6 : 0.3}
            opacity={i < layerCount ? 0.35 : 0.08}
            strokeDasharray={i < layerCount ? 'none' : '2 3'} />
        ))}

        {/* Layer labels (right side) */}
        {LAYERS.map((layer, i) => (
          i < layerCount && (
            <text key={`lbl-${i}`} x={83} y={layer.y + layer.h / 2 + 2}
              fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.4}>
              {layer.label}
            </text>
          )
        ))}

        {/* Cumulonimbus anvil at critical */}
        {showStorm && (() => {
          const stormScale = (level - flareThreshold) / (100 - flareThreshold);
          const anvil = (
            <g>
              {/* Anvil cloud top */}
              <path d={`M 30,${18 - stormScale * 4} Q 40,${10 - stormScale * 6} 50,${12 - stormScale * 5} Q 60,${10 - stormScale * 6} 70,${18 - stormScale * 4}`}
                fill={color} opacity={0.15 + stormScale * 0.15} />
              <path d={`M 30,${18 - stormScale * 4} Q 40,${10 - stormScale * 6} 50,${12 - stormScale * 5} Q 60,${10 - stormScale * 6} 70,${18 - stormScale * 4}`}
                fill="none" stroke={color} strokeWidth="0.8" opacity={0.4 + stormScale * 0.3} />

              {/* Lightning bolts */}
              <path d={`M 42,40 L 38,55 L 43,53 L 39,68`}
                stroke={color} strokeWidth={1.2 * stormScale} fill="none"
                opacity={0.5 + stormScale * 0.4}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
              <path d={`M 58,35 L 62,50 L 57,48 L 61,62`}
                stroke={color} strokeWidth={1 * stormScale} fill="none"
                opacity={0.4 + stormScale * 0.3}
                style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
            </g>
          );
          return prefersReducedMotion ? anvil : (
            <motion.g
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {anvil}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={95} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{severityLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Active' : 'Quiescent'}
      </div>
    </div>
  );
};

export default StormCellMonitor;
