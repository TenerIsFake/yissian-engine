import React from 'react';

export const sublimationShape = {
  viewBox: '0 0 80 130',
  jointX: 40, jointY: 4,
  liquidTop: 28, liquidBottom: 114,
  sidearm: true,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (114 - 28);
    const fillY = 114 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 14 20 L 14 108 C 14 120 66 120 66 108 L 66 20 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Outer chamber outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus highlight */}
        {clampedPct > 0 && (
          <line x1="14" y1={fillY} x2="66" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Cold finger descending from top — NOT clipped, rendered on top */}
        <path d="M 32 8 L 32 78 C 32 86 48 86 48 78 L 48 8 Z" fill="rgba(184,216,232,0.3)" stroke="#C0D4DB" strokeWidth="1" />
        {/* Vacuum nozzle / stopcock on left side */}
        <rect x="2" y="26" width="14" height="5" fill="#D4A04F" />
        {/* Crystal ring on cold finger — decorative ellipses */}
        <ellipse cx="40" cy="64" rx="8" ry="3" fill="#E4D074" opacity="0.7" />
        <ellipse cx="40" cy="70" rx="9" ry="3" fill="#E4D074" opacity="0.5" />
        {/* Top joint */}
        <rect x="32" y="4" width="16" height="6" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="32" y1="6" x2="48" y2="6" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Glass highlight glint */}
        <ellipse cx="18" cy="70" rx="1.5" ry="22" fill="rgba(255,255,255,0.13)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
