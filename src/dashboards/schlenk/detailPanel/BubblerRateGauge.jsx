import React from 'react';

/**
 * Oil-bubbler visualization. Shows request rate (Hz) as bubble count.
 * Props: hz (request rate), peak, avg
 */
export default function BubblerRateGauge({ hz = 0, peak = 0, avg = 0 }) {
  // 0-5Hz maps to 0-5 visible bubbles
  const bubbleCount = Math.max(0, Math.min(5, Math.round(hz)));
  const bubbles = Array.from({ length: bubbleCount }, (_, i) => ({
    cx: 25 + (i % 3) * 5 + (Math.random() - 0.5) * 6,
    cy: 60 + Math.floor(i / 3) * 14 + (Math.random() - 0.5) * 4,
    r: 1.2 + (i % 2) * 0.5,
  }));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg viewBox="0 0 60 140" width="40" height="90">
        {/* bubbler tube */}
        <rect x="15" y="10" width="30" height="115" rx="3" fill="none" stroke="#D4C070" strokeWidth="1" />
        {/* oil */}
        <rect x="16" y="55" width="28" height="69" fill="rgba(212,160,79,0.5)" />
        {/* bubbles */}
        {bubbles.map((b, i) => (
          <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill="#FFE880" opacity="0.85" />
        ))}
      </svg>
      <div>
        <div style={{ fontFamily: 'monospace', fontSize: 20, color: '#D4C070', fontWeight: 700 }}>
          {hz.toFixed(1)}<span style={{ fontSize: 10, color: '#7A9BAE' }}> Hz</span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#7A9BAE', marginTop: 6 }}>
          peak {peak.toFixed(1)} Hz<br />avg {avg.toFixed(1)} Hz<br />line <span style={{ color: '#D4C070' }}>LIVE</span>
        </div>
      </div>
    </div>
  );
}
