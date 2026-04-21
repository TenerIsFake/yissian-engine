import React from 'react';

/**
 * SCHLENK — Manifold strip
 * Decorative hero strip above the services grid. 6 evenly-spaced stopcocks
 * match the 6 zones (MEDIA, LIBRARY, PIPELINE, INFRA, TOOLS, BOTS).
 * Each stopcock port has a small Schlenk flask (round-bottom with sidearm) hanging below.
 * Ar-in label at left, VAC-out label at right.
 * Argon flow is a CSS-only keyframe animation (no JS loops).
 * Phase 2 will add health-driven stopcock rotation — this file is static for now.
 */
const STOPCOCKS = [
  { label: 'MEDIA',    angle: 45, gasColor: '#B47FE8' }, // Ar
  { label: 'LIBRARY',  angle: 45, gasColor: '#5FD4A8' }, // N2
  { label: 'PIPELINE', angle: 45, gasColor: '#D4A04F' }, // B oil
  { label: 'INFRA',    angle: 45, gasColor: '#5FD4A8' }, // N2 cooling
  { label: 'TOOLS',    angle: 45, gasColor: '#FFB866' }, // O2 — tools operate in air
  { label: 'BOTS',     angle: 45, gasColor: '#4FB8D4' }, // borosilicate glass
];

const argonFlowKeyframes = `
@keyframes schlenkArgonFlow {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -40; }
}
@keyframes schlenkLiquidShimmer {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.75; }
}
`;

export default function SchlenkManifold() {
  return (
    <div
      style={{
        width: '100%',
        height: 120,
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(79,184,212,0.10) 0%, rgba(8,16,26,0.65) 100%)',
        border: '1px solid rgba(79,184,212,0.3)',
        borderRadius: 4,
        marginBottom: 12,
        overflow: 'hidden',
      }}
    >
      <style>{argonFlowKeyframes}</style>
      <svg viewBox="0 0 600 120" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Main manifold tube (horizontal) */}
        <rect x="40" y="18" width="520" height="14" fill="rgba(10,20,32,0.6)" stroke="#4FB8D4" strokeWidth="1" rx="2" />
        {/* Inner tube highlight — glass reflection */}
        <line x1="42" y1="21" x2="558" y2="21" stroke="rgba(192,212,219,0.25)" strokeWidth="0.5" />
        {/* Argon flow line (violet, animated dashes) */}
        <line
          x1="45"
          y1="25"
          x2="555"
          y2="25"
          stroke="#B47FE8"
          strokeWidth="1.2"
          strokeDasharray="6 6"
          opacity="0.7"
          style={{ animation: 'schlenkArgonFlow 2s linear infinite' }}
        />
        {/* Ar-in label (left, outside manifold) */}
        <text x="6" y="28" fontSize="10" fontFamily="monospace" fill="#B47FE8" letterSpacing="0.15em" fontWeight="bold">
          Ar →
        </text>
        {/* VAC-out label (right) */}
        <text x="565" y="28" fontSize="10" fontFamily="monospace" fill="#D4A04F" letterSpacing="0.15em" fontWeight="bold">
          ← VAC
        </text>
        {/* 6 Schlenk flasks hanging from manifold ports */}
        {STOPCOCKS.map((sc, i) => {
          const x = 95 + i * 82;
          const portY = 25;
          const neckTopY = 44;
          const neckBottomY = 62;
          const bulbCy = 80;
          const bulbR = 14;
          const liquidClipId = `schlenkFlaskClip${i}`;
          return (
            <g key={sc.label}>
              {/* Port body (opening in the manifold tube) */}
              <circle cx={x} cy={portY} r="6" fill="rgba(8,16,26,0.95)" stroke="#4FB8D4" strokeWidth="1.2" />
              {/* Stopcock handle (rotated at configured angle) */}
              <g transform={`rotate(${sc.angle} ${x} ${portY})`}>
                <rect x={x - 1} y={portY - 8} width="2" height="16" fill="#D4A04F" rx="0.5" />
                <circle cx={x} cy={portY - 8} r="1.6" fill="#E8B870" />
              </g>
              {/* Narrow neck from stopcock to flask shoulder */}
              <rect
                x={x - 1.8}
                y={neckTopY}
                width="3.6"
                height={neckBottomY - neckTopY}
                fill="rgba(192,212,219,0.15)"
                stroke="#4FB8D4"
                strokeWidth="0.6"
              />
              {/* Sidearm stopcock — tiny angled tube off the shoulder (Schlenk-flask signature) */}
              <g>
                <rect
                  x={x + 4}
                  y={neckBottomY - 3}
                  width="8"
                  height="2.2"
                  fill="rgba(192,212,219,0.15)"
                  stroke="#4FB8D4"
                  strokeWidth="0.5"
                />
                <circle cx={x + 13} cy={neckBottomY - 1.9} r="1.6" fill="rgba(8,16,26,0.9)" stroke="#4FB8D4" strokeWidth="0.6" />
                <rect x={x + 12.6} y={neckBottomY - 5.5} width="0.8" height="4" fill="#D4A04F" />
              </g>
              {/* Round-bottom flask bulb */}
              <clipPath id={liquidClipId}>
                <circle cx={x} cy={bulbCy} r={bulbR} />
              </clipPath>
              <circle
                cx={x}
                cy={bulbCy}
                r={bulbR}
                fill="rgba(192,212,219,0.1)"
                stroke="#4FB8D4"
                strokeWidth="1.1"
              />
              {/* Liquid fill — gas-coded color per zone, shimmering */}
              <rect
                x={x - bulbR}
                y={bulbCy - 2}
                width={bulbR * 2}
                height={bulbR + 2}
                fill={sc.gasColor}
                clipPath={`url(#${liquidClipId})`}
                style={{ animation: 'schlenkLiquidShimmer 3s ease-in-out infinite' }}
              />
              {/* Meniscus highlight across the liquid surface */}
              <line
                x1={x - bulbR + 2}
                y1={bulbCy - 2}
                x2={x + bulbR - 2}
                y2={bulbCy - 2}
                stroke={sc.gasColor}
                strokeWidth="1"
                opacity="0.95"
              />
              {/* Static rising bubbles inside the flask */}
              <circle cx={x - 3} cy={bulbCy + 4} r="1.2" fill={sc.gasColor} opacity="0.6" />
              <circle cx={x + 4} cy={bulbCy + 7} r="0.9" fill={sc.gasColor} opacity="0.5" />
              {/* Glass highlight curve (top-left of bulb) */}
              <path
                d={`M ${x - bulbR + 3} ${bulbCy - bulbR + 4} Q ${x - bulbR + 2} ${bulbCy - 2} ${x - bulbR + 5} ${bulbCy + 4}`}
                fill="none"
                stroke="rgba(255,255,255,0.28)"
                strokeWidth="1.1"
              />
              {/* Zone label below flask */}
              <text
                x={x}
                y="108"
                textAnchor="middle"
                fontSize="7"
                fontFamily="monospace"
                fill="rgba(79,184,212,0.8)"
                letterSpacing="0.2em"
                fontWeight="bold"
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
