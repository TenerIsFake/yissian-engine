import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Book spine shape — tall rectangle with slight spine curve
const BOOK_CLIP = `polygon(
  5% 0%, 95% 0%, 100% 3%, 100% 97%, 95% 100%, 5% 100%, 0% 97%, 0% 3%
)`;

const PageFlutter = ({ level, color }) => {
  if (level <= 20 || prefersReducedMotion) return null;
  return (
    <motion.div aria-hidden="true"
      style={{ position: 'absolute', right: '5%', top: '30%', width: 1, height: 15,
        background: color, opacity: 0.2, pointerEvents: 'none', transformOrigin: 'bottom right' }}
      animate={{ rotate: [0, -5, 0] }}
      transition={{ duration: level > 60 ? 1.5 : 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
};

const LibraryCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;
  const glowOpacity = online ? Math.min(0.4, 0.06 + level * 0.003) : 0;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: 4, rotateX: -1 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2"
      style={{ width: 72, height: 80, transformPerspective: 800, background: cat.bg, clipPath: BOOK_CLIP,
        cursor: 'pointer', padding: 0, position: 'relative', overflow: 'visible', border: 'none', display: 'block' }}
    >
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0,
        background: online ? `radial-gradient(ellipse at 50% 40%, ${cat.glow ?? cat.text} 0%, transparent 70%)` : 'none',
        opacity: glowOpacity, pointerEvents: 'none', transition: 'opacity 0.6s ease' }} />
      {/* Spine edge */}
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: '5%', bottom: '5%', width: 2,
        background: `${cat.border ?? cat.text}30`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 7, fontWeight: 600,
        color: online ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>
      <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%)',
        fontFamily: 'monospace', fontSize: 14, fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.2)',
        letterSpacing: '0.04em', lineHeight: 1, pointerEvents: 'none',
        textShadow: online && level > 40 ? `0 0 6px ${cat.glow ?? cat.text}` : 'none' }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>
      <div style={{ position: 'absolute', top: '62%', left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: 6, fontWeight: 500,
        color: online ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.18)',
        lineHeight: 1, pointerEvents: 'none', whiteSpace: 'nowrap',
        maxWidth: '85%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {cardDisplay?.displayName ?? element.service ?? element.name}
      </div>
      <PageFlutter level={level} color={cat.text} />
    </motion.button>
  );
};

export default LibraryCard;
