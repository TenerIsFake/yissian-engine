import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { MOLECULE_OVERLAY } from './moleculeConfig.js';

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const MoleculeCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const overlay = MOLECULE_OVERLAY[element.id];

  const formula     = overlay?.formula      ?? element.symbol;
  const shortName   = overlay?.compoundName ?? element.service ?? element.name;
  const displayName = (shortName.length > 10 ? shortName.slice(0, 9) + '…' : shortName).toUpperCase();

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
      {/* Formula top-left */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {formula}
      </div>

      {/* Status dot top-right */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Molecule cross: center nucleus + 4 bond arms + 4 orbital atoms */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12, position: 'relative', height: 28 }}>
        {/* North arm */}
        <div style={{ position: 'absolute', width: 1, height: 12, background: cat.border, opacity: 0.45, top: 0, left: '50%', marginLeft: -0.5 }} />
        {/* South arm */}
        <div style={{ position: 'absolute', width: 1, height: 12, background: cat.border, opacity: 0.45, bottom: 0, left: '50%', marginLeft: -0.5 }} />
        {/* West arm */}
        <div style={{ position: 'absolute', width: 12, height: 1, background: cat.border, opacity: 0.45, left: 2, top: '50%', marginTop: -0.5 }} />
        {/* East arm */}
        <div style={{ position: 'absolute', width: 12, height: 1, background: cat.border, opacity: 0.45, right: 2, top: '50%', marginTop: -0.5 }} />
        {/* Center nucleus */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: stats.online ? cat.text : 'rgba(255,255,255,0.1)',
          boxShadow: stats.online ? `0 0 8px ${cat.glow}` : 'none',
          position: 'relative', zIndex: 1,
        }} />
        {/* Orbital atom: top */}
        <div style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -2.5, width: 5, height: 5, borderRadius: '50%', border: `1px solid ${cat.border}`, background: stats.online ? `${cat.border}66` : 'transparent', opacity: stats.online ? 1 : 0.2 }} />
        {/* Orbital atom: bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: '50%', marginLeft: -2.5, width: 5, height: 5, borderRadius: '50%', border: `1px solid ${cat.border}`, background: stats.online ? `${cat.border}66` : 'transparent', opacity: stats.online ? 1 : 0.2 }} />
        {/* Orbital atom: left */}
        <div style={{ position: 'absolute', left: 2, top: '50%', marginTop: -2.5, width: 5, height: 5, borderRadius: '50%', border: `1px solid ${cat.border}`, background: stats.online ? `${cat.border}66` : 'transparent', opacity: stats.online ? 1 : 0.2 }} />
        {/* Orbital atom: right */}
        <div style={{ position: 'absolute', right: 2, top: '50%', marginTop: -2.5, width: 5, height: 5, borderRadius: '50%', border: `1px solid ${cat.border}`, background: stats.online ? `${cat.border}66` : 'transparent', opacity: stats.online ? 1 : 0.2 }} />
      </div>

      {/* Compound name */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 3, fontFamily: MONO, lineHeight: 1 }}>
        {displayName}
      </div>

      {/* Bond type bottom-center */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {overlay?.bondType ?? element.mass}
      </div>
    </motion.div>
  );
};

export default MoleculeCard;
