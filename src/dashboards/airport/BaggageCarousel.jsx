import React, { useState, useId } from 'react';
import { motion } from 'framer-motion';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * BaggageCarousel — AIRPORT-mode RAM diagram (replaces CoordComplex).
 * Top-down view of a circular baggage claim belt. Bags accumulate
 * proportional to RAM usage. Critical: belt jams, "CAROUSEL FULL" warning.
 *
 * Props match CoordComplex interface:
 *   label, level, online, details, metal, lowSpin, size
 */
const BaggageCarousel = ({ label, level, online, details = [], metal = 'Fe', lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const gradId = useId();

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const isCpu = metal === 'Fe' || metal === 'Cu';
  const hue = isCpu
    ? 45 - (level / 100) * 35
    : 50 - (level / 100) * 30;
  const color = online ? `hsl(${hue}, 85%, ${50 + (level / 100) * 20}%)` : '#6b7280';

  const act = level / 100;
  const showJam = level > 85 && online;

  const fuelLabel = level < 25 ? 'Low' : level < 50 ? 'Quarter' : level < 75 ? 'Half' : 'Full';

  // Bags around the carousel — up to 12 positions
  const totalSlots = 12;
  const filledSlots = Math.ceil(act * totalSlots);
  const beltRadius = 24;

  const bags = Array.from({ length: totalSlots }, (_, i) => {
    const angle = (i / totalSlots) * Math.PI * 2 - Math.PI / 2;
    const bx = 50 + beltRadius * Math.cos(angle);
    const by = 50 + beltRadius * Math.sin(angle);
    const filled = i < filledSlots;
    // Bag shape variation
    const bagW = 4 + (i % 3);
    const bagH = 3 + (i % 2);
    const rotation = (angle * 180 / Math.PI) + 90;
    return { bx, by, filled, bagW, bagH, rotation, angle };
  });

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-1"
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          ...(tooltipAbove ? { bottom: 'calc(100% + 8px)', top: 'auto' } : { top: 'calc(100% + 8px)', bottom: 'auto' }),
          left: '50%', transform: 'translateX(-50%)', zIndex: 50,
          minWidth: 140, background: 'rgba(0,0,0,0.88)',
          border: `1px solid ${color}`, borderRadius: 8,
          padding: '8px 10px', backdropFilter: 'blur(8px)',
          boxShadow: `0 0 12px ${color}40`, pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.3em', marginBottom: 3 }}>
            CAROUSEL ◆ {isCpu ? 'THRUST' : 'FUEL'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {filledSlots}/{totalSlots} bags · {fuelLabel}
          </div>
          {details.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>{d.label}</span>
              <span style={{ color }}>{d.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: online ? color : '#374151' }} />
            <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
              {online ? 'ONLINE' : online === null ? 'STARTING' : 'OFFLINE'}
            </span>
          </div>
        </div>
      )}

      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}
        role="img" aria-label={`${label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>
        <defs>
          <radialGradient id={`${gradId}-belt`}>
            <stop offset="70%" stopColor="transparent" />
            <stop offset="72%" stopColor={color} stopOpacity={0.06} />
            <stop offset="80%" stopColor={color} stopOpacity={0.08} />
            <stop offset="82%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Carousel belt track (oval) */}
        <circle cx={50} cy={50} r={beltRadius + 4} fill="none"
          stroke={color} strokeWidth="0.4" opacity={0.1} />
        <circle cx={50} cy={50} r={beltRadius - 4} fill="none"
          stroke={color} strokeWidth="0.4" opacity={0.1} />

        {/* Belt surface */}
        <circle cx={50} cy={50} r={beltRadius} fill="none"
          stroke={color} strokeWidth="8" opacity={0.04} />

        {/* Belt segment markers */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x1 = 50 + (beltRadius - 4) * Math.cos(angle);
          const y1 = 50 + (beltRadius - 4) * Math.sin(angle);
          const x2 = 50 + (beltRadius + 4) * Math.cos(angle);
          const y2 = 50 + (beltRadius + 4) * Math.sin(angle);
          return (
            <line key={`seg-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color} strokeWidth="0.2" opacity={0.06} />
          );
        })}

        {/* Belt rotation animation wrapper */}
        {online && !prefersReducedMotion ? (
          <motion.g
            animate={{ rotate: [0, 360] }}
            transition={{ duration: showJam ? 20 : 12 - act * 6, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '50px 50px' }}
          >
            {/* Bags on belt */}
            {bags.map((bag, i) => (
              bag.filled && (
                <g key={`bag-${i}`}
                  transform={`translate(${bag.bx}, ${bag.by}) rotate(${bag.rotation})`}>
                  <rect x={-bag.bagW / 2} y={-bag.bagH / 2}
                    width={bag.bagW} height={bag.bagH} rx={0.8}
                    fill={color} opacity={0.25 + act * 0.15}
                    stroke={color} strokeWidth="0.3" />
                  {/* Handle */}
                  <line x1={0} y1={-bag.bagH / 2} x2={0} y2={-bag.bagH / 2 - 1.5}
                    stroke={color} strokeWidth="0.4" opacity={0.2} />
                </g>
              )
            ))}
          </motion.g>
        ) : (
          <g>
            {bags.map((bag, i) => (
              bag.filled && (
                <g key={`bag-${i}`}
                  transform={`translate(${bag.bx}, ${bag.by}) rotate(${bag.rotation})`}>
                  <rect x={-bag.bagW / 2} y={-bag.bagH / 2}
                    width={bag.bagW} height={bag.bagH} rx={0.8}
                    fill={color} opacity={0.25 + act * 0.15}
                    stroke={color} strokeWidth="0.3" />
                  <line x1={0} y1={-bag.bagH / 2} x2={0} y2={-bag.bagH / 2 - 1.5}
                    stroke={color} strokeWidth="0.4" opacity={0.2} />
                </g>
              )
            ))}
          </g>
        )}

        {/* Center hub / chute opening */}
        <circle cx={50} cy={50} r={8} fill={color} opacity={0.03}
          stroke={color} strokeWidth="0.6" />
        <text x={50} y={51.5} textAnchor="middle" fill={color}
          fontSize="4" fontFamily={MONO} opacity={0.3}>
          {filledSlots}
        </text>

        {/* Carousel number designation */}
        <text x={50} y={17} textAnchor="middle" fill={color}
          fontSize="3.5" fontFamily={MONO} opacity={0.25} letterSpacing="0.15em">
          CAROUSEL
        </text>

        {/* Jam / overflow warning at critical */}
        {showJam && (() => {
          const jamScale = (level - 85) / 15;
          const jam = (
            <g>
              {/* Spilled bags outside belt */}
              <rect x={78} y={46} width={5} height={3.5} rx={0.5}
                fill={color} opacity={0.2 + jamScale * 0.2}
                transform="rotate(15, 80, 47)" />
              <rect x={16} y={52} width={4.5} height={3} rx={0.5}
                fill={color} opacity={0.15 + jamScale * 0.2}
                transform="rotate(-20, 18, 53)" />
              {/* Warning text */}
              <text x={50} y={90} textAnchor="middle" fill={color}
                fontSize="3.5" fontFamily={MONO} opacity={0.4 + jamScale * 0.4}
                letterSpacing="0.15em">
                CAROUSEL FULL
              </text>
            </g>
          );
          return prefersReducedMotion ? jam : (
            <motion.g
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {jam}
            </motion.g>
          );
        })()}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{fuelLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {filledSlots}/{totalSlots} Bags
      </div>
    </div>
  );
};

export default BaggageCarousel;
