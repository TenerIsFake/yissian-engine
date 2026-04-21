import React from 'react';

export const jYoungShape = {
  viewBox: '0 0 70 120',
  jointX: 35, jointY: 4,
  liquidTop: 28, liquidBottom: 112,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (112 - 28);
    const fillY = 112 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 22 4 L 48 4 L 48 14 L 46 14 L 46 22 L 44 22 L 44 104 C 44 114 26 114 26 104 L 26 22 L 24 22 L 24 14 L 22 14 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.3" />
        {/* Liquid fill (gradient) */}
        <rect x="0" y={fillY} width="70" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="26" y1={fillY} x2="44" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Brown threaded cap */}
        <rect x="22" y="4" width="26" height="8" fill="#6B4A20" stroke="#D4A04F" strokeWidth="0.5" />
        <line x1="22" y1="6" x2="48" y2="6" stroke="#D4A04F" strokeWidth="0.4" opacity="0.8" />
        <line x1="22" y1="8" x2="48" y2="8" stroke="#D4A04F" strokeWidth="0.4" opacity="0.8" />
        <line x1="22" y1="10" x2="48" y2="10" stroke="#D4A04F" strokeWidth="0.4" opacity="0.8" />
        {/* PTFE valve housing (dark blue-grey) */}
        <rect x="22" y="14" width="26" height="8" fill="#1C2838" stroke="#4FB8D4" strokeWidth="0.6" />
        {/* Glass highlight glint */}
        <ellipse cx="32" cy="64" rx="2" ry="28" fill="rgba(255,255,255,0.15)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
