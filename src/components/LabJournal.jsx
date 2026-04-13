import React from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const LabJournal = ({ logs, title }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [filter, setFilter] = React.useState('ALL');

  const typeStyle = (t) => {
    if (t === 'success') return 'text-emerald-400';
    if (t === 'error')   return 'text-red-400';
    if (t === 'warn')    return 'text-amber-400';
    return 'text-cyan-400';
  };
  const typeGlyph = (t) => {
    if (t === 'success') return '✓';
    if (t === 'error')   return '✗';
    if (t === 'warn')    return '⚠';
    return 'ℹ';
  };

  const services = ['ALL', ...new Set(logs.map(e => e.service).filter(Boolean))];
  const visibleEntries = filter === 'ALL' ? logs : logs.filter(e => e.service === filter);

  return (
    <div className="rounded-xl border border-white/10 backdrop-blur-md bg-black/40 shadow-2xl overflow-hidden font-mono transition-all duration-500">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b text-[9px] tracking-[0.25em] uppercase border-white/10 text-white/35 bg-white/5">
        <Terminal size={10} className="opacity-60" />
        {title ?? 'LAB_JOURNAL ◆ Observation_Log'}
        <span className="ml-auto text-white/20 motion-safe:animate-[blink_1s_step-end_infinite]">█</span>
        <button onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse log' : 'Expand log'}
          aria-controls="lab-journal-entries"
          className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.4)',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
            padding: '1px 6px', cursor: 'pointer', letterSpacing: 1, marginLeft: 8 }}>
          {expanded ? '▲ COLLAPSE' : '▼ EXPAND'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '4px 8px', flexWrap: 'wrap',
        borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {services.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: 1,
              padding: '4px 8px', minHeight: 28, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)',
              background: filter === s ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: filter === s ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
            {s}
          </button>
        ))}
      </div>
      <div id="lab-journal-entries" className="p-4 space-y-1.5 flex flex-col overflow-y-auto"
        style={{ height: expanded ? 'min(60vh, 400px)' : '15rem', transition: 'height 0.3s ease' }}>
        {visibleEntries.map((log) => (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            key={log.id}
            className="flex gap-3 text-[10px] leading-tight"
          >
            <span className="text-white/20 shrink-0 tabular-nums">[{log.time}]</span>
            <span className={`shrink-0 ${typeStyle(log.type)}`}>{typeGlyph(log.type)}</span>
            <span className={`font-bold shrink-0 ${typeStyle(log.type)}`}>{log.service}:</span>
            <span className="text-white/65">{log.message}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LabJournal;
