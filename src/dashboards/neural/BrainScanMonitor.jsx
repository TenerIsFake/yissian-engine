import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BrainScanMonitor -- NEURAL-mode CPU/RAM diagram.
 * Cross-section brain view with 4 regions that light up progressively with load.
 * Neural spike waveform at bottom edge intensifies with load.
 *
 * Props match CoordComplex/StellarCoreMonitor interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const BrainScanMonitor = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller = false, lowSpin = false, size = 88 }) => {
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
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.25)` : 'rgba(107,114,128,0.15)';

  const act = level / 100;

  // Which brain regions are active (from brainstem outward)
  // 0-25: brainstem, 25-50: +cerebellum, 50-75: +temporal, 75-100: all
  const regionCount = level <= 25 ? 1 : level <= 50 ? 2 : level <= 75 ? 3 : 4;

  const REGIONS = [
    { id: 'brainstem', label: 'STEM', opacity: 0.7 },
    { id: 'cerebellum', label: 'CRBL', opacity: 0.5 },
    { id: 'temporal', label: 'TEMP', opacity: 0.4 },
    { id: 'cortex', label: 'CRTX', opacity: 0.3 },
  ];

  // Neural spike waveform: more intense at higher load
  const spikePoints = [];
  const spikeY = 90;
  const spikeAmp = 3 + act * 12;
  for (let x = 5; x <= 95; x += 2) {
    const freq = 0.15 + act * 0.25;
    const y = spikeY + Math.sin(x * freq + (x * 0.3)) * spikeAmp * (online ? 1 : 0.05);
    spikePoints.push(`${x},${y.toFixed(1)}`);
  }
  const spikePath = `M${spikePoints.join(' L')}`;

  const regionLabel = isCpu
    ? (lowSpin ? 'Active -- High Load' : 'Quiescent')
    : (lowSpin ? 'Active -- High Pressure' : 'Quiescent');

  const brainClass = level < 25 ? 'Delta (Deep Sleep)' : level < 50 ? 'Theta (Idle)' : level < 75 ? 'Alpha (Active)' : 'Gamma (Peak)';

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
            BRAIN_SCAN {'\u25C6'} {isCpu ? 'NEURAL_LOAD' : 'MEMORY_BANK'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Active' : 'Quiescent'} {'\u00B7'} {brainClass}
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
          <radialGradient id={`${gradId}-brain-glow`} cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={0.3 * act} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* Brain outline -- simplified cross-section */}
        <ellipse cx={50} cy={40} rx={38} ry={32}
          fill="none" stroke={color} strokeWidth={0.6} opacity={0.15} />

        {/* Background glow */}
        <ellipse cx={50} cy={40} rx={38} ry={32}
          fill={`url(#${gradId}-brain-glow)`} />

        {/* Region 4: Cortex (full brain dome) */}
        {(() => {
          const active = regionCount >= 4;
          const op = active ? 0.15 + act * 0.25 : 0.03;
          const el = (
            <ellipse cx={50} cy={35} rx={34} ry={26}
              fill={color} opacity={op}
              stroke={color} strokeWidth={active ? 0.8 : 0.3} strokeOpacity={active ? 0.4 : 0.06} />
          );
          return !prefersReducedMotion && active && online ? (
            <motion.g
              animate={{ opacity: [op, op * 1.3, op] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >{el}</motion.g>
          ) : el;
        })()}

        {/* Region 3: Temporal lobes */}
        {(() => {
          const active = regionCount >= 3;
          const op = active ? 0.2 + act * 0.25 : 0.03;
          return (
            <g>
              <ellipse cx={28} cy={45} rx={14} ry={10}
                fill={color} opacity={op}
                stroke={color} strokeWidth={active ? 0.7 : 0.3} strokeOpacity={active ? 0.35 : 0.06} />
              <ellipse cx={72} cy={45} rx={14} ry={10}
                fill={color} opacity={op}
                stroke={color} strokeWidth={active ? 0.7 : 0.3} strokeOpacity={active ? 0.35 : 0.06} />
              {active && (
                <>
                  <text x={28} y={47} textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.4}>TEMP</text>
                  <text x={72} y={47} textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.4}>TEMP</text>
                </>
              )}
            </g>
          );
        })()}

        {/* Region 2: Cerebellum */}
        {(() => {
          const active = regionCount >= 2;
          const op = active ? 0.25 + act * 0.25 : 0.03;
          const el = (
            <ellipse cx={50} cy={60} rx={16} ry={10}
              fill={color} opacity={op}
              stroke={color} strokeWidth={active ? 0.8 : 0.3} strokeOpacity={active ? 0.4 : 0.06} />
          );
          return (
            <g>
              {!prefersReducedMotion && active && online ? (
                <motion.g
                  animate={{ opacity: [1, 1.2, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >{el}</motion.g>
              ) : el}
              {active && (
                <text x={50} y={62} textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.4}>CRBL</text>
              )}
            </g>
          );
        })()}

        {/* Region 1: Brainstem (always at least dimly visible) */}
        {(() => {
          const active = regionCount >= 1;
          const op = active ? 0.35 + act * 0.3 : 0.05;
          return (
            <g>
              <rect x={46} y={62} width={8} height={16} rx={3}
                fill={color} opacity={op}
                stroke={color} strokeWidth={active ? 0.8 : 0.3} strokeOpacity={active ? 0.5 : 0.08} />
              {active && (
                <text x={50} y={73} textAnchor="middle" fill={color} fontSize="3" fontFamily={MONO} opacity={0.5}>STEM</text>
              )}
            </g>
          );
        })()}

        {/* Central bright core */}
        <circle cx={50} cy={40} r={4}
          fill={online ? color : '#374151'}
          opacity={online ? 0.7 + act * 0.3 : 0.3}
          style={{ filter: online ? `drop-shadow(0 0 ${2 + act * 6}px ${color})` : 'none' }} />

        {/* Neural spike waveform at bottom */}
        {online ? (
          !prefersReducedMotion ? (
            <motion.path
              d={spikePath}
              fill="none" stroke={color} strokeWidth={0.8 + act * 0.5}
              opacity={0.5 + act * 0.3}
              style={{ filter: `drop-shadow(0 0 2px ${color})` }}
              animate={{ pathLength: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <path d={spikePath} fill="none" stroke={color} strokeWidth={0.8 + act * 0.5} opacity={0.5 + act * 0.3} />
          )
        ) : (
          <line x1={5} y1={spikeY} x2={95} y2={spikeY}
            stroke="#6b7280" strokeWidth={0.5} opacity={0.2} />
        )}

        {/* Percentage readout */}
        <text x={50} y={84} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{brainClass}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Active' : 'Quiescent'} | {regionLabel}
      </div>
    </div>
  );
};

export default BrainScanMonitor;
