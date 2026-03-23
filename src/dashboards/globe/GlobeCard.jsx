import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

// ACC-03: module-level check matches StarCard/NeuralCard pattern — WCAG 2.3.3
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const GlobeCard = ({ element, stats, onClick }) => {
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
      {/* Globe visual: circle with latitude/longitude lines */}
      {/* UX-05: overflow: 'hidden' clips latitude lines to the circle boundary.
          Without it, the 22px-wide lines protrude outside the 30px circle outline,
          creating a gunsight appearance rather than a globe. */}
      <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Globe outline circle */}
        <div style={{
          position: 'absolute',
          width: 30, height: 30,
          borderRadius: '50%',
          border: `1px solid ${online ? cat.border : 'rgba(255,255,255,0.12)'}`,
          opacity: online ? 0.8 : 0.25,
        }} />
        {/* Equator line */}
        <div style={{
          position: 'absolute',
          width: 30, height: 0,
          borderTop: `1px solid ${online ? cat.border : 'rgba(255,255,255,0.08)'}`,
          opacity: online ? 0.5 : 0.15,
        }} />
        {/* Upper latitude */}
        <div style={{
          position: 'absolute',
          width: 22, height: 0,
          borderTop: `1px solid ${online ? cat.border : 'rgba(255,255,255,0.06)'}`,
          opacity: online ? 0.3 : 0.1,
          transform: 'translateY(-7px)',
        }} />
        {/* Lower latitude */}
        <div style={{
          position: 'absolute',
          width: 22, height: 0,
          borderTop: `1px solid ${online ? cat.border : 'rgba(255,255,255,0.06)'}`,
          opacity: online ? 0.3 : 0.1,
          transform: 'translateY(7px)',
        }} />
        {/* Prime meridian */}
        <div style={{
          position: 'absolute',
          width: 0, height: 30,
          borderLeft: `1px solid ${online ? cat.border : 'rgba(255,255,255,0.08)'}`,
          opacity: online ? 0.4 : 0.12,
        }} />
        {/* Center dot / pole marker */}
        <div style={{
          width: 4, height: 4,
          borderRadius: '50%',
          background: online ? cat.text : 'rgba(255,255,255,0.1)',
          boxShadow: online ? `0 0 6px ${cat.glow}` : 'none',
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

export default GlobeCard;
