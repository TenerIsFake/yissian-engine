import React, { useState } from 'react';
import SchlenkManifold from './SchlenkManifold.jsx';
import SchlenkCard from './SchlenkCard.jsx';
import SchlenkBotRack from './SchlenkBotRack.jsx';
import SchlenkDetailPanel from './SchlenkDetailPanel.jsx';
import { SCENE_W, SCENE_H, ZONES, listZones } from './zoneLayout.js';
import { SERVICE_TO_ZONE, groupServicesByZone, positionForService } from './serviceLayout.js';
import { getServiceGlassware } from './serviceGlassware.js';
import { getShape } from './glasswareRegistry.js';
import { getTierFromStatus } from './tierFromStatus.js';

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

// Compute where a card's joint (or sidearm) is in scene coords, given the card center + size.
function getConnectorPoint(el, x, y, size) {
  const shapeId = getServiceGlassware(el.id || el.symbol);
  const shape = getShape(shapeId);
  const widthMap = { lg: 64, md: 52, sm: 44, xs: 36, xxs: 24 };
  const w = widthMap[size] || 44;
  const h = SIZE_MAP_H[size] || 66;

  if (!shape) {
    // No shape found; connector at card top-center
    return { connectX: x, connectY: y - h / 2, sidearm: false };
  }

  // Parse shape viewBox and compute scaling
  const [vbX, vbY, vbW, vbH] = shape.viewBox.split(' ').map(Number);
  const scaleX = w / vbW;
  const scaleY = h / vbH;

  // Transform joint from shape coords to scene coords
  // Card's top-left in scene coords = (x - w/2, y - h/2)
  const jointSceneX = (x - w / 2) + (shape.jointX - vbX) * scaleX;
  const jointSceneY = (y - h / 2) + (shape.jointY - vbY) * scaleY;

  return { connectX: jointSceneX, connectY: jointSceneY, sidearm: shape.sidearm };
}

const ZONE_TINTS = {
  MEDIA:    { fill: 'rgba(79,184,212,0.05)',  stroke: '#4FB8D4' },
  LIBRARY:  { fill: 'rgba(79,184,212,0.04)',  stroke: '#4FB8D4' },
  PIPELINE: { fill: 'rgba(212,160,79,0.05)',  stroke: '#D4A04F' },
  INFRA:    { fill: 'rgba(95,212,168,0.05)',  stroke: '#5FD4A8' },
  TOOLS:    { fill: 'rgba(180,127,232,0.05)', stroke: '#B47FE8' },
  BOTS:     { fill: 'rgba(192,115,168,0.06)', stroke: '#C073A8' },
};

export default function SchlenkBenchScene(props) {
  // Local selection for the inline detail panel overlay
  const [selected, setSelected] = useState(null);

  // ServicesWidget passes elementRegistry (47 service objects). Fall back to
  // allElements (118 periodic-table tuples) only if elementRegistry absent.
  const elementRegistry = props.elementRegistry || [];
  const allElements = props.allElements || [];
  const elements = elementRegistry.length ? elementRegistry : allElements;
  const statsMap = props.statsMap || {};
  const externalOnClick = props.onElementClick || (() => {});

  const handleClick = (element) => {
    setSelected(element);
    externalOnClick(element); // preserve any app-level handler
  };

  // Partition: services with an assigned zone vs bots (BOTS zone or unassigned)
  const zoneOf = (el) => el.zone || SERVICE_TO_ZONE[el.id] || null;
  const main = elements.filter(el => {
    const z = zoneOf(el);
    return z && z !== 'BOTS';
  });
  const bots = elements.filter(el => zoneOf(el) === 'BOTS');

  // Group main services by their zone field (direct from elementRegistry)
  const grouped = {};
  for (const el of main) {
    const z = zoneOf(el);
    if (!grouped[z]) grouped[z] = [];
    grouped[z].push(el.id);
  }

  // Inline position helper — uses zoneLayout ZONES directly for any zone
  function posInZone(zoneKey, i, total) {
    const zone = ZONES[zoneKey];
    if (!zone) return null;
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellW = zone.w / cols;
    const cellH = zone.h / rows;
    return {
      x: zone.x + col * cellW + cellW / 2,
      y: zone.y + row * cellH + cellH / 2,
    };
  }

  const positionedCards = [];
  for (const [zoneKey, svcs] of Object.entries(grouped)) {
    svcs.forEach((svcId, i) => {
      const pos = posInZone(zoneKey, i, svcs.length);
      if (!pos) return;
      const el = main.find(e => e.id === svcId);
      const size = SERVICE_SIZE_OVERRIDE[svcId] || ZONE_CARD_SIZE[zoneKey] || 'sm';
      const cardH = SIZE_MAP_H[size] || 66;
      positionedCards.push({ svcId, el, x: pos.x, y: pos.y, size, cardH, zoneKey });
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

        {/* Per-card glass connectors: a short ground-glass-joint stub at each card's
            top joint (or sidearm for flasks with one). Implies connection to the
            manifold above without drawing long tubing that would cross other flasks. */}
        {positionedCards.map(({ svcId, el, x, y, size, zoneKey }) => {
          const pt = getConnectorPoint(el, x, y, size);
          const zone = ZONES[zoneKey];
          // Extend stub up to zone top (within card's column, no horizontal crossing)
          const stubTop = zone ? zone.y : pt.connectY - 10;
          return (
            <g key={`connector-${svcId}`} opacity="0.75">
              {/* Glass tubing segment (double-stroke: outer borosilicate + inner sheen) */}
              <line x1={pt.connectX} y1={stubTop} x2={pt.connectX} y2={pt.connectY}
                    stroke="#4FB8D4" strokeWidth="2.4" />
              <line x1={pt.connectX} y1={stubTop} x2={pt.connectX} y2={pt.connectY}
                    stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
              {/* Ground-glass joint at the connection point (hashed rect) */}
              <rect x={pt.connectX - 4} y={pt.connectY - 2} width="8" height="5"
                    fill="rgba(192,212,219,0.5)" stroke="#4FB8D4" strokeWidth="0.6" />
              <line x1={pt.connectX - 4} y1={pt.connectY + 0.5} x2={pt.connectX + 4} y2={pt.connectY + 0.5}
                    stroke="rgba(192,212,219,0.8)" strokeWidth="0.3" />
              {/* Ground-glass joint at the zone-top end (manifold-side connector) */}
              <rect x={pt.connectX - 4} y={stubTop - 3} width="8" height="5"
                    fill="rgba(192,212,219,0.5)" stroke="#4FB8D4" strokeWidth="0.6" />
              <line x1={pt.connectX - 4} y1={stubTop - 0.5} x2={pt.connectX + 4} y2={stubTop - 0.5}
                    stroke="rgba(192,212,219,0.8)" strokeWidth="0.3" />
            </g>
          );
        })}

        {positionedCards.map(({ svcId, el, x, y, size, zoneKey }) => (
          <SchlenkCard
            key={svcId}
            element={el}
            x={x}
            y={y}
            size={size}
            loadPercent={statsMap[svcId]?.level ?? 50}
            tier={getTierFromStatus({ stats: statsMap[svcId], zone: zoneKey, seedId: svcId })}
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
