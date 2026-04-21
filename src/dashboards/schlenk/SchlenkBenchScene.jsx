import React, { useState } from 'react';
import SchlenkManifold from './SchlenkManifold.jsx';
import SchlenkCard from './SchlenkCard.jsx';
import SchlenkBotRack from './SchlenkBotRack.jsx';
import SchlenkTubing from './SchlenkTubing.jsx';
import SchlenkDetailPanel from './SchlenkDetailPanel.jsx';
import { SCENE_W, SCENE_H, ZONES, listZones } from './zoneLayout.js';
import { SERVICE_TO_ZONE, groupServicesByZone, positionForService } from './serviceLayout.js';

const ZONE_CARD_SIZE = {
  MEDIA: 'xs',
  LIBRARY: 'md',
  PIPELINE: 'sm',
  INFRA: 'xs',
  TOOLS: 'xs',
};

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

export default function SchlenkBenchScene(props) {
  const elements = props.elements || props.services || props.allElements || [];
  const statsMap = props.statsMap || {};
  const externalOnClick = props.onElementClick || (() => {});

  // Local selection for the inline detail panel overlay
  const [selected, setSelected] = useState(null);

  const handleClick = (element) => {
    setSelected(element);
    externalOnClick(element); // preserve any app-level handler
  };

  const main = elements.filter(el => el.id && SERVICE_TO_ZONE[el.id]);
  const bots = elements.filter(el => !el.id || !SERVICE_TO_ZONE[el.id]);

  const grouped = groupServicesByZone(main.map(el => el.id));

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
    <div style={{ width: '100%', position: 'relative' }}>
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
        <SchlenkManifold statsMap={statsMap} />

        {listZones().map(([zoneKey, zone]) => {
          const tint = ZONE_TINTS[zoneKey];
          return (
            <g key={zoneKey}>
              <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="4"
                    fill={tint.fill} stroke={tint.stroke} strokeWidth="1" strokeDasharray="3 3" />
              <text x={zone.x + 8} y={zone.y + zone.h - 6}
                    fontFamily="monospace" fontSize="9" fill={tint.stroke}
                    letterSpacing="0.15em" opacity="0.7" pointerEvents="none">
                {zone.label}
              </text>
            </g>
          );
        })}

        <SchlenkTubing zoneCards={zoneTubingInput} />

        {positionedCards.map(({ svcId, el, x, y, size }) => (
          <SchlenkCard
            key={svcId}
            element={el}
            x={x}
            y={y}
            size={size}
            loadPercent={statsMap[svcId]?.level ?? 50}
            onClick={() => handleClick(el)}
          />
        ))}

        <SchlenkBotRack bots={bots} onBotClick={handleClick} />
      </svg>

      {/* Detail panel overlay — opens on card/bot click */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 40,
          right: 24,
          zIndex: 20,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}>
          <SchlenkDetailPanel
            element={selected}
            stats={statsMap[selected.id] || {}}
            allElements={elements}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
