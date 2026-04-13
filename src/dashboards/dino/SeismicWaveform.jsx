import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SeismicWaveform — DINO-mode bandwidth diagram (Download/Upload).
 * Seismograph drum with waveform trace. Amplitude proportional to bandwidth.
 * Download: P-waves (compression). Upload: S-waves (shear).
 */
const SeismicWaveform = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const clipId = useId();

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
  const isDownload = isCpu; // Fe/Cu → download (P-wave), Co/Ni → upload (S-wave)
  const waveType = isDownload ? 'P-Wave' : 'S-Wave';

  // Generate waveform path
  const amplitude = 2 + act * 16; // higher bandwidth = more violent trace
  const freq = isDownload ? 0.15 : 0.22; // P-waves slightly longer wavelength
  const points = [];
  for (let x = 0; x <= 80; x += 1) {
    const phase = isDownload
      ? Math.sin(x * freq) * Math.cos(x * freq * 0.5) // compression wave
      : Math.sin(x * freq * 1.3) * Math.sin(x * freq * 0.3 + 1); // shear wave
    const y = 40 + phase * amplitude * (0.3 + 0.7 * Math.sin((x / 80) * Math.PI)); // envelope
    points.push(`${x === 0 ? 'M' : 'L'} ${x + 10} ${y}`);
  }
  const wavePath = points.join(' ');

  // Drum rotation
  const drumPhase = prefersReducedMotion ? 0 : undefined;

  const richterLabel = level < 20 ? 'Micro' : level < 40 ? 'Minor' : level < 60 ? 'Light' : level < 80 ? 'Moderate' : 'Strong';

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
            SEISMOGRAPH ◆ {waveType}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {richterLabel} · {waveType}
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

      <svg viewBox="0 0 100 80" style={{ width: size, height: size * 0.8 }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          <clipPath id={`${clipId}-drum`}>
            <rect x={8} y={10} width={84} height={60} rx={4} />
          </clipPath>
        </defs>

        {/* Seismograph drum background */}
        <rect x={8} y={10} width={84} height={60} rx={4} ry={4}
          fill="rgba(25,22,18,0.6)"
          stroke={color} strokeWidth={0.5} opacity={0.3} />

        {/* Drum paper grid lines (horizontal) */}
        {[20, 30, 40, 50, 60].map(y => (
          <line key={y} x1={8} y1={y} x2={92} y2={y}
            stroke={color} strokeWidth={0.2} opacity={0.1} />
        ))}

        {/* Drum paper grid lines (vertical — time marks) */}
        {[20, 35, 50, 65, 80].map(x => (
          <line key={x} x1={x} y1={10} x2={x} y2={70}
            stroke={color} strokeWidth={0.2} opacity={0.08} />
        ))}

        {/* Center baseline */}
        <line x1={10} y1={40} x2={90} y2={40}
          stroke={color} strokeWidth={0.3} opacity={0.2} strokeDasharray="2 2" />

        {/* Waveform trace */}
        <g clipPath={`url(#${clipId}-drum)`}>
          {online && !prefersReducedMotion ? (
            <motion.path
              d={wavePath}
              fill="none"
              stroke={color}
              strokeWidth={1.2}
              strokeLinecap="round"
              opacity={0.85}
              style={{ filter: `drop-shadow(0 0 2px ${color})` }}
              animate={{ translateX: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <path
              d={wavePath}
              fill="none"
              stroke={color}
              strokeWidth={online ? 1.2 : 0.6}
              strokeLinecap="round"
              opacity={online ? 0.85 : 0.3}
            />
          )}
        </g>

        {/* Needle indicator (right side) */}
        <g transform={`translate(88, ${40 - amplitude * 0.3})`}>
          <line x1={0} y1={0} x2={4} y2={0}
            stroke={color} strokeWidth={1} opacity={0.6} />
          <circle cx={5} cy={0} r={1.5} fill={color} opacity={0.4} />
        </g>

        {/* Drum rotation indicator — small cylinder on left */}
        <g transform="translate(4, 35)">
          {online && !prefersReducedMotion ? (
            <motion.circle
              cx={0} cy={0} r={3}
              fill="none" stroke={color} strokeWidth={0.5} opacity={0.3}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ transformOrigin: '0px 0px' }}
            />
          ) : (
            <circle cx={0} cy={0} r={3}
              fill="none" stroke={color} strokeWidth={0.5} opacity={0.15} />
          )}
          <circle cx={0} cy={0} r={1} fill={color} opacity={0.3} />
        </g>

        {/* Wave type label */}
        <text x={14} y={18} fill={color} fontSize="4" fontFamily={MONO} opacity={0.35}>
          {waveType}
        </text>

        {/* Percentage readout */}
        <text x={50} y={78} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {richterLabel} Seismic
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {waveType} | {isDownload ? 'Download' : 'Upload'}
      </div>
    </div>
  );
};

export default SeismicWaveform;
