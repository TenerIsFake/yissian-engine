import React from 'react';

const ActiveOperationsBar = ({ statsMap }) => {
  const chips = Object.entries(statsMap)
    .filter(([, s]) => s.online && s.level > 60 && s.details?.length)
    .map(([key, s]) => ({
      key,
      label: key.toUpperCase(),
      detail: `${s.details[0]?.label}: ${s.details[0]?.value}`,
    }));

  if (!chips.length) return null;

  return (
    <div style={{ display: 'flex', gap: 8, padding: '6px 16px', flexWrap: 'wrap',
      borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
      {chips.map(c => (
        <span key={c.key} style={{ fontFamily: 'monospace', fontSize: 10,
          color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3,
          padding: '2px 8px', letterSpacing: 1 }}>
          {c.label}: {c.detail}
        </span>
      ))}
    </div>
  );
};

export default ActiveOperationsBar;
