import React from 'react';

export const rbf2NeckShape = {
  viewBox: '0 0 90 120',
  jointX: 46, jointY: 14,
  liquidTop: 50, liquidBottom: 113,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (113 - 50);
    const fillY = 113 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 20 14 L 20 30 L 32 40 L 32 44 C 12 50 6 80 22 100 C 32 114 60 114 70 100 C 86 80 80 50 60 44 L 60 40 L 72 30 L 72 14 L 60 14 L 60 24 L 52 32 L 40 32 L 32 24 L 32 14 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.3" />
        <rect x="0" y={fillY} width="90" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {clampedPct > 0 && (
          <line x1="14" y1={fillY} x2="76" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Left neck joint */}
        <rect x="20" y="14" width="12" height="10" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="20" y1="17" x2="32" y2="17" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="20" y1="20" x2="32" y2="20" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Right neck joint */}
        <rect x="60" y="14" width="12" height="10" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="60" y1="17" x2="72" y2="17" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="60" y1="20" x2="72" y2="20" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <ellipse cx="24" cy="72" rx="3" ry="18" fill="rgba(255,255,255,0.18)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
