import React from 'react';
import GlasswareClip from './GlasswareClip.jsx';
import { getServiceGlassware } from './serviceGlassware.js';
import { getElementColor } from './elementColors.js';
import { getShape } from './glasswareRegistry.js';

/**
 * A single SCHLENK service card — rendered as a glassware silhouette with
 * the element symbol + service name text overlaid inside the bulb.
 * Position is set by parent (passes x, y in scene coords).
 *
 * Props:
 *   element: { id, symbol, service, name, z, cat } — service registry entry
 *   x, y: scene coords — position of the card center
 *   size: 'lg' | 'md' | 'sm' | 'xs' | 'xxs' — render size
 *   loadPercent: 0-100 — liquid fill level (drives animation later)
 *   onClick: click handler
 */
const SIZE_MAP = {
  lg:  { w: 64, h: 96 },
  md:  { w: 52, h: 78 },
  sm:  { w: 44, h: 66 },
  xs:  { w: 36, h: 54 },
  xxs: { w: 24, h: 36 },
};

export default function SchlenkCard({ element, x = 0, y = 0, size = 'sm', loadPercent = 50, onClick }) {
  if (!element) return null;
  const shapeId = getServiceGlassware(element.id || element.symbol);
  const colorEntry = getElementColor(element.symbol || '');
  const shape = getShape(shapeId);
  const { w, h } = SIZE_MAP[size] || SIZE_MAP.sm;

  // Fallback label position (center) if shape is missing joint hints
  const textY = shape ? (shape.liquidTop + shape.liquidBottom) / 2 : 60;

  return (
    <g transform={`translate(${x - w / 2}, ${y - h / 2})`} onClick={onClick} style={{ cursor: 'pointer' }}>
      <GlasswareClip
        shape={shapeId}
        width={w}
        height={h}
        fillColor={colorEntry.color}
        fillPercent={loadPercent}
        outlineColor="#4FB8D4"
      >
        {/* Element symbol (large, centered in bulb) */}
        <text
          x={shape ? (shape.viewBox.split(' ')[2] / 2) : 40}
          y={textY}
          textAnchor="middle"
          fontFamily="monospace"
          fontSize={size === 'lg' ? 14 : size === 'md' ? 12 : size === 'xxs' ? 7 : 10}
          fontWeight="bold"
          fill="#fff"
          pointerEvents="none"
        >
          {element.symbol || '?'}
        </text>
        {/* Service label (smaller, below symbol) */}
        {size !== 'xxs' && (
          <text
            x={shape ? (shape.viewBox.split(' ')[2] / 2) : 40}
            y={textY + 12}
            textAnchor="middle"
            fontFamily="monospace"
            fontSize={size === 'lg' ? 7 : 6}
            fill="#C0D4DB"
            letterSpacing="0.15em"
            pointerEvents="none"
          >
            {(element.service || element.name || '').toUpperCase().slice(0, 10)}
          </text>
        )}
      </GlasswareClip>
    </g>
  );
}
