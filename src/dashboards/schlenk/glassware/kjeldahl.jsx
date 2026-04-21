import React from 'react';

export const kjeldahlShape = {
  viewBox: '0 0 80 120',
  jointX: 41, jointY: 6,
  liquidTop: 58, liquidBottom: 116,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (116 - 58);
    const fillY = 116 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 36 6 L 36 50 C 20 60 14 90 24 108 C 32 118 52 118 58 108 C 68 90 62 60 46 50 L 46 6 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.3" />
        {/* Liquid fill (gradient) */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="16" y1={fillY} x2="66" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Ground-glass joint at top */}
        <rect x="36" y="6" width="10" height="10" fill="rgba(192,212,219,0.35)" stroke="#4FB8D4" strokeWidth="0.6" />
        <line x1="36" y1="9" x2="46" y2="9" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="36" y1="13" x2="46" y2="13" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Long-neck glass-thickness indicator lines */}
        <line x1="37" y1="18" x2="37" y2="50" stroke="rgba(192,212,219,0.4)" strokeWidth="0.4" />
        <line x1="45" y1="18" x2="45" y2="50" stroke="rgba(192,212,219,0.4)" strokeWidth="0.4" />
        {/* Glass highlight glint */}
        <ellipse cx="22" cy="80" rx="3" ry="20" fill="rgba(255,255,255,0.18)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
