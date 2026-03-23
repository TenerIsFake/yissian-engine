import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { BIO_OVERLAY, BIO_LABELS, getBioStatusTier } from './bioConfig.js';

const MONO = 'monospace';
const SECTION_LABEL_STYLE = { fontSize: 8, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3em' };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

const safeHref = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') ? url : null;
  } catch { return null; }
};

const BioDetailPanel = ({ element, stats, onClose, getStatusTierFn }) => {
  const cat = element ? (activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION) : null;
  const status = element ? getBioStatusTier(stats.level, getStatusTierFn) : null;
  const overlay = element ? BIO_OVERLAY[element.id] : null;
  const organelleClass = element ? (BIO_LABELS[element.cat] || element.cat) : null;
  const panelRef   = React.useRef(null);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    if (!element) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [element, onClose]);

  React.useEffect(() => {
    if (element) {
      triggerRef.current = document.activeElement;
      panelRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [element]);

  React.useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    if (element) {
      main.setAttribute('inert', '');
    } else {
      main.removeAttribute('inert');
    }
    return () => main.removeAttribute('inert');
  }, [element]);

  return (
    <AnimatePresence>
      {element && (
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          key="bio-detail-panel"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed bottom-0 left-0 right-0 z-40 font-mono"
          style={{ background: '#0D0F14', borderTop: `2px solid ${cat.border}`, maxHeight: '38vh', outline: 'none' }}
        >
          <div className="max-w-screen-2xl mx-auto px-6 py-4 h-full overflow-y-auto">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-4">
                {/* Cell center visual */}
                <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    width: 48, height: 48,
                    borderRadius: '50%',
                    background: stats.online
                      ? `radial-gradient(circle at 40% 40%, ${cat.text}33, ${cat.glow.replace(/[\d.]+\)$/, '0.15)')} 60%, transparent)`
                      : 'transparent',
                    boxShadow: stats.online ? `0 0 20px ${cat.glow}` : 'none',
                  }} />
                  {/* Outer membrane ring */}
                  <div style={{
                    position: 'absolute',
                    width: 32, height: 32,
                    borderRadius: '50%',
                    border: `2px solid ${stats.online ? cat.border : 'rgba(255,255,255,0.1)'}`,
                    opacity: stats.online ? 0.7 : 0.3,
                  }} />
                  {/* Inner nucleus */}
                  <div style={{
                    width: 16, height: 16,
                    borderRadius: '50%',
                    background: stats.online
                      ? `radial-gradient(circle at 40% 40%, ${cat.text}, ${cat.glow.replace(/[\d.]+\)$/, '0.4)')})`
                      : 'rgba(255,255,255,0.08)',
                    position: 'relative',
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: cat.text, letterSpacing: '0.2em' }}>
                    {(overlay?.organelleName ?? element.name).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
                    {overlay?.bioSymbol ?? element.symbol} ◆ {overlay?.organelleType ?? ''}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.1em' }}>
                    {organelleClass?.toUpperCase()}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close bio detail panel"
                className="text-white/30 hover:text-white/70 transition-colors mt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.6)' }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Cell telemetry */}
              <div className="space-y-2">
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>CELL_PARAMETERS</div>
                <div style={{ fontSize: 12, color: cat.text }}>{overlay?.metabolicRate ?? element.electronConfig}</div>
                <div style={{ ...SECTION_LABEL_STYLE, marginTop: 8, marginBottom: 4 }}>
                  CELLULAR_STATES ◆ [ACTIVE | RESTING | REPLICATING | APOPTOTIC]
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                  {overlay?.cellularRole ?? element.oxidation}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ ...SECTION_LABEL_STYLE }}>CURRENT_STATE: </span>
                  <span style={{ fontSize: 9, color: status.tier > 0 ? status.glowColor : cat.text }}>{status.label}</span>
                </div>
              </div>

              {/* Right: Service telemetry (unchanged) */}
              <div className="space-y-2">
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>
                  SERVICE_TELEMETRY ◆ {element.service}
                </div>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <div style={{ ...STATUS_DOT_BASE, background: stats.online ? '#22c55e' : '#ef4444', boxShadow: `0 0 6px ${stats.online ? '#22c55e' : '#ef4444'}` }} />
                  <span style={{ fontSize: 9, color: stats.online ? '#22c55e' : '#ef4444' }}>{stats.online ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
                {safeHref(element.url) ? (
                  <a href={safeHref(element.url)} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', width: '100%', textAlign: 'center',
                      fontFamily: 'monospace', fontSize: 10, letterSpacing: 2,
                      color: 'rgba(100,200,255,0.8)', border: '1px solid rgba(100,200,255,0.3)',
                      padding: '8px 0', marginTop: 8, textDecoration: 'none',
                      cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,200,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    OPEN SERVICE UI →
                  </a>
                ) : (
                  <div style={{ display: 'block', width: '100%', textAlign: 'center',
                    fontFamily: 'monospace', fontSize: 10, letterSpacing: 2,
                    color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 0', marginTop: 8 }}>
                    NO_UI_AVAILABLE
                  </div>
                )}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 4, overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: status.tier > 0 ? status.glowColor : cat.border, borderRadius: 2 }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.level}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                {stats.details?.map((d) => (
                  <div key={d.label} className="flex justify-between" style={{ fontSize: 9, paddingTop: 3, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{d.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BioDetailPanel;
