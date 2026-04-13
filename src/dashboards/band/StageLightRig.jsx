import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * StageLightRig -- BAND-mode Server/Media Storage diagram.
 * A stage lighting rig viewed from above: truss bar with PAR cans that
 * illuminate progressively with storage fill level. Each light is a circle
 * with inner glow. Lower lights = green, mid = amber, high = red.
 *
 * Props: label, level, online, details, metal, isJahnTeller, lowSpin, size
 * metal: 'Fe'|'Cu' -> CPU hue (200->0), 'Co'|'Ni' -> RAM hue (160->30)
 */
const StageLightRig = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
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
  const color      = online ? `hsl(${hue}, 80%, 55%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 80%, 55%, 0.35)` : 'rgba(107,114,128,0.35)';

  const act = level / 100;
  const lightCount = 8;
  const litLights = Math.ceil(act * lightCount);

  // PAR can color: green -> amber -> red based on position in the rig
  const getParColor = (i) => {
    const ratio = i / (lightCount - 1);
    if (ratio < 0.4) return { fill: '#22c55e', glow: '#22c55e' };       // green
    if (ratio < 0.7) return { fill: '#f59e0b', glow: '#f59e0b' };       // amber
    return { fill: '#ef4444', glow: '#ef4444' };                          // red
  };

  // Storage tier
  const tierLabel = level < 50 ? 'Plenty' : level < 80 ? 'Filling' : 'Nearly Full';

  // Light X positions evenly spaced
  const lights = Array.from({ length: lightCount }, (_, i) => {
    const x = 10 + i * ((80) / (lightCount - 1));
    const isLit = i < litLights && online;
    const { fill, glow } = getParColor(i);
    return { x, isLit, fill, glow, i };
  });

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
            STAGE_RIG {isCpu ? 'SRV' : 'MEDIA'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {litLights}/{lightCount} PAR cans | {tierLabel}
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
          {lights.map(({ x, isLit, fill, glow, i }) => (
            <radialGradient key={`glow-${i}`} id={`${gradId}-glow-${i}`}>
              <stop offset="0%" stopColor={isLit ? fill : '#333'} stopOpacity={isLit ? 0.9 : 0.1} />
              <stop offset="40%" stopColor={isLit ? fill : '#333'} stopOpacity={isLit ? 0.5 : 0.05} />
              <stop offset="100%" stopColor={isLit ? fill : '#333'} stopOpacity={0} />
            </radialGradient>
          ))}
          {/* Light beam cone gradients */}
          {lights.map(({ x, isLit, fill, i }) => (
            <linearGradient key={`beam-${i}`} id={`${gradId}-beam-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isLit ? fill : '#444'} stopOpacity={isLit ? 0.4 : 0.02} />
              <stop offset="100%" stopColor={isLit ? fill : '#444'} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Dark stage backdrop */}
        <rect x={0} y={0} width={100} height={100} rx={5}
          fill="rgba(8,8,12,0.85)" stroke={colorFaded} strokeWidth={0.4} />

        {/* Stage floor reflection line */}
        <line x1={5} y1={92} x2={95} y2={92}
          stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />

        {/* ---- Truss structure ---- */}
        {/* Main truss bar — top rail */}
        <rect x={4} y={20} width={92} height={2.5} rx={1}
          fill="rgba(80,80,90,0.6)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.3} />
        {/* Main truss bar — bottom rail */}
        <rect x={4} y={26} width={92} height={2} rx={1}
          fill="rgba(60,60,70,0.5)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.3} />
        {/* Cross-bracing between rails */}
        {Array.from({ length: 9 }, (_, i) => {
          const xOff = 8 + i * 10;
          return (
            <g key={`brace-${i}`}>
              <line x1={xOff} y1={22.5} x2={xOff + 5} y2={26}
                stroke="rgba(255,255,255,0.06)" strokeWidth={0.4} />
              <line x1={xOff + 5} y1={22.5} x2={xOff} y2={26}
                stroke="rgba(255,255,255,0.06)" strokeWidth={0.4} />
            </g>
          );
        })}
        {/* Truss end caps */}
        <circle cx={5} cy={24} r={2} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.3} />
        <circle cx={95} cy={24} r={2} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.3} />

        {/* ---- Light beams (rendered behind housings) ---- */}
        {lights.map(({ x, isLit, fill, i }) => {
          const beamWidth = 6 + (isLit ? act * 3 : 0);
          const beamEl = (
            <polygon
              points={`${x},34 ${x - beamWidth},94 ${x + beamWidth},94`}
              fill={`url(#${gradId}-beam-${i})`}
            />
          );
          return isLit && !prefersReducedMotion ? (
            <motion.g key={`beam-${i}`}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            >
              {beamEl}
            </motion.g>
          ) : (
            <g key={`beam-${i}`} opacity={isLit ? 0.8 : 1}>{beamEl}</g>
          );
        })}

        {/* ---- PAR can housings ---- */}
        {lights.map(({ x, isLit, fill, glow, i }) => (
          <g key={`par-${i}`}>
            {/* Mount arm from truss */}
            <line x1={x} y1={28} x2={x} y2={32}
              stroke="rgba(255,255,255,0.15)" strokeWidth={1.2} />
            {/* Housing body (cylinder viewed from front) */}
            <rect x={x - 3.5} y={32} width={7} height={5} rx={1.2}
              fill={isLit ? 'rgba(30,30,35,0.9)' : 'rgba(25,25,30,0.7)'}
              stroke={isLit ? `${fill}66` : 'rgba(255,255,255,0.08)'}
              strokeWidth={0.5} />
            {/* Lens circle — the PAR can face */}
            <circle cx={x} cy={37} r={3}
              fill={isLit ? `url(#${gradId}-glow-${i})` : 'rgba(255,255,255,0.03)'}
              opacity={isLit ? 1 : 0.3}
            />
            {/* Inner glow ring */}
            {isLit && (
              <circle cx={x} cy={37} r={2}
                fill="none"
                stroke={fill}
                strokeWidth={0.6}
                opacity={0.7}
                style={{ filter: `drop-shadow(0 0 4px ${glow})` }}
              />
            )}
            {/* Bright center dot */}
            {isLit && (
              <circle cx={x} cy={37} r={0.8}
                fill="white" opacity={0.8}
                style={{ filter: `drop-shadow(0 0 2px ${glow})` }}
              />
            )}
          </g>
        ))}

        {/* ---- Floor spill (pool of light on stage) at high levels ---- */}
        {level > 60 && online && (
          prefersReducedMotion ? (
            <ellipse cx={50} cy={92} rx={35 * act} ry={4}
              fill={color} opacity={0.06} />
          ) : (
            <motion.ellipse cx={50} cy={92} rx={35 * act} ry={4}
              fill={color}
              animate={{ opacity: [0.04, 0.08, 0.04] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          )
        )}

        {/* Level readout */}
        <text x={50} y={15} textAnchor="middle" fill={color} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Rig label */}
        <text x={50} y={99} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="3.5" fontFamily={MONO} letterSpacing="0.2em">
          PAR CAN RIG
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {litLights}/{lightCount} Spots
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {isCpu ? 'Server' : 'Media'} | {tierLabel}
      </div>
    </div>
  );
};

export default StageLightRig;
