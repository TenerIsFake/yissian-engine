import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import ParticleCard from './ParticleCard.jsx';

const CARD_W = 72, CARD_H = 80;
const CW = 1300, CH = 760;
const CX = CW / 2, CY = CH / 2;

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Decay track line — path from collision center to particle position
const DecayTrack = ({ x1, y1, x2, y2, online, color }) => {
  const pathD = `M${x1},${y1} L${x2},${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <path d={pathD}
      stroke={online ? color : 'rgba(255,255,255,0.06)'}
      strokeWidth={online ? 1.2 : 0.5}
      fill="none"
      opacity={online ? 0.35 : 0.15}
      strokeDasharray={`${len * 0.6} ${len * 0.4}`}
    />
  );
};

function buildLayout(registry) {
  const n = registry.length;
  return registry.map((el, i) => {
    const θ = (2 * Math.PI / n) * i - Math.PI / 2;
    // Stagger radius slightly by index for depth
    const r = 140 + (i % 3) * 55 + Math.floor(i / 3) * 15;
    const cx = CX + r * Math.cos(θ);
    const cy = CY + r * Math.sin(θ);
    return { el, cx, cy, θ, r };
  });
}

const BURST_STYLE = `
  @keyframes collision-burst {
    0%   { transform: scale(0); opacity: 1; }
    60%  { transform: scale(1.8); opacity: 0.6; }
    100% { transform: scale(3); opacity: 0; }
  }
  @keyframes particle-drift {
    0%   { transform: translate(0, 0); }
    50%  { transform: translate(var(--dx), var(--dy)); }
    100% { transform: translate(0, 0); }
  }
`;

const ParticleGrid = ({ statsMap, onElementClick, elementRegistry }) => {
  const layout = useMemo(() => buildLayout(elementRegistry), [elementRegistry]);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <style>{BURST_STYLE}</style>
      <div style={{ position: 'relative', width: CW, height: CH, margin: '0 auto' }}>

        {/* Magnetic field circles in background */}
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
          {[60, 120, 180, 240, 310, 380].map((r, i) => (
            <circle key={i} cx={CX} cy={CY} r={r}
              fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
          ))}

          {/* Decay tracks from center to each particle */}
          {layout.map(({ el, cx, cy }) => {
            const stats = statsMap[el.id] || { online: false };
            const cat = activeCATRef.current[el.cat] ?? activeCATRef.current.TRANSITION;
            return (
              <DecayTrack key={el.id}
                x1={CX} y1={CY}
                x2={cx + CARD_W / 2} y2={cy + CARD_H / 2}
                online={stats.online}
                color={cat.border}
              />
            );
          })}

          {/* Track curvature hints (magnetic deflection arcs) */}
          {layout.map(({ el, cx, cy, θ }, i) => {
            const stats = statsMap[el.id] || { online: false };
            if (!stats.online) return null;
            const cat = activeCATRef.current[el.cat] ?? activeCATRef.current.TRANSITION;
            const px = CX + CARD_W / 2, py = CY + CARD_H / 2;
            const qx = cx + CARD_W / 2, qy = cy + CARD_H / 2;
            const cpx = (px + qx) / 2 + Math.sin(θ) * 30;
            const cpy = (py + qy) / 2 - Math.cos(θ) * 30;
            return (
              <path key={`arc-${el.id}`}
                d={`M${px},${py} Q${cpx},${cpy} ${qx},${qy}`}
                stroke={cat.border} strokeWidth="0.6" fill="none" opacity="0.2"
                strokeDasharray="2 5" />
            );
          })}
        </svg>

        {/* Central collision point */}
        <div style={{
          position: 'absolute', left: CX - 16, top: CY - 16, width: 32, height: 32,
          pointerEvents: 'none', zIndex: 5,
        }}>
          {/* Impact ring burst */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid rgba(255,200,50,0.6)',
            animation: prefersReducedMotion ? 'none' : 'collision-burst 3s ease-out infinite',
          }} />
          {/* Core dot */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 8, height: 8, borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(255,220,80,0.9)',
            boxShadow: '0 0 12px rgba(255,200,50,0.8)',
          }} />
          {/* Crosshair lines */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, transform: 'translateX(-50%)', background: 'rgba(255,200,50,0.3)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, transform: 'translateY(-50%)', background: 'rgba(255,200,50,0.3)' }} />
        </div>

        {/* Particle cards */}
        {layout.map(({ el, cx, cy }, idx) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          // Slow outward drift animation
          const dx = Math.cos(layout[idx].θ) * 4;
          const dy = Math.sin(layout[idx].θ) * 4;
          return (
            <motion.div key={el.id}
              style={{ position: 'absolute', left: cx, top: cy }}
              animate={prefersReducedMotion ? {} : {
                x: [0, dx, 0],
                y: [0, dy, 0],
              }}
              transition={{
                duration: 4 + idx * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: idx * 0.2,
              }}
              // T1-03 / SECURITY OVERRIDE: none — UX fix; all other grids guard whileHover
              whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 80 }}
            >
              <ParticleCard element={el} stats={stats} onClick={() => onElementClick(el)} />
            </motion.div>
          );
        })}

        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 9, fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.1)', letterSpacing: '0.3em', pointerEvents: 'none' }}>
          ◆ BUBBLE CHAMBER — EVENT DISPLAY ◆
        </div>
      </div>
    </div>
  );
};

export default ParticleGrid;
