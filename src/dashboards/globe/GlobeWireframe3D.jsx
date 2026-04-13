import React from 'react';
import { motion } from 'framer-motion';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

/**
 * CSS-only 3D wireframe globe — latitude/longitude rings in 3D space.
 * Pure CSS perspective transforms, no WebGL.
 */
const GlobeWireframe3D = ({ size = 120, color = 'rgba(80,200,120,0.25)' }) => {
  const half = size / 2;
  const globeR = size * 0.42;

  // Latitude rings at different heights
  const latitudes = [-0.6, -0.3, 0, 0.3, 0.6];
  // Longitude meridians at different rotations
  const longitudes = [0, 45, 90, 135];

  return (
    <motion.div
      aria-hidden="true"
      animate={prefersReducedMotion ? {} : { rotateY: [0, 360] }}
      transition={prefersReducedMotion ? {} : { duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size, height: size,
        perspective: 500,
        transformStyle: 'preserve-3d',
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      {/* Equator + latitude rings */}
      {latitudes.map((lat, i) => {
        const ringR = globeR * Math.cos(Math.asin(lat));
        const yOffset = lat * globeR;
        return (
          <div key={`lat-${i}`} style={{
            position: 'absolute',
            left: half - ringR,
            top: half - ringR + yOffset,
            width: ringR * 2, height: ringR * 2,
            border: `1px solid ${i === 2 ? color : color.replace(/[\d.]+\)$/, '0.12)')}`,
            borderRadius: '50%',
            transform: 'rotateX(90deg)',
            transformStyle: 'preserve-3d',
          }} />
        );
      })}

      {/* Longitude meridians */}
      {longitudes.map((lng, i) => (
        <div key={`lng-${i}`} style={{
          position: 'absolute',
          left: half - globeR,
          top: half - globeR,
          width: globeR * 2, height: globeR * 2,
          border: `1px solid ${color.replace(/[\d.]+\)$/, '0.15)')}`,
          borderRadius: '50%',
          transform: `rotateY(${lng}deg)`,
          transformStyle: 'preserve-3d',
        }} />
      ))}

      {/* North pole dot */}
      <div style={{
        position: 'absolute',
        left: half - 2, top: half - globeR - 2,
        width: 4, height: 4, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 4px ${color}`,
      }} />
    </motion.div>
  );
};

export default GlobeWireframe3D;
