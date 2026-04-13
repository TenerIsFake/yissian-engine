import React from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* Rune glyphs for peak markers */
const PEAK_RUNES = ['\u16A0', '\u16B7', '\u16C1', '\u16A2', '\u16BE', '\u16B1'];

/**
 * RuneTraceSparkline -- ARCANE-mode speedtest sparkline.
 * A mystical energy trace with angular runic patterns (sharp geometric angles).
 * Rune marks appear at peak points. Arcane fire effect along the trace line.
 * Self-contained: reads from localStorage like SpeedtestSparkline.
 */
const RuneTraceSparkline = () => {
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
        NO_TRACE_DATA \u2014 cast a speedtest first
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>{'\u25C6'} RUNE_TRACE {'\u25C6'} LEYLINE TELEMETRY</div>
      <RuneTraceRow label="PRI" pts={data.srv1} color="#a78bfa" fireColor="#c084fc" />
      <RuneTraceRow label="SEC" pts={data.srv2} color="#818cf8" fireColor="#a5b4fc" />
    </div>
  );
};

const RuneTraceRow = ({ label, pts, color, fireColor }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 40;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p.mbps - min) / range) * (H - 10) - 5;
    return { x, y, mbps: p.mbps };
  });

  /* Build angular/runic polyline: add midpoint offsets for sharp geometric angles */
  const runicPoints = [];
  points.forEach((pt, i) => {
    if (i > 0) {
      /* Add a sharp angular midpoint between each pair */
      const prev = points[i - 1];
      const midX = (prev.x + pt.x) / 2;
      /* Offset the midpoint vertically in an alternating pattern for angular look */
      const offset = (i % 2 === 0 ? -3 : 3) * ((pt.mbps - min) / range);
      const midY = Math.max(2, Math.min(H - 2, (prev.y + pt.y) / 2 + offset));
      runicPoints.push({ x: midX, y: midY });
    }
    runicPoints.push(pt);
  });

  const polyStr = runicPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastPt = points[points.length - 1];
  const latest = vals[vals.length - 1].toFixed(0);

  /* Detect peaks (local maxima) for rune markers */
  const peaks = [];
  for (let i = 1; i < points.length - 1; i++) {
    if (points[i].mbps >= points[i - 1].mbps && points[i].mbps >= points[i + 1].mbps) {
      peaks.push({ ...points[i], runeIdx: peaks.length });
    }
  }
  /* Also mark the global max */
  const globalMaxIdx = vals.indexOf(max);
  if (globalMaxIdx >= 0 && !peaks.find(p => p.x === points[globalMaxIdx].x)) {
    peaks.unshift({ ...points[globalMaxIdx], runeIdx: peaks.length });
  }

  /* Runic grid lines -- angular/geometric style */
  const gridAngles = [0.25, 0.5, 0.75].map(f => H - f * (H - 10) - 5);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 28 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* Dark arcane background */}
        <rect x={0} y={0} width={W} height={H} rx={2}
          fill={color} opacity={0.02} />

        {/* Geometric grid lines (dashed, runic style) */}
        {gridAngles.map((gy, i) => (
          <line key={`gh-${i}`} x1={0} y1={gy} x2={W} y2={gy}
            stroke={color} strokeWidth="0.3" opacity={0.08}
            strokeDasharray="1 5" />
        ))}

        {/* Vertical rune markers at intervals */}
        {Array.from({ length: 4 }, (_, i) => {
          const gx = (i + 1) * (W / 5);
          return (
            <line key={`gv-${i}`} x1={gx} y1={0} x2={gx} y2={H}
              stroke={color} strokeWidth="0.3" opacity={0.05}
              strokeDasharray="2 6" />
          );
        })}

        {/* Arcane fire glow (wide blurred trail) */}
        <polyline points={polyStr} fill="none" stroke={fireColor || color} strokeWidth="5"
          opacity={0.06} strokeLinejoin="bevel" strokeLinecap="round"
          style={{ filter: 'blur(3px)' }} />

        {/* Secondary fire glow */}
        <polyline points={polyStr} fill="none" stroke={fireColor || color} strokeWidth="3"
          opacity={0.12} strokeLinejoin="bevel" strokeLinecap="round"
          style={{ filter: 'blur(1.5px)' }} />

        {/* Primary runic trace -- angular/sharp joints */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="1.3"
          opacity={0.9} strokeLinejoin="bevel" strokeLinecap="square"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }} />

        {/* Peak rune markers */}
        {peaks.slice(0, 5).map(({ x, y, runeIdx }, pi) => (
          <g key={`peak-${pi}`}>
            {/* Glow behind rune */}
            <circle cx={x} cy={y - 5} r={3}
              fill={color} opacity={0.1}
              style={{ filter: `blur(2px)` }} />
            <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="central"
              fill={color} fontSize="5" fontFamily="serif"
              opacity={0.7}
              style={{ filter: `drop-shadow(0 0 2px ${color})` }}>
              {PEAK_RUNES[runeIdx % PEAK_RUNES.length]}
            </text>
          </g>
        ))}

        {/* Blinking cursor at latest reading */}
        {lastPt && (
          prefersReducedMotion ? (
            <g>
              <circle cx={lastPt.x} cy={lastPt.y} r={2.5}
                fill={color} opacity={0.8}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
              {/* Small diamond shape at cursor */}
              <polygon points={`${lastPt.x},${lastPt.y - 3} ${lastPt.x + 2},${lastPt.y} ${lastPt.x},${lastPt.y + 3} ${lastPt.x - 2},${lastPt.y}`}
                fill="none" stroke={color} strokeWidth="0.5" opacity={0.4} />
            </g>
          ) : (
            <motion.g
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <circle cx={lastPt.x} cy={lastPt.y} r={2.5}
                fill={color}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
              <polygon points={`${lastPt.x},${lastPt.y - 3} ${lastPt.x + 2},${lastPt.y} ${lastPt.x},${lastPt.y + 3} ${lastPt.x - 2},${lastPt.y}`}
                fill="none" stroke={color} strokeWidth="0.5" opacity={0.5} />
            </motion.g>
          )
        )}

        {/* Border frame (runic stone border) */}
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={1}
          fill="none" stroke={color} strokeWidth="0.5" opacity={0.08} />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color, filter: `drop-shadow(0 0 2px ${color})` }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{'\u2191'}{max.toFixed(0)} {'\u2193'}{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default RuneTraceSparkline;
