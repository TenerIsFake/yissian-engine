import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

// Size variants by category
const CAT_SIZE = {
  NOBLE: 'large', LANTHANIDE: 'large',
  TRANSITION: 'medium', ALKALI: 'medium', ALKALINE: 'medium',
  CHALCOGEN: 'medium', METALLOID: 'medium', PNICTOGEN: 'medium',
  NONMETAL: 'small', HALOGEN: 'small', POST: 'small', ACTINIDE: 'small',
};

export const NEURAL_CARD_SIZES = { large: 72, medium: 60, small: 48 };

// Hex vertex angles (0=top, going clockwise) for dendrite rays
const VERTEX_ANGLES = [
  -Math.PI / 2,            // top
  -Math.PI / 6,            // top-right
  Math.PI / 6,             // bottom-right
  Math.PI / 2,             // bottom
  Math.PI * 5 / 6,         // bottom-left
  -Math.PI * 5 / 6,        // top-left
];

const DendriteRays = ({ size, color, online }) => {
  if (!online) return null;
  const half = size / 2;
  const rayLen = size * 0.28;
  const startR = size * 0.32;
  return (
    <svg
      width={size * 1.6} height={size * 1.6}
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      {VERTEX_ANGLES.map((angle, i) => {
        const cx = size * 0.8;
        const cy = size * 0.8;
        const x1 = cx + Math.cos(angle) * startR;
        const y1 = cy + Math.sin(angle) * startR;
        const x2 = cx + Math.cos(angle) * (startR + rayLen);
        const y2 = cy + Math.sin(angle) * (startR + rayLen);
        return (
          <line key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color} strokeWidth={1.2}
            opacity={0.3}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 2px ${color})`,
            }}
          />
        );
      })}
    </svg>
  );
};

const SignalPulse = ({ size, color }) => {
  if (prefersReducedMotion) return null;
  // Pick a random dendrite ray to animate along
  const rayIndex = 0;
  const angle = VERTEX_ANGLES[rayIndex];
  const cx = size * 0.8;
  const cy = size * 0.8;
  const startR = size * 0.32;
  const endR = startR + size * 0.28;

  return (
    <svg
      width={size * 1.6} height={size * 1.6}
      style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <motion.circle
        r={2}
        fill={color}
        opacity={0.9}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        animate={{
          cx: [
            cx + Math.cos(angle) * startR,
            cx + Math.cos(angle) * endR,
          ],
          cy: [
            cy + Math.sin(angle) * startR,
            cy + Math.sin(angle) * endR,
          ],
          opacity: [0.9, 0],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: 'easeOut',
          repeatDelay: 1.2,
        }}
      />
      {/* Second pulse on opposite ray for visual balance */}
      <motion.circle
        r={2}
        fill={color}
        opacity={0.9}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        animate={{
          cx: [
            cx + Math.cos(VERTEX_ANGLES[3]) * startR,
            cx + Math.cos(VERTEX_ANGLES[3]) * endR,
          ],
          cy: [
            cy + Math.sin(VERTEX_ANGLES[3]) * startR,
            cy + Math.sin(VERTEX_ANGLES[3]) * endR,
          ],
          opacity: [0.9, 0],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: 'easeOut',
          repeatDelay: 1.2,
          delay: 0.8,
        }}
      />
    </svg>
  );
};

const SynapseCore = ({ size, color, glowColor, online }) => {
  const coreR = size * 0.18;
  const cx = size / 2;
  const cy = size / 2;
  return (
    <svg width={size} height={size}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
    >
      <defs>
        <radialGradient id="synapse-core-grad">
          <stop offset="0%" stopColor={online ? color : '#555'} stopOpacity={online ? 0.95 : 0.3} />
          <stop offset="60%" stopColor={online ? glowColor : '#333'} stopOpacity={online ? 0.4 : 0.1} />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </radialGradient>
      </defs>
      {online && !prefersReducedMotion ? (
        <motion.circle
          cx={cx} cy={cy} r={coreR}
          fill="url(#synapse-core-grad)"
          style={{ filter: `drop-shadow(0 0 ${coreR * 0.6}px ${glowColor})` }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <circle
          cx={cx} cy={cy} r={coreR}
          fill="url(#synapse-core-grad)"
          opacity={online ? 0.85 : 0.3}
        />
      )}
    </svg>
  );
};

const NeuralCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;

  const sizeKey = CAT_SIZE[element.cat] || 'medium';
  const size = NEURAL_CARD_SIZES[sizeKey];

  const nodeId = cardDisplay?.topLeft ?? element.symbol;
  const nodeName = cardDisplay?.displayName ?? element.service ?? element.name;
  const shortName = (nodeName.length > 8 ? nodeName.slice(0, 7) + '\u2026' : nodeName).toUpperCase();

  const glowShadow = stats.online
    ? `0 0 14px ${cat.glow}, 0 0 28px ${cat.glow.replace(/[\d.]+\)$/, '0.15)')}`
    : 'none';

  // Font sizes scale with card size
  const idFontSize = size <= 48 ? 6 : size <= 60 ? 7 : 8;
  const nameFontSize = size <= 48 ? 6 : size <= 60 ? 7 : 8;
  const bottomFontSize = size <= 48 ? 5 : size <= 60 ? 6 : 7;

  return (
    <motion.button
      className="cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      aria-label={`${element.service || element.name}: ${stats.online ? 'online' : 'offline'}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        clipPath: HEX_CLIP,
        background: 'transparent',
        overflow: 'visible',
        border: 'none',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={() => onClick(element)}
      whileHover={{ scale: 1.12, zIndex: 20, rotateY: 3, rotateX: -2 }}
    >
      {/* Hex background fill */}
      <div style={{
        position: 'absolute',
        inset: 0,
        clipPath: HEX_CLIP,
        background: isOffline
          ? 'rgba(20,20,30,0.5)'
          : `linear-gradient(135deg, rgba(0,0,0,0.4), ${cat.bg || 'rgba(0,0,0,0.3)'})`,
        border: 'none',
        filter: isOffline ? 'grayscale(0.6)' : 'none',
      }} />

      {/* Hex border (via inset shadow-like overlay) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        clipPath: HEX_CLIP,
        boxShadow: `inset 0 0 0 1.5px ${isOffline ? 'rgba(239,68,68,0.35)' : (cat.border + '88')}`,
        pointerEvents: 'none',
      }} />

      {/* Outer glow */}
      {stats.online && (
        <div style={{
          position: 'absolute',
          inset: -4,
          clipPath: HEX_CLIP,
          background: 'transparent',
          boxShadow: glowShadow,
          pointerEvents: 'none',
          opacity: 0.6,
        }} />
      )}

      {/* Dendrite rays */}
      <DendriteRays size={size} color={cat.glow || cat.border} online={stats.online} />

      {/* Signal pulse animation */}
      {stats.online && (
        <SignalPulse size={size} color={cat.text || cat.border} />
      )}

      {/* Synapse core glow */}
      <SynapseCore
        size={size}
        color={cat.text}
        glowColor={cat.glow || cat.border}
        online={stats.online}
      />

      {/* Text labels — positioned relative to hex center */}
      {/* Top: node ID */}
      <div style={{
        position: 'absolute',
        top: size * 0.14,
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: idFontSize,
        fontFamily: MONO,
        color: cat.text,
        opacity: 0.85,
        lineHeight: 1,
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        {nodeId}
      </div>

      {/* Center below core: short name */}
      <div style={{
        position: 'absolute',
        top: size * 0.60,
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: nameFontSize,
        fontFamily: MONO,
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: '0.03em',
        lineHeight: 1,
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        {shortName}
      </div>

      {/* Bottom: mass / bottom label */}
      <div style={{
        position: 'absolute',
        bottom: size * 0.12,
        left: 0, right: 0,
        textAlign: 'center',
        fontSize: bottomFontSize,
        fontFamily: MONO,
        color: cat.text,
        opacity: 0.55,
        lineHeight: 1,
        pointerEvents: 'none',
        zIndex: 2,
      }}>
        {cardDisplay?.bottomLabel ?? element.mass}
      </div>
    </motion.button>
  );
};

export default NeuralCard;
