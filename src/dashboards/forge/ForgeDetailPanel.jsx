import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { activeCATRef } from '../../themes/ThemeContext.jsx';
import { FORGE_OVERLAY, FORGE_LABELS, getForgeStatusTier } from './forgeConfig.js';

const SECTION_LABEL_STYLE = { fontSize: 8, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3em' };
const STATUS_DOT_BASE = { width: 6, height: 6, borderRadius: '50%' };

// SEC-04 / FE-06: safeHref cached in const before JSX — avoids double call
const safeHref = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') ? url : null;
  } catch {
    return null;
  }
};

const PANEL_TITLE_ID = 'forge-detail-panel-title';

const ForgeDetailPanel = ({ element, stats, onClose, getStatusTierFn }) => {
  const cat         = element ? (activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION) : null;
  const status      = element ? getForgeStatusTier(stats.level, getStatusTierFn) : null;
  const overlay     = element ? FORGE_OVERLAY[element.id] : null;
  const stationClass = element ? (FORGE_LABELS[element.cat] || element.cat) : null;
  // FE-06: cache safeHref result — single call, no double-evaluation in JSX
  const safeUrl     = element ? safeHref(element.url) : null;
  const panelRef    = React.useRef(null);
  const triggerRef  = React.useRef(null);

  React.useEffect(() => {
    if (!element) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [element, onClose]);

  React.useEffect(() => {
    if (element) { triggerRef.current = document.activeElement; panelRef.current?.focus(); }
    else { triggerRef.current?.focus(); }
  }, [element]);

  React.useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;
    if (element) main.setAttribute('inert', ''); else main.removeAttribute('inert');
    return () => main.removeAttribute('inert');
  }, [element]);

  return (
    <AnimatePresence>
      {element && (
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby={PANEL_TITLE_ID}
          key="forge-detail-panel"
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
                {/* Forge visual: anvil — aria-hidden, decorative */}
                <div aria-hidden="true" style={{ position: 'relative', width: 56, height: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }}>
                  <div style={{ position: 'absolute', top: 10, left: 8, width: 12, height: 12, borderRadius: '0 6px 0 0', background: stats.online ? cat.text : 'rgba(255,255,255,0.12)', opacity: stats.online ? 0.70 : 0.20 }} />
                  <div style={{ width: 40, height: 16, borderRadius: '3px 3px 0 0', background: stats.online ? cat.text : 'rgba(255,255,255,0.15)', opacity: stats.online ? 0.80 : 0.20, boxShadow: stats.online ? `0 0 14px ${cat.glow}` : 'none', position: 'relative', zIndex: 1 }} />
                  <div style={{ width: 30, height: 10, background: stats.online ? cat.text : 'rgba(255,255,255,0.10)', opacity: stats.online ? 0.60 : 0.15 }} />
                </div>
                <div>
                  <div id={PANEL_TITLE_ID} style={{ fontSize: 11, color: cat.text, letterSpacing: '0.2em' }}>
                    {(overlay?.station ?? element.name).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>
                    {overlay?.tool ?? element.symbol} ◆ {overlay?.alloy ?? ''}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2, letterSpacing: '0.1em' }}>
                    {stationClass?.toUpperCase()}
                  </div>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close forge detail panel"
                className="text-white/30 hover:text-white/70 transition-colors mt-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 focus-visible:outline-offset-2"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>FORGE_PARAMETERS</div>
                <div style={{ fontSize: 12, color: cat.text }}>{overlay?.temper ?? element.electronConfig}</div>
                <div style={{ ...SECTION_LABEL_STYLE, marginTop: 8, marginBottom: 4 }}>
                  HEAT_STATES ◆ [COLD_IRON | WARMING_UP | FORGE_HOT | SLAG_OVERFLOW]
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                  {overlay ? `Alloy: ${overlay.alloy}` : element.oxidation}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ ...SECTION_LABEL_STYLE }}>CURRENT_STATE: </span>
                  <span style={{ fontSize: 9, color: status.tier > 0 ? status.glowColor : cat.text }}>{status.label}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div style={{ ...SECTION_LABEL_STYLE, marginBottom: 6 }}>SERVICE_TELEMETRY ◆ {element.service}</div>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <div style={{ ...STATUS_DOT_BASE, background: stats.online ? '#22c55e' : '#ef4444', boxShadow: `0 0 6px ${stats.online ? '#22c55e' : '#ef4444'}` }} />
                  <span style={{ fontSize: 9, color: stats.online ? '#22c55e' : '#ef4444' }}>{stats.online ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
                {safeUrl ? (
                  <a href={safeUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(255,140,40,0.8)', border: '1px solid rgba(255,140,40,0.3)', padding: '8px 0', marginTop: 8, textDecoration: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,140,40,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    OPEN SERVICE UI →
                  </a>
                ) : (
                  <div style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 0', marginTop: 8 }}>NO_UI_AVAILABLE</div>
                )}
                <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 2, height: 4, overflow: 'hidden' }}>
                  <motion.div style={{ height: '100%', background: status.tier > 0 ? status.glowColor : cat.border, borderRadius: 2 }} initial={{ width: 0 }} animate={{ width: `${stats.level}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
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

export default ForgeDetailPanel;
