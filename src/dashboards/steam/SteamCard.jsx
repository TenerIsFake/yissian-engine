import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Gear/cog shape — octagonal with notched edges
const GEAR_CLIP = `polygon(
  30% 0%, 70% 0%,
  80% 10%, 100% 30%,
  100% 70%, 80% 90%,
  70% 100%, 30% 100%,
  20% 90%, 0% 70%,
  0% 30%, 20% 10%
)`;

const SteamPuff = ({ level, color }) => {
  if (level <= 15 || prefersReducedMotion) return null;
  const count = level > 70 ? 3 : 2;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => (
        <motion.div key={i} style={{
          position: 'absolute', width: 4, height: 4, borderRadius: '50%',
          background: color, left: `${30 + i * 16}%`, top: '8%',
        }}
          animate={{ y: [0, -8, -16], opacity: [0.5, 0.25, 0], scale: [1, 1.4, 2] }}
          transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.5 }}
        />
      ))}
    </div>
  );
};

const SteamCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;
  const glowOpacity = online ? Math.min(0.45, 0.08 + level * 0.004) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotate: 5, rotateY: 4, rotateX: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80, transformPerspective: 800,
        background: cat.bg,
        clipPath: GEAR_CLIP,
        cursor: 'pointer', padding: 0,
        position: 'relative', overflow: 'visible',
        border: 'none', display: 'block',
      }}
    >
      {/* Brass sheen */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        background: online
          ? `radial-gradient(ellipse at 40% 30%, ${cat.glow ?? cat.text} 0%, transparent 65%)`
          : 'none',
        opacity: glowOpacity, pointerEvents: 'none',
      }} />

      {/* Rivet highlight */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '4%', left: '35%', right: '35%', height: '5%',
        background: 'linear-gradient(180deg, rgba(255,220,150,0.3) 0%, transparent 100%)',
        opacity: online ? 0.2 : 0.05, pointerEvents: 'none',
      }} />

      {/* Number plate */}
      <div style={{
        position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 7, fontWeight: 600,
        color: online ? 'rgba(255,220,150,0.7)' : 'rgba(255,220,150,0.25)',
        lineHeight: 1, pointerEvents: 'none',
      }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>

      {/* Symbol */}
      <div style={{
        position: 'absolute', top: '45%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
        color: online ? cat.text : 'rgba(255,220,150,0.2)',
        lineHeight: 1, pointerEvents: 'none',
        textShadow: online && level > 40 ? `0 0 5px ${cat.glow ?? cat.text}` : 'none',
      }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>

      {/* Service name */}
      <div style={{
        position: 'absolute', top: '65%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 6, fontWeight: 500,
        color: online ? 'rgba(255,220,150,0.5)' : 'rgba(255,220,150,0.15)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
        maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {cardDisplay?.displayName ?? element.service ?? element.name}
      </div>

      <SteamPuff level={level} color="rgba(200,200,200,0.4)" />
    </motion.button>
  );
};

export default SteamCard;
