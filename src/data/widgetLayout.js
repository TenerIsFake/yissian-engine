// ─────────────────────────────────────────────
// WIDGET LAYOUT — default section order, grouping, and column spans
//
// Each entry defines a dashboard section:
//   id        — unique key (matches data-section attrs in App.jsx)
//   label     — human-readable name shown in drag handle
//   group     — subject category for visual grouping
//   colSpan   — number of columns in the responsive grid (1, 2, or 4 = full-width)
//   pinned    — if true, section cannot be reordered (grid = first, log = last)
//
// Column spans work within a 4-column xl grid.
// Widgets in the same row auto-fill: a 2-col widget beside a 2-col widget fills the row.
// A 4-col widget takes the full row width.
// ─────────────────────────────────────────────

export const WIDGET_GROUPS = {
  CORE:         { label: 'Core',         color: '#55EFC4' },
  MEDIA:        { label: 'Media',        color: '#74B9FF' },
  INTELLIGENCE: { label: 'Intelligence', color: '#A29BFE' },
  MONITORING:   { label: 'Monitoring',   color: '#FDCB6E' },
  INFO:         { label: 'Info',         color: '#FD79A8' },
  SYSTEM:       { label: 'System',       color: '#636E72' },
};

const DEFAULT_LAYOUT = [
  // ── CORE (always first) ────────────────────
  { id: 'services',         label: 'Services Grid',       group: 'CORE',         colSpan: 4, pinned: 'first' },
  { id: 'category-legend',  label: 'Category Legend',      group: 'CORE',         colSpan: 4, pinned: false },

  // ── INFO ───────────────────────────────────
  { id: 'weather-vpn',      label: 'Weather & Network',   group: 'INFO',         colSpan: 4 },

  // ── MEDIA ──────────────────────────────────
  { id: 'plex',             label: 'Media Pipeline',      group: 'MEDIA',        colSpan: 4 },
  { id: 'discovery',        label: 'Discovery Ticker',    group: 'MEDIA',        colSpan: 4 },
  { id: 'freshrss',         label: 'FreshRSS Headlines',  group: 'MEDIA',        colSpan: 4 },

  // ── MONITORING ─────────────────────────────
  { id: 'docker-health',    label: 'Docker Health',       group: 'MONITORING',   colSpan: 4 },
  { id: 'notifications',    label: 'Notifications',       group: 'MONITORING',   colSpan: 4 },
  { id: 'system-metrics',   label: 'System Metrics',      group: 'MONITORING',   colSpan: 4 },
  { id: 'backup-panorama',  label: 'Backup Panorama',    group: 'MONITORING',   colSpan: 4, collapsed: true },
  { id: 'server-comparison', label: 'Server Comparison',  group: 'MONITORING',   colSpan: 4, collapsed: true },
  { id: 'network-topology', label: 'Network Topology',  group: 'MONITORING',   colSpan: 4, collapsed: true },

  // ── INFO (continued) ──────────────────────
  { id: 'daily-digest',     label: 'Daily Digest',         group: 'INFO',         colSpan: 4 },

  // ── SYSTEM (always last) ───────────────────
  { id: 'deploy-control',   label: 'Deploy Control',      group: 'SYSTEM',       colSpan: 4, collapsed: true },
  { id: 'mode-log',         label: 'Lab Journal',         group: 'SYSTEM',       colSpan: 4, pinned: 'last' },
];

export default DEFAULT_LAYOUT;
