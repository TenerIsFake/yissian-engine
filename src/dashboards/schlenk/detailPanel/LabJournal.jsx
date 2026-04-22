import React from 'react';

/**
 * Lab journal — renders recent log lines with notebook styling.
 * Props: entries — array of { time, level, message }
 */
export default function LabJournal({ entries = [] }) {
  const lines = entries.length ? entries : [
    { time: '—', level: 'INFO', message: 'no recent entries' },
  ];
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: 10,
      color: '#C0D4DB',
      lineHeight: 1.6,
      background: 'rgba(212,180,120,0.04)',
      borderLeft: '2px solid #D4A04F',
      padding: '8px 12px',
      maxHeight: 120,
      overflow: 'auto',
    }}>
      {lines.slice(0, 8).map((e, i) => (
        <div key={i}>
          <span style={{ color: '#7A9BAE' }}>[{e.time}]</span>{' '}
          <span style={{ color: e.level === 'ERROR' ? '#E84A28' : e.level === 'WARN' ? '#D4A04F' : '#5FD4A8' }}>
            {e.level}
          </span>{' '}
          {e.message}
        </div>
      ))}
    </div>
  );
}
