import React from 'react';

const MONO = 'monospace';

/**
 * SonarWaterfall — OCEAN-mode speedtest sparkline.
 * Classic sonar waterfall display — vertical time axis, signal intensity
 * as color bands (dark blue → bright cyan/green at peaks).
 * Each data point becomes a horizontal intensity band.
 * Self-contained: reads from localStorage.
 */
const SonarWaterfall = () => {
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
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ SONAR_WATERFALL</div>
      <WaterfallRow label="VES-1" pts={data.srv1} color="#22d3ee" />
      <WaterfallRow label="VES-2" pts={data.srv2} color="#a78bfa" />
    </div>
  );
};

const WaterfallRow = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 44;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const latest = vals[vals.length - 1].toFixed(0);

  // Each data point is a horizontal band — waterfall scrolls top to bottom
  const bandH = (H - 6) / pts.length;

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
        {/* Display background (sonar screen) */}
        <rect x={0} y={0} width={W} height={H - 6} rx={2}
          fill="rgba(0,20,40,0.3)" stroke={color} strokeWidth="0.3" opacity={0.3} />

        {/* Waterfall bands — intensity maps to brightness */}
        {pts.map((p, i) => {
          const intensity = (p.mbps - min) / range; // 0..1
          // Color: dark navy at low intensity → bright color at high
          const bandOp = 0.08 + intensity * 0.5;
          const bandY = i * bandH;

          return (
            <rect key={`band-${i}`} x={1} y={bandY} width={W - 2} height={bandH}
              fill={color} opacity={bandOp} />
          );
        })}

        {/* Intensity gradient overlay — brighter spots at peaks */}
        {pts.map((p, i) => {
          const intensity = (p.mbps - min) / range;
          if (intensity < 0.4) return null;
          const bandY = i * bandH;
          // Hot spot at the center of the band
          const hotW = intensity * (W - 20);
          const hotX = (W - hotW) / 2;
          return (
            <rect key={`hot-${i}`} x={hotX} y={bandY + 0.5}
              width={hotW} height={bandH - 1} rx={1}
              fill={color} opacity={intensity * 0.15}
              style={{ filter: `blur(${1 + intensity}px)` }} />
          );
        })}

        {/* Scan line separators */}
        {pts.map((_, i) => (
          <line key={`scan-${i}`} x1={0} y1={i * bandH} x2={W} y2={i * bandH}
            stroke="rgba(0,0,0,0.2)" strokeWidth="0.3" />
        ))}

        {/* Time labels along right edge */}
        {[0, Math.floor(pts.length / 2), pts.length - 1].map(idx => {
          const timeStr = formatTime(pts[idx]?.ts);
          return timeStr ? (
            <text key={`tlbl-${idx}`} x={W - 2} y={idx * bandH + bandH / 2 + 1.5}
              textAnchor="end" fill={color} fontSize="3" fontFamily={MONO} opacity={0.25}>
              {timeStr}
            </text>
          ) : null;
        })}

        {/* Depth scale along left edge */}
        {[0, Math.floor(pts.length / 2), pts.length - 1].map(idx => {
          const val = vals[idx];
          return (
            <text key={`dlbl-${idx}`} x={3} y={idx * bandH + bandH / 2 + 1.5}
              textAnchor="start" fill={color} fontSize="3" fontFamily={MONO} opacity={0.2}>
              {val.toFixed(0)}
            </text>
          );
        })}

        {/* Active sweep line (latest reading highlight) */}
        <line x1={0} y1={(pts.length - 1) * bandH} x2={W} y2={(pts.length - 1) * bandH}
          stroke={color} strokeWidth="0.8" opacity={0.4} />

        {/* Corner frame marks (sonar display bezel) */}
        {[[0, 0], [W - 6, 0], [0, H - 12], [W - 6, H - 12]].map(([fx, fy], i) => (
          <React.Fragment key={`frame-${i}`}>
            <line x1={fx} y1={fy} x2={fx + 6} y2={fy}
              stroke={color} strokeWidth="0.4" opacity={0.15} />
            <line x1={fx + (i % 2 === 0 ? 0 : 6)} y1={fy}
              x2={fx + (i % 2 === 0 ? 0 : 6)} y2={fy + 6}
              stroke={color} strokeWidth="0.4" opacity={0.15} />
          </React.Fragment>
        ))}
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>↑{max.toFixed(0)} ↓{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default SonarWaterfall;
