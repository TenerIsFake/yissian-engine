import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Potion bottle silhouette — narrow neck, wide body
const BOTTLE_CLIP = `polygon(
  35% 0%,
  65% 0%,
  65% 15%,
  80% 30%,
  85% 50%,
  80% 80%,
  65% 100%,
  35% 100%,
  20% 80%,
  15% 50%,
  20% 30%,
  35% 15%
)`;

const BubbleEffect = ({ level, color }) => {
  if (level <= 20 || prefersReducedMotion) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute', bottom: '25%', left: '50%',
        width: 3, height: 3, borderRadius: '50%',
        background: color, opacity: 0.4, pointerEvents: 'none',
      }}
      animate={{ y: [-2, -18, -2], x: [-3, 3, -3], opacity: [0.4, 0, 0.4] }}
      transition={{ duration: level > 60 ? 2 : 4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

const ApothecaryCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;

  const glowOpacity = online ? Math.min(0.5, 0.08 + level * 0.004) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: -4, rotateX: 3 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80, transformPerspective: 800,
        background: cat.bg,
        clipPath: BOTTLE_CLIP,
        cursor: 'pointer', padding: 0,
        position: 'relative', overflow: 'visible',
        border: 'none', display: 'block',
      }}
    >
      {/* Potion glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: online
          ? `radial-gradient(ellipse at 50% 60%, ${cat.glow ?? cat.text} 0%, transparent 70%)`
          : 'none',
        opacity: glowOpacity, pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
      }} />

      {/* Cork cap */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '1%', left: '38%', right: '38%', height: '8%',
        background: 'rgba(139,90,43,0.4)',
        borderRadius: '2px 2px 0 0', pointerEvents: 'none',
      }} />

      {/* Potency / top label */}
      <div style={{
        position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 7, fontWeight: 600,
        color: online ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>

      {/* Symbol — center */}
      <div style={{
        position: 'absolute', top: '46%', left: '50%',
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
        position: 'absolute', top: '64%', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 6, fontWeight: 500,
        color: online ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
        maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {cardDisplay?.displayName ?? element.service ?? element.name}
      </div>

      <BubbleEffect level={level} color={cat.text} />
    </motion.button>
  );
};

export default ApothecaryCard;
