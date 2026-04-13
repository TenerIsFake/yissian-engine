import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * ScintillatorTrace — PARTICLE-mode speedtest sparkline.
 * Scintillation detector pulse trace with sharp photon-hit peaks,
 * exponential decay tails, baseline noise, and discriminator threshold.
 * Self-contained: reads from localStorage.
 */
const ScintillatorTrace = () => {
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
        NO_SCINTILLATOR_DATA — run a test first
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>
        ◆ SCINTILLATOR_TRACE ◆ PULSE HEIGHT ANALYZER
      </div>
      <PulseRow label="DET-1" pts={data.srv1} color="#22d3ee" />
      <PulseRow label="DET-2" pts={data.srv2} color="#a78bfa" />
    </div>
  );
};

/**
 * PulseRow — Individual scintillator trace for one server.
 * Each data point becomes a sharp peak with exponential decay tail.
 */
const PulseRow = ({ label, pts, color }) => {
  const [hovered, setHovered] = useState(false);
  if (!pts || pts.length < 2) return null;

  const W = 160, H = 44;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  /* Build scintillation pulse trace:
     Each reading = sharp rise → peak → exponential decay tail
     Between readings = low baseline noise */
  const buildPulsePath = () => {
    const segments = [];
    const baseY = H - 4; // baseline
    const peakScale = (H - 12);

    pts.forEach((p, i) => {
      const cx = (i / (pts.length - 1)) * W;
      const peakH = ((p.mbps - min) / range) * peakScale;
      const peakY = baseY - peakH;

      /* Sharp rise to peak */
      const riseW = 2;
      /* Exponential decay tail */
      const decayW = W / pts.length * 0.6;

      if (i === 0) {
        segments.push(`M 0,${baseY}`);
      }

      /* Pre-peak baseline noise */
      const noiseX = cx - riseW;
      if (noiseX > 0) {
        /* Add baseline noise (small random wiggles) */
        const noiseCount = 3;
        const prevX = i > 0 ? ((i - 1) / (pts.length - 1)) * W + decayW + 2 : 0;
        const noiseSpan = noiseX - prevX;
        if (noiseSpan > 4) {
          for (let n = 0; n < noiseCount; n++) {
            const nx = prevX + (noiseSpan / noiseCount) * (n + 0.5);
            const ny = baseY - (Math.sin(i * 7 + n * 3.7) * 1.5 + 0.5);
            segments.push(`L ${nx.toFixed(1)},${ny.toFixed(1)}`);
          }
        }
        segments.push(`L ${noiseX.toFixed(1)},${baseY}`);
      }

      /* Sharp rise */
      segments.push(`L ${cx.toFixed(1)},${peakY.toFixed(1)}`);

      /* Exponential decay tail (3 control points) */
      const d1x = cx + decayW * 0.2;
      const d1y = peakY + peakH * 0.5;
      const d2x = cx + decayW * 0.5;
      const d2y = baseY - peakH * 0.12;
      const d3x = cx + decayW;
      const d3y = baseY;
      segments.push(`C ${d1x.toFixed(1)},${d1y.toFixed(1)} ${d2x.toFixed(1)},${d2y.toFixed(1)} ${d3x.toFixed(1)},${d3y.toFixed(1)}`);
    });

    /* Close to end */
    segments.push(`L ${W},${baseY}`);
    return segments.join(' ');
  };

  const pulsePath = buildPulsePath();
  const latest = vals[vals.length - 1].toFixed(0);

  /* Discriminator threshold line (at ~30% of range) */
  const thresholdPct = 0.3;
  const thresholdY = (H - 4) - thresholdPct * (H - 12);

  /* Peak positions for photon hit markers */
  const peaks = pts.map((p, i) => ({
    x: (i / (pts.length - 1)) * W,
    y: (H - 4) - ((p.mbps - min) / range) * (H - 12),
    above: (p.mbps - min) / range > thresholdPct,
  }));

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 34 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* CRT background */}
        <rect x={0} y={0} width={W} height={H} rx={2}
          fill={color} opacity={0.02} />

        {/* Grid lines (faint) */}
        {[0.25, 0.5, 0.75].map((f, i) => {
          const gy = (H - 4) - f * (H - 12);
          return <line key={i} x1={0} y1={gy} x2={W} y2={gy}
            stroke={color} strokeWidth={0.3} opacity={0.06} />;
        })}
        {Array.from({ length: 5 }, (_, i) => (i + 1) * (W / 6)).map((gx, i) => (
          <line key={`v-${i}`} x1={gx} y1={0} x2={gx} y2={H}
            stroke={color} strokeWidth={0.3} opacity={0.06} />
        ))}

        {/* Discriminator threshold line */}
        <line x1={0} y1={thresholdY} x2={W} y2={thresholdY}
          stroke="#ef4444" strokeWidth={0.5} opacity={0.25}
          strokeDasharray="4 3" />
        <text x={W - 2} y={thresholdY - 2} textAnchor="end"
          fill="#ef4444" fontSize="4" fontFamily={MONO} opacity={0.35}>
          DISC
        </text>

        {/* Afterglow trail */}
        <path d={pulsePath} fill="none" stroke={color} strokeWidth={3}
          opacity={0.06} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'blur(2px)' }} />

        {/* Secondary glow */}
        <path d={pulsePath} fill="none" stroke={color} strokeWidth={1.8}
          opacity={0.12} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'blur(1px)' }} />

        {/* Primary trace */}
        <path d={pulsePath} fill="none" stroke={color} strokeWidth={1}
          opacity={0.85} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }} />

        {/* Photon hit markers at peaks */}
        {peaks.map((pk, i) => (
          pk.above && (
            <g key={`hit-${i}`}>
              <circle cx={pk.x} cy={pk.y} r={1.5}
                fill={color} opacity={0.5}
                style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
              {/* Tiny scintillation flash lines */}
              {[0, 90, 45, 135].map(deg => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line key={deg}
                    x1={pk.x + Math.cos(rad) * 2} y1={pk.y + Math.sin(rad) * 2}
                    x2={pk.x + Math.cos(rad) * 4} y2={pk.y + Math.sin(rad) * 4}
                    stroke={color} strokeWidth={0.4} opacity={0.25}
                  />
                );
              })}
            </g>
          )
        ))}

        {/* Scan lines (CRT effect) */}
        {Array.from({ length: Math.floor(H / 3) }, (_, i) => (
          <line key={`scan-${i}`} x1={0} y1={i * 3} x2={W} y2={i * 3}
            stroke="rgba(0,0,0,0.12)" strokeWidth={0.5} />
        ))}

        {/* Blinking cursor at latest reading */}
        {peaks.length > 0 && (() => {
          const last = peaks[peaks.length - 1];
          return prefersReducedMotion ? (
            <circle cx={last.x} cy={last.y} r={2.5}
              fill={color} opacity={0.8}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          ) : (
            <motion.circle cx={last.x} cy={last.y} r={2.5}
              fill={color}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          );
        })()}

        {/* Border frame */}
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={2}
          fill="none" stroke={color} strokeWidth={0.5} opacity={0.1} />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color, filter: `drop-shadow(0 0 2px ${color})` }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>pk {max.toFixed(0)} / bl {min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default ScintillatorTrace;
