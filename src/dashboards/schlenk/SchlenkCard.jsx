import React from 'react';
import GlasswareRender from './GlasswareRender.jsx';
import { getServiceGlassware } from './serviceGlassware.js';
import { getElementColor } from './elementColors.js';
import { getShape } from './glasswareRegistry.js';
import './tierAnimations.css';

const SIZE_MAP = {
  lg:  { w: 64, h: 96 },
  md:  { w: 52, h: 78 },
  sm:  { w: 44, h: 66 },
  xs:  { w: 36, h: 54 },
  xxs: { w: 24, h: 36 },
};

function getTierClass(loadPercent) {
  const p = Math.max(0, Math.min(100, Number(loadPercent) || 0));
  if (p <= 20) return 'schlenk-card-t1';
  if (p <= 45) return 'schlenk-card-t2';
  if (p <= 70) return 'schlenk-card-t3';
  if (p <= 90) return 'schlenk-card-t4';
  return 'schlenk-card-t5';
}

export default function SchlenkCard({ element, x = 0, y = 0, size = 'sm', loadPercent = 50, onClick }) {
  if (!element) return null;
  const shapeId = getServiceGlassware(element.id || element.symbol);
  const colorEntry = getElementColor(element.symbol || '');
  const shape = getShape(shapeId);
  const { w, h } = SIZE_MAP[size] || SIZE_MAP.sm;
  const textY = shape ? (shape.liquidTop + shape.liquidBottom) / 2 : 60;
  const tierClass = getTierClass(loadPercent);

  return (
    <g transform={`translate(${x - w / 2}, ${y - h / 2})`} onClick={onClick} style={{ cursor: 'pointer' }} className={tierClass}>
      <GlasswareRender
        shape={shapeId}
        width={w}
        height={h}
        fillColor={colorEntry.color}
        fillPercent={loadPercent}
        outlineColor="#4FB8D4"
      >
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
      </GlasswareRender>
    </g>
  );
}
