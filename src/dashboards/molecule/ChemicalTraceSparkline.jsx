import React from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * ChemicalTraceSparkline — MOLECULE-mode speedtest sparkline.
 * Gas chromatography trace — smooth peaks and valleys.
 * Major peak amplitude proportional to speed.
 * Baseline drift when idle, sharp peaks during activity.
 * Retention time labels on x-axis.
 * Self-contained: reads from localStorage (same pattern as SubspaceTelemetry).
 */
const ChemicalTraceSparkline = () => {
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
        NO_CHROMATOGRAM_DATA — run a test first
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>GAS_CHROMATOGRAPHY</div>
      <ChromaTrace label="RXN-A" pts={data.srv1} color="#22d3ee" />
      <ChromaTrace label="RXN-B" pts={data.srv2} color="#a78bfa" />
    </div>
  );
};

/**
 * ChromaTrace — single GC trace row.
 * Renders data points as a smooth chromatography peak profile.
 */
const ChromaTrace = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 40;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  // Generate smooth GC peak profile using cubic bezier through points
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p.mbps - min) / range) * (H - 10) - 5;
    return { x, y };
  });

  // Build smooth path using Catmull-Rom → cubic Bezier conversion
  const smoothPath = buildSmoothPath(points);
  const lastPt = points[points.length - 1];
  const latest = vals[vals.length - 1].toFixed(0);

  // Baseline
  const baselineY = H - 3;

  // Retention time labels (evenly spaced along x-axis)
  const retentionTimes = [0, 2, 4, 6, 8, 10].map(t => ({
    x: (t / 10) * W,
    label: `${t.toFixed(0)}m`,
  }));

  // Fill area under curve
  const fillPath = `${smoothPath} L ${W},${baselineY} L 0,${baselineY} Z`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 38 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* Chart background */}
        <rect x={0} y={0} width={W} height={H} rx={2}
          fill={color} opacity={0.015} />

        {/* Grid lines (faint) */}
        {[0.25, 0.5, 0.75].map((f, i) => {
          const gy = H - f * (H - 10) - 5;
          return (
            <line key={`gh-${i}`} x1={0} y1={gy} x2={W} y2={gy}
              stroke={color} strokeWidth="0.3" opacity={0.05} />
          );
        })}

        {/* Baseline */}
        <line x1={0} y1={baselineY} x2={W} y2={baselineY}
          stroke={color} strokeWidth="0.5" opacity={0.15} />

        {/* Baseline noise/drift (subtle zigzag) */}
        <path
          d={`M 0,${baselineY} ${Array.from({ length: 20 }, (_, i) => {
            const bx = (i / 19) * W;
            const by = baselineY + (Math.sin(i * 1.7) * 0.8);
            return `L ${bx.toFixed(1)},${by.toFixed(1)}`;
          }).join(' ')}`}
          stroke={color} strokeWidth="0.3" fill="none" opacity={0.1}
        />

        {/* Fill under curve (faint) */}
        <path d={fillPath} fill={color} opacity={0.04} />

        {/* Afterglow trail */}
        <path d={smoothPath} fill="none" stroke={color} strokeWidth="3"
          opacity={0.06} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'blur(2px)' }} />

        {/* Secondary glow */}
        <path d={smoothPath} fill="none" stroke={color} strokeWidth="1.8"
          opacity={0.12} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'blur(1px)' }} />

        {/* Primary chromatogram trace */}
        <path d={smoothPath} fill="none" stroke={color} strokeWidth="1.2"
          opacity={0.85} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }} />

        {/* Peak markers (small triangles at local maxima) */}
        {points.filter((p, i) => {
          if (i === 0 || i === points.length - 1) return false;
          return p.y < points[i - 1].y && p.y < points[i + 1].y;
        }).map((p, i) => (
          <polygon key={`peak-${i}`}
            points={`${p.x - 2},${p.y - 3} ${p.x + 2},${p.y - 3} ${p.x},${p.y - 1}`}
            fill={color} opacity={0.3} />
        ))}

        {/* Retention time labels */}
        {retentionTimes.map((rt, i) => (
          <text key={`rt-${i}`} x={rt.x} y={H - 0.5} textAnchor="middle"
            fill={color} fontSize="3" fontFamily={MONO} opacity={0.2}>
            {rt.label}
          </text>
        ))}

        {/* Blinking cursor at latest point */}
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

        {/* Border frame */}
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={2}
          fill="none" stroke={color} strokeWidth="0.4" opacity={0.08} />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color, filter: `drop-shadow(0 0 2px ${color})` }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>\u2191{max.toFixed(0)} \u2193{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

/**
 * Build a smooth SVG path through points using Catmull-Rom → cubic Bezier.
 * This produces the organic chromatography peak shape.
 */
function buildSmoothPath(points) {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to cubic Bezier control points
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return d;
}

export default ChemicalTraceSparkline;
