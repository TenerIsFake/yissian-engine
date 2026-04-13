import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Carnival ticket / admission stub — wavy edges
const TICKET_CLIP = `polygon(
  5% 0%,
  95% 0%,
  100% 5%,
  98% 15%,
  100% 25%,
  98% 35%,
  100% 45%,
  98% 55%,
  100% 65%,
  98% 75%,
  100% 85%,
  95% 100%,
  5% 100%,
  0% 85%,
  2% 75%,
  0% 65%,
  2% 55%,
  0% 45%,
  2% 35%,
  0% 25%,
  2% 15%,
  0% 5%
)`;

const Confetti = ({ level, color }) => {
  if (level <= 25 || prefersReducedMotion) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute', top: '15%', left: '50%',
        width: 2, height: 5, borderRadius: 1,
        background: color, opacity: 0.5, pointerEvents: 'none',
      }}
      animate={{ y: [0, 25], rotate: [0, 180], opacity: [0.5, 0] }}
      transition={{ duration: level > 60 ? 1.5 : 3, repeat: Infinity, ease: 'easeIn' }}
    />
  );
};

const FunhouseCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;

  const glowOpacity = online ? Math.min(0.55, 0.08 + level * 0.005) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotate: 1, rotateY: 10, rotateX: -5 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80, transformPerspective: 800,
        background: cat.bg,
        clipPath: TICKET_CLIP,
        cursor: 'pointer', padding: 0,
        position: 'relative', overflow: 'visible',
        border: 'none', display: 'block',
      }}
    >
      {/* Carnival glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: online
          ? `radial-gradient(ellipse at 50% 40%, ${cat.glow ?? cat.text} 0%, transparent 70%)`
          : 'none',
        opacity: glowOpacity, pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
      }} />

      {/* Ticket stripe */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: '44%', right: '44%', height: '100%',
        borderLeft: '1px dashed rgba(255,255,255,0.08)',
        borderRight: '1px dashed rgba(255,255,255,0.08)',
        pointerEvents: 'none',
      }} />

      {/* Booth # / top label */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
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
        maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {cardDisplay?.displayName ?? element.service ?? element.name}
      </div>

      <Confetti level={level} color={cat.text} />
    </motion.button>
  );
};

export default FunhouseCard;
