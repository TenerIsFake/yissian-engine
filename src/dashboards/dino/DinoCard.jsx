import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { DINO_OVERLAY } from './dinoConfig.js';

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const DinoCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const overlay = DINO_OVERLAY[element.id];

  const cladeAbbr = overlay?.cladeAbbr ?? element.symbol;
  const species   = overlay?.species   ?? element.service ?? element.name;
  const shortSpecies = species.split(' ')[0]; // first word only
  const displayName  = (shortSpecies.length > 10 ? shortSpecies.slice(0, 9) + '…' : shortSpecies).toUpperCase();

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
      {/* Clade abbreviation top-left */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {cladeAbbr}
      </div>

      {/* Status dot top-right */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Three claw marks */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 4 }}>
        {[-1, 0, 1].map(i => (
          <div key={i} style={{
            width: 2,
            height: 20,
            background: stats.online
              ? `linear-gradient(to bottom, ${cat.text}, ${cat.glow.replace(/[\d.]+\)$/, '0.0)')})`
              : 'rgba(255,255,255,0.08)',
            borderRadius: 1,
            transform: `rotate(${i * 14}deg)`,
            boxShadow: stats.online ? `0 0 4px ${cat.glow}` : 'none',
          }} />
        ))}
      </div>

      {/* Species first word */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 3, fontFamily: MONO, lineHeight: 1 }}>
        {displayName}
      </div>

      {/* Epoch bottom-center */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {overlay?.epoch ?? element.mass}
      </div>
    </motion.div>
  );
};

export default DinoCard;
