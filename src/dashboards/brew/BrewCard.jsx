import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Beer glass / tankard — wide body, narrow top
const TANKARD_CLIP = `polygon(
  25% 0%, 75% 0%, 80% 5%, 85% 15%, 88% 40%, 85% 70%, 80% 90%, 70% 100%, 30% 100%, 20% 90%, 15% 70%, 12% 40%, 15% 15%, 20% 5%
)`;

const FoamBubble = ({ level, color }) => {
  if (level <= 20 || prefersReducedMotion) return null;
  return (
    <motion.div aria-hidden="true"
      style={{ position: 'absolute', top: '12%', left: '50%', width: 3, height: 3, borderRadius: '50%',
        background: color, opacity: 0.3, pointerEvents: 'none' }}
      animate={{ y: [0, -8, 0], x: [-2, 2, -2], opacity: [0.3, 0, 0.3] }}
      transition={{ duration: level > 60 ? 2 : 4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

const BrewCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;
  const glowOpacity = online ? Math.min(0.5, 0.08 + level * 0.004) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: -5, rotateX: 2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2"
      style={{ width: 72, height: 80, transformPerspective: 800, background: cat.bg, clipPath: TANKARD_CLIP,
        cursor: 'pointer', padding: 0, position: 'relative', overflow: 'visible', border: 'none', display: 'block' }}
    >
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0,
        background: online ? `radial-gradient(ellipse at 50% 50%, ${cat.glow ?? cat.text} 0%, transparent 70%)` : 'none',
        opacity: glowOpacity, pointerEvents: 'none', transition: 'opacity 0.6s ease' }} />
      {/* Foam cap */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '3%', left: '28%', right: '28%', height: '8%',
        background: 'rgba(255,240,200,0.08)', borderRadius: '4px 4px 0 0', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)',
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
      <FoamBubble level={level} color="rgba(255,240,200,0.5)" />
    </motion.button>
  );
};

export default BrewCard;
