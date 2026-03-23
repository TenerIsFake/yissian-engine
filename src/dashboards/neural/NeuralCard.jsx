import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { NEURAL_OVERLAY } from './neuralConfig.js';

const MONO = 'monospace';
const CELL_SIZE = { width: 72, height: 80, borderRadius: 6 };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Pulsing ring (replaces ElectronOrbit — no orbiting electrons, just a breathing ring)
const PulsingRing = ({ catBorder, online }) => {
  if (!online || prefersReducedMotion) return null;
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ top: 3 }}>
      <motion.div
        style={{
          width: 36, height: 36,
          borderRadius: '50%',
          border: `1px solid ${catBorder}`,
          opacity: 0,
        }}
        animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

const NeuralCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const overlay = NEURAL_OVERLAY[element.id];

  const nodeId   = overlay?.nodeId   ?? element.symbol;
  const nodeName = overlay?.nodeName ?? element.service ?? element.name;
  const shortName = (nodeName.length > 10 ? nodeName.slice(0, 9) + '…' : nodeName).toUpperCase();

  const boxShadow = stats.online
    ? `0 0 12px ${cat.glow}, inset 0 0 24px ${cat.glow.replace(/[\d.]+\)$/, '0.04)')}`
    : 'none';
  const dotColor = isOffline ? '#ef4444' : '#22c55e';

  // Hexagon clip-path polygon
  const hexClip = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

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
      {/* Node ID top-left */}
      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.8 }}>
        {nodeId}
      </div>

      {/* Status dot top-right */}
      <div style={{ position: 'absolute', top: 6, right: 6, ...STATUS_DOT_BASE, background: dotColor, boxShadow: `0 0 4px ${dotColor}` }} />

      {/* Pulsing ring (replaces ElectronOrbit) */}
      <PulsingRing catBorder={cat.border} online={stats.online} />

      {/* Hexagon center */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 14 }}>
        <div style={{
          width: 24,
          height: 24,
          clipPath: hexClip,
          background: stats.online
            ? `linear-gradient(135deg, ${cat.text}CC, ${cat.glow.replace(/[\d.]+\)$/, '0.4)')})`
            : 'rgba(255,255,255,0.08)',
          boxShadow: stats.online ? `0 0 8px ${cat.glow}` : 'none',
        }} />
      </div>

      {/* Node name below hex */}
      <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.03em', marginTop: 3, fontFamily: MONO, lineHeight: 1 }}>
        {shortName}
      </div>

      {/* Node class bottom-center */}
      <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 7, fontFamily: MONO, color: cat.text, opacity: 0.55 }}>
        {overlay?.nodeClass ?? element.mass}
      </div>
    </motion.div>
  );
};

export default NeuralCard;
