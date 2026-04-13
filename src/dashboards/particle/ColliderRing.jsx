import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * ColliderRing — PARTICLE-mode CPU/RAM diagram.
 * Top-down circular particle accelerator ring with circulating beam,
 * 4 detector stations at cardinal points, beam injection and beam dump.
 * Energy readout in GeV.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const ColliderRing = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
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
  const color      = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.25)` : 'rgba(107,114,128,0.25)';

  const act = level / 100;
  const ringR = 36;
  const ringCirc = 2 * Math.PI * ringR;
  /* Beam speed: faster orbit at higher load */
  const orbitDuration = Math.max(0.5, 4 - act * 3.5);
  /* Beam dump threshold */
  const showBeamDump = level > 90 && online;
  /* Energy readout */
  const gev = (act * 13.6).toFixed(1); // 0 → 13.6 TeV scaled

  /* 4 detector stations at N/E/S/W */
  const stations = [
    { angle: -90, label: 'ATLAS', quartile: 25 },
    { angle: 0,   label: 'CMS',   quartile: 50 },
    { angle: 90,  label: 'ALICE', quartile: 75 },
    { angle: 180, label: 'LHCb',  quartile: 100 },
  ];

  const colliderLabel = isCpu ? 'SYNCHROTRON' : 'STORAGE_RING';
  const stateLabel = level < 30 ? 'Injection' : level < 60 ? 'Ramping' : level < 90 ? 'Colliding' : 'Beam Dump';

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
            {colliderLabel} ◆ {isCpu ? 'BEAM_ENERGY' : 'LUMINOSITY'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {stateLabel} · {gev} GeV
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
          <radialGradient id={`${gradId}-ring`} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor={color} stopOpacity={0} />
            <stop offset="100%" stopColor={color} stopOpacity={online ? 0.05 : 0} />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx={50} cy={50} r={46} fill={`url(#${gradId}-ring)`} />

        {/* Accelerator ring — outer wall */}
        <circle cx={50} cy={50} r={ringR + 3}
          fill="none" stroke={color} strokeWidth={0.4} opacity={0.12} />
        {/* Accelerator ring — beam pipe */}
        <circle cx={50} cy={50} r={ringR}
          fill="none" stroke={color} strokeWidth={1.2} opacity={online ? 0.3 : 0.08}
          strokeDasharray="4 2" />
        {/* Accelerator ring — inner wall */}
        <circle cx={50} cy={50} r={ringR - 3}
          fill="none" stroke={color} strokeWidth={0.4} opacity={0.12} />

        {/* Circulating beam particle */}
        {online && (
          prefersReducedMotion ? (
            <circle cx={50} cy={50 - ringR} r={2}
              fill={color} opacity={0.85}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          ) : (
            <motion.circle
              cx={50} cy={50} r={2}
              fill={color} opacity={0.85}
              style={{
                filter: `drop-shadow(0 0 4px ${color})`,
                offsetPath: `path('M ${50 + ringR},${50} A ${ringR},${ringR} 0 1,1 ${50 + ringR - 0.01},${50}')`,
                offsetRotate: '0deg',
              }}
              animate={{ offsetDistance: ['0%', '100%'] }}
              transition={{ duration: orbitDuration, repeat: Infinity, ease: 'linear' }}
            />
          )
        )}

        {/* Beam trail (dashed arc showing beam extent) */}
        {online && (
          <circle cx={50} cy={50} r={ringR}
            fill="none" stroke={color} strokeWidth={2.5}
            strokeDasharray={`${ringCirc * act * 0.6} ${ringCirc}`}
            opacity={0.12 + act * 0.15}
            style={{ filter: `drop-shadow(0 0 2px ${color})` }}
          />
        )}

        {/* 4 Detector stations */}
        {stations.map((st) => {
          const rad = (st.angle * Math.PI) / 180;
          const dx = 50 + Math.cos(rad) * ringR;
          const dy = 50 + Math.sin(rad) * ringR;
          const isLit = online && level >= st.quartile;
          return (
            <g key={st.label}>
              {/* Station housing */}
              <rect x={dx - 4} y={dy - 4} width={8} height={8} rx={1.5}
                fill={isLit ? color : '#374151'}
                opacity={isLit ? 0.6 + act * 0.3 : 0.15}
                stroke={color} strokeWidth={0.5}
                style={{ filter: isLit ? `drop-shadow(0 0 3px ${color})` : 'none' }}
              />
              {/* Station label */}
              <text x={dx + Math.cos(rad) * 10} y={dy + Math.sin(rad) * 10 + 2}
                textAnchor="middle" fill={color} fontSize="3" fontFamily={MONO}
                opacity={isLit ? 0.5 : 0.15}>
                {st.label}
              </text>
            </g>
          );
        })}

        {/* Beam injection point (bottom-left) */}
        <line x1={18} y1={75} x2={50 - ringR * 0.7} y2={50 + ringR * 0.7}
          stroke={color} strokeWidth={0.6} opacity={0.2} strokeDasharray="2 3" />
        <text x={14} y={78} fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.3}>INJ</text>

        {/* Beam dump indicator */}
        {showBeamDump && (
          <g>
            <line x1={50 + ringR * 0.7} y1={50 - ringR * 0.7} x2={82} y2={22}
              stroke="#ef4444" strokeWidth={0.8} opacity={0.5} strokeDasharray="2 2" />
            {prefersReducedMotion ? (
              <text x={84} y={20} fill="#ef4444" fontSize="3.5" fontFamily={MONO} opacity={0.7}>DUMP</text>
            ) : (
              <motion.text x={84} y={20} fill="#ef4444" fontSize="3.5" fontFamily={MONO}
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}>
                DUMP
              </motion.text>
            )}
          </g>
        )}

        {/* Center readout */}
        <text x={50} y={48} textAnchor="middle" fill={color} fontSize="8" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
        <text x={50} y={57} textAnchor="middle" fill={color} fontSize="4.5" fontFamily={MONO} opacity={0.45}>
          {gev} GeV
        </text>

        {/* Online dot */}
        <circle cx={88} cy={92} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{stateLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'High Lumi' : 'Standard'} | {colliderLabel}
      </div>
    </div>
  );
};

export default ColliderRing;
