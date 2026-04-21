import React from 'react';

export const coldTrapShape = {
  viewBox: '0 0 90 140',
  jointX: 32, jointY: 4,
  liquidTop: 38, liquidBottom: 124,
  sidearm: true,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (124 - 38);
    const fillY = 124 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 10 30 L 10 118 C 10 130 80 130 80 118 L 80 30 L 72 30 L 72 110 C 72 116 18 116 18 110 L 18 30 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Outer dewar body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="90" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus highlight */}
        {clampedPct > 0 && (
          <line x1="10" y1={fillY} x2="80" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Inner U-tube — rendered ON TOP, not clipped */}
        <path d="M 32 14 L 32 100 C 32 108 58 108 58 100 L 58 14" fill="rgba(184,216,232,0.2)" stroke="#4FB8D4" strokeWidth="1.2" />
        {/* Inlet joint (left) */}
        <rect x="26" y="4" width="12" height="10" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="26" y1="7" x2="38" y2="7" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Outlet joint (right) */}
        <rect x="52" y="4" width="12" height="10" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="52" y1="7" x2="64" y2="7" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Frost marks outside */}
        <circle cx="20" cy="70" r="1" fill="#B8D8E8" opacity="0.6" />
        <circle cx="70" cy="80" r="1" fill="#B8D8E8" opacity="0.6" />
        <circle cx="25" cy="95" r="1" fill="#B8D8E8" opacity="0.6" />
        <circle cx="65" cy="60" r="0.8" fill="#B8D8E8" opacity="0.5" />
      </g>
    );
  },
};
