import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const SIZE = 66;
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const VinylCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;

  const rpm        = cardDisplay?.topLeft ?? '33';
  const catalogNum = cardDisplay?.centerLabel ?? element.symbol;
  const displayName = element.service ?? element.name;
  const shortName = displayName.length > 8 ? displayName.slice(0, 7) + '…' : displayName;

  const bgColor = isOffline ? 'rgba(20,20,30,0.85)' : 'rgba(15,15,20,0.92)';
  const grooveColor = isOffline ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)';
  const labelBg = isOffline ? 'rgba(40,40,50,0.6)' : cat.bg;
  const labelBorder = isOffline ? 'rgba(239,68,68,0.3)' : cat.border;
  const textColor = isOffline ? 'rgba(255,255,255,0.3)' : cat.text;
  const glowColor = stats.online ? cat.glow : 'transparent';

  const labelR = SIZE * 0.175; // ~11.5px radius for center label
  const half = SIZE / 2;

  // Groove ring radii (4 concentric rings between label and edge)
  const grooveRadii = [0.38, 0.52, 0.66, 0.80].map(f => SIZE * f * 0.5);

  return (
    <motion.button
      className="relative select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: '50%',
        background: bgColor,
        border: `1px solid ${isOffline ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
        filter: isOffline ? 'grayscale(0.6)' : 'none',
        boxShadow: stats.online
          ? `0 0 10px ${glowColor}, inset 0 0 20px rgba(0,0,0,0.5)`
          : 'inset 0 0 20px rgba(0,0,0,0.5)',
        overflow: 'visible',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label={`${element.service ?? element.name} — ${stats.online ? 'online' : 'offline'}`}
      tabIndex={0}
      title={element.service || element.name}
      onClick={() => onClick(element)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(element); } }}
      whileHover={{ scale: 1.12, zIndex: 20, rotateY: 7, rotateX: -3 }}
    >
      {/* Spin wrapper — rotates the grooves + surface when online */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
        }}
        animate={stats.online && !prefersReducedMotion ? { rotate: 360 } : {}}
        transition={stats.online && !prefersReducedMotion ? { duration: 8, repeat: Infinity, ease: 'linear' } : {}}
      >
        {/* Groove rings */}
        {grooveRadii.map((r, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: half - r,
            top: half - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: `0.5px solid ${grooveColor}`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Alternating subtle opacity bands (groove texture) */}
        {[0.44, 0.58, 0.72].map((f, i) => {
          const r = SIZE * f * 0.5;
          return (
            <div key={`band-${i}`} style={{
              position: 'absolute',
              left: half - r,
              top: half - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, transparent 85%, rgba(255,255,255,0.02) 100%)`,
              pointerEvents: 'none',
            }} />
          );
        })}

        {/* Light reflection arc — thin white highlight at ~30° */}
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ position: 'absolute', inset: 0, width: SIZE, height: SIZE, pointerEvents: 'none' }}
        >
          <path
            d={describeArc(half, half, SIZE * 0.37, -60, -20)}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d={describeArc(half, half, SIZE * 0.28, -55, -25)}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      {/* Center label (does NOT spin) */}
      <div style={{
        position: 'absolute',
        left: half - labelR,
        top: half - labelR,
        width: labelR * 2,
        height: labelR * 2,
        borderRadius: '50%',
        background: labelBg,
        border: `1.5px solid ${labelBorder}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        overflow: 'hidden',
      }}>
        {/* Catalog number */}
        <div style={{
          fontSize: 6.5,
          fontFamily: MONO,
          color: textColor,
          lineHeight: 1,
          letterSpacing: '0.02em',
          textAlign: 'center',
          opacity: 0.9,
        }}>
          {catalogNum.length > 5 ? catalogNum.slice(0, 5) : catalogNum}
        </div>
        {/* Short display name */}
        <div style={{
          fontSize: 4.5,
          fontFamily: MONO,
          color: textColor,
          lineHeight: 1,
          marginTop: 1,
          opacity: 0.6,
          textAlign: 'center',
        }}>
          {shortName}
        </div>
      </div>

      {/* Spindle hole — bright dot at exact center */}
      <div style={{
        position: 'absolute',
        left: half - 1.5,
        top: half - 1.5,
        width: 3,
        height: 3,
        borderRadius: '50%',
        background: stats.online ? textColor : 'rgba(255,255,255,0.15)',
        boxShadow: stats.online ? `0 0 4px ${glowColor}` : 'none',
        zIndex: 3,
      }} />

      {/* RPM tiny text at label edge (upper-left of label) */}
      <div style={{
        position: 'absolute',
        left: half - labelR + 1,
        top: half - labelR - 7,
        fontSize: 5,
        fontFamily: MONO,
        color: textColor,
        opacity: 0.45,
        zIndex: 4,
      }}>
        {rpm}
      </div>

      {/* Tone arm hint — faint angled line from upper-right, only when online */}
      {stats.online && (
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ position: 'absolute', inset: 0, width: SIZE, height: SIZE, pointerEvents: 'none', zIndex: 1 }}
        >
          <line
            x1={SIZE * 0.88}
            y1={SIZE * 0.05}
            x2={SIZE * 0.58}
            y2={SIZE * 0.35}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          {/* Tone arm head (small crossbar at contact point) */}
          <line
            x1={SIZE * 0.56}
            y1={SIZE * 0.34}
            x2={SIZE * 0.60}
            y2={SIZE * 0.38}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      )}
    </motion.button>
  );
};

/** Helper: SVG arc path between two angles (degrees) */
function describeArc(cx, cy, r, startAngle, endAngle) {
  const toRad = (a) => (a * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2}`;
}

export default VinylCard;
