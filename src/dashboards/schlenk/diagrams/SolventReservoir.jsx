import React from 'react';

/**
 * SCHLENK — SolventReservoir (inverted)
 * Upside-down Erlenmeyer with stopcock at narrow end (visually inverted).
 * Liquid represents FREE drive space — shows how much headroom is left.
 * Accepts `percent` as the USED value (for consistency with OrbitalDiagram);
 * internal render uses (100 - percent) as liquid fill.
 */
export default function SolventReservoir({ percent = 0, label = '', subLabel = '', color = '#4FB8D4' }) {
  const usedPct = Math.max(0, Math.min(100, percent));
  const freePct = 100 - usedPct;
  // Liquid fills from TOP of the inverted flask downward as headroom shrinks? No —
  // inverted = narrow end at bottom; liquid fills the wide part (top) proportional to FREE.
  const liquidHeight = (freePct / 100) * 45;

  return (
    <svg viewBox="0 0 60 90" style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Stopcock at bottom (narrow end of inverted flask) */}
      <rect x="27" y="82" width="6" height="6" rx="1" fill="#7A9BAE" stroke="#C0D4DB" strokeWidth="0.4" />
      <circle cx="30" cy="78" r="3" fill="rgba(79,184,212,0.3)" stroke="#4FB8D4" strokeWidth="0.5" />
      {/* Neck (narrow, going up) */}
      <rect x="27" y="62" width="6" height="16" fill="rgba(192,212,219,0.1)" stroke="#4FB8D4" strokeWidth="0.5" />
      {/* Inverted Erlenmeyer body — wide top, narrow bottom */}
      <path
        d="M 10 10 L 50 10 L 50 18 L 35 62 L 25 62 L 10 18 Z"
        fill="rgba(192,212,219,0.08)"
        stroke="#4FB8D4"
        strokeWidth="1"
      />
      {/* Liquid fills from top of inverted flask */}
      <rect
        x="11"
        y={10 + (45 - liquidHeight)}
        width="38"
        height={liquidHeight}
        fill={color}
        opacity="0.5"
      />
      {/* FREE label band */}
      <rect x="20" y="28" width="20" height="8" fill="rgba(8,16,26,0.6)" stroke="rgba(79,184,212,0.4)" strokeWidth="0.3" />
      <text x="30" y="33.5" textAnchor="middle" fontSize="4" fontFamily="monospace" fill="#4FB8D4" letterSpacing="0.3">
        {label} · FREE
      </text>
      <text x="30" y="48" textAnchor="middle" fontSize="7" fontFamily="monospace" fill="#7BE0B8" fontWeight="bold">
        {Math.round(freePct)}%
      </text>
      {subLabel && (
        <text x="30" y="92" textAnchor="middle" fontSize="4" fontFamily="monospace" fill="rgba(192,212,219,0.6)">
          {subLabel}
        </text>
      )}
    </svg>
  );
}
