import React from 'react';

/**
 * SCHLENK — ReagentBottle
 * Stoppered round-shouldered bottle. Liquid level = `percent` (0-100 = used %).
 * Used in SystemMetricsPanel for server drive fill (C:, J:, Q:, T: etc.).
 * Prop surface matches OrbitalDiagram (percent, label, subLabel, color).
 */
export default function ReagentBottle({ percent = 0, label = '', subLabel = '', color = '#D4A04F' }) {
  const clampedPct = Math.max(0, Math.min(100, percent));
  const liquidY = 70 - (clampedPct / 100) * 50; // fill from bottom up
  const liquidHeight = (clampedPct / 100) * 50;

  return (
    <svg viewBox="0 0 60 90" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Stopper (A borosilicate frame) */}
      <rect x="22" y="3" width="16" height="8" rx="1" fill="#7A9BAE" stroke="#C0D4DB" strokeWidth="0.5" />
      <rect x="24" y="0" width="12" height="4" rx="1" fill="#94B8C4" />
      {/* Neck */}
      <rect x="25" y="11" width="10" height="6" fill="rgba(192,212,219,0.15)" stroke="#4FB8D4" strokeWidth="0.5" />
      {/* Bottle body — rounded shoulders */}
      <path
        d="M 18 17 Q 14 22 14 28 L 14 78 Q 14 85 21 85 L 39 85 Q 46 85 46 78 L 46 28 Q 46 22 42 17 Z"
        fill="rgba(192,212,219,0.08)"
        stroke="#4FB8D4"
        strokeWidth="1"
      />
      {/* Liquid (B warm oil color by default, or tier-accent) */}
      <rect
        x="15"
        y={liquidY + 17}
        width="30"
        height={liquidHeight}
        fill={color}
        opacity="0.55"
      />
      {/* Meniscus highlight */}
      <line
        x1="15"
        y1={liquidY + 17}
        x2="45"
        y2={liquidY + 17}
        stroke={color}
        strokeWidth="0.8"
        opacity="0.9"
      />
      {/* Label band (B warm accent) */}
      <rect x="18" y="50" width="24" height="10" fill="rgba(8,16,26,0.6)" stroke="rgba(212,160,79,0.4)" strokeWidth="0.3" />
      <text x="30" y="57" textAnchor="middle" fontSize="5" fontFamily="monospace" fill="#E8B870" letterSpacing="0.2">
        {label}
      </text>
      {/* Percent */}
      <text x="30" y="75" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#4FB8D4" fontWeight="bold">
        {Math.round(clampedPct)}%
      </text>
      {subLabel && (
        <text x="30" y="92" textAnchor="middle" fontSize="4" fontFamily="monospace" fill="rgba(192,212,219,0.6)">
          {subLabel}
        </text>
      )}
    </svg>
  );
}
