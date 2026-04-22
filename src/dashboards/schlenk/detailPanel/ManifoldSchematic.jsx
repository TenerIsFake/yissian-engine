import React from 'react';
import { ZONES } from '../zoneLayout.js';
import { SERVICE_TO_ZONE } from '../serviceLayout.js';

/**
 * Mini manifold schematic showing this service's port + neighbors on the same port.
 * Props: serviceId, allElements (array of all services) — used to find neighbors.
 */
export default function ManifoldSchematic({ serviceId, allElements = [] }) {
  const myZone = SERVICE_TO_ZONE[serviceId];
  const myZoneEntry = myZone ? ZONES[myZone] : null;
  const myPortId = myZoneEntry?.portId || '?';

  // Find neighbors on the same port (same zone)
  const neighbors = allElements
    .filter(el => SERVICE_TO_ZONE[el.id] === myZone && el.id !== serviceId)
    .slice(0, 4);

  const portEntries = Object.entries(ZONES).map(([_, z]) => z.portId);
  const xSpacing = 70;
  const startX = 30;

  return (
    <svg viewBox="0 0 480 100" width="100%" height="90">
      {/* manifold bars */}
      <rect x="20" y="30" width="440" height="8" rx="4" fill="rgba(59,151,212,0.2)" stroke="#4FB8D4" strokeWidth="0.8" />
      <rect x="20" y="42" width="440" height="6" rx="3" fill="#0A1420" stroke="#4FB8D4" strokeWidth="0.8" />

      {/* ports */}
      {portEntries.map((portId, i) => {
        const x = startX + 40 + i * xSpacing;
        const active = portId === myPortId;
        return (
          <g key={portId}>
            <rect x={x - 2} y="22" width="4" height="12" fill={active ? '#D4C070' : '#D4A04F'} />
            {active && (
              <circle cx={x} cy="28" r="6" fill="none" stroke="#D4C070" strokeWidth="1.4" opacity="0.7" />
            )}
            <text x={x} y="62" textAnchor="middle" fontFamily="monospace" fontSize="7"
                  fill={active ? '#D4C070' : '#7A9BAE'} fontWeight={active ? 700 : 400}>
              {portId}
            </text>
          </g>
        );
      })}

      {/* highlight drop from the active port */}
      {(() => {
        const i = portEntries.indexOf(myPortId);
        if (i < 0) return null;
        const x = startX + 40 + i * xSpacing;
        return (
          <>
            <line x1={x} y1="48" x2={x} y2="80" stroke="#D4C070" strokeWidth="2" strokeDasharray="3 2" />
            <rect x={x - 28} y="78" width="56" height="14" fill="rgba(212,192,112,0.15)"
                  stroke="#D4C070" strokeWidth="0.8" rx="2" />
            <text x={x} y="88" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="#D4C070">
              {(serviceId || '').slice(0, 9).toUpperCase()}
            </text>
          </>
        );
      })()}

      {/* neighbors as chips on the right */}
      <g fontFamily="monospace" fontSize="6" fill="#7A9BAE">
        <text x="14" y="86">neighbors:</text>
        {neighbors.map((n, i) => (
          <g key={n.id}>
            <rect x={80 + i * 60} y="78" width="56" height="12" fill="rgba(79,184,212,0.08)"
                  stroke="#4FB8D4" strokeWidth="0.5" rx="2" />
            <text x={108 + i * 60} y="87" textAnchor="middle">{(n.service || n.id || '').toUpperCase().slice(0, 8)}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}
