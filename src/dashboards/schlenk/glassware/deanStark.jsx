import React from 'react';

export const deanStarkShape = {
  viewBox: '0 0 90 120',
  jointX: 51, jointY: 6,
  liquidTop: 45, liquidBottom: 112,
  sidearm: true,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (112 - 45);
    const fillY = 112 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 40 6 L 40 30 L 22 40 L 22 82 L 40 90 L 40 100 C 40 114 62 114 62 100 L 62 90 L 80 82 L 80 40 L 62 30 L 62 6 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="90" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus highlight */}
        {clampedPct > 0 && (
          <line x1="22" y1={fillY} x2="80" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Top joint hashed rect */}
        <rect x="40" y="6" width="22" height="10" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="40" y1="9" x2="62" y2="9" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="40" y1="12" x2="62" y2="12" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Graduation marks on collection sidearm (left side) */}
        <line x1="22" y1="48" x2="28" y2="48" stroke="#C0D4DB" strokeWidth="0.5" />
        <line x1="22" y1="56" x2="28" y2="56" stroke="#C0D4DB" strokeWidth="0.5" />
        <line x1="22" y1="64" x2="28" y2="64" stroke="#C0D4DB" strokeWidth="0.5" />
        <line x1="22" y1="72" x2="28" y2="72" stroke="#C0D4DB" strokeWidth="0.5" />
        {/* Bottom stopcock handle (vertical) */}
        <rect x="36" y="102" width="3" height="8" fill="#D4A04F" />
        {/* Bottom stopcock body (horizontal) */}
        <rect x="30" y="100" width="15" height="3" fill="#D4A04F" />
        {/* Glass highlight glint */}
        <ellipse cx="26" cy="62" rx="1.5" ry="16" fill="rgba(255,255,255,0.13)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
