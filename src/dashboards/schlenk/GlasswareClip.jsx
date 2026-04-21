import React from 'react';
import { getShape } from './glasswareRegistry.js';

/**
 * Renders any glassware shape from the registry by ID.
 * Props:
 *   shape: string — shape ID (e.g. 'rbf-1neck', 'schlenk-sidearm')
 *   width, height: number — render size in px
 *   fillColor: string — hex color for the liquid fill
 *   fillPercent: 0-100 — how full the liquid is (0 = empty, 100 = full)
 *   outlineColor: string — border/outline color (default cyan borosilicate)
 *   className: string — optional CSS class (for tier animations)
 *   children: React nodes — optional overlay content (e.g. element symbol text)
 */
export default function GlasswareClip({
  shape,
  width = 80,
  height = 120,
  fillColor = '#3B97D4',
  fillPercent = 50,
  outlineColor = '#4FB8D4',
  className,
  children,
}) {
  const data = getShape(shape);
  if (!data) {
    // Missing shape — render a small placeholder square so the layout doesn't collapse
    return (
      <svg viewBox="0 0 80 120" width={width} height={height} className={className}>
        <rect x="10" y="10" width="60" height="100" fill="none" stroke="#7A9BAE" strokeWidth="1" strokeDasharray="2 2" />
        <text x="40" y="65" fill="#7A9BAE" fontSize="7" fontFamily="monospace" textAnchor="middle">
          {shape || 'no shape'}
        </text>
      </svg>
    );
  }

  const clampedPct = Math.max(0, Math.min(100, fillPercent));
  const fillHeight = (clampedPct / 100) * (data.liquidBottom - data.liquidTop);
  const fillY = data.liquidBottom - fillHeight;
  const clipId = `gw-${shape}-clip`;

  return (
    <svg viewBox={data.viewBox} width={width} height={height} className={className} style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id={clipId}>
          <path d={data.path} />
        </clipPath>
      </defs>
      {/* liquid fill clipped to shape outline */}
      <rect
        x="0"
        y={fillY}
        width="1000"
        height={fillHeight}
        fill={fillColor}
        opacity="0.65"
        clipPath={`url(#${clipId})`}
      />
      {/* glass outline */}
      <path d={data.path} fill="none" stroke={outlineColor} strokeWidth="1.3" />
      {children}
    </svg>
  );
}
