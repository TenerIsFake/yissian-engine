import React from 'react';

export const soxhletShape = {
  viewBox: '0 0 80 140',
  jointX: 40, jointY: 6,
  liquidTop: 40, liquidBottom: 102,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (102 - 40);
    const fillY = 102 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 30 6 L 30 30 L 18 36 L 18 88 L 30 94 L 30 104 L 50 104 L 50 94 L 62 88 L 62 36 L 50 30 L 50 6 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus highlight */}
        {clampedPct > 0 && (
          <line x1="18" y1={fillY} x2="62" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Top joint hashed rect */}
        <rect x="32" y="6" width="16" height="8" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="32" y1="9" x2="48" y2="9" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Thimble inside (dashed rect) */}
        <rect x="28" y="40" width="24" height="44" fill="rgba(192,212,219,0.15)" stroke="#C0D4DB" strokeWidth="0.6" strokeDasharray="2 2" />
        {/* Siphon arm on right (U-shape) */}
        <path d="M 62 60 L 70 60 L 70 88 L 66 88" fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Glass highlight glint */}
        <ellipse cx="22" cy="62" rx="1.5" ry="18" fill="rgba(255,255,255,0.13)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
