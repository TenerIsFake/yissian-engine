import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { VINYL_OVERLAY } from './vinylConfig.js';

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const VinylCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const overlay = VINYL_OVERLAY[element.id];

  const rpm        = overlay?.rpm        ?? '33';
  const catalogNum = overlay?.catalogNum ?? element.symbol;
  const genre      = overlay?.genre      ?? element.service ?? element.name;
  const displayName = (catalogNum.length > 10 ? catalogNum.slice(0, 9) + '…' : catalogNum).toUpperCase();

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
      {/* RPM top-left */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {rpm}
      </div>

      {/* Status dot top-right */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Vinyl record: 3 concentric groove rings + center spindle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14, position: 'relative', height: 28 }}>
        {/* Outer groove */}
        <div style={{ position: 'absolute', width: 26, height: 26, borderRadius: '50%', border: `1px solid ${cat.border}`, opacity: stats.online ? 0.6 : 0.1 }} />
        {/* Middle groove */}
        <div style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', border: `1px solid ${cat.border}`, opacity: stats.online ? 0.4 : 0.07 }} />
        {/* Label area */}
        <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', border: `1px solid ${cat.border}`, opacity: stats.online ? 0.55 : 0.1 }} />
        {/* Spindle hole */}
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: stats.online ? cat.text : 'rgba(255,255,255,0.1)',
          boxShadow: stats.online ? `0 0 6px ${cat.glow}` : 'none',
          position: 'relative', zIndex: 1,
        }} />
      </div>

      {/* Catalog number */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 3, fontFamily: MONO, lineHeight: 1 }}>
        {displayName}
      </div>

      {/* Genre bottom-center */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {genre}
      </div>
    </motion.div>
  );
};

export default VinylCard;
