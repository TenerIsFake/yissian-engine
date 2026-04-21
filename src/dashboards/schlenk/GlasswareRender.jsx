import React from 'react';

/**
 * Renders a chemistry-accurate glassware shape with composed SVG details:
 *   - outline path (cyan borosilicate stroke)
 *   - hashed ground-glass joint at the neck
 *   - linear-gradient liquid fill (lighter top -> darker bottom)
 *   - glass highlight ellipse (top-left glint)
 *   - sidearm stopcock T-handle (where applicable)
 *
 * Props:
 *   shape: string shape ID
 *   width, height: render px dimensions
 *   fillColor: hex -- liquid gradient base (compound color)
 *   fillPercent: 0-100 -- liquid level
 *   outlineColor: hex -- borosilicate outline (default cyan)
 *   className: CSS class (for tier animations)
 *   children: overlaid React nodes (text, etc.)
 *
 * Unknown shape -> renders a cyan-bordered placeholder with shape-id label.
 */

import { rbf1NeckShape } from './glassware/rbf1Neck.jsx';
import { rbf2NeckShape } from './glassware/rbf2Neck.jsx';
import { rbf3NeckShape } from './glassware/rbf3Neck.jsx';
import { schlenkSidearmShape } from './glassware/schlenkSidearm.jsx';

const RENDERERS = {
  'rbf-1neck': rbf1NeckShape,
  'rbf-2neck': rbf2NeckShape,
  'rbf-3neck': rbf3NeckShape,
  'schlenk-sidearm': schlenkSidearmShape,
};

function hexToRgba(hex, a) {
  const m = /^#?([a-fA-F0-9]{6})$/.exec(hex || '');
  if (!m) return 'rgba(59,151,212,' + a + ')';
  const n = parseInt(m[1], 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
}

export default function GlasswareRender({
  shape,
  width = 80,
  height = 120,
  fillColor = '#3B97D4',
  fillPercent = 50,
  outlineColor = '#4FB8D4',
  className,
  children,
}) {
  const render = RENDERERS[shape];
  const clampedPct = Math.max(0, Math.min(100, fillPercent));
  const gradId = 'gw-grad-' + shape + '-' + Math.floor(Math.random() * 1e9);

  if (!render) {
    return (
      <svg viewBox="0 0 80 120" width={width} height={height} className={className} style={{ overflow: 'visible' }}>
        <rect x="10" y="10" width="60" height="100" fill="none" stroke="#7A9BAE" strokeWidth="1" strokeDasharray="2 2" />
        <text x="40" y="65" fill="#7A9BAE" fontSize="7" fontFamily="monospace" textAnchor="middle">
          {shape || 'no shape'}
        </text>
        {children}
      </svg>
    );
  }

  const ctx = {
    gradId,
    fillColor,
    fillColorTop: hexToRgba(fillColor, 0.35),
    fillColorBot: hexToRgba(fillColor, 0.75),
    outlineColor,
    clampedPct,
  };

  return (
    <svg viewBox={render.viewBox} width={width} height={height} className={className} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ctx.fillColorTop} />
          <stop offset="100%" stopColor={ctx.fillColorBot} />
        </linearGradient>
      </defs>
      {render.render(ctx)}
      {children}
    </svg>
  );
}
