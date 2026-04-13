// Shared constants extracted from App.jsx during Phase B decomposition.
// Used by ElementDetailPanel, BotDetailPanel, PeriodicHeader, and App.

// These IPs are browser navigation deep-links (new-tab service URLs) for LAN-only use.
// They are intentionally baked into the bundle — they cannot be proxied through nginx
// because they open directly in a new tab to the service UI.
export const PRIMARY_URL = 'http://10.0.0.195';
export const SECONDARY_URL = 'http://10.0.0.155';

export const POLL_MS = 30000;

export const MONO = 'monospace';

// Tiny label used for section headers inside detail panels and tooltips
export const SECTION_LABEL_STYLE = { fontSize: 8, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3em' };

// Round status/online indicator dot (used in ElementCard and ElementDetailPanel)
export const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

// Standard cell dimensions shared by ElementCard, EmptyCell, and placeholder divs
export const CELL_SIZE = { width: 72, height: 80, borderRadius: 3 };

// Status tier system — THEME_INVARIANT: tier dot colors never change with theme.
export const getStatusTier = (level) => {
  if (level >= 95) return {
    tier: 3, label: 'NUCLEAR_DECAY',
    color: 'text-red-400', glowColor: 'rgba(239,68,68,0.6)',
    borderColor: 'rgba(239,68,68,0.5)', bgColor: 'rgba(239,68,68,0.10)',
  };
  if (level >= 81) return {
    tier: 2, label: 'METASTABLE',
    color: 'text-amber-400', glowColor: 'rgba(245,158,11,0.5)',
    borderColor: 'rgba(245,158,11,0.4)', bgColor: 'rgba(245,158,11,0.07)',
  };
  if (level >= 61) return {
    tier: 1, label: 'EXCITED',
    color: 'text-yellow-300', glowColor: 'rgba(250,204,21,0.4)',
    borderColor: 'rgba(250,204,21,0.3)', bgColor: 'rgba(250,204,21,0.05)',
  };
  return {
    tier: 0, label: 'GROUND_STATE',
    color: 'text-cyan-400', glowColor: 'rgba(6,182,212,0.3)',
    borderColor: null, bgColor: null,
  };
};

export const defaultStats = () => ({ level: 0, isBoiling: false, details: [], online: null, stale: false });

// Validate URL — only http/https allowed (prevents javascript: XSS)
export const safeHref = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};
