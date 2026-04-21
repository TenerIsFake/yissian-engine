import React from 'react';

export const kugelrohrShape = {
  viewBox: '0 0 130 80',
  jointX: 20, jointY: 22,
  liquidTop: 26, liquidBottom: 54,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (54 - 26);
    const fillY = 54 - fillHeight;
    const clipId = `cl-${gradId}`;
    // Outer chain path encompassing all 4 bulbs
    const bodyPath = 'M 6 40 A 14 14 0 1 1 34 40 A 14 14 0 1 1 62 40 A 14 14 0 1 1 90 40 A 14 14 0 1 1 118 40 A 14 14 0 1 1 126 40 L 126 42 A 14 14 0 1 1 90 42 A 14 14 0 1 1 62 42 A 14 14 0 1 1 34 42 A 14 14 0 1 1 6 40 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Liquid fill across all bulbs */}
        <rect x="0" y={fillY} width="130" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus highlight */}
        {clampedPct > 0 && (
          <line x1="6" y1={fillY} x2="124" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Individual bulb circles rendered on top */}
        <circle cx="20" cy="40" r="14" fill="none" stroke={outlineColor} strokeWidth="1.2" />
        <circle cx="50" cy="40" r="14" fill="none" stroke={outlineColor} strokeWidth="1.2" />
        <circle cx="80" cy="40" r="14" fill="none" stroke={outlineColor} strokeWidth="1.2" />
        <circle cx="110" cy="40" r="14" fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Small connecting lines between bulbs */}
        <line x1="34" y1="40" x2="36" y2="40" stroke={outlineColor} strokeWidth="1.5" />
        <line x1="64" y1="40" x2="66" y2="40" stroke={outlineColor} strokeWidth="1.5" />
        <line x1="94" y1="40" x2="96" y2="40" stroke={outlineColor} strokeWidth="1.5" />
        {/* Left inlet stub */}
        <line x1="2" y1="38" x2="6" y2="38" stroke={outlineColor} strokeWidth="1.5" />
        {/* Right outlet stub */}
        <line x1="124" y1="38" x2="128" y2="38" stroke={outlineColor} strokeWidth="1.5" />
        {/* Top joint above first bulb */}
        <rect x="14" y="22" width="12" height="6" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="14" y1="25" x2="26" y2="25" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
      </g>
    );
  },
};
