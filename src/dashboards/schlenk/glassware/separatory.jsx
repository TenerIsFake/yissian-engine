import React from 'react';

export const separatoryShape = {
  viewBox: '0 0 80 140',
  jointX: 40, jointY: 10,
  liquidTop: 26, liquidBottom: 108,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (108 - 26);
    const fillY = 108 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 20 20 L 20 40 C 12 50 14 80 30 96 L 36 112 L 44 112 L 50 96 C 66 80 68 50 60 40 L 60 20 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="12" y1={fillY} x2="68" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Top joint */}
        <rect x="26" y="10" width="28" height="12" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="26" y1="14" x2="54" y2="14" stroke="rgba(192,212,219,0.7)" strokeWidth="0.3" />
        <line x1="26" y1="18" x2="54" y2="18" stroke="rgba(192,212,219,0.7)" strokeWidth="0.3" />
        {/* Bottom stopcock */}
        <rect x="38" y="112" width="4" height="10" fill="#D4A04F" />
        <rect x="32" y="110" width="16" height="4" fill="#D4A04F" />
        {/* Glass highlight */}
        <ellipse cx="22" cy="64" rx="2" ry="18" fill="rgba(255,255,255,0.15)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
