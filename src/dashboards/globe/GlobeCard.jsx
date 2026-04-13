import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

// ACC-03: module-level check matches StarCard/NeuralCard pattern — WCAG 2.3.3
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

// Continent patch sets by category group
const CONTINENT_PATCHES = {
  americas: [
    // North America blob
    'M12,11 Q14,9 17,10 L18,13 Q17,16 15,17 L12,15 Z',
    // South America blob
    'M14,19 Q16,18 17,20 L16,24 Q14,25 13,23 Z',
  ],
  eurafr: [
    // Europe blob
    'M20,10 Q22,9 24,10 L24,13 Q22,14 20,13 Z',
    // Africa blob
    'M21,15 Q23,14 24,16 L23,21 Q21,22 20,19 Z',
  ],
  asia: [
    // Asia blob
    'M25,10 Q28,8 31,10 L30,14 Q28,16 25,14 Z',
    // SE Asia/Oceania
    'M28,17 Q30,16 31,18 L30,20 Q28,20 28,17 Z',
  ],
  islands: [
    // Scattered island dots (small circles via paths)
    'M11,20 A1,1 0 1,1 11.01,20',
    'M26,22 A1,1 0 1,1 26.01,22',
    'M18,8 A1,1 0 1,1 18.01,8',
    'M30,12 A1,1 0 1,1 30.01,12',
  ],
};

function getContinentGroup(cat) {
  if (cat === 'NOBLE' || cat === 'LANTHANIDE') return 'americas';
  if (cat === 'TRANSITION' || cat === 'ALKALI' || cat === 'ALKALINE') return 'eurafr';
  if (cat === 'CHALCOGEN' || cat === 'METALLOID' || cat === 'PNICTOGEN') return 'asia';
  return 'islands';
}

const GLOBE_SIZE = 64;

const GlobeCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;
  const continentGroup = getContinentGroup(element.cat);
  const patches = CONTINENT_PATCHES[continentGroup];

  const topLabel = cardDisplay?.topLeft ?? element.number;
  const centerLabel = cardDisplay?.centerLabel ?? element.symbol;
  const bottomLabel = cardDisplay?.bottomLabel ?? element.name?.slice(0, 6) ?? '';

  return (
    <motion.button
      onClick={onClick}
      // ACC-01: aria-label provides screen readers the service name
      aria-label={element.service ?? element.name}
      // ACC-03: suppress scale animations when user prefers reduced motion
      whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotateY: -5, rotateX: 3 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      // ACC-02: focus-visible outline — WCAG 2.4.7
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: GLOBE_SIZE, transformPerspective: 800,
        height: GLOBE_SIZE + 24, // extra space for top + bottom labels
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        padding: 0,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Top label — floating above sphere */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 7,
        color: online ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)',
        letterSpacing: '0.1em',
        lineHeight: 1,
        marginBottom: 2,
        height: 9,
      }}>
        {topLabel}
      </div>

      {/* Globe sphere container */}
      <div style={{
        position: 'relative',
        width: GLOBE_SIZE,
        height: GLOBE_SIZE,
      }}>
        {/* Atmospheric halo — faint blue glow ring */}
        {online && (
          <div style={{
            position: 'absolute',
            inset: -3,
            borderRadius: '50%',
            background: 'transparent',
            boxShadow: `0 0 8px 2px ${cat.glow ?? 'rgba(100,180,255,0.15)'}`,
            pointerEvents: 'none',
          }} />
        )}

        {/* SVG globe */}
        <svg
          viewBox="0 0 40 40"
          style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, display: 'block' }}
          role="img"
          aria-hidden="true"
        >
          <defs>
            {/* Sphere lighting gradient */}
            <radialGradient id={`globe-light-${element.id}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor={online ? cat.bg : '#1f2937'} stopOpacity={0.95} />
              <stop offset="40%" stopColor={online ? cat.bg : '#111827'} stopOpacity={0.85} />
              <stop offset="100%" stopColor={online ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.85)'} stopOpacity={1} />
            </radialGradient>
            {/* Specular highlight */}
            <radialGradient id={`globe-spec-${element.id}`} cx="30%" cy="25%" r="30%">
              <stop offset="0%" stopColor="white" stopOpacity={online ? 0.18 : 0.04} />
              <stop offset="100%" stopColor="white" stopOpacity={0} />
            </radialGradient>
            {/* Clip to sphere */}
            <clipPath id={`globe-clip-${element.id}`}>
              <circle cx="20" cy="20" r="19" />
            </clipPath>
          </defs>

          {/* Sphere base */}
          <circle cx="20" cy="20" r="19"
            fill={`url(#globe-light-${element.id})`}
            stroke={online ? cat.border : 'rgba(255,255,255,0.08)'}
            strokeWidth="0.6"
          />

          {/* Clipped group: lat/lon lines + continents */}
          <g clipPath={`url(#globe-clip-${element.id})`}>
            {/* Latitude lines (3 horizontal ellipses) */}
            {/* Equator */}
            <ellipse cx="20" cy="20" rx="19" ry="2"
              fill="none" stroke={online ? cat.border : 'rgba(255,255,255,0.06)'}
              strokeWidth="0.4" opacity={online ? 0.25 : 0.08} />
            {/* Tropic of Cancer */}
            <ellipse cx="20" cy="13" rx="16" ry="1.8"
              fill="none" stroke={online ? cat.border : 'rgba(255,255,255,0.05)'}
              strokeWidth="0.35" opacity={online ? 0.18 : 0.06} />
            {/* Tropic of Capricorn */}
            <ellipse cx="20" cy="27" rx="16" ry="1.8"
              fill="none" stroke={online ? cat.border : 'rgba(255,255,255,0.05)'}
              strokeWidth="0.35" opacity={online ? 0.18 : 0.06} />

            {/* Longitude lines (3 vertical ellipses / meridians) */}
            <ellipse cx="20" cy="20" rx="2" ry="19"
              fill="none" stroke={online ? cat.border : 'rgba(255,255,255,0.06)'}
              strokeWidth="0.4" opacity={online ? 0.22 : 0.07} />
            <ellipse cx="20" cy="20" rx="10" ry="19"
              fill="none" stroke={online ? cat.border : 'rgba(255,255,255,0.05)'}
              strokeWidth="0.35" opacity={online ? 0.15 : 0.05} />
            <ellipse cx="20" cy="20" rx="16" ry="19"
              fill="none" stroke={online ? cat.border : 'rgba(255,255,255,0.05)'}
              strokeWidth="0.35" opacity={online ? 0.12 : 0.04} />

            {/* Continent patches */}
            {online && !prefersReducedMotion ? (
              <motion.g
                animate={{ x: [-0.5, 0.5, -0.5] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
              >
                {patches.map((d, i) => (
                  <path key={i} d={d}
                    fill={cat.text}
                    opacity={0.35}
                    stroke={cat.text}
                    strokeWidth="0.3"
                  />
                ))}
              </motion.g>
            ) : (
              <g>
                {patches.map((d, i) => (
                  <path key={i} d={d}
                    fill={online ? cat.text : 'rgba(255,255,255,0.06)'}
                    opacity={online ? 0.35 : 0.1}
                    stroke={online ? cat.text : 'rgba(255,255,255,0.04)'}
                    strokeWidth="0.3"
                  />
                ))}
              </g>
            )}
          </g>

          {/* Specular highlight overlay */}
          <circle cx="20" cy="20" r="19"
            fill={`url(#globe-spec-${element.id})`} />

          {/* Center label on sphere */}
          <text x="20" y="22" textAnchor="middle"
            fontFamily="monospace" fontSize="6" fontWeight="700"
            fill={online ? cat.text : 'rgba(255,255,255,0.2)'}
            opacity={online ? 0.9 : 0.35}
            style={{ textShadow: online ? `0 0 4px ${cat.glow ?? 'rgba(0,0,0,0.8)'}` : 'none' }}
          >
            {centerLabel}
          </text>
        </svg>
      </div>

      {/* Bottom label — below sphere */}
      <div style={{
        fontFamily: 'monospace',
        fontSize: 7,
        color: online ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)',
        letterSpacing: '0.05em',
        lineHeight: 1,
        marginTop: 2,
        height: 9,
        maxWidth: GLOBE_SIZE,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {bottomLabel}
      </div>
    </motion.button>
  );
};

export default GlobeCard;
