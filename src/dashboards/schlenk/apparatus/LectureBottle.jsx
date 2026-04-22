// src/dashboards/schlenk/apparatus/LectureBottle.jsx
// Lecture bottle (compressed-gas cylinder) with colored gas gradient + Y-split cross-feeds.
// Each bottle feeds BOTH manifolds via animated dashed tubes.
// Props: x (center of bottle column), y (top of bottle body),
//        gas: 'NO2'|'I2'|'Cl2', drive, fillPct,
//        gbLabel, srv1TargetX, srv2TargetX, arLineY
import React from 'react';

const BOTTLE_W = 22;
const BOTTLE_H = 72;

const GAS_META = {
  NO2: { gradientId: 'gNO2Cast', stroke: '#B4593A', valveFill: '#8C3010', knobFill: '#D86030', label: 'NO₂', textFill: 'rgba(255,230,200,0.9)', subFill: 'rgba(255,230,200,0.75)' },
  I2:  { gradientId: 'gI2Cast',  stroke: '#7020A0', valveFill: '#401880', knobFill: '#9040C8', label: 'I₂',  textFill: 'rgba(230,210,245,0.9)', subFill: 'rgba(230,210,245,0.75)' },
  Cl2: { gradientId: 'gCl2Cast', stroke: '#80A028', valveFill: '#607820', knobFill: '#D0E880', label: 'Cl₂', textFill: 'rgba(240,245,200,0.9)', subFill: 'rgba(240,245,200,0.75)' },
};

export default function LectureBottle({
  x, y, gas, drive, fillPct = 0, gbLabel = '',
  srv1TargetX, srv2TargetX, arLineY,
}) {
  const meta = GAS_META[gas] || GAS_META.NO2;
  const bx = x - BOTTLE_W / 2;
  // Horizontal run y-level for cross-feeds: arLineY
  const runY = arLineY;
  // Local bottle-side exit points (where cross-feeds leave the bottle)
  const leftExitX = bx - 2;
  const rightExitX = bx + BOTTLE_W + 2;
  const sideExitY = y + 20;  // mid-bottle side
  // Path: out → horizontal short step → vertical up to runY → horizontal to target X → down to runY (target point on Ar line)
  const leftPath = `M ${bx} ${sideExitY} L ${leftExitX} ${sideExitY} L ${leftExitX} ${runY} L ${srv1TargetX} ${runY}`;
  const rightPath = `M ${bx + BOTTLE_W} ${sideExitY} L ${rightExitX} ${sideExitY} L ${rightExitX} ${runY} L ${srv2TargetX} ${runY}`;
  return (
    <g>
      {/* Cross-feed tubes (green Ar color, outward flow) */}
      <path d={leftPath} fill="none" stroke="#8CF0B4" strokeWidth="1.3"
            strokeDasharray="6 4" opacity="0.85">
        <animate attributeName="stroke-dashoffset" from="0" to="-10"
                 dur="2.5s" repeatCount="indefinite" />
      </path>
      <path d={rightPath} fill="none" stroke="#8CF0B4" strokeWidth="1.3"
            strokeDasharray="6 4" opacity="0.85">
        <animate attributeName="stroke-dashoffset" from="0" to="-10"
                 dur="2.5s" repeatCount="indefinite" />
      </path>
      {/* Bottle body */}
      <rect x={bx} y={y + 6} width={BOTTLE_W} height={BOTTLE_H} rx="10"
            fill={`url(#${meta.gradientId})`} stroke={meta.stroke} strokeWidth="1" />
      {/* Valve cap */}
      <rect x={bx + 7} y={y - 4} width="8" height="8" rx="1"
            fill={meta.valveFill} stroke={meta.stroke} strokeWidth="1" />
      <circle cx={bx + 11} cy={y} r="1.5" fill={meta.knobFill} />
      {/* Labels */}
      <text x={x} y={y + 50} fontFamily="monospace" fontSize="7"
            fill={meta.textFill} textAnchor="middle" fontWeight="bold">{drive}</text>
      <text x={x} y={y + 62} fontFamily="monospace" fontSize="5.5"
            fill={meta.subFill} textAnchor="middle">{meta.label}</text>
      <text x={x} y={y + 92} fontFamily="monospace" fontSize="6"
            fill={meta.knobFill} textAnchor="middle">{Math.round(fillPct)}% · {gbLabel}</text>
    </g>
  );
}
