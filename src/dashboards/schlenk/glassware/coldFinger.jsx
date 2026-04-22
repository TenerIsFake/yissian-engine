import React from 'react';

export const coldFingerShape = {
  viewBox: '0 0 70 140',
  jointX: 35, jointY: 8,
  liquidTop: 20, liquidBottom: 115,
  sidearm: false,
  render({ gradId, fillColor, outlineColor, clampedPct }) {
    const fillHeight = (clampedPct / 100) * (115 - 20);
    const fillY = 115 - fillHeight;
    const clipId = `cl-${gradId}`;
    const bodyPath = 'M 18 14 L 52 14 L 52 104 C 52 120 18 120 18 104 Z';

    return (
      <g>
        <clipPath id={clipId}><path d={bodyPath} /></clipPath>
        {/* Outer body outline */}
        <path d={bodyPath} fill="none" stroke={outlineColor} strokeWidth="1.2" />
        {/* Liquid fill */}
        <rect x="0" y={fillY} width="70" height={fillHeight} fill={`url(#${gradId})`} clipPath={`url(#${clipId})`} />
        {/* Meniscus highlight */}
        {clampedPct > 0 && (
          <line x1="18" y1={fillY} x2="52" y2={fillY} stroke={fillColor} strokeWidth="0.8" opacity="0.95" clipPath={`url(#${clipId})`} />
        )}
        {/* Inner finger — rendered ON TOP of liquid */}
        <path
          d="M 30 20 L 30 90 C 30 100 40 100 40 90 L 40 20 Z"
          fill="rgba(255,255,255,0.15)"
          stroke="#C0D4DB"
          strokeWidth="1"
        />
        {/* Top ground-glass joint */}
        <rect x="28" y="8" width="14" height="8" fill="rgba(192,212,219,0.35)" stroke={outlineColor} strokeWidth="0.6" />
        <line x1="28" y1="10" x2="42" y2="10" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        <line x1="28" y1="12" x2="42" y2="12" stroke="rgba(192,212,219,0.7)" strokeWidth="0.4" />
        {/* Ice drips (decorative) */}
        <circle cx="35" cy="108" r="1.5" fill="#B8D8E8" />
        <circle cx="32" cy="112" r="1" fill="#B8D8E8" />
        {/* Glass highlight */}
        <ellipse cx="22" cy="66" rx="2" ry="24" fill="rgba(255,255,255,0.15)" clipPath={`url(#${clipId})`} />
      </g>
    );
  },
};
