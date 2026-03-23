import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// FE-01: gate at level > 15 — avoids animating 19 idle GPU layers; prevents strobe on low-load services.
const EmberParticles = ({ level, color }) => {
  if (level <= 15 || prefersReducedMotion) return null;
  const count = level > 80 ? 4 : level > 50 ? 3 : 2;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 2, height: 2,
            borderRadius: '50%',
            background: color,
            left: `${18 + i * 16}%`,
            bottom: '22%',
          }}
          animate={{
            y: [0, -12, -20],
            opacity: [0.8, 0.4, 0],
            x: [0, i % 2 === 0 ? 3 : -3, i % 2 === 0 ? 5 : -5],
          }}
          transition={{ duration: 1.1 + i * 0.3, repeat: Infinity, ease: 'easeOut', delay: i * 0.45 }}
        />
      ))}
    </div>
  );
};

const ForgeCard = ({ element, stats, onClick }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 focus-visible:outline-offset-2"
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
      {/* Anvil visual */}
      <div style={{ position: 'relative', width: 30, height: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
        {/* Anvil horn */}
        <div style={{
          position: 'absolute', top: 0, left: 2,
          width: 9, height: 9,
          borderRadius: '0 4px 0 0',
          background: online ? cat.text : 'rgba(255,255,255,0.12)',
          opacity: online ? 0.65 : 0.18,
        }} />
        {/* Anvil body */}
        <div style={{
          width: 26, height: 12,
          borderRadius: '2px 2px 0 0',
          background: online ? cat.text : 'rgba(255,255,255,0.12)',
          opacity: online ? 0.70 : 0.18,
          boxShadow: online ? `0 0 8px ${cat.glow}` : 'none',
        }} />
        {/* Anvil base */}
        <div style={{
          width: 20, height: 6,
          background: online ? cat.text : 'rgba(255,255,255,0.08)',
          opacity: online ? 0.50 : 0.12,
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

      <EmberParticles level={level} color={cat.text} />
    </motion.button>
  );
};

export default ForgeCard;
