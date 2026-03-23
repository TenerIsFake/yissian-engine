import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { PLANET_OVERLAY } from './planetConfig.js';

// T1-02: prefersReducedMotion guard — PlanetGrid runs continuous CSS orbital animations;
// whileHover must also respect reduced-motion to avoid compounding vestibular stimulus.
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const PlanetCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const overlay = PLANET_OVERLAY[element.id];

  const orbitalClass = overlay?.orbitalClass ?? element.symbol;
  const planetName   = overlay?.planetName   ?? element.service ?? element.name;
  const displayName  = (planetName.length > 10 ? planetName.slice(0, 9) + '…' : planetName).toUpperCase();

  const boxShadow = stats.online
    ? `0 0 12px ${cat.glow}, inset 0 0 24px ${cat.glow.replace(/[\d.]+\)$/, '0.04)')}`
    : 'none';
  const dotColor = isOffline ? '#ef4444' : '#22c55e';

  return (
    <motion.div
      className="cursor-pointer relative overflow-hidden select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        ...CELL_SIZE,
        background: isOffline ? 'rgba(20,20,30,0.6)' : cat.bg,
        border: `1px solid ${isOffline ? 'rgba(239,68,68,0.35)' : `${cat.border}66`}`,
        filter: isOffline ? 'grayscale(0.6)' : 'none',
        boxShadow,
        opacity: 1,
      }}
      role="button"
      tabIndex={0}
      title={element.service || element.name}
      onClick={() => onClick(element)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(element); } }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.1, zIndex: 20 }}
    >
      {/* Orbital class top-left */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 6, fontFamily: MONO, color: cat.text, opacity: 0.8, lineHeight: 1.2 }}>
        {orbitalClass.split(' ')[0]}
      </div>

      {/* Status dot top-right */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Planet body with elliptical ring */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14, position: 'relative', height: 28 }}>
        {/* Equatorial ring (ellipse rotated ~20°) */}
        <div style={{
          position: 'absolute',
          width: 34, height: 10,
          border: `1px solid ${cat.border}`,
          borderRadius: '50%',
          opacity: stats.online ? 0.55 : 0.12,
          transform: 'rotate(-20deg)',
          pointerEvents: 'none',
        }} />
        {/* Planet sphere */}
        <div style={{
          width: 18, height: 18, borderRadius: '50%',
          background: stats.online
            ? `radial-gradient(circle at 35% 35%, ${cat.text}CC, ${cat.glow.replace(/[\d.]+\)$/, '0.35)')} 60%, transparent)`
            : 'rgba(255,255,255,0.08)',
          boxShadow: stats.online ? `0 0 10px ${cat.glow}` : 'none',
          position: 'relative', zIndex: 1,
        }} />
      </div>

      {/* Planet name */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 3, fontFamily: MONO, lineHeight: 1 }}>
        {displayName}
      </div>

      {/* Atmosphere bottom-center */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {overlay?.atmosphere ?? element.mass}
      </div>
    </motion.div>
  );
};

export default PlanetCard;
