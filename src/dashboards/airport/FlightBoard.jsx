import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * FlightBoard — AIRPORT-mode bandwidth diagram (replaces JablonskiDiagram).
 * Split-flap FIDS (Flight Information Display System) board.
 * ARRIVALS (emission / download): rows of arriving flights populate.
 * DEPARTURES (excitation / upload): rows of departing flights populate.
 * Amber-on-black text. More active rows = more bandwidth.
 *
 * Props match JablonskiDiagram interface:
 *   label, level, online, details, variant, size, jablonskiLabel
 */
const FlightBoard = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current.NOBLE;
  const isArrival = variant === 'emission';
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const color = online ? cat : '#6b7280';
  const showCritical = level > 85 && online;

  const tierLabel = level < 25 ? 'Quiet' : level < 50 ? 'Active' : level < 75 ? 'Busy' : 'Congested';

  // Flight rows — up to 6
  const totalRows = 6;
  const activeRows = Math.max(1, Math.ceil(act * totalRows));

  const FLIGHTS_ARR = ['PLX-001', 'RDR-400', 'SNR-501', 'LDR-600', 'OVR-200', 'TAU-303'];
  const FLIGHTS_DEP = ['QBT-800', 'SAB-900', 'PRL-100', 'CLD-110', 'NTF-120', 'VPN-140'];
  const STATUSES_ARR = ['LANDED', 'ON TIME', 'APPROACH', 'DELAYED', 'TAXIING', 'ON TIME'];
  const STATUSES_DEP = ['BOARDING', 'ON TIME', 'TAXIING', 'DELAYED', 'GATE OPEN', 'ON TIME'];
  const GATES = ['A1', 'D2', 'E5', 'F3', 'B4', 'C7'];

  const flights = isArrival ? FLIGHTS_ARR : FLIGHTS_DEP;
  const statuses = isArrival ? STATUSES_ARR : STATUSES_DEP;

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
            FIDS ◆ {isArrival ? 'ARRIVALS' : 'DEPARTURES'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>
            {jablonskiLabel || label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {activeRows} active flights · {tierLabel}
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
        role="img" aria-label={`${jablonskiLabel || label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Board frame (dark background) */}
        <rect x={6} y={14} width={88} height={72} rx={2}
          fill="rgba(0,0,0,0.4)" stroke={color} strokeWidth="0.8" opacity={0.3} />

        {/* Board title bar */}
        <rect x={6} y={14} width={88} height={8} rx={2}
          fill={color} opacity={0.08} />
        <text x={50} y={20.5} textAnchor="middle" fill={color}
          fontSize="4" fontFamily={MONO} opacity={0.6} letterSpacing="0.2em">
          {isArrival ? 'ARRIVALS' : 'DEPARTURES'}
        </text>

        {/* Column headers */}
        <text x={14} y={28} fill={color} fontSize="2.8" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">FLIGHT</text>
        <text x={45} y={28} fill={color} fontSize="2.8" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">GATE</text>
        <text x={64} y={28} fill={color} fontSize="2.8" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">STATUS</text>
        <line x1={8} y1={30} x2={92} y2={30} stroke={color} strokeWidth="0.3" opacity={0.15} />

        {/* Flight rows */}
        {Array.from({ length: totalRows }, (_, i) => {
          const rowY = 34 + i * 8;
          const isActive = i < activeRows;
          const rowOp = isActive ? 0.5 + act * 0.3 : 0.08;
          const statusColor = isActive && (statuses[i] === 'DELAYED')
            ? `hsl(0, 70%, 55%)` : color;

          const rowContent = (
            <g key={`row-${i}`}>
              {/* Row background */}
              <rect x={8} y={rowY - 3} width={84} height={7} rx={0.5}
                fill={color} opacity={isActive ? 0.03 : 0.01} />

              {/* Flight designator */}
              <text x={14} y={rowY + 2} fill={color} fontSize="4" fontFamily={MONO}
                opacity={rowOp} letterSpacing="0.05em">
                {isActive ? flights[i] : '---'}
              </text>

              {/* Gate */}
              <text x={45} y={rowY + 2} fill={color} fontSize="4" fontFamily={MONO}
                opacity={rowOp}>
                {isActive ? GATES[i] : '--'}
              </text>

              {/* Status */}
              <text x={64} y={rowY + 2} fill={statusColor} fontSize="3.5" fontFamily={MONO}
                opacity={isActive ? rowOp : 0.08} letterSpacing="0.05em">
                {isActive ? statuses[i] : '------'}
              </text>

              {/* Row separator */}
              {i < totalRows - 1 && (
                <line x1={8} y1={rowY + 4.5} x2={92} y2={rowY + 4.5}
                  stroke={color} strokeWidth="0.2" opacity={0.06} />
              )}
            </g>
          );

          // Active rows get a subtle flicker (split-flap effect)
          if (isActive && !prefersReducedMotion && online) {
            return (
              <motion.g key={`row-${i}`}
                animate={{ opacity: [1, 0.85, 1] }}
                transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
              >
                {rowContent}
              </motion.g>
            );
          }
          return rowContent;
        })}

        {/* Congestion warning at critical */}
        {showCritical && (() => {
          const critScale = (level - 85) / 15;
          const warning = (
            <g>
              <rect x={20} y={84} width={60} height={6} rx={1}
                fill={color} opacity={0.06 + critScale * 0.08} />
              <text x={50} y={88.5} textAnchor="middle" fill={color}
                fontSize="3.5" fontFamily={MONO} opacity={0.4 + critScale * 0.4}
                letterSpacing="0.15em">
                {isArrival ? 'HOLDING PATTERN' : 'GROUND STOP'}
              </text>
            </g>
          );
          return prefersReducedMotion ? warning : (
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {warning}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={97} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{tierLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {isArrival ? 'Inbound' : 'Outbound'}
      </div>
    </div>
  );
};

export default FlightBoard;
