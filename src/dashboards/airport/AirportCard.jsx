import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import StatusDot from '../../components/StatusDot.jsx';
const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };

const AirportCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;

  const icao        = cardDisplay?.topLeft ?? element.symbol;
  const flightDesig = cardDisplay?.displayName ?? element.service ?? element.name;
  const displayName = (flightDesig.length > 10 ? flightDesig.slice(0, 9) + '…' : flightDesig).toUpperCase();

  const boxShadow = stats.online
    ? `0 0 12px ${cat.glow}, inset 0 0 24px ${cat.glow.replace(/[\d.]+\)$/, '0.04)')}`
    : 'none';

  // Boarding pass silhouette — notched at sides, cut corners
  const clipPath = 'polygon(4% 0%, 96% 0%, 100% 4%, 100% 42%, 96% 50%, 100% 58%, 100% 96%, 96% 100%, 4% 100%, 0% 96%, 0% 58%, 4% 50%, 0% 42%, 0% 4%)';

  return (
    <motion.div
      className="cursor-pointer relative select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        ...CELL_SIZE,
        borderRadius: 0,
        clipPath,
        background: isOffline ? 'rgba(20,20,30,0.6)' : cat.bg,
        filter: isOffline ? 'grayscale(0.6)' : 'none',
        boxShadow,
        opacity: 1,
      }}
      role="button"
      tabIndex={0}
      title={element.service || element.name}
      onClick={() => onClick(element)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(element); } }}
      whileHover={{ scale: 1.1, zIndex: 20, rotateY: 2, rotateX: -1 }}
    >
      {/* Boarding pass border overlay */}
      <div style={{
        position: 'absolute', inset: 0, clipPath,
        border: `1px solid ${isOffline ? 'rgba(239,68,68,0.35)' : `${cat.border}66`}`,
        pointerEvents: 'none',
      }} />

      {/* Dashed perforation line at 72% width */}
      <div style={{
        position: 'absolute', top: 4, bottom: 4, left: '72%',
        borderLeft: `1px dashed ${isOffline ? 'rgba(255,255,255,0.08)' : `${cat.border}33`}`,
        pointerEvents: 'none',
      }} />

      {/* ICAO code top-left */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {icao}
      </div>

      {/* Status dot top-right — WCAG 1.4.1 */}
      <div style={{ position: 'absolute', top: 4, right: 4 }}>
        <StatusDot online={stats.online} stale={stats.stale} size={8} />
      </div>

      {/* Airplane symbol — rotated 45° for takeoff angle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        <span style={{
          fontSize: 18,
          color: stats.online ? cat.text : 'rgba(255,255,255,0.12)',
          textShadow: stats.online ? `0 0 12px ${cat.glow}, 0 0 20px ${cat.glow.replace(/[\d.]+\)$/, '0.3)')}` : 'none',
          lineHeight: 1,
          transform: 'rotate(-45deg)',
          display: 'inline-block',
        }}>
          ✈
        </span>
      </div>

      {/* Flight designation */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 4, fontFamily: MONO, lineHeight: 1 }}>
        {displayName}
      </div>

      {/* Gate info bottom-center */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {cardDisplay?.bottomLabel ?? element.mass}
      </div>
    </motion.div>
  );
};

export default AirportCard;
