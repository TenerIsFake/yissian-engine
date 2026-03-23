import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { BIO_OVERLAY } from './bioConfig.js';

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Reuse ElectronOrbit visual as "cell membrane" rings
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

const BioCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const overlay = BIO_OVERLAY[element.id];

  const bioSymbol     = overlay?.bioSymbol     ?? element.symbol;
  const organelleName = overlay?.organelleName ?? element.service ?? element.name;
  const shortName     = (organelleName.length > 10 ? organelleName.slice(0, 9) + '…' : organelleName).toUpperCase();

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
      whileHover={{ scale: 1.1, zIndex: 20 }}
    >
      {/* Bio symbol top-left */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {bioSymbol}
      </div>

      {/* Status dot top-right */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Electron orbits reused as cell membrane rings */}
      {stats.online && <ElectronOrbit shells={element.shells} catBorder={cat.border} />}

      {/* Double-ring cell center */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14, position: 'relative' }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute',
          width: 24, height: 24,
          borderRadius: '50%',
          border: `1.5px solid ${stats.online ? cat.border : 'rgba(255,255,255,0.1)'}`,
          opacity: stats.online ? 0.7 : 0.3,
        }} />
        {/* Inner filled nucleus */}
        <div style={{
          width: 12, height: 12,
          borderRadius: '50%',
          background: stats.online
            ? `radial-gradient(circle at 40% 40%, ${cat.text}, ${cat.glow.replace(/[\d.]+\)$/, '0.4)')})`
            : 'rgba(255,255,255,0.08)',
          boxShadow: stats.online ? `0 0 8px ${cat.glow}` : 'none',
        }} />
      </div>

      {/* Organelle name below cell */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 3, fontFamily: MONO, lineHeight: 1 }}>
        {shortName}
      </div>

      {/* Organelle type bottom-center */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {overlay?.organelleType ?? element.mass}
      </div>
    </motion.div>
  );
};

export default BioCard;
