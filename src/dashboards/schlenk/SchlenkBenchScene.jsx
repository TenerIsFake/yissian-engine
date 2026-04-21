import React from 'react';
import SchlenkManifold from './SchlenkManifold.jsx';
import { SCENE_W, SCENE_H, ZONES, PORT_X, listZones } from './zoneLayout.js';
import { SERVICE_TO_ZONE, groupServicesByZone, positionForService } from './serviceLayout.js';
import { getElementColor } from './elementColors.js';

// Zone background colors (subtle tints per zone role)
const ZONE_TINTS = {
  MEDIA:    { fill: 'rgba(79,184,212,0.05)',  stroke: '#4FB8D4' },
  LIBRARY:  { fill: 'rgba(79,184,212,0.04)',  stroke: '#4FB8D4' },
  PIPELINE: { fill: 'rgba(212,160,79,0.05)',  stroke: '#D4A04F' },
  INFRA:    { fill: 'rgba(95,212,168,0.05)',  stroke: '#5FD4A8' },
  TOOLS:    { fill: 'rgba(180,127,232,0.05)', stroke: '#B47FE8' },
  BOTS:     { fill: 'rgba(192,115,168,0.06)', stroke: '#C073A8' },
};

/**
 * SCHLENK top-level bench scene. Replaces PeriodicTableGrid for SCHLENK mode.
 *
 * Props — kept flexible since modeRegistry Grid is called with various prop
 * shapes by the App-level renderer. We adapt to whatever arrives:
 *   elements / services: array of element-registry entries
 *   statsMap: { [serviceId]: { level, online, ... } }
 *   onElementClick: click handler (element) => void
 */
export default function SchlenkBenchScene(props) {
  const elements = props.elements || props.services || props.allElements || [];
  const statsMap = props.statsMap || {};
  const onClick = props.onElementClick || (() => {});

  // Group services by zone for grid positioning within each zone
  const serviceIds = elements.map(el => el.id).filter(Boolean);
  const grouped = groupServicesByZone(serviceIds);

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

        {/* 6 zone rectangles with dashed borders */}
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
              {/* Zone label (bottom-left corner) */}
              <text
                x={zone.x + 8}
                y={zone.y + zone.h - 6}
                fontFamily="monospace"
                fontSize="9"
                fill={tint.stroke}
                letterSpacing="0.15em"
                opacity="0.7"
              >
                {zone.label}
              </text>
            </g>
          );
        })}

        {/* Tubing: vertical drop from each port into its zone */}
        {listZones().map(([zoneKey, zone]) => {
          const x = PORT_X[zone.portId];
          if (x === undefined) return null;
          return (
            <line
              key={`tubing-${zoneKey}`}
              x1={x}
              y1="72"
              x2={x}
              y2={zone.y}
              stroke="#4FB8D4"
              strokeWidth="2"
              opacity="0.5"
            />
          );
        })}

        {/* Placeholder dots at each service position (Sprint 4 replaces with SchlenkCard) */}
        {Object.entries(grouped).flatMap(([zoneKey, svcs]) =>
          svcs.map((svc, i) => {
            const pos = positionForService(svc, i, svcs.length);
            if (!pos) return null;
            const el = elements.find(e => e.id === svc);
            const color = getElementColor(el?.symbol || '').color;
            return (
              <g key={`svc-${svc}`} onClick={() => onClick(el)} style={{ cursor: 'pointer' }}>
                <circle cx={pos.x} cy={pos.y} r="12" fill={color} opacity="0.6" stroke="#4FB8D4" strokeWidth="1" />
                <text
                  x={pos.x}
                  y={pos.y + 3}
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontSize="9"
                  fill="#fff"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {el?.symbol || '?'}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
}
