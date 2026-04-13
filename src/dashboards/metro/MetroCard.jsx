import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Rounded station marker — pill/capsule shape like transit map nodes
const STATION_CLIP = `polygon(
  15% 0%,
  85% 0%,
  100% 15%,
  100% 85%,
  85% 100%,
  15% 100%,
  0% 85%,
  0% 15%
)`;

const LINE_COLORS = {
  Red: '#FF3333', Blue: '#3399FF', Yellow: '#FFD700',
  Green: '#33CC66', Orange: '#FF8833', Purple: '#AA66FF',
};

const PulseRing = ({ level, color }) => {
  if (level <= 20 || prefersReducedMotion) return null;
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: -4,
        border: `1px solid ${color}`,
        borderRadius: 8, opacity: 0, pointerEvents: 'none',
      }}
      animate={{ opacity: [0, 0.3, 0], scale: [0.95, 1.05, 0.95] }}
      transition={{ duration: level > 60 ? 1.5 : 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

const MetroCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;

  const glowOpacity = online ? Math.min(0.5, 0.08 + level * 0.004) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: 2, rotateX: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{ transformPerspective: 800,
        width: 72, height: 80,
        background: cat.bg,
        clipPath: STATION_CLIP,
        cursor: 'pointer', padding: 0,
        position: 'relative', overflow: 'visible',
        border: 'none', display: 'block',
      }}
    >
      {/* Station glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: online
          ? `radial-gradient(ellipse at 50% 40%, ${cat.glow ?? cat.text} 0%, transparent 70%)`
          : 'none',
        opacity: glowOpacity, pointerEvents: 'none',
        transition: 'opacity 0.6s ease',
      }} />

      {/* Zone / top label */}
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
        maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {cardDisplay?.displayName ?? element.service ?? element.name}
      </div>

      <PulseRing level={level} color={cat.text} />
    </motion.button>
  );
};

export default MetroCard;
