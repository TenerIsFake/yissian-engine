import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import BioCard from './BioCard.jsx';
import { BIO_OVERLAY } from './bioConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1300, CH = 760;
const PAD = 40;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Organelle type → region of cytoplasm (normalized x, y ranges)
const ORGANELLE_ZONES = {
  Nucleus:      { xRange: [0.38, 0.62], yRange: [0.35, 0.65] }, // Central nucleus
  Mitochondria: { xRange: [0.15, 0.85], yRange: [0.15, 0.85] }, // Distributed
  Ribosome:     { xRange: [0.20, 0.80], yRange: [0.20, 0.80] }, // ER region
  Receptor:     { xRange: [0.05, 0.35], yRange: [0.05, 0.50] }, // Membrane edge (left)
  Membrane:     { xRange: [0.65, 0.95], yRange: [0.05, 0.50] }, // Membrane edge (right)
  Vacuole:      { xRange: [0.60, 0.90], yRange: [0.60, 0.90] }, // Bottom right
  Lysosome:     { xRange: [0.10, 0.40], yRange: [0.60, 0.90] }, // Bottom left
  Vesicle:      { xRange: [0.25, 0.75], yRange: [0.05, 0.30] }, // Top
  Protein:      { xRange: [0.10, 0.90], yRange: [0.10, 0.90] }, // Scattered
  Enzyme:       { xRange: [0.30, 0.70], yRange: [0.70, 0.95] }, // Bottom
  Organelle:    { xRange: [0.20, 0.80], yRange: [0.20, 0.80] }, // General
  Cytoplasm:    { xRange: [0.10, 0.90], yRange: [0.10, 0.90] }, // Everywhere
};

function seededRand(seed) {
  let s = (seed ^ 0x9e3779b9) >>> 0;
  s += 0x6D2B79F5;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function strHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildLayout(registry) {
  const zoneCount = {};
  return registry.map((el, i) => {
    const organelleType = BIO_OVERLAY[el.id]?.organelleType ?? 'Cytoplasm';
    const zone = ORGANELLE_ZONES[organelleType] ?? ORGANELLE_ZONES.Cytoplasm;
    if (!zoneCount[organelleType]) zoneCount[organelleType] = 0;
    const slotIdx = zoneCount[organelleType]++;

    const seed = strHash(el.id) + slotIdx * 137;
    const rx = seededRand(seed);
    const ry = seededRand(seed + 997);

    const x = PAD + (zone.xRange[0] + rx * (zone.xRange[1] - zone.xRange[0])) * (CW - PAD * 2) - CARD_W / 2;
    const y = PAD + (zone.yRange[0] + ry * (zone.yRange[1] - zone.yRange[0])) * (CH - PAD * 2) - CARD_H / 2;

    return {
      el, organelleType,
      x: Math.max(PAD, Math.min(CW - CARD_W - PAD, x)),
      y: Math.max(PAD, Math.min(CH - CARD_H - PAD, y)),
    };
  });
}

const BioGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);

  // Gap junction connectors: same organelleType connect with short lines
  const junctions = useMemo(() => {
    const typeGroups = {};
    layout.forEach(p => {
      if (!typeGroups[p.organelleType]) typeGroups[p.organelleType] = [];
      typeGroups[p.organelleType].push(p);
    });
    const lines = [];
    Object.values(typeGroups).forEach(group => {
      if (group.length < 2) return;
      for (let i = 0; i < group.length - 1; i++) {
        const a = group[i], b = group[i + 1];
        const ax = a.x + CARD_W / 2, ay = a.y + CARD_H / 2;
        const bx = b.x + CARD_W / 2, by = b.y + CARD_H / 2;
        const dist = Math.hypot(bx - ax, by - ay);
        if (dist < 320) {
          // Organic curve with feTurbulence-like sinusoidal wobble
          const mx = (ax + bx) / 2 + (Math.sin(ax * 0.02) * 20);
          const my = (ay + by) / 2 + (Math.cos(ay * 0.02) * 20);
          lines.push({ key: `${a.el.id}-${b.el.id}`, ax, ay, bx, by, mx, my, dist });
        }
      }
    });
    return lines;
  }, [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Cell membrane oval */}
        <div style={{
          position: 'absolute', left: PAD / 2, right: PAD / 2, top: PAD / 2, bottom: PAD / 2,
          borderRadius: '45% 55% 50% 50% / 45% 45% 55% 55%',
          border: '1px solid rgba(100,220,180,0.15)',
          background: 'rgba(0,30,20,0.15)',
          pointerEvents: 'none',
        }} />

        {/* Nucleus region indicator */}
        <div style={{
          position: 'absolute',
          left: CW * 0.38 - 20, top: CH * 0.35 - 20,
          width: (CW * 0.24) + 40, height: (CH * 0.30) + 40,
          borderRadius: '50%',
          border: '1px dashed rgba(100,220,180,0.1)',
          pointerEvents: 'none',
        }} />

        {/* Gap junction membrane SVG */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          <defs>
            <filter id="bio-blur">
              <feGaussianBlur stdDeviation="0.8" />
            </filter>
          </defs>
          {junctions.map(({ key, ax, ay, bx, by, mx, my }) => (
            <g key={key}>
              <path d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`}
                stroke="rgba(100,220,180,0.2)" strokeWidth="1.2" fill="none"
                filter="url(#bio-blur)" />
              {/* Gap junction dots */}
              <circle cx={(ax + bx) / 2 * 0.5 + mx * 0.5} cy={(ay + by) / 2 * 0.5 + my * 0.5}
                r="2.5" fill="rgba(100,220,180,0.35)" />
            </g>
          ))}
        </svg>

        {/* Organelle cards */}
        {layout.map(({ el, x, y, organelleType }, idx) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          const isNucleus = organelleType === 'Nucleus';
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: x, top: y, zIndex: isNucleus ? 15 : 10 }}
              animate={prefersReducedMotion ? {} : {
                scale: [1, isNucleus ? 1.04 : 1.02, 1],
                x: [0, (idx % 2 === 0 ? 1 : -1) * 1.5, 0],
              }}
              transition={{ duration: 3 + idx * 0.25, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.15 }}
              whileHover={{ scale: 1.12, zIndex: 80 }}
            >
              <BioCard element={el} stats={stats} onClick={onElementClick} />
            </motion.div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          ◆ EUKARYOTIC CELL — LIVE VIEW ◆
        </div>
      </div>
    </div>
  );
};

export default BioGrid;
