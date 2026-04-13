import React from 'react';

const MONO = 'monospace';

/**
 * BarographTrace — WEATHER-mode speedtest sparkline.
 * Recording barometer chart aesthetic — line on ruled "paper" background,
 * ink-pen style trace, time markers along bottom.
 * Self-contained: reads from localStorage.
 */
const BarographTrace = () => {
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
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ BAROGRAPH_TRACE</div>
      <BaroRow label="STN-A" pts={data.srv1} color="#22d3ee" />
      <BaroRow label="STN-B" pts={data.srv2} color="#a78bfa" />
    </div>
  );
};

const BaroRow = ({ label, pts, color }) => {
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

  const polyStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Ruled paper lines (horizontal guide lines)
  const ruledLines = 5;
  const ruledSpacing = (H - 14) / ruledLines;

  // Time labels (show first, middle, last)
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
        {/* Paper background */}
        <rect x={0} y={0} width={W} height={H - 6} rx={1}
          fill="rgba(255,255,255,0.015)" />

        {/* Ruled horizontal lines */}
        {Array.from({ length: ruledLines + 1 }, (_, i) => {
          const ry = 4 + i * ruledSpacing;
          return (
            <line key={`rule-${i}`} x1={0} y1={ry} x2={W} y2={ry}
              stroke={color} strokeWidth="0.3" opacity={i === ruledLines ? 0.15 : 0.06} />
          );
        })}

        {/* Y-axis labels (pressure-style markings) */}
        {[0, 2, 4].map(i => {
          const ry = 4 + i * ruledSpacing;
          const val = max - (i / ruledLines) * range;
          return (
            <text key={`ylbl-${i}`} x={-1} y={ry + 3} textAnchor="end"
              fill={color} fontSize="3" fontFamily={MONO} opacity={0.15}>
              {val.toFixed(0)}
            </text>
          );
        })}

        {/* Ink-pen trace — slightly rough stroke */}
        <polyline points={polyStr} fill="none" stroke={color} strokeWidth="1.8"
          opacity={0.7} strokeLinejoin="round" strokeLinecap="round"
          strokeDasharray="0" />

        {/* Subtle fill below the trace (ink bleed effect) */}
        <polygon
          points={`${points[0].x.toFixed(1)},${H - 6} ${polyStr} ${points[points.length - 1].x.toFixed(1)},${H - 6}`}
          fill={color} opacity={0.04} />

        {/* Data point marks (small ink dots) */}
        {points.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={1.2}
            fill={color} opacity={0.5} />
        ))}

        {/* Time markers along bottom */}
        {points.map((p, i) => (
          <line key={`tm-${i}`} x1={p.x} y1={H - 6} x2={p.x} y2={H - 3}
            stroke={color} strokeWidth="0.3" opacity={0.15} />
        ))}

        {/* Time labels (first, middle, last) */}
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

        {/* Latest value marker (pen tip position) */}
        {points.length > 0 && (() => {
          const last = points[points.length - 1];
          return (
            <g>
              <line x1={last.x} y1={last.y - 4} x2={last.x} y2={last.y + 4}
                stroke={color} strokeWidth="0.5" opacity={0.3} />
              <circle cx={last.x} cy={last.y} r={2}
                fill={color} opacity={0.7}
                style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
            </g>
          );
        })()}
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>↑{max.toFixed(0)} ↓{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default BarographTrace;
