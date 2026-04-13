import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SubspaceRelay — SPACE-mode replacement for JablonskiDiagram.
 * Parabolic satellite dish with propagating signal wave arcs.
 * DOWNLINK (emission): waves descend into dish focal point.
 * UPLINK (excitation): waves radiate outward from focal point.
 *
 * Props match JablonskiDiagram interface:
 *   label, level, online, details, variant, size, jablonskiLabel
 */
const SubspaceRelay = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current.NOBLE;
  const isDownlink = variant === 'emission';
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const waveCount = Math.floor(level / 20) + 1; // 1-6 waves
  const waveOpacity = 0.15 + act * 0.7;
  const beamWidth = 4 + act * 8;
  const signalColor = isDownlink ? cat.border : cat.text;
  const glowFilter = `drop-shadow(0 0 ${2 + act * 5}px ${signalColor})`;

  // Generate wave arc paths
  const waves = Array.from({ length: Math.min(waveCount, 6) }, (_, i) => {
    const arcW = 8 + i * 6;
    const arcH = 4 + i * 3;
    const y = isDownlink ? 48 - i * 7 : 48 - i * 7; // waves above focal point
    const opacity = waveOpacity * (1 - i * 0.12);
    const sw = Math.max(0.6, 1.4 - i * 0.15);
    return { arcW, arcH, y, opacity, sw, i };
  });

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-2"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          ...(tooltipAbove ? { bottom: 'calc(100% + 8px)', top: 'auto' } : { top: 'calc(100% + 8px)', bottom: 'auto' }),
          left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          minWidth: 130, background: 'rgba(0,0,0,0.88)',
          border: `1px solid ${signalColor}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${signalColor}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            {jablonskiLabel || (isDownlink ? 'SIGNAL ◆ DOWNLINK' : 'SIGNAL ◆ UPLINK')}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: signalColor, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: signalColor, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{d.label}</span>
              <span style={{ color: signalColor }}>{d.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? signalColor : '#374151' }} />
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              {online ? 'ONLINE' : online === null ? 'STARTING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Dish parabola */}
        <path d="M 15,68 Q 50,88 85,68"
          stroke={signalColor} strokeWidth="1.8" fill="none" opacity={0.5} />
        {/* Dish fill */}
        <path d="M 15,68 Q 50,88 85,68"
          stroke="none" fill={signalColor} opacity={0.03} />

        {/* Dish support strut */}
        <line x1={50} y1={76} x2={50} y2={86}
          stroke={signalColor} strokeWidth="0.8" opacity={0.25} />
        {/* Support cross-brace */}
        <line x1={35} y1={72} x2={50} y2={56}
          stroke={signalColor} strokeWidth="0.5" opacity={0.15} strokeDasharray="2 3" />
        <line x1={65} y1={72} x2={50} y2={56}
          stroke={signalColor} strokeWidth="0.5" opacity={0.15} strokeDasharray="2 3" />

        {/* Focal point */}
        <circle cx={50} cy={56} r={3}
          fill={online ? signalColor : '#374151'}
          opacity={online ? 0.85 : 0.4}
          style={{ filter: online ? glowFilter : 'none' }} />

        {/* Signal beam (faint central column) */}
        {online && (
          <line x1={50} y1={isDownlink ? waves[waves.length - 1]?.y ?? 20 : 56}
                x2={50} y2={isDownlink ? 56 : waves[waves.length - 1]?.y ?? 20}
            stroke={signalColor} strokeWidth={beamWidth} opacity={0.06 + act * 0.08}
            strokeLinecap="round" />
        )}

        {/* Signal wave arcs */}
        {waves.map(({ arcW, arcH, y, opacity: wOp, sw, i: wi }) => {
          const waveEl = (
            <path
              d={`M ${50 - arcW},${y} A ${arcW},${arcH} 0 0,${isDownlink ? 0 : 1} ${50 + arcW},${y}`}
              stroke={signalColor} strokeWidth={sw} fill="none"
              opacity={wOp}
              style={{ filter: wOp > 0.5 ? glowFilter : 'none' }}
            />
          );
          return prefersReducedMotion ? (
            <g key={`wave-${wi}`}>{waveEl}</g>
          ) : (
            <motion.g key={`wave-${wi}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [wOp * 0.7, wOp, wOp * 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: wi * 0.3 }}
            >
              {waveEl}
            </motion.g>
          );
        })}

        {/* Direction indicator arrow */}
        {online && (
          isDownlink
            ? <polygon points="46,54 54,54 50,58" fill={signalColor} opacity={0.3 + act * 0.5} style={{ filter: glowFilter }} />
            : <polygon points="46,58 54,58 50,54" fill={signalColor} opacity={0.3 + act * 0.5} style={{ filter: glowFilter }} />
        )}

        {/* Percentage readout */}
        <text x={50} y={97} textAnchor="middle" fill={signalColor} fontSize="5.5" fontFamily={MONO} opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Direction label */}
        <text x={50} y={10} textAnchor="middle" fill={signalColor} fontSize="4.5" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
          {isDownlink ? '▼ DOWNLINK' : '▲ UPLINK'}
        </text>

        {/* Online dot */}
        <circle cx={88} cy={93} r={2.5} fill={online ? signalColor : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${signalColor})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default SubspaceRelay;
