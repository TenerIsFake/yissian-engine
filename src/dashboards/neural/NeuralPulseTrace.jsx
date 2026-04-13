import React, { useState, useId, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * NeuralPulseTrace -- NEURAL-mode Speedtest diagram.
 * EEG-style waveform trace (brain wave monitor).
 * Scrolling sine-like wave with amplitude proportional to speed value.
 * Alpha/Beta/Gamma wave labels at different amplitude thresholds.
 * Flatline when offline.
 *
 * Props match CoordComplex/StellarCoreMonitor interface.
 */
const NeuralPulseTrace = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller = false, lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const rafRef = useRef(null);
  const gradId = useId();

  useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  // Animate phase for scrolling waveform
  useEffect(() => {
    if (!online || prefersReducedMotion) {
      setPhase(0);
      return;
    }
    let frame = 0;
    const tick = () => {
      frame++;
      if (frame % 2 === 0) {
        setPhase(p => (p + 0.08) % (Math.PI * 20));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [online]);

  const isCpu = metal === 'Fe' || metal === 'Cu';
  const hue = isCpu
    ? 200 - (level / 100) * 200
    : 160 - (level / 100) * 130;
  const color = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';

  const act = level / 100;

  // Wave amplitude scales with level
  const baseAmp = 2;
  const maxAmp = 22;
  const amplitude = online ? baseAmp + act * (maxAmp - baseAmp) : 0;

  // Frequency also increases slightly with level
  const freq = 0.12 + act * 0.08;

  // Generate waveform path with composite wave (EEG-like)
  const centerY = 50;
  const wavePoints = [];
  for (let x = 5; x <= 95; x += 1) {
    if (!online) {
      wavePoints.push(`${x},${centerY}`);
      continue;
    }
    // Composite: fundamental + harmonics for EEG look
    const t = x + phase * 10;
    const y1 = Math.sin(t * freq) * amplitude;
    const y2 = Math.sin(t * freq * 2.3 + 1.2) * amplitude * 0.3;
    const y3 = Math.sin(t * freq * 4.7 + 2.8) * amplitude * 0.12;
    // Sharp spikes at random intervals (neural spikes)
    const spike = Math.sin(t * 0.47) > 0.92 ? amplitude * 0.6 * Math.sin(t * 3) : 0;
    const y = centerY - (y1 + y2 + y3 + spike);
    wavePoints.push(`${x},${Math.max(8, Math.min(92, y)).toFixed(1)}`);
  }
  const wavePath = `M${wavePoints.join(' L')}`;

  // Wave type classification
  const waveType = level < 20 ? 'Delta' : level < 40 ? 'Theta' : level < 65 ? 'Alpha' : level < 85 ? 'Beta' : 'Gamma';
  const waveFreqLabel = level < 20 ? '0.5-4 Hz' : level < 40 ? '4-8 Hz' : level < 65 ? '8-13 Hz' : level < 85 ? '13-30 Hz' : '30+ Hz';

  // Threshold lines for wave bands
  const bands = [
    { label: 'Delta', y: centerY - baseAmp - 2, show: true },
    { label: 'Alpha', y: centerY - (baseAmp + 0.4 * (maxAmp - baseAmp)), show: level >= 40 },
    { label: 'Beta', y: centerY - (baseAmp + 0.65 * (maxAmp - baseAmp)), show: level >= 65 },
    { label: 'Gamma', y: centerY - (baseAmp + 0.85 * (maxAmp - baseAmp)), show: level >= 85 },
  ];

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
            PULSE_TRACE {'\u25C6'} EEG
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {waveType} wave {'\u00B7'} {waveFreqLabel}
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

        {/* Grid lines for EEG paper effect */}
        {[20, 35, 50, 65, 80].map((y) => (
          <line key={y} x1={5} y1={y} x2={95} y2={y}
            stroke={color} strokeWidth={0.2} opacity={0.08} />
        ))}
        {[15, 30, 50, 70, 85].map((x) => (
          <line key={x} x1={x} y1={10} x2={x} y2={90}
            stroke={color} strokeWidth={0.2} opacity={0.08} />
        ))}

        {/* Wave band threshold lines */}
        {bands.filter(b => b.show).map((band) => (
          <g key={band.label}>
            <line x1={5} y1={band.y} x2={95} y2={band.y}
              stroke={color} strokeWidth={0.3} strokeDasharray="2,3" opacity={0.15} />
            <text x={96} y={band.y + 1.5} textAnchor="start"
              fill={color} fontSize="3" fontFamily={MONO} opacity={0.25}>
              {band.label}
            </text>
          </g>
        ))}

        {/* Main waveform */}
        <path d={wavePath} fill="none"
          stroke={color}
          strokeWidth={online ? 1 + act * 0.5 : 0.5}
          opacity={online ? 0.7 + act * 0.2 : 0.15}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={online ? { filter: `drop-shadow(0 0 ${1 + act * 3}px ${color})` } : {}}
        />

        {/* Secondary trace (faded echo) */}
        {online && (
          <path d={wavePath} fill="none"
            stroke={color}
            strokeWidth={0.4}
            opacity={0.15}
            strokeLinecap="round"
            transform="translate(0, 3)"
          />
        )}

        {/* Center baseline */}
        <line x1={5} y1={centerY} x2={95} y2={centerY}
          stroke={color} strokeWidth={0.3} opacity={0.1} />

        {/* Flatline label when offline */}
        {!online && (
          <text x={50} y={centerY - 6} textAnchor="middle"
            fill="#6b7280" fontSize="5" fontFamily={MONO} opacity={0.4}>
            FLATLINE
          </text>
        )}

        {/* Wave type indicator */}
        <text x={8} y={14} textAnchor="start"
          fill={color} fontSize="4" fontFamily={MONO} opacity={0.35}>
          {waveType.toUpperCase()}
        </text>

        {/* Scan line effect */}
        {online && !prefersReducedMotion && (
          <motion.line
            x1={5} y1={10} x2={5} y2={90}
            stroke={color} strokeWidth={0.5} opacity={0.2}
            animate={{ x1: [5, 95], x2: [5, 95] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {waveType} {'\u00B7'} {waveFreqLabel}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {online ? 'Trace Active' : 'No Signal'} | {label}
      </div>
    </div>
  );
};

export default NeuralPulseTrace;
