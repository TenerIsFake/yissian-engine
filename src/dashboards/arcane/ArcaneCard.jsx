import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { ARCANE_OVERLAY } from './arcaneConfig.js';

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const ArcaneCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const overlay = ARCANE_OVERLAY[element.id];

  const runeSymbol = overlay?.runeSymbol ?? element.symbol;
  const tomeTitle  = overlay?.tomeTitle  ?? element.service ?? element.name;
  const shortName  = (tomeTitle.length > 10 ? tomeTitle.slice(0, 9) + '…' : tomeTitle).toUpperCase();

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
      {/* Tome type top-left */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {overlay?.tomeType ?? 'Tome'}
      </div>

      {/* Status dot top-right */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Rotated diamond border (replaces orbit) */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 32, height: 32,
        marginTop: -2,
        transform: 'translate(-50%, -50%) rotate(45deg)',
        border: `1px solid ${cat.border}`,
        opacity: 0.15,
        pointerEvents: 'none',
      }} />

      {/* Large rune glyph center */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14 }}>
        <span style={{
          fontFamily: 'serif',
          fontSize: 18,
          color: stats.online ? cat.text : 'rgba(255,255,255,0.2)',
          textShadow: stats.online ? `0 0 12px ${cat.glow}, 0 0 20px ${cat.glow.replace(/[\d.]+\)$/, '0.3)')}` : 'none',
          lineHeight: 1,
        }}>
          {runeSymbol}
        </span>
      </div>

      {/* Tome title below rune */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 3, fontFamily: MONO, lineHeight: 1 }}>
        {shortName}
      </div>

      {/* Access tier bottom-center */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {overlay?.accessTier ?? element.mass}
      </div>
    </motion.div>
  );
};

export default ArcaneCard;
