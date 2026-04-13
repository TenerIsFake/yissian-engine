import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * DNAHelix — BIO-mode storage diagram (Server Storage + Media Storage).
 * Double helix side view — two intertwined strands.
 * Helix fills/unfurls proportional to storage level.
 * Base pairs (rungs) colored by cat theme.
 * At >90%: helix starts unwinding (stress response).
 *
 * Props: { label, level, online, details, catKey, size }
 */
const DNAHelix = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const gradId = useId();
  const cat = activeCATRef.current[catKey];

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const act = level / 100;
  const isStressed = level > 90 && online;
  const totalRungs = 12;
  const filledRungs = Math.round(act * totalRungs);

  // Helix geometry: two sinusoidal backbone strands
  // Each rung connects the two strands at a given y position
  const helixCenterX = 50;
  const helixTopY = 12;
  const helixBottomY = 82;
  const helixSpan = helixBottomY - helixTopY;
  const amplitude = 14; // horizontal sway of the helix

  // Generate backbone points and rungs
  const rungData = [];
  for (let i = 0; i < totalRungs; i++) {
    const t = i / (totalRungs - 1);
    const y = helixTopY + t * helixSpan;
    const phase = t * Math.PI * 3; // 1.5 full twists
    const strandAx = helixCenterX + Math.sin(phase) * amplitude;
    const strandBx = helixCenterX - Math.sin(phase) * amplitude;
    const isFilled = i < filledRungs;
    // Unwind effect: spread strands apart when stressed
    const unwindSpread = isStressed ? Math.sin(t * Math.PI) * 6 : 0;
    rungData.push({
      y,
      ax: strandAx - unwindSpread,
      bx: strandBx + unwindSpread,
      isFilled,
      depth: Math.cos(phase), // for 3D depth shading (-1 to 1)
    });
  }

  // Build backbone polyline paths
  const strandAPath = rungData.map((r, i) => `${i === 0 ? 'M' : 'L'} ${r.ax.toFixed(1)},${r.y.toFixed(1)}`).join(' ');
  const strandBPath = rungData.map((r, i) => `${i === 0 ? 'M' : 'L'} ${r.bx.toFixed(1)},${r.y.toFixed(1)}`).join(' ');

  // Smooth backbone curves (cubic bezier through points)
  function smoothPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x.toFixed(1)},${cpY.toFixed(1)} ${curr.x.toFixed(1)},${cpY.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
    }
    return d;
  }

  const strandASmooth = smoothPath(rungData.map(r => ({ x: r.ax, y: r.y })));
  const strandBSmooth = smoothPath(rungData.map(r => ({ x: r.bx, y: r.y })));

  // Base pair colors (alternating from theme)
  const pairColors = [cat.border, cat.text, cat.glow.replace(/[\d.]+\)$/, '0.7)')];

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
          minWidth: 120, background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${cat.border}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${cat.border}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            DNA_HELIX ◆ CAPACITY
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: cat.text, letterSpacing: '0.2em', marginBottom: 6 }}>
            {label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: cat.border, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          {isStressed && (
            <div style={{ fontFamily: MONO, fontSize: 7, color: '#ef4444', marginBottom: 4 }}>
              HELIX UNWINDING — STRESS
            </div>
          )}
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

        {/* Base pair rungs (drawn first so backbones overlay) */}
        {rungData.map((rung, i) => {
          const pairColor = pairColors[i % pairColors.length];
          const opacity = rung.isFilled ? (0.3 + act * 0.4) : 0.06;
          // Depth-based rendering: rungs behind backbone are dimmer
          const depthOpacity = (1 + rung.depth) / 2; // 0-1
          const finalOpacity = opacity * (0.4 + depthOpacity * 0.6);

          const rungEl = (
            <line
              x1={rung.ax} y1={rung.y} x2={rung.bx} y2={rung.y}
              stroke={rung.isFilled ? pairColor : cat.border}
              strokeWidth={rung.isFilled ? 1.5 : 0.5}
              opacity={finalOpacity}
              strokeDasharray={rung.isFilled ? 'none' : '1.5 1.5'}
            />
          );

          // Stress: rungs wobble when unwinding
          if (isStressed && rung.isFilled && !prefersReducedMotion) {
            return (
              <motion.g key={`rung-${i}`}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ duration: 1 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: `${helixCenterX}px ${rung.y}px` }}
              >
                {rungEl}
                {/* Base pair dots at connection points */}
                <circle cx={rung.ax} cy={rung.y} r={1.2} fill={pairColor} opacity={finalOpacity * 1.2} />
                <circle cx={rung.bx} cy={rung.y} r={1.2} fill={pairColor} opacity={finalOpacity * 1.2} />
              </motion.g>
            );
          }

          return (
            <g key={`rung-${i}`}>
              {rungEl}
              {rung.isFilled && (
                <>
                  <circle cx={rung.ax} cy={rung.y} r={1.2} fill={pairColor} opacity={finalOpacity * 1.2} />
                  <circle cx={rung.bx} cy={rung.y} r={1.2} fill={pairColor} opacity={finalOpacity * 1.2} />
                </>
              )}
            </g>
          );
        })}

        {/* Backbone strand A */}
        {prefersReducedMotion || !online ? (
          <path d={strandASmooth} fill="none" stroke={cat.border} strokeWidth="1.5" opacity={0.5} />
        ) : (
          <motion.path d={strandASmooth} fill="none" stroke={cat.border} strokeWidth="1.5"
            animate={isStressed
              ? { opacity: [0.5, 0.3, 0.5], strokeWidth: [1.5, 1, 1.5] }
              : { opacity: [0.4, 0.6, 0.4] }
            }
            transition={{ duration: isStressed ? 1.5 : 4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Backbone strand B */}
        {prefersReducedMotion || !online ? (
          <path d={strandBSmooth} fill="none" stroke={cat.text} strokeWidth="1.5" opacity={0.4} />
        ) : (
          <motion.path d={strandBSmooth} fill="none" stroke={cat.text} strokeWidth="1.5"
            animate={isStressed
              ? { opacity: [0.4, 0.2, 0.4], strokeWidth: [1.5, 1, 1.5] }
              : { opacity: [0.35, 0.55, 0.35] }
            }
            transition={{ duration: isStressed ? 1.5 : 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
        )}

        {/* Fill level indicator line */}
        {filledRungs > 0 && filledRungs < totalRungs && (
          <line x1={20} y1={rungData[filledRungs - 1].y + 2} x2={80} y2={rungData[filledRungs - 1].y + 2}
            stroke={cat.border} strokeWidth="0.3" opacity={0.2} strokeDasharray="2 3" />
        )}

        {/* Percentage readout */}
        <text x={50} y={95} textAnchor="middle" fill={cat.border} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>

        {/* Stress warning */}
        {isStressed && (
          <text x={50} y={8} textAnchor="middle" fill="#ef4444" fontSize="4" fontFamily={MONO} opacity={0.6} letterSpacing="0.1em">
            UNWINDING
          </text>
        )}

        {/* Online dot */}
        <circle cx={88} cy={92} r={2.5} fill={online ? cat.border : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${cat.border})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default DNAHelix;
