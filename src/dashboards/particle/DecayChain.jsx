import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * DecayChain — PARTICLE-mode download/upload bandwidth diagram.
 * Particle decay chain: parent → daughter particles (download = decay cascade splitting,
 * upload = fusion merging). Connected nodes with arrows, flow speed = bandwidth.
 * Half-life labels at each decay step.
 *
 * Props match JablonskiDiagram interface:
 *   label, level, online, details, variant, size, jablonskiLabel
 *
 * variant: 'emission' → download (decay/splitting), 'excitation' → upload (fusion/merging)
 */
const DecayChain = ({ label, level, online, details = [], variant = 'emission', size = 88, jablonskiLabel }) => {
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

  /* Color: downloads = cyan-ish, uploads = violet-ish */
  const hue = isDownload ? 185 : 270;
  const color = online ? `hsl(${hue}, 80%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 80%, 60%, 0.25)` : 'rgba(107,114,128,0.25)';

  /* Flow speed for animations */
  const flowDuration = Math.max(0.6, 3 - act * 2.4);

  /* Decay chain nodes — download: 1 parent splits into daughters; upload: daughters merge */
  const nodeCount = Math.floor(act * 3) + 2; // 2–5 nodes
  const halfLives = ['2.6ms', '138d', '12.3y', '1.28Gy'];

  /* Node positions: download = tree branching down, upload = converging up */
  const buildNodes = () => {
    const nodes = [];
    const arrows = [];

    if (isDownload) {
      /* Decay cascade — parent at top, daughters below */
      nodes.push({ x: 50, y: 14, r: 5, label: 'P', primary: true });
      if (nodeCount >= 2) {
        nodes.push({ x: 30, y: 40, r: 4, label: 'D1' });
        nodes.push({ x: 70, y: 40, r: 4, label: 'D2' });
        arrows.push({ x1: 50, y1: 19, x2: 30, y2: 36 });
        arrows.push({ x1: 50, y1: 19, x2: 70, y2: 36 });
      }
      if (nodeCount >= 3) {
        nodes.push({ x: 18, y: 65, r: 3, label: 'G1' });
        nodes.push({ x: 42, y: 65, r: 3, label: 'G2' });
        arrows.push({ x1: 30, y1: 44, x2: 18, y2: 62 });
        arrows.push({ x1: 30, y1: 44, x2: 42, y2: 62 });
      }
      if (nodeCount >= 4) {
        nodes.push({ x: 58, y: 65, r: 3, label: 'G3' });
        nodes.push({ x: 82, y: 65, r: 3, label: 'G4' });
        arrows.push({ x1: 70, y1: 44, x2: 58, y2: 62 });
        arrows.push({ x1: 70, y1: 44, x2: 82, y2: 62 });
      }
      if (nodeCount >= 5) {
        nodes.push({ x: 10, y: 85, r: 2.5, label: 'S' });
        nodes.push({ x: 30, y: 85, r: 2.5, label: 'S' });
        arrows.push({ x1: 18, y1: 68, x2: 10, y2: 82 });
        arrows.push({ x1: 18, y1: 68, x2: 30, y2: 82 });
      }
    } else {
      /* Fusion — daughters at top merge into parent at bottom */
      nodes.push({ x: 50, y: 86, r: 5, label: 'P', primary: true });
      if (nodeCount >= 2) {
        nodes.push({ x: 30, y: 60, r: 4, label: 'F1' });
        nodes.push({ x: 70, y: 60, r: 4, label: 'F2' });
        arrows.push({ x1: 30, y1: 64, x2: 50, y2: 82 });
        arrows.push({ x1: 70, y1: 64, x2: 50, y2: 82 });
      }
      if (nodeCount >= 3) {
        nodes.push({ x: 18, y: 35, r: 3, label: 'R1' });
        nodes.push({ x: 42, y: 35, r: 3, label: 'R2' });
        arrows.push({ x1: 18, y1: 38, x2: 30, y2: 56 });
        arrows.push({ x1: 42, y1: 38, x2: 30, y2: 56 });
      }
      if (nodeCount >= 4) {
        nodes.push({ x: 58, y: 35, r: 3, label: 'R3' });
        nodes.push({ x: 82, y: 35, r: 3, label: 'R4' });
        arrows.push({ x1: 58, y1: 38, x2: 70, y2: 56 });
        arrows.push({ x1: 82, y1: 38, x2: 70, y2: 56 });
      }
      if (nodeCount >= 5) {
        nodes.push({ x: 10, y: 14, r: 2.5, label: 'S' });
        nodes.push({ x: 30, y: 14, r: 2.5, label: 'S' });
        arrows.push({ x1: 10, y1: 16, x2: 18, y2: 32 });
        arrows.push({ x1: 30, y1: 16, x2: 42, y2: 32 });
      }
    }

    return { nodes, arrows };
  };

  const { nodes, arrows } = buildNodes();
  const modeLabel = isDownload ? 'DECAY CASCADE' : 'FUSION CHAIN';

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
            {jablonskiLabel || `${modeLabel} ◆ ${isDownload ? 'DOWNLINK' : 'UPLINK'}`}
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
          <marker id={`${gradId}-arrow`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <polygon points="0,0 6,2 0,4" fill={color} opacity={0.5} />
          </marker>
        </defs>

        {/* Direction label */}
        <text x={50} y={isDownload ? 9 : 97} textAnchor="middle" fill={color}
          fontSize="4" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
          {isDownload ? '▼ DECAY' : '▲ FUSION'}
        </text>

        {/* Arrows between nodes */}
        {arrows.map((a, i) => {
          const arrowEl = (
            <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
              stroke={color} strokeWidth={0.8}
              opacity={online ? 0.35 : 0.1}
              markerEnd={`url(#${gradId}-arrow)`}
              strokeDasharray="3 3"
            />
          );

          /* Traveling particle dot along arrow */
          const travelDot = online && !prefersReducedMotion ? (
            <motion.circle r={1.2} fill={color}
              animate={{
                cx: [a.x1, a.x2],
                cy: [a.y1, a.y2],
                opacity: [0.8, 0.2],
              }}
              transition={{
                duration: flowDuration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ) : null;

          /* Half-life label at midpoint */
          const mx = (a.x1 + a.x2) / 2;
          const my = (a.y1 + a.y2) / 2;
          const hlLabel = halfLives[i % halfLives.length];

          return (
            <g key={`arrow-${i}`}>
              {arrowEl}
              {travelDot}
              {i < 3 && (
                <text x={mx + 6} y={my} fill={color} fontSize="3" fontFamily={MONO} opacity={0.25}>
                  t½={hlLabel}
                </text>
              )}
            </g>
          );
        })}

        {/* Decay nodes */}
        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle cx={n.x} cy={n.y} r={n.r}
              fill={online ? color : '#374151'}
              opacity={n.primary ? (online ? 0.7 : 0.3) : (online ? 0.45 : 0.15)}
              style={{ filter: online && n.primary ? `drop-shadow(0 0 4px ${color})` : 'none' }}
            />
            <circle cx={n.x} cy={n.y} r={n.r}
              fill="none" stroke={color} strokeWidth={0.5}
              opacity={online ? 0.4 : 0.1} />
            <text x={n.x} y={n.y + 1.2} textAnchor="middle" fill="rgba(255,255,255,0.7)"
              fontSize={n.primary ? '4.5' : '3.5'} fontFamily={MONO} fontWeight="bold">
              {n.label}
            </text>
          </g>
        ))}

        {/* Percentage readout */}
        <text x={50} y={isDownload ? 97 : 9} textAnchor="middle" fill={color}
          fontSize="5.5" fontFamily={MONO} opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={92} cy={92} r={2.5} fill={online ? color : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${color})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default DecayChain;
