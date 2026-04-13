import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BlastFurnace — FORGE-mode CPU diagram (replaces CoordComplex).
 * Vertical brick furnace cross-section with 4 heat zones (hearth → bosh → stack → throat).
 * Zones glow bottom-up with load. Critical: molten drips + flames at top.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const BlastFurnace = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
    ? 30 - (level / 100) * 20   // CPU: 30 (warm amber) → 10 (deep red-orange)
    : 40 - (level / 100) * 25;  // RAM: 40 (gold) → 15 (orange)
  const color = online ? `hsl(${hue}, 90%, ${45 + (level / 100) * 20}%)` : '#6b7280';

  const act = level / 100;
  const flareThreshold = lowSpin ? 65 : 80;
  const showFlames = level > flareThreshold && online;

  const layerCount = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;

  // Furnace shape — tapered brick structure
  const furnaceLeft = 28, furnaceRight = 72;
  const ZONES = [
    { y: 68, h: 14, label: 'HEARTH', opBase: 0.55, taper: 0 },
    { y: 54, h: 14, label: 'BOSH',   opBase: 0.4,  taper: 2 },
    { y: 40, h: 14, label: 'STACK',  opBase: 0.25, taper: 4 },
    { y: 26, h: 14, label: 'THROAT', opBase: 0.15, taper: 6 },
  ];

  const heatLabel = level < 25 ? 'Cold' : level < 50 ? 'Warm' : level < 75 ? 'Hot' : 'White-Hot';

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
            BLAST_FURNACE ◆ {isCpu ? 'TEMP' : 'CRUCIBLE'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Active' : 'Quiescent'} · {heatLabel}
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
          {ZONES.map((zone, i) => (
            <linearGradient key={i} id={`${gradId}-zone-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={i < layerCount ? zone.opBase + act * 0.3 : 0.02} />
              <stop offset="100%" stopColor={color} stopOpacity={i < layerCount ? zone.opBase * 0.6 + act * 0.2 : 0.01} />
            </linearGradient>
          ))}
        </defs>

        {/* Brick outer walls */}
        <path d={`M ${furnaceLeft},82 L ${furnaceLeft},26 L ${furnaceLeft + 6},20 L ${furnaceRight - 6},20 L ${furnaceRight},26 L ${furnaceRight},82 Z`}
          fill="none" stroke={color} strokeWidth="1.2" opacity={0.25} />

        {/* Zone fills */}
        {ZONES.map((zone, i) => {
          const isActive = i < layerCount;
          const left = furnaceLeft + 1 + zone.taper;
          const right = furnaceRight - 1 - zone.taper;
          const baseOp = isActive ? zone.opBase + act * 0.15 : 0.02;
          return prefersReducedMotion || !isActive ? (
            <rect key={`zone-${i}`} x={left} y={zone.y} width={right - left} height={zone.h}
              fill={`url(#${gradId}-zone-${i})`} opacity={baseOp} />
          ) : (
            <motion.rect key={`zone-${i}`} x={left} y={zone.y} width={right - left} height={zone.h}
              fill={`url(#${gradId}-zone-${i})`}
              animate={{ opacity: [baseOp, baseOp * 1.25, baseOp] }}
              transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          );
        })}

        {/* Zone boundary lines (brick courses) */}
        {ZONES.map((zone, i) => (
          <line key={`bline-${i}`}
            x1={furnaceLeft + 1 + zone.taper} y1={zone.y}
            x2={furnaceRight - 1 - zone.taper} y2={zone.y}
            stroke={color} strokeWidth={i < layerCount ? 0.6 : 0.3}
            opacity={i < layerCount ? 0.3 : 0.08} />
        ))}

        {/* Brick hatch texture (horizontal courses) */}
        {[30, 38, 46, 54, 62, 70, 78].map(y => (
          <line key={`brick-${y}`} x1={furnaceLeft + 2} y1={y} x2={furnaceRight - 2} y2={y}
            stroke={color} strokeWidth="0.2" opacity={0.06} strokeDasharray="4 3" />
        ))}

        {/* Zone labels (right side) */}
        {ZONES.map((zone, i) => (
          i < layerCount && (
            <text key={`zlbl-${i}`} x={furnaceRight + 3} y={zone.y + zone.h / 2 + 2}
              fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.4}>
              {zone.label}
            </text>
          )
        ))}

        {/* Tap hole (bottom center) */}
        <rect x={46} y={80} width={8} height={4} rx={1}
          fill={online ? color : '#374151'} opacity={online ? 0.3 + act * 0.3 : 0.1} />

        {/* Molten drips at critical */}
        {showFlames && online && (() => {
          const flameScale = (level - flareThreshold) / (100 - flareThreshold);
          const flames = (
            <g>
              {/* Flames licking from throat */}
              <path d={`M 40,26 Q 42,18 44,22 Q 46,14 48,20 Q 50,12 52,20 Q 54,14 56,22 Q 58,18 60,26`}
                fill={color} opacity={0.2 + flameScale * 0.3}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
              {/* Molten drip from tap hole */}
              <path d={`M 50,84 Q 49,88 50,92`}
                stroke={color} strokeWidth={1.5 * flameScale} fill="none"
                opacity={0.5 + flameScale * 0.4}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
            </g>
          );
          return prefersReducedMotion ? flames : (
            <motion.g
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              {flames}
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
        {lowSpin ? 'Active' : 'Quiescent'}
      </div>
    </div>
  );
};

export default BlastFurnace;
