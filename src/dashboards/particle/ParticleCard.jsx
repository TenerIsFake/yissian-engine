import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

// ACC-03: module-level check matches StarCard/NeuralCard pattern — WCAG 2.3.3
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const ParticleCard = ({ element, stats, onClick }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;

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
      {/* Orbital rings with center nucleus */}
      {/* UX-06: three distinct ellipse sizes (28×16, 22×12, 16×9) create depth illusion.
          Previously all three were 32×18 — only rotation differed, losing the sense of
          nested orbital shells at different distances from the nucleus. */}
      <div style={{ position: 'relative', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer orbital ellipse */}
        <div style={{
          position: 'absolute',
          width: 28, height: 16,
          borderRadius: '50%',
          border: `1px dashed ${online ? cat.border : 'rgba(255,255,255,0.1)'}`,
          opacity: online ? 0.7 : 0.2,
        }} />
        {/* Mid orbital ellipse — rotated */}
        <div style={{
          position: 'absolute',
          width: 22, height: 12,
          borderRadius: '50%',
          border: `1px dashed ${online ? cat.border : 'rgba(255,255,255,0.1)'}`,
          opacity: online ? 0.5 : 0.15,
          transform: 'rotate(60deg)',
        }} />
        {/* Inner orbital ellipse */}
        <div style={{
          position: 'absolute',
          width: 16, height: 9,
          borderRadius: '50%',
          border: `1px dashed ${online ? cat.border : 'rgba(255,255,255,0.08)'}`,
          opacity: online ? 0.4 : 0.1,
          transform: 'rotate(-60deg)',
        }} />
        {/* Nucleus */}
        <div style={{
          width: 7, height: 7,
          borderRadius: '50%',
          background: online ? cat.text : 'rgba(255,255,255,0.15)',
          boxShadow: online ? `0 0 8px ${cat.glow}` : 'none',
          position: 'relative', zIndex: 1,
        }} />
      </div>

      {/* Symbol */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 9,
        fontWeight: 700,
        color: online ? cat.text : 'rgba(255,255,255,0.25)',
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

export default ParticleCard;
