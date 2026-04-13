import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SoundboardFader — VINYL-mode Download/Upload bandwidth diagram.
 * Vertical mixing-console channel strip with fader knob and LED meter.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, isJahnTeller, lowSpin, size
 */
const SoundboardFader = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);

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
  const color = online ? `hsl(${hue}, 80%, 55%)` : '#6b7280';

  const act = level / 100;
  const isCritical = level > 80;

  // Fader track geometry
  const trackX = 32;
  const trackTop = 14;
  const trackBottom = 78;
  const trackH = trackBottom - trackTop;
  const knobY = trackBottom - act * trackH; // fader position (bottom = 0, top = 100)
  const knobW = 14;
  const knobH = 6;

  // LED meter (12 segments, right side of fader)
  const ledCount = 12;
  const ledX = 56;
  const ledW = 10;
  const ledH = (trackH - (ledCount - 1) * 0.8) / ledCount;
  const litCount = Math.round(act * ledCount);

  const ledColor = (i) => {
    const pct = i / ledCount;
    if (pct >= 0.83) return 'hsl(0, 85%, 55%)';   // red (top 2)
    if (pct >= 0.67) return 'hsl(45, 90%, 55%)';   // yellow
    return 'hsl(120, 70%, 45%)';                     // green
  };

  // dB markings along left side
  const dbLabels = [
    { db: '+10', pct: 1.0 },
    { db: '0',   pct: 0.7 },
    { db: '-10', pct: 0.4 },
    { db: '-20', pct: 0.2 },
    { db: '-∞',  pct: 0 },
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
            FADER ◆ {isCpu ? 'DOWNLOAD' : 'UPLOAD'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
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

      <svg viewBox="0 0 80 100" style={{ width: size * 0.8, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Channel strip backplate */}
        <rect x={4} y={6} width={72} height={88} rx={4} ry={4}
          fill="rgba(18,18,22,0.8)"
          stroke={color} strokeWidth="0.6" opacity={0.2} />

        {/* Fader track groove */}
        <rect x={trackX - 1} y={trackTop} width={3} height={trackH} rx={1.5}
          fill="rgba(255,255,255,0.04)"
          stroke={color} strokeWidth="0.4" opacity={0.2} />

        {/* Fader track center line */}
        <line x1={trackX + 0.5} y1={trackTop + 2} x2={trackX + 0.5} y2={trackBottom - 2}
          stroke={color} strokeWidth="0.3" opacity={0.15} />

        {/* dB markings */}
        {dbLabels.map(({ db, pct }) => {
          const y = trackBottom - pct * trackH;
          return (
            <g key={db}>
              <line x1={trackX - 6} y1={y} x2={trackX - 2} y2={y}
                stroke={color} strokeWidth="0.4" opacity={0.25} />
              <text x={trackX - 8} y={y + 1.5} textAnchor="end"
                fill={color} fontSize="3" fontFamily={MONO} opacity={0.3}>
                {db}
              </text>
            </g>
          );
        })}

        {/* Fader knob */}
        <rect
          x={trackX - knobW / 2 + 0.5}
          y={knobY - knobH / 2}
          width={knobW}
          height={knobH}
          rx={1.5}
          fill={online ? color : '#374151'}
          opacity={online ? 0.75 : 0.3}
          stroke={online ? color : '#4b5563'}
          strokeWidth="0.5"
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }}
        />
        {/* Knob center line */}
        <line
          x1={trackX - knobW / 2 + 3}
          y1={knobY}
          x2={trackX + knobW / 2 - 2}
          y2={knobY}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />

        {/* LED meter bars */}
        {Array.from({ length: ledCount }).map((_, i) => {
          const segY = trackBottom - (i + 1) * (ledH + 0.8) + 0.8;
          const isLit = i < litCount;
          const segColor = ledColor(i);
          const ledRect = (
            <rect
              key={i}
              x={ledX}
              y={segY}
              width={ledW}
              height={ledH}
              rx={0.5}
              fill={isLit ? segColor : 'rgba(255,255,255,0.04)'}
              opacity={isLit ? 0.8 : 0.15}
              stroke={isLit ? segColor : 'rgba(255,255,255,0.06)'}
              strokeWidth="0.3"
              style={isLit ? { filter: `drop-shadow(0 0 1px ${segColor})` } : {}}
            />
          );
          // Animate top lit LED at critical
          if (i === litCount - 1 && isCritical && !prefersReducedMotion && isLit) {
            return (
              <motion.rect
                key={i}
                x={ledX}
                y={segY}
                width={ledW}
                height={ledH}
                rx={0.5}
                fill={segColor}
                stroke={segColor}
                strokeWidth="0.3"
                animate={{ opacity: [0.9, 0.4, 0.9] }}
                transition={{ duration: 0.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: `drop-shadow(0 0 3px ${segColor})` }}
              />
            );
          }
          return ledRect;
        })}

        {/* Channel label at bottom */}
        <text x={40} y={95} textAnchor="middle" fill={color} fontSize="5.5" fontFamily={MONO} fontWeight="bold" opacity={0.8}>
          {level.toFixed(0)}%
        </text>

        {/* CH label top */}
        <text x={40} y={11} textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.35} letterSpacing="0.15em">
          CH
        </text>
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default SoundboardFader;
