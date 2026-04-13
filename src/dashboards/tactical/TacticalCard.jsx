import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Shield / hexagonal badge shape
const SHIELD_CLIP = `polygon(
  50% 0%,
  100% 20%,
  100% 70%,
  50% 100%,
  0% 70%,
  0% 20%
)`;

const ScanLine = ({ level, color }) => {
  if (level <= 15 || prefersReducedMotion) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.3, pointerEvents: 'none',
      }}
      animate={{ top: ['20%', '80%', '20%'] }}
      transition={{ duration: level > 60 ? 1.5 : 3, repeat: Infinity, ease: 'linear' }}
    />
  );
};

const TacticalCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;

  const glowOpacity = online ? Math.min(0.5, 0.08 + level * 0.004) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: -3, rotateX: 2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80, transformPerspective: 800,
        background: cat.bg,
        clipPath: SHIELD_CLIP,
        cursor: 'pointer', padding: 0,
        position: 'relative', overflow: 'visible',
        border: 'none', display: 'block',
      }}
    >
      {/* Threat-level glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: online
          ? `radial-gradient(ellipse at 50% 30%, ${cat.glow ?? cat.text} 0%, transparent 70%)`
          : 'none',
        opacity: glowOpacity, pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
      }} />

      {/* Top edge highlight */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '2%', left: '25%', right: '25%', height: '6%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
        opacity: online ? 0.2 : 0.06, pointerEvents: 'none',
      }} />

      {/* Callsign / top label */}
      <div style={{
        position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 7, fontWeight: 600,
        color: online ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>

      {/* Symbol — center */}
      <div style={{
        position: 'absolute', top: '42%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.2)',
        letterSpacing: '0.04em', lineHeight: 1, pointerEvents: 'none',
        textShadow: online && level > 40 ? `0 0 6px ${cat.glow ?? cat.text}` : 'none',
      }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>

      {/* Service name */}
      <div style={{
        position: 'absolute', top: '62%', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 6, fontWeight: 500,
        color: online ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
        maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {cardDisplay?.displayName ?? element.service ?? element.name}
      </div>

      <ScanLine level={level} color={cat.text} />
    </motion.button>
  );
};

export default TacticalCard;
