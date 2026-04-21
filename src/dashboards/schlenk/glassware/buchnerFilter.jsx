import React from 'react';

export const buchnerFilterShape = {
  viewBox: '0 0 80 140',
  jointX: 40, jointY: 12,
  liquidTop: 70, liquidBottom: 118,
  sidearm: true,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (118 - 70);
    const fillY = 118 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 16 12 L 16 34 L 32 34 L 32 48 L 34 60 L 18 120 L 62 120 L 46 60 L 48 48 L 48 34 L 64 34 L 64 12 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="18" y1={fillY} x2="62" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Dashed perforated plate (filter) */}
        <line x1="20" y1="24" x2="60" y2="24" stroke="#C0D4DB" strokeWidth="0.4" strokeDasharray="2 2" />
        {/* Sidearm vacuum nozzle (left) */}
        <rect x="4" y="64" width="14" height="6" fill="#D4A04F" />
        {/* Top rim (funnel lip) */}
        <rect x="14" y="10" width="52" height="4" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.5" />
      </g>
    );
  },
};
