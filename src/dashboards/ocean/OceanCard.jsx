import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const OceanCard = ({ element, stats, onClick }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80,
        background: cat.bg,
        border: `1px solid ${cat.border}`,
        borderRadius: 3,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Bioluminescent pulse ring — aria-hidden, decorative */}
      {online && !prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 28, height: 28,
            borderRadius: '50%',
            border: `1px solid ${cat.border}`,
            opacity: 0,
          }}
          animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
          transition={{
            duration: 2.0 + level * 0.005,
            repeat: Infinity,
            ease: 'easeOut',
            repeatType: 'loop',
          }}
        />
      )}

      {/* Depth rings visual */}
      <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute', width: 30, height: 30, borderRadius: '50%',
          border: `1px solid ${online ? cat.border : 'rgba(255,255,255,0.10)'}`,
          opacity: online ? 0.40 : 0.15,
        }} />
        {/* Mid ring */}
        <div style={{
          position: 'absolute', width: 20, height: 20, borderRadius: '50%',
          border: `1px solid ${online ? cat.border : 'rgba(255,255,255,0.08)'}`,
          opacity: online ? 0.55 : 0.12,
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute', width: 10, height: 10, borderRadius: '50%',
          border: `1px solid ${online ? cat.border : 'rgba(255,255,255,0.06)'}`,
          opacity: online ? 0.70 : 0.10,
        }} />
        {/* Bioluminescent core */}
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: online ? cat.text : 'rgba(255,255,255,0.1)',
          boxShadow: online ? `0 0 8px ${cat.glow}, 0 0 16px ${cat.glow}` : 'none',
          position: 'relative', zIndex: 1,
        }} />
      </div>

      {/* Symbol */}
      <div style={{
        fontFamily: 'monospace', fontSize: 9, fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.25)',
        letterSpacing: '0.05em', lineHeight: 1,
      }}>
        {element.symbol}
      </div>

      {/* Atomic number */}
      <div style={{ position: 'absolute', top: 3, right: 4, fontFamily: 'monospace', fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>
        {element.z}
      </div>
    </motion.button>
  );
};

export default OceanCard;
