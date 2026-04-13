import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * SmokeTrailSparkline — NOIR-mode speedtest sparkline.
 * Cigarette smoke trail: wispy curling path.
 * Trail thickness proportional to speed, curl frequency increases with value.
 * Ash tip glow at origin, dissipating opacity at the end.
 * Self-contained: reads from localStorage.
 */
const SmokeTrailSparkline = () => {
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
        NO_CASE_DATA — run a speed test first
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.2em', marginBottom: 2 }}>◆ SMOKE_TRAIL_INTEL</div>
      <SmokeRow label="PRI" pts={data.srv1} color="hsl(35, 80%, 55%)" />
      <SmokeRow label="SEC" pts={data.srv2} color="hsl(0, 0%, 65%)" />
    </div>
  );
};

const SmokeRow = ({ label, pts, color }) => {
  const filterId = useId();
  const gradId = useId();
  if (!pts || pts.length < 2) return null;

  const W = 160, H = 40;
  const vals = pts.map(p => p.mbps);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const latest = vals[vals.length - 1].toFixed(0);

  // Base data points
  const basePoints = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - ((p.mbps - min) / range) * (H - 10) - 5;
    return { x, y };
  });

  // Generate wispy smoke trail path with curls
  // Curl frequency scales with average speed
  const avgSpeed = vals.reduce((a, b) => a + b, 0) / vals.length;
  const curlAmplitude = 2 + (avgSpeed / (max || 1)) * 3;
  const curlFreq = 2 + (avgSpeed / (range || 1)) * 2;

  // Build cubic bezier smoke path with sinusoidal curl offsets
  let smokePath = `M ${basePoints[0].x},${basePoints[0].y}`;
  for (let i = 1; i < basePoints.length; i++) {
    const p0 = basePoints[i - 1];
    const p1 = basePoints[i];
    const midX = (p0.x + p1.x) / 2;
    // Add curl offset to control points
    const curlOffset = Math.sin(i * curlFreq * 0.8) * curlAmplitude;
    const cp1x = p0.x + (p1.x - p0.x) * 0.33;
    const cp1y = p0.y + curlOffset;
    const cp2x = p0.x + (p1.x - p0.x) * 0.67;
    const cp2y = p1.y - curlOffset * 0.6;
    smokePath += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
  }

  // Trail thickness proportional to speed values
  const strokeBase = 1.5 + (avgSpeed / (max || 1)) * 2;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.1em', minWidth: 28 }}>{label}</span>
      <svg width={W} height={H} style={{ flexShrink: 0 }}>
        <defs>
          {/* Gradient for opacity fade (dissipating smoke) */}
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="40%" stopColor={color} stopOpacity={0.5} />
            <stop offset="80%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
          {/* Turbulence filter for smoke texture */}
          <filter id={filterId} x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.06" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Background hint — dark surface */}
        <rect x={0} y={0} width={W} height={H} rx={2}
          fill={color} opacity={0.015} />

        {/* Wide diffuse smoke background (outermost layer) */}
        <path d={smokePath} fill="none" stroke={color} strokeWidth={strokeBase * 3}
          opacity={0.05} strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `blur(3px)` }} />

        {/* Medium smoke layer */}
        <path d={smokePath} fill="none" stroke={color} strokeWidth={strokeBase * 1.8}
          opacity={0.1} strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `blur(1.5px)` }} />

        {/* Core smoke trail with gradient fade */}
        <path d={smokePath} fill="none" stroke={`url(#${gradId})`} strokeWidth={strokeBase}
          strokeLinecap="round" strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 2px ${color})` }} />

        {/* Wisp particles along trail */}
        {basePoints.filter((_, i) => i % 2 === 1 && i < basePoints.length - 1).map((p, wi) => {
          const wispY = p.y + Math.sin(wi * 2.5) * curlAmplitude;
          const opacity = 0.15 - wi * 0.03;
          return prefersReducedMotion ? (
            <circle key={`wisp-${wi}`} cx={p.x} cy={wispY} r={1.5}
              fill={color} opacity={Math.max(opacity, 0.02)} />
          ) : (
            <motion.circle key={`wisp-${wi}`} cx={p.x} cy={wispY} r={1.5}
              fill={color}
              animate={{
                cy: [wispY, wispY - 2, wispY + 1, wispY],
                opacity: [opacity, opacity * 0.5, opacity * 0.8, opacity],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: wi * 0.5 }}
            />
          );
        })}

        {/* Ash tip glow at origin (leftmost point) */}
        {basePoints.length > 0 && (
          <>
            {/* Ember glow */}
            <circle cx={basePoints[0].x + 2} cy={basePoints[0].y} r={3}
              fill="hsl(15, 90%, 50%)" opacity={0.25}
              style={{ filter: 'blur(1.5px)' }} />
            {/* Ash tip core */}
            {prefersReducedMotion ? (
              <circle cx={basePoints[0].x + 2} cy={basePoints[0].y} r={2}
                fill="hsl(15, 95%, 55%)" opacity={0.7}
                style={{ filter: `drop-shadow(0 0 3px hsl(15, 90%, 50%))` }} />
            ) : (
              <motion.circle cx={basePoints[0].x + 2} cy={basePoints[0].y} r={2}
                fill="hsl(15, 95%, 55%)"
                animate={{ opacity: [0.5, 0.9, 0.5], r: [1.8, 2.5, 1.8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ filter: `drop-shadow(0 0 3px hsl(15, 90%, 50%))` }}
              />
            )}
            {/* Cigarette stub hint */}
            <rect x={basePoints[0].x - 4} y={basePoints[0].y - 1.5} width={6} height={3} rx={0.5}
              fill="rgba(220,210,190,0.3)" stroke="rgba(200,190,170,0.15)" strokeWidth="0.3" />
          </>
        )}

        {/* Faint border */}
        <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={2}
          fill="none" stroke={color} strokeWidth="0.3" opacity={0.06} />
      </svg>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.5)',
        display: 'flex', flexDirection: 'column', gap: 2, lineHeight: 1.2 }}>
        <span style={{ color, filter: `drop-shadow(0 0 2px ${color})` }}>{latest} Mbps</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>{'\u2191'}{max.toFixed(0)} {'\u2193'}{min.toFixed(0)}</span>
      </div>
    </div>
  );
};

export default SmokeTrailSparkline;
