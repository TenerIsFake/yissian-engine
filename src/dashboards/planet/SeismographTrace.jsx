import React from 'react';

const MONO = 'monospace';

/**
 * SeismographTrace — PLANET-mode speedtest sparkline.
 * Planetary seismograph readout — horizontal trace line with amplitude spikes.
 * Ruled paper background with timing marks. Scientific strip chart aesthetic.
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
        NO_SPEEDTEST_DATA — run a test first
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ SEISMOGRAPH_TRACE</div>
      <SeismoRow label="PLN-1" pts={data.srv1} color="#22d3ee" />
      <SeismoRow label="PLN-2" pts={data.srv2} color="#a78bfa" />
    </div>
  );
};

const SeismoRow = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 44;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const latest = vals[vals.length - 1].toFixed(0);

  // Baseline at center of chart area
  const baselineY = (H - 6) / 2;

  // Points — amplitude spikes above and below baseline
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const amplitude = ((p.mbps - min) / range) * (H - 14) / 2;
    return { x, amplitude, ts: p.ts };
  });

  // Build seismograph path — spikes at each data point, flat between
  const buildPath = () => {
    if (points.length < 2) return '';
    const segments = [];
    segments.push(`M 0,${baselineY}`);

    points.forEach((p, i) => {
      const preX = i > 0 ? (points[i - 1].x + p.x) / 2 : 0;
      // Flat approach to spike
      segments.push(`L ${preX},${baselineY}`);
      // Spike up
      segments.push(`L ${p.x},${baselineY - p.amplitude}`);
      // Spike down (mirror)
      segments.push(`L ${p.x},${baselineY + p.amplitude * 0.6}`);
      // Return to baseline
      const postX = i < points.length - 1 ? (p.x + points[i + 1].x) / 2 : W;
      segments.push(`L ${postX},${baselineY}`);
    });

    segments.push(`L ${W},${baselineY}`);
    return segments.join(' ');
  };

  const tracePath = buildPath();

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
        {/* Chart paper background */}
        <rect x={0} y={0} width={W} height={H - 6} rx={1}
          fill="rgba(255,255,255,0.01)" />

        {/* Ruled horizontal lines (seismograph paper) */}
        {[-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75].map((f, i) => {
          const ry = baselineY + f * (H - 14) / 2;
          const isCenter = f === 0;
          return (
            <line key={`rule-${i}`} x1={0} y1={ry} x2={W} y2={ry}
              stroke={color} strokeWidth={isCenter ? 0.5 : 0.2}
              opacity={isCenter ? 0.15 : 0.05} />
          );
        })}

        {/* Vertical time grid lines */}
        {Array.from({ length: 9 }, (_, i) => {
          const gx = (i + 1) * (W / 10);
          return (
            <line key={`vgrid-${i}`} x1={gx} y1={0} x2={gx} y2={H - 6}
              stroke={color} strokeWidth="0.2" opacity={0.04} />
          );
        })}

        {/* Seismograph trace — the main waveform */}
        <path d={tracePath} fill="none" stroke={color} strokeWidth="1.2"
          opacity={0.7} strokeLinejoin="round" strokeLinecap="round" />

        {/* Subtle fill for positive amplitudes */}
        {points.map((p, i) => {
          if (p.amplitude < 2) return null;
          return (
            <line key={`spike-fill-${i}`}
              x1={p.x} y1={baselineY} x2={p.x} y2={baselineY - p.amplitude}
              stroke={color} strokeWidth="2" opacity={0.06} />
          );
        })}

        {/* Peak markers (dots at spike tips) */}
        {points.map((p, i) => (
          <circle key={`peak-${i}`} cx={p.x} cy={baselineY - p.amplitude}
            r={0.8} fill={color} opacity={0.4} />
        ))}

        {/* Amplitude scale (left edge) */}
        <text x={1} y={4} fill={color} fontSize="2.5" fontFamily={MONO} opacity={0.2}>
          +{max.toFixed(0)}
        </text>
        <text x={1} y={H - 8} fill={color} fontSize="2.5" fontFamily={MONO} opacity={0.2}>
          -{min.toFixed(0)}
        </text>

        {/* Time marker ticks along bottom */}
        {points.map((p, i) => (
          <line key={`tick-${i}`} x1={p.x} y1={H - 6} x2={p.x} y2={H - 3.5}
            stroke={color} strokeWidth="0.3" opacity={0.12} />
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

        {/* Latest reading indicator */}
        {points.length > 0 && (() => {
          const last = points[points.length - 1];
          return (
            <circle cx={last.x} cy={baselineY - last.amplitude} r={2}
              fill={color} opacity={0.6}
              style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
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

export default SeismographTrace;
