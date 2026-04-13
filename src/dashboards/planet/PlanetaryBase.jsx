import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * PlanetaryBase — PLANET-mode media storage diagram (replaces OrbitalDiagram).
 * Top-down view of a surface colony — modular habitat domes connected by
 * corridors. Each dome = a drive. Domes light up as storage fills.
 * Different dome hue per drive. Critical: life support warning, breach.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const PlanetaryBase = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current[catKey];
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const color = online ? cat : '#6b7280';
  const showBreach = level > 85 && online;

  const tierLabel = level < 25 ? 'Minimal' : level < 50 ? 'Operational' : level < 75 ? 'Expanded' : 'Maximum';

  // Dome positions — central hub + satellite domes
  const DOMES = [
    { cx: 50, cy: 46, r: 10, label: 'HUB',   hueShift: 0 },
    { cx: 28, cy: 36, r: 7,  label: 'HAB-A',  hueShift: 30 },
    { cx: 72, cy: 36, r: 7,  label: 'HAB-B',  hueShift: 60 },
    { cx: 28, cy: 60, r: 7,  label: 'LAB',    hueShift: 90 },
    { cx: 72, cy: 60, r: 7,  label: 'STORE',  hueShift: 120 },
  ];

  const litDomes = Math.ceil(act * DOMES.length);

  // Corridors connecting domes to hub
  const CORRIDORS = [
    { from: 0, to: 1 }, // HUB → HAB-A
    { from: 0, to: 2 }, // HUB → HAB-B
    { from: 0, to: 3 }, // HUB → LAB
    { from: 0, to: 4 }, // HUB → STORE
  ];

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
            BASE ◆ COLONY
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {litDomes}/{DOMES.length} modules · {tierLabel}
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

        {/* Planetary surface texture (subtle crater marks) */}
        <circle cx={20} cy={75} r={6} fill="none" stroke={color} strokeWidth="0.2" opacity={0.04} />
        <circle cx={80} cy={22} r={4} fill="none" stroke={color} strokeWidth="0.2" opacity={0.03} />
        <circle cx={85} cy={70} r={3} fill="none" stroke={color} strokeWidth="0.2" opacity={0.03} />

        {/* Corridors (drawn first, under domes) */}
        {CORRIDORS.map((corr, i) => {
          const from = DOMES[corr.from];
          const to = DOMES[corr.to];
          const isActive = corr.to < litDomes;
          return (
            <line key={`corr-${i}`}
              x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy}
              stroke={color} strokeWidth={isActive ? 2 : 0.5}
              opacity={isActive ? 0.12 + act * 0.08 : 0.04} />
          );
        })}

        {/* Domes */}
        {DOMES.map((dome, i) => {
          const isLit = i < litDomes;
          const baseOp = isLit ? 0.1 + act * 0.15 : 0.02;

          return (
            <React.Fragment key={`dome-${i}`}>
              {/* Dome fill */}
              {prefersReducedMotion || !isLit ? (
                <circle cx={dome.cx} cy={dome.cy} r={dome.r}
                  fill={color} opacity={baseOp}
                  stroke={color} strokeWidth={isLit ? 0.8 : 0.3} />
              ) : (
                <motion.circle cx={dome.cx} cy={dome.cy} r={dome.r}
                  fill={color} stroke={color} strokeWidth={0.8}
                  animate={{ opacity: [baseOp, baseOp * 1.3, baseOp] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                />
              )}

              {/* Dome structural ring (pressure seal) */}
              {isLit && (
                <circle cx={dome.cx} cy={dome.cy} r={dome.r - 1.5}
                  fill="none" stroke={color} strokeWidth="0.3"
                  opacity={0.15} strokeDasharray="1.5 1" />
              )}

              {/* Dome label */}
              <text x={dome.cx} y={dome.cy + 1.5} textAnchor="middle"
                fill={color} fontSize={i === 0 ? '3.5' : '3'} fontFamily={MONO}
                opacity={isLit ? 0.45 : 0.12}>
                {dome.label}
              </text>

              {/* Airlock indicator (small rectangle at dome edge toward hub) */}
              {isLit && i > 0 && (() => {
                const angle = Math.atan2(DOMES[0].cy - dome.cy, DOMES[0].cx - dome.cx);
                const ax = dome.cx + (dome.r - 1) * Math.cos(angle);
                const ay = dome.cy + (dome.r - 1) * Math.sin(angle);
                return (
                  <rect x={ax - 1} y={ay - 0.8} width={2} height={1.6} rx={0.3}
                    fill={color} opacity={0.25} />
                );
              })()}
            </React.Fragment>
          );
        })}

        {/* Landing pad (near hub) */}
        <rect x={46} y={58} width={8} height={1} rx={0.3}
          fill={color} opacity={0.1} />
        <text x={50} y={64} textAnchor="middle" fill={color}
          fontSize="2.5" fontFamily={MONO} opacity={0.15}>
          PAD
        </text>

        {/* Life support warning at critical */}
        {showBreach && (() => {
          const breachScale = (level - 85) / 15;
          const breach = (
            <g>
              {/* Pressure breach cracks on outer dome */}
              <path d={`M ${DOMES[4].cx + 5},${DOMES[4].cy - 3} L ${DOMES[4].cx + 7},${DOMES[4].cy - 1} L ${DOMES[4].cx + 6},${DOMES[4].cy + 2}`}
                stroke={color} strokeWidth="0.6" fill="none"
                opacity={0.3 + breachScale * 0.4} />
              {/* Escaping atmosphere particles */}
              <circle cx={DOMES[4].cx + 8} cy={DOMES[4].cy - 2} r={0.6}
                fill={color} opacity={0.2 + breachScale * 0.3} />
              <circle cx={DOMES[4].cx + 9} cy={DOMES[4].cy} r={0.4}
                fill={color} opacity={0.15 + breachScale * 0.2} />
              {/* Warning text */}
              <text x={50} y={18} textAnchor="middle" fill={color}
                fontSize="3.5" fontFamily={MONO} opacity={0.4 + breachScale * 0.4}
                letterSpacing="0.15em">
                LIFE SUPPORT
              </text>
            </g>
          );
          return prefersReducedMotion ? breach : (
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {breach}
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
        {litDomes}/{DOMES.length} Modules
      </div>
    </div>
  );
};

export default PlanetaryBase;
