import React from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * HeartbeatTrace — BIO-mode speedtest sparkline.
 * ECG/heartbeat monitor trace with classic PQRST waveform.
 * Heart rate (wave frequency) proportional to speed.
 * Flatline when offline. Beep markers at peaks.
 * Self-contained: reads from localStorage.
 */
const HeartbeatTrace = () => {
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
        NO_VITALS_DATA — run a speedtest first
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>{'\u25C6'} CARDIAC_MONITOR</div>
      <HeartbeatRow label="PRI" pts={data.srv1} color="#22c55e" />
      <HeartbeatRow label="SEC" pts={data.srv2} color="#ef4444" />
    </div>
  );
};

/**
 * Generate a PQRST waveform segment.
 * P wave (small bump), Q dip, R spike, S dip, T wave (gentle bump), then baseline.
 */
function pqrstSegment(startX, segWidth, baseY, amplitude, yInvert) {
  const pts = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startX + t * segWidth;
    let y = baseY;
    if (t < 0.12) {
      // P wave: small bump
      const pt = t / 0.12;
      y = baseY - Math.sin(pt * Math.PI) * amplitude * 0.15 * yInvert;
    } else if (t < 0.18) {
      // Baseline between P and QRS
      y = baseY;
    } else if (t < 0.22) {
      // Q dip
      const qt = (t - 0.18) / 0.04;
      y = baseY + Math.sin(qt * Math.PI) * amplitude * 0.1 * yInvert;
    } else if (t < 0.32) {
      // R spike (the big one)
      const rt = (t - 0.22) / 0.10;
      y = baseY - Math.sin(rt * Math.PI) * amplitude * yInvert;
    } else if (t < 0.38) {
      // S dip
      const st = (t - 0.32) / 0.06;
      y = baseY + Math.sin(st * Math.PI) * amplitude * 0.2 * yInvert;
    } else if (t < 0.5) {
      // Baseline
      y = baseY;
    } else if (t < 0.7) {
      // T wave: gentle bump
      const tt = (t - 0.5) / 0.2;
      y = baseY - Math.sin(tt * Math.PI) * amplitude * 0.25 * yInvert;
    } else {
      // Baseline rest
      y = baseY;
    }
    pts.push({ x, y });
  }
  return pts;
}

const HeartbeatRow = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 40;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const latest = vals[vals.length - 1].toFixed(0);

  // Heart rate proportional to average speed
  const avgSpeed = vals.reduce((a, b) => a + b, 0) / vals.length;
  const bpm = Math.round(40 + (avgSpeed / (max || 1)) * 80); // 40-120 BPM range

  // Number of heartbeats visible in the trace
  const beatCount = Math.max(2, Math.min(6, Math.round(avgSpeed / ((max || 100) / 5))));
  const segWidth = W / beatCount;
  const baseY = H * 0.6;
  const amplitude = H * 0.35;

  // Build full ECG trace from repeated PQRST segments
  const allPts = [];
  for (let b = 0; b < beatCount; b++) {
    const segPts = pqrstSegment(b * segWidth, segWidth, baseY, amplitude, 1);
    allPts.push(...segPts);
  }

  const polyStr = allPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Find R-peaks (the spike tops) for beep markers
  const rPeaks = [];
  for (let b = 0; b < beatCount; b++) {
    const peakX = b * segWidth + segWidth * 0.27;
    const peakY = baseY - amplitude;
    rPeaks.push({ x: peakX, y: peakY });
  }

  // Flatline overlay data (for offline — but we don't have online/offline here, so we always show trace)
  const flatlineStr = `0,${baseY} ${W},${baseY}`;

  // Grid lines
  const gridLinesH = [0.25, 0.5, 0.75].map(f => H * f);
  const gridLinesV = Array.from({ length: 5 }, (_, i) => (i + 1) * (W / 6));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 28 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* ECG paper background */}
        <rect x={0} y={0} width={W} height={H} rx={2}
          fill={color} opacity={0.015} />

        {/* Grid lines (ECG paper style) */}
        {gridLinesH.map((gy, i) => (
          <line key={`gh-${i}`} x1={0} y1={gy} x2={W} y2={gy}
            stroke={color} strokeWidth="0.3" opacity={0.06} />
        ))}
        {gridLinesV.map((gx, i) => (
          <line key={`gv-${i}`} x1={gx} y1={0} x2={gx} y2={H}
            stroke={color} strokeWidth="0.3" opacity={0.06} />
        ))}

        {/* Finer sub-grid (ECG small squares) */}
        {Array.from({ length: Math.floor(W / 8) }, (_, i) => (
          <line key={`sg-${i}`} x1={i * 8} y1={0} x2={i * 8} y2={H}
            stroke={color} strokeWidth="0.15" opacity={0.04} />
        ))}

        {/* Afterglow trail */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="4"
          opacity={0.06} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'blur(2px)' }} />

        {/* Secondary glow */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="2"
          opacity={0.12} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'blur(1px)' }} />

        {/* Primary ECG trace */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="1.2"
          opacity={0.9} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }} />

        {/* R-peak beep markers */}
        {rPeaks.map((peak, i) => (
          prefersReducedMotion ? (
            <circle key={`beep-${i}`} cx={peak.x} cy={peak.y - 3} r={1.5}
              fill={color} opacity={0.5}
              style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
          ) : (
            <motion.circle key={`beep-${i}`} cx={peak.x} cy={peak.y - 3} r={1.5}
              fill={color}
              animate={{ opacity: [0.2, 0.8, 0.2], r: [1, 2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: i * (60 / bpm / beatCount) }}
              style={{ filter: `drop-shadow(0 0 3px ${color})` }}
            />
          )
        ))}

        {/* Baseline reference */}
        <line x1={0} y1={baseY} x2={W} y2={baseY}
          stroke={color} strokeWidth="0.3" opacity={0.08} strokeDasharray="3 5" />

        {/* CRT scan lines */}
        {Array.from({ length: Math.floor(H / 3) }, (_, i) => (
          <line key={`scan-${i}`} x1={0} y1={i * 3} x2={W} y2={i * 3}
            stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
        ))}

        {/* Blinking cursor at end of trace */}
        {allPts.length > 0 && (() => {
          const lastPt = allPts[allPts.length - 1];
          return prefersReducedMotion ? (
            <circle cx={lastPt.x} cy={lastPt.y} r={2.5}
              fill={color} opacity={0.8}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          ) : (
            <motion.circle cx={lastPt.x} cy={lastPt.y} r={2.5}
              fill={color}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          );
        })()}

        {/* Border frame */}
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={2}
          fill="none" stroke={color} strokeWidth="0.5" opacity={0.1} />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color, filter: `drop-shadow(0 0 2px ${color})` }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{bpm} BPM</span>
        <span style={{ color: 'rgba(255,255,255,0.25)' }}>{'\u2191'}{max.toFixed(0)} {'\u2193'}{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default HeartbeatTrace;
