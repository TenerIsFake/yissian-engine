// src/dashboards/schlenk/apparatus/PiraniGauge.jsx
// RAM gauge as a circular Pirani-style vacuum gauge with rotating needle.
// Props: x, y (center), ramPct, label
import React from 'react';
import { ramToNeedleAngle } from '../metricMappers.js';

const GAUGE_R = 17;

export default function PiraniGauge({ x, y, ramPct = 0, label = 'RAM' }) {
  const angle = ramToNeedleAngle(ramPct);
  const rad = (angle - 90) * Math.PI / 180;
  const needleEndX = x + Math.cos(rad) * (GAUGE_R - 3);
  const needleEndY = y + Math.sin(rad) * (GAUGE_R - 3);
  return (
    <g>
      <circle cx={x} cy={y} r={GAUGE_R} fill="rgba(255,220,80,0.09)"
              stroke="#FFDC50" strokeWidth="1.3" />
      <circle cx={x} cy={y} r={GAUGE_R - 5} fill="none"
              stroke="rgba(255,220,80,0.35)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      <line x1={x} y1={y} x2={needleEndX} y2={needleEndY}
            stroke="#FFDC50" strokeWidth="1.6" />
      <circle cx={x} cy={y} r="1.4" fill="#FFDC50" />
      <text x={x} y={y + GAUGE_R + 10} fontFamily="monospace" fontSize="6"
            fill="#FFDC50" textAnchor="middle">{label} {Math.round(ramPct)}%</text>
    </g>
  );
}
