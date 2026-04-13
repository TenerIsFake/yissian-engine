import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * StellarCoreMonitor — SPACE-mode replacement for CoordComplex.
 * Shows a star cross-section with 4 concentric layers (core → radiative → convective → photosphere).
 * Layers light up progressively with load level. Corona flares appear above 80%.
 *
 * Props match CoordComplex interface for drop-in compatibility:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 *
 * - metal: 'Fe'|'Cu' → CPU hue range (200→0, blue→red); 'Co'|'Ni' → RAM hue range (160→30, teal→amber)
 * - lowSpin: triggers "Active" state label (corona flares at lower threshold)
 */
const StellarCoreMonitor = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
  const color      = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.35)` : 'rgba(107,114,128,0.35)';

  const act = level / 100;
  const flareThreshold = lowSpin ? 65 : 80;
  const showFlares = level > flareThreshold && online;

  // Which layers are active (from core outward)
  const layerCount = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;

  const LAYERS = [
    { r: 10, label: 'CORE',  opBase: 0.6 },
    { r: 20, label: 'RAD',   opBase: 0.35 },
    { r: 30, label: 'CONV',  opBase: 0.25 },
    { r: 40, label: 'PHOTO', opBase: 0.15 },
  ];

  const activityLabel = isCpu
    ? (lowSpin ? 'Active — High Load' : 'Quiescent')
    : (lowSpin ? 'Active — High Pressure' : 'Quiescent');

  const stellarClass = level < 25 ? 'M (Red Dwarf)' : level < 50 ? 'G (Main Seq.)' : level < 75 ? 'A (Blue-White)' : 'O (Supergiant)';

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
            STELLAR_CORE ◆ {isCpu ? 'FUSION_RATE' : 'ENVELOPE'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Active' : 'Quiescent'} · {stellarClass}
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
            <radialGradient key={i} id={`${gradId}-layer-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity={i < layerCount ? layer.opBase + act * 0.3 : 0.02} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>

        {/* Layer fills — outer to inner so inner draws on top */}
        {[...LAYERS].reverse().map((layer, ri) => {
          const i = LAYERS.length - 1 - ri;
          const isActive = i < layerCount;
          const fillOpacity = isActive ? layer.opBase + act * 0.2 : 0.02;
          return prefersReducedMotion || !isActive ? (
            <circle key={`fill-${i}`} cx={50} cy={50} r={layer.r}
              fill={`url(#${gradId}-layer-${i})`} opacity={fillOpacity} />
          ) : (
            <motion.circle key={`fill-${i}`} cx={50} cy={50} r={layer.r}
              fill={`url(#${gradId}-layer-${i})`}
              animate={{ scale: [1, 1.02, 1], opacity: [fillOpacity, fillOpacity * 1.15, fillOpacity] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
              style={{ transformOrigin: '50px 50px' }}
            />
          );
        })}

        {/* Layer boundary rings */}
        {LAYERS.map((layer, i) => (
          <circle key={`ring-${i}`} cx={50} cy={50} r={layer.r}
            fill="none" stroke={color}
            strokeWidth={i < layerCount ? 0.8 : 0.4}
            opacity={i < layerCount ? 0.4 : 0.08} />
        ))}

        {/* Core bright center */}
        <circle cx={50} cy={50} r={6}
          fill={online ? color : '#374151'}
          opacity={online ? 0.85 + act * 0.15 : 0.4}
          style={{ filter: online ? `drop-shadow(0 0 ${3 + act * 8}px ${color})` : 'none' }} />

        {/* Layer labels (right side) */}
        {LAYERS.map((layer, i) => (
          i < layerCount && (
            <text key={`lbl-${i}`} x={50 + layer.r + 4} y={50 - layer.r + 6}
              fill={color} fontSize="4" fontFamily={MONO} opacity={0.4}>
              {layer.label}
            </text>
          )
        ))}

        {/* Corona flares at >80% (or >65% if lowSpin/active) */}
        {showFlares && [0, 90, 180, 270].map((angle, fi) => {
          const rad = (angle * Math.PI) / 180;
          const fx = 50 + Math.cos(rad) * 42;
          const fy = 50 - Math.sin(rad) * 42;
          const flareScale = (level - flareThreshold) / (100 - flareThreshold);
          const flareEl = (
            <path
              d={`M ${fx},${fy} Q ${fx + Math.cos(rad) * 4},${fy - Math.sin(rad) * 4 - 2} ${fx + Math.cos(rad) * 8},${fy - Math.sin(rad) * 8}`}
              stroke={color} strokeWidth={1.5 * flareScale} fill="none"
              opacity={0.4 + flareScale * 0.4}
              style={{ filter: `drop-shadow(0 0 3px ${color})` }}
            />
          );
          return prefersReducedMotion ? (
            <g key={`flare-${fi}`}>{flareEl}</g>
          ) : (
            <motion.g key={`flare-${fi}`}
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: fi * 0.4 }}
              style={{ transformOrigin: `${fx}px ${fy}px` }}
            >
              {flareEl}
            </motion.g>
          );
        })}

        {/* Percentage readout */}
        <text x={50} y={62} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{stellarClass}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Active' : 'Quiescent'} | {activityLabel}
      </div>
    </div>
  );
};

export default StellarCoreMonitor;
