import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import NoirCard from './NoirCard.jsx';
import { NOIR_OVERLAY } from './noirConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1310, CH = 760;
const PAD = 30;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

function mulberry32(seed) {
  let s = (seed ^ 0x9e3779b9) >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function strHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function scatterPositions(registry) {
  const cols = 6;
  const rows = Math.ceil(registry.length / cols);
  const cellW = (CW - PAD * 2) / cols;
  const cellH = (CH - PAD * 2) / rows;

  return registry.map((el, i) => {
    const rng = mulberry32(strHash(el.id) + i * 1013);
    rng(); rng();
    const col = i % cols;
    const row = Math.floor(i / cols);
    const jx = (rng() - 0.5) * cellW * 0.55;
    const jy = (rng() - 0.5) * cellH * 0.55;
    const rot = (rng() - 0.5) * 12;
    const x = Math.max(PAD, Math.min(CW - CARD_W - PAD, PAD + col * cellW + cellW / 2 + jx - CARD_W / 2));
    const y = Math.max(PAD, Math.min(CH - CARD_H - PAD, PAD + row * cellH + cellH / 2 + jy - CARD_H / 2));
    return { el, x, y, rot };
  });
}

// Static decorative lines — module-level so they're created once, never on re-render
const RULED_LINES = Array.from({ length: 20 }, (_, i) => (
  <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * 40, height: 1, background: 'rgba(255,220,150,0.6)' }} />
));

const NoirGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, cardTransform }) => {
  const positions = useMemo(() => scatterPositions(elementRegistry), [elementRegistry]);

  // Group by bureau for red-string connections
  const bureauConnections = useMemo(() => {
    const groups = {};
    positions.forEach(p => {
      const bureau = NOIR_OVERLAY[p.el.id]?.bureau ?? 'Unknown';
      if (!groups[bureau]) groups[bureau] = [];
      groups[bureau].push(p);
    });
    const lines = [];
    Object.values(groups).forEach((group, gi) => {
      if (group.length < 2) return;
      for (let i = 0; i < group.length - 1; i++) {
        const a = group[i], b = group[i + 1];
        const ax = a.x + CARD_W / 2, ay = a.y + CARD_H / 2;
        const bx = b.x + CARD_W / 2, by = b.y + CARD_H / 2;
        const sag = Math.min(30, Math.abs(by - ay) * 0.3 + 10);
        const mx = (ax + bx) / 2, my = Math.max(ay, by) + sag;
        lines.push({ key: `${gi}-${i}`, ax, ay, bx, by, mx, my });
      }
    });
    return lines;
  }, [positions]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Desk texture: faint ruled lines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.04 }}>
          {RULED_LINES}
        </div>

        {/* Red string SVG overlay */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          <defs>
            <filter id="string-blur">
              <feGaussianBlur stdDeviation="0.4" />
            </filter>
          </defs>
          {bureauConnections.map(({ key, ax, ay, bx, by, mx, my }) => (
            <g key={key}>
              <path d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`}
                stroke="#dc2626" strokeWidth="1.4" fill="none" opacity="0.5" filter="url(#string-blur)" />
              <circle cx={ax} cy={ay} r="3.5" fill="#991b1b" opacity="0.75" />
              <circle cx={bx} cy={by} r="3.5" fill="#991b1b" opacity="0.75" />
            </g>
          ))}
        </svg>

        {/* Scattered case-file cards */}
        {positions.map(({ el, x, y, rot }, idx) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <motion.div
              key={el.id}
              style={{ position: 'absolute', left: x, top: y, rotate: rot, zIndex: stats.online ? 10 + idx : idx }}
              whileHover={prefersReducedMotion ? {} : { rotate: 0, zIndex: 80, scale: 1.1 }}
              animate={prefersReducedMotion ? {} : { rotate: [rot, rot - 0.4, rot + 0.4, rot] }}
              transition={prefersReducedMotion ? {} : {
                rotate: { duration: 6 + idx * 0.4, repeat: Infinity, ease: 'easeInOut' },
                scale: { type: 'spring', stiffness: 260, damping: 20 },
              }}
            >
              <NoirCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}

        {/* Watermark */}
        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,200,100,0.12)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          {gridTitle || '◆ CASE ROOM — RESTRICTED ACCESS ◆'}
        </div>
      </div>
    </div>
  );
};

export default NoirGrid;
