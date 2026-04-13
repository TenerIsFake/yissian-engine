import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SynapseRelay -- NEURAL-mode Download/Upload bandwidth diagram.
 * Neural pathway visualization: chain of connected nodes with signal dots
 * traveling along the path. Speed proportional to bandwidth level.
 *
 * Download: signals flow left-to-right (incoming).
 * Upload: signals flow right-to-left (outgoing).
 *
 * Props match CoordComplex/StellarCoreMonitor interface.
 */
const SynapseRelay = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller = false, lowSpin = false, size = 88 }) => {
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
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.2)` : 'rgba(107,114,128,0.1)';

  const act = level / 100;

  // Download = left-to-right, Upload = right-to-left
  const isDownload = label?.toLowerCase().includes('down') || label?.toLowerCase().includes('dl') || isCpu;
  const flowDir = isDownload ? 1 : -1;

  // Number of relay nodes scales with level: 3 at low, up to 6 at high
  const nodeCount = Math.max(3, Math.min(6, Math.floor(3 + act * 3)));

  // Node positions across the viewbox
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    const t = i / (nodeCount - 1);
    const x = 10 + t * 80;
    const y = 45 + Math.sin(t * Math.PI * 2) * 12;
    nodes.push({ x, y });
  }

  // Build path string through all nodes
  const pathSegments = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    pathSegments.push(`${i === 0 ? 'M' : 'L'}${nodes[i].x},${nodes[i].y}`);
  }
  pathSegments.push(`L${nodes[nodes.length - 1].x},${nodes[nodes.length - 1].y}`);
  const pathD = pathSegments.join(' ');

  // Signal travel speed: faster at higher bandwidth
  const signalDuration = Math.max(0.6, 3 - act * 2.2);
  const signalCount = Math.max(1, Math.floor(1 + act * 3));

  const bandwidthLabel = level < 20 ? 'Low Signal' : level < 50 ? 'Moderate' : level < 80 ? 'High Throughput' : 'Peak Bandwidth';

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
            SYNAPSE_RELAY {'\u25C6'} {isDownload ? 'INCOMING' : 'OUTGOING'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {bandwidthLabel} {'\u00B7'} {nodeCount} nodes
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
        role="img" aria-label={`${label}: ${level.toFixed(1)}% -- ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          <linearGradient id={`${gradId}-path-grad`}
            x1={isDownload ? '0%' : '100%'} y1="0%"
            x2={isDownload ? '100%' : '0%'} y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.15} />
          </linearGradient>
        </defs>

        {/* Direction label */}
        <text x={isDownload ? 5 : 95} y={20} textAnchor={isDownload ? 'start' : 'end'}
          fill={color} fontSize="4" fontFamily={MONO} opacity={0.3}>
          {isDownload ? 'IN \u25B6' : '\u25C0 OUT'}
        </text>

        {/* Neural pathway line */}
        <path d={pathD} fill="none"
          stroke={`url(#${gradId}-path-grad)`}
          strokeWidth={online ? 1 + act * 0.8 : 0.5}
          opacity={online ? 0.5 + act * 0.3 : 0.1}
          strokeLinecap="round"
        />

        {/* Relay nodes */}
        {nodes.map((node, i) => {
          const brightness = online ? 0.3 + (act * 0.6) * ((i + 1) / nodeCount) : 0.08;
          const nodeR = 3 + (i === 0 || i === nodeCount - 1 ? 1.5 : 0);
          return (
            <g key={i}>
              <circle cx={node.x} cy={node.y} r={nodeR}
                fill={colorFaded} stroke={color}
                strokeWidth={online ? 0.8 : 0.4}
                opacity={brightness}
                style={online ? { filter: `drop-shadow(0 0 ${2 + act * 3}px ${color})` } : {}}
              />
              {/* Inner bright dot */}
              {online && (
                <circle cx={node.x} cy={node.y} r={1.5}
                  fill={color} opacity={brightness * 1.2} />
              )}
            </g>
          );
        })}

        {/* Signal dots traveling the pathway */}
        {online && !prefersReducedMotion && Array.from({ length: signalCount }).map((_, si) => {
          // Build offset-path CSS for this signal
          const pts = flowDir === 1 ? nodes : [...nodes].reverse();
          const pathParts = pts.map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x.toFixed(2)},${n.y.toFixed(2)}`).join(' ');
          return (
            <motion.circle key={`sig-${si}`}
              r={2}
              fill={color}
              opacity={0.9}
              style={{
                offsetPath: `path('${pathParts}')`,
                filter: `drop-shadow(0 0 3px ${color})`,
              }}
              animate={{ offsetDistance: ['0%', '100%'] }}
              transition={{
                duration: signalDuration,
                repeat: Infinity,
                ease: 'linear',
                delay: si * (signalDuration / signalCount),
              }}
            />
          );
        })}

        {/* Percentage readout */}
        <text x={50} y={82} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>

        {/* Flow direction indicator arrows */}
        {online && (
          <g opacity={0.25}>
            {[25, 50, 75].map((pct, ai) => {
              const idx = Math.floor((pct / 100) * (nodes.length - 1));
              const nx = nodes[idx]?.x ?? 50;
              const ny = (nodes[idx]?.y ?? 45) - 10;
              const arrow = isDownload ? '\u25B8' : '\u25C2';
              return (
                <text key={ai} x={nx} y={ny} textAnchor="middle"
                  fill={color} fontSize="5" fontFamily={MONO}>{arrow}</text>
              );
            })}
          </g>
        )}
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{bandwidthLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {isDownload ? 'Download' : 'Upload'} | {nodeCount} relay nodes
      </div>
    </div>
  );
};

export default SynapseRelay;
