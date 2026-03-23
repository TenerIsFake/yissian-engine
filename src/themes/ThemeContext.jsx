import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { THEMES, DEFAULT_THEME, THEME_IDS } from './themeConfig.js';

// ─────────────────────────────────────────────
// MODULE-LEVEL MUTABLE REF — zero-subscription CAT reads
// Updated synchronously before context state triggers re-render.
// ElementCard, EmptyCell, etc. read this ref directly — they don't
// subscribe to ThemeContext, so they don't re-render at idle.
// Re-renders still happen on theme change because App calls useContext(ThemeContext).
// ─────────────────────────────────────────────
export const activeCATRef = { current: THEMES[DEFAULT_THEME].cat };

export const ThemeContext = createContext(null);

const LS_THEME_KEY    = 'jenkins-media-theme';
const LS_CYCLE_KEY    = 'jenkins-media-cycle-enabled';
const LS_INTERVAL_KEY = 'jenkins-media-cycle-interval';
const MIN_INTERVAL_S  = 10;   // allow 10s for testing; default is 60s
const MAX_INTERVAL_S  = 86400; // 24 hours — prevents setInterval(fn, Infinity) silent no-op
const DEFAULT_INTERVAL_S = 60;

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_THEME_KEY);
      return THEME_IDS.includes(stored) ? stored : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const [cycleEnabled, setCycleEnabledState] = useState(() => {
    try {
      return localStorage.getItem(LS_CYCLE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [cycleInterval, setCycleIntervalState] = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(LS_INTERVAL_KEY), 10);
      return !isNaN(stored) && stored >= MIN_INTERVAL_S ? stored : DEFAULT_INTERVAL_S;
    } catch {
      return DEFAULT_INTERVAL_S;
    }
  });

  // Keep activeCATRef in sync with current theme (synchronous — before render)
  activeCATRef.current = THEMES[activeTheme].cat;

  // Mutable refs for stale-closure-free access in callbacks/intervals
  const activeThemeRef  = useRef(activeTheme);
  const modeThemesRef   = useRef(THEME_IDS); // updated by setCurrentModeThemes

  // Keep activeThemeRef in sync
  activeThemeRef.current = activeTheme;

  // Persist + update setters
  const setActiveTheme = useCallback((themeId) => {
    if (!THEME_IDS.includes(themeId)) return;
    // CONFLICT RESOLVED C3: activeCATRef set here removed — line 49 (above) fires
    // synchronously on every render triggered by setActiveThemeState below.
    // CONFLICT RESOLVED C3: setAttribute calls removed from this callback —
    // useEffect at line ~89 is the single authoritative place for CSS var + data-attr
    // writes. It fires on every activeTheme state change before paint.
    try { localStorage.setItem(LS_THEME_KEY, themeId); } catch {}
    setActiveThemeState(themeId);
  }, []);

  // Called by App.jsx on mode change to restrict which themes are cycled + auto-switch if needed
  const setCurrentModeThemes = useCallback((themeIds, defaultThemeId) => {
    modeThemesRef.current = themeIds;
    if (!themeIds.includes(activeThemeRef.current)) {
      setActiveTheme(defaultThemeId);
    }
  }, [setActiveTheme]);

  const setCycleEnabled = useCallback((val) => {
    try { localStorage.setItem(LS_CYCLE_KEY, String(val)); } catch {}
    setCycleEnabledState(Boolean(val));
  }, []);

  // SECURITY OVERRIDE: isFinite guard + 86400s ceiling — overrides code-simplifier suggestion
  // (no guard suggested). setInterval(fn, Infinity) silently becomes a no-op; Infinity also
  // bypasses Math.max. Both guards required per pentester (CVSS 2.1) + security-reviewer.
  const setCycleInterval = useCallback((val) => {
    const raw = Number(val);
    // CONFLICT RESOLVED C2: isFinite rejects Infinity/NaN before Math.max/min can see them.
    if (!isFinite(raw)) return;
    const n = Math.max(MIN_INTERVAL_S, Math.min(raw, MAX_INTERVAL_S));
    try { localStorage.setItem(LS_INTERVAL_KEY, String(n)); } catch {}
    setCycleIntervalState(n);
  }, []);

  // CSS variable injection + data-attribute writes — single authoritative source
  // CONFLICT RESOLVED C3: data-theme-* attributes written ONLY here, not in setActiveTheme
  // or the cycle timer. useEffect fires synchronously after every activeTheme state change.
  useEffect(() => {
    const theme = THEMES[activeTheme];
    document.documentElement.style.setProperty('--bg-base',        theme.bgBase);
    document.documentElement.style.setProperty('--dot-grid-color', theme.dotGridColor);
    document.documentElement.style.setProperty('--theme-accent',   theme.accent);
    const features = theme.features ?? {};
    document.documentElement.setAttribute('data-theme-power',    features.lowPower   ? 'low'  : 'normal');
    document.documentElement.setAttribute('data-theme-animated', features.animatedBg ? 'true' : 'false');
  }, [activeTheme]);

  // Add theme-ready class after first mount to enable transitions
  // (prevents transition on initial load)
  useEffect(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-ready');
    });
  }, []);

  // CONFLICT RESOLVED C4: themeIndexRef removed — written but never read (dead code).
  // Confirmed by tech-lead and code-simplifier. The pool-index approach below (curIdx via
  // pool.indexOf) is the actual mechanism; themeIndexRef was a leftover from an earlier design.

  useEffect(() => {
    if (!cycleEnabled) return;

    // Respect prefers-reduced-motion (own matchMedia — separate from App.jsx)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const id = setInterval(() => {
      const pool = modeThemesRef.current;
      // Find current theme's index in the mode pool; fall back to start if not found
      const curIdx = pool.indexOf(activeThemeRef.current);
      const nextIdx = (curIdx + 1) % pool.length;
      const next = pool[nextIdx];
      // activeCATRef updated here for zero-latency reads before the triggered re-render
      // fires line 49 above. This is the one intentional redundant set — it ensures
      // ElementCard components that read activeCATRef synchronously during the render
      // cycle see the new value without waiting for a second render pass.
      activeCATRef.current = THEMES[next].cat;
      // CONFLICT RESOLVED C3: setAttribute calls removed from cycle timer body —
      // setActiveThemeState(next) triggers a re-render which fires the useEffect above.
      try { localStorage.setItem(LS_THEME_KEY, next); } catch {}
      setActiveThemeState(next);
    }, cycleInterval * 1000);

    return () => clearInterval(id);
  }, [cycleEnabled, cycleInterval]);

  return (
    <ThemeContext.Provider value={{
      activeTheme,
      setActiveTheme,
      setCurrentModeThemes,
      cycleEnabled,
      setCycleEnabled,
      cycleInterval,
      setCycleInterval,
      themes: THEMES,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
