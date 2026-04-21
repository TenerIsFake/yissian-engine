import React from 'react';

/**
 * Flask-outline liquid-level gauge — shows load% as liquid fill.
 * Props: percent (0-100), color (fill), subtitle (label under)
 */
export default function LiquidLevelGauge({ percent = 0, color = '#3B97D4', subtitle = 'load' }) {
  const p = Math.max(0, Math.min(100, percent));
  const fillHeight = (p / 100) * 84;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg viewBox="0 0 80 140" width="60" height="105">
        <defs>
          <clipPath id="llg-clip">
            <path d="M 37 5 L 37 21 L 22 21 L 22 105 C 22 120 58 120 58 105 L 58 21 L 43 21 L 43 5 Z" />
          </clipPath>
        </defs>
        <path d="M 37 5 L 37 21 L 22 21 L 22 105 C 22 120 58 120 58 105 L 58 21 L 43 21 L 43 5 Z"
              fill="none" stroke="#4FB8D4" strokeWidth="1.3" />
        <rect x="22" y={120 - fillHeight} width="36" height={fillHeight}
              fill={color} opacity="0.65" clipPath="url(#llg-clip)" />
        {/* ticks */}
        <g stroke="#7A9BAE" strokeWidth="0.5" fontFamily="monospace" fontSize="5" fill="#7A9BAE">
          <line x1="58" y1="48" x2="63" y2="48" /><text x="65" y="50">75</text>
          <line x1="58" y1="70" x2="63" y2="70" /><text x="65" y="72">50</text>
          <line x1="58" y1="92" x2="63" y2="92" /><text x="65" y="94">25</text>
        </g>
      </svg>
      <div>
        <div style={{ fontFamily: 'monospace', fontSize: 22, color: '#fff', fontWeight: 700 }}>
          {Math.round(p)}<span style={{ fontSize: 11, color: '#7A9BAE' }}>%</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#7A9BAE', marginTop: 4, letterSpacing: '0.1em' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
