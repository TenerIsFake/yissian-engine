import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * EnzymeReaction — BIO-mode bandwidth diagram (download + upload).
 * Enzyme-substrate binding visualization with lock-and-key metaphor.
 * Download: substrates flow in (binding). Upload: products flow out (catalysis).
 * Speed of flow proportional to bandwidth level.
 *
 * Props: { label, level, online, details, variant, size, jablonskiLabel }
 * variant: 'emission' → download (substrates flow in), 'excitation' → upload (products flow out)
 */
const EnzymeReaction = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
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

  const isDownload = variant === 'emission';
  const act = level / 100;

  // Colors: green-teal for binding, amber for catalysis
  const baseColor = isDownload ? 'hsl(160, 80%, 55%)' : 'hsl(35, 90%, 60%)';
  const color = online ? baseColor : '#6b7280';
  const colorFaded = online ? (isDownload ? 'hsla(160, 80%, 55%, 0.3)' : 'hsla(35, 90%, 60%, 0.3)') : 'rgba(107,114,128,0.3)';
  const glowFilter = `drop-shadow(0 0 ${2 + act * 4}px ${color})`;

  // Substrate/product molecules — count proportional to bandwidth
  const moleculeCount = Math.max(2, Math.floor(act * 8));
  const flowSpeed = Math.max(0.5, 3 - act * 2.5); // faster at higher levels

  // Enzyme active site shape (lock-and-key)
  const enzymeX = 50, enzymeY = 55;
  // The enzyme has a concave notch (active site)
  const enzymePath = isDownload
    ? 'M 35,45 L 35,65 L 44,65 L 44,58 Q 50,52 56,58 L 56,65 L 65,65 L 65,45 Z'
    : 'M 35,45 L 35,65 L 44,65 L 44,58 Q 50,52 56,58 L 56,65 L 65,65 L 65,45 Z';

  // Substrate shape that fits the notch
  const substratePath = 'M 47,38 Q 50,32 53,38 L 55,44 Q 50,48 45,44 Z';

  // Product path (different shape — reaction product)
  const productPath = 'M 46,68 L 48,72 L 52,72 L 54,68 L 52,64 L 48,64 Z';

  // Flow path for molecules
  const flowMolecules = [];
  for (let i = 0; i < moleculeCount; i++) {
    const phase = i / moleculeCount;
    if (isDownload) {
      // Substrates flowing toward active site from top
      const startY = 5 + (i * 4) % 15;
      const endY = 38;
      flowMolecules.push({ i, startX: 40 + (i * 7) % 20, startY, endX: 50, endY, phase });
    } else {
      // Products flowing away from active site downward
      const startY = 68;
      const endY = 90 + (i * 3) % 8;
      flowMolecules.push({ i, startX: 50, startY, endX: 35 + (i * 8) % 30, endY, phase });
    }
  }

  const modeLabel = isDownload ? 'BINDING' : 'CATALYSIS';

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
            {jablonskiLabel || `ENZYME ◆ ${modeLabel}`}
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>

        {/* Enzyme body */}
        <path d={enzymePath} fill={color} opacity={0.12} stroke={color} strokeWidth="1" />

        {/* Active site highlight (the notch) */}
        <path d="M 44,58 Q 50,52 56,58" fill="none" stroke={color} strokeWidth="1.2" opacity={0.5}
          strokeDasharray={online ? 'none' : '2 2'}
          style={{ filter: online ? glowFilter : 'none' }} />

        {/* Lock-and-key label */}
        <text x={50} y={63} textAnchor="middle" fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.3}>
          ACTIVE SITE
        </text>

        {isDownload ? (
          <>
            {/* Substrate sitting in the active site */}
            {online && (
              <path d={substratePath} fill={color} opacity={0.35}
                stroke={color} strokeWidth="0.6"
                style={{ filter: glowFilter }} />
            )}

            {/* Flowing substrate molecules toward active site */}
            {online && flowMolecules.map(({ i, startX, startY, endX, endY, phase }) => {
              const molEl = (
                <circle r={2} fill={color} opacity={0.3 + act * 0.3}
                  style={{ filter: act > 0.5 ? glowFilter : 'none' }} />
              );
              return prefersReducedMotion ? (
                <g key={`mol-${i}`} transform={`translate(${startX + (endX - startX) * 0.5}, ${startY + (endY - startY) * 0.5})`}>
                  {molEl}
                </g>
              ) : (
                <motion.g key={`mol-${i}`}
                  animate={{
                    x: [startX, endX, startX],
                    y: [startY, endY, startY],
                    opacity: [0.2, 0.6 + act * 0.3, 0.2],
                  }}
                  transition={{
                    duration: flowSpeed + i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: phase * flowSpeed,
                  }}
                >
                  {molEl}
                </motion.g>
              );
            })}

            {/* Direction arrow */}
            <polygon points="48,26 52,26 50,30" fill={color} opacity={0.3 + act * 0.4}
              style={{ filter: glowFilter }} />
          </>
        ) : (
          <>
            {/* Product leaving the active site */}
            {online && (
              <path d={productPath} fill={color} opacity={0.3}
                stroke={color} strokeWidth="0.5"
                style={{ filter: glowFilter }} />
            )}

            {/* Flowing product molecules away from enzyme */}
            {online && flowMolecules.map(({ i, startX, startY, endX, endY, phase }) => {
              const molEl = (
                <rect x={-1.5} y={-1.5} width={3} height={3} rx={0.5}
                  fill={color} opacity={0.3 + act * 0.3}
                  style={{ filter: act > 0.5 ? glowFilter : 'none' }} />
              );
              return prefersReducedMotion ? (
                <g key={`mol-${i}`} transform={`translate(${startX + (endX - startX) * 0.5}, ${startY + (endY - startY) * 0.5})`}>
                  {molEl}
                </g>
              ) : (
                <motion.g key={`mol-${i}`}
                  animate={{
                    x: [startX, endX, startX],
                    y: [startY, endY, startY],
                    opacity: [0.15, 0.5 + act * 0.3, 0.15],
                  }}
                  transition={{
                    duration: flowSpeed + i * 0.25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: phase * flowSpeed,
                  }}
                >
                  {molEl}
                </motion.g>
              );
            })}

            {/* Direction arrow (outward) */}
            <polygon points="48,82 52,82 50,86" fill={color} opacity={0.3 + act * 0.4}
              style={{ filter: glowFilter }} />
          </>
        )}

        {/* Percentage readout */}
        <text x={50} y={97} textAnchor="middle" fill={color} fontSize="5.5" fontFamily={MONO} opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Direction label */}
        <text x={50} y={10} textAnchor="middle" fill={color} fontSize="4.5" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
          {isDownload ? '\u25BC SUBSTRATE' : '\u25B2 PRODUCT'}
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

export default EnzymeReaction;
