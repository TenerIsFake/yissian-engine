import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * TitrationBurette — MOLECULE-mode Download/Upload bandwidth diagram.
 * Vertical burette tube with stopcock at bottom.
 * Download: liquid drains from top (high fill = high bandwidth).
 * Upload: liquid fills from bottom.
 * Drop animation at the tip proportional to rate.
 *
 * Props match JablonskiDiagram interface:
 *   label, level, online, details, variant, size, jablonskiLabel
 * - variant: 'emission' → Download (draining). 'excitation' → Upload (filling).
 */
const TitrationBurette = ({ label, level, online, details = [], variant = 'emission', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const clipId = useId();
  const gradId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isDownload = variant === 'emission';
  const act = level / 100;

  // Color: cyan-ish for download, purple-ish for upload
  const hue = isDownload ? 190 : 270;
  const color = online ? `hsl(${hue}, 80%, 60%)` : '#6b7280';

  // Burette geometry in 100x100 viewBox
  const tubeX = 42, tubeW = 16;
  const tubeTop = 10, tubeBot = 72;
  const tubeH = tubeBot - tubeTop;

  // Stopcock at bottom
  const cockY = tubeBot;
  const cockW = 24, cockH = 5;

  // Tip below stopcock
  const tipX = 50, tipTop = cockY + cockH, tipBot = tipTop + 8;

  // Liquid fill — download fills from top, upload fills from bottom
  const fillH = act * tubeH;
  const fillTop = isDownload ? tubeTop + 1 : tubeBot - fillH;
  const fillBot = isDownload ? tubeTop + 1 + fillH : tubeBot;

  // Drop animation count based on level
  const dropCount = level < 10 ? 0 : level < 40 ? 1 : level < 70 ? 2 : 3;
  const drops = React.useMemo(() => {
    return Array.from({ length: dropCount }, (_, i) => ({
      delay: i * 0.8,
      dur: 1.2 + i * 0.3,
      idx: i,
    }));
  }, [dropCount]);

  // Graduation marks
  const gradMarks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

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
            {jablonskiLabel || (isDownload ? 'TITRATION ABSORPTION' : 'TITRATION EMISSION')}
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% ${isDownload ? 'download' : 'upload'} ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        <defs>
          <clipPath id={clipId}>
            <rect x={tubeX + 1} y={tubeTop + 1} width={tubeW - 2} height={tubeH - 2} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1={isDownload ? '0' : '1'} x2="0" y2={isDownload ? '1' : '0'}>
            <stop offset="0%" stopColor={color} stopOpacity={0.7} />
            <stop offset="100%" stopColor={color} stopOpacity={0.25} />
          </linearGradient>
        </defs>

        {/* Burette tube outline */}
        <rect x={tubeX} y={tubeTop} width={tubeW} height={tubeH}
          fill={color} fillOpacity={0.02}
          stroke={color} strokeWidth="1" opacity={0.35} rx={1} />

        {/* Top opening (flared rim) */}
        <line x1={tubeX - 3} y1={tubeTop} x2={tubeX + tubeW + 3} y2={tubeTop}
          stroke={color} strokeWidth="1.2" opacity={0.4} />

        {/* Graduation marks along left side */}
        {gradMarks.map(pct => {
          const gy = tubeTop + tubeH - (pct / 100) * tubeH;
          const isMajor = pct % 25 === 0;
          return (
            <g key={`grad-${pct}`}>
              <line x1={tubeX - (isMajor ? 4 : 2)} y1={gy} x2={tubeX} y2={gy}
                stroke={color} strokeWidth={isMajor ? 0.6 : 0.3} opacity={0.3} />
              {isMajor && (
                <text x={tubeX - 5} y={gy + 1.5} textAnchor="end"
                  fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.3}>
                  {pct}
                </text>
              )}
            </g>
          );
        })}

        {/* Liquid fill */}
        {fillH > 0 && (
          <g clipPath={`url(#${clipId})`}>
            <rect x={tubeX + 1} y={fillTop} width={tubeW - 2} height={fillBot - fillTop}
              fill={`url(#${gradId})`} />
          </g>
        )}

        {/* Stopcock body */}
        <rect x={50 - cockW / 2} y={cockY} width={cockW} height={cockH}
          fill={color} fillOpacity={0.08}
          stroke={color} strokeWidth="0.8" opacity={0.35} rx={1} />
        {/* Stopcock handle */}
        <rect x={50 - 2} y={cockY + 1} width={4} height={cockH - 2}
          fill={online ? color : '#374151'} opacity={0.4} rx={0.5} />

        {/* Tip / nozzle */}
        <line x1={tipX} y1={tipTop} x2={tipX} y2={tipBot}
          stroke={color} strokeWidth="1.5" opacity={0.3} strokeLinecap="round" />

        {/* Dripping drops at tip */}
        {online && drops.map(d => (
          prefersReducedMotion ? (
            <circle key={`drop-${d.idx}`} cx={tipX} cy={tipBot + 3} r={1.5}
              fill={color} opacity={0.4} />
          ) : (
            <motion.circle
              key={`drop-${d.idx}`}
              cx={tipX} r={1.5}
              fill={color}
              animate={{
                cy: [tipBot, tipBot + 12],
                opacity: [0.6, 0],
                scale: [1, 0.5],
              }}
              transition={{
                duration: d.dur,
                repeat: Infinity,
                ease: 'easeIn',
                delay: d.delay,
              }}
            />
          )
        ))}

        {/* Direction arrow */}
        {online && (
          isDownload
            ? <polygon points={`${tipX - 3},${tipBot - 2} ${tipX + 3},${tipBot - 2} ${tipX},${tipBot + 1}`}
                fill={color} opacity={0.3} />
            : <polygon points={`${tipX - 3},${tubeTop + 5} ${tipX + 3},${tubeTop + 5} ${tipX},${tubeTop + 2}`}
                fill={color} opacity={0.3} />
        )}

        {/* Direction label */}
        <text x={50} y={7} textAnchor="middle" fill={color} fontSize="4" fontFamily={MONO}
          opacity={0.35} letterSpacing="0.1em">
          {isDownload ? '\u25BC ABSORPTION' : '\u25B2 EMISSION'}
        </text>

        {/* Percentage readout (right side) */}
        <text x={tubeX + tubeW + 5} y={tubeTop + tubeH / 2 + 2}
          fill={color} fontSize="6" fontFamily={MONO} fontWeight="bold" opacity={0.7}>
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

export default TitrationBurette;
