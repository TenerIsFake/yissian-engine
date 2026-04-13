import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// ─────────────────────────────────────────────
// ORBITAL DIAGRAM (system metrics)
// ─────────────────────────────────────────────
const OrbitalDiagram = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current[catKey];
  const cx = 50, cy = 50;
  const radii = [10, 18, 26, 34];
  const maxE =  [2,  8,  18, 32];
  const total = Math.round((level / 100) * 60);
  let rem = total;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

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
          ...(tooltipAbove
            ? { bottom: 'calc(100% + 8px)', top: 'auto' }
            : { top: 'calc(100% + 8px)', bottom: 'auto' }),
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          minWidth: 120,
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${cat.border}`,
          borderRadius: 8,
          padding: '8px 10px',
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${cat.border}40`,
          pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 8, color: cat.text, letterSpacing: '0.2em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: cat.border, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{d.label}</span>
              <span style={{ color: cat.text }}>{d.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? cat.border : '#374151' }} />
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              {online ? 'ONLINE' : online === null ? 'STARTING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(0)}% load, ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        {radii.map((r, i) => {
          const filled = Math.min(rem, maxE[i]);
          rem -= filled;
          const frac = maxE[i] > 0 ? filled / maxE[i] : 0;
          const circ = 2 * Math.PI * r;
          const arcStyle = { opacity: 0.75 + frac * 0.2, filter: `drop-shadow(0 0 ${2 + frac * 5}px ${cat.border})` };
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={cat.border} strokeWidth="0.8" opacity="0.15" />
              {frac > 0 && (
                prefersReducedMotion
                  ? <circle cx={cx} cy={cy} r={r} fill="none"
                      stroke={cat.border} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${frac * circ} ${circ}`}
                      transform={`rotate(-90 ${cx} ${cy})`}
                      style={arcStyle}
                    />
                  : <motion.circle cx={cx} cy={cy} r={r} fill="none"
                      stroke={cat.border} strokeWidth="3" strokeLinecap="round"
                      style={arcStyle}
                      strokeDasharray={`${frac * circ} ${circ}`}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 1, ease: 'easeOut', delay: i * 0.15 }}
                      transform={`rotate(-90 ${cx} ${cy})`}
                    />
              )}
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r="5" fill={online ? cat.border : '#374151'} opacity="0.85"
          style={{ filter: online ? `drop-shadow(0 0 ${3 + (level / 100) * 4}px ${cat.border})` : 'none' }} />
        <text x={cx} y={cy + 18} textAnchor="middle" fill={cat.text} fontSize="7" fontFamily={MONO} opacity="0.85">
          {level.toFixed(0)}%
        </text>
      </svg>
      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default OrbitalDiagram;
