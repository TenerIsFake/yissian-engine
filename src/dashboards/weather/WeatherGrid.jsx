import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import WeatherCard from './WeatherCard.jsx';
import { WEATHER_OVERLAY } from './weatherConfig.js';

const CARD_W = 72, CARD_H = 80;
const CW = 1300, CH = 760;
const PAD = 30;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Fixed "weather station" positions as % of container
// Arranged loosely like a synoptic map — higher pressure zones upper-left, lows lower-right
const STATION_POSITIONS = [
  { x: 0.08, y: 0.12 }, { x: 0.22, y: 0.08 }, { x: 0.38, y: 0.14 },
  { x: 0.55, y: 0.10 }, { x: 0.72, y: 0.15 }, { x: 0.88, y: 0.08 },
  { x: 0.05, y: 0.38 }, { x: 0.20, y: 0.45 }, { x: 0.36, y: 0.40 },
  { x: 0.52, y: 0.48 }, { x: 0.70, y: 0.42 }, { x: 0.86, y: 0.38 },
  { x: 0.12, y: 0.68 }, { x: 0.28, y: 0.75 }, { x: 0.46, y: 0.70 },
  { x: 0.64, y: 0.72 }, { x: 0.80, y: 0.68 }, { x: 0.92, y: 0.75 },
];

function buildLayout(registry) {
  return registry.map((el, i) => {
    const basePos = STATION_POSITIONS[i % STATION_POSITIONS.length];
    let baseX = Math.max(PAD, Math.min(CW - CARD_W - PAD, basePos.x * CW - CARD_W / 2));
    let baseY = Math.max(PAD, Math.min(CH - CARD_H - PAD, basePos.y * CH - CARD_H / 2));

    // T1-03: When i >= STATION_POSITIONS.length (>=19 services), pure modulo places the
    // 19th card at exactly the same pixel as the 1st, hiding it completely. Apply a
    // deterministic tile offset so overflow cards are visible alongside their base slot.
    // Using a 3-column grid offset keeps overflow cards near their base position.
    if (i >= STATION_POSITIONS.length) {
      const overflowIdx = i - STATION_POSITIONS.length;
      const col = overflowIdx % 3;
      const row = Math.floor(overflowIdx / 3);
      baseX = Math.min(CW - CARD_W - PAD, baseX + col * (CARD_W + 6));
      baseY = Math.min(CH - CARD_H - PAD, baseY + row * (CARD_H + 6));
    }

    return {
      el,
      x: baseX,
      y: baseY,
      barometric: WEATHER_OVERLAY[el.id]?.barometric ?? '1013 hPa',
      windSpeed: WEATHER_OVERLAY[el.id]?.windSpeed ?? '0 kt',
    };
  });
}

// Parse barometric pressure for isobar grouping
function parsePressure(str) {
  const m = (str ?? '').match(/([\d]+)/);
  return m ? parseInt(m[1]) : 1013;
}

// T3-04: Comment corrected — threshold is ±20 hPa (was documented as ±15 hPa but code used 20).
// Build isobar-like paths between stations with similar pressure (within ±20 hPa)
function buildIsobars(layout) {
  const sorted = [...layout].sort((a, b) => parsePressure(a.barometric) - parsePressure(b.barometric));
  const lines = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    const pa = parsePressure(a.barometric), pb = parsePressure(b.barometric);
    if (Math.abs(pa - pb) > 20) continue;
    const ax = a.x + CARD_W / 2, ay = a.y + CARD_H / 2;
    const bx = b.x + CARD_W / 2, by = b.y + CARD_H / 2;
    const mx = (ax + bx) / 2, my = (ay + by) / 2 + 15;
    lines.push({ key: `${a.el.id}-${b.el.id}`, ax, ay, bx, by, mx, my, pressure: pa });
  }
  return lines;
}

// Wind barb direction arrow
const WindBarb = ({ x, y, speed, color }) => {
  const knots = parseInt((speed ?? '0').match(/\d+/)?.[0] ?? 0);
  const angle = (x + y) % 360; // deterministic "direction" from position
  const len = 14 + Math.min(knots / 3, 16);
  const rad = (angle * Math.PI) / 180;
  const x2 = x + Math.cos(rad) * len;
  const y2 = y + Math.sin(rad) * len;
  return (
    <g>
      <line x1={x} y1={y} x2={x2} y2={y2}
        stroke={color} strokeWidth="1.2" opacity="0.4" />
      {/* Barb head */}
      <polygon
        points={`${x2},${y2} ${x2 - Math.cos(rad + 0.5) * 5},${y2 - Math.sin(rad + 0.5) * 5} ${x2 - Math.cos(rad - 0.5) * 5},${y2 - Math.sin(rad - 0.5) * 5}`}
        fill={color} opacity="0.35" />
    </g>
  );
};

const WeatherGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, cardTransform }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);
  const isobars = useMemo(() => buildIsobars(layout), [layout]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Synoptic map background grid */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {/* Horizontal pressure lines */}
          {[0.2, 0.4, 0.6, 0.8].map((y, i) => (
            <line key={`h-${i}`} x1={0} y1={y * CH} x2={CW} y2={y * CH}
              stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" strokeDasharray="8 12" />
          ))}
          {/* Vertical longitude lines */}
          {[0.2, 0.4, 0.6, 0.8].map((x, i) => (
            <line key={`v-${i}`} x1={x * CW} y1={0} x2={x * CW} y2={CH}
              stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" strokeDasharray="8 12" />
          ))}

          {/* Isobar contour lines */}
          {isobars.map(({ key, ax, ay, bx, by, mx, my, pressure }) => {
            const warmFront = pressure < 1000;
            return (
              <path key={key}
                d={`M${ax},${ay} Q${mx},${my} ${bx},${by}`}
                stroke={warmFront ? 'rgba(255,100,100,0.25)' : 'rgba(100,150,255,0.25)'}
                strokeWidth="1.5" fill="none"
                strokeDasharray={warmFront ? undefined : '6 4'} />
            );
          })}

          {/* Wind barbs at each station */}
          {layout.map(({ el, x, y, windSpeed }) => {
            const stats = statsMap[el.id] || { online: false };
            const cat = activeCATRef.current[el.cat] ?? activeCATRef.current.TRANSITION;
            if (!stats.online) return null;
            return (
              <WindBarb key={el.id}
                x={x + CARD_W / 2} y={y + CARD_H / 2}
                speed={windSpeed}
                color={cat.border} />
            );
          })}

          {/* Station dots */}
          {layout.map(({ el, x, y }) => (
            <circle key={`dot-${el.id}`} cx={x + CARD_W / 2} cy={y + CARD_H / 2} r="2"
              fill="rgba(255,255,255,0.12)" />
          ))}
        </svg>

        {/* Weather station cards */}
        {layout.map(({ el, x, y }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: x, top: y }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }}
            >
              <WeatherCard element={el} stats={stats} onClick={onElementClick} cardDisplay={cardTransform?.(el)} />
            </motion.div>
          );
        })}

        {/* Pressure indicators */}
        <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 8, fontFamily: 'monospace',
          color: 'rgba(100,150,255,0.4)', letterSpacing: '0.2em', pointerEvents: 'none' }}>
          H 1020+
        </div>
        <div style={{ position: 'absolute', bottom: 28, right: 80, fontSize: 8, fontFamily: 'monospace',
          color: 'rgba(255,100,100,0.4)', letterSpacing: '0.2em', pointerEvents: 'none' }}>
          L 980–
        </div>

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          {gridTitle || '◆ SYNOPTIC ANALYSIS — SURFACE ◆'}
        </div>
      </div>
    </div>
  );
};

export default WeatherGrid;
