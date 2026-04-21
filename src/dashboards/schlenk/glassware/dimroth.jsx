import React from 'react';

export const dimrothShape = {
  viewBox: '0 0 70 140',
  jointX: 35, jointY: 4,
  liquidTop: 14, liquidBottom: 118,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (118 - 14);
    const fillY = 118 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 20 10 L 50 10 L 50 120 L 20 120 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Outer jacket outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="70" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus highlight */}
        {clampedPct > 0 && (
          <line x1="20" y1={fillY} x2="50" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Inner coil — rendered ON TOP of liquid */}
        <path
          d="M 26 22 Q 44 28 26 36 Q 44 44 26 52 Q 44 60 26 68 Q 44 76 26 84 Q 44 92 26 100 Q 44 108 26 116"
          fill="none"
          stroke="#C0D4DB"
          strokeWidth="1.3"
        />
        {/* Water in tab (left) */}
        <rect x="6" y="20" width="14" height="5" fill="#5FD4A8" />
        {/* Water out tab (right) */}
        <rect x="50" y="108" width="14" height="5" fill="#5FD4A8" />
        {/* Top ground-glass joint */}
        <rect x="28" y="4" width="14" height="8" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="28" y1="6" x2="42" y2="6" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="28" y1="8" x2="42" y2="8" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Glass highlight glint */}
        <ellipse cx="23" cy="65" rx="2" ry="20" fill="rgba(255,255,255,0.15)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
