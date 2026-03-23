import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

// ACC-03: module-level check matches StarCard/NeuralCard pattern — WCAG 2.3.3
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const BandCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const level = stats?.level ?? 0;

  // Equalizer bar heights based on level
  const bars = [
    Math.max(6, Math.round(level * 0.22)),
    Math.max(10, Math.round(level * 0.35)),
    Math.max(6, Math.round(level * 0.28)),
    Math.max(8, Math.round(level * 0.30)),
    Math.max(5, Math.round(level * 0.18)),
  ];

  return (
    <motion.button
      onClick={onClick}
      // ACC-01: aria-label provides screen readers the service name, not just the 2-char symbol
      aria-label={element.service ?? element.name}
      // ACC-03: suppress scale animations when user prefers reduced motion — WCAG 2.3.3
      whileHover={prefersReducedMotion ? {} : { scale: 1.06 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      // ACC-02: focus-visible outline matches DinoCard/StarCard pattern — WCAG 2.4.7
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80,
        background: cat.bg,
        border: `1px solid ${cat.border}`,
        borderRadius: 3,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Equalizer bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 32 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: h,
              background: stats?.online ? cat.text : 'rgba(255,255,255,0.12)',
              borderRadius: 1,
              boxShadow: stats?.online ? `0 0 4px ${cat.glow}` : 'none',
              transition: 'height 0.6s ease',
            }}
          />
        ))}
      </div>

      {/* Symbol */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 9,
        fontWeight: 700,
        color: stats?.online ? cat.text : 'rgba(255,255,255,0.25)',
        letterSpacing: '0.05em',
        lineHeight: 1,
      }}>
        {element.symbol}
      </div>

      {/* Atomic number */}
      <div style={{
        position: 'absolute', top: 3, right: 4,
        fontFamily: 'monospace', fontSize: 7,
        color: 'rgba(255,255,255,0.3)',
      }}>
        {element.number}
      </div>
    </motion.button>
  );
};

export default BandCard;
