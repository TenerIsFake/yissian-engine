import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SoundwaveSparkline — BAND-mode speedtest sparkline (replaces SpeedtestSparkline).
 * Audio waveform oscilloscope-style trace showing speedtest history as guitar amp readout.
 * Self-contained: reads from localStorage (same pattern as MoltenSparkline, SubspaceTelemetry).
 */
const SoundwaveSparkline = () => {
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
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ WAVEFORM_HISTORY</div>
      <WaveformRow label="MAIN-AMP" pts={data.srv1} color={activeCATRef.current.LANTHANIDE?.border || '#a855f7'} />
      <WaveformRow label="MONITOR" pts={data.srv2} color={activeCATRef.current.HALOGEN?.border || '#ef4444'} />
    </div>
  );
};

const WaveformRow = ({ label, pts, color }) => {
  if (!pts || pts.length < 2) return null;
  const W = 160, H = 40;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  // Build waveform path — audio oscilloscope style
  const points = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p.mbps - min) / range) * (H - 8) - 4;
    return { x, y, mbps: p.mbps };
  });

  // Mirrored waveform (reflected below center for oscilloscope look)
  const centerY = H / 2;
  const buildWavePath = (mirror = false) => {
    return points.map((p, i) => {
      const deviation = centerY - p.y;
      const wy = mirror ? centerY + deviation * 0.6 : p.y;
      return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${wy.toFixed(1)}`;
    }).join(' ');
  };

  const mainPath = buildWavePath(false);
  const mirrorPath = buildWavePath(true);
  const latest = vals[vals.length - 1].toFixed(0);
  const peakIdx = vals.indexOf(Math.max(...vals));
  const peakPt = points[peakIdx];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 50 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        {/* Amp screen background */}
        <rect x={0} y={0} width={W} height={H} rx={3}
          fill="rgba(10,10,15,0.5)" stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />

        {/* Center reference line */}
        <line x1={0} y1={centerY} x2={W} y2={centerY}
          stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} strokeDasharray="3,3" />

        {/* Grid lines */}
        {[0.25, 0.75].map(pct => (
          <line key={pct} x1={0} y1={H * pct} x2={W} y2={H * pct}
            stroke="rgba(255,255,255,0.03)" strokeWidth={0.3} />
        ))}

        {/* Mirror waveform (faded) */}
        <polyline
          points={mirrorPath.replace(/[ML] /g, '').replace(/M/g, '')}
          fill="none" stroke={color} strokeWidth="0.8" opacity={0.15}
          strokeLinejoin="round" strokeLinecap="round"
        />

        {/* Main waveform */}
        <polyline
          points={mainPath.replace(/[ML] /g, '').replace(/M/g, '')}
          fill="none" stroke={color} strokeWidth="1.5" opacity={0.8}
          strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }}
        />

        {/* Peak indicator glow */}
        {peakPt && (
          <circle cx={peakPt.x} cy={peakPt.y} r={2}
            fill={color} opacity={0.5}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        )}

        {/* Animated sweep line */}
        {!prefersReducedMotion && (
          <motion.line x1={0} y1={1} x2={0} y2={H - 1}
            stroke={color} strokeWidth={0.5} opacity={0.2}
            animate={{ x1: [0, W], x2: [0, W] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Data point dots */}
        {points.map((p, i) => (
          <circle key={`dot-${i}`} cx={p.x} cy={p.y} r={1}
            fill={color} opacity={0.4 + ((p.mbps - min) / range) * 0.4} />
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

export default SoundwaveSparkline;
