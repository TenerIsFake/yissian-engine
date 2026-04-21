import React from 'react';

export const hgBubblerShape = {
  viewBox: '0 0 80 140',
  jointX: 21, jointY: 4,
  liquidTop: 78, liquidBottom: 110,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 16 14 L 16 100 C 16 118 46 118 46 100 L 46 44 L 64 44 L 64 14 L 60 14 L 60 40 L 42 40 L 42 100 C 42 112 20 112 20 100 L 20 14 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Hg pool (replaces standard liquid-fill gradient) */}
        <path d="M 20 82 L 20 100 C 20 112 42 112 42 100 L 42 82 Z" fill="#8090A0" stroke="#4A5868" strokeWidth="0.5" />
        {/* Hg meniscus reflection ellipse */}
        <ellipse cx="31" cy="82" rx="11" ry="2" fill="#B8BEC8" />
        {/* Slight activity indicator on top of Hg when active */}
        {clampedPct > 0 && (
          <ellipse cx="31" cy="82" rx="11" ry="2" fill={fillColor} opacity="0.12" />
        )}
        {/* Rising gas bubbles in left channel */}
        <circle cx="28" cy="70" r="2.5" fill={fillColor} opacity="0.6" />
        <circle cx="32" cy="56" r="2" fill={fillColor} opacity="0.5" />
        {/* Top joint — left body */}
        <rect x="16" y="4" width="10" height="10" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="16" y1="7" x2="26" y2="7" stroke="rgba(192,212,219,0.7)" strokeWidth="0.3" />
        {/* Top joint — right vent */}
        <rect x="54" y="4" width="10" height="10" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="54" y1="7" x2="64" y2="7" stroke="rgba(192,212,219,0.7)" strokeWidth="0.3" />
      </g>
    );
  },
};
