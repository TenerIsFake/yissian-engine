import React from 'react';

export const additionFunnelShape = {
  viewBox: '0 0 80 140',
  jointX: 40, jointY: 10,
  liquidTop: 20, liquidBottom: 88,
  sidearm: true,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (88 - 20);
    const fillY = 88 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 24 16 L 24 70 L 36 90 L 36 112 L 44 112 L 44 90 L 56 70 L 56 16 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="24" y1={fillY} x2="56" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Equalizing arm (curved U loop on right) */}
        <path d="M 56 30 C 70 30 70 80 56 80" fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Top joint */}
        <rect x="26" y="10" width="28" height="8" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="26" y1="14" x2="54" y2="14" stroke="rgba(192,212,219,0.7)" strokeWidth="0.3" />
        {/* Bottom stopcock */}
        <rect x="38" y="112" width="4" height="10" fill="#D4A04F" />
        <rect x="32" y="110" width="16" height="4" fill="#D4A04F" />
      </g>
    );
  },
};
