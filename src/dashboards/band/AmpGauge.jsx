import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * AmpGauge -- BAND-mode CPU/RAM diagram.
 * Guitar amplifier front panel with a large knob/dial that goes to 11.
 * LED indicator row (green -> amber -> red), amp grill texture background.
 *
 * Props: label, level, online, details, metal, isJahnTeller, lowSpin, size
 * metal: 'Fe'|'Cu' -> CPU hue (200->0), 'Co'|'Ni' -> RAM hue (160->30)
 */
const AmpGauge = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
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
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.35)` : 'rgba(107,114,128,0.35)';

  const act = level / 100;
  // Dial rotation: 0-100% maps to -135deg to +135deg (270 degree sweep), scaled to "11"
  const dialAngle = -135 + act * 270;
  const volume11 = (act * 11).toFixed(1);

  // LED count: 11 LEDs
  const ledCount = 11;
  const litLeds = Math.round(act * ledCount);

  const getLedColor = (i) => {
    if (i >= litLeds) return 'rgba(255,255,255,0.06)';
    if (i < 7) return '#22c55e';     // green
    if (i < 9) return '#f59e0b';     // amber
    return '#ef4444';                  // red
  };

  const channelLabel = isCpu ? 'GAIN' : 'TONE';

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
            AMP_GAUGE {isCpu ? 'CPU' : 'RAM'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            Volume: {volume11} / 11
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

      <svg viewBox="0 0 100 110" style={{ width: size, height: size * 1.1 }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% -- ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Amp body */}
        <rect x={5} y={2} width={90} height={106} rx={6}
          fill="rgba(20,20,20,0.9)" stroke={colorFaded} strokeWidth={0.8} />

        {/* Grill texture (horizontal lines) */}
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`grill-${i}`}
            x1={12} y1={58 + i * 4} x2={88} y2={58 + i * 4}
            stroke="rgba(255,255,255,0.04)" strokeWidth={0.8} />
        ))}

        {/* "VOLUME" label */}
        <text x={50} y={14} textAnchor="middle" fill={color} fontSize="5" fontFamily={MONO} opacity={0.6} letterSpacing="0.15em">
          VOLUME
        </text>

        {/* LED indicator row */}
        {Array.from({ length: ledCount }, (_, i) => (
          <circle key={`led-${i}`}
            cx={18 + i * 6} cy={20}
            r={2}
            fill={getLedColor(i)}
            opacity={i < litLeds ? (online ? 0.9 : 0.3) : 0.15}
            style={i < litLeds && online ? { filter: `drop-shadow(0 0 2px ${getLedColor(i)})` } : {}}
          />
        ))}

        {/* Dial knob outer ring */}
        <circle cx={50} cy={40} r={16}
          fill="rgba(30,30,30,0.95)" stroke={colorFaded} strokeWidth={1} />

        {/* Dial tick marks (0 to 11) */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = -135 + i * (270 / 11);
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + Math.cos(rad) * 13;
          const y1 = 40 + Math.sin(rad) * 13;
          const x2 = 50 + Math.cos(rad) * 15.5;
          const y2 = 40 + Math.sin(rad) * 15.5;
          return (
            <g key={`tick-${i}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
              <text
                x={50 + Math.cos(rad) * 18} y={40 + Math.sin(rad) * 18 + 1.5}
                textAnchor="middle" fill="rgba(255,255,255,0.2)"
                fontSize="3" fontFamily={MONO}>{i}</text>
            </g>
          );
        })}

        {/* Dial pointer */}
        {(() => {
          const rad = (dialAngle * Math.PI) / 180;
          const px = 50 + Math.cos(rad) * 11;
          const py = 40 + Math.sin(rad) * 11;
          return prefersReducedMotion ? (
            <line x1={50} y1={40} x2={px} y2={py}
              stroke={color} strokeWidth={1.5} strokeLinecap="round"
              style={online ? { filter: `drop-shadow(0 0 3px ${color})` } : {}} />
          ) : (
            <motion.line x1={50} y1={40} x2={px} y2={py}
              stroke={color} strokeWidth={1.5} strokeLinecap="round"
              style={online ? { filter: `drop-shadow(0 0 3px ${color})` } : {}}
              initial={false}
              animate={{ x2: px, y2: py }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          );
        })()}

        {/* Center dot */}
        <circle cx={50} cy={40} r={2.5}
          fill={online ? color : '#374151'}
          style={online ? { filter: `drop-shadow(0 0 2px ${color})` } : {}} />

        {/* Level readout below dial */}
        <text x={50} y={65} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>

        {/* Channel label */}
        <text x={50} y={72} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="4" fontFamily={MONO} letterSpacing="0.2em">
          {channelLabel}
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {volume11} / 11
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {isCpu ? 'CPU' : 'RAM'} | {lowSpin ? 'Cranked' : 'Clean'}
      </div>
    </div>
  );
};

export default AmpGauge;
