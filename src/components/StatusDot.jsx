import React from 'react';

/**
 * StatusDot — Accessible status indicator.
 * WCAG 1.4.1: Never relies on color alone. Shows icon glyph + aria-label.
 * P0-04: STALE uses distinct indigo (#6366f1) — not amber — to avoid confusion with ELEVATED tier.
 *
 * Props:
 *   online: true | false | null (null = pending/unknown)
 *   stale: boolean — data is cached/stale (distinct from pending)
 *   size: dot diameter in px (default 6)
 *   style: additional inline styles
 *   showIcon: whether to render the text glyph inside (default true for size >= 8)
 */
const STATUS_MAP = {
  up:      { color: '#22c55e', icon: '✓', label: 'Online' },
  stale:   { color: '#6366f1', icon: '◇', label: 'Stale data' },
  pending: { color: '#f59e0b', icon: '◆', label: 'Pending' },
  down:    { color: '#ef4444', icon: '✗', label: 'Offline' },
};

export default function StatusDot({ online, stale, size = 6, style, showIcon }) {
  const key = stale ? 'stale' : online === true ? 'up' : online === null ? 'pending' : 'down';
  const { color, icon, label } = STATUS_MAP[key];
  const renderIcon = showIcon ?? size >= 8;

  return (
    <div
      role="status"
      aria-label={label}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 4px ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      {renderIcon && (
        <span aria-hidden="true" style={{
          fontSize: Math.max(size * 0.6, 5),
          lineHeight: 1,
          color: '#000',
          fontWeight: 700,
        }}>
          {icon}
        </span>
      )}
    </div>
  );
}

export { STATUS_MAP };
