import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { SPACE_OVERLAY } from './spaceConfig.js';

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Reuse the same ElectronOrbit ring animation as ElementCard
const ElectronOrbit = ({ shells, catBorder }) => {
  const numRings = shells.length;
  const radii = Array.from({ length: numRings }, (_, i) => 8 + i * 5);
  const durations = Array.from({ length: numRings }, (_, i) => 0.8 + i * 0.9);
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ top: 3 }}>
      {Array.from({ length: numRings }, (_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: radii[i] * 2, height: radii[i] * 2,
          border: `0.5px solid ${catBorder}`, opacity: 0.3,
        }}>
          {prefersReducedMotion ? (
            <div className="absolute rounded-full" style={{
              width: 3, height: 3, background: catBorder,
              top: -1.5, left: '50%', marginLeft: -1.5,
            }} />
          ) : (
            <motion.div className="absolute rounded-full" style={{
              width: 3, height: 3, background: catBorder,
              top: -1.5, left: '50%', marginLeft: -1.5,
              transformOrigin: `1.5px ${radii[i]}px`,
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

const StarCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const overlay = SPACE_OVERLAY[element.id];

  // Use space overlay values when available, fall back to element values
  const designation = overlay?.designation ?? element.symbol;
  const displayName = overlay?.stellarName ?? element.service ?? element.name;
  const spectralType = overlay?.spectralType ?? element.mass;

  // Short display name — use service name if overlay not available
  const shortName = (displayName.length > 10 ? displayName.slice(0, 9) + '…' : displayName).toUpperCase();

  const cardBg = cat.bg;
  const cardBorder = `${cat.border}4D`;
  const boxShadow = stats.online
    ? `0 0 12px ${cat.glow}, inset 0 0 24px ${cat.glow.replace(/[\d.]+\)$/, '0.04)')}`
    : 'none';

  const dotColor = isOffline ? '#ef4444' : '#22c55e';

  return (
    <motion.div
      className="cursor-pointer relative overflow-hidden select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        ...CELL_SIZE,
        background: isOffline ? 'rgba(20,20,30,0.6)' : cardBg,
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
      whileHover={{ scale: 1.1, zIndex: 20 }}
    >
      {/* Designation top-left (replaces atomic number) */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {designation}
      </div>

      {/* Status dot top-right */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Electron orbits (unchanged from chemistry mode) */}
      {stats.online && <ElectronOrbit shells={element.shells} catBorder={cat.border} />}

      {/* Star glow circle (replaces element symbol) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: stats.online
            ? `radial-gradient(circle at 40% 40%, ${cat.text}, ${cat.glow.replace(/[\d.]+\)$/, '0.3)')} 60%, transparent)`
            : 'rgba(255,255,255,0.08)',
          boxShadow: stats.online ? `0 0 10px ${cat.glow}, 0 0 20px ${cat.glow.replace(/[\d.]+\)$/, '0.2)')}` : 'none',
        }} />
      </div>

      {/* Stellar name below star */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 3, fontFamily: MONO, lineHeight: 1 }}>
        {shortName}
      </div>

      {/* Spectral type bottom-center (replaces atomic mass) */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {spectralType}
      </div>
    </motion.div>
  );
};

export default StarCard;
