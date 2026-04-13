import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Paw print / organic blob shape
const PAW_CLIP = `polygon(
  30% 0%,
  70% 0%,
  90% 15%,
  100% 40%,
  95% 65%,
  80% 85%,
  60% 100%,
  40% 100%,
  20% 85%,
  5% 65%,
  0% 40%,
  10% 15%
)`;

const BreathEffect = ({ level }) => {
  if (level <= 15 || prefersReducedMotion) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.03) 0%, transparent 70%)',
      }}
      animate={{ opacity: [0, 0.5, 0] }}
      transition={{ duration: level > 60 ? 2 : 4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

const SafariCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;

  const glowOpacity = online ? Math.min(0.5, 0.08 + level * 0.004) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: -3, rotateX: 1 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80, transformPerspective: 800,
        background: cat.bg,
        clipPath: PAW_CLIP,
        cursor: 'pointer', padding: 0,
        position: 'relative', overflow: 'visible',
        border: 'none', display: 'block',
      }}
    >
      {/* Nature glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: online
          ? `radial-gradient(ellipse at 50% 40%, ${cat.glow ?? cat.text} 0%, transparent 70%)`
          : 'none',
        opacity: glowOpacity, pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
      }} />

      {/* Enclosure tag / top label */}
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
        position: 'absolute', top: '44%', left: '50%',
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

      <BreathEffect level={level} />
    </motion.button>
  );
};

export default SafariCard;
