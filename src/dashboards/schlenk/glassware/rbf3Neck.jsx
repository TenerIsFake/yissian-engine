import React from 'react';

export const rbf3NeckShape = {
  viewBox: '0 0 100 120',
  jointX: 50, jointY: 14,
  liquidTop: 52, liquidBottom: 115,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (115 - 52);
    const fillY = 115 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 16 14 L 16 28 L 28 38 L 28 44 C 10 52 4 82 22 102 C 34 116 66 116 78 102 C 96 82 90 52 72 44 L 72 38 L 84 28 L 84 14 L 72 14 L 72 22 L 60 30 L 54 30 L 54 14 L 46 14 L 46 30 L 40 30 L 28 22 L 28 14 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.3" />
        <rect x="0" y={fillY} width="100" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {clampedPct > 0 && (
          <line x1="12" y1={fillY} x2="88" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* 3 necks with joints */}
        {[[16, 28], [46, 54], [72, 84]].map(([lx, rx], i) => (
          <g key={i}>
            <rect x={lx} y="14" width={rx - lx} height="8" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
            <line x1={lx} y1="17" x2={rx} y2="17" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
            <line x1={lx} y1="20" x2={rx} y2="20" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
          </g>
        ))}
        <ellipse cx="20" cy="76" rx="3" ry="20" fill="rgba(255,255,255,0.18)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
