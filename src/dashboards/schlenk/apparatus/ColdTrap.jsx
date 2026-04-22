// src/dashboards/schlenk/apparatus/ColdTrap.jsx
// Cold trap with condensate pool (frost ticks = latency) and rising bubbles (throughput).
// Props: x (center), y (top), pingMs, downloadMbps, uploadMbps
import React from 'react';
import { netToBubbleDur, pingToFrostCount } from '../metricMappers.js';

const TRAP_W = 40;
const TRAP_H = 52;

export default function ColdTrap({ x, y, pingMs = 0, downloadMbps = 0, uploadMbps = 0 }) {
  const frostCount = pingToFrostCount(pingMs);
  const netMbps = (downloadMbps ?? 0) + (uploadMbps ?? 0);
  const bubbleDur = netToBubbleDur(netMbps);
  const leftX = x - TRAP_W / 2;
  // 3 bubbles at staggered starts
  const bubbles = [
    { cx: leftX + 13, r: 1.6, begin: 0 },
    { cx: leftX + 20, r: 1.3, begin: bubbleDur / 3 },
    { cx: leftX + 27, r: 1.5, begin: (2 * bubbleDur) / 3 },
  ];
  const frostTicks = [];
  for (let i = 0; i < frostCount; i++) {
    const ty = y + 36 + i * 3;
    const tx1 = leftX + 8 + (i * 2) % 20;
    frostTicks.push(
      <line key={i} x1={tx1} y1={ty} x2={tx1 + 4} y2={ty}
            stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
    );
  }
  return (
    <g>
      <rect x={leftX} y={y} width={TRAP_W} height={TRAP_H} rx="2"
            fill="rgba(120,180,255,0.1)" stroke="#78B4FF" strokeWidth="1.3" />
      <rect x={leftX + 5} y={y + 30} width={TRAP_W - 10} height={TRAP_H - 34}
            fill="rgba(255,255,255,0.28)" />
      {frostTicks}
      {bubbles.map((b, i) => (
        <g key={i}>
          <circle cx={b.cx} cy={y + 46} r={b.r} fill="#78B4FF">
            <animate attributeName="cy" from={y + 49} to={y + 8}
                     dur={`${bubbleDur}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0"
                     dur={`${bubbleDur}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      <text x={x} y={y + TRAP_H + 10} fontFamily="monospace" fontSize="5.5"
            fill="#78B4FF" textAnchor="middle">
        {Math.round(pingMs)}ms ↓{Math.round(downloadMbps)}/↑{Math.round(uploadMbps)}
      </text>
    </g>
  );
}
