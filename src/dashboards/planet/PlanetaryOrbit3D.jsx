import React from 'react';
import { motion } from 'framer-motion';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

/**
 * CSS-only 3D planetary system — rotating orbit rings around a central sphere.
 * Pure CSS transforms, no WebGL dependencies.
 */
const PlanetaryOrbit3D = ({ size = 120, color = 'rgba(100,200,255,0.3)' }) => {
  const half = size / 2;
  const ringCount = 3;

  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size,
        perspective: 600,
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      {/* Central sphere */}
      <div style={{
        position: 'absolute',
        left: half - 8, top: half - 8,
        width: 16, height: 16,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 35%, ${color}, rgba(20,20,40,0.9))`,
        boxShadow: `0 0 12px ${color}`,
      }} />

      {/* Orbit rings — each tilted differently in 3D */}
      {Array.from({ length: ringCount }, (_, i) => {
        const ringSize = 40 + i * 28;
        const tiltX = 65 + i * 8;
        const duration = 6 + i * 3;

        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: half - ringSize / 2,
              top: half - ringSize / 2,
              width: ringSize, height: ringSize,
              border: `1px solid ${color}`,
              borderRadius: '50%',
              transformStyle: 'preserve-3d',
              transformOrigin: 'center center',
            }}
            animate={prefersReducedMotion ? {} : {
              rotateX: tiltX,
              rotateZ: [0, 360],
            }}
            transition={prefersReducedMotion ? {} : {
              rotateZ: { duration, repeat: Infinity, ease: 'linear' },
              rotateX: { duration: 0 },
            }}
          >
            {/* Orbiting dot */}
            <div style={{
              position: 'absolute',
              top: -2, left: '50%', marginLeft: -2,
              width: 4, height: 4, borderRadius: '50%',
              background: color,
              boxShadow: `0 0 4px ${color}`,
            }} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlanetaryOrbit3D;
