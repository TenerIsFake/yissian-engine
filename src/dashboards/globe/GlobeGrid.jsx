import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import GlobeCard from './GlobeCard.jsx';
import { GLOBE_OVERLAY } from './globeConfig.js';
import GlobeWireframe3D from './GlobeWireframe3D.jsx';

const CARD_W = 64, CARD_H = 88;
const CW = 1300, CH = 660;
const MAP_PAD = { left: 20, right: 20, top: 20, bottom: 20 };

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Parse "45°N, 30°W" → { lat: 45, lon: -30 }
function parseCoords(coordStr) {
  if (!coordStr) return { lat: 0, lon: 0 };
  const m = coordStr.match(/([\d.]+)°([NS]),\s*([\d.]+)°([EW])/);
  if (!m) return { lat: 0, lon: 0 };
  const lat = parseFloat(m[1]) * (m[2] === 'S' ? -1 : 1);
  const lon = parseFloat(m[3]) * (m[4] === 'W' ? -1 : 1);
  return { lat, lon };
}

// Mercator projection
function mercator(lat, lon) {
  const mapW = CW - MAP_PAD.left - MAP_PAD.right;
  const mapH = CH - MAP_PAD.top - MAP_PAD.bottom;
  const x = MAP_PAD.left + ((lon + 180) / 360) * mapW;
  const y = MAP_PAD.top + ((90 - lat) / 180) * mapH;
  return { x, y };
}

function buildLayout(registry) {
  const raw = registry.map(el => {
    const ov = GLOBE_OVERLAY[el.id];
    const { lat, lon } = parseCoords(ov?.coordinates);
    const { x, y } = mercator(lat, lon);
    return {
      el, lat, lon,
      x: Math.max(MAP_PAD.left, Math.min(CW - CARD_W - MAP_PAD.right, x - CARD_W / 2)),
      y: Math.max(MAP_PAD.top, Math.min(CH - CARD_H - MAP_PAD.bottom, y - CARD_H / 2)),
    };
  });

  // T1-02: Services without a GLOBE_OVERLAY entry return lat:0, lon:0 from parseCoords,
  // which projects to the Gulf of Guinea (approx x=640, y=310). Multiple cards at the
  // exact same pixel make every card after the first unreachable. Apply a spread pass:
  // the first card at (0,0) stays; each subsequent one is offset by one card-width+gap
  // to the right, wrapping to a new row after 4 cards. This keeps them visible and
  // distinct without inventing fake geographic data.
  const originKey = (entry) => `${entry.x.toFixed(0)}-${entry.y.toFixed(0)}`;
  const seenOrigins = {};
  raw.forEach(entry => {
    const key = originKey(entry);
    if (!seenOrigins[key]) {
      seenOrigins[key] = 0;
    } else {
      const overflowIdx = seenOrigins[key]; // 1-based count of duplicates so far
      const cols = 4;
      const col = overflowIdx % cols;
      const row = Math.floor(overflowIdx / cols);
      entry.x = Math.min(
        CW - CARD_W - MAP_PAD.right,
        entry.x + col * (CARD_W + 8)
      );
      entry.y = Math.min(
        CH - CARD_H - MAP_PAD.bottom,
        entry.y + row * (CARD_H + 8)
      );
    }
    seenOrigins[key]++;
  });

  return raw;
}

// Build great-circle arcs for services in the same climate zone
function buildArcs(positions) {
  const climateGroups = {};
  positions.forEach(p => {
    const climate = GLOBE_OVERLAY[p.el.id]?.climate ?? 'Other';
    if (!climateGroups[climate]) climateGroups[climate] = [];
    climateGroups[climate].push(p);
  });
  const arcs = [];
  Object.values(climateGroups).forEach(group => {
    if (group.length < 2) return;
    for (let i = 0; i < group.length - 1; i++) {
      const a = group[i], b = group[i + 1];
      const x1 = a.x + CARD_W / 2, y1 = a.y + CARD_H / 2;
      const x2 = b.x + CARD_W / 2, y2 = b.y + CARD_H / 2;
      const cpx = (x1 + x2) / 2, cpy = Math.min(y1, y2) - 30;
      arcs.push({ key: `${a.el.id}-${b.el.id}`, x1, y1, x2, y2, cpx, cpy });
    }
  });
  return arcs;
}

const GlobeGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, cardTransform }) => {
  const positions = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const arcs = useMemo(() => buildArcs(positions), [positions]);

  // Graticule lines: every 30° lat and every 30° lon
  const graticule = useMemo(() => {
    const lines = [];
    for (let lat = -60; lat <= 90; lat += 30) {
      const y = MAP_PAD.top + ((90 - lat) / 180) * (CH - MAP_PAD.top - MAP_PAD.bottom);
      lines.push({ type: 'lat', y, label: `${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}` });
    }
    for (let lon = -150; lon <= 180; lon += 30) {
      const x = MAP_PAD.left + ((lon + 180) / 360) * (CW - MAP_PAD.left - MAP_PAD.right);
      lines.push({ type: 'lon', x, label: `${Math.abs(lon)}°${lon >= 0 ? 'E' : 'W'}` });
    }
    return lines;
  }, []);

  // Equator Y is a fixed calculation from constants — compute once outside render.
  const equatorY = MAP_PAD.top + (90 / 180) * (CH - MAP_PAD.top - MAP_PAD.bottom);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Ocean background */}
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,20,50,0.5) 0%, rgba(0,10,30,0.3) 100%)',
          borderRadius: 4 }} />

        {/* 3D wireframe globe centerpiece */}
        <div style={{ position: 'absolute', left: CW / 2 - 70, top: CH / 2 - 70, zIndex: 1, opacity: 0.4, pointerEvents: 'none' }}>
          <GlobeWireframe3D size={140} color="rgba(80,200,120,0.2)" />
        </div>

        {/* SVG: graticule + great circle arcs */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {/* Graticule lines */}
          {graticule.map((g, i) => g.type === 'lat'
            ? <line key={i} x1={MAP_PAD.left} y1={g.y} x2={CW - MAP_PAD.right} y2={g.y}
                stroke="rgba(255,255,255,0.05)" strokeWidth="0.7" strokeDasharray="3 8" />
            : <line key={i} x1={g.x} y1={MAP_PAD.top} x2={g.x} y2={CH - MAP_PAD.bottom}
                stroke="rgba(255,255,255,0.05)" strokeWidth="0.7" strokeDasharray="3 8" />
          )}
          {/* Equator — T3-05: replaced IIFE with pre-computed constant */}
          <line x1={MAP_PAD.left} y1={equatorY} x2={CW - MAP_PAD.right} y2={equatorY}
            stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {/* Great circle arcs */}
          {arcs.map(({ key, x1, y1, x2, y2, cpx, cpy }) => (
            <path key={key} d={`M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`}
              stroke="rgba(100,200,255,0.3)" strokeWidth="1.2" fill="none"
              strokeDasharray="5 4" />
          ))}
          {/* Arc endpoint dots */}
          {arcs.map(({ key, x1, y1, x2, y2 }) => (
            <g key={`dot-${key}`}>
              <circle cx={x1} cy={y1} r="3" fill="rgba(100,200,255,0.5)" />
              <circle cx={x2} cy={y2} r="3" fill="rgba(100,200,255,0.5)" />
            </g>
          ))}
          {/* Graticule lat labels */}
          {graticule.filter(g => g.type === 'lat').map((g, i) => (
            <text key={`lt-${i}`} x={MAP_PAD.left + 2} y={g.y - 2}
              fill="rgba(255,255,255,0.18)" fontSize="7" fontFamily="monospace">
              {g.label}
            </text>
          ))}
        </svg>

        {/* Service cards at Mercator coordinates */}
        {positions.map(({ el, x, y }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: x, top: y }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }}
            >
              <GlobeCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 6, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          {gridTitle || '◆ MERCATOR PROJECTION — WGS84 ◆'}
        </div>
      </div>
    </div>
  );
};

export default GlobeGrid;
