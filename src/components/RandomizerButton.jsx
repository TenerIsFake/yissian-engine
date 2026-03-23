import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../themes/ThemeContext.jsx';
import { MODE_THEMES, MODE_DEFAULT_THEME } from '../themes/themeConfig.js';

const MONO = 'monospace';

// ARCH REQUIREMENT: ALL_MODES removed — replaced with Object.keys(MODE_THEMES).
// Single source of truth in themeConfig.js. Confirmed by code-simplifier, tech-lead,
// and pentester. The old ALL_MODES const was a third independent copy of the modes list.

const TARGETS = ['THEME', 'MODE', 'BOTH'];

function pickRandom(arr, exclude) {
  const pool = arr.filter(x => x !== exclude);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : arr[0];
}

const RandomizerButton = ({ dashboardMode, setDashboardMode }) => {
  const { activeTheme, setActiveTheme, setCurrentModeThemes } = useTheme();
  const [targetIdx, setTargetIdx] = useState(0);
  // CONFLICT RESOLVED C2 (UX-01): transient feedback label for BOTH mode
  const [feedback, setFeedback] = useState('');
  // P2-05: ref prevents stale-closure leak — cleared on remount and on each new randomize call
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);
  const target = TARGETS[targetIdx];

  const cycleTarget = (e) => {
    e.stopPropagation();
    setTargetIdx(i => (i + 1) % TARGETS.length);
  };

  const randomize = () => {
    const allModes = Object.keys(MODE_THEMES);
    if (target === 'THEME') {
      // ARCH REQUIREMENT: fallback uses first mode's theme pool (theme IDs), not mode names.
      // The old fallback `Object.keys(MODE_THEMES)` returned mode name strings — wrong type.
      // This fallback is unreachable post-validation but correct type is required.
      const pool = MODE_THEMES[dashboardMode] ?? MODE_THEMES[allModes[0]];
      const next = pickRandom(pool, activeTheme);
      setActiveTheme(next);
    } else if (target === 'MODE') {
      const nextMode = pickRandom(allModes, dashboardMode);
      const defaultTheme = MODE_DEFAULT_THEME[nextMode];
      setCurrentModeThemes(MODE_THEMES[nextMode], defaultTheme);
      setActiveTheme(defaultTheme);
      setDashboardMode(nextMode);
    } else {
      // BOTH
      const nextMode = pickRandom(allModes, dashboardMode);
      const pool = MODE_THEMES[nextMode];
      const nextTheme = pool[Math.floor(Math.random() * pool.length)];
      setCurrentModeThemes(pool, MODE_DEFAULT_THEME[nextMode]);
      setActiveTheme(nextTheme);
      setDashboardMode(nextMode);
      // UX COMPROMISE: transient feedback label — UX-reviewer UX-2.
      // Shows "MODE · THEME" for 1500ms after a BOTH randomize so the user can see
      // what changed. Uses setTimeout (not animation) to keep the component dependency-free.
      setFeedback(`${nextMode} · ${nextTheme}`);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setFeedback(''), 1500);
    }
  };

  const baseStyle = {
    fontFamily: MONO,
    fontSize: 8,
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.55)',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    overflow: 'hidden',
    transition: 'border-color 0.15s',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={baseStyle}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
    >
      {/* Left zone — dice + randomize */}
      <button
        onClick={randomize}
        title={`Randomize ${target.toLowerCase()}`}
        aria-label={`Randomize ${target.toLowerCase()}`}
        style={{
          fontFamily: MONO,
          fontSize: 8,
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.55)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '5px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
      >
        <span style={{ fontSize: 11 }}>⚄</span>
        {target}
      </button>

      {/* Divider */}
      <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', flexShrink: 0 }} />

      {/* UX-07: aria-live region rendered unconditionally — conditionally injecting a live
          region into the DOM does not reliably trigger screen reader announcements.
          Empty string content when no feedback is active; polite so it doesn't interrupt
          the user's current reading position. */}
      <span
        aria-live="polite"
        aria-atomic="true"
        style={{
          fontFamily: MONO,
          fontSize: 7,
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.65)',
          padding: feedback ? '0 6px' : 0,
          maxWidth: feedback ? 140 : 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'max-width 0.15s, padding 0.15s',
        }}
      >
        {feedback}
      </span>

      {/* Right zone — cycle target */}
      {/* UX COMPROMISE: opacity increased 0.35→0.55, font-size 7→9px per UX-reviewer UX-1.
          Feature remains secondary (no border, no persistent label). Zero security tradeoff. */}
      <button
        onClick={cycleTarget}
        title="Change what gets randomized"
        aria-label={`Currently randomizing: ${target}. Click to cycle.`}
        style={{
          fontFamily: MONO,
          fontSize: 9,
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.55)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '5px 7px',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.80)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
      >
        ▸
      </button>
    </div>
  );
};

export default RandomizerButton;
