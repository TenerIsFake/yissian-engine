import React from 'react';
import { computeAggregateLoad } from './portState.js';

/**
 * Circular pressure gauge — needle swings 0-100 load → -90°..+90°
 * Renders inside a parent <g transform> at a given scene position.
 * Small: radius ~14 (fits in manifold hero strip at right end).
 */
export default function PressureGauge({ statsMap = {}, r = 14 }) {
  const load = computeAggregateLoad(statsMap);
  // 0 → -90°, 100 → +90°
  const angle = -90 + (load / 100) * 180;
  return (
    <g>
      {/* Brass ring */}
      <circle cx="0" cy="0" r={r} fill="rgba(8,16,26,0.8)" stroke="#D4A04F" strokeWidth="1.5" />
      {/* Scale arc (top half) */}
      <path d={`M ${-r + 2} 0 A ${r - 2} ${r - 2} 0 0 1 ${r - 2} 0`}
            fill="none" stroke="#4FB8D4" strokeWidth="0.7" />
      {/* Scale tick marks */}
      {[-90, -45, 0, 45, 90].map((deg) => {
        const rad = (deg - 90) * Math.PI / 180;
        const x1 = (r - 4) * Math.cos(rad);
        const y1 = (r - 4) * Math.sin(rad);
        const x2 = (r - 1) * Math.cos(rad);
        const y2 = (r - 1) * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4FB8D4" strokeWidth="0.6" />;
      })}
      {/* Needle */}
      <g transform={`rotate(${angle})`}>
        <line x1="0" y1="0" x2="0" y2={-r + 2} stroke="#B47FE8" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="0" cy={-r + 2} r="1.2" fill="#B47FE8" />
      </g>
      {/* Center pivot */}
      <circle cx="0" cy="0" r="2" fill="#D4A04F" stroke="#8B6B2F" strokeWidth="0.5" />
      {/* Readout below */}
      <text x="0" y={r + 10} textAnchor="middle" fontFamily="monospace" fontSize="7"
            fill="#7A9BAE" letterSpacing="0.1em">{load}%</text>
    </g>
  );
}
