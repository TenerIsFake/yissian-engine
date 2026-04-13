import React from 'react';

const MONO = 'monospace';

// ─────────────────────────────────────────────
// SPEEDTEST SPARKLINE — NH-08 (CHEM default)
// ─────────────────────────────────────────────
const SparkRow = ({ label, poly, color }) => {
  if (!poly) return null;
  const W = 160, H = 36;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 40 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        <polyline points={poly.points} fill="none" stroke={color} strokeWidth="1.5"
          opacity="0.8" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color }}>{poly.latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>↑{poly.max} ↓{poly.min}</span>
      </div>
    </div>
  );
};

const SpeedtestSparkline = () => {
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

  const buildPolyline = (pts, width, height) => {
    if (pts.length < 2) return null;
    const vals = pts.map(p => p.mbps);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const stepX = width / (pts.length - 1);
    const points = pts.map((p, i) => {
      const x = i * stepX;
      const y = height - ((p.mbps - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    return { points, min: min.toFixed(0), max: max.toFixed(0), latest: vals[vals.length - 1].toFixed(0) };
  };

  const W = 160, H = 36;
  const s1 = buildPolyline(data.srv1, W, H);
  const s2 = buildPolyline(data.srv2, W, H);

  if (!s1 && !s2) {
    if (data.srv1.length === 0 && data.srv2.length === 0) {
      return (
        <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.15em', padding: 16 }}>
          NO_SPEEDTEST_DATA — run a test first
        </div>
      );
    }
    return (
      <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.15em', padding: '6px 0' }}>NO_SPEEDTEST_DATA</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ SPEEDTEST_HISTORY</div>
      <SparkRow label="SRV-1" poly={s1} color="#22d3ee" />
      <SparkRow label="SRV-2" poly={s2} color="#a78bfa" />
    </div>
  );
};

export default SpeedtestSparkline;
