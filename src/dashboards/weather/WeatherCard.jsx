import React from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// ─────────────────────────────────────────────
// SUN SHAPE — circle with radiating rays
// ─────────────────────────────────────────────
const SunVisual = ({ online, cat, size }) => (
  <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {online && Array.from({ length: 8 }, (_, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 2, height: size * 0.35,
        background: `linear-gradient(to top, ${cat.text}88, transparent)`,
        transformOrigin: '50% 0%',
        transform: `translate(-50%, 0) rotate(${i * 45}deg)`,
        borderRadius: 1,
        pointerEvents: 'none',
      }} />
    ))}
    <div style={{
      width: size * 0.48, height: size * 0.48,
      borderRadius: '50%',
      background: online
        ? `radial-gradient(circle at 38% 38%, #fffbe6, ${cat.text} 60%, ${cat.glow.replace(/[\d.]+\)$/, '0.4)')})`
        : 'rgba(255,255,255,0.06)',
      boxShadow: online ? `0 0 12px ${cat.glow}, 0 0 24px ${cat.glow.replace(/[\d.]+\)$/, '0.2)')}` : 'none',
    }} />
  </div>
);

// ─────────────────────────────────────────────
// CLOUD SHAPE — overlapping circles forming puffy cloud
// ─────────────────────────────────────────────
const CloudVisual = ({ online, cat, size, dark }) => {
  const color = online
    ? (dark ? `${cat.border}88` : `${cat.text}66`)
    : 'rgba(255,255,255,0.05)';
  const shadow = online ? `0 0 8px ${cat.glow.replace(/[\d.]+\)$/, '0.15)')}` : 'none';
  return (
    <div style={{ position: 'relative', width: size, height: size * 0.65 }}>
      <div style={{
        position: 'absolute', bottom: 0, left: '10%', width: '80%', height: '55%',
        borderRadius: size * 0.15,
        background: color, boxShadow: shadow,
      }} />
      <div style={{
        position: 'absolute', bottom: '35%', left: '12%',
        width: '35%', height: '55%', borderRadius: '50%',
        background: color, boxShadow: shadow,
      }} />
      <div style={{
        position: 'absolute', bottom: '30%', left: '30%',
        width: '40%', height: '70%', borderRadius: '50%',
        background: color, boxShadow: shadow,
      }} />
      <div style={{
        position: 'absolute', bottom: '32%', right: '12%',
        width: '32%', height: '52%', borderRadius: '50%',
        background: color, boxShadow: shadow,
      }} />
    </div>
  );
};

// ─────────────────────────────────────────────
// PARTLY CLOUDY — sun disc peeking behind cloud
// ─────────────────────────────────────────────
const PartlyCloudyVisual = ({ online, cat, size }) => (
  <div style={{ position: 'relative', width: size, height: size * 0.7 }}>
    <div style={{
      position: 'absolute', top: 0, right: '8%',
      width: size * 0.4, height: size * 0.4, borderRadius: '50%',
      background: online
        ? `radial-gradient(circle at 40% 40%, #fffbe688, ${cat.text}66 70%, transparent)`
        : 'rgba(255,255,255,0.04)',
      boxShadow: online ? `0 0 8px ${cat.glow.replace(/[\d.]+\)$/, '0.2)')}` : 'none',
    }}>
      {online && [0, 60, 120, 180, 240, 300].map(angle => (
        <div key={angle} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 1.5, height: size * 0.18,
          background: `linear-gradient(to top, ${cat.text}55, transparent)`,
          transformOrigin: '50% 0%',
          transform: `translate(-50%, 0) rotate(${angle}deg)`,
          borderRadius: 1,
        }} />
      ))}
    </div>
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '85%' }}>
      <CloudVisual online={online} cat={cat} size={size * 0.85} />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// STORM — dark cloud with lightning bolt + rain
// ─────────────────────────────────────────────
const StormVisual = ({ online, cat, size }) => (
  <div style={{ position: 'relative', width: size, height: size * 0.8 }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%' }}>
      <CloudVisual online={online} cat={cat} size={size} dark />
    </div>
    {online && (
      <svg style={{ position: 'absolute', bottom: 0, left: '35%', width: size * 0.3, height: size * 0.4, overflow: 'visible' }} viewBox="0 0 20 30">
        <polygon
          points="10,0 3,14 9,14 6,30 18,12 11,12 16,0"
          fill={cat.text}
          opacity="0.85"
        />
      </svg>
    )}
    {online && !prefersReducedMotion && [0.25, 0.45, 0.65].map((xPct, i) => (
      <motion.div key={i} style={{
        position: 'absolute', left: `${xPct * 100}%`, bottom: '5%',
        width: 1.5, height: 6, borderRadius: 1,
        background: `${cat.border}66`,
      }}
        animate={{ y: [0, 10], opacity: [0.7, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2, ease: 'easeIn' }}
      />
    ))}
  </div>
);

// ─────────────────────────────────────────────
// SNOWFLAKE — 6-pointed crystal
// ─────────────────────────────────────────────
const SnowVisual = ({ online, cat, size }) => {
  const armLen = size * 0.36;
  const color = online ? cat.text : 'rgba(255,255,255,0.08)';
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: 1.5, height: armLen,
          background: color,
          transformOrigin: '50% 0%',
          transform: `translate(-50%, 0) rotate(${i * 60}deg)`,
          borderRadius: 1,
          opacity: online ? 0.7 : 0.2,
        }}>
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            width: 1, height: armLen * 0.35,
            background: color, opacity: 0.5,
            transformOrigin: '50% 100%',
            transform: 'translate(-50%, -100%) rotate(45deg)',
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            width: 1, height: armLen * 0.35,
            background: color, opacity: 0.5,
            transformOrigin: '50% 100%',
            transform: 'translate(-50%, -100%) rotate(-45deg)',
          }} />
        </div>
      ))}
      <div style={{
        width: 5, height: 5, borderRadius: '50%',
        background: color,
        boxShadow: online ? `0 0 6px ${cat.glow}` : 'none',
        position: 'relative', zIndex: 1,
      }} />
    </div>
  );
};

// ─────────────────────────────────────────────
// LIGHTNING — bolt shape
// ─────────────────────────────────────────────
const LightningVisual = ({ online, cat, size }) => (
  <div style={{ position: 'relative', width: size * 0.6, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size * 0.5} height={size * 0.8} viewBox="0 0 24 40" style={{ overflow: 'visible' }}>
      <polygon
        points="13,0 4,18 11,18 7,40 22,16 14,16 20,0"
        fill={online ? cat.text : 'rgba(255,255,255,0.08)'}
        opacity={online ? 0.9 : 0.2}
      />
    </svg>
  </div>
);

// ─────────────────────────────────────────────
// WAVE — three wavy lines (acoustic fronts)
// ─────────────────────────────────────────────
const WaveVisual = ({ online, cat, size }) => (
  <div style={{ position: 'relative', width: size, height: size * 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
    {[0, 1, 2].map(i => (
      <svg key={i} width={size * 0.7} height={8} viewBox="0 0 40 8">
        <path
          d="M0,4 Q5,0 10,4 Q15,8 20,4 Q25,0 30,4 Q35,8 40,4"
          stroke={online ? cat.text : 'rgba(255,255,255,0.08)'}
          strokeWidth="1.5"
          fill="none"
          opacity={online ? 0.6 - i * 0.12 : 0.15}
        />
      </svg>
    ))}
  </div>
);

// Map weatherSymbol → visual component
const SYMBOL_VISUAL = {
  '☀': SunVisual,
  '⛅': PartlyCloudyVisual,
  '☁': CloudVisual,
  '⛈': StormVisual,
  '❄': SnowVisual,
  '⚡': LightningVisual,
  '≋': WaveVisual,
};

// ─────────────────────────────────────────────
// WEATHER CARD — card shape IS the weather symbol
// ─────────────────────────────────────────────
const WeatherCard = ({ element, stats, onClick, cardDisplay }) => {
  const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
  const online = stats?.online ?? false;

  const stationId = cardDisplay?.topLeft ?? element.symbol;
  const symbolChar = cardDisplay?.centerLabel ?? '☁';
  const phenomena = cardDisplay?.displayName ?? element.service ?? element.name;
  const weatherType = cardDisplay?.bottomLabel ?? element.mass;
  const shortName = (phenomena.length > 10 ? phenomena.slice(0, 9) + '…' : phenomena).toUpperCase();

  const Visual = SYMBOL_VISUAL[symbolChar] || SYMBOL_VISUAL['☁'];
  const baseSize = 62;

  return (
    <motion.button
      aria-label={`${element.service || element.name} — ${shortName}`}
      onClick={() => onClick(element)}
      whileHover={prefersReducedMotion ? {} : { scale: 1.15, zIndex: 80, rotateY: 3, rotateX: -4 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
      style={{
        width: 72, height: 80, transformPerspective: 800,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
        padding: 0,
        filter: online ? 'none' : 'grayscale(0.5) brightness(0.5)',
      }}
    >
      {/* Station ID — top */}
      <div style={{
        position: 'absolute', top: 0,
        fontSize: 6, fontFamily: MONO, color: cat.text,
        opacity: 0.65, whiteSpace: 'nowrap', letterSpacing: '0.05em',
      }}>
        {stationId}
      </div>

      {/* Weather symbol visual */}
      <Visual online={online} cat={cat} size={baseSize} />

      {/* Phenomena name */}
      <div style={{
        position: 'absolute', bottom: 8,
        fontSize: 7, fontFamily: MONO,
        color: 'rgba(255,255,255,0.55)',
        whiteSpace: 'nowrap', letterSpacing: '0.03em', lineHeight: 1,
      }}>
        {shortName}
      </div>

      {/* Weather type */}
      <div style={{
        position: 'absolute', bottom: 0,
        fontSize: 5.5, fontFamily: MONO, color: cat.text, opacity: 0.4,
        whiteSpace: 'nowrap',
      }}>
        {weatherType}
      </div>
    </motion.button>
  );
};

export default WeatherCard;
