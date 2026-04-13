import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import StatusDot from '../../components/StatusDot.jsx';

const MONO = 'monospace';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

function idHash(id) {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Category → cell type mapping
const CAT_TYPE = {
  NOBLE: 'neuron', LANTHANIDE: 'neuron',
  TRANSITION: 'blood', ALKALI: 'blood', ALKALINE: 'blood',
  CHALCOGEN: 'amoeba', METALLOID: 'amoeba', PNICTOGEN: 'amoeba',
  NONMETAL: 'bacteria', HALOGEN: 'bacteria', POST: 'bacteria', ACTINIDE: 'bacteria',
};

export const BIO_CARD_SIZES = {
  neuron: 70,
  blood: 60,
  amoeba: 55,
  bacteria: { w: 50, h: 30 },
};

// Outer shape styles per cell type
function getCellShape(cellType) {
  switch (cellType) {
    case 'neuron':
      return {
        width: 70, height: 70,
        borderRadius: '48% 52% 45% 55% / 50% 46% 54% 50%',
      };
    case 'blood':
      return {
        width: 60, height: 60,
        // Biconcave disc — flattened circle
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      };
    case 'amoeba':
      return {
        width: 55, height: 55,
        // Irregular blob
        borderRadius: '42% 58% 37% 63% / 55% 40% 60% 45%',
      };
    case 'bacteria':
      return {
        width: 50, height: 30,
        // Rod/pill shape
        borderRadius: '50%',
      };
    default:
      return { width: 55, height: 55, borderRadius: '48% 52% 45% 55% / 50% 46% 54% 50%' };
  }
}

// Deterministic organelle dot positions
function getOrganelleDots(hash, cellType) {
  const count = 2 + (hash % 2); // 2 or 3 dots
  const dots = [];
  const isRod = cellType === 'bacteria';
  for (let i = 0; i < count; i++) {
    const seed = hash + i * 7919;
    const px = 20 + ((seed * 13) % 60); // 20-80% range
    const py = isRod ? 25 + ((seed * 17) % 50) : 20 + ((seed * 17) % 60);
    const size = 2 + ((seed * 3) % 3); // 2-4px
    dots.push({ left: `${px}%`, top: `${py}%`, size });
  }
  return dots;
}

// Nucleus position offset (off-center, deterministic)
function getNucleusOffset(hash) {
  const ox = -4 + (hash % 9); // -4 to +4
  const oy = -3 + ((hash >> 3) % 7); // -3 to +3
  return { ox, oy };
}

const BioCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const isOffline = !stats.online;
  const cellType = CAT_TYPE[element.cat] || 'amoeba';
  const shape = getCellShape(cellType);
  const hash = idHash(element.id);

  const bioSymbol = cardDisplay?.topLeft ?? element.symbol;
  const organelleName = cardDisplay?.displayName ?? element.service ?? element.name;
  const shortName = (organelleName.length > 10 ? organelleName.slice(0, 9) + '\u2026' : organelleName).toUpperCase();
  const bottomLabel = cardDisplay?.bottomLabel ?? element.mass;

  const nucleusOffset = getNucleusOffset(hash);
  const organelleDots = getOrganelleDots(hash, cellType);

  // Cytoplasm gradient
  const bgGradient = isOffline
    ? 'radial-gradient(ellipse at 45% 45%, rgba(20,20,30,0.6), rgba(10,10,20,0.4))'
    : `radial-gradient(ellipse at 45% 45%, ${cat.bg}, ${cat.glow.replace(/[\d.]+\)$/, '0.12)')})`;

  // Cell membrane: semi-transparent double border effect
  const outerBorder = isOffline
    ? '2px solid rgba(239,68,68,0.25)'
    : `2px solid ${cat.border}44`;
  const innerBorder = isOffline
    ? '1px solid rgba(239,68,68,0.1)'
    : `1px solid ${cat.border}22`;

  const boxShadow = stats.online
    ? `0 0 14px ${cat.glow}, inset 0 0 20px ${cat.glow.replace(/[\d.]+\)$/, '0.06)')}`
    : 'none';



  // Cell division pinch animation
  const divisionAnimation = stats.online && !prefersReducedMotion
    ? {
        scaleX: [1, 1.03, 0.97, 1],
        scaleY: [1, 0.97, 1.03, 1],
      }
    : {};
  const divisionTransition = stats.online && !prefersReducedMotion
    ? { duration: 4 + (hash % 3), repeat: Infinity, ease: 'easeInOut', delay: (hash % 20) * 0.15 }
    : {};

  // Nucleus size scales with cell type
  const nucleusR = cellType === 'neuron' ? 8 : cellType === 'blood' ? 6 : cellType === 'amoeba' ? 7 : 5;

  return (
    <motion.button
      className="cursor-pointer relative select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        ...shape,
        overflow: 'visible',
        background: bgGradient,
        border: outerBorder,
        filter: isOffline ? 'grayscale(0.6)' : 'none',
        boxShadow,
        opacity: 1,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
      aria-label={`${element.service || element.name}: ${stats.online ? 'online' : 'offline'}`}
      tabIndex={0}
      title={element.service || element.name}
      onClick={() => onClick(element)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(element); } }}
      whileHover={{ scale: 1.12, zIndex: 20, rotateY: 2, rotateX: -3 }}
      animate={divisionAnimation}
      transition={divisionTransition}
    >
      {/* Inner membrane ring (double-line effect) */}
      <div style={{
        position: 'absolute',
        inset: 3,
        borderRadius: 'inherit',
        border: innerBorder,
        pointerEvents: 'none',
      }} />

      {/* Bio symbol top-left */}
      <div style={{
        position: 'absolute',
        top: cellType === 'bacteria' ? 2 : 6,
        left: cellType === 'bacteria' ? 6 : 8,
        fontSize: 7,
        fontFamily: MONO,
        color: cat.text,
        opacity: 0.8,
        lineHeight: 1,
      }}>
        {bioSymbol}
      </div>

      {/* Status dot top-right */}
      {/* Status dot — WCAG 1.4.1 */}
      <div style={{
        position: 'absolute',
        top: cellType === 'bacteria' ? 2 : 5,
        right: cellType === 'bacteria' ? 4 : 6,
      }}>
        <StatusDot online={stats.online} stale={stats.stale} size={8} />
      </div>

      {/* Organelle dots (deterministic) */}
      {organelleDots.map((dot, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: dot.left,
          top: dot.top,
          width: dot.size,
          height: dot.size,
          borderRadius: '50%',
          background: stats.online
            ? cat.glow.replace(/[\d.]+\)$/, `${0.25 + (i * 0.1)})`)
            : 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Nucleus (off-center, bright dot with radial gradient) */}
      <div style={{
        width: nucleusR * 2,
        height: nucleusR * 2,
        borderRadius: '50%',
        background: stats.online
          ? `radial-gradient(circle at 40% 40%, ${cat.text}, ${cat.glow.replace(/[\d.]+\)$/, '0.3)')})`
          : 'rgba(255,255,255,0.08)',
        boxShadow: stats.online ? `0 0 10px ${cat.glow}` : 'none',
        position: 'relative',
        top: nucleusOffset.oy,
        left: nucleusOffset.ox,
        flexShrink: 0,
      }} />

      {/* Display name below nucleus */}
      <div style={{
        textAlign: 'center',
        fontSize: cellType === 'bacteria' ? 6 : 8,
        color: 'rgba(255,255,255,0.65)',
        letterSpacing: '0.03em',
        marginTop: cellType === 'bacteria' ? 0 : 2,
        fontFamily: MONO,
        lineHeight: 1,
        position: 'relative',
        top: nucleusOffset.oy * 0.3,
        maxWidth: '90%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {shortName}
      </div>

      {/* Bottom label */}
      <div style={{
        position: 'absolute',
        bottom: cellType === 'bacteria' ? 2 : 5,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: cellType === 'bacteria' ? 5 : 7,
        fontFamily: MONO,
        color: cat.text,
        opacity: 0.55,
      }}>
        {bottomLabel}
      </div>

      {/* Neuron dendrite extensions (only for neuron type, online) */}
      {cellType === 'neuron' && stats.online && (
        <svg style={{
          position: 'absolute',
          inset: -12,
          width: 'calc(100% + 24px)',
          height: 'calc(100% + 24px)',
          pointerEvents: 'none',
          overflow: 'visible',
        }}>
          {[0, 72, 144, 216, 288].map((angle, i) => {
            const rad = (angle + (hash % 30)) * Math.PI / 180;
            const cx = 47, cy = 47;
            const len = 10 + (hash + i * 31) % 6;
            const x2 = cx + Math.cos(rad) * len;
            const y2 = cy + Math.sin(rad) * len;
            // Branch endpoint
            const bAngle1 = rad - 0.4;
            const bAngle2 = rad + 0.5;
            const bLen = 4 + (hash + i) % 3;
            const bx1 = x2 + Math.cos(bAngle1) * bLen;
            const by1 = y2 + Math.sin(bAngle1) * bLen;
            const bx2 = x2 + Math.cos(bAngle2) * bLen;
            const by2 = y2 + Math.sin(bAngle2) * bLen;
            return (
              <g key={i} opacity={0.3}>
                <line x1={cx} y1={cy} x2={x2} y2={y2}
                  stroke={cat.border} strokeWidth="0.8" />
                <line x1={x2} y1={y2} x2={bx1} y2={by1}
                  stroke={cat.border} strokeWidth="0.5" />
                <line x1={x2} y1={y2} x2={bx2} y2={by2}
                  stroke={cat.border} strokeWidth="0.5" />
                <circle cx={bx1} cy={by1} r="1" fill={cat.border} opacity={0.5} />
                <circle cx={bx2} cy={by2} r="1" fill={cat.border} opacity={0.5} />
              </g>
            );
          })}
        </svg>
      )}
    </motion.button>
  );
};

export default BioCard;
