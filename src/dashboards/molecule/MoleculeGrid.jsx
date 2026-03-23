import React, { useMemo } from 'react';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { ALL_ELEMENTS } from '../sharedGridData.js';
import MoleculeCard from './MoleculeCard.jsx';

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const CELL_W = 72, CELL_H = 80, GAP = 2;

// T2-09: Explicit pixel height for the SVG bond overlay.
// The periodic table grid has 10 defined row tracks (7 element rows + 1 gap row + 2 series rows).
// Using height:'100%' on the absolute SVG caused clips in rows 9-10 (lanthanide/actinide)
// when the inner grid scroll container was taller than its parent.
// Row breakdown: rows 1-7 = CELL_H each, row 8 = 18px gap, rows 9-10 = CELL_H each → 10 tracks.
const GRID_ROWS = 10;
const GAP_ROW_HEIGHT = 18;
const SVG_H = 7 * (CELL_H + GAP) + GAP_ROW_HEIGHT + GAP + 2 * (CELL_H + GAP);

// T2-06: aria-hidden="true" on both placeholder types.
// The periodic table grid can contain 100+ InertAtom cells and 2 ReactionVesselPlaceholder
// cells. All are purely decorative — screen readers must skip them entirely and proceed
// to the interactive MoleculeCard elements.
const InertAtom = ({ catKey }) => {
  const cat = activeCATRef.current[catKey] || activeCATRef.current.NONMETAL;
  return (
    <div aria-hidden="true" style={{ ...CELL_SIZE, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.04 }}>
      <div style={{ width: 2, height: 2, borderRadius: '50%', background: cat.border }} />
    </div>
  );
};

const ReactionVesselPlaceholder = ({ rangeLabel, seriesLabel, color, borderOpacity }) => (
  <div aria-hidden="true" style={{
    ...CELL_SIZE, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    border: `1px dashed ${color}${borderOpacity}`, opacity: 0.5,
  }}>
    <span style={{ fontSize: 7, fontFamily: MONO, color, letterSpacing: '0.1em', textAlign: 'center' }}>{rangeLabel}</span>
    <span style={{ fontSize: 6, fontFamily: MONO, color: `${color}99`, marginTop: 2 }}>{seriesLabel}</span>
  </div>
);

// Convert grid position to pixel center coordinates
function gridToPixel(period, group) {
  return {
    x: (group - 1) * (CELL_W + GAP) + CELL_W / 2,
    y: (period <= 7 ? period - 1 : period) * (CELL_H + GAP) + CELL_H / 2,
  };
}

const MoleculeGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  // T2-02: servicePositions and cells moved into useMemo. Previously these ran on every
  // render (every stats poll), iterating 118 ALL_ELEMENTS entries and the full registry.
  // Now they recompute only when elementRegistry changes (not on stats updates).
  // ARCH REQUIREMENT: bonds useMemo must remain separate (depends on statsMap for online
  // state) — retained against simplifier recommendation to merge everything.
  const { servicePositions, cells } = useMemo(() => {
    const svcPos = new Set(elementRegistry.map(e => `${e.period}-${e.group}`));
    const cellArr = [];
    ALL_ELEMENTS.forEach(([sym, z, period, group, catKey]) => {
      const key = `${period}-${group}`;
      if (!svcPos.has(key)) cellArr.push({ key, period, group, isService: false, sym, catKey });
    });
    elementRegistry.forEach(el => {
      cellArr.push({ key: `${el.period}-${el.group}`, period: el.period, group: el.group, isService: true, el });
    });
    return { servicePositions: svcPos, cells: cellArr };
  }, [elementRegistry]);

  // Build bond connections: same cat group = connect to nearest neighbor in same row/column
  const bonds = useMemo(() => {
    const serviceCells = elementRegistry.map(el => ({
      el, period: el.period, group: el.group, cat: el.cat,
    }));
    const lines = [];
    // Group by cat, connect adjacent members
    const catGroups = {};
    serviceCells.forEach(s => {
      if (!catGroups[s.cat]) catGroups[s.cat] = [];
      catGroups[s.cat].push(s);
    });
    Object.values(catGroups).forEach(group => {
      for (let i = 0; i < group.length - 1; i++) {
        const a = group[i], b = group[i + 1];
        const pa = gridToPixel(a.period, a.group);
        const pb = gridToPixel(b.period, b.group);
        const dist = Math.hypot(pb.x - pa.x, pb.y - pa.y);
        if (dist < 450) { // Only connect reasonably close atoms
          lines.push({
            key: `${a.el.id}-${b.el.id}`,
            x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y,
            cat: a.cat,
            bothOnline: (statsMap[a.el.id]?.online ?? false) && (statsMap[b.el.id]?.online ?? false),
          });
        }
      }
    });
    return lines;
  }, [elementRegistry, statsMap]);

  const gridWidth = 18 * (CELL_W + GAP) - GAP;

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: gridWidth, margin: '0 auto' }}>

        {/* SVG bond overlay — absolutely positioned on top of grid */}
        {/* T2-09: height changed from '100%' to explicit SVG_H pixels to prevent
            lanthanide/actinide row clipping when the scroll container is larger. */}
        <svg style={{
          position: 'absolute', top: 0, left: 0,
          width: gridWidth, height: SVG_H,
          pointerEvents: 'none', zIndex: 10,
          overflow: 'visible',
        }}>
          {bonds.map(({ key, x1, y1, x2, y2, bothOnline }) => {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const off = 2.5;
            return (
              <g key={key}>
                {/* Single bond */}
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={bothOnline ? 'rgba(100,200,255,0.35)' : 'rgba(255,255,255,0.08)'}
                  strokeWidth="1.5" />
                {/* Double bond offset line for "bonded" active pairs */}
                {bothOnline && (
                  <line
                    x1={x1 + Math.sin(angle) * off} y1={y1 - Math.cos(angle) * off}
                    x2={x2 + Math.sin(angle) * off} y2={y2 - Math.cos(angle) * off}
                    stroke="rgba(100,200,255,0.2)" strokeWidth="1" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Periodic grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(18, ${CELL_W}px)`,
          gridTemplateRows: `${CELL_H}px ${CELL_H}px ${CELL_H}px ${CELL_H}px ${CELL_H}px ${CELL_H}px ${CELL_H}px 18px ${CELL_H}px ${CELL_H}px`,
          gap: `${GAP}px`,
        }}>
          {cells.map(cell => (
            <div key={cell.key} style={{ gridRow: cell.period, gridColumn: cell.group }}>
              {cell.isService
                ? <MoleculeCard element={cell.el} stats={statsMap[cell.el.id] || { level: 0, isBoiling: false, details: [], online: false }} onClick={onElementClick} />
                : <InertAtom catKey={cell.catKey} />
              }
            </div>
          ))}
          <div key="la-ref" style={{ gridRow: 6, gridColumn: 3 }}>
            <ReactionVesselPlaceholder rangeLabel="SERIES α" seriesLabel="57–71" color="#55EFC4" borderOpacity="40" />
          </div>
          <div key="ac-ref" style={{ gridRow: 7, gridColumn: 3 }}>
            <ReactionVesselPlaceholder rangeLabel="SERIES β" seriesLabel="89–103" color="#FFEAA7" borderOpacity="33" />
          </div>
          <div style={{ gridRow: 8, gridColumn: '1 / span 18', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
            <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.15)', fontFamily: MONO, letterSpacing: '0.3em' }}>
              ◆ MOLECULAR BOND DIAGRAM ◆
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoleculeGrid;
