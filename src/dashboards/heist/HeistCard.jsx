import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Diamond / gem cut shape — like a heist target
const DIAMOND_CLIP = `polygon(
  50% 0%,
  85% 15%,
  100% 50%,
  85% 85%,
  50% 100%,
  15% 85%,
  0% 50%,
  15% 15%
)`;

const LaserSweep = ({ level, color }) => {
  if (level <= 20 || prefersReducedMotion) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        opacity: 0.25, pointerEvents: 'none',
      }}
      animate={{ top: ['15%', '85%', '15%'] }}
      transition={{ duration: level > 60 ? 2 : 4, repeat: Infinity, ease: 'linear' }}
    />
  );
};

const HeistCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;
  const glowOpacity = online ? Math.min(0.5, 0.08 + level * 0.004) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: 6, rotateX: -3 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400 focus-visible:outline-offset-2"
      style={{ width: 72, height: 80, transformPerspective: 800, background: cat.bg, clipPath: DIAMOND_CLIP,
        cursor: 'pointer', padding: 0, position: 'relative', overflow: 'visible', border: 'none', display: 'block' }}
    >
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0,
        background: online ? `radial-gradient(ellipse at 50% 40%, ${cat.glow ?? cat.text} 0%, transparent 70%)` : 'none',
        opacity: glowOpacity, pointerEvents: 'none', transition: 'opacity 0.6s ease' }} />
      <div style={{ position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 7, fontWeight: 600,
        color: online ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>
      <div style={{ position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)',
        fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.2)',
        letterSpacing: '0.04em', lineHeight: 1, pointerEvents: 'none',
        textShadow: online && level > 40 ? `0 0 6px ${cat.glow ?? cat.text}` : 'none' }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>
      <div style={{ position: 'absolute', top: '64%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 6, fontWeight: 500,
        color: online ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
        maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {cardDisplay?.displayName ?? element.service ?? element.name}
      </div>
      <LaserSweep level={level} color={cat.text} />
    </motion.button>
  );
};

export default HeistCard;
