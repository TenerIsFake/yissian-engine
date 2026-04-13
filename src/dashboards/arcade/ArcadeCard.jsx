import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Pixel-art / cabinet screen shape — rounded rectangle with notched top
const CABINET_CLIP = `polygon(
  8% 0%,
  92% 0%,
  100% 8%,
  100% 92%,
  92% 100%,
  8% 100%,
  0% 92%,
  0% 8%
)`;

const PixelSparkle = ({ level, color }) => {
  if (level <= 15 || prefersReducedMotion) return null;
  const count = level > 70 ? 4 : 2;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => (
        <motion.div key={i} style={{
          position: 'absolute', width: 2, height: 2,
          background: color,
          left: `${15 + i * 20}%`, top: `${20 + (i % 2) * 40}%`,
        }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
    </div>
  );
};

const ArcadeCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;
  const glowOpacity = online ? Math.min(0.5, 0.1 + level * 0.005) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.08, y: -2, rotateY: 8, rotateX: -4 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80, transformPerspective: 800,
        background: cat.bg,
        clipPath: CABINET_CLIP,
        cursor: 'pointer', padding: 0,
        position: 'relative', overflow: 'visible',
        border: 'none', display: 'block',
      }}
    >
      {/* Screen glow */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: '5%',
        background: online
          ? `radial-gradient(ellipse at 50% 40%, ${cat.glow ?? cat.text} 0%, transparent 70%)`
          : 'none',
        opacity: glowOpacity, pointerEvents: 'none',
        transition: 'opacity 0.4s ease',
      }} />

      {/* CRT scanline overlay */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        pointerEvents: 'none', opacity: online ? 0.5 : 0.2,
      }} />

      {/* Level / HP bar at top */}
      <div style={{
        position: 'absolute', top: '6%', left: '12%', right: '12%', height: 3,
        background: 'rgba(0,0,0,0.4)', borderRadius: 1,
      }}>
        <div style={{
          width: `${Math.min(100, level)}%`, height: '100%',
          background: online
            ? level > 80 ? '#ef4444' : level > 50 ? '#f59e0b' : '#22c55e'
            : 'rgba(255,255,255,0.1)',
          borderRadius: 1, transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Top label */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 7, fontWeight: 600,
        color: online ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)',
        lineHeight: 1, pointerEvents: 'none',
      }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>

      {/* Symbol */}
      <div style={{
        position: 'absolute', top: '44%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'monospace', fontSize: 16, fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.2)',
        lineHeight: 1, pointerEvents: 'none',
        textShadow: online ? `0 0 8px ${cat.glow ?? cat.text}` : 'none',
      }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>

      {/* Service name */}
      <div style={{
        position: 'absolute', top: '66%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 6,
        color: online ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
        maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {cardDisplay?.displayName ?? element.service ?? element.name}
      </div>

      {/* INSERT COIN / bottom label */}
      <div style={{
        position: 'absolute', bottom: '6%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 5,
        color: online ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
        lineHeight: 1, pointerEvents: 'none',
      }}>
        {cardDisplay?.bottomLabel ?? (online ? 'PLAYING' : 'INSERT COIN')}
      </div>

      <PixelSparkle level={level} color={cat.text} />
    </motion.button>
  );
};

export default ArcadeCard;
