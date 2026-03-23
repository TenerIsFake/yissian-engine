import React, { useMemo } from 'react';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import DinoCard from './DinoCard.jsx';
import { DINO_OVERLAY } from './dinoConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1300, CH = 760;
const PAD_X = 60, PAD_Y = 40;

// Strata: Cretaceous (top) → Triassic (bottom)
const STRATA = [
  { label: 'CRETACEOUS',      epochs: ['Cretaceous'],      color: 'rgba(180,140,60,0.12)',  borderColor: 'rgba(180,140,60,0.25)',  y: 0.00 },
  { label: 'LATE CRETACEOUS', epochs: ['Late Cretaceous'], color: 'rgba(150,110,50,0.10)',  borderColor: 'rgba(150,110,50,0.22)',  y: 0.25 },
  { label: 'JURASSIC',        epochs: ['Jurassic'],        color: 'rgba(100,130,80,0.10)',  borderColor: 'rgba(100,130,80,0.22)',  y: 0.50 },
  { label: 'TRIASSIC',        epochs: ['Triassic'],        color: 'rgba(120,80,60,0.10)',   borderColor: 'rgba(120,80,60,0.22)',   y: 0.75 },
];

function getStratum(epoch) {
  for (let i = 0; i < STRATA.length; i++) {
    if (STRATA[i].epochs.includes(epoch)) return i;
  }
  return 0; // Default to top stratum
}

function buildLayout(registry) {
  const stratumGroups = STRATA.map(() => []);
  registry.forEach(el => {
    const epoch = DINO_OVERLAY[el.id]?.epoch ?? 'Cretaceous';
    stratumGroups[getStratum(epoch)].push(el);
  });

  const positions = [];
  stratumGroups.forEach((items, si) => {
    if (items.length === 0) return;
    const stratumH = CH * 0.25;
    const stratumY = STRATA[si].y * CH;
    const spacing = Math.max(CARD_W + 10, (CW - PAD_X * 2) / Math.max(items.length, 1));
    const totalW = Math.min(items.length * (CARD_W + 10), CW - PAD_X * 2);
    const startX = PAD_X + (CW - PAD_X * 2 - totalW) / 2;

    items.forEach((el, i) => {
      const x = startX + i * spacing;
      const y = stratumY + PAD_Y + (stratumH - CARD_H - PAD_Y * 2) / 2;
      positions.push({ el, x, y, stratum: si });
    });
  });

  return { positions, stratumGroups };
}

const DinoGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  const { positions, stratumGroups } = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);

  // Skeletal connectors: connect services in the same clade
  const skeletalLines = useMemo(() => {
    const cladeGroups = {};
    positions.forEach(p => {
      const clade = DINO_OVERLAY[p.el.id]?.clade ?? 'Unknown';
      if (!cladeGroups[clade]) cladeGroups[clade] = [];
      cladeGroups[clade].push(p);
    });
    const lines = [];
    Object.values(cladeGroups).forEach(group => {
      if (group.length < 2) return;
      for (let i = 0; i < group.length - 1; i++) {
        const a = group[i], b = group[i + 1];
        lines.push({
          key: `${a.el.id}-${b.el.id}`,
          x1: a.x + CARD_W / 2, y1: a.y + CARD_H / 2,
          x2: b.x + CARD_W / 2, y2: b.y + CARD_H / 2,
        });
      }
    });
    return lines;
  }, [positions]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Geological strata bands */}
        {STRATA.map((stratum, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: 0, right: 0,
            top: stratum.y * CH,
            height: CH * 0.25,
            background: stratum.color,
            borderTop: `1px solid ${stratum.borderColor}`,
          }}>
            {/* Stratum label */}
            <div style={{
              position: 'absolute', left: 8, top: 6,
              fontSize: 8, fontFamily: 'monospace',
              color: stratum.borderColor.replace('0.22', '0.5'),
              letterSpacing: '0.3em',
            }}>
              {stratum.label}
            </div>
            {/* Depth marker */}
            <div style={{
              position: 'absolute', right: 8, top: 6,
              fontSize: 7, fontFamily: 'monospace',
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: '0.1em',
            }}>
              {(i * 65).toFixed(0)}–{((i + 1) * 65).toFixed(0)} Ma
            </div>
          </div>
        ))}

        {/* Skeletal connector SVG overlay */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {skeletalLines.map(({ key, x1, y1, x2, y2 }) => {
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            return (
              <g key={key}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="rgba(200,180,120,0.25)" strokeWidth="1"
                  strokeDasharray="6 4" />
                {/* Bone joint dots */}
                <circle cx={x1} cy={y1} r="3.5" fill="rgba(200,180,120,0.3)" />
                <circle cx={x2} cy={y2} r="3.5" fill="rgba(200,180,120,0.3)" />
              </g>
            );
          })}
        </svg>

        {/* Fossil cards */}
        {positions.map(({ el, x, y }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <div key={el.id} style={{ position: 'absolute', left: x, top: y }}>
              <DinoCard element={el} stats={stats} onClick={onElementClick} />
            </div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 6, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          ◆ GEOLOGICAL RECORD — MESOZOIC ERA ◆
        </div>
      </div>
    </div>
  );
};

export default DinoGrid;
