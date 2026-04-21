import React from 'react';

export const pearFlaskShape = {
  viewBox: '0 0 80 120',
  jointX: 41, jointY: 8,
  liquidTop: 36, liquidBottom: 112,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (112 - 36);
    const fillY = 112 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 34 8 L 34 28 C 20 36 10 66 22 96 C 30 114 52 114 60 96 C 72 66 62 36 48 28 L 48 8 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.3" />
        {/* Liquid fill (gradient) */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="12" y1={fillY} x2="68" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Ground-glass joint at top */}
        <rect x="34" y="8" width="14" height="10" fill="rgba(192,212,219,0.35)" stroke="#4FB8D4" strokeWidth="0.6" />
        <line x1="34" y1="11" x2="48" y2="11" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="34" y1="14" x2="48" y2="14" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Glass highlight glint */}
        <ellipse cx="20" cy="72" rx="3" ry="20" fill="rgba(255,255,255,0.18)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
