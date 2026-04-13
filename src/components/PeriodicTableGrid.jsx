import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../themes/ThemeContext.jsx';
import { MONO, CELL_SIZE, defaultStats } from '../utils/constants.js';
import StatusDot from './StatusDot.jsx';
// serviceDependencies.js kept for ServiceDetailPanel cascade display — lines removed from grid

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// ─────────────────────────────────────────────
// ELECTRON ORBIT
// ─────────────────────────────────────────────
const ElectronOrbit = ({ shells, catBorder }) => {
  const numRings = shells.length;
  const radii = Array.from({ length: numRings }, (_, i) => 8 + i * 5);
  const durations = Array.from({ length: numRings }, (_, i) => 4 + i * 2);
  const ringOpacity = 0.5;
  const dotSize = 4;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ top: 3 }}>
      {Array.from({ length: numRings }, (_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: radii[i] * 2, height: radii[i] * 2,
          border: `1px solid ${catBorder}`, opacity: ringOpacity,
        }}>
          {prefersReducedMotion ? (
            <div className="absolute rounded-full" style={{
              width: dotSize, height: dotSize, background: catBorder,
              boxShadow: `0 0 4px ${catBorder}`,
              top: -(dotSize / 2), left: '50%', marginLeft: -(dotSize / 2),
            }} />
          ) : (
            <motion.div className="absolute rounded-full" style={{
              width: dotSize, height: dotSize, background: catBorder,
              boxShadow: `0 0 6px ${catBorder}, 0 0 2px ${catBorder}`,
              top: -(dotSize / 2), left: '50%', marginLeft: -(dotSize / 2),
              transformOrigin: `${dotSize / 2}px ${radii[i]}px`,
            }}
              animate={{ rotate: 360 }}
              transition={{ duration: durations[i], repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// EMPTY CELL (ghost element)
// ─────────────────────────────────────────────
const EmptyCell = ({ symbol, catKey }) => {
  const cat = activeCATRef.current[catKey] || activeCATRef.current.NONMETAL;
  return (
    <div style={{
      ...CELL_SIZE,
      background: cat.bg,
      border: `1px solid ${cat.border}1A`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: 0.07,
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: cat.text, fontFamily: 'sans-serif' }}>{symbol}</span>
    </div>
  );
};

// ─────────────────────────────────────────────
// ELEMENT CARD
// ─────────────────────────────────────────────
const ElementCard = ({ element, stats, onClick, cardDisplay, entryIndex = 0 }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = stats.online === false && !stats.stale;

  const cardBg = cat.bg;
  const cardBorder = `${cat.border}4D`;
  const boxShadow = stats.online
    ? `0 0 20px ${cat.glow}, inset 0 0 24px ${cat.glow.replace(/[\d.]+\)$/, '0.06)')}`
    : 'none';

  return (
    <motion.div
      className="cursor-pointer relative overflow-hidden select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        ...CELL_SIZE,
        background: isOffline ? 'rgba(20,20,30,0.6)' : cardBg,
        border: `1px solid ${isOffline ? 'rgba(239,68,68,0.35)' : cardBorder}`,
        filter: isOffline ? 'grayscale(0.6)' : 'none',
        boxShadow, opacity: 1,
      }}
      role="button"
      tabIndex={0}
      title={element.service || element.name}
      onClick={() => onClick(element)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(element); } }}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: prefersReducedMotion ? 0 : entryIndex * 0.03, ease: 'easeOut' }}
      whileHover={{ scale: 1.1, zIndex: 20, rotateY: 4, rotateX: -2 }}
    >
      {/* Top category strip */}
      <div style={{ height: 3, background: cat.border, opacity: 0.85 }} />

      {/* Atomic number / top-left label */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 8, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>

      {/* Status dot — WCAG 1.4.1: icon + aria-label, not color-only */}
      <div style={{ position: 'absolute', top: 4, right: 4 }}>
        <StatusDot online={stats.online} stale={stats.stale} size={8} />
      </div>

      {/* Electron orbits */}
      {stats.online && <ElectronOrbit shells={element.shells} catBorder={cat.border} />}

      {/* Symbol */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        <span style={{
          fontSize: 26, fontWeight: 700, color: cat.text, lineHeight: 1,
          textShadow: stats.online ? `0 0 14px ${cat.glow}` : 'none',
          fontFamily: 'sans-serif',
        }}>
          {cardDisplay?.centerLabel ?? element.symbol}
        </span>
      </div>

      {/* Service name */}
      <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 2, fontFamily: MONO, lineHeight: 1 }}>
        {cardDisplay?.displayName ?? element.service}
      </div>

      {/* Atomic mass / bottom label */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {cardDisplay?.bottomLabel ?? element.mass}
      </div>

    </motion.div>
  );
};

// ─────────────────────────────────────────────
// F-BLOCK PLACEHOLDER (lanthanide / actinide ref cell)
// ─────────────────────────────────────────────
const FBlockPlaceholder = ({ rangeLabel, seriesLabel, color, borderOpacity }) => (
  <div style={{
    ...CELL_SIZE,
    background: `${color}07`,
    border: `1px dashed ${color}${borderOpacity}`,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
  }}>
    <span style={{ fontSize: 9, color, opacity: 0.5,  fontFamily: MONO }}>{rangeLabel}</span>
    <span style={{ fontSize: 7, color, opacity: 0.35, fontFamily: MONO }}>{seriesLabel}</span>
  </div>
);

// Connection lines removed (NH-57) — dependency data still in serviceDependencies.js for detail panel cascade display

// Column stride = cell width (72px) + gap (2px)
const COL_STRIDE = 74;

// ─────────────────────────────────────────────
// ZONE LABELS (row 8 spacer annotations)
// ─────────────────────────────────────────────
const ZONE_SPANS = [
  { label: 'MEDIA',    startGroup: 3,  endGroup: 6,  color: '#55EFC4' },
  { label: 'LIBRARY',  startGroup: 7,  endGroup: 12, color: '#74B9FF' },
  { label: 'PIPELINE', startGroup: 13, endGroup: 17, color: '#FDCB6E' },
];

// ─────────────────────────────────────────────
// PERIODIC TABLE GRID
// ─────────────────────────────────────────────
const PeriodicTableGrid = ({ statsMap, onElementClick, elementRegistry: ELEMENT_REGISTRY, allElements: ALL_ELEMENTS, gridTitle, cardTransform }) => {
  // Build a set of positions occupied by services
  const servicePositions = new Set(ELEMENT_REGISTRY.map(e => `${e.period}-${e.group}`));

  // Collect all cells to render
  const cells = [];

  // Ghost cells from ALL_ELEMENTS (skip positions occupied by services)
  ALL_ELEMENTS.forEach(([sym, z, period, group, catKey]) => {
    const key = `${period}-${group}`;
    if (!servicePositions.has(key)) {
      cells.push({ key, period, group, isService: false, sym, catKey });
    }
  });

  // Service element cells (entryIdx drives staggered entry animation)
  ELEMENT_REGISTRY.forEach((el, entryIdx) => {
    cells.push({ key: `${el.period}-${el.group}`, period: el.period, group: el.group, isService: true, el, entryIdx });
  });

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: 'max-content', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(18, 72px)',
          gridTemplateRows: '80px 80px 80px 80px 80px 80px 80px 18px 80px 80px',
          gap: '2px',
          position: 'relative',
          zIndex: 10,
        }}>
          {/* Ghost + service cells */}
          {cells.map(cell => (
            <div key={cell.key} style={{ gridRow: cell.period, gridColumn: cell.group }}>
              {cell.isService
                ? <ElementCard element={cell.el} stats={statsMap[cell.el.id] || defaultStats()} onClick={onElementClick} cardDisplay={cardTransform?.(cell.el)} entryIndex={cell.entryIdx} />
                : <EmptyCell symbol={cell.sym} catKey={cell.catKey} />
              }
            </div>
          ))}

          {/* Period 6 col 3 — lanthanide placeholder */}
          <div key="la-ref" style={{ gridRow: 6, gridColumn: 3 }}>
            <FBlockPlaceholder rangeLabel="57–71" seriesLabel="La–Lu" color="#55EFC4" borderOpacity="40" />
          </div>

          {/* Period 7 col 3 — actinide placeholder */}
          <div key="ac-ref" style={{ gridRow: 7, gridColumn: 3 }}>
            <FBlockPlaceholder rangeLabel="89–103" seriesLabel="Ac–Lr" color="#FFEAA7" borderOpacity="33" />
          </div>

          {/* Row 8 spacer — zone labels */}
          <div style={{ gridRow: 8, gridColumn: '1 / span 18', display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.15)', fontFamily: MONO, letterSpacing: '0.3em', paddingLeft: 8, minWidth: (2 * COL_STRIDE) }}>
              {gridTitle || '◆ f-BLOCK SERIES ◆'}
            </span>
            {ZONE_SPANS.map(z => (
              <span key={z.label} style={{
                fontSize: 7, fontFamily: MONO, letterSpacing: '0.2em',
                color: z.color, opacity: 0.45,
                width: (z.endGroup - z.startGroup + 1) * COL_STRIDE,
                textAlign: 'center',
              }}>
                {z.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodicTableGrid;
