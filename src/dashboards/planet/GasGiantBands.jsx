import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * GasGiantBands — PLANET-mode RAM diagram (replaces CoordComplex).
 * Face-on view of a gas giant (Jupiter-like). Horizontal cloud bands fill
 * in as RAM increases: equatorial belt first, then temperate, then polar.
 * Great Red Spot analogue pulses at high load. Critical: storm vortex.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, lowSpin, size
 */
const GasGiantBands = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
    ? 30 - (level / 100) * 25
    : 200 - (level / 100) * 160;
  const color = online ? `hsl(${hue}, 80%, ${45 + (level / 100) * 20}%)` : '#6b7280';

  const act = level / 100;
  const showStorm = level > 75 && online;
  const showCritical = level > 85 && online;

  // Bands fill in groups: equatorial (1), temperate (2-3), polar (4-5)
  const bandGroupCount = level <= 25 ? 1 : level <= 50 ? 3 : level <= 75 ? 5 : 7;

  // Cloud bands — positioned relative to planet center (y=46)
  const BANDS = [
    { dy: -2,  h: 4,  label: 'EQ',   group: 1 },  // Equatorial belt
    { dy: -8,  h: 4,  label: 'NTB',  group: 2 },  // North temperate
    { dy: 4,   h: 4,  label: 'STB',  group: 2 },  // South temperate
    { dy: -14, h: 4,  label: 'NEB',  group: 3 },  // North equatorial
    { dy: 10,  h: 4,  label: 'SEB',  group: 3 },  // South equatorial
    { dy: -20, h: 5,  label: 'NPC',  group: 4 },  // North polar cap
    { dy: 16,  h: 5,  label: 'SPC',  group: 4 },  // South polar cap
  ];

  const pressureLabel = level < 25 ? 'Low' : level < 50 ? 'Rising' : level < 75 ? 'High' : 'Extreme';

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
            GAS_GIANT ◆ {isCpu ? 'CORE' : 'ATMO'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {bandGroupCount} bands · {pressureLabel}
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
          <clipPath id={`${gradId}-planet`}>
            <circle cx={50} cy={46} r={32} />
          </clipPath>
          {BANDS.map((band, i) => (
            <linearGradient key={i} id={`${gradId}-band-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.05} />
              <stop offset="30%" stopColor={color} stopOpacity={i < bandGroupCount ? 0.15 + act * 0.15 : 0.02} />
              <stop offset="70%" stopColor={color} stopOpacity={i < bandGroupCount ? 0.12 + act * 0.12 : 0.02} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>

        {/* Planet body */}
        <circle cx={50} cy={46} r={32} fill={color} opacity={0.04}
          stroke={color} strokeWidth="0.8" />

        {/* Cloud bands (clipped to planet circle) */}
        <g clipPath={`url(#${gradId}-planet)`}>
          {BANDS.map((band, i) => {
            const isActive = i < bandGroupCount;
            const by = 46 + band.dy;
            const baseOp = isActive ? 0.12 + act * 0.15 : 0.02;

            return prefersReducedMotion || !isActive ? (
              <rect key={`band-${i}`} x={18} y={by} width={64} height={band.h}
                fill={`url(#${gradId}-band-${i})`} opacity={baseOp} />
            ) : (
              <motion.rect key={`band-${i}`} x={18} y={by} width={64} height={band.h}
                fill={`url(#${gradId}-band-${i})`}
                animate={{ opacity: [baseOp, baseOp * 1.25, baseOp] }}
                transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
              />
            );
          })}

          {/* Band edge lines */}
          {BANDS.map((band, i) => (
            i < bandGroupCount && (
              <React.Fragment key={`edge-${i}`}>
                <line x1={20} y1={46 + band.dy} x2={80} y2={46 + band.dy}
                  stroke={color} strokeWidth="0.3" opacity={0.08} />
                <line x1={20} y1={46 + band.dy + band.h} x2={80} y2={46 + band.dy + band.h}
                  stroke={color} strokeWidth="0.3" opacity={0.08} />
              </React.Fragment>
            )
          ))}

          {/* Great Red Spot (appears at >75%) */}
          {showStorm && (() => {
            const stormScale = Math.min(1, (level - 75) / 25);
            const spotR = 4 + stormScale * 3;
            const spot = (
              <ellipse cx={58} cy={50} rx={spotR} ry={spotR * 0.6}
                fill={color} opacity={0.15 + stormScale * 0.2}
                stroke={color} strokeWidth="0.4"
                style={showCritical ? { filter: `drop-shadow(0 0 2px ${color})` } : {}} />
            );
            return prefersReducedMotion ? spot : (
              <motion.g
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {spot}
              </motion.g>
            );
          })()}

          {/* Storm vortex at critical */}
          {showCritical && (
            <g opacity={0.1 + ((level - 85) / 15) * 0.15}>
              <ellipse cx={58} cy={50} rx={10} ry={6}
                fill="none" stroke={color} strokeWidth="0.4"
                style={{ filter: `blur(1px)` }} />
              {/* Lightning in cloud deck */}
              <path d="M 35,40 L 37,43 L 34,43 L 36,46"
                stroke={color} strokeWidth="0.5" fill="none" opacity={0.4} />
              <path d="M 62,36 L 64,39 L 61,39 L 63,42"
                stroke={color} strokeWidth="0.4" fill="none" opacity={0.3} />
            </g>
          )}
        </g>

        {/* Band labels (right side, outside planet) */}
        {BANDS.filter((_, i) => i < bandGroupCount && i < 3).map((band, i) => (
          <text key={`blbl-${i}`} x={84} y={46 + band.dy + band.h / 2 + 1}
            fill={color} fontSize="2.8" fontFamily={MONO} opacity={0.3}>
            {band.label}
          </text>
        ))}

        {/* Subtle limb darkening (edge shadow) */}
        <circle cx={50} cy={46} r={32} fill="none"
          stroke={color} strokeWidth="2" opacity={0.04} />

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{pressureLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        Atmo Pressure
      </div>
    </div>
  );
};

export default GasGiantBands;
