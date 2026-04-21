import React from 'react';

/**
 * SCHLENK — Manifold strip
 * Decorative hero strip above the services grid. 6 evenly-spaced stopcocks
 * match the 6 zones (MEDIA, LIBRARY, PIPELINE, INFRA, TOOLS, BOTS).
 * Ar-in label at left, VAC-out label at right.
 * Argon flow is a CSS-only keyframe animation (no JS loops).
 * Phase 2 will add health-driven stopcock rotation — this file is static for now.
 */
const STOPCOCKS = [
  { label: 'MEDIA', angle: 45 },
  { label: 'LIBRARY', angle: 45 },
  { label: 'PIPELINE', angle: 45 },
  { label: 'INFRA', angle: 45 },
  { label: 'TOOLS', angle: 45 },
  { label: 'BOTS', angle: 45 },
];

const argonFlowKeyframes = `
@keyframes schlenkArgonFlow {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -40; }
}
`;

export default function SchlenkManifold() {
  return (
    <div
      style={{
        width: '100%',
        height: 56,
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(79,184,212,0.10) 0%, rgba(8,16,26,0.6) 100%)',
        border: '1px solid rgba(79,184,212,0.3)',
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <style>{argonFlowKeyframes}</style>
      <svg viewBox="0 0 600 56" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Main manifold tube */}
        <rect x="40" y="20" width="520" height="12" fill="rgba(10,20,32,0.4)" stroke="#4FB8D4" strokeWidth="1" rx="2" />
        {/* Argon flow line (violet, animated) */}
        <line
          x1="45"
          y1="26"
          x2="555"
          y2="26"
          stroke="#B47FE8"
          strokeWidth="1.2"
          strokeDasharray="6 6"
          opacity="0.7"
          style={{ animation: 'schlenkArgonFlow 2s linear infinite' }}
        />
        {/* Ar-in label (left) */}
        <text x="8" y="30" fontSize="9" fontFamily="monospace" fill="#B47FE8" letterSpacing="0.15em" fontWeight="bold">
          Ar →
        </text>
        {/* VAC-out label (right) */}
        <text x="565" y="30" fontSize="9" fontFamily="monospace" fill="#D4A04F" letterSpacing="0.15em" fontWeight="bold">
          ← VAC
        </text>
        {/* 6 stopcocks evenly spaced */}
        {STOPCOCKS.map((sc, i) => {
          const x = 95 + i * 82;
          return (
            <g key={sc.label}>
              {/* Port body */}
              <circle cx={x} cy="26" r="7" fill="rgba(8,16,26,0.8)" stroke="#4FB8D4" strokeWidth="1.2" />
              {/* Stopcock handle (rotated) */}
              <g transform={`rotate(${sc.angle} ${x} 26)`}>
                <rect x={x - 0.8} y="19" width="1.6" height="14" fill="#D4A04F" rx="0.5" />
                <circle cx={x} cy="19" r="1.2" fill="#E8B870" />
              </g>
              {/* Zone label below port */}
              <text
                x={x}
                y="48"
                textAnchor="middle"
                fontSize="7"
                fontFamily="monospace"
                fill="rgba(79,184,212,0.7)"
                letterSpacing="0.15em"
              >
                {sc.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
