import React from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SubspaceTelemetry — SPACE-mode speedtest sparkline.
 * Phosphor oscilloscope trace with CRT scan-line aesthetic.
 * Trailing afterglow, grid background, blinking cursor at latest reading.
 * Self-contained: reads from localStorage.
 */
const SubspaceTelemetry = () => {
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
        NO_SPEEDTEST_DATA — run a test first
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ SUBSPACE_TELEMETRY</div>
      <TelemetryRow label="PRI" pts={data.srv1} color="#22d3ee" />
      <TelemetryRow label="SEC" pts={data.srv2} color="#a78bfa" />
    </div>
  );
};

const TelemetryRow = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 40;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p.mbps - min) / range) * (H - 8) - 4;
    return { x, y };
  });

  const polyStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastPt = points[points.length - 1];
  const latest = vals[vals.length - 1].toFixed(0);

  // Grid lines
  const gridLinesH = [0.25, 0.5, 0.75].map(f => H - f * (H - 8) - 4);
  const gridLinesV = Array.from({ length: 5 }, (_, i) => (i + 1) * (W / 6));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 28 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* CRT background tint */}
        <rect x={0} y={0} width={W} height={H} rx={2}
          fill={color} opacity={0.02} />

        {/* Grid lines */}
        {gridLinesH.map((gy, i) => (
          <line key={`gh-${i}`} x1={0} y1={gy} x2={W} y2={gy}
            stroke={color} strokeWidth="0.3" opacity={0.06} />
        ))}
        {gridLinesV.map((gx, i) => (
          <line key={`gv-${i}`} x1={gx} y1={0} x2={gx} y2={H}
            stroke={color} strokeWidth="0.3" opacity={0.06} />
        ))}

        {/* Afterglow trail (wider, faded duplicate) */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="4"
          opacity={0.08} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `blur(2px)` }} />

        {/* Secondary glow */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="2.5"
          opacity={0.15} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `blur(1px)` }} />

        {/* Primary phosphor trace */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="1.2"
          opacity={0.9} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }} />

        {/* Scan line overlay (subtle CRT effect) */}
        {Array.from({ length: Math.floor(H / 3) }, (_, i) => (
          <line key={`scan-${i}`} x1={0} y1={i * 3} x2={W} y2={i * 3}
            stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        ))}

        {/* Blinking cursor at latest reading */}
        {lastPt && (
          prefersReducedMotion ? (
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
          )
        )}

        {/* Border frame (CRT bezel) */}
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={2}
          fill="none" stroke={color} strokeWidth="0.5" opacity={0.1} />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color, filter: `drop-shadow(0 0 2px ${color})` }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>↑{max.toFixed(0)} ↓{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default SubspaceTelemetry;
