import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * PrecipRadar — WEATHER-mode bandwidth diagram (replaces JablonskiDiagram).
 * DOWNLOAD (emission): Doppler radar sweep with precipitation bands +
 *   rain gauge that fills proportionally.
 * UPLOAD (excitation): Clear radar, evaporation heat-shimmer lines rising.
 *
 * Props match JablonskiDiagram interface:
 *   label, level, online, details, variant, size, jablonskiLabel
 */
const PrecipRadar = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const clipId = useId();
  const cat = activeCATRef.current.NOBLE;
  const isDownload = variant === 'emission';
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const signalColor = cat.border;
  const bandCount = Math.floor(level / 20) + 1; // 1–6
  const radarCx = isDownload ? 35 : 50;
  const radarCy = 42;
  const radarR = 24;

  // Rain gauge (right side, only for download)
  const gaugeX = 68, gaugeY = 22, gaugeW = 14, gaugeH = 50;
  const fillH = act * (gaugeH - 2);
  const fillY = gaugeY + gaugeH - 1 - fillH;

  // Evaporation wave paths (for upload)
  const evapWaves = Array.from({ length: Math.min(bandCount, 5) }, (_, i) => {
    const baseX = 30 + i * 10;
    const amplitude = 2 + act * 2;
    return {
      x: baseX,
      path: `M ${baseX},82 Q ${baseX - amplitude},${70 - i * 6} ${baseX},${58 - i * 8} Q ${baseX + amplitude},${46 - i * 8} ${baseX},${34 - i * 10}`,
      opacity: (0.2 + act * 0.5) * (1 - i * 0.12),
      i,
    };
  });

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
          border: `1px solid ${signalColor}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${signalColor}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            {jablonskiLabel || (isDownload ? 'PRECIP ◆ INFLOW' : 'PRECIP ◆ OUTFLOW')}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: signalColor, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color: signalColor, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{d.label}</span>
              <span style={{ color: signalColor }}>{d.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? signalColor : '#374151' }} />
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              {online ? 'ONLINE' : online === null ? 'STARTING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {isDownload ? (
          /* ── DOWNLOAD: Radar + Rain Gauge ── */
          <g>
            {/* Radar scope circle */}
            <circle cx={radarCx} cy={radarCy} r={radarR} fill="none" stroke={signalColor} strokeWidth="0.8" opacity={0.2} />
            {/* Radar range rings */}
            {[8, 16, 24].map(r => (
              <circle key={`ring-${r}`} cx={radarCx} cy={radarCy} r={r}
                fill="none" stroke={signalColor} strokeWidth="0.3" opacity={0.1} />
            ))}
            {/* Crosshairs */}
            <line x1={radarCx - radarR} y1={radarCy} x2={radarCx + radarR} y2={radarCy} stroke={signalColor} strokeWidth="0.3" opacity={0.1} />
            <line x1={radarCx} y1={radarCy - radarR} x2={radarCx} y2={radarCy + radarR} stroke={signalColor} strokeWidth="0.3" opacity={0.1} />

            {/* Precipitation bands (arcs closing inward) */}
            {online && Array.from({ length: Math.min(bandCount, 5) }, (_, i) => {
              const bandR = radarR - 2 - i * 4;
              if (bandR < 3) return null;
              const bandOp = (0.15 + act * 0.4) * (1 - i * 0.1);
              const bandEl = (
                <circle cx={radarCx} cy={radarCy} r={bandR}
                  fill={signalColor} opacity={bandOp * 0.3}
                  stroke={signalColor} strokeWidth="0.5" strokeOpacity={bandOp} />
              );
              return prefersReducedMotion ? (
                <g key={`band-${i}`}>{bandEl}</g>
              ) : (
                <motion.g key={`band-${i}`}
                  animate={{ opacity: [bandOp * 0.6, bandOp, bandOp * 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                >
                  {bandEl}
                </motion.g>
              );
            })}

            {/* Radar sweep arm */}
            {online && !prefersReducedMotion && (
              <motion.line x1={radarCx} y1={radarCy} x2={radarCx} y2={radarCy - radarR + 1}
                stroke={signalColor} strokeWidth="1" opacity={0.5}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: `${radarCx}px ${radarCy}px` }}
              />
            )}

            {/* Rain gauge (right side) */}
            <rect x={gaugeX} y={gaugeY} width={gaugeW} height={gaugeH} rx={2}
              fill={signalColor} fillOpacity={0.02}
              stroke={signalColor} strokeWidth="0.8" opacity={0.3} />
            {/* Gauge funnel top */}
            <path d={`M ${gaugeX - 2},${gaugeY} L ${gaugeX + gaugeW + 2},${gaugeY} L ${gaugeX + gaugeW},${gaugeY + 4} L ${gaugeX},${gaugeY + 4} Z`}
              fill={signalColor} opacity={0.08} stroke={signalColor} strokeWidth="0.5" strokeOpacity={0.2} />

            <defs>
              <clipPath id={clipId}>
                <rect x={gaugeX + 1} y={gaugeY + 1} width={gaugeW - 2} height={gaugeH - 2} rx={1} />
              </clipPath>
            </defs>

            {/* Water fill in gauge */}
            {fillH > 0 && (
              <rect x={gaugeX + 1} y={fillY} width={gaugeW - 2} height={fillH + 1}
                fill={signalColor} opacity={0.2 + act * 0.4}
                clipPath={`url(#${clipId})`} />
            )}

            {/* Gauge graduation marks */}
            {[25, 50, 75].map(pct => {
              const gy = gaugeY + gaugeH - 1 - (pct / 100) * (gaugeH - 2);
              return (
                <line key={`gmark-${pct}`} x1={gaugeX + gaugeW} y1={gy} x2={gaugeX + gaugeW + 3} y2={gy}
                  stroke={signalColor} strokeWidth="0.4" opacity={0.25} />
              );
            })}

            {/* Direction label */}
            <text x={radarCx} y={10} textAnchor="middle" fill={signalColor} fontSize="4" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
              ▼ PRECIP IN
            </text>
          </g>
        ) : (
          /* ── UPLOAD: Evaporation heat shimmer ── */
          <g>
            {/* Ground / surface line */}
            <line x1={15} y1={82} x2={85} y2={82} stroke={signalColor} strokeWidth="1" opacity={0.3} />
            {/* Surface heat glow */}
            <rect x={15} y={78} width={70} height={4} fill={signalColor} opacity={0.04 + act * 0.06} rx={1} />

            {/* Evaporation wave lines */}
            {online && evapWaves.map(({ path, opacity: wOp, i: wi }) => {
              const waveEl = (
                <path d={path} stroke={signalColor} strokeWidth={0.8 + act * 0.5} fill="none" opacity={wOp}
                  strokeDasharray={act > 0.5 ? 'none' : '3 2'}
                  style={{ filter: wOp > 0.4 ? `drop-shadow(0 0 2px ${signalColor})` : 'none' }} />
              );
              return prefersReducedMotion ? (
                <g key={`evap-${wi}`}>{waveEl}</g>
              ) : (
                <motion.g key={`evap-${wi}`}
                  animate={{ opacity: [wOp * 0.6, wOp, wOp * 0.6], y: [0, -2, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: wi * 0.35 }}
                >
                  {waveEl}
                </motion.g>
              );
            })}

            {/* Upward arrows */}
            {online && [35, 50, 65].map((ax, i) => (
              <polygon key={`arr-${i}`} points={`${ax - 3},30 ${ax + 3},30 ${ax},24`}
                fill={signalColor} opacity={0.15 + act * 0.25}
                style={{ filter: `drop-shadow(0 0 2px ${signalColor})` }} />
            ))}

            {/* Direction label */}
            <text x={50} y={10} textAnchor="middle" fill={signalColor} fontSize="4" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
              ▲ EVAP OUT
            </text>
          </g>
        )}

        {/* Percentage readout */}
        <text x={isDownload ? 75 : 50} y={97} textAnchor="middle" fill={signalColor} fontSize="5.5" fontFamily={MONO} opacity={0.75}>
          {level.toFixed(0)}%
        </text>

        {/* Online dot */}
        <circle cx={isDownload ? 10 : 88} cy={93} r={2.5} fill={online ? signalColor : '#374151'} opacity={0.85}
          style={{ filter: online ? `drop-shadow(0 0 3px ${signalColor})` : 'none' }} />
      </svg>

      <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', fontFamily: MONO, letterSpacing: '0.15em' }}>
        {label}
      </span>
    </div>
  );
};

export default PrecipRadar;
