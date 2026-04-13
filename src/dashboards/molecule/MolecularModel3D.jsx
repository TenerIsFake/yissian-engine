import React from 'react';
import { motion } from 'framer-motion';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

/**
 * CSS-only 3D molecular model — central atom with orbiting electron shells.
 * Uses preserve-3d + perspective for depth, no WebGL.
 */
const MolecularModel3D = ({ size = 120, color = 'rgba(0,255,200,0.3)' }) => {
  const half = size / 2;

  const shells = [
    { radius: 24, electrons: 2, speed: 4, tiltX: 0, tiltY: 0 },
    { radius: 40, electrons: 3, speed: 6, tiltX: 60, tiltY: 30 },
    { radius: 56, electrons: 2, speed: 9, tiltX: 120, tiltY: 60 },
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size,
        perspective: 500,
        position: 'relative',
        pointerEvents: 'none',
      }}
    >
      {/* Nucleus */}
      <div style={{
        position: 'absolute',
        left: half - 6, top: half - 6,
        width: 12, height: 12,
        borderRadius: '50%',
        background: `radial-gradient(circle at 40% 35%, ${color}, rgba(10,10,20,0.8))`,
        boxShadow: `0 0 10px ${color}`,
      }} />

      {/* Electron shells */}
      {shells.map((shell, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: half - shell.radius,
            top: half - shell.radius,
            width: shell.radius * 2,
            height: shell.radius * 2,
            border: `1px solid ${color}44`,
            borderRadius: '50%',
            transformStyle: 'preserve-3d',
          }}
          animate={prefersReducedMotion ? {} : {
            rotateX: shell.tiltX,
            rotateY: shell.tiltY,
            rotateZ: [0, 360],
          }}
          transition={prefersReducedMotion ? {} : {
            rotateZ: { duration: shell.speed, repeat: Infinity, ease: 'linear' },
            rotateX: { duration: 0 },
            rotateY: { duration: 0 },
          }}
        >
          {Array.from({ length: shell.electrons }, (_, j) => {
            const angle = (360 / shell.electrons) * j;
            const rad = (angle * Math.PI) / 180;
            const ex = Math.cos(rad) * shell.radius + shell.radius - 2;
            const ey = Math.sin(rad) * shell.radius + shell.radius - 2;
            return (
              <div key={j} style={{
                position: 'absolute',
                left: ex, top: ey,
                width: 4, height: 4, borderRadius: '50%',
                background: color,
                boxShadow: `0 0 3px ${color}`,
              }} />
            );
          })}
        </motion.div>
      ))}
    </div>
  );
};

export default MolecularModel3D;
