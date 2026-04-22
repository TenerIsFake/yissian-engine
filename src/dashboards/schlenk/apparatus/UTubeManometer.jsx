// src/dashboards/schlenk/apparatus/UTubeManometer.jsx
// U-tube manometer showing SRV-1 vs SRV-2 load differential via Hg column offset.
// Props: cx (center x), topY, bottomY, legLeftX, legRightX,
//        deltaTorr, srv1VacEndX, srv2VacStartX, vacLineY
import React from 'react';
import { differentialToMercuryOffset } from '../metricMappers.js';

export default function UTubeManometer({
  cx, topY, bottomY, legLeftX, legRightX,
  deltaTorr = 0,
  srv1VacEndX, srv2VacStartX, vacLineY,
}) {
  const offset = differentialToMercuryOffset(deltaTorr);
  // At rest (delta=0) Hg surface at midY; positive delta pushes LEFT column DOWN, RIGHT column UP
  const midY = (topY + bottomY) / 2 + 10;
  const leftHgTop = midY + offset;  // delta>0 → left pushed down
  const rightHgTop = midY - offset; // delta>0 → right pushed up

  const curveRadius = 18;
  const curveTop = bottomY - curveRadius;

  // Glass tube outline
  const glassPath = `M ${legLeftX} ${topY} L ${legLeftX} ${curveTop}
                     Q ${legLeftX} ${bottomY} ${(legLeftX + legRightX) / 2 - 5} ${bottomY}
                     L ${(legLeftX + legRightX) / 2 + 5} ${bottomY}
                     Q ${legRightX} ${bottomY} ${legRightX} ${curveTop}
                     L ${legRightX} ${topY}`;

  // Hg fill — from leftHgTop down the left leg, around the curve, up to rightHgTop
  const innerLeftOffset = 4;
  const innerRightOffset = -4;
  const hgPath = `M ${legLeftX} ${leftHgTop}
                  L ${legLeftX} ${curveTop}
                  Q ${legLeftX} ${bottomY} ${(legLeftX + legRightX) / 2 - 5} ${bottomY}
                  L ${(legLeftX + legRightX) / 2 + 5} ${bottomY}
                  Q ${legRightX} ${bottomY} ${legRightX} ${curveTop}
                  L ${legRightX} ${rightHgTop}
                  L ${legRightX + innerRightOffset} ${rightHgTop}
                  L ${legRightX + innerRightOffset} ${curveTop}
                  Q ${legRightX + innerRightOffset} ${bottomY - 4} ${(legLeftX + legRightX) / 2 + 5} ${bottomY - 4}
                  L ${(legLeftX + legRightX) / 2 - 5} ${bottomY - 4}
                  Q ${legLeftX + innerLeftOffset} ${bottomY - 4} ${legLeftX + innerLeftOffset} ${curveTop}
                  L ${legLeftX + innerLeftOffset} ${leftHgTop}
                  Z`;

  return (
    <g>
      {/* Taps from Vac lines */}
      <path d={`M ${legLeftX} ${topY} L ${legLeftX} ${vacLineY} L ${srv1VacEndX} ${vacLineY}`}
            fill="none" stroke="rgba(192,212,219,0.4)" strokeWidth="1.2" strokeDasharray="2 3" />
      <path d={`M ${legRightX} ${topY} L ${legRightX} ${vacLineY} L ${srv2VacStartX} ${vacLineY}`}
            fill="none" stroke="rgba(192,212,219,0.4)" strokeWidth="1.2" strokeDasharray="2 3" />
      {/* Glass outline */}
      <path d={glassPath} fill="none" stroke="rgba(192,212,219,0.6)" strokeWidth="2" strokeLinejoin="round" />
      {/* Hg fill */}
      <path d={hgPath} fill="url(#mercCast)" stroke="none" />
      {/* Hg surface shimmer */}
      <ellipse cx={legLeftX + 2} cy={leftHgTop} rx="3.5" ry="1" fill="rgba(255,255,255,0.55)" />
      <ellipse cx={legRightX - 2} cy={rightHgTop} rx="3.5" ry="1" fill="rgba(255,255,255,0.55)" />
      {/* Tick marks between legs */}
      <g opacity="0.5">
        {[-15, 0, +15].map(dy => (
          <line key={dy} x1={legLeftX + 5} y1={midY + dy} x2={legRightX - 5} y2={midY + dy}
                stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" strokeDasharray="1 2" />
        ))}
      </g>
      {/* Labels */}
      <text x={cx} y={topY - 5} fontFamily="monospace" fontSize="6"
            fill="rgba(255,255,255,0.65)" textAnchor="middle" letterSpacing="0.15em">MANOMETER</text>
      <text x={cx} y={bottomY + 13} fontFamily="monospace" fontSize="7"
            fill="#FFDC50" textAnchor="middle">ΔP {deltaTorr >= 0 ? '+' : ''}{deltaTorr.toFixed(1)} torr</text>
    </g>
  );
}
