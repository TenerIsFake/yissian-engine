import React, { useState } from 'react';

const MONO = 'monospace';

const ELECTRON_CONFIG = {
  Fe: { hs: [4, 2], ls: [6, 0] },
  Co: { hs: [5, 2], ls: [6, 1] },
  Cu: { hs: [6, 3], ls: [6, 3] },
  Ni: { hs: [6, 2], ls: [6, 2] },
};

const METAL_NAMES = { Fe: 'Iron', Co: 'Cobalt', Cu: 'Copper', Ni: 'Nickel' };

// ─────────────────────────────────────────────
// COORDINATION COMPLEX (server CPU/RAM metrics — Crystal Field Theory)
// ─────────────────────────────────────────────
const CoordComplex = ({ label, level, online, details = [], metal, isJahnTeller = false, lowSpin = false, size = 88 }) => {
  const [hovered, setHovered] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (hovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > window.innerHeight / 2);
    }
  }, [hovered]);

  const hue = (level / 100) * 280;
  const color      = online ? `hsl(${hue}, 100%, 55%)` : '#6b7280';
  const colorFaded = online ? `hsla(${hue}, 100%, 55%, 0.35)` : 'rgba(107,114,128,0.35)';
  const colorBg    = online ? `hsla(${hue}, 100%, 55%, 0.08)` : 'rgba(107,114,128,0.08)';

  const strongField = level > 50;
  const ligand  = strongField ? 'CN' : 'H₂O';
  const formula = `[${metal}(${ligand})₆]`;

  const spinKey = lowSpin ? 'ls' : 'hs';
  const [t2g, eg] = ELECTRON_CONFIG[metal][spinKey];

  const activityLabel = label === 'CPU_LOAD'
    ? (lowSpin ? '4K Transcode' : 'Direct Play')
    : (lowSpin ? 'Heavy Cache'  : 'Buffering');

  const gap = 10 + (level / 100) * 18;
  const cx = 50, mcy = 26;
  const axialDist = isJahnTeller ? 12 + (level / 100) * 7 : 12;

  const renderElectrons = (count, lineX, lineY) => {
    if (count === 0) return null;
    if (count === 1) {
      return <circle key="e" cx={lineX} cy={lineY - 3} r="2.5" fill={color} opacity={online ? 0.9 : 0.5} />;
    }
    return (
      <g key="pair">
        <circle cx={lineX - 3} cy={lineY - 3} r="2.5" fill={color} opacity={online ? 0.9 : 0.5} />
        <circle cx={lineX + 3} cy={lineY - 3} r="2.5" fill={color} opacity={online ? 0.9 : 0.5} />
      </g>
    );
  };

  const t2gY = 88;
  const egY  = t2gY - gap;
  const t2gXs = [30, 50, 70];
  const egXs  = [38, 62];

  const distributeElectrons = (total, orbitalCount, lowSpinMode) => {
    const slots = Array(orbitalCount).fill(0);
    const safeTotal = Math.min(total, orbitalCount * 2);
    if (lowSpinMode) {
      for (let i = 0; i < safeTotal; i++) slots[i % orbitalCount]++;
    } else {
      for (let i = 0; i < safeTotal; i++) {
        if (i < orbitalCount) slots[i]++;
        else slots[i - orbitalCount]++;
      }
    }
    return slots;
  };

  const t2gSlots = distributeElectrons(t2g, 3, lowSpin);
  const egSlots  = distributeElectrons(eg,  2, lowSpin);

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
            CFT ◆ {METAL_NAMES[metal]}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color, letterSpacing: '0.2em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontFamily: MONO, fontSize: 16, color, marginBottom: details.length ? 6 : 0, lineHeight: 1 }}>
            {level.toFixed(1)}%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            {lowSpin ? 'Low-Spin' : 'High-Spin'} · {formula}
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
        {/* Equatorial bonds */}
        <line x1={cx} y1={mcy} x2={34} y2={mcy} stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1={cx} y1={mcy} x2={66} y2={mcy} stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1={cx} y1={mcy} x2={cx} y2={10}  stroke={color} strokeWidth="1" opacity="0.6" />
        <line x1={cx} y1={mcy} x2={cx} y2={42}  stroke={color} strokeWidth="1" opacity="0.6" />

        {/* Axial bonds (dashed, perspective) */}
        <line x1={cx} y1={mcy} x2={cx - axialDist} y2={mcy - axialDist * 0.5}
          stroke={color} strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
        <line x1={cx} y1={mcy} x2={cx + axialDist} y2={mcy - axialDist * 0.5}
          stroke={color} strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />

        {/* Equatorial ligand atoms */}
        <circle cx={34} cy={mcy} r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />
        <circle cx={66} cy={mcy} r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />
        <circle cx={cx} cy={10}  r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />
        <circle cx={cx} cy={42}  r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />

        {/* Axial ligand atoms */}
        <circle cx={cx - axialDist} cy={mcy - axialDist * 0.5} r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />
        <circle cx={cx + axialDist} cy={mcy - axialDist * 0.5} r="3.5" fill={colorFaded} stroke={color} strokeWidth="0.8" />

        {/* Metal center */}
        <circle cx={cx} cy={mcy} r="6" fill={colorBg} stroke={color} strokeWidth="1.5"
          style={{ filter: online ? `drop-shadow(0 0 ${2 + (level/100)*4}px ${color})` : 'none' }} />
        <text x={cx} y={mcy + 2.5} textAnchor="middle" fill={color} fontSize="5.5" fontFamily={MONO} fontWeight="bold">
          {metal}
        </text>

        {/* eg label */}
        <text x="14" y={egY + 1.5} textAnchor="middle" fill={color} fontSize="5" fontFamily={MONO} opacity="0.6">eᵍ</text>

        {/* t2g label */}
        <text x="14" y={t2gY + 1.5} textAnchor="middle" fill={color} fontSize="5" fontFamily={MONO} opacity="0.6">t₂g</text>

        {/* Δo bracket */}
        <line x1="20" y1={egY} x2="20" y2={t2gY} stroke={color} strokeWidth="0.5" opacity="0.25" />
        <line x1="18" y1={egY} x2="22" y2={egY} stroke={color} strokeWidth="0.5" opacity="0.25" />
        <line x1="18" y1={t2gY} x2="22" y2={t2gY} stroke={color} strokeWidth="0.5" opacity="0.25" />

        {/* eg orbitals */}
        {egXs.map((x, i) => (
          <g key={`eg${i}`}>
            <line x1={x - 5} y1={t2gY - gap} x2={x + 5} y2={t2gY - gap} stroke={color} strokeWidth="1.2" opacity="0.7" />
            {egSlots[i] > 0 && renderElectrons(egSlots[i], x, t2gY - gap)}
          </g>
        ))}

        {/* t2g orbitals */}
        {t2gXs.map((x, i) => (
          <g key={`t2g${i}`}>
            <line x1={x - 5} y1={t2gY} x2={x + 5} y2={t2gY} stroke={color} strokeWidth="1.2" opacity="0.7" />
            {t2gSlots[i] > 0 && renderElectrons(t2gSlots[i], x, t2gY)}
          </g>
        ))}
      </svg>

      <div style={{ fontFamily: MONO, fontSize: 7, color, textAlign: 'center', letterSpacing: '0.05em' }}>{formula}</div>
      <div style={{ fontFamily: MONO, fontSize: 6, color, textAlign: 'center', opacity: 0.5 }}>
        {lowSpin ? 'Low-Spin' : 'High-Spin'} | {activityLabel}
      </div>
    </div>
  );
};

export default CoordComplex;
