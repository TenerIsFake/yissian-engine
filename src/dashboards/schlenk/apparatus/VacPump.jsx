// src/dashboards/schlenk/apparatus/VacPump.jsx
// CPU as vacuum pump with rotating rotor. Rotor duration scales inversely with CPU%.
// Props: x (center), y (top of pump), cpuPct
import React from 'react';
import { cpuToRotorDur } from '../metricMappers.js';

const PUMP_W = 40;
const PUMP_H = 42;

export default function VacPump({ x, y, cpuPct = 0 }) {
  const rotorDur = cpuToRotorDur(cpuPct);
  const cx = x;
  const cy = y + PUMP_H / 2;
  return (
    <g>
      <rect x={x - PUMP_W / 2} y={y} width={PUMP_W} height={PUMP_H} rx="2"
            fill="rgba(255,140,60,0.12)" stroke="#FF8C3C" strokeWidth="1.3" />
      <circle cx={cx} cy={cy} r="12" fill="none" stroke="#FF8C3C" strokeWidth="1.2" />
      <g transform={`translate(${cx},${cy})`}>
        <line x1="0" y1="-9" x2="0" y2="9" stroke="#FF8C3C" strokeWidth="1.7" />
        <line x1="-9" y1="0" x2="9" y2="0" stroke="#FF8C3C" strokeWidth="1.7" />
        <animateTransform attributeName="transform" type="rotate"
                          from="0" to="360" dur={`${rotorDur}s`} repeatCount="indefinite" />
      </g>
      <text x={x} y={y + PUMP_H + 10} fontFamily="monospace" fontSize="6"
            fill="#FF8C3C" textAnchor="middle">CPU {Math.round(cpuPct)}%</text>
    </g>
  );
}
