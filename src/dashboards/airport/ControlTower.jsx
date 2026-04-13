import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * ControlTower — AIRPORT-mode server storage diagram (replaces OrbitalDiagram).
 * Side-view silhouette of a control tower with stacked floor levels.
 * Each floor lights up bottom→cab as storage fills. Antenna array on top.
 * Critical: all floors lit, beacon flashes, radar dome glows.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const ControlTower = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
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
  const showBeacon = level > 85 && online;

  const tierLabel = level < 25 ? 'Quiet' : level < 50 ? 'Active' : level < 75 ? 'Busy' : 'Full';

  // Tower floors — 5 levels from base to cab
  const FLOORS = [
    { y: 72, h: 8,  w: 28, label: 'GROUND' },
    { y: 64, h: 8,  w: 24, label: 'OPS' },
    { y: 56, h: 8,  w: 20, label: 'TECH' },
    { y: 48, h: 8,  w: 18, label: 'RADAR' },
    { y: 38, h: 10, w: 26, label: 'CAB' },
  ];

  const litFloors = Math.ceil(act * FLOORS.length);

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
            TOWER ◆ STATUS
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {litFloors}/{FLOORS.length} floors · {tierLabel}
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
          {FLOORS.map((floor, i) => (
            <linearGradient key={i} id={`${gradId}-fl-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.1} />
              <stop offset="50%" stopColor={color} stopOpacity={i < litFloors ? 0.3 + act * 0.2 : 0.02} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>

        {/* Tower shaft outline */}
        <path d="M 38,80 L 38,48 L 37,38 L 63,38 L 62,48 L 62,80 Z"
          fill="none" stroke={color} strokeWidth="0.8" opacity={0.2} />

        {/* Cab (wider top section with windows) */}
        <path d="M 34,48 L 34,38 Q 34,36 36,36 L 64,36 Q 66,36 66,38 L 66,48 Z"
          fill={color} opacity={litFloors >= 5 ? 0.08 + act * 0.06 : 0.02}
          stroke={color} strokeWidth="0.8" />

        {/* Cab wraparound windows */}
        {litFloors >= 5 && (
          <g>
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={`win-${i}`} x={36 + i * 3.5} y={38} width={2.5} height={8} rx={0.3}
                fill={color} opacity={0.15 + act * 0.2}
                style={showBeacon ? { filter: `drop-shadow(0 0 1px ${color})` } : {}} />
            ))}
          </g>
        )}

        {/* Tower floors */}
        {FLOORS.slice(0, 4).map((floor, i) => {
          const isLit = i < litFloors;
          const fx = 50 - floor.w / 2;
          const baseOp = isLit ? 0.15 + act * 0.15 : 0.02;

          return (
            <React.Fragment key={`floor-${i}`}>
              {/* Floor fill */}
              {prefersReducedMotion || !isLit ? (
                <rect x={fx} y={floor.y} width={floor.w} height={floor.h}
                  fill={`url(#${gradId}-fl-${i})`} opacity={baseOp} />
              ) : (
                <motion.rect x={fx} y={floor.y} width={floor.w} height={floor.h}
                  fill={`url(#${gradId}-fl-${i})`}
                  animate={{ opacity: [baseOp, baseOp * 1.25, baseOp] }}
                  transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                />
              )}
              {/* Floor divider */}
              <line x1={fx} y1={floor.y} x2={fx + floor.w} y2={floor.y}
                stroke={color} strokeWidth={isLit ? 0.6 : 0.3} opacity={isLit ? 0.25 : 0.08} />
              {/* Floor windows (2 per floor) */}
              {isLit && (
                <g>
                  <rect x={fx + 3} y={floor.y + 2} width={3} height={4} rx={0.3}
                    fill={color} opacity={0.15 + act * 0.1} />
                  <rect x={fx + floor.w - 6} y={floor.y + 2} width={3} height={4} rx={0.3}
                    fill={color} opacity={0.15 + act * 0.1} />
                </g>
              )}
            </React.Fragment>
          );
        })}

        {/* Floor labels (right side) */}
        {FLOORS.map((floor, i) => (
          i < litFloors && (
            <text key={`flbl-${i}`} x={i === 4 ? 70 : 64} y={floor.y + floor.h / 2 + 1.5}
              fill={color} fontSize="3" fontFamily={MONO} opacity={0.35}>
              {floor.label}
            </text>
          )
        ))}

        {/* Antenna array on top */}
        <line x1={50} y1={36} x2={50} y2={22}
          stroke={color} strokeWidth="0.6" opacity={0.25} />
        {/* Antenna crossbars */}
        <line x1={46} y1={25} x2={54} y2={25}
          stroke={color} strokeWidth="0.4" opacity={0.2} />
        <line x1={47} y1={28} x2={53} y2={28}
          stroke={color} strokeWidth="0.4" opacity={0.15} />

        {/* Radar dome */}
        <ellipse cx={50} cy={22} rx={4} ry={2.5}
          fill={color} opacity={showBeacon ? 0.15 + act * 0.1 : 0.04}
          stroke={color} strokeWidth="0.4" />

        {/* Base / ground structure */}
        <rect x={30} y={80} width={40} height={4} rx={1}
          fill={color} opacity={0.05} stroke={color} strokeWidth="0.4" />

        {/* Beacon at critical */}
        {showBeacon && (() => {
          const beaconScale = (level - 85) / 15;
          const beacon = (
            <g>
              {/* Rotating beacon light on top */}
              <circle cx={50} cy={20} r={2}
                fill={color} opacity={0.5 + beaconScale * 0.4}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
              {/* Beacon rays */}
              <line x1={44} y1={20} x2={38} y2={18}
                stroke={color} strokeWidth="0.6" opacity={0.2 + beaconScale * 0.3} />
              <line x1={56} y1={20} x2={62} y2={18}
                stroke={color} strokeWidth="0.6" opacity={0.2 + beaconScale * 0.3} />
              {/* Radar dome glow */}
              <ellipse cx={50} cy={22} rx={6} ry={3.5}
                fill={color} opacity={0.05 + beaconScale * 0.1}
                style={{ filter: `blur(2px)` }} />
            </g>
          );
          return prefersReducedMotion ? beacon : (
            <motion.g
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              {beacon}
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
        {litFloors}/{FLOORS.length} Floors
      </div>
    </div>
  );
};

export default ControlTower;
