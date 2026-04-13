import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BallastCompartment — OCEAN-mode media storage diagram (replaces OrbitalDiagram).
 * Keel ballast sections of a submersible — compartmented horizontal chambers
 * that fill with seawater as storage increases. Weight/balance indicator.
 * Critical: emergency ballast blow warning, air rushing through valves.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const BallastCompartment = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const gradId = useId();
  const cat = activeCATRef.current[catKey];
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const color = online ? cat : '#6b7280';
  const showBlow = level > 85 && online;

  const tierLabel = level < 25 ? 'Buoyant' : level < 50 ? 'Neutral' : level < 75 ? 'Negative' : 'Emergency';

  // 5 ballast tanks — fill from center outward
  const TANKS = [
    { x: 10, y: 52, w: 14, h: 18, label: 'FWD' },
    { x: 27, y: 48, w: 14, h: 24, label: 'F-MID' },
    { x: 44, y: 45, w: 14, h: 28, label: 'MAIN' },
    { x: 61, y: 48, w: 14, h: 24, label: 'A-MID' },
    { x: 78, y: 52, w: 12, h: 18, label: 'AFT' },
  ];

  // Fill order: MAIN first, then F-MID/A-MID, then FWD/AFT
  const fillOrder = [2, 1, 3, 0, 4];
  const tanksToFill = Math.ceil(act * TANKS.length);

  const isTankFilled = (idx) => {
    const orderPos = fillOrder.indexOf(idx);
    return orderPos < tanksToFill;
  };

  const getTankFill = (idx) => {
    const orderPos = fillOrder.indexOf(idx);
    if (orderPos >= tanksToFill) return 0;
    if (orderPos < tanksToFill - 1) return 1;
    return (act * TANKS.length) % 1 || 1;
  };

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
            BALLAST ◆ TRIM
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {tanksToFill}/{TANKS.length} tanks · {tierLabel}
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
          {TANKS.map((tank, i) => (
            <linearGradient key={i} id={`${gradId}-tank-${i}`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.4 + act * 0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>

        {/* Keel hull outline */}
        <path d="M 6,46 Q 6,40 15,38 L 85,38 Q 94,40 94,46 L 94,74 Q 94,78 85,78 L 15,78 Q 6,78 6,74 Z"
          fill={color} opacity={0.03} stroke={color} strokeWidth="0.8" />

        {/* Tank outlines */}
        {TANKS.map((tank, i) => (
          <rect key={`tank-${i}`} x={tank.x} y={tank.y} width={tank.w} height={tank.h}
            fill="none" stroke={color} strokeWidth={isTankFilled(i) ? 0.8 : 0.3}
            opacity={isTankFilled(i) ? 0.3 : 0.1} rx={1} />
        ))}

        {/* Water fill in tanks */}
        {TANKS.map((tank, i) => {
          const fill = getTankFill(i);
          if (fill <= 0) return null;
          const fillH = tank.h * fill;
          const fillY = tank.y + tank.h - fillH;
          const baseOp = 0.15 + act * 0.2;

          return prefersReducedMotion ? (
            <rect key={`fill-${i}`} x={tank.x + 0.5} y={fillY}
              width={tank.w - 1} height={fillH} rx={0.5}
              fill={`url(#${gradId}-tank-${i})`} opacity={baseOp} />
          ) : (
            <motion.rect key={`fill-${i}`} x={tank.x + 0.5}
              width={tank.w - 1} rx={0.5}
              fill={`url(#${gradId}-tank-${i})`}
              animate={{
                y: [fillY, fillY - 0.5, fillY],
                height: [fillH, fillH + 0.5, fillH],
                opacity: [baseOp, baseOp * 1.15, baseOp],
              }}
              transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
            />
          );
        })}

        {/* Air pocket indicators (above water in each tank) */}
        {TANKS.map((tank, i) => {
          const fill = getTankFill(i);
          if (fill <= 0 || fill >= 0.95) return null;
          return (
            <text key={`air-${i}`} x={tank.x + tank.w / 2} y={tank.y + 4}
              textAnchor="middle" fill={color} fontSize="3" fontFamily={MONO} opacity={0.2}>
              AIR
            </text>
          );
        })}

        {/* Tank labels */}
        {TANKS.map((tank, i) => (
          <text key={`tlbl-${i}`} x={tank.x + tank.w / 2} y={tank.y + tank.h + 6}
            textAnchor="middle" fill={color} fontSize="2.8" fontFamily={MONO}
            opacity={isTankFilled(i) ? 0.4 : 0.15}>
            {tank.label}
          </text>
        ))}

        {/* Connecting pipes between tanks */}
        {[24, 41, 58, 75].map((x, i) => (
          <React.Fragment key={`pipe-${i}`}>
            <line x1={x} y1={60} x2={x + 3} y2={60}
              stroke={color} strokeWidth="0.6" opacity={0.15} />
            {/* Valve indicators */}
            <circle cx={x + 1.5} cy={60} r={1} fill="none"
              stroke={color} strokeWidth="0.4" opacity={0.2} />
          </React.Fragment>
        ))}

        {/* Buoyancy indicator (balance beam at top) */}
        <line x1={30} y1={36} x2={70} y2={36}
          stroke={color} strokeWidth="0.4" opacity={0.2} />
        <circle cx={50} cy={36} r={1.5} fill={color} opacity={0.1} />
        {/* Balance weight indicator */}
        <line x1={50} y1={34} x2={50 + (act - 0.5) * 20} y2={34}
          stroke={color} strokeWidth="1" opacity={0.3 + act * 0.2}
          strokeLinecap="round" />

        {/* Emergency ballast blow at critical */}
        {showBlow && (() => {
          const blowScale = (level - 85) / 15;
          const blowFx = (
            <g>
              {/* Air bubbles escaping from valves */}
              {TANKS.map((tank, i) => (
                <React.Fragment key={`blow-${i}`}>
                  <circle cx={tank.x + tank.w / 2 - 2} cy={tank.y - 2} r={1}
                    fill={color} opacity={0.2 + blowScale * 0.3} />
                  <circle cx={tank.x + tank.w / 2 + 2} cy={tank.y - 4} r={0.7}
                    fill={color} opacity={0.15 + blowScale * 0.2} />
                </React.Fragment>
              ))}
              {/* Warning text */}
              <text x={50} y={32} textAnchor="middle" fill={color}
                fontSize="3.5" fontFamily={MONO} opacity={0.5 + blowScale * 0.4}
                letterSpacing="0.2em">
                EMRG BLOW
              </text>
            </g>
          );
          return prefersReducedMotion ? blowFx : (
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            >
              {blowFx}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{tierLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {tanksToFill}/{TANKS.length} Tanks
      </div>
    </div>
  );
};

export default BallastCompartment;
