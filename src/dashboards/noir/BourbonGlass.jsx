import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BourbonGlass — NOIR-mode bandwidth diagram (Download + Upload).
 * Side view of an old-fashioned whiskey glass with liquid level.
 * Ice cubes float, liquid swirls when active, condensation at high levels.
 *
 * Props: label, level, online, details, variant, size, jablonskiLabel
 * variant: 'emission' -> Download (amber), 'excitation' -> Upload (darker)
 */
const BourbonGlass = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const clipId = useId();
  const gradId = useId();
  const isDownload = variant === 'emission';

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const act = level / 100;
  // Amber for download, darker whiskey for upload
  const liquidHue = isDownload ? 35 : 25;
  const liquidSat = isDownload ? 90 : 70;
  const liquidLight = isDownload ? 50 : 35;
  const color = online ? `hsl(${liquidHue}, ${liquidSat}%, ${liquidLight}%)` : '#6b7280';
  const colorFaded = online ? `hsla(${liquidHue}, ${liquidSat}%, ${liquidLight}%, 0.4)` : 'rgba(107,114,128,0.35)';

  // Glass geometry (old-fashioned / rocks glass shape — wider at top)
  const glassTopY = 22;
  const glassBottomY = 82;
  const glassH = glassBottomY - glassTopY;
  const topHalfW = 36; // half-width at top
  const botHalfW = 28; // half-width at bottom
  const cx = 50;

  // Liquid fill
  const fillH = act * (glassH - 4);
  const fillTopY = glassBottomY - 2 - fillH;
  // Width at fill top (linear interpolation)
  const fillFrac = 1 - fillH / glassH;
  const fillHalfW = botHalfW + (topHalfW - botHalfW) * (1 - fillFrac);

  const showCondensation = level > 65;

  // Glass outline path (trapezoid with slight curve)
  const glassPath = `M ${cx - topHalfW},${glassTopY} L ${cx - botHalfW},${glassBottomY} L ${cx + botHalfW},${glassBottomY} L ${cx + topHalfW},${glassTopY}`;
  // Glass bottom
  const glassBottomPath = `M ${cx - botHalfW},${glassBottomY} L ${cx + botHalfW},${glassBottomY}`;
  // Glass clip (for liquid)
  const clipPath = `M ${cx - topHalfW + 1},${glassTopY + 1} L ${cx - botHalfW + 1},${glassBottomY - 1} L ${cx + botHalfW - 1},${glassBottomY - 1} L ${cx + topHalfW - 1},${glassTopY + 1} Z`;

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
          border: `1px solid ${color}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${color}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            {jablonskiLabel || (isDownload ? 'BOURBON ◆ POUR' : 'BOURBON ◆ SWIG')}
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

      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${isDownload ? 'download' : 'upload'} — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        <defs>
          <clipPath id={clipId}>
            <path d={clipPath} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.7} />
            <stop offset="60%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0.25} />
          </linearGradient>
        </defs>

        {/* Glass body outline */}
        <path d={glassPath} fill="none" stroke={color} strokeWidth="1.2" opacity={0.3}
          strokeLinejoin="round" />
        {/* Glass bottom thick line */}
        <path d={glassBottomPath} fill="none" stroke={color} strokeWidth="2" opacity={0.25} />
        {/* Glass base/foot */}
        <line x1={cx - botHalfW - 4} y1={glassBottomY + 3} x2={cx + botHalfW + 4} y2={glassBottomY + 3}
          stroke={color} strokeWidth="1.5" opacity={0.2} strokeLinecap="round" />
        <line x1={cx} y1={glassBottomY} x2={cx} y2={glassBottomY + 3}
          stroke={color} strokeWidth="1" opacity={0.15} />

        {/* Glass interior tint */}
        <path d={clipPath} fill={color} opacity={0.02} />

        {/* Liquid fill */}
        {fillH > 0 && (
          <g clipPath={`url(#${clipId})`}>
            <rect x={cx - topHalfW} y={fillTopY} width={topHalfW * 2} height={fillH + 4}
              fill={`url(#${gradId})`} />

            {/* Liquid surface wave */}
            {fillH > 4 && (
              prefersReducedMotion
                ? <path
                    d={`M ${cx - fillHalfW},${fillTopY} Q ${cx},${fillTopY - 1.5} ${cx + fillHalfW},${fillTopY}`}
                    stroke={color} strokeWidth="0.8" fill="none" opacity={0.5} />
                : <motion.path
                    d={`M ${cx - fillHalfW},${fillTopY} Q ${cx},${fillTopY - 1.5} ${cx + fillHalfW},${fillTopY}`}
                    stroke={color} strokeWidth="0.8" fill="none" opacity={0.5}
                    animate={{
                      d: [
                        `M ${cx - fillHalfW},${fillTopY} Q ${cx},${fillTopY - 1.5} ${cx + fillHalfW},${fillTopY}`,
                        `M ${cx - fillHalfW},${fillTopY} Q ${cx},${fillTopY + 1} ${cx + fillHalfW},${fillTopY}`,
                        `M ${cx - fillHalfW},${fillTopY} Q ${cx},${fillTopY - 1.5} ${cx + fillHalfW},${fillTopY}`,
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
            )}

            {/* Swirl animation (active) */}
            {online && level > 20 && !prefersReducedMotion && (
              <motion.ellipse
                cx={cx} cy={fillTopY + fillH * 0.4}
                rx={fillHalfW * 0.5} ry={2}
                fill="none" stroke={color} strokeWidth="0.5" opacity={0.15}
                animate={{ rx: [fillHalfW * 0.3, fillHalfW * 0.6, fillHalfW * 0.3], ry: [1, 3, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </g>
        )}

        {/* Ice cubes (2 rounded rectangles floating near surface) */}
        {fillH > 10 && online && (
          <>
            {prefersReducedMotion ? (
              <>
                <rect x={cx - 10} y={fillTopY + 1} width={8} height={6} rx={1.5}
                  fill="rgba(200,220,240,0.2)" stroke="rgba(200,220,240,0.15)" strokeWidth="0.5" />
                <rect x={cx + 3} y={fillTopY + 3} width={7} height={5} rx={1.5}
                  fill="rgba(200,220,240,0.15)" stroke="rgba(200,220,240,0.12)" strokeWidth="0.5" />
              </>
            ) : (
              <>
                <motion.rect x={cx - 10} y={fillTopY + 1} width={8} height={6} rx={1.5}
                  fill="rgba(200,220,240,0.2)" stroke="rgba(200,220,240,0.15)" strokeWidth="0.5"
                  animate={{ y: [fillTopY + 1, fillTopY - 0.5, fillTopY + 1], rotate: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: `${cx - 6}px ${fillTopY + 4}px` }}
                />
                <motion.rect x={cx + 3} y={fillTopY + 3} width={7} height={5} rx={1.5}
                  fill="rgba(200,220,240,0.15)" stroke="rgba(200,220,240,0.12)" strokeWidth="0.5"
                  animate={{ y: [fillTopY + 3, fillTopY + 1, fillTopY + 3], rotate: [1, -1.5, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  style={{ transformOrigin: `${cx + 6.5}px ${fillTopY + 5.5}px` }}
                />
              </>
            )}
          </>
        )}

        {/* Condensation drops on glass exterior at high levels */}
        {showCondensation && online && (
          <>
            {[
              { x: cx - topHalfW - 1.5, y: 38 },
              { x: cx - topHalfW - 0.5, y: 52 },
              { x: cx + topHalfW + 1, y: 45 },
              { x: cx + topHalfW + 0.5, y: 62 },
            ].map((drop, i) => (
              prefersReducedMotion ? (
                <ellipse key={`drop-${i}`} cx={drop.x} cy={drop.y} rx={1} ry={1.5}
                  fill={color} opacity={0.15} />
              ) : (
                <motion.ellipse key={`drop-${i}`} cx={drop.x} cy={drop.y} rx={1} ry={1.5}
                  fill={color} opacity={0.15}
                  animate={{ cy: [drop.y, drop.y + 3, drop.y], opacity: [0.15, 0.08, 0.15] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
                />
              )
            ))}
          </>
        )}

        {/* Rim highlight */}
        <line x1={cx - topHalfW + 2} y1={glassTopY} x2={cx + topHalfW - 2} y2={glassTopY}
          stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" strokeLinecap="round" />

        {/* Direction label */}
        <text x={cx} y={14} textAnchor="middle" fill={color} fontSize="4.5" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
          {isDownload ? '\u25BC POUR' : '\u25B2 SWIG'}
        </text>

        {/* Percentage readout */}
        <text x={cx} y={96} textAnchor="middle" fill={color} fontSize="5.5" fontFamily={MONO} opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={88} cy={93} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default BourbonGlass;
