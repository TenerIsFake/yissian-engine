import React from 'react';

export const rbf1NeckShape = {
  viewBox: '0 0 80 120',
  jointX: 40, jointY: 8,
  liquidTop: 50, liquidBottom: 114,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    // Liquid level: fills from liquidBottom up
    const fillHeight = (clampedPct / 100) * (114 - 50);
    const fillY = 114 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 34 8 L 34 42 C 14 48 6 78 22 100 C 30 116 56 116 64 100 C 80 78 72 48 52 42 L 52 8 Z';

    return (
      <g>
        <clipPath id={clipId}>
          <path d={bodyPath} />
        </clipPath>
        {/* Body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.3" />
        {/* Liquid fill (gradient) */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus highlight */}
        {clampedPct > 0 && (
          <line x1="14" y1={fillY} x2="66" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Ground-glass joint at neck — hashed rect */}
        <rect x="34" y="8" width="18" height="12" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="34" y1="11" x2="52" y2="11" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="34" y1="14" x2="52" y2="14" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="34" y1="17" x2="52" y2="17" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Glass highlight glint (top-left of bulb) */}
        <ellipse cx="22" cy="68" rx="3" ry="16" fill="rgba(255,255,255,0.18)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
