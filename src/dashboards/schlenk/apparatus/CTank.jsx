// src/dashboards/schlenk/apparatus/CTank.jsx
// Drive tank shown as a small Ar cylinder with liquid-level fill.
// Props: x (center X), y (top Y), fillPct, label, subLabel, color, gradientId
import React from 'react';
import { drivePctToLiquidHeight } from '../metricMappers.js';

const TANK_W = 30;
const TANK_H = 45;

export default function CTank({ x, y, fillPct = 0, label = '', subLabel = '', color = '#4FB8D4', gradientId = 'liqCyanCast' }) {
  const liquidH = drivePctToLiquidHeight(fillPct, TANK_H - 1);
  const liquidY = (y + 1) + (TANK_H - 1 - liquidH);
  return (
    <g>
      <rect x={x - TANK_W / 2} y={y} width={TANK_W} height={TANK_H} rx="2"
            fill={`${color}1A`} stroke={color} strokeWidth="1.2" />
      <rect x={x - TANK_W / 2 + 1} y={liquidY} width={TANK_W - 2} height={liquidH}
            fill={`url(#${gradientId})`} />
      <circle cx={x} cy={y - 3} r="3" fill={color} />
      <text x={x} y={y + TANK_H + 9} fontFamily="monospace" fontSize="6"
            fill={color} textAnchor="middle">{label}</text>
      {subLabel && (
        <text x={x} y={y + TANK_H + 16} fontFamily="monospace" fontSize="5"
              fill={color} opacity="0.7" textAnchor="middle">{subLabel}</text>
      )}
    </g>
  );
}
