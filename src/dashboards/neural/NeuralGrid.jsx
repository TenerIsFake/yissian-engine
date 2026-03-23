// T2-03: removed useRef, useLayoutEffect, useState — imported but never used.
// These were vestiges of an earlier DOM-measurement implementation.
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import NeuralCard from './NeuralCard.jsx';

const CARD_W = 72, CARD_H = 80;
const CW = 1300, CH = 760;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Assign each service to a DAG layer by category
const INPUT_CATS  = new Set(['NONMETAL', 'HALOGEN', 'PNICTOGEN']);
const OUTPUT_CATS = new Set(['NOBLE', 'LANTHANIDE', 'ACTINIDE', 'POST']);

function assignLayer(cat) {
  if (INPUT_CATS.has(cat)) return 0;
  if (OUTPUT_CATS.has(cat)) return 2;
  return 1;
}

const LAYER_X = [120, CW / 2 - 36, CW - 192];

function buildDAGLayout(registry) {
  const layers = [[], [], []];
  registry.forEach(el => layers[assignLayer(el.cat)].push(el));

  const positions = [];
  layers.forEach((layer, li) => {
    const n = layer.length;
    const startY = (CH - n * (CARD_H + 14)) / 2;
    layer.forEach((el, i) => {
      positions.push({ el, layer: li, x: LAYER_X[li], y: startY + i * (CARD_H + 14) });
    });
  });
  return positions;
}

// Build connections: input→middle and middle→output (by index pairing)
function buildConnections(positions) {
  const byLayer = [
    positions.filter(p => p.layer === 0),
    positions.filter(p => p.layer === 1),
    positions.filter(p => p.layer === 2),
  ];
  const lines = [];
  for (let li = 0; li < 2; li++) {
    const from = byLayer[li], to = byLayer[li + 1];
    from.forEach((f, fi) => {
      // Connect each node to 2–3 adjacent nodes in the next layer
      const start = Math.max(0, Math.round(fi * to.length / from.length) - 1);
      for (let ti = start; ti < Math.min(start + 2, to.length); ti++) {
        const t = to[ti];
        lines.push({
          key: `${f.el.id}-${t.el.id}`,
          x1: f.x + CARD_W, y1: f.y + CARD_H / 2,
          x2: t.x, y2: t.y + CARD_H / 2,
          fromOnline: true, // will be filled at render
          fromId: f.el.id, toId: t.el.id,
        });
      }
    });
  }
  return lines;
}

// T2-01 / CONFLICT RESOLVED C-1: Number.isFinite guard added to offsetPath coordinates.
// Coordinates currently derive from static layout constants and are always finite.
// This guard is defense-in-depth: if layout coordinates ever derive from external
// registry data (e.g. user-provided coordinates), a non-finite value would produce
// a malformed CSS path() value and could be exploited for CSS injection.
// .toFixed(2) normalizes values and prevents exponent notation in the path string.
// SECURITY OVERRIDE: guard retained despite coordinates being currently static —
//   overrides any future simplifier suggestion to remove "redundant" validation.
// UX COMPROMISE: offsetPath feature retained (compositor-thread animation) —
//   overrides tech-lead preference for Framer Motion keyframes, per UX argument
//   that compositor offload reduces jank; no active breakage in target environment.
function safePathCoord(v) {
  return Number.isFinite(v) ? v.toFixed(2) : '0.00';
}

// Animated signal pulse traveling a bezier path
const SignalPulse = ({ x1, y1, x2, y2, delay, color }) => {
  const cx = (x1 + x2) / 2;
  // CONFLICT RESOLVED C-1: all coordinate values sanitized before CSS string insertion
  const pathStr = `path('M${safePathCoord(x1)},${safePathCoord(y1)} C${safePathCoord(cx)},${safePathCoord(y1)} ${safePathCoord(cx)},${safePathCoord(y2)} ${safePathCoord(x2)},${safePathCoord(y2)}')`;
  return (
    <motion.circle r="2.5" fill={color} opacity="0.85"
      animate={{ offsetDistance: ['0%', '100%'] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{
        offsetPath: pathStr,
        fillOpacity: 0.9,
      }}
    />
  );
};

const LAYER_LABELS = ['INPUT\nLAYER', 'HIDDEN\nLAYER', 'OUTPUT\nLAYER'];

const NeuralGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  const positions = useMemo(() => buildDAGLayout(elementRegistry), [elementRegistry]);
  const connections = useMemo(() => buildConnections(positions), [positions]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Layer label columns */}
        {LAYER_LABELS.map((label, i) => (
          <div key={i} style={{
            position: 'absolute', left: LAYER_X[i], top: 12, width: CARD_W,
            textAlign: 'center', fontSize: 8, fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', whiteSpace: 'pre-line',
            lineHeight: 1.4,
          }}>
            {label}
          </div>
        ))}

        {/* Layer separator lines */}
        {[LAYER_X[0] + CARD_W + (LAYER_X[1] - LAYER_X[0] - CARD_W) / 2,
          LAYER_X[1] + CARD_W + (LAYER_X[2] - LAYER_X[1] - CARD_W) / 2,
        ].map((lx, i) => (
          <div key={i} style={{
            position: 'absolute', left: lx, top: 0, width: 1, height: CH,
            background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
          }} />
        ))}

        {/* SVG: synaptic bezier connections + signal pulses */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%', overflow: 'visible' }}>
          {connections.map(({ key, x1, y1, x2, y2, fromId, toId }) => {
            const fromOnline = statsMap[fromId]?.online ?? false;
            const toOnline = statsMap[toId]?.online ?? false;
            const active = fromOnline && toOnline;
            const cx = (x1 + x2) / 2;
            const pathD = `M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}`;
            return (
              <g key={key}>
                <path d={pathD}
                  stroke={active ? 'rgba(100,220,255,0.25)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth={active ? 1.2 : 0.6} fill="none" />
              </g>
            );
          })}

          {/* Signal pulses on active connections */}
          {!prefersReducedMotion && connections.map(({ key, x1, y1, x2, y2, fromId, toId }, idx) => {
            const fromOnline = statsMap[fromId]?.online ?? false;
            const toOnline = statsMap[toId]?.online ?? false;
            if (!fromOnline || !toOnline) return null;
            const cx = (x1 + x2) / 2;
            return (
              <SignalPulse key={`pulse-${key}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                delay={(idx * 0.37) % 3.5}
                color="rgba(100,220,255,0.9)"
              />
            );
          })}
        </svg>

        {/* Node cards */}
        {positions.map(({ el, x, y }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <div key={el.id} style={{ position: 'absolute', left: x, top: y }}>
              <NeuralCard element={el} stats={stats} onClick={onElementClick} />
            </div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          ◆ NEURAL MESH — LIVE TOPOLOGY ◆
        </div>
      </div>
    </div>
  );
};

export default NeuralGrid;
