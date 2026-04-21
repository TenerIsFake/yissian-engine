import React from 'react';
import SchlenkManifold from './SchlenkManifold.jsx';
import SchlenkCard from './SchlenkCard.jsx';
import SchlenkBotRack from './SchlenkBotRack.jsx';
import SchlenkTubing from './SchlenkTubing.jsx';
import { SCENE_W, SCENE_H, ZONES, listZones } from './zoneLayout.js';
import { SERVICE_TO_ZONE, groupServicesByZone, positionForService } from './serviceLayout.js';

// Card size per zone (tuned for 1000x660 viewBox)
const ZONE_CARD_SIZE = {
  MEDIA: 'xs',
  LIBRARY: 'md',
  PIPELINE: 'sm',
  INFRA: 'xs',
  TOOLS: 'xs',
};

// Override for specific service heroes
const SERVICE_SIZE_OVERRIDE = {
  plex: 'md',
  overseerr: 'sm',
  radarr: 'sm',
};

const SIZE_MAP_H = { lg: 96, md: 78, sm: 66, xs: 54, xxs: 36 };

const ZONE_TINTS = {
  MEDIA:    { fill: 'rgba(79,184,212,0.05)',  stroke: '#4FB8D4' },
  LIBRARY:  { fill: 'rgba(79,184,212,0.04)',  stroke: '#4FB8D4' },
  PIPELINE: { fill: 'rgba(212,160,79,0.05)',  stroke: '#D4A04F' },
  INFRA:    { fill: 'rgba(95,212,168,0.05)',  stroke: '#5FD4A8' },
  TOOLS:    { fill: 'rgba(180,127,232,0.05)', stroke: '#B47FE8' },
  BOTS:     { fill: 'rgba(192,115,168,0.06)', stroke: '#C073A8' },
};

/**
 * SCHLENK top-level bench scene (Sprint 4).
 * Renders manifold + 6 zone rects + tubing + glassware cards + NMR bot rack.
 */
export default function SchlenkBenchScene(props) {
  const elements = props.elements || props.services || props.allElements || [];
  const statsMap = props.statsMap || {};
  const onClick = props.onElementClick || (() => {});

  // Partition elements: main services vs bots (anything not in SERVICE_TO_ZONE is a bot)
  const main = elements.filter(el => el.id && SERVICE_TO_ZONE[el.id]);
  const bots = elements.filter(el => !el.id || !SERVICE_TO_ZONE[el.id]);

  // Group main services by zone + compute each service's position
  const grouped = groupServicesByZone(main.map(el => el.id));

  // Build positioned cards and tubing inputs
  const positionedCards = [];
  const zoneTubingInput = {};
  for (const [zoneKey, svcs] of Object.entries(grouped)) {
    zoneTubingInput[zoneKey] = [];
    svcs.forEach((svcId, i) => {
      const pos = positionForService(svcId, i, svcs.length);
      if (!pos) return;
      const el = main.find(e => e.id === svcId);
      const size = SERVICE_SIZE_OVERRIDE[svcId] || ZONE_CARD_SIZE[zoneKey] || 'sm';
      const cardH = SIZE_MAP_H[size] || 66;
      positionedCards.push({ svcId, el, x: pos.x, y: pos.y, size, cardH, zoneKey });
      zoneTubingInput[zoneKey].push({ id: svcId, x: pos.x, y: pos.y, cardH });
    });
  }

  return (
    <div style={{ width: '100%', overflow: 'auto' }}>
      <svg
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMin meet"
        style={{
          width: '100%',
          height: 'auto',
          background: 'radial-gradient(rgba(79,184,212,0.08) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          backgroundColor: '#08101A',
          border: '1px solid rgba(79,184,212,0.3)',
          borderRadius: 6,
        }}
      >
        {/* Manifold at top */}
        <SchlenkManifold statsMap={statsMap} />

        {/* Zone rectangles */}
        {listZones().map(([zoneKey, zone]) => {
          const tint = ZONE_TINTS[zoneKey];
          return (
            <g key={zoneKey}>
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.w}
                height={zone.h}
                rx="4"
                fill={tint.fill}
                stroke={tint.stroke}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={zone.x + 8}
                y={zone.y + zone.h - 6}
                fontFamily="monospace"
                fontSize="9"
                fill={tint.stroke}
                letterSpacing="0.15em"
                opacity="0.7"
                pointerEvents="none"
              >
                {zone.label}
              </text>
            </g>
          );
        })}

        {/* Tubing — rendered BELOW cards so cards sit on top */}
        <SchlenkTubing zoneCards={zoneTubingInput} />

        {/* Service cards */}
        {positionedCards.map(({ svcId, el, x, y, size }) => (
          <SchlenkCard
            key={svcId}
            element={el}
            x={x}
            y={y}
            size={size}
            loadPercent={statsMap[svcId]?.level ?? 50}
            onClick={() => onClick(el)}
          />
        ))}

        {/* BOTS rack — rendered inside the BOTS zone */}
        <SchlenkBotRack bots={bots} onBotClick={onClick} />
      </svg>
    </div>
  );
}
