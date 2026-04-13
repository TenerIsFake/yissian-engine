import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// ─── Deterministic creature assignment ───────────────────────────────────────
function idHash(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const CREATURES = [
  'jellyfish', 'jellyfish', 'jellyfish', 'jellyfish',
  'fish', 'fish', 'fish',
  'seahorse', 'seahorse',
  'octopus',
];

// ─── Jellyfish ────────────────────────────────────────────────────────────────
// Bell dome + 3 wavy tentacles hanging below
const Jellyfish = ({ cat, online, animate: shouldAnimate }) => {
  const bellGlow = online
    ? `0 0 12px ${cat.glow}, 0 0 24px ${cat.glow}`
    : 'none';
  const dimOpacity = online ? 1 : 0.35;

  return (
    <motion.div
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: dimOpacity }}
      animate={shouldAnimate ? { y: [-2, 2, -2] } : {}}
      transition={shouldAnimate ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Bell dome */}
      <div style={{
        width: 36,
        height: 20,
        borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        background: `${cat.text}22`,
        border: `1.5px solid ${cat.border}`,
        borderBottom: 'none',
        boxShadow: bellGlow,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Bioluminescent inner highlight */}
        <div style={{
          position: 'absolute',
          top: 4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 16,
          height: 8,
          borderRadius: '50%',
          background: online ? `${cat.glow}55` : 'transparent',
        }} />
      </div>

      {/* Tentacles */}
      <div style={{ display: 'flex', gap: 6, paddingTop: 2 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            style={{
              width: 1.5,
              height: 16 + i * 3,
              borderRadius: 2,
              background: online ? cat.border : 'rgba(255,255,255,0.15)',
              transformOrigin: 'top center',
            }}
            animate={shouldAnimate ? { rotate: [-(3 + i * 2), (3 + i * 2), -(3 + i * 2)] } : {}}
            transition={shouldAnimate ? {
              duration: 2.4 + i * 0.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            } : {}}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ─── Fish ─────────────────────────────────────────────────────────────────────
// Oval body + triangular tail fin + eye dot
const Fish = ({ cat, online, animate: shouldAnimate }) => {
  const bodyGlow = online
    ? `0 0 10px ${cat.glow}, 0 0 20px ${cat.glow}`
    : 'none';
  const dimOpacity = online ? 1 : 0.35;

  return (
    <motion.div
      aria-hidden="true"
      style={{ display: 'flex', alignItems: 'center', opacity: dimOpacity }}
      animate={shouldAnimate ? { x: [-1, 1, -1] } : {}}
      transition={shouldAnimate ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Tail fin */}
      <motion.div
        style={{
          width: 0,
          height: 0,
          borderTop: '9px solid transparent',
          borderBottom: '9px solid transparent',
          borderRight: `13px solid ${online ? cat.border : 'rgba(255,255,255,0.2)'}`,
          transformOrigin: 'right center',
        }}
        animate={shouldAnimate ? { skewY: [-8, 8, -8] } : {}}
        transition={shouldAnimate ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : {}}
      />

      {/* Body */}
      <div style={{
        width: 32,
        height: 20,
        borderRadius: '50%',
        background: `${cat.text}22`,
        border: `1.5px solid ${cat.border}`,
        boxShadow: bodyGlow,
        position: 'relative',
      }}>
        {/* Eye */}
        <div style={{
          position: 'absolute',
          top: 5,
          right: 7,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: online ? cat.text : 'rgba(255,255,255,0.2)',
          boxShadow: online ? `0 0 4px ${cat.glow}` : 'none',
        }} />
        {/* Fin stripe detail */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '40%',
          width: '1.5px',
          height: '100%',
          background: online ? `${cat.border}44` : 'transparent',
          borderRadius: 1,
        }} />
      </div>
    </motion.div>
  );
};

// ─── Seahorse ────────────────────────────────────────────────────────────────
// S-shaped body via stacked rounded rects + tiny crown crest
const Seahorse = ({ cat, online, animate: shouldAnimate }) => {
  const glowVal = online
    ? `0 0 8px ${cat.glow}, 0 0 18px ${cat.glow}`
    : 'none';
  const dimOpacity = online ? 1 : 0.35;
  const bodyColor = online ? `${cat.text}22` : 'rgba(255,255,255,0.05)';
  const borderColor = online ? cat.border : 'rgba(255,255,255,0.15)';

  return (
    <motion.div
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: dimOpacity }}
      animate={shouldAnimate ? { y: [-1, 1, -1] } : {}}
      transition={shouldAnimate ? { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Crown crest */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 1, alignItems: 'flex-end',
      }}>
        {[6, 9, 7].map((h, i) => (
          <div key={i} style={{
            width: 2, height: h,
            borderRadius: '2px 2px 0 0',
            background: online ? cat.border : 'rgba(255,255,255,0.15)',
          }} />
        ))}
      </div>

      {/* Head */}
      <div style={{
        width: 14,
        height: 12,
        borderRadius: '50% 50% 40% 40%',
        background: bodyColor,
        border: `1.5px solid ${borderColor}`,
        boxShadow: glowVal,
        marginLeft: 6,
      }} />

      {/* Snout */}
      <div style={{
        width: 6,
        height: 4,
        borderRadius: '0 3px 3px 0',
        background: bodyColor,
        border: `1px solid ${borderColor}`,
        borderLeft: 'none',
        marginLeft: 12,
        marginTop: -2,
      }} />

      {/* Upper body */}
      <div style={{
        width: 16,
        height: 10,
        borderRadius: 4,
        background: bodyColor,
        border: `1.5px solid ${borderColor}`,
        marginLeft: 4,
        marginTop: 1,
      }} />

      {/* Lower body — curves opposite direction */}
      <div style={{
        width: 14,
        height: 10,
        borderRadius: 4,
        background: bodyColor,
        border: `1.5px solid ${borderColor}`,
        marginLeft: -2,
        marginTop: 1,
      }} />

      {/* Curled tail */}
      <div style={{
        width: 10,
        height: 8,
        borderRadius: '0 0 8px 0',
        border: `1.5px solid ${borderColor}`,
        borderTop: 'none',
        borderLeft: 'none',
        marginLeft: -6,
        marginTop: 1,
      }} />
    </motion.div>
  );
};

// ─── Octopus ──────────────────────────────────────────────────────────────────
// Round head + 4 tentacles (paired left/right)
const Octopus = ({ cat, online, animate: shouldAnimate }) => {
  const headGlow = online
    ? `0 0 12px ${cat.glow}, 0 0 22px ${cat.glow}`
    : 'none';
  const dimOpacity = online ? 1 : 0.35;

  return (
    <motion.div
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: dimOpacity }}
      animate={shouldAnimate ? { rotate: [-2, 2, -2] } : {}}
      transition={shouldAnimate ? { duration: 4.0, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Head */}
      <div style={{
        width: 28,
        height: 24,
        borderRadius: '50% 50% 40% 40%',
        background: `${cat.text}22`,
        border: `1.5px solid ${cat.border}`,
        boxShadow: headGlow,
        position: 'relative',
      }}>
        {/* Eyes */}
        {[8, 14].map((x, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: 8,
            left: x,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: online ? cat.text : 'rgba(255,255,255,0.2)',
            boxShadow: online ? `0 0 4px ${cat.glow}` : 'none',
          }} />
        ))}
      </div>

      {/* Tentacles — 4 total, paired */}
      <div style={{ display: 'flex', gap: 4, marginTop: 1 }}>
        {[
          { h: 14, delay: 0,   offsetX: -3 },
          { h: 18, delay: 0.3, offsetX: -1 },
          { h: 18, delay: 0.5, offsetX: 1  },
          { h: 14, delay: 0.8, offsetX: 3  },
        ].map((t, i) => (
          <motion.div
            key={i}
            style={{
              width: 3,
              height: t.h,
              borderRadius: '0 0 3px 3px',
              background: online ? cat.border : 'rgba(255,255,255,0.15)',
              transformOrigin: 'top center',
              marginLeft: t.offsetX,
            }}
            animate={shouldAnimate ? { rotate: [-5, 5, -5], scaleX: [1, 0.7, 1] } : {}}
            transition={shouldAnimate ? {
              duration: 2.8 + t.delay * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: t.delay,
            } : {}}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ─── Creature map ─────────────────────────────────────────────────────────────
const CREATURE_COMPONENTS = {
  jellyfish: Jellyfish,
  fish:      Fish,
  seahorse:  Seahorse,
  octopus:   Octopus,
};

// ─── OceanCard ───────────────────────────────────────────────────────────────
const OceanCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat     = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online  = stats?.online ?? false;
  const animate = online && !prefersReducedMotion;

  const creature = CREATURES[idHash(element.id) % CREATURES.length];
  const CreatureComponent = CREATURE_COMPONENTS[creature];

  return (
    <motion.button
      onClick={() => onClick(element)}
      aria-label={element.service ?? element.name}
      whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotateY: -2, rotateX: 3 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: 72, transformPerspective: 800,
        height: 80,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: 0,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Identifier — top-left */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 2,
        fontFamily: 'monospace',
        fontSize: 7,
        color: 'rgba(255,255,255,0.3)',
        lineHeight: 1,
      }}>
        {cardDisplay?.topLeft ?? element.z}
      </div>

      {/* Creature visual */}
      <CreatureComponent cat={cat} online={online} animate={animate} />

      {/* Service label */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 8,
        fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.22)',
        letterSpacing: '0.04em',
        lineHeight: 1,
        textAlign: 'center',
        maxWidth: 68,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {cardDisplay?.centerLabel ?? element.symbol}
      </div>
    </motion.button>
  );
};

export default OceanCard;
