import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { activeCATRef } from '../../themes/ThemeContext.jsx';

const MONO = 'monospace';
const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

/**
 * OrbitalTransfer — PLANET-mode bandwidth diagram (replaces JablonskiDiagram).
 * DOWNLOAD (emission / GRAVITY_PULL): Meteor shower on Hohmann transfer arcs —
 *   meteors curve inward along orbital paths with atmospheric burn trails.
 * UPLOAD (excitation / ESCAPE_VEL): Gravitational slingshot with solar wind —
 *   objects curve around planet and fling outward with particle trails.
 *
 * Props match JablonskiDiagram interface:
 *   label, level, online, details, variant, size, jablonskiLabel
 */
const OrbitalTransfer = ({ label, level, online, details = [], variant = 'excitation', size = 88, jablonskiLabel }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);
  const cat = activeCATRef.current.NOBLE;
  const isDownload = variant === 'emission';
  const act = level / 100;

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const color = online ? cat : '#6b7280';
  const showCritical = level > 85 && online;

  const tierLabel = level < 25 ? 'Idle' : level < 50 ? 'Active' : level < 75 ? 'Intense' : 'Maximum';

  // Meteor count for download / particle count for upload
  const objectCount = Math.max(1, Math.floor(act * 8));

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
            {isDownload ? 'GRAVITY ◆ PULL' : 'ESCAPE ◆ VEL'}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>
            {jablonskiLabel || label}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {tierLabel}
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
        role="img" aria-label={`${jablonskiLabel || label}: ${level.toFixed(1)}% — ${online ? 'online' : online === null ? 'starting' : 'offline'}`}>

        {/* Planet (small, at center-bottom for download, center for upload) */}
        {isDownload ? (
          <g>
            {/* Planet surface at bottom */}
            <path d="M 20,82 Q 50,70 80,82" fill={color} opacity={0.06}
              stroke={color} strokeWidth="0.6" />
            {/* Atmosphere glow */}
            <path d="M 18,82 Q 50,68 82,82" fill="none"
              stroke={color} strokeWidth="0.4" opacity={0.1} />

            {/* Orbital reference arcs (Hohmann transfer paths) */}
            <ellipse cx={50} cy={20} rx={40} ry={55} fill="none"
              stroke={color} strokeWidth="0.3" opacity={0.06}
              strokeDasharray="3 4" />
            <ellipse cx={50} cy={30} rx={30} ry={45} fill="none"
              stroke={color} strokeWidth="0.3" opacity={0.05}
              strokeDasharray="2 3" />

            {/* Meteors falling along curved paths */}
            {online && Array.from({ length: objectCount }, (_, i) => {
              // Stagger starting positions along the top arc
              const startX = 15 + (i * 70 / objectCount) + (i * 7 % 15);
              const startY = 8 + (i * 5 % 12);
              const endX = 35 + (i * 30 / objectCount);
              const endY = 72 + (i * 3 % 8);
              const cpX = startX + (endX - startX) * 0.3 + (i % 2 ? 8 : -5);
              const cpY = (startY + endY) / 2;
              const trailOp = 0.15 + act * 0.3;

              return prefersReducedMotion ? (
                <React.Fragment key={`meteor-${i}`}>
                  {/* Burn trail */}
                  <path d={`M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}`}
                    fill="none" stroke={color} strokeWidth="0.8" opacity={trailOp * 0.4} />
                  {/* Meteor head */}
                  <circle cx={endX} cy={endY} r={1.2} fill={color} opacity={trailOp} />
                </React.Fragment>
              ) : (
                <React.Fragment key={`meteor-${i}`}>
                  {/* Burn trail */}
                  <path d={`M ${startX},${startY} Q ${cpX},${cpY} ${endX},${endY}`}
                    fill="none" stroke={color} strokeWidth="0.8" opacity={trailOp * 0.3}
                    strokeLinecap="round" />
                  {/* Animated meteor head */}
                  <motion.circle r={1.2} fill={color}
                    style={{ filter: `drop-shadow(0 0 2px ${color})` }}
                    animate={{
                      cx: [startX, cpX, endX],
                      cy: [startY, cpY, endY],
                      opacity: [0, trailOp, 0],
                    }}
                    transition={{
                      duration: 2 - act * 0.6,
                      repeat: Infinity,
                      ease: 'easeIn',
                      delay: i * (1.5 / objectCount),
                    }}
                  />
                </React.Fragment>
              );
            })}

            {/* Impact flashes at critical */}
            {showCritical && (
              <g>
                {[38, 52, 65].map((ix, i) => (
                  prefersReducedMotion ? (
                    <circle key={`impact-${i}`} cx={ix} cy={78 + i * 1.5} r={1.5}
                      fill={color} opacity={0.3}
                      style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
                  ) : (
                    <motion.circle key={`impact-${i}`} cx={ix} cy={78 + i * 1.5} r={1.5}
                      fill={color}
                      style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                      animate={{ opacity: [0, 0.5, 0], r: [0.5, 2.5, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.3 }}
                    />
                  )
                ))}
              </g>
            )}

            <text x={50} y={16} textAnchor="middle" fill={color}
              fontSize="3.5" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
              METEOR INFALL
            </text>
          </g>
        ) : (
          <g>
            {/* Planet at center */}
            <circle cx={50} cy={50} r={12} fill={color} opacity={0.06}
              stroke={color} strokeWidth="0.8" />
            {/* Atmosphere halo */}
            <circle cx={50} cy={50} r={15} fill="none"
              stroke={color} strokeWidth="0.4" opacity={0.08} />

            {/* Slingshot trajectory (hyperbolic curve around planet) */}
            <path d="M 15,75 Q 30,55 40,45 Q 48,38 55,30 Q 65,18 85,10"
              fill="none" stroke={color} strokeWidth="0.8"
              opacity={0.15 + act * 0.15} strokeDasharray="3 2" />

            {/* Solar wind particles streaming outward */}
            {online && Array.from({ length: objectCount }, (_, i) => {
              const angle = (30 + i * 15) * Math.PI / 180;
              const startR = 16;
              const endR = 40 + act * 8;
              const sx = 50 + startR * Math.cos(angle);
              const sy = 50 - startR * Math.sin(angle);
              const ex = 50 + endR * Math.cos(angle);
              const ey = 50 - endR * Math.sin(angle);
              const particleOp = 0.15 + act * 0.25;

              return prefersReducedMotion ? (
                <line key={`wind-${i}`} x1={sx} y1={sy} x2={ex} y2={ey}
                  stroke={color} strokeWidth="0.6" opacity={particleOp * 0.5}
                  strokeLinecap="round" />
              ) : (
                <motion.circle key={`wind-${i}`} r={0.8} fill={color}
                  animate={{
                    cx: [sx, ex], cy: [sy, ey],
                    opacity: [particleOp, 0],
                  }}
                  transition={{
                    duration: 1.5 - act * 0.4,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: i * (1.2 / objectCount),
                  }}
                />
              );
            })}

            {/* Slingshot object */}
            {online && (
              prefersReducedMotion ? (
                <circle cx={60} cy={25} r={2} fill={color} opacity={0.4}
                  style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
              ) : (
                <motion.circle r={2} fill={color}
                  style={{ filter: `drop-shadow(0 0 3px ${color})` }}
                  animate={{
                    cx: [20, 42, 55, 80],
                    cy: [70, 48, 32, 12],
                    opacity: [0.2, 0.6, 0.6, 0],
                  }}
                  transition={{ duration: 3 - act, repeat: Infinity, ease: 'easeInOut' }}
                />
              )
            )}

            {/* Escape velocity burst at critical */}
            {showCritical && (
              <g opacity={0.15 + ((level - 85) / 15) * 0.2}>
                {/* Hyperbolic escape trail */}
                <path d="M 55,30 Q 70,15 90,5"
                  fill="none" stroke={color} strokeWidth="1.5"
                  style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
              </g>
            )}

            <text x={50} y={90} textAnchor="middle" fill={color}
              fontSize="3.5" fontFamily={MONO} opacity={0.3} letterSpacing="0.1em">
              SLINGSHOT
            </text>
          </g>
        )}

        {/* Percentage readout */}
        <text x={50} y={96} textAnchor="middle" fill={color} fontSize="7" fontFamily={MONO} fontWeight="bold" opacity={0.85}>
          {level.toFixed(0)}%
        </text>
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{tierLabel}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {isDownload ? 'Inbound' : 'Outbound'}
      </div>
    </div>
  );
};

export default OrbitalTransfer;
