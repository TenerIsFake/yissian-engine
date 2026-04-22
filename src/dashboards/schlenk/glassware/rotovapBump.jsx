import React from 'react';

export const rotovapBumpShape = {
  viewBox: '0 0 90 120',
  jointX: 40, jointY: 6,
  liquidTop: 60, liquidBottom: 107,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (107 - 60);
    const fillY = 107 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 30 6 L 30 18 C 20 22 18 34 28 40 L 28 46 L 34 46 L 34 51 C 18 61 12 85 24 99 C 34 109 50 109 60 99 C 72 85 66 61 50 51 L 50 46 L 52 46 L 52 40 C 62 34 60 22 50 18 L 50 6 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.3" />
        {/* Liquid fill (gradient) */}
        <rect x="0" y={fillY} width="90" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="14" y1={fillY} x2="70" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Top joint at y=6 */}
        <rect x="30" y="6" width="20" height="8" fill="rgba(192,212,219,0.35)" stroke="#4FB8D4" strokeWidth="0.6" />
        <line x1="30" y1="9" x2="50" y2="9" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="30" y1="12" x2="50" y2="12" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Bump-trap joint */}
        <rect x="34" y="46" width="14" height="5" fill="rgba(192,212,219,0.35)" stroke="#4FB8D4" strokeWidth="0.6" />
        <line x1="34" y1="48" x2="48" y2="48" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Glass highlight glint */}
        <ellipse cx="22" cy="76" rx="3" ry="16" fill="rgba(255,255,255,0.15)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
