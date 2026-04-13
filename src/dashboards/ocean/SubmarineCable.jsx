import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SubmarineCable — OCEAN-mode bandwidth diagram (replaces JablonskiDiagram).
 * DOWNLOAD (emission / SONAR_IN): Cross-section of undersea fiber optic cable
 *   with pulsing light signals. More signals = more bandwidth.
 * UPLOAD (excitation / SONAR_OUT): Research buoy on surface transmitting data
 *   upward via antenna arcs. Wave motion increases with upload speed.
 *
 * Props match JablonskiDiagram interface:
 *   label, level, online, details, variant, size, jablonskiLabel
 */
const SubmarineCable = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current.NOBLE;
  const isDownload = variant === 'emission';
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const color = online ? cat : '#6b7280';
  const showCritical = level > 85 && online;

  const tierLabel = level < 25 ? 'Idle' : level < 50 ? 'Active' : level < 75 ? 'High' : 'Saturated';

  // Signal pulses for download (fiber optic)
  const signalCount = Math.max(1, Math.floor(act * 8));
  const signals = Array.from({ length: signalCount }, (_, i) => ({
    x: 10 + (i / signalCount) * 80,
    opacity: 0.3 + act * 0.5,
  }));

  // Wave arcs for upload (buoy antenna)
  const arcCount = Math.max(1, Math.floor(act * 5));

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
            {isDownload ? 'CABLE ◆ FIBER' : 'BUOY ◆ TELEMETRY'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>
            {jablonskiLabel || label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {tierLabel}
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
        role="img" aria-label={`${jablonskiLabel || label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {isDownload ? (
          /* === DOWNLOAD: Undersea fiber optic cable cross-section === */
          <g>
            {/* Ocean floor / seabed */}
            <path d="M 0,82 Q 15,78 30,80 Q 50,84 70,79 Q 85,82 100,80"
              fill="none" stroke={color} strokeWidth="0.6" opacity={0.15} />

            {/* Cable outer armor sheath */}
            <rect x={8} y={44} width={84} height={12} rx={6}
              fill={color} opacity={0.06} stroke={color} strokeWidth="0.8" />

            {/* Cable insulation layer */}
            <rect x={12} y={46} width={76} height={8} rx={4}
              fill={color} opacity={0.04} stroke={color} strokeWidth="0.4" />

            {/* Inner fiber core */}
            <rect x={16} y={48} width={68} height={4} rx={2}
              fill={color} opacity={0.1 + act * 0.15} />

            {/* Cable cross-section detail (left end) */}
            <circle cx={8} cy={50} r={8} fill="none" stroke={color} strokeWidth="0.6" opacity={0.2} />
            <circle cx={8} cy={50} r={5} fill={color} opacity={0.05} stroke={color} strokeWidth="0.3" />
            <circle cx={8} cy={50} r={2.5} fill={color} opacity={0.1 + act * 0.2} />

            {/* Light signal pulses travelling through fiber */}
            {online && signals.map((s, i) => (
              prefersReducedMotion ? (
                <circle key={`sig-${i}`} cx={s.x} cy={50} r={1.5}
                  fill={color} opacity={s.opacity}
                  style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
              ) : (
                <motion.circle key={`sig-${i}`} cy={50} r={1.5}
                  fill={color}
                  style={{ filter: `drop-shadow(0 0 2px ${color})` }}
                  animate={{ cx: [16, 84], opacity: [0, s.opacity, 0] }}
                  transition={{ duration: 1.5 - act * 0.6, repeat: Infinity, ease: 'linear', delay: i * (1.2 / signalCount) }}
                />
              )
            ))}

            {/* Cable armor texture lines */}
            {[20, 30, 40, 50, 60, 70, 80].map(x => (
              <line key={`arm-${x}`} x1={x} y1={44} x2={x} y2={56}
                stroke={color} strokeWidth="0.2" opacity={0.06} />
            ))}

            {/* Saturation glow at critical */}
            {showCritical && (
              prefersReducedMotion ? (
                <rect x={16} y={47} width={68} height={6} rx={3}
                  fill={color} opacity={0.15}
                  style={{ filter: `blur(2px) drop-shadow(0 0 4px ${color})` }} />
              ) : (
                <motion.rect x={16} y={47} width={68} height={6} rx={3}
                  fill={color}
                  style={{ filter: `blur(2px) drop-shadow(0 0 4px ${color})` }}
                  animate={{ opacity: [0.1, 0.25, 0.1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )
            )}

            {/* Label */}
            <text x={50} y={38} textAnchor="middle" fill={color} fontSize="4" fontFamily={MONO} opacity={0.35} letterSpacing="0.15em">
              SUBMARINE CABLE
            </text>
            <text x={50} y={70} textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.25}>
              {signalCount} signal{signalCount !== 1 ? 's' : ''} active
            </text>
          </g>
        ) : (
          /* === UPLOAD: Research buoy with antenna telemetry === */
          <g>
            {/* Water surface line */}
            {prefersReducedMotion ? (
              <path d="M 0,52 Q 15,48 30,52 Q 50,56 70,52 Q 85,48 100,52"
                fill="none" stroke={color} strokeWidth="0.6" opacity={0.2} />
            ) : (
              <motion.path
                fill="none" stroke={color} strokeWidth="0.6" opacity={0.2}
                animate={{
                  d: [
                    'M 0,52 Q 15,48 30,52 Q 50,56 70,52 Q 85,48 100,52',
                    'M 0,52 Q 15,56 30,52 Q 50,48 70,52 Q 85,56 100,52',
                  ]
                }}
                transition={{ duration: 3 - act, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              />
            )}

            {/* Buoy body */}
            <ellipse cx={50} cy={54} rx={10} ry={5}
              fill={color} opacity={0.1} stroke={color} strokeWidth="0.8" />
            <rect x={44} y={50} width={12} height={6} rx={2}
              fill={color} opacity={0.08} />

            {/* Buoy keel (underwater) */}
            <line x1={50} y1={59} x2={50} y2={70}
              stroke={color} strokeWidth="0.6" opacity={0.15} />
            <circle cx={50} cy={72} r={2} fill={color} opacity={0.08} />

            {/* Antenna mast */}
            <line x1={50} y1={50} x2={50} y2={28}
              stroke={color} strokeWidth="0.8" opacity={0.3} />
            <circle cx={50} cy={27} r={1.5} fill={color} opacity={0.4} />

            {/* Signal transmission arcs */}
            {online && Array.from({ length: arcCount }, (_, i) => {
              const r = 8 + i * 5;
              const arcOp = (0.3 - i * 0.04) * (0.5 + act);
              return prefersReducedMotion ? (
                <path key={`arc-${i}`}
                  d={`M ${50 - r},28 A ${r},${r} 0 0,1 ${50 + r},28`}
                  fill="none" stroke={color} strokeWidth="0.6" opacity={arcOp} />
              ) : (
                <motion.path key={`arc-${i}`}
                  d={`M ${50 - r},28 A ${r},${r} 0 0,1 ${50 + r},28`}
                  fill="none" stroke={color} strokeWidth="0.6"
                  animate={{ opacity: [0, arcOp, 0] }}
                  transition={{ duration: 2 - act * 0.5, repeat: Infinity, ease: 'easeOut', delay: i * 0.3 }}
                />
              );
            })}

            {/* Warning light on buoy */}
            {online && (
              prefersReducedMotion ? (
                <circle cx={50} cy={49} r={1} fill={color} opacity={0.6} />
              ) : (
                <motion.circle cx={50} cy={49} r={1} fill={color}
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: `drop-shadow(0 0 2px ${color})` }}
                />
              )
            )}

            {/* Underwater waves (ripples from keel) */}
            {[62, 68].map((y, i) => (
              <path key={`ripple-${i}`}
                d={`M ${35 + i * 3},${y} Q 50,${y - 2} ${65 - i * 3},${y}`}
                fill="none" stroke={color} strokeWidth="0.3" opacity={0.08} />
            ))}

            {/* Saturation burst at critical */}
            {showCritical && (
              prefersReducedMotion ? (
                <circle cx={50} cy={27} r={4} fill={color} opacity={0.2}
                  style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
              ) : (
                <motion.circle cx={50} cy={27} r={4} fill={color}
                  style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                  animate={{ opacity: [0.1, 0.3, 0.1], r: [4, 6, 4] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )
            )}

            {/* Label */}
            <text x={50} y={20} textAnchor="middle" fill={color} fontSize="4" fontFamily={MONO} opacity={0.35} letterSpacing="0.15em">
              BUOY TELEMETRY
            </text>
            <text x={50} y={85} textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.25}>
              {arcCount} arc{arcCount !== 1 ? 's' : ''} transmitting
            </text>
          </g>
        )}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{tierLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {isDownload ? 'Inbound' : 'Outbound'}
      </div>
    </div>
  );
};

export default SubmarineCable;
