import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Half-life markers (C-14 scale mapped to percentage)
const HALF_LIVES = [
  { t: 0.5, label: '5,730 yr' },
  { t: 0.25, label: '11,460 yr' },
  { t: 0.125, label: '17,190 yr' },
  { t: 0.0625, label: '22,920 yr' },
];

const EPOCH_LABELS = [
  { x: 0.0, label: 'NOW' },
  { x: 0.25, label: 'Holocene' },
  { x: 0.5, label: 'Pleistocene' },
  { x: 0.75, label: 'Pliocene' },
  { x: 1.0, label: 'Miocene' },
];

/**
 * CarbonDatingTrace — DINO-mode speedtest diagram.
 * Exponential decay curve (classic C-14 dating graph).
 * Current value shown as a dot on the curve.
 */
const CarbonDatingTrace = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
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
  const color = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';

  const act = level / 100;

  // Generate exponential decay curve
  // We map level → position on the decay curve
  // Higher level = more recent (left side), lower = more decayed (right side)
  const graphL = 15;
  const graphR = 90;
  const graphT = 12;
  const graphB = 70;
  const graphW = graphR - graphL;
  const graphH = graphB - graphT;

  const curvePoints = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50; // 0 → 1 (time axis)
    const decay = Math.exp(-3 * t); // exponential decay (fast for visual clarity)
    const x = graphL + t * graphW;
    const y = graphB - decay * graphH;
    curvePoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const curvePath = curvePoints.join(' ');

  // Current value position on curve
  // Map level 0-100 to position on curve (100 = fully present, 0 = fully decayed)
  const tPos = act > 0.01 ? -Math.log(act) / 3 : 1; // inverse of decay formula
  const clampedT = Math.min(1, Math.max(0, tPos));
  const dotX = graphL + clampedT * graphW;
  const dotY = graphB - act * graphH;

  const ageLabel = level > 80 ? 'Recent' : level > 60 ? 'Late Period' : level > 40 ? 'Mid Period' : level > 20 ? 'Ancient' : 'Primordial';

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
            C-14 DATING ◆ SPEEDTEST
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {ageLabel} · Isotope Ratio
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

      <svg viewBox="0 0 100 88" style={{ width: size, height: size * 0.88 }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          <linearGradient id={`${gradId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Graph background */}
        <rect x={graphL} y={graphT} width={graphW} height={graphH} rx={2}
          fill="rgba(20,18,15,0.4)"
          stroke={color} strokeWidth={0.4} opacity={0.2} />

        {/* Y-axis (concentration) */}
        <line x1={graphL} y1={graphT} x2={graphL} y2={graphB}
          stroke={color} strokeWidth={0.5} opacity={0.3} />
        <text x={graphL - 2} y={graphT + 3} textAnchor="end"
          fill={color} fontSize="3" fontFamily={MONO} opacity={0.35}>100%</text>
        <text x={graphL - 2} y={graphB} textAnchor="end"
          fill={color} fontSize="3" fontFamily={MONO} opacity={0.35}>0%</text>

        {/* X-axis (time/age) */}
        <line x1={graphL} y1={graphB} x2={graphR} y2={graphB}
          stroke={color} strokeWidth={0.5} opacity={0.3} />

        {/* Epoch labels along X-axis */}
        {EPOCH_LABELS.map((ep) => {
          const x = graphL + ep.x * graphW;
          return (
            <g key={ep.label}>
              <line x1={x} y1={graphB} x2={x} y2={graphB + 2}
                stroke={color} strokeWidth={0.3} opacity={0.2} />
              <text x={x} y={graphB + 7} textAnchor="middle"
                fill={color} fontSize="2.8" fontFamily={MONO} opacity={0.3}>
                {ep.label}
              </text>
            </g>
          );
        })}

        {/* Half-life horizontal markers */}
        {HALF_LIVES.map((hl) => {
          const y = graphB - hl.t * graphH;
          return (
            <g key={hl.label}>
              <line x1={graphL} y1={y} x2={graphR} y2={y}
                stroke={color} strokeWidth={0.3} opacity={0.1}
                strokeDasharray="2 3" />
              <text x={graphR + 2} y={y + 1.5}
                fill={color} fontSize="2.5" fontFamily={MONO} opacity={0.3}>
                t½ {hl.label}
              </text>
            </g>
          );
        })}

        {/* Filled area under curve */}
        <path
          d={`${curvePath} L ${graphR} ${graphB} L ${graphL} ${graphB} Z`}
          fill={`url(#${gradId}-fill)`}
        />

        {/* Decay curve */}
        <path d={curvePath}
          fill="none" stroke={color} strokeWidth={1.2}
          opacity={online ? 0.8 : 0.3}
          strokeLinecap="round"
          style={{ filter: online ? `drop-shadow(0 0 2px ${color})` : 'none' }}
        />

        {/* Current value dot on curve */}
        {online && (
          <g>
            {/* Crosshair lines */}
            <line x1={dotX} y1={graphT} x2={dotX} y2={graphB}
              stroke={color} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 2" />
            <line x1={graphL} y1={dotY} x2={graphR} y2={dotY}
              stroke={color} strokeWidth={0.3} opacity={0.2} strokeDasharray="1 2" />

            {/* Pulsing dot */}
            {!prefersReducedMotion ? (
              <motion.circle
                cx={dotX} cy={dotY} r={3}
                fill={color} opacity={0.9}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
                animate={{ r: [3, 4, 3], opacity: [0.9, 0.6, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : (
              <circle cx={dotX} cy={dotY} r={3}
                fill={color} opacity={0.9}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />
            )}

            {/* Value label near dot */}
            <text x={dotX} y={dotY - 5} textAnchor="middle"
              fill={color} fontSize="4" fontFamily={MONO} opacity={0.7}>
              {level.toFixed(0)}%
            </text>
          </g>
        )}

        {/* Title label */}
        <text x={graphL + 2} y={graphT + 5}
          fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.35}>
          ¹⁴C DECAY
        </text>

        {/* Bottom percentage readout */}
        <text x={50} y={84} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {ageLabel}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        Carbon-14 | Speedtest
      </div>
    </div>
  );
};

export default CarbonDatingTrace;
