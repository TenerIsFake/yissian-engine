import React from 'react';

export const nmrTubeShape = {
  viewBox: '0 0 60 140',
  jointX: 30, jointY: 4,
  liquidTop: 30, liquidBottom: 130,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (130 - 30);
    const fillY = 130 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 22 10 L 38 10 L 38 14 L 36 14 L 36 124 C 36 132 24 132 24 124 L 24 14 L 22 14 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="60" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="24" y1={fillY} x2="36" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Threaded cap at top */}
        <rect x="22" y="4" width="16" height="6" fill="#6B4A20" stroke="#D4A04F" strokeWidth="0.5" />
        <line x1="22" y1="6" x2="38" y2="6" stroke="#D4A04F" strokeWidth="0.4" />
        <line x1="22" y1="8" x2="38" y2="8" stroke="#D4A04F" strokeWidth="0.4" />
        {/* Glass highlight */}
        <line x1="26" y1="20" x2="26" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      </g>
    );
  },
};
