import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Leaf / petal shape — organic asymmetric
const LEAF_CLIP = `polygon(
  50% 0%, 75% 8%, 95% 25%, 100% 50%, 95% 75%, 75% 92%, 50% 100%, 25% 92%, 5% 75%, 0% 50%, 5% 25%, 25% 8%
)`;

const GrowPulse = ({ level }) => {
  if (level <= 15 || prefersReducedMotion) return null;
  return (
    <motion.div aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 70%, rgba(100,200,100,0.04) 0%, transparent 70%)' }}
      animate={{ opacity: [0, 0.6, 0] }}
      transition={{ duration: level > 60 ? 2 : 4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

const GardenCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;
  const glowOpacity = online ? Math.min(0.5, 0.08 + level * 0.004) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: 3, rotateX: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400 focus-visible:outline-offset-2"
      style={{ width: 72, height: 80, transformPerspective: 800, background: cat.bg, clipPath: LEAF_CLIP,
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
      <GrowPulse level={level} />
    </motion.button>
  );
};

export default GardenCard;
