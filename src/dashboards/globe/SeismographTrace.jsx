import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SeismographTrace — GLOBE-mode speedtest sparkline.
 * Classic seismograph drum trace. Needle oscillation amplitude proportional
 * to speed. Drum rotation visible (circular paper edge). Richter scale
 * reference line. P-wave and S-wave arrival markers.
 * Self-contained: reads from localStorage.
 */
const SeismographTrace = () => {
  const [data, setData] = React.useState({ srv1: [], srv2: [] });

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('speedtest_v2');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const take = (arr) =>
        Array.isArray(arr)
          ? arr.slice(-10).map(r => ({ ts: r.ts, mbps: typeof r.mbps === 'number' ? r.mbps : 0 }))
          : [];
      setData({ srv1: take(parsed.srv1), srv2: take(parsed.srv2) });
    } catch (_) {}
  }, []);

  if (data.srv1.length === 0 && data.srv2.length === 0) {
    return (
      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.15em', padding: 16 }}>
        NO_SEISMIC_DATA — run a speedtest first
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ SEISMOGRAPH_TRACE</div>
      <SeismographRow label="PRI" pts={data.srv1} color="#ef4444" waveLabel="P-WAVE" />
      <SeismographRow label="SEC" pts={data.srv2} color="#f59e0b" waveLabel="S-WAVE" />
    </div>
  );
};

const SeismographRow = ({ label, pts, color, waveLabel }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 48;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

  // Convert to seismograph trace — exaggerate differences as seismic amplitude
  const points = pts.map((p, i) => {
    const x = 12 + (i / (pts.length - 1)) * (W - 24);
    const normalized = (p.mbps - min) / range;
    // Create seismograph-like jagged trace with sharp peaks
    const amplitude = normalized * (H * 0.35);
    const y = H / 2 - amplitude + (H * 0.1);
    return { x, y };
  });

  // Generate seismograph polyline with intermediate "jitter" points
  const tracePoints = [];
  points.forEach((p, i) => {
    if (i > 0) {
      // Add a small jitter point between main readings
      const prev = points[i - 1];
      const midX = (prev.x + p.x) / 2;
      const jitter = (Math.sin(i * 3.7) * 3) + (Math.cos(i * 2.3) * 2);
      tracePoints.push({ x: midX, y: H / 2 + jitter });
    }
    tracePoints.push(p);
  });

  const polyStr = tracePoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastPt = points[points.length - 1];
  const latest = vals[vals.length - 1].toFixed(0);

  // Richter scale mapping (0-1000 Mbps → 1.0-9.0 scale)
  const richter = (1 + (avg / 1000) * 8).toFixed(1);

  // P-wave and S-wave arrival markers (first two significant peaks)
  const sortedByAmp = [...points].sort((a, b) => a.y - b.y);
  const pWave = sortedByAmp[0]; // highest amplitude
  const sWave = sortedByAmp.length > 1 ? sortedByAmp[1] : null;

  // Drum edge (circular paper roll hint)
  const drumR = H / 2 - 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 28 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* Drum background — paper with slight warm tint */}
        <rect x={0} y={0} width={W} height={H} rx={2}
          fill="#fef3c7" opacity={0.03} />

        {/* Drum rotation edge (left side arc) */}
        <path d={`M 8,${H / 2 - drumR} A ${4},${drumR} 0 0,0 8,${H / 2 + drumR}`}
          fill="none" stroke={color} strokeWidth="0.5" opacity={0.12} />
        <path d={`M 6,${H / 2 - drumR + 3} A ${3},${drumR - 3} 0 0,0 6,${H / 2 + drumR - 3}`}
          fill="none" stroke={color} strokeWidth="0.3" opacity={0.06} />

        {/* Horizontal grid lines (drum paper lines) */}
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={`gh-${i}`} x1={10} y1={f * H} x2={W - 4} y2={f * H}
            stroke={color} strokeWidth="0.25" opacity={0.08} />
        ))}

        {/* Richter scale reference line (center baseline) */}
        <line x1={10} y1={H / 2} x2={W - 4} y2={H / 2}
          stroke={color} strokeWidth="0.5" opacity={0.15} />
        <text x={W - 2} y={H / 2 + 1} textAnchor="end"
          fill={color} fontSize="4" fontFamily={MONO} opacity={0.2}>
          0
        </text>

        {/* Vertical time markers */}
        {Array.from({ length: 5 }, (_, i) => {
          const vx = 12 + (i + 1) * ((W - 24) / 6);
          return (
            <line key={`vt-${i}`} x1={vx} y1={2} x2={vx} y2={H - 2}
              stroke={color} strokeWidth="0.2" opacity={0.06} />
          );
        })}

        {/* Seismograph trace — afterglow */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="3"
          opacity={0.06} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'blur(2px)' }} />

        {/* Secondary trace glow */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="1.5"
          opacity={0.15} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'blur(1px)' }} />

        {/* Primary needle trace */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="0.8"
          opacity={0.85} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 1px ${color})` }} />

        {/* P-wave arrival marker */}
        {pWave && (
          <g>
            <line x1={pWave.x} y1={2} x2={pWave.x} y2={H - 2}
              stroke={color} strokeWidth="0.4" opacity={0.15} strokeDasharray="1 2" />
            <text x={pWave.x} y={6} textAnchor="middle"
              fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.35}>
              P
            </text>
          </g>
        )}

        {/* S-wave arrival marker */}
        {sWave && sWave !== pWave && (
          <g>
            <line x1={sWave.x} y1={2} x2={sWave.x} y2={H - 2}
              stroke={color} strokeWidth="0.4" opacity={0.1} strokeDasharray="1 2" />
            <text x={sWave.x} y={6} textAnchor="middle"
              fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.25}>
              S
            </text>
          </g>
        )}

        {/* Needle position (blinking at latest reading) */}
        {lastPt && (
          prefersReducedMotion ? (
            <g>
              <line x1={lastPt.x} y1={H / 2} x2={lastPt.x} y2={lastPt.y}
                stroke={color} strokeWidth="0.6" opacity={0.5} />
              <circle cx={lastPt.x} cy={lastPt.y} r={2}
                fill={color} opacity={0.8}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
            </g>
          ) : (
            <motion.g>
              <line x1={lastPt.x} y1={H / 2} x2={lastPt.x} y2={lastPt.y}
                stroke={color} strokeWidth="0.6" opacity={0.5} />
              <motion.circle cx={lastPt.x} cy={lastPt.y} r={2}
                fill={color}
                animate={{ opacity: [0.4, 1, 0.4], r: [1.5, 2.5, 1.5] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: `drop-shadow(0 0 3px ${color})` }}
              />
            </motion.g>
          )
        )}

        {/* Border frame (drum housing bezel) */}
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={2}
          fill="none" stroke={color} strokeWidth="0.5" opacity={0.1} />

        {/* Richter scale label */}
        <text x={14} y={H - 3} fill={color} fontSize="3.5" fontFamily={MONO} opacity={0.2}
          letterSpacing="0.05em">
          R{richter}
        </text>
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color, filter: `drop-shadow(0 0 2px ${color})` }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>↑{max.toFixed(0)} ↓{min.toFixed(0)}</span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 7 }}>{waveLabel}</span>
      </div>
    </div>
  );
};

export default SeismographTrace;
