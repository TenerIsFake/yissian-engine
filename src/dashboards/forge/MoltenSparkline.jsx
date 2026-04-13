import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * MoltenSparkline — FORGE-mode speedtest sparkline (replaces SpeedtestSparkline).
 * Renders speedtest history as glowing molten metal streams instead of polylines.
 * The stream width varies with speed values, with droplet particles at peaks.
 * Self-contained: reads from localStorage (same as SpeedtestSparkline).
 */
const MoltenSparkline = () => {
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
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ MOLTEN_FLOW_HISTORY</div>
      <MoltenRow label="HEARTH-1" pts={data.srv1} color={activeCATRef.current.LANTHANIDE?.border || '#f59e0b'} />
      <MoltenRow label="HEARTH-2" pts={data.srv2} color={activeCATRef.current.HALOGEN?.border || '#ef4444'} />
    </div>
  );
};

const MoltenRow = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 40;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  // Build path points
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p.mbps - min) / range) * (H - 8) - 4;
    return { x, y, mbps: p.mbps };
  });

  // Build the molten stream as a thick path with varying width
  const buildStreamPath = () => {
    const topPath = points.map((p, i) => {
      const thickness = 1.5 + ((p.mbps - min) / range) * 4; // 1.5 → 5.5px thick
      return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${(p.y - thickness).toFixed(1)}`;
    }).join(' ');
    const bottomPath = [...points].reverse().map((p, i) => {
      const thickness = 1.5 + ((p.mbps - min) / range) * 4;
      return `L ${p.x.toFixed(1)},${(p.y + thickness).toFixed(1)}`;
    }).join(' ');
    return `${topPath} ${bottomPath} Z`;
  };

  const streamPath = buildStreamPath();
  const latest = vals[vals.length - 1].toFixed(0);

  // Find peak point for droplet
  const peakIdx = vals.indexOf(Math.max(...vals));
  const peakPt = points[peakIdx];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 50 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* Stream body */}
        <path d={streamPath} fill={color} opacity={0.3}
          stroke={color} strokeWidth="0.5" strokeOpacity={0.5} />

        {/* Center flow line (bright) */}
        <polyline
          points={points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
          fill="none" stroke={color} strokeWidth="1.5" opacity={0.8}
          strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }}
        />

        {/* Molten glow at each data point */}
        {points.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={1.2}
            fill={color} opacity={0.4 + ((p.mbps - min) / range) * 0.4} />
        ))}

        {/* Droplet particle at peak */}
        {peakPt && !prefersReducedMotion && (
          <motion.circle cx={peakPt.x} cy={peakPt.y - 4} r={1.5} fill={color}
            animate={{ cy: [peakPt.y - 6, peakPt.y - 2, peakPt.y - 6], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
        )}
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>↑{max.toFixed(0)} ↓{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default MoltenSparkline;
