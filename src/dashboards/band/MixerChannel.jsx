import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * MixerChannel -- BAND-mode Download/Upload bandwidth diagram.
 * Mixing console channel strip with vertical fader, peak meter LED stack,
 * PAN knob, Solo/Mute indicators, and channel label.
 *
 * Props: label, level, online, details, metal, isJahnTeller, lowSpin, size
 * metal: 'Fe'|'Cu' -> CPU hue (200->0), 'Co'|'Ni' -> RAM hue (160->30)
 */
const MixerChannel = ({ label, level, online, details = [], metal = 'Fe', isJahnTeller, lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);

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
  const color      = online ? `hsl(${hue}, 90%, 60%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 90%, 60%, 0.35)` : 'rgba(107,114,128,0.35)';

  const act = level / 100;

  // Fader position: bottom=0%, top=100%. Track from y=85 to y=25
  const trackTop = 25;
  const trackBottom = 85;
  const faderY = trackBottom - act * (trackBottom - trackTop);

  // Peak meter: 16 LED segments
  const meterCount = 16;
  const litSegments = Math.round(act * meterCount);

  const getMeterColor = (i) => {
    if (i >= litSegments) return 'rgba(255,255,255,0.04)';
    const ratio = i / meterCount;
    if (ratio < 0.6) return '#22c55e';   // green
    if (ratio < 0.8) return '#eab308';   // yellow
    return '#ef4444';                      // red
  };

  // PAN knob rotation (-45 to 45 based on lowSpin)
  const panAngle = lowSpin ? 25 : 0;

  const isDownload = isCpu; // Use CPU slots for download display
  const channelType = isDownload ? 'DL' : 'UL';

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
            MIXER_CH {channelType}
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

      <svg viewBox="0 0 60 110" style={{ width: size * 0.65, height: size * 1.2 }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% -- ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Channel strip background */}
        <rect x={2} y={2} width={56} height={106} rx={4}
          fill="rgba(20,20,20,0.85)" stroke={colorFaded} strokeWidth={0.6} />

        {/* PAN knob at top */}
        <circle cx={30} cy={12} r={6}
          fill="rgba(30,30,30,0.95)" stroke={colorFaded} strokeWidth={0.6} />
        {(() => {
          const rad = (panAngle * Math.PI) / 180 - Math.PI / 2;
          return (
            <line x1={30} y1={12}
              x2={30 + Math.cos(rad) * 4} y2={12 + Math.sin(rad) * 4}
              stroke={color} strokeWidth={1} strokeLinecap="round" />
          );
        })()}
        <text x={30} y={8} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="3" fontFamily={MONO}>PAN</text>

        {/* Fader track */}
        <rect x={16} y={trackTop} width={4} height={trackBottom - trackTop} rx={2}
          fill="rgba(255,255,255,0.06)" />
        {/* Fader track center line */}
        <line x1={18} y1={trackTop} x2={18} y2={trackBottom}
          stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />

        {/* Fader knob */}
        {prefersReducedMotion ? (
          <rect x={12} y={faderY - 4} width={12} height={8} rx={2}
            fill={online ? color : '#374151'}
            stroke={online ? color : 'rgba(255,255,255,0.1)'}
            strokeWidth={0.6}
            style={online ? { filter: `drop-shadow(0 0 3px ${color})` } : {}} />
        ) : (
          <motion.rect x={12} y={faderY - 4} width={12} height={8} rx={2}
            fill={online ? color : '#374151'}
            stroke={online ? color : 'rgba(255,255,255,0.1)'}
            strokeWidth={0.6}
            style={online ? { filter: `drop-shadow(0 0 3px ${color})` } : {}}
            initial={false}
            animate={{ y: faderY - 4 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        )}
        {/* Fader grip line */}
        <line x1={14} y1={faderY} x2={22} y2={faderY}
          stroke="rgba(255,255,255,0.3)" strokeWidth={0.4} />

        {/* Tick marks alongside fader */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = trackBottom - (pct / 100) * (trackBottom - trackTop);
          return (
            <g key={`tick-${pct}`}>
              <line x1={10} y1={y} x2={12} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth={0.4} />
              <text x={8} y={y + 1.2} textAnchor="end" fill="rgba(255,255,255,0.15)" fontSize="3" fontFamily={MONO}>
                {pct}
              </text>
            </g>
          );
        })}

        {/* Peak meter (right side) */}
        {Array.from({ length: meterCount }, (_, i) => {
          const segY = trackBottom - 2 - i * (58 / meterCount);
          return (
            <rect key={`seg-${i}`}
              x={32} y={segY} width={10} height={Math.max(1.5, 58 / meterCount - 1)} rx={0.5}
              fill={getMeterColor(i)}
              opacity={i < litSegments ? (online ? 0.85 : 0.3) : 0.08}
              style={i < litSegments && online ? { filter: `drop-shadow(0 0 1px ${getMeterColor(i)})` } : {}}
            />
          );
        })}

        {/* Solo / Mute buttons */}
        <rect x={10} y={92} width={16} height={7} rx={1.5}
          fill={online ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.04)'}
          stroke={online ? 'rgba(234,179,8,0.5)' : 'rgba(255,255,255,0.08)'} strokeWidth={0.4} />
        <text x={18} y={97.5} textAnchor="middle" fill={online ? '#eab308' : 'rgba(255,255,255,0.15)'} fontSize="4" fontFamily={MONO}>S</text>

        <rect x={32} y={92} width={16} height={7} rx={1.5}
          fill={!online ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.04)'}
          stroke={!online ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'} strokeWidth={0.4} />
        <text x={40} y={97.5} textAnchor="middle" fill={!online ? '#ef4444' : 'rgba(255,255,255,0.15)'} fontSize="4" fontFamily={MONO}>M</text>

        {/* Channel label at bottom */}
        <text x={30} y={106} textAnchor="middle" fill={color} fontSize="5" fontFamily={MONO} fontWeight="bold" opacity={0.7}>
          {channelType}
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>
        {level.toFixed(0)}%
      </div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {channelType === 'DL' ? 'Download' : 'Upload'} | Ch {lowSpin ? 'B' : 'A'}
      </div>
    </div>
  );
};

export default MixerChannel;
