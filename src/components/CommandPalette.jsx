import React, { useState, useEffect, useRef, useCallback } from 'react';

const MONO = 'monospace';

// Sections the palette can scroll to. Refs are populated by App.jsx via the
// sectionRefs prop; fall back to document.querySelector when a ref is absent.
const SECTION_DEFS = [
  { id: 'header',       label: 'Header / Clock' },
  { id: 'services',     label: 'Services Grid' },
  { id: 'weather-vpn',  label: 'Weather + VPN' },
  { id: 'plex',         label: 'Plex Ecosystem Row' },
  { id: 'security',     label: 'Security Badge Row' },
  { id: 'daily-digest', label: 'Daily Digest' },
  { id: 'system-metrics', label: 'System Metrics Panel' },
  { id: 'discovery',    label: 'Discovery Ticker' },
  { id: 'lab-journal',  label: 'Lab Journal' },
];

// Fuzzy score: 3 = prefix, 2 = substring, 1 = fuzzy char match, 0 = no match
const fuzzyScore = (query, text) => {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 2;
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length ? 1 : 0;
};

const CommandPalette = ({ open, onClose, elementRegistry = [], dashboardMode = 'CHEM', sectionRefs = {} }) => {
  const [query, setQuery]       = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Build result list from query
  const results = React.useMemo(() => {
    const services = elementRegistry
      .filter(e => e.url)
      .map(e => ({ type: 'service', id: e.id, label: e.service, symbol: e.symbol, url: e.url }));

    const bots = elementRegistry
      .filter(e => !e.url && e.cat !== 'LANTHANIDE' && e.cat !== 'ACTINIDE')
      .map(e => ({ type: 'bot', id: e.id, label: e.service, symbol: e.symbol }));

    const sections = SECTION_DEFS.map(s => ({ type: 'section', id: s.id, label: s.label, symbol: '§' }));

    const all = [...services, ...bots, ...sections];

    if (!query.trim()) {
      // Show top 8 services when no query
      return services.slice(0, 8);
    }

    return all
      .map(item => ({ ...item, score: fuzzyScore(query, item.label) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, elementRegistry]);

  // Keep selected in bounds
  useEffect(() => {
    setSelected(s => Math.min(s, Math.max(results.length - 1, 0)));
  }, [results]);

  const activate = useCallback((item) => {
    if (!item) return;
    if (item.type === 'service') {
      window.open(item.url, '_blank', 'noopener');
    } else if (item.type === 'bot') {
      localStorage.setItem('chatwidget-selected-bot', item.id);
      window.dispatchEvent(new CustomEvent('select-bot', { detail: { botId: item.id } }));
    } else if (item.type === 'section') {
      const ref = sectionRefs[item.id];
      const el = ref?.current ?? document.querySelector(`[data-section="${item.id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('palette-highlight');
        setTimeout(() => el.classList.remove('palette-highlight'), 2000);
      }
    }
    onClose();
  }, [sectionRefs, onClose]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); activate(results[selected]); }
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) setSelected(s => Math.max(s - 1, 0));
        else            setSelected(s => Math.min(s + 1, results.length - 1));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, results, selected, activate, onClose]);

  // Scroll selected result into view
  useEffect(() => {
    listRef.current?.children[selected]?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!open) return null;

  const categoryBadge = (type) => {
    const map = { service: { label: 'SERVICE', color: '#38bdf8' }, bot: { label: 'BOT', color: '#a855f7' }, section: { label: 'SECTION', color: '#fb923c' } };
    const { label, color } = map[type] || { label: type.toUpperCase(), color: '#888' };
    return (
      <span style={{ fontFamily: MONO, fontSize: 7, letterSpacing: '0.12em', color, padding: '2px 6px',
        border: `1px solid ${color}44`, borderRadius: 3, flexShrink: 0 }}>
        {label}
      </span>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        style={{
          position: 'fixed', top: '18%', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1001, width: '100%', maxWidth: 560,
          background: 'rgba(15,17,23,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search services, widgets, bots…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: MONO, fontSize: 13, color: 'rgba(255,255,255,0.9)',
              letterSpacing: '0.02em',
            }}
          />
          <kbd style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)',
            padding: '2px 6px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3 }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 320, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '20px 16px', fontFamily: MONO, fontSize: 10,
              color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textAlign: 'center' }}>
              NO_RESULTS
            </div>
          ) : (
            results.map((item, i) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => activate(item)}
                onMouseEnter={() => setSelected(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '9px 16px', cursor: 'pointer',
                  background: i === selected ? 'rgba(255,255,255,0.07)' : 'transparent',
                  borderLeft: `2px solid ${i === selected ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
                  transition: 'background 0.1s',
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 'bold',
                  color: 'rgba(255,255,255,0.5)', minWidth: 24, textAlign: 'center' }}>
                  {item.symbol}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.85)', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
                {categoryBadge(item.type)}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '7px 16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 16 }}>
          {[['Ctrl+K', 'open palette'], ['↑↓', 'navigate'], ['Tab', 'next'], ['↵', 'open'], ['esc', 'close']].map(([key, label]) => (
            <span key={key} style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
              <kbd style={{ marginRight: 4, padding: '1px 5px', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 3, color: 'rgba(255,255,255,0.35)' }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
};

export default CommandPalette;
