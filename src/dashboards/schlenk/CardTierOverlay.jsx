import React from 'react';

/**
 * Renders tier-specific SVG overlay content inside a card's viewBox.
 * Called by SchlenkCard as a child of GlasswareRender (inside the same SVG viewBox).
 *
 * Props:
 *   tier: 't1' | 't2' | 't3' | 't4' | 't5'
 *   shape: glassware registry entry (for liquidTop/Bottom/jointX positions)
 *   fillColor: compound color (used for tier-matched bubble/drop color)
 */
export default function CardTierOverlay({ tier, shape, fillColor = '#3B97D4' }) {
  if (!shape) return null;

  const cx = shape.jointX || 40;
  const lT = shape.liquidTop || 30;
  const lB = shape.liquidBottom || 110;
  const cyMid = (lT + lB) / 2;

  if (tier === 't2') {
    // Static bench — a single lazy bubble rises every 4s in the liquid
    return (
      <g style={{ pointerEvents: 'none' }} className="schlenk-t2-bubble-wrap">
        <circle cx={cx} cy={lB - 2} r="1.3" fill="rgba(212,160,79,0.7)" className="schlenk-t2-lazy-bubble" />
      </g>
    );
  }

  if (tier === 't1') {
    // Cold pump — small frost-crystal crosses inside the bulb area, slow breath
    return (
      <g className="schlenk-t1-breath" style={{ pointerEvents: 'none' }}>
        <g className="schlenk-t1-frost" stroke="#C0D4DB" strokeWidth="0.5">
          <line x1={cx - 6}  y1={cyMid - 8} x2={cx - 3}  y2={cyMid - 6} />
          <line x1={cx - 4}  y1={cyMid - 8} x2={cx - 6}  y2={cyMid - 6} />
          <line x1={cx + 5}  y1={cyMid + 2} x2={cx + 8}  y2={cyMid + 4} />
          <line x1={cx + 7}  y1={cyMid + 2} x2={cx + 5}  y2={cyMid + 4} />
          <line x1={cx - 2}  y1={cyMid + 10} x2={cx + 1} y2={cyMid + 12} />
          <line x1={cx + 0}  y1={cyMid + 10} x2={cx - 2} y2={cyMid + 12} />
        </g>
      </g>
    );
  }

  if (tier === 't3') {
    // Argon flow — 3 bubbles rising inside liquid + gas dash line above neck
    return (
      <g style={{ pointerEvents: 'none' }}>
        {/* Gas-line dash descending from above flask into the neck */}
        <line
          x1={cx} y1={Math.max(0, lT - 12)} x2={cx} y2={lT}
          stroke="#D4C070" strokeWidth="1.2" opacity="0.85"
          className="schlenk-t3-gas"
        />
        {/* 3 bubble train rising from near-bottom of liquid up */}
        <circle cx={cx - 3} cy={lB - 4} r="1.5" fill="#FFE880" className="schlenk-t3-bubble-a" />
        <circle cx={cx + 2} cy={lB - 4} r="1.8" fill="#FFE880" className="schlenk-t3-bubble-b" />
        <circle cx={cx + 5} cy={lB - 4} r="1.2" fill="#FFE880" className="schlenk-t3-bubble-c" />
      </g>
    );
  }

  if (tier === 't4') {
    // Reflux — heating mantle glow below, vapor rising above liquid surface, droplets falling
    return (
      <g style={{ pointerEvents: 'none' }}>
        {/* Heating mantle (amber ellipse below flask base) */}
        <ellipse
          cx={cx} cy={lB + 3} rx="18" ry="4"
          fill="#D48860" className="schlenk-t4-mantle"
        />
        {/* Vapor circles rising above liquid surface */}
        <circle cx={cx}     cy={lT + 4} r="2"   fill="#E8B890" opacity="0.7" className="schlenk-t4-vapor-a" />
        <circle cx={cx - 5} cy={lT + 4} r="1.5" fill="#E8B890" opacity="0.7" className="schlenk-t4-vapor-b" />
        <circle cx={cx + 5} cy={lT + 4} r="1.8" fill="#E8B890" opacity="0.7" className="schlenk-t4-vapor-c" />
        {/* Condensate droplets falling through the upper air space */}
        <circle cx={cx - 2} cy={lT - 8} r="1.2" fill="#C0D4DB" className="schlenk-t4-drop-a" />
        <circle cx={cx + 3} cy={lT - 8} r="1.5" fill="#C0D4DB" className="schlenk-t4-drop-b" />
      </g>
    );
  }

  if (tier === 't5') {
    // Exotherm — flask glow + crack path + eruptive spray + smoke
    return (
      <g className="schlenk-t5-body-glow" style={{ pointerEvents: 'none' }}>
        {/* Crack reveal over the flask bulb */}
        <g className="schlenk-t5-crack" stroke="#FFFFFF" strokeWidth="0.7" fill="none" opacity="0">
          <path d={`M ${cx} ${cyMid - 8} L ${cx - 4} ${cyMid + 2} L ${cx + 4} ${cyMid + 10} L ${cx - 2} ${cyMid + 18}`} />
          <path d={`M ${cx - 4} ${cyMid + 2} L ${cx - 12} ${cyMid + 6} L ${cx - 18} ${cyMid + 12}`} />
          <path d={`M ${cx + 4} ${cyMid + 10} L ${cx + 14} ${cyMid + 12} L ${cx + 22} ${cyMid + 8}`} />
        </g>
        {/* Spray particles ejecting upward */}
        <circle cx={cx}       cy={lT + 2} r="1.5" fill="#FFD080" className="schlenk-t5-spray-a" />
        <circle cx={cx - 6}   cy={lT + 2} r="1.2" fill="#FFD080" className="schlenk-t5-spray-b" />
        <circle cx={cx + 6}   cy={lT + 2} r="1.3" fill="#FFD080" className="schlenk-t5-spray-c" />
        <circle cx={cx - 10}  cy={lT + 2} r="1"   fill="#FFE8A0" className="schlenk-t5-spray-d" />
        <circle cx={cx + 10}  cy={lT + 2} r="1"   fill="#FFE8A0" className="schlenk-t5-spray-e" />
        {/* Smoke tendrils */}
        <path
          d={`M ${cx - 5} ${lT - 2} Q ${cx - 8} ${lT - 10} ${cx - 3} ${lT - 18}`}
          stroke="#886040" strokeWidth="1" fill="none" opacity="0.6"
          className="schlenk-t5-smoke"
        />
        <path
          d={`M ${cx + 5} ${lT - 2} Q ${cx + 8} ${lT - 10} ${cx + 3} ${lT - 18}`}
          stroke="#886040" strokeWidth="1" fill="none" opacity="0.6"
          className="schlenk-t5-smoke"
        />
      </g>
    );
  }

  return null;
}
