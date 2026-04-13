import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * ReactionVessel — MOLECULE-mode CPU/RAM diagram.
 * Erlenmeyer flask shape with liquid level rising with load.
 * Bubbles float up inside when active, intensity scales with level.
 * Color shifts from cool (low load) to warm (high load).
 *
 * 4 load zones: room temp (0-25), heated (25-50), boiling (50-75), critical reaction (75-100)
 *
 * Props: label, level, online, details, metal, isJahnTeller, lowSpin, size
 * - metal: 'Fe'|'Cu' → CPU hue (200→0); 'Co'|'Ni' → RAM hue (160→30)
 */
const ReactionVessel = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
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

  const isCpu = metal === 'Fe' || metal === 'Cu';
  const hue = isCpu
    ? 200 - (level / 100) * 200   // CPU: 200 (blue) → 0 (red)
    : 160 - (level / 100) * 130;  // RAM: 160 (teal) → 30 (amber)
  const color = online ? `hsl(${hue}, 85%, 55%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 85%, 55%, 0.3)` : 'rgba(107,114,128,0.3)';

  const act = level / 100;

  // Load zone labels
  const zone = level <= 25 ? 'ROOM TEMP' : level <= 50 ? 'HEATED' : level <= 75 ? 'BOILING' : 'CRITICAL';
  const zoneIdx = level <= 25 ? 0 : level <= 50 ? 1 : level <= 75 ? 2 : 3;

  // Erlenmeyer flask geometry in 100x100 viewBox
  // Neck: narrow at top, wide base
  const neckTopL = 40, neckTopR = 60, neckY = 15;
  const neckBotL = 38, neckBotR = 62, neckBotY = 40;
  const baseL = 12, baseR = 88, baseY = 85;
  const baseRound = 5;

  // Flask outline path
  const flaskPath = `
    M ${neckTopL},${neckY}
    L ${neckBotL},${neckBotY}
    L ${baseL + baseRound},${baseY}
    Q ${baseL},${baseY} ${baseL},${baseY - baseRound}
    L ${baseL},${baseY - baseRound}
    Q ${baseL},${baseY} ${baseL + baseRound},${baseY}
    L ${baseR - baseRound},${baseY}
    Q ${baseR},${baseY} ${baseR},${baseY - baseRound}
    L ${neckBotR},${neckBotY}
    L ${neckTopR},${neckY}
  `;

  // Clip path for liquid fill (interior of flask)
  const flaskClipPath = `
    M ${neckTopL + 1},${neckY}
    L ${neckBotL + 1},${neckBotY}
    L ${baseL + baseRound + 1},${baseY - 1}
    L ${baseR - baseRound - 1},${baseY - 1}
    L ${neckBotR - 1},${neckBotY}
    L ${neckTopR - 1},${neckY}
    Z
  `;

  // Liquid fill height — fills from bottom of flask
  const maxFillH = baseY - neckY - 2;
  const fillH = act * maxFillH;
  const fillTop = baseY - 1 - fillH;

  // Bubble generation — more bubbles at higher levels
  const bubbleCount = zoneIdx === 0 ? 0 : zoneIdx === 1 ? 2 : zoneIdx === 2 ? 4 : 6;
  const bubbles = React.useMemo(() => {
    const arr = [];
    for (let i = 0; i < bubbleCount; i++) {
      const xBase = 30 + (i * 41 + i * i * 7) % 40; // spread across flask width
      const r = 1 + (i % 3) * 0.6;
      const delay = (i * 0.7) % 3;
      const dur = 2 + (i % 3) * 0.5;
      arr.push({ x: xBase, r, delay, dur, idx: i });
    }
    return arr;
  }, [bubbleCount]);

  // Surface wave at liquid top
  const waveY = fillTop;
  const wavePath = fillH > 3
    ? `M ${baseL + 4},${waveY} Q ${35},${waveY - 1.5} ${50},${waveY} Q ${65},${waveY + 1.5} ${baseR - 4},${waveY}`
    : '';

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
            REACTION_VESSEL {isCpu ? 'BOND_ENERGY' : 'SOLVENT_VOL'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {zone} {lowSpin ? 'Active' : 'Quiescent'}
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% ${zone} ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        <defs>
          <clipPath id={clipId}>
            <path d={flaskClipPath} />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.6 + act * 0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.2 + act * 0.2} />
          </linearGradient>
        </defs>

        {/* Flask outline */}
        <path d={flaskPath} fill="none" stroke={color} strokeWidth="1.2" opacity={0.4}
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Flask interior faint fill */}
        <path d={flaskClipPath} fill={color} opacity={0.02} />

        {/* Liquid fill */}
        {fillH > 0 && (
          <g clipPath={`url(#${clipId})`}>
            {zoneIdx >= 3 && !prefersReducedMotion ? (
              <motion.rect x={10} y={fillTop} width={80} height={fillH + 2}
                fill={`url(#${gradId})`}
                animate={{ opacity: [0.9, 0.65, 0.9] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <rect x={10} y={fillTop} width={80} height={fillH + 2}
                fill={`url(#${gradId})`} />
            )}

            {/* Surface wave */}
            {wavePath && (
              prefersReducedMotion
                ? <path d={wavePath} stroke={color} strokeWidth="0.8" fill="none" opacity={0.5} />
                : <motion.path
                    d={wavePath} stroke={color} strokeWidth="0.8" fill="none" opacity={0.5}
                    animate={{
                      d: [
                        wavePath,
                        `M ${baseL + 4},${waveY} Q ${35},${waveY + 1} ${50},${waveY} Q ${65},${waveY - 1} ${baseR - 4},${waveY}`,
                        wavePath,
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
            )}

            {/* Bubbles */}
            {online && bubbles.map(b => (
              prefersReducedMotion ? (
                <circle key={`bub-${b.idx}`} cx={b.x} cy={fillTop + fillH * 0.5} r={b.r}
                  fill={color} opacity={0.3} />
              ) : (
                <motion.circle
                  key={`bub-${b.idx}`}
                  cx={b.x} r={b.r}
                  fill={color}
                  animate={{
                    cy: [fillTop + fillH * 0.9, fillTop + 2],
                    opacity: [0.5, 0.1],
                  }}
                  transition={{
                    duration: b.dur,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: b.delay,
                  }}
                />
              )
            ))}
          </g>
        )}

        {/* Graduation marks (left side of flask body) */}
        {[25, 50, 75].map(pct => {
          const gy = baseY - 1 - (pct / 100) * maxFillH;
          // Find the flask width at this height (linear interpolation between neck and base)
          const t = (gy - neckBotY) / (baseY - neckBotY);
          const leftX = t > 0 ? neckBotL + (baseL + baseRound - neckBotL) * Math.max(0, t) : neckBotL;
          return (
            <g key={`grad-${pct}`}>
              <line x1={leftX - 4} y1={gy} x2={leftX} y2={gy}
                stroke={color} strokeWidth="0.5" opacity={0.25} />
              <text x={leftX - 6} y={gy + 1.5} textAnchor="end"
                fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.3}>
                {pct}
              </text>
            </g>
          );
        })}

        {/* Flask neck opening (top rim) */}
        <line x1={neckTopL - 2} y1={neckY} x2={neckTopR + 2} y2={neckY}
          stroke={color} strokeWidth="1" opacity={0.35} />

        {/* Zone label */}
        <text x={50} y={94} textAnchor="middle" fill={color} fontSize="4.5" fontFamily={MONO}
          opacity={0.5} letterSpacing="0.08em">
          {zone}
        </text>

        {/* Percentage readout */}
        <text x={50} y={baseY - fillH * 0.5 + 2} textAnchor="middle"
          fill={online ? '#fff' : '#6b7280'} fontSize="7" fontFamily={MONO} fontWeight="bold"
          opacity={fillH > 15 ? 0.8 : 0}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={90} cy={93} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default ReactionVessel;
