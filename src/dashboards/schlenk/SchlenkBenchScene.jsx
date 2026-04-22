import React from 'react';
import SchlenkManifold from './SchlenkManifold.jsx';
import SchlenkCard from './SchlenkCard.jsx';
import SchlenkBotRack from './SchlenkBotRack.jsx';
import { SCENE_W, SCENE_H, ZONES, PORT_X, listZones } from './zoneLayout.js';
import { SERVICE_TO_ZONE, groupServicesByZone, positionForService } from './serviceLayout.js';
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

  // Inline position helper — uses zoneLayout ZONES directly for any zone.
  // Per-row X offset spreads every row across a DISTINCT lane within the cell,
  // so each flask's vertical cyan drop never shares an X with another row's
  // flask. Lanes are evenly distributed across ±cellW/3 from cell center.
  function posInZone(zoneKey, i, total) {
    const zone = ZONES[zoneKey];
    if (!zone) return null;
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellW = zone.w / cols;
    const cellH = zone.h / rows;
    // Row r in [0..rows-1] gets a unique lane offset in [-cellW/3, +cellW/3].
    // Lane spacing = (2·cellW/3) / (rows-1). For rows=4 this is ~22% of cellW —
    // still larger than a flask body, so drops pass between upper-row flasks.
    const laneOffset = rows > 1 ? (row / (rows - 1) - 0.5) * (cellW * 2 / 3) : 0;
    return {
      x: zone.x + col * cellW + cellW / 2 + laneOffset,
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

        {/* Per-zone header rail + per-flask vertical drops.
            Header: horizontal rail at the top of the zone, fed by an inverted-L
            from the manifold port. Each flask has its OWN vertical cyan drop
            from the header down to its flask-top joint. Brick-layout positioning
            (see posInZone) guarantees lower-row drops pass BETWEEN upper-row
            flasks — no cyan line ever crosses glassware. */}
        {(() => {
          const byZone = {};
          for (const card of positionedCards) {
            (byZone[card.zoneKey] ||= []).push(card);
          }
          const nodes = [];
          for (const [zoneKey, cards] of Object.entries(byZone)) {
            const zone = ZONES[zoneKey];
            if (!zone) continue;
            const portX = PORT_X[zone.portId];
            const headerY = zone.y - 10;  // just above zone top, inside manifold strip
            const dropXs = cards.map(c => c.x);
            const railLeft = Math.min(...dropXs, portX ?? dropXs[0]);
            const railRight = Math.max(...dropXs, portX ?? dropXs[0]);

            // Manifold-port drop into header rail
            if (portX !== undefined) {
              nodes.push(
                <g key={`feed-${zoneKey}`} opacity="0.85">
                  <line x1={portX} y1="72" x2={portX} y2={headerY} stroke="#4FB8D4" strokeWidth="2.4" />
                  <line x1={portX} y1="72" x2={portX} y2={headerY} stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
                </g>
              );
            }

            // Horizontal header rail across all drop columns
            nodes.push(
              <g key={`rail-${zoneKey}`} opacity="0.85">
                <line x1={railLeft} y1={headerY} x2={railRight} y2={headerY}
                      stroke="#4FB8D4" strokeWidth="2.4" />
                <line x1={railLeft} y1={headerY} x2={railRight} y2={headerY}
                      stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" />
              </g>
            );

            // Per-flask vertical drop from rail to flask-top joint
            for (const c of cards) {
              const flaskTopY = c.y - c.cardH / 2 - 2;
              nodes.push(
                <g key={`drop-${c.svcId}`} opacity="0.85">
                  {/* Vertical cyan drop */}
                  <line x1={c.x} y1={headerY} x2={c.x} y2={flaskTopY}
                        stroke="#4FB8D4" strokeWidth="2.2" />
                  <line x1={c.x} y1={headerY} x2={c.x} y2={flaskTopY}
                        stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
                  {/* T-joint where drop meets header */}
                  <circle cx={c.x} cy={headerY} r="2" fill="#4FB8D4" stroke="rgba(8,16,26,0.8)" strokeWidth="0.4" />
                  {/* Ground-glass joint stub at flask top */}
                  <rect x={c.x - 4} y={flaskTopY - 1} width="8" height="5"
                        fill="rgba(192,212,219,0.5)" stroke="#4FB8D4" strokeWidth="0.6" />
                  <line x1={c.x - 4} y1={flaskTopY + 1.5} x2={c.x + 4} y2={flaskTopY + 1.5}
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
