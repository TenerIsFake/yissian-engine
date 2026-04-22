import React from 'react';
import { SCENE_W, MANIFOLD_H, PORT_X, ZONES } from './zoneLayout.js';
import { computePortAngles } from './portState.js';
import PressureGauge from './PressureGauge.jsx';

const argonFlowKeyframes = `
@keyframes schlenkArgonFlow {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -40; }
}
@keyframes schlenkVacFlow {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 40; }
}
`;

/**
 * SCHLENK double-tube manifold hero strip.
 * Renders at the top of SchlenkBenchScene (y=0..MANIFOLD_H in scene coords).
 * Stopcock handles rotate based on portState (driven by statsMap).
 * Pressure gauge at right shows aggregate load.
 */
export default function SchlenkManifold({ statsMap = {} }) {
  const angles = computePortAngles(statsMap);
  const portIds = Object.entries(ZONES).map(([_, zone]) => ({ id: zone.portId, label: zone.label }));

  return (
    <g>
      <style>{argonFlowKeyframes}</style>

      {/* Ar top tube */}
      <rect x="40" y="20" width={SCENE_W - 80} height="16" rx="8"
            fill="rgba(59,151,212,0.35)" stroke="#4FB8D4" strokeWidth="1.2" />

      {/* VAC bottom tube */}
      <rect x="40" y="50" width={SCENE_W - 80} height="16" rx="8"
            fill="#0A1420" stroke="#4FB8D4" strokeWidth="1.2" />

      {/* Ar label (left end) */}
      <rect x="20" y="18" width="24" height="20" fill="#B47FE8" stroke="#4FB8D4" strokeWidth="0.8" />
      <text x="32" y="12" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#B47FE8" fontWeight="bold">Ar</text>

      {/* VAC label (left end, below) */}
      <rect x="20" y="48" width="24" height="20" fill="#1C2838" stroke="#4FB8D4" strokeWidth="0.8" />
      <text x="32" y="82" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#7A9BAE">VAC</text>

      {/* Argon flow indicator (violet dashed line animated through top tube) */}
      <line x1="50" y1="28" x2={SCENE_W - 50} y2="28"
            stroke="#B47FE8" strokeWidth="1.4" strokeDasharray="6 6" opacity="0.7"
            style={{ animation: 'schlenkArgonFlow 2s linear infinite' }} />
      <line
        x1="50"
        y1="58"
        x2={SCENE_W - 50}
        y2="58"
        stroke="#7A9BAE"
        strokeWidth="1.4"
        strokeDasharray="6 6"
        opacity="0.5"
        style={{ animation: 'schlenkVacFlow 2.4s linear infinite' }}
      />

      {/* 6 ports + stopcocks */}
      {portIds.map(({ id, label }) => {
        const x = PORT_X[id];
        if (x === undefined) return null;
        const angle = angles[id] ?? 90;
        // Vertical port pipe through both tubes
        return (
          <g key={id}>
            {/* Pipe through tube */}
            <rect x={x - 4} y="14" width="8" height="58" fill="#0A1420" stroke="#4FB8D4" strokeWidth="0.8" />
            {/* Stopcock handle — rotates per portState */}
            <g transform={`rotate(${angle} ${x} 28)`}>
              <rect x={x - 2} y="6" width="4" height="14" fill="#D4A04F" />
              <rect x={x - 10} y="4" width="20" height="4" fill="#D4A04F" />
            </g>
            {/* Port label */}
            <text x={x} y="85" textAnchor="middle" fontFamily="monospace" fontSize="8"
                  fill="rgba(79,184,212,0.7)" letterSpacing="0.15em">{id}</text>
          </g>
        );
      })}

      {/* Pressure gauge at far right */}
      <g transform={`translate(${SCENE_W - 40}, 40)`}>
        <PressureGauge statsMap={statsMap} />
      </g>
    </g>
  );
}
