import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * TerminalMap — AIRPORT-mode media storage diagram (replaces OrbitalDiagram).
 * Simplified top-down airport terminal floor plan. Gate positions fill with
 * aircraft (parked at jetbridge) as storage increases. Empty gates at low,
 * all gates occupied at high. Critical: taxiway congestion, aircraft queuing.
 *
 * Props match OrbitalDiagram interface:
 *   label, level, online, details, catKey, size
 */
const TerminalMap = ({ label, level, online, details = [], catKey = 'TRANSITION', size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current[catKey];
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const color = online ? cat : '#6b7280';
  const showCongestion = level > 85 && online;

  const tierLabel = level < 25 ? 'Quiet' : level < 50 ? 'Active' : level < 75 ? 'Busy' : 'Full';

  // Gate positions along a T-shaped terminal
  // Top arm gates (left to right)
  const GATES = [
    { x: 14, y: 28, angle: -90, label: 'A1' },
    { x: 26, y: 28, angle: -90, label: 'A2' },
    { x: 38, y: 28, angle: -90, label: 'A3' },
    { x: 62, y: 28, angle: -90, label: 'B1' },
    { x: 74, y: 28, angle: -90, label: 'B2' },
    { x: 86, y: 28, angle: -90, label: 'B3' },
    // Stem gates (left and right sides)
    { x: 40, y: 55, angle: 180, label: 'C1' },
    { x: 40, y: 67, angle: 180, label: 'C2' },
    { x: 60, y: 55, angle: 0,   label: 'D1' },
    { x: 60, y: 67, angle: 0,   label: 'D2' },
  ];

  const occupiedGates = Math.ceil(act * GATES.length);

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
            TERMINAL ◆ MAP
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {occupiedGates}/{GATES.length} gates · {tierLabel}
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

        {/* Terminal building outline — T shape */}
        {/* Top arm (concourse) */}
        <rect x={8} y={32} width={84} height={10} rx={1}
          fill={color} opacity={0.04} stroke={color} strokeWidth="0.6" />
        {/* Stem (main terminal) */}
        <rect x={42} y={42} width={16} height={36} rx={1}
          fill={color} opacity={0.04} stroke={color} strokeWidth="0.6" />

        {/* Taxiway (below terminal) */}
        <rect x={5} y={80} width={90} height={3} rx={0.5}
          fill={color} opacity={0.03} stroke={color} strokeWidth="0.3" />
        {/* Taxiway centerline */}
        <line x1={5} y1={81.5} x2={95} y2={81.5}
          stroke={color} strokeWidth="0.3" opacity={0.1} strokeDasharray="3 2" />

        {/* Gate jetbridges */}
        {GATES.map((gate, i) => {
          const isOccupied = i < occupiedGates;
          const bridgeLen = 6;
          const rad = gate.angle * Math.PI / 180;
          const bx2 = gate.x + bridgeLen * Math.cos(rad);
          const by2 = gate.y + bridgeLen * Math.sin(rad);

          return (
            <React.Fragment key={`gate-${i}`}>
              {/* Jetbridge line */}
              <line x1={gate.x} y1={gate.y} x2={bx2} y2={by2}
                stroke={color} strokeWidth={isOccupied ? 0.8 : 0.3}
                opacity={isOccupied ? 0.3 : 0.1} />

              {/* Gate marker dot */}
              <circle cx={gate.x} cy={gate.y} r={1.2}
                fill={isOccupied ? color : 'none'}
                stroke={color} strokeWidth="0.4"
                opacity={isOccupied ? 0.5 : 0.15} />

              {/* Aircraft silhouette at occupied gates */}
              {isOccupied && (() => {
                const ax = bx2;
                const ay = by2;
                const aRot = gate.angle;
                const baseOp = 0.2 + act * 0.2;
                const aircraft = (
                  <g transform={`translate(${ax}, ${ay}) rotate(${aRot})`}>
                    {/* Fuselage */}
                    <ellipse cx={-3} cy={0} rx={3.5} ry={1.2}
                      fill={color} opacity={baseOp} />
                    {/* Wings */}
                    <line x1={-2} y1={-3.5} x2={-2} y2={3.5}
                      stroke={color} strokeWidth="0.6" opacity={baseOp * 0.8} />
                    {/* Tail */}
                    <line x1={-5.5} y1={-1.5} x2={-5.5} y2={1.5}
                      stroke={color} strokeWidth="0.4" opacity={baseOp * 0.7} />
                  </g>
                );
                return prefersReducedMotion ? aircraft : (
                  <motion.g key={`ac-${i}`}
                    animate={{ opacity: [1, 0.85, 1] }}
                    transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                  >
                    {aircraft}
                  </motion.g>
                );
              })()}

              {/* Gate label */}
              <text x={gate.x} y={gate.angle === -90 ? gate.y + 5 : gate.y + (gate.angle === 0 ? 0 : 0)}
                textAnchor="middle" fill={color} fontSize="2.5" fontFamily={MONO}
                opacity={isOccupied ? 0.35 : 0.12}
                dy={gate.angle === -90 ? 0 : -4}>
                {gate.label}
              </text>
            </React.Fragment>
          );
        })}

        {/* Congestion at critical */}
        {showCongestion && (() => {
          const congScale = (level - 85) / 15;
          const congestion = (
            <g>
              {/* Queuing aircraft on taxiway */}
              <g transform="translate(25, 81.5) rotate(0)">
                <ellipse cx={0} cy={0} rx={2.5} ry={0.8} fill={color} opacity={0.2 + congScale * 0.2} />
                <line x1={0} y1={-2} x2={0} y2={2} stroke={color} strokeWidth="0.4" opacity={0.15} />
              </g>
              <g transform="translate(35, 81.5) rotate(0)">
                <ellipse cx={0} cy={0} rx={2.5} ry={0.8} fill={color} opacity={0.15 + congScale * 0.15} />
                <line x1={0} y1={-2} x2={0} y2={2} stroke={color} strokeWidth="0.4" opacity={0.12} />
              </g>
              {/* Hold short text */}
              <text x={50} y={88} textAnchor="middle" fill={color}
                fontSize="3" fontFamily={MONO} opacity={0.3 + congScale * 0.4}
                letterSpacing="0.15em">
                HOLD SHORT
              </text>
            </g>
          );
          return prefersReducedMotion ? congestion : (
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {congestion}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{tierLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {occupiedGates}/{GATES.length} Gates
      </div>
    </div>
  );
};

export default TerminalMap;
