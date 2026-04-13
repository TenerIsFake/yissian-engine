import React from 'react';

const MONO = 'monospace';

/**
 * RadarBlipTrail — AIRPORT-mode speedtest sparkline.
 * ATC radar screen aesthetic — each data point is a blip with a fading
 * ghost trail (comet tail). Green phosphor on dark background. Range rings.
 * Self-contained: reads from localStorage.
 */
const RadarBlipTrail = () => {
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
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ RADAR_BLIP_TRAIL</div>
      <RadarRow label="TRM-A" pts={data.srv1} color="#22d3ee" />
      <RadarRow label="TRM-B" pts={data.srv2} color="#a78bfa" />
    </div>
  );
};

const RadarRow = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 44;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const latest = vals[vals.length - 1].toFixed(0);

  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - 6 - ((p.mbps - min) / range) * (H - 14);
    return { x, y, ts: p.ts };
  });

  // Time labels
  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch (_) { return ''; }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 36 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* Dark radar screen background */}
        <rect x={0} y={0} width={W} height={H - 6} rx={2}
          fill="rgba(0,15,0,0.25)" stroke={color} strokeWidth="0.3" opacity={0.2} />

        {/* Range rings (horizontal guide lines) */}
        {[0.25, 0.5, 0.75].map((f, i) => {
          const ry = H - 6 - f * (H - 14);
          return (
            <line key={`ring-${i}`} x1={0} y1={ry} x2={W} y2={ry}
              stroke={color} strokeWidth="0.3" opacity={0.06}
              strokeDasharray="2 3" />
          );
        })}

        {/* Vertical range markers */}
        {Array.from({ length: 5 }, (_, i) => {
          const gx = (i + 1) * (W / 6);
          return (
            <line key={`vring-${i}`} x1={gx} y1={0} x2={gx} y2={H - 6}
              stroke={color} strokeWidth="0.2" opacity={0.04} />
          );
        })}

        {/* Ghost trails (comet tails behind each blip) */}
        {points.map((p, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          // Trail: line from previous to current, fading
          const trailOp = 0.05 + (i / points.length) * 0.12;
          return (
            <line key={`trail-${i}`}
              x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
              stroke={color} strokeWidth="1.5" opacity={trailOp}
              strokeLinecap="round" />
          );
        })}

        {/* Secondary glow trail (wider, more diffuse) */}
        {points.map((p, i) => {
          if (i === 0) return null;
          const prev = points[i - 1];
          const glowOp = 0.02 + (i / points.length) * 0.06;
          return (
            <line key={`glow-${i}`}
              x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
              stroke={color} strokeWidth="4" opacity={glowOp}
              strokeLinecap="round"
              style={{ filter: 'blur(1px)' }} />
          );
        })}

        {/* Blip dots — brightness increases toward latest */}
        {points.map((p, i) => {
          const age = 1 - (i / (points.length - 1)); // 1 = oldest, 0 = newest
          const blipOp = 0.15 + (1 - age) * 0.6;
          const blipR = 1 + (1 - age) * 0.8;
          return (
            <circle key={`blip-${i}`} cx={p.x} cy={p.y} r={blipR}
              fill={color} opacity={blipOp}
              style={i === points.length - 1 ? { filter: `drop-shadow(0 0 3px ${color})` } : {}} />
          );
        })}

        {/* Latest blip highlight ring */}
        {points.length > 0 && (() => {
          const last = points[points.length - 1];
          return (
            <circle cx={last.x} cy={last.y} r={3.5}
              fill="none" stroke={color} strokeWidth="0.5" opacity={0.3} />
          );
        })()}

        {/* Time labels */}
        {[0, Math.floor(points.length / 2), points.length - 1].map(idx => {
          const p = points[idx];
          const timeStr = formatTime(pts[idx]?.ts);
          return timeStr ? (
            <text key={`tlbl-${idx}`} x={p.x} y={H} textAnchor="middle"
              fill={color} fontSize="3" fontFamily={MONO} opacity={0.2}>
              {timeStr}
            </text>
          ) : null;
        })}

        {/* Sweep line indicator (latest position) */}
        {points.length > 0 && (
          <line x1={points[points.length - 1].x} y1={0}
            x2={points[points.length - 1].x} y2={H - 6}
            stroke={color} strokeWidth="0.3" opacity={0.12} />
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

export default RadarBlipTrail;
