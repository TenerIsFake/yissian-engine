import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

function idHash(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Evidence type by category
const CAT_TYPE = {
  NOBLE: 'mugshot', LANTHANIDE: 'mugshot',
  TRANSITION: 'evidence', ALKALI: 'evidence', ALKALINE: 'evidence',
  CHALCOGEN: 'evidence', METALLOID: 'evidence', PNICTOGEN: 'evidence',
  NONMETAL: 'note', HALOGEN: 'note', POST: 'note', ACTINIDE: 'note',
};

export const NOIR_CARD_SIZES = {
  mugshot:  { w: 64, h: 78 },
  evidence: { w: 56, h: 70 },
  note:     { w: 48, h: 56 },
};

const NoirCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const evidenceType = CAT_TYPE[element.cat] || 'evidence';
  const { w, h } = NOIR_CARD_SIZES[evidenceType];

  const caseNum    = cardDisplay?.topLeft ?? element.symbol;
  const alias      = cardDisplay?.displayName ?? element.service ?? element.name;
  const shortAlias = alias.replace(/^THE /, '');
  const displayName = (shortAlias.length > 10 ? shortAlias.slice(0, 9) + '\u2026' : shortAlias).toUpperCase();
  const bottomLabel = cardDisplay?.bottomLabel ?? element.mass;

  const id = element.id || element.symbol || element.name;
  const rotation = (idHash(id) % 7) - 3; // -3 to +3 degrees

  // Dimensions for the photo area vs white border
  const borderSide = 3;
  const borderBottom = evidenceType === 'note' ? 0 : 14; // notes have no polaroid strip
  const borderTop = 3;
  const photoW = w - borderSide * 2;
  const photoH = h - borderTop - borderBottom;

  // Sepia gradient for online, grayscale for offline
  const photoGradient = isOffline
    ? 'linear-gradient(135deg, rgba(60,60,60,0.9), rgba(40,40,40,0.7))'
    : 'linear-gradient(135deg, rgba(180,140,80,0.25), rgba(120,85,50,0.35), rgba(90,65,40,0.25))';

  const filterStyle = isOffline ? 'grayscale(1) brightness(0.6)' : 'none';

  // Note style: lined paper
  const isNote = evidenceType === 'note';
  // Mugshot: slightly different pin
  const isMugshot = evidenceType === 'mugshot';

  return (
    <motion.button
      className="cursor-pointer select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      aria-label={`${displayName} - ${caseNum} - ${stats.online ? 'online' : 'offline'}`}
      style={{
        position: 'relative',
        width: w,
        height: h,
        overflow: 'visible',
        background: 'none',
        border: 'none',
        padding: 0,
        transform: `rotate(${rotation}deg)`,
        filter: filterStyle,
      }}
      onClick={() => onClick(element)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.12, zIndex: 30, rotate: 0, rotateY: -5, rotateX: 2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
    >
      {/* Card body — polaroid / evidence / note */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: isNote ? '2px 2px 1px 6px' : 2,
        background: isNote
          ? 'linear-gradient(to bottom, rgba(240,230,200,0.92), rgba(220,210,185,0.88))'
          : 'rgba(245,240,230,0.93)',
        boxShadow: '2px 3px 8px rgba(0,0,0,0.5)',
      }}>

        {/* Photo area */}
        {!isNote && (
          <div style={{
            position: 'absolute',
            top: borderTop,
            left: borderSide,
            width: photoW,
            height: photoH,
            background: photoGradient,
            borderRadius: 1,
          }}>
            {/* Magnifying glass icon (center of photo) */}
            <svg
              viewBox="0 0 24 24"
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isMugshot ? 22 : 18,
                height: isMugshot ? 22 : 18,
                opacity: stats.online ? 0.5 : 0.15,
              }}
            >
              <circle cx="10" cy="10" r="6" fill="none" stroke={cat.text} strokeWidth="1.5" opacity="0.6" />
              <line x1="14.5" y1="14.5" x2="20" y2="20" stroke={cat.text} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              {/* Cross-hair inside lens */}
              <line x1="10" y1="6" x2="10" y2="14" stroke={cat.text} strokeWidth="0.5" opacity="0.3" />
              <line x1="6" y1="10" x2="14" y2="10" stroke={cat.text} strokeWidth="0.5" opacity="0.3" />
            </svg>

            {/* Mugshot height lines */}
            {isMugshot && (
              <>
                {[0.25, 0.5, 0.75].map(f => (
                  <div key={f} style={{
                    position: 'absolute',
                    left: 0, right: 0,
                    top: `${f * 100}%`,
                    height: 1,
                    background: 'rgba(0,0,0,0.08)',
                  }} />
                ))}
              </>
            )}
          </div>
        )}

        {/* Note: lined paper effect */}
        {isNote && (
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
            {/* Red margin line */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: 10,
              width: 1, background: 'rgba(200,60,60,0.25)',
            }} />
            {/* Horizontal lines */}
            {Array.from({ length: Math.floor(h / 8) }, (_, i) => (
              <div key={i} style={{
                position: 'absolute', left: 0, right: 0,
                top: 12 + i * 8,
                height: 1,
                background: 'rgba(100,140,200,0.15)',
              }} />
            ))}
            {/* Torn edge (left side) */}
            <div style={{
              position: 'absolute', top: 0, bottom: 0, left: -1,
              width: 3,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(240,230,200,0) 3%, rgba(200,190,170,0.5) 5%, transparent 8%, rgba(200,190,170,0.3) 12%, transparent 15%)',
              backgroundSize: '3px 12px',
              backgroundRepeat: 'repeat-y',
            }} />
          </div>
        )}

        {/* Tape corners (evidence type only) */}
        {evidenceType === 'evidence' && (
          <>
            {/* Top-left tape */}
            <div style={{
              position: 'absolute', top: -2, left: -2,
              width: 12, height: 6,
              background: 'rgba(200,190,150,0.4)',
              transform: 'rotate(-15deg)',
              borderRadius: 1,
            }} />
            {/* Bottom-right tape */}
            <div style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 12, height: 6,
              background: 'rgba(200,190,150,0.35)',
              transform: 'rotate(10deg)',
              borderRadius: 1,
            }} />
          </>
        )}

        {/* Case number — top-left on white border */}
        {!isNote && (
          <div style={{
            position: 'absolute',
            top: h - borderBottom + 1,
            left: borderSide + 1,
            fontSize: 5,
            fontFamily: MONO,
            color: 'rgba(80,60,40,0.7)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {caseNum}
          </div>
        )}

        {/* Note: case number at top */}
        {isNote && (
          <div style={{
            position: 'absolute',
            top: 3,
            left: 14,
            fontSize: 5,
            fontFamily: MONO,
            color: 'rgba(80,60,40,0.6)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            {caseNum}
          </div>
        )}

        {/* Display name — bottom white strip (polaroid) or center (note) */}
        {!isNote ? (
          <div style={{
            position: 'absolute',
            bottom: 1,
            left: borderSide,
            right: borderSide,
            textAlign: 'center',
            fontSize: 6.5,
            fontFamily: MONO,
            color: 'rgba(40,30,20,0.85)',
            letterSpacing: '0.1em',
            lineHeight: 1,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
            {displayName}
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            top: '40%',
            left: 14,
            right: 4,
            fontSize: 6,
            fontFamily: MONO,
            color: 'rgba(40,30,20,0.8)',
            letterSpacing: '0.08em',
            lineHeight: 1.4,
            textTransform: 'uppercase',
          }}>
            {displayName}
          </div>
        )}

        {/* Rank / mass label */}
        {!isNote && (
          <div style={{
            position: 'absolute',
            top: h - borderBottom + 1,
            right: borderSide + 1,
            fontSize: 4.5,
            fontFamily: MONO,
            color: 'rgba(80,60,40,0.5)',
            letterSpacing: '0.05em',
          }}>
            {bottomLabel}
          </div>
        )}
        {isNote && (
          <div style={{
            position: 'absolute',
            bottom: 4,
            left: 14,
            fontSize: 4.5,
            fontFamily: MONO,
            color: 'rgba(80,60,40,0.5)',
            letterSpacing: '0.05em',
          }}>
            {bottomLabel}
          </div>
        )}
      </div>

      {/* Push pin at top center */}
      <div style={{
        position: 'absolute',
        top: -4,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
      }}>
        {/* Pin head */}
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: cat.text,
          boxShadow: `0 1px 3px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(0,0,0,0.3)`,
          opacity: 0.9,
        }} />
        {/* Pin shaft */}
        <div style={{
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1.5,
          height: 4,
          background: 'rgba(180,180,180,0.6)',
          borderRadius: 1,
        }} />
      </div>

      {/* Red string hint — faint line extending upward from pin */}
      <div style={{
        position: 'absolute',
        top: -14,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 1,
        height: 12,
        background: 'linear-gradient(to bottom, rgba(200,40,40,0), rgba(200,40,40,0.25))',
        pointerEvents: 'none',
      }} />

      {/* Status indicator — small dot bottom-right */}
      <div style={{
        position: 'absolute',
        bottom: isNote ? 2 : borderBottom + 2,
        right: 4,
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: isOffline ? '#8b0000' : '#2d5a1e',
        boxShadow: isOffline
          ? '0 0 3px rgba(139,0,0,0.6)'
          : '0 0 3px rgba(45,90,30,0.6)',
        border: '0.5px solid rgba(0,0,0,0.3)',
      }} />
    </motion.button>
  );
};

export default NoirCard;
