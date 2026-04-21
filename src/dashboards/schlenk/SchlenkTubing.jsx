import React from 'react';
import { computeZoneTubing } from './tubingEngine.js';

/**
 * Render all glass-tubing paths from manifold ports to service cards.
 *
 * Props:
 *   zoneCards: { [zoneKey]: [{ id, x, y, cardH }] }
 *   color: stroke color (default cyan borosilicate)
 */
export default function SchlenkTubing({ zoneCards = {}, color = '#4FB8D4' }) {
  const paths = Object.entries(zoneCards).flatMap(([zoneKey, cards]) =>
    computeZoneTubing(zoneKey, cards)
  );
  return (
    <g>
      {paths.map(({ id, d }) =>
        d ? (
          <path
            key={id}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.5"
            strokeLinejoin="round"
          />
        ) : null
      )}
    </g>
  );
}
