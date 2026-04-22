import React from 'react';
import SchlenkManifold from './SchlenkManifold.jsx';
import SchlenkCard from './SchlenkCard.jsx';
import SchlenkBotRack from './SchlenkBotRack.jsx';
import { SCENE_W, SCENE_H, ZONES, PORT_X, listZones } from './zoneLayout.js';
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
  // ServicesWidget passes elementRegistry (47 service objects). Fall back to
  // allElements (118 periodic-table tuples) only if elementRegistry absent.
  const elementRegistry = props.elementRegistry || [];
  const allElements = props.allElements || [];
  const elements = elementRegistry.length ? elementRegistry : allElements;
  const statsMap = props.statsMap || {};
  const handleClick = props.onElementClick || (() => {});

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

        {/* Central spine per zone + horizontal branches to each flask.
            Spine runs vertically at a column-BOUNDARY x (never through a flask).
            An inverted-L connector bridges the manifold port down to spine top.
            Each flask has a short horizontal branch from its joint out to the spine. */}
        {(() => {
          // Group positioned cards by zone so we know how many per zone → cols
          const byZone = {};
          for (const card of positionedCards) {
            (byZone[card.zoneKey] ||= []).push(card);
          }
          const nodes = [];
          for (const [zoneKey, cards] of Object.entries(byZone)) {
            const zone = ZONES[zoneKey];
            if (!zone) continue;
            const total = cards.length;
            const cols = Math.ceil(Math.sqrt(total)) || 1;
            // Spine at a column-boundary to avoid crossing any card column
            const spineX = zone.x + (zone.w / cols) * Math.floor(cols / 2);
            const portX = PORT_X[zone.portId];
            // Collect per-card joint points so we can scope the spine's vertical extent
            const jointPoints = cards.map(c => {
              const pt = getConnectorPoint(c.el, c.x, c.y, c.size);
              return { ...c, jointX: pt.connectX, jointY: pt.connectY };
            });
            const topJointY = Math.min(...jointPoints.map(p => p.jointY));
            const bottomJointY = Math.max(...jointPoints.map(p => p.jointY));
            const spineTop = zone.y + 4;
            const spineBottom = bottomJointY;

            // 1) Manifold → spine-top inverted-L (port drop → horizontal jog → spine top)
            if (portX !== undefined) {
              const kinkY = zone.y - 12; // just above zone top
              nodes.push(
                <g key={`manifold-spine-${zoneKey}`} opacity="0.8">
                  {/* Double-stroke drop from manifold port to kink */}
                  <line x1={portX} y1="72" x2={portX} y2={kinkY} stroke="#4FB8D4" strokeWidth="2.4" />
                  <line x1={portX} y1="72" x2={portX} y2={kinkY} stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
                  {/* Horizontal jog to align with zone spine */}
                  <line x1={portX} y1={kinkY} x2={spineX} y2={kinkY} stroke="#4FB8D4" strokeWidth="2.4" />
                  <line x1={portX} y1={kinkY} x2={spineX} y2={kinkY} stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
                  {/* Drop from kink into spine top */}
                  <line x1={spineX} y1={kinkY} x2={spineX} y2={spineTop} stroke="#4FB8D4" strokeWidth="2.4" />
                  <line x1={spineX} y1={kinkY} x2={spineX} y2={spineTop} stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
                  {/* Ground-glass joint where manifold tubing enters the zone spine */}
                  <rect x={spineX - 4} y={spineTop - 2} width="8" height="5"
                        fill="rgba(192,212,219,0.5)" stroke="#4FB8D4" strokeWidth="0.6" />
                  <line x1={spineX - 4} y1={spineTop + 0.5} x2={spineX + 4} y2={spineTop + 0.5}
                        stroke="rgba(192,212,219,0.8)" strokeWidth="0.3" />
                </g>
              );
            }

            // 2) Vertical spine spanning the zone's joint rows
            nodes.push(
              <g key={`spine-${zoneKey}`} opacity="0.8">
                <line x1={spineX} y1={spineTop + 5} x2={spineX} y2={spineBottom}
                      stroke="#4FB8D4" strokeWidth="2.4" />
                <line x1={spineX} y1={spineTop + 5} x2={spineX} y2={spineBottom}
                      stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
              </g>
            );

            // 3) Per-card horizontal branches from joint to spine at joint's y
            for (const p of jointPoints) {
              const [bx1, bx2] = p.jointX < spineX ? [p.jointX, spineX] : [spineX, p.jointX];
              nodes.push(
                <g key={`branch-${p.svcId}`} opacity="0.8">
                  {/* Horizontal branch */}
                  <line x1={bx1} y1={p.jointY} x2={bx2} y2={p.jointY}
                        stroke="#4FB8D4" strokeWidth="2.2" />
                  <line x1={bx1} y1={p.jointY} x2={bx2} y2={p.jointY}
                        stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
                  {/* T-joint nub where branch meets spine */}
                  <circle cx={spineX} cy={p.jointY} r="2" fill="#4FB8D4" stroke="rgba(8,16,26,0.8)" strokeWidth="0.4" />
                  {/* Ground-glass joint at the flask end */}
                  <rect x={p.jointX - 4} y={p.jointY - 2} width="8" height="5"
                        fill="rgba(192,212,219,0.5)" stroke="#4FB8D4" strokeWidth="0.6" />
                  <line x1={p.jointX - 4} y1={p.jointY + 0.5} x2={p.jointX + 4} y2={p.jointY + 0.5}
                        stroke="rgba(192,212,219,0.8)" strokeWidth="0.3" />
                </g>
              );
            }
          }
          return nodes;
        })()}

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
    </div>
  );
}
