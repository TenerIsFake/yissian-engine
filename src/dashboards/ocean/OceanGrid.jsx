import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import OceanCard from './OceanCard.jsx';
import { OCEAN_OVERLAY } from './oceanConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1300, CH = 680;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Depth zones: ecology key → { yPct, label }
const DEPTH_ZONES = {
  Reef:     { y: 0.12, label: 'PHOTIC ZONE — 0–200 m'          },
  Lagoon:   { y: 0.12, label: 'PHOTIC ZONE — 0–200 m'          },
  Shelf:    { y: 0.28, label: 'NERITIC ZONE — 200–1,000 m'     },
  Current:  { y: 0.28, label: 'NERITIC ZONE — 200–1,000 m'     },
  Gyre:     { y: 0.28, label: 'NERITIC ZONE — 200–1,000 m'     },
  Ridge:    { y: 0.44, label: 'MESOPELAGIC — 1,000–4,000 m'    },
  Deep:     { y: 0.58, label: 'BATHYPELAGIC — 4,000–6,000 m'   },
  Basin:    { y: 0.70, label: 'ABYSSOPELAGIC — 6,000–9,000 m'  },
  Seep:     { y: 0.70, label: 'ABYSSOPELAGIC — 6,000–9,000 m'  },
  Trench:   { y: 0.85, label: 'HADOPELAGIC — 9,000 m+'         },
};

const DEFAULT_ZONE = { y: 0.44 };

// FE-10: distribute cards horizontally within each depth band — no stacking
function buildLayout(registry) {
  const groups = {};
  for (const el of registry) {
    const ecology = OCEAN_OVERLAY[el.id]?.ecology ?? 'Ridge';
    if (!groups[ecology]) groups[ecology] = [];
    groups[ecology].push(el);
  }
  const positions = [];
  for (const [ecology, els] of Object.entries(groups)) {
    const zone = DEPTH_ZONES[ecology] ?? DEFAULT_ZONE;
    const count = els.length;
    const xStart = 0.08, xEnd = 0.92;
    const step = count > 1 ? (xEnd - xStart) / (count - 1) : 0;
    els.forEach((el, i) => {
      const xPct = count === 1 ? (xStart + xEnd) / 2 : xStart + i * step;
      const rawX = xPct * CW - CARD_W / 2;
      positions.push({
        el,
        x: Math.max(0, Math.min(CW - CARD_W, rawX)),
        y: zone.y * CH - CARD_H / 2,
        ecology,
      });
    });
  }
  return positions;
}

// Ecological connections within the same depth band
function buildConnections(positions) {
  const groups = {};
  for (const p of positions) {
    if (!groups[p.ecology]) groups[p.ecology] = [];
    groups[p.ecology].push(p);
  }
  const lines = [];
  for (const group of Object.values(groups)) {
    for (let i = 0; i < group.length - 1; i++) {
      const a = group[i], b = group[i + 1];
      lines.push({
        key: `${a.el.id}-${b.el.id}`,
        x1: a.x + CARD_W / 2, y1: a.y + CARD_H / 2,
        x2: b.x + CARD_W / 2, y2: b.y + CARD_H / 2,
      });
    }
  }
  return lines;
}

// Depth boundary Y percentages for SVG grid lines
const DEPTH_BOUNDARY_PCTS = [0.20, 0.36, 0.52, 0.64, 0.77];

// Surface wave rows
const WAVE_ROWS = [
  { y: 0.08, opacity: 0.12 },
  { y: 0.14, opacity: 0.08 },
  { y: 0.20, opacity: 0.06 },
];

const OceanGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  const positions   = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const connections = useMemo(() => buildConnections(positions), [positions]);

  // Unique depth zone labels for side annotations
  const depthLabels = useMemo(() => {
    const seen = new Set();
    return positions.reduce((acc, { ecology }) => {
      const zone = DEPTH_ZONES[ecology];
      if (zone && !seen.has(zone.label)) {
        seen.add(zone.label);
        acc.push({ y: zone.y * CH, label: zone.label });
      }
      return acc;
    }, []);
  }, [positions]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Ocean depth gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,20,50,0.60) 0%, rgba(0,8,25,0.80) 50%, rgba(0,2,12,0.92) 100%)',
          borderRadius: 4,
        }} />

        {/* Surface wave animations */}
        {!prefersReducedMotion && WAVE_ROWS.map((w, wi) => (
          <motion.div key={wi}
            aria-hidden="true"
            style={{
              position: 'absolute', left: 0, right: 0,
              top: CH * w.y, height: 1,
              background: 'rgba(100,200,255,0.5)',
              opacity: w.opacity,
            }}
            animate={{ scaleX: [1, 1.02, 0.98, 1], opacity: [w.opacity, w.opacity * 1.5, w.opacity * 0.7, w.opacity] }}
            transition={{ duration: 3 + wi * 0.7, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
          />
        ))}

        {/* SVG: depth boundaries + ecological connections */}
        <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {DEPTH_BOUNDARY_PCTS.map((pct, i) => (
            <line key={`db-${i}`} x1={0} y1={CH * pct} x2={CW} y2={CH * pct}
              stroke="rgba(100,200,255,0.07)" strokeWidth="1" strokeDasharray="8 12" />
          ))}
          {connections.map(({ key, x1, y1, x2, y2 }) => (
            <line key={key} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(0,200,255,0.22)" strokeWidth="1" strokeDasharray="3 6" />
          ))}
          {connections.map(({ key, x1, y1, x2, y2 }) => (
            <g key={`dot-${key}`}>
              <circle cx={x1} cy={y1} r="2.5" fill="rgba(0,200,255,0.38)" />
              <circle cx={x2} cy={y2} r="2.5" fill="rgba(0,200,255,0.38)" />
            </g>
          ))}
        </svg>

        {/* Depth zone annotations */}
        {depthLabels.map(({ y, label }) => (
          <div key={label} aria-hidden="true" style={{
            position: 'absolute', left: 8, top: y - 14,
            fontSize: 7, fontFamily: 'monospace',
            color: 'rgba(100,200,255,0.22)', letterSpacing: '0.25em', pointerEvents: 'none',
          }}>
            {label}
          </div>
        ))}

        {/* Service cards */}
        {positions.map(({ el, x, y }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: x, top: y }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }}
            >
              <OceanCard element={el} stats={stats} onClick={onElementClick} />
            </motion.div>
          );
        })}

        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 6, right: 12,
          fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.10)', letterSpacing: '0.3em', pointerEvents: 'none',
        }}>
          ◆ BATHYMETRIC DEPTH CHART ◆
        </div>
      </div>
    </div>
  );
};

export default OceanGrid;
