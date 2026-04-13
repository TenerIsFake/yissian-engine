import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Anvil clip-path — fits a 72×80 bounding box.
// Points (as % of width × height):
//   Horn tip at left-centre, wide working face across the top,
//   narrow waist below the face, broad base/feet at bottom.
const ANVIL_CLIP = `polygon(
  0% 30%,
  22% 18%,
  22% 0%,
  95% 0%,
  100% 8%,
  95% 18%,
  72% 24%,
  76% 48%,
  86% 57%,
  90% 100%,
  10% 100%,
  14% 57%,
  24% 48%,
  28% 24%,
  22% 18%
)`;

// FE-01: gate at level > 15 — avoids animating idle GPU layers.
const EmberParticles = ({ level, color }) => {
  if (level <= 15 || prefersReducedMotion) return null;
  const count = level > 80 ? 4 : level > 50 ? 3 : 2;
  return (
    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 2, height: 2,
            borderRadius: '50%',
            background: color,
            // Spread horizontally across the body section (roughly 20–70% x)
            left: `${20 + i * 14}%`,
            // Float up from the body centre (around 55% y)
            bottom: '38%',
          }}
          animate={{
            y: [0, -12, -20],
            opacity: [0.85, 0.4, 0],
            x: [0, i % 2 === 0 ? 3 : -3, i % 2 === 0 ? 5 : -5],
          }}
          transition={{
            duration: 1.1 + i * 0.3,
            repeat: Infinity,
            ease: 'easeOut',
            delay: i * 0.45,
          }}
        />
      ))}
    </div>
  );
};

const ForgeCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat    = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const level  = stats?.level ?? 0;

  // Heat-glow intensity on the working face — scales with load level
  const glowOpacity = online ? Math.min(0.55, 0.1 + level * 0.0045) : 0;
  // Metallic sheen highlight on the face (always faint, brighter when online)
  const sheenOpacity = online ? 0.18 : 0.07;

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.06, rotateY: 3, rotateX: -3 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 focus-visible:outline-offset-2"
      style={{
        width: 72, transformPerspective: 800,
        height: 80,
        background: cat.bg,
        clipPath: ANVIL_CLIP,
        cursor: 'pointer',
        padding: 0,
        position: 'relative',
        overflow: 'visible', // clip-path handles masking; overflow:hidden would cut off glow
        border: 'none',
        display: 'block',
      }}
    >
      {/* Working face heat-glow overlay — top 22% of card maps to the face */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: '22%', right: '5%', height: '22%',
          background: online
            ? `radial-gradient(ellipse at 50% 100%, ${cat.glow ?? cat.text} 0%, transparent 80%)`
            : 'none',
          opacity: glowOpacity,
          pointerEvents: 'none',
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Metallic sheen highlight — diagonal streak across the face */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '1%', left: '30%', right: '10%', height: '14%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%)',
          opacity: sheenOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Atomic number — sits on the face (top area) */}
      <div style={{
        position: 'absolute',
        top: '3%',
        left: '30%',
        fontFamily: 'monospace',
        fontSize: 7,
        fontWeight: 600,
        color: online ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.28)',
        lineHeight: 1,
        pointerEvents: 'none',
      }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>

      {/* Symbol — centred in the wide body section (roughly 45–80% y) */}
      <div style={{
        position: 'absolute',
        // Body centre: horizontal midpoint ≈ 50%, vertical midpoint of body ≈ 62%
        top: '55%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'monospace',
        fontSize: 10,
        fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.22)',
        letterSpacing: '0.04em',
        lineHeight: 1,
        pointerEvents: 'none',
        textShadow: online && level > 40
          ? `0 0 6px ${cat.glow ?? cat.text}`
          : 'none',
      }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>

      <EmberParticles level={level} color={cat.text} />
    </motion.button>
  );
};

export default ForgeCard;
