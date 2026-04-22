import React from 'react';

export const fischerPorterShape = {
  viewBox: '0 0 80 120',
  jointX: 40, jointY: 6,
  liquidTop: 36, liquidBottom: 108,
  sidearm: true,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (108 - 36);
    const fillY = 108 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 26 8 L 26 20 L 14 24 L 14 32 L 26 32 L 26 96 C 26 110 54 110 54 96 L 54 32 L 66 32 L 66 24 L 54 20 L 54 8 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Body outline — heavy wall, stroke 1.5 */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.5" />
        {/* Liquid fill (gradient) */}
        <rect x="0" y={fillY} width="80" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus */}
        {clampedPct > 0 && (
          <line x1="26" y1={fillY} x2="54" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Threaded cap */}
        <rect x="28" y="6" width="24" height="6" fill="#6B4A20" stroke="#D4A04F" strokeWidth="0.5" />
        <line x1="28" y1="8" x2="52" y2="8" stroke="#D4A04F" strokeWidth="0.4" opacity="0.8" />
        <line x1="28" y1="10" x2="52" y2="10" stroke="#D4A04F" strokeWidth="0.4" opacity="0.8" />
        {/* Stopcock sidearm on left */}
        <rect x="8" y="26" width="6" height="5" fill="#D4A04F" />
        <rect x="6" y="24" width="10" height="3" fill="#D4A04F" />
        {/* Glass highlight glint */}
        <ellipse cx="30" cy="68" rx="3" ry="20" fill="rgba(255,255,255,0.15)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
