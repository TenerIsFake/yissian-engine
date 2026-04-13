import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import StatusDot from '../../components/StatusDot.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/* ── Shape variants by category ─────────────────── */
const CAT_SHAPE = {
  NOBLE: 'monolith', LANTHANIDE: 'monolith',
  TRANSITION: 'tablet', ALKALI: 'tablet', ALKALINE: 'tablet',
  CHALCOGEN: 'tablet', METALLOID: 'tablet', PNICTOGEN: 'tablet',
  NONMETAL: 'rune', HALOGEN: 'rune', POST: 'rune', ACTINIDE: 'rune',
};

export const ARCANE_CARD_SIZES = {
  monolith: { w: 60, h: 82 },
  tablet:   { w: 56, h: 72 },
  rune:     { w: 44, h: 56 },
};

/* Irregular stone clip-paths — slightly different per variant for variety */
const CLIP_PATHS = {
  monolith: 'polygon(8% 2%, 92% 0%, 98% 8%, 96% 92%, 88% 98%, 12% 96%, 2% 90%, 4% 10%)',
  tablet:   'polygon(6% 3%, 94% 1%, 97% 9%, 95% 91%, 86% 97%, 14% 95%, 3% 88%, 5% 11%)',
  rune:     'polygon(10% 4%, 90% 2%, 96% 10%, 94% 90%, 84% 96%, 16% 94%, 4% 86%, 6% 12%)',
};

/* Inset runic border clip-paths (1-2% inset of outer) */
const BORDER_CLIPS = {
  monolith: 'polygon(10% 4%, 90% 2%, 96% 10%, 94% 90%, 86% 96%, 14% 94%, 4% 88%, 6% 12%)',
  tablet:   'polygon(8% 5%, 92% 3%, 95% 11%, 93% 89%, 84% 95%, 16% 93%, 5% 86%, 7% 13%)',
  rune:     'polygon(12% 6%, 88% 4%, 94% 12%, 92% 88%, 82% 94%, 18% 92%, 6% 84%, 8% 14%)',
};

/* Stone surface gradients */
const stoneGradient = (online, catBg) =>
  online
    ? `linear-gradient(165deg, rgba(40,36,50,0.85) 0%, ${catBg || 'rgba(25,22,35,0.9)'} 40%, rgba(30,28,42,0.8) 100%)`
    : 'linear-gradient(165deg, rgba(25,25,28,0.7) 0%, rgba(18,18,22,0.8) 50%, rgba(22,22,26,0.7) 100%)';

/* Stone grain overlay */
const grainOverlay = 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 30%, rgba(255,255,255,0.015) 60%, transparent 100%)';

const ArcaneCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;

  const shape = CAT_SHAPE[element.cat] || 'tablet';
  const { w, h } = ARCANE_CARD_SIZES[shape];

  const runeSymbol = cardDisplay?.centerLabel ?? element.symbol;
  const tomeTitle  = cardDisplay?.displayName ?? element.service ?? element.name;
  const shortName  = (tomeTitle.length > 10 ? tomeTitle.slice(0, 9) + '\u2026' : tomeTitle).toUpperCase();

  const glowIntensity = stats.online ? 12 : 0;
  const glowColor = cat.glow || 'rgba(180,100,255,0.4)';
  const boxShadow = stats.online
    ? `0 0 ${glowIntensity}px ${glowColor}, 0 0 ${glowIntensity * 2}px ${glowColor.replace(/[\d.]+\)$/, '0.15)')}`
    : 'none';



  /* Font sizes scale with card variant */
  const runeSize  = shape === 'monolith' ? 20 : shape === 'tablet' ? 17 : 14;
  const labelSize = shape === 'monolith' ? 7  : shape === 'tablet' ? 7  : 6;
  const nameSize  = shape === 'monolith' ? 9  : shape === 'tablet' ? 8  : 7;
  const botSize   = shape === 'monolith' ? 7  : shape === 'tablet' ? 7  : 6;
  const topOffset = shape === 'monolith' ? 14 : shape === 'tablet' ? 12 : 8;

  const ariaLabel = `${element.service || element.name}: ${stats.online ? 'online' : 'offline'}`;

  return (
    <motion.button
      className="cursor-pointer relative select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      aria-label={ariaLabel}
      style={{
        width: w,
        height: h,
        overflow: 'visible',
        clipPath: CLIP_PATHS[shape],
        background: stoneGradient(stats.online, cat.bg),
        boxShadow,
        filter: isOffline ? 'grayscale(0.65) brightness(0.7)' : 'none',
        border: 'none',
        padding: 0,
        position: 'relative',
      }}
      title={element.service || element.name}
      onClick={() => onClick(element)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.08, zIndex: 20, rotateY: -6, rotateX: 3 }}
    >
      {/* Stone grain texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: grainOverlay,
        clipPath: CLIP_PATHS[shape],
        pointerEvents: 'none',
      }} />

      {/* Runic border — faint inset line following stone edge */}
      <div style={{
        position: 'absolute', inset: 2,
        clipPath: BORDER_CLIPS[shape],
        border: `1px solid ${isOffline ? 'rgba(255,255,255,0.04)' : (cat.border + '33')}`,
        pointerEvents: 'none',
        borderRadius: 0,
      }} />

      {/* Arcane energy glow when online */}
      {stats.online && !prefersReducedMotion && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: '60%', height: '40%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${glowColor.replace(/[\d.]+\)$/, '0.12)')} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Top label — tome classification */}
      <div style={{
        position: 'absolute', top: 4, left: 5, right: 5,
        fontSize: labelSize, fontFamily: MONO,
        color: isOffline ? 'rgba(255,255,255,0.2)' : cat.text,
        opacity: 0.8, letterSpacing: '0.05em',
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        textAlign: 'left', lineHeight: 1,
      }}>
        {cardDisplay?.topLeft ?? element.symbol}
      </div>

      {/* Status dot top-right — WCAG 1.4.1 */}
      <div style={{ position: 'absolute', top: 3, right: 3 }}>
        <StatusDot online={stats.online} stale={stats.stale} size={8} />
      </div>

      {/* Large carved rune glyph center */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: topOffset,
        position: 'relative',
      }}>
        <span style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: runeSize,
          fontWeight: 'bold',
          color: stats.online ? cat.text : 'rgba(255,255,255,0.15)',
          textShadow: stats.online
            ? `0 0 8px ${glowColor}, 0 0 16px ${glowColor.replace(/[\d.]+\)$/, '0.25)')}, 0 1px 2px rgba(0,0,0,0.6)`
            : '0 1px 2px rgba(0,0,0,0.4)',
          lineHeight: 1,
          letterSpacing: '0.02em',
        }}>
          {runeSymbol}
        </span>
      </div>

      {/* Short display name below glyph */}
      <div style={{
        textAlign: 'center',
        fontSize: nameSize,
        color: isOffline ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.65)',
        letterSpacing: '0.04em',
        marginTop: 3,
        fontFamily: MONO,
        lineHeight: 1,
        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        padding: '0 3px',
      }}>
        {shortName}
      </div>

      {/* Bottom label */}
      <div style={{
        position: 'absolute', bottom: 4, left: 0, right: 0,
        textAlign: 'center',
        fontSize: botSize, fontFamily: MONO,
        color: isOffline ? 'rgba(255,255,255,0.15)' : cat.text,
        opacity: 0.55, lineHeight: 1,
      }}>
        {cardDisplay?.bottomLabel ?? element.mass}
      </div>
    </motion.button>
  );
};

export default ArcaneCard;
