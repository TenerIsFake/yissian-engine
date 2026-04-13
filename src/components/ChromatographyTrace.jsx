import React from 'react';

const MONO = 'monospace';

/**
 * ChromatographyTrace — CHEM-mode speedtest sparkline.
 * GC/HPLC-style chromatogram with filled elution peaks.
 * Data points become distinct peaks with shaded area under curve.
 * Self-contained: reads from localStorage.
 */
const ChromatographyTrace = () => {
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
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ CHROMATOGRAPHY_TRACE</div>
      <ChromaRow label="SRV-1" pts={data.srv1} color="#22d3ee" />
      <ChromaRow label="SRV-2" pts={data.srv2} color="#a78bfa" />
    </div>
  );
};

const ChromaRow = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 40;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  // Build smooth peak path and filled area
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p.mbps - min) / range) * (H - 8) - 4;
    return { x, y, mbps: p.mbps };
  });

  // Baseline y position
  const baselineY = H - 2;

  // Build the peak line path (smooth curves through points)
  const buildPeakPath = () => {
    if (points.length < 2) return '';
    let path = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      path += ` C ${cpx.toFixed(1)},${prev.y.toFixed(1)} ${cpx.toFixed(1)},${curr.y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
    }
    return path;
  };

  // Build filled area (line path + close along baseline)
  const buildFilledPath = () => {
    const linePath = buildPeakPath();
    const lastPt = points[points.length - 1];
    const firstPt = points[0];
    return `${linePath} L ${lastPt.x.toFixed(1)},${baselineY} L ${firstPt.x.toFixed(1)},${baselineY} Z`;
  };

  const peakPath = buildPeakPath();
  const filledPath = buildFilledPath();
  const latest = vals[vals.length - 1].toFixed(0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 40 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* Baseline */}
        <line x1={0} y1={baselineY} x2={W} y2={baselineY}
          stroke={color} strokeWidth="0.3" opacity={0.2} />

        {/* Filled area under peaks */}
        <path d={filledPath} fill={color} opacity={0.1} />

        {/* Peak trace line */}
        <path d={peakPath} fill="none" stroke={color} strokeWidth="1.5"
          opacity={0.8} strokeLinecap="round" strokeLinejoin="round" />

        {/* Retention time markers (vertical dashes at each point) */}
        {points.map((p, i) => (
          <line key={`rt-${i}`} x1={p.x} y1={baselineY} x2={p.x} y2={baselineY + 3}
            stroke={color} strokeWidth="0.4" opacity={0.2} />
        ))}

        {/* Peak apex dots */}
        {points.map((p, i) => {
          const isPeak = (i === 0 || p.mbps >= points[i - 1].mbps) &&
                         (i === points.length - 1 || p.mbps >= points[i + 1].mbps) &&
                         p.mbps > min + range * 0.3;
          return isPeak ? (
            <circle key={`apex-${i}`} cx={p.x} cy={p.y} r={1.5}
              fill={color} opacity={0.6} />
          ) : null;
        })}
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>↑{max.toFixed(0)} ↓{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default ChromatographyTrace;
