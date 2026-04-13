import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { THEMES, DEFAULT_THEME, THEME_IDS, resolveThemeId, getSceneConfig, MODE_THEMES, MODE_DEFAULT_THEME } from './themeConfig.js';

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
const LS_MODE_CYCLE_KEY    = 'jenkins-media-mode-cycle-enabled';
const LS_MODE_INTERVAL_KEY = 'jenkins-media-mode-cycle-interval';
const LS_OLED_KEY     = 'jenkins-media-oled-mode';
const LS_LITE_KEY     = 'jenkins-media-lite-mode';
const MIN_INTERVAL_S  = 10;   // allow 10s for testing; default is 60s
const MAX_INTERVAL_S  = 86400; // 24 hours — prevents setInterval(fn, Infinity) silent no-op
const DEFAULT_INTERVAL_S = 60;
const DEFAULT_MODE_INTERVAL_S = 300; // 5 minutes default for mode rotation

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_THEME_KEY);
      if (THEME_IDS.includes(stored)) return stored;
      // NH-42: Migrate legacy theme IDs (CHEM_LAB → CHEM_T2, etc.)
      const migrated = resolveThemeId(stored, 'CHEM');
      if (THEME_IDS.includes(migrated)) {
        try { localStorage.setItem(LS_THEME_KEY, migrated); } catch {}
        return migrated;
      }
      return DEFAULT_THEME;
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

  // ── Mode cycle state ──
  const [modeCycleEnabled, setModeCycleEnabledState] = useState(() => {
    try {
      return localStorage.getItem(LS_MODE_CYCLE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [modeCycleInterval, setModeCycleIntervalState] = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(LS_MODE_INTERVAL_KEY), 10);
      return !isNaN(stored) && stored >= MIN_INTERVAL_S ? stored : DEFAULT_MODE_INTERVAL_S;
    } catch {
      return DEFAULT_MODE_INTERVAL_S;
    }
  });

  // ── OLED dark mode — pure black background override ──
  const [oledMode, setOledModeState] = useState(() => {
    try { return localStorage.getItem(LS_OLED_KEY) === 'true'; } catch { return false; }
  });
  const setOledMode = useCallback((val) => {
    const b = Boolean(val);
    try { localStorage.setItem(LS_OLED_KEY, String(b)); } catch {}
    setOledModeState(b);
  }, []);

  // ── Lite mode — reduced particles for mobile / low-end devices ──
  const [liteMode, setLiteModeState] = useState(() => {
    try { return localStorage.getItem(LS_LITE_KEY) === 'true'; } catch { return false; }
  });
  const setLiteMode = useCallback((val) => {
    const b = Boolean(val);
    try { localStorage.setItem(LS_LITE_KEY, String(b)); } catch {}
    setLiteModeState(b);
  }, []);

  // App.jsx registers its setDashboardMode here so the timer can switch modes
  const modeSetterRef = useRef(null);
  const registerModeSetter = useCallback((fn) => { modeSetterRef.current = fn; }, []);

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

  const setModeCycleEnabled = useCallback((val) => {
    try { localStorage.setItem(LS_MODE_CYCLE_KEY, String(val)); } catch {}
    setModeCycleEnabledState(Boolean(val));
  }, []);

  const setModeCycleInterval = useCallback((val) => {
    const raw = Number(val);
    if (!isFinite(raw)) return;
    const n = Math.max(MIN_INTERVAL_S, Math.min(raw, MAX_INTERVAL_S));
    try { localStorage.setItem(LS_MODE_INTERVAL_KEY, String(n)); } catch {}
    setModeCycleIntervalState(n);
  }, []);

  // CSS variable injection + data-attribute writes — single authoritative source
  // CONFLICT RESOLVED C3: data-theme-* attributes written ONLY here, not in setActiveTheme
  // or the cycle timer. useEffect fires synchronously after every activeTheme state change.
  useEffect(() => {
    const theme = THEMES[activeTheme];
    document.documentElement.style.setProperty('--bg-base',        oledMode ? '#000000' : theme.bgBase);
    document.documentElement.style.setProperty('--dot-grid-color', theme.dotGridColor);
    document.documentElement.style.setProperty('--theme-accent',   theme.accent);
    const features = theme.features ?? {};
    document.documentElement.setAttribute('data-theme-power',    features.lowPower   ? 'low'  : 'normal');
    document.documentElement.setAttribute('data-theme-animated', features.animatedBg ? 'true' : 'false');
    document.documentElement.setAttribute('data-oled',           oledMode ? 'true' : 'false');
  }, [activeTheme, oledMode]);

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

  // ── Mode cycle timer ──
  useEffect(() => {
    if (!modeCycleEnabled) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;

    const id = setInterval(() => {
      const setter = modeSetterRef.current;
      if (!setter) return;
      const allModes = Object.keys(MODE_THEMES);
      if (allModes.length < 2) return;
      // Pick a random mode different from current
      const curMode = localStorage.getItem('jenkins-media-dashboard-mode') || 'CHEM';
      const pool = allModes.filter(m => m !== curMode);
      const nextMode = pool[Math.floor(Math.random() * pool.length)];
      const defaultTheme = MODE_DEFAULT_THEME[nextMode];
      // Switch mode and its default theme
      setter(nextMode);
      modeThemesRef.current = MODE_THEMES[nextMode];
      activeCATRef.current = THEMES[defaultTheme].cat;
      try { localStorage.setItem(LS_THEME_KEY, defaultTheme); } catch {}
      setActiveThemeState(defaultTheme);
    }, modeCycleInterval * 1000);

    return () => clearInterval(id);
  }, [modeCycleEnabled, modeCycleInterval]);

  // NH-42: Expose animation data for AnimatedBackground
  const currentTheme = THEMES[activeTheme];
  const animationData = currentTheme?.animation || null;
  const sceneConfig = animationData ? getSceneConfig(animationData.scene) : null;
  const animationTier = animationData?.tier || 0;

  return (
    <ThemeContext.Provider value={{
      activeTheme,
      setActiveTheme,
      setCurrentModeThemes,
      cycleEnabled,
      setCycleEnabled,
      cycleInterval,
      setCycleInterval,
      // Mode cycling
      modeCycleEnabled,
      setModeCycleEnabled,
      modeCycleInterval,
      setModeCycleInterval,
      registerModeSetter,
      themes: THEMES,
      // NH-42: Animation support
      sceneConfig,
      animationTier,
      // OLED dark mode
      oledMode,
      setOledMode,
      // Lite mode (reduced particles)
      liteMode,
      setLiteMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
