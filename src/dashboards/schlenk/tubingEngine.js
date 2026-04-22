// Tubing engine — computes SVG path strings for glass-tubing connections
// between the manifold ports and service cards.
// Style: L-shape drops from port → horizontal branch → short vertical stub into card.

import { PORT_X, ZONES } from './zoneLayout.js';

const MANIFOLD_BOTTOM_Y = 72;  // y where manifold ports end

/**
 * Compute an SVG path from a manifold port down to a card's top joint.
 * @param {{ portId: string, cardX: number, cardY: number, cardH: number }} params
 * @returns {string} SVG path "d" attribute value
 */
export function computeTubing({ portId, cardX, cardY, cardH = 60 }) {
  const portX = PORT_X[portId];
  if (portX === undefined) return '';
  const cardTopY = cardY - cardH / 2;
  // Elbow point — one card-height above the card's top, at the port's x
  const elbowY = Math.max(MANIFOLD_BOTTOM_Y + 10, cardTopY - 12);
  // Three segments: port-down, horizontal, short-vertical-stub
  return `M ${portX} ${MANIFOLD_BOTTOM_Y} L ${portX} ${elbowY} L ${cardX} ${elbowY} L ${cardX} ${cardTopY}`;
}

/**
 * Compute tubing for all services in a zone — each gets its own branch
 * from the port's vertical spine.
 * @param {string} zoneKey — e.g. 'MEDIA'
 * @param {Array<{id: string, x: number, y: number, cardH: number}>} cardsInZone
 * @returns {Array<{ id: string, d: string }>}
 */
export function computeZoneTubing(zoneKey, cardsInZone) {
  const zone = ZONES[zoneKey];
  if (!zone) return [];
  return cardsInZone.map(card => ({
    id: card.id,
    d: computeTubing({ portId: zone.portId, cardX: card.x, cardY: card.y, cardH: card.cardH || 60 }),
  }));
}
