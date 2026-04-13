import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { AIRPORT_OVERLAY } from './airportConfig.js';

const MONO = 'monospace';
const FLIP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·—';

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

// Single split-flap cell that animates when its target value changes.
// T1-01 / CONFLICT RESOLVED C-2: `delay` was accepted as a prop but the useEffect
// never used it — all cells started flipping simultaneously on mount. Fixed by wrapping
// the interval creation in a setTimeout(fn, delay). The timeout ref is stored and
// cleared in the cleanup function so rapid value changes don't leak timers.
// T2-05: aria-hidden="true" added to the outer span — screen readers must not announce
// character-scramble states; the containing row's role="button" carries the identity.
const FlipCell = ({ value, width = 80, delay = 0 }) => {
  const [display, setDisplay] = useState(value);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || display === value) {
      setDisplay(value);
      return;
    }
    let iv = null;
    // CONFLICT RESOLVED C-2: delay honored here — each column staggers its flip-in
    const tid = setTimeout(() => {
      let frame = 0;
      const total = 6 + Math.floor(Math.random() * 4);
      iv = setInterval(() => {
        frame++;
        if (frame >= total) {
          setDisplay(value);
          setFlipping(false);
          clearInterval(iv);
        } else {
          setDisplay(FLIP_CHARS[Math.floor(Math.random() * FLIP_CHARS.length)]);
          setFlipping(true);
        }
      }, 55);
    }, delay);
    return () => {
      clearTimeout(tid);
      if (iv) clearInterval(iv);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // T2-05: aria-hidden — scrambled chars are decorative; row role="button" carries identity
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        minWidth: width,
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.06em',
        color: flipping ? 'rgba(255,200,50,0.7)' : 'rgba(255,255,255,0.85)',
        transition: 'color 0.08s',
        userSelect: 'none',
      }}
    >
      {display}
    </span>
  );
};

// Status badge with SOLARI-style coloring
const StatusBadge = ({ online, level }) => {
  const color = !online ? '#ef4444' : level > 94 ? '#ef4444' : level > 80 ? '#f59e0b' : '#22c55e';
  const label = !online ? 'GROUNDED' : level > 94 ? '⚠ HOLDING' : level > 80 ? 'DIVERT' : 'TAXIING';
  return (
    <span style={{
      fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em',
      color, textShadow: `0 0 6px ${color}55`, minWidth: 90, display: 'inline-block',
    }}>
      {label}
    </span>
  );
};

// Live clock for the header
const LiveClock = () => {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false }));
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false })), 1000);
    return () => clearInterval(iv);
  }, []);
  return <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,200,50,0.8)', minWidth: 80 }}>{time}</span>;
};

const AirportGrid = ({ statsMap, onElementClick, elementRegistry, gridTitle, cardTransform }) => {
  // Sort: online + critical first, offline last.
  // localTime is computed here (not in render body) so FlipCell values are stable
  // between stats polls — recomputing Date.now() on every render would trigger
  // the flip-scramble animation every 30s even when the displayed time hasn't changed.
  const rows = useMemo(() => {
    return [...elementRegistry]
      .sort((a, b) => {
        const sa = statsMap[a.id] || { level: 0, online: false };
        const sb = statsMap[b.id] || { level: 0, online: false };
        if (!sa.online && sb.online) return 1;
        if (sa.online && !sb.online) return -1;
        return sb.level - sa.level;
      })
      .map((el, rowIdx) => {
        const ov = AIRPORT_OVERLAY[el.id] ?? {};
        return {
          el,
          ov,
          rowIdx,
          localTime: new Date(Date.now() + rowIdx * 900000)
            .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        };
      });
  }, [elementRegistry, statsMap]);

  const COL = { flight: 90, origin: 120, dest: 130, gate: 90, status: 100, time: 80 };

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: 'rgba(0,0,0,0.7)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden' }}>

        {/* Board header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px', background: 'rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.4em' }}>
            {gridTitle || '◆ DEPARTURES ◆'}
          </span>
          <LiveClock />
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,200,50,0.5)', letterSpacing: '0.3em' }}>
            HOMELAB OPS CENTER
          </span>
        </div>

        {/* Column headers */}
        <div style={{ display: 'flex', padding: '5px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)' }}>
          {[['FLIGHT', COL.flight], ['SERVICE', COL.origin], ['TYPE', COL.dest],
            ['GATE', COL.gate], ['STATUS', COL.status], ['LOCAL', COL.time]].map(([label, w]) => (
            <span key={label} style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.15em', minWidth: w }}>
              {label}
            </span>
          ))}
        </div>

        {/* Departure rows */}
        {rows.map(({ el, ov, rowIdx, localTime }) => {
          const stats = statsMap[el.id] || { level: 0, isBoiling: false, details: [], online: false };
          const delay = rowIdx * 80; // stagger flip-in on mount

          const serviceName = (el.service ?? el.name ?? '').toUpperCase().slice(0, 14).padEnd(14);
          const compoundType = (el.mass ?? '').toString().slice(0, 12).padEnd(12);
          const gate = (ov.gateInfo ?? 'GATE ??').slice(0, 8).padEnd(8);
          const flight = (ov.flightDesig ?? `SVC-${rowIdx + 100}`).slice(0, 8);

          return (
            <div
              key={el.id}
              role="button"
              tabIndex={0}
              onClick={() => onElementClick(el)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onElementClick(el); } }}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '6px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,200,50,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = rowIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'; }}
            >
              <FlipCell value={flight} width={COL.flight} delay={delay} />
              <FlipCell value={serviceName} width={COL.origin} delay={delay + 30} />
              <FlipCell value={compoundType} width={COL.dest} delay={delay + 60} />
              <FlipCell value={gate} width={COL.gate} delay={delay + 90} />
              <StatusBadge online={stats.online} level={stats.level} />
              <FlipCell value={localTime} width={COL.time} delay={delay + 120} />
            </div>
          );
        })}

        {/* Board footer */}
        <div style={{ padding: '6px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.3)' }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
            {rows.filter(({ el }) => statsMap[el.id]?.online).length} ACTIVE · {rows.filter(({ el }) => !statsMap[el.id]?.online).length} GROUNDED
          </span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
            ALL TIMES LOCAL
          </span>
        </div>
      </div>
    </div>
  );
};

export default AirportGrid;
