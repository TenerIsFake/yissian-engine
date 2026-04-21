import React from 'react';

export const schlenkSidearmShape = {
  viewBox: '0 0 100 120',
  jointX: 43, jointY: 8,
  liquidTop: 50, liquidBottom: 114,
  sidearm: true,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (114 - 50);
    const fillY = 114 - fillHeight;
    const clipId = `cl-${gradId}`;
    // Main body + sidearm projecting right (from brainstorm clip-shapes.html Option B)
    const bodyPath = 'M 30 8 L 30 40 C 10 46 2 78 18 100 C 28 116 54 116 64 100 C 78 82 76 52 56 44 L 56 34 L 96 34 L 96 24 L 56 24 L 56 8 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.3" />
        <rect x="0" y={fillY} width="100" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {clampedPct > 0 && (
          <line x1="10" y1={fillY} x2="76" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Top neck ground-glass joint */}
        <rect x="30" y="8" width="18" height="12" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="30" y1="11" x2="48" y2="11" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="30" y1="14" x2="48" y2="14" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="30" y1="17" x2="48" y2="17" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Sidearm T-handle stopcock (amber) — Schlenk signature */}
        <rect x="84" y="16" width="3" height="12" fill="#D4A04F" />
        <rect x="78" y="14" width="15" height="3" fill="#D4A04F" />
        <circle cx="85" cy="17" r="1.2" fill="#E8B870" />
        {/* Glass highlight glint */}
        <ellipse cx="20" cy="72" rx="3" ry="18" fill="rgba(255,255,255,0.18)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
