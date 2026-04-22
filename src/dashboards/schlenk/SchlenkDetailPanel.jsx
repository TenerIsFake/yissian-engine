import React from 'react';
import LiquidLevelGauge from './detailPanel/LiquidLevelGauge.jsx';
import BubblerRateGauge from './detailPanel/BubblerRateGauge.jsx';
import ManifoldSchematic from './detailPanel/ManifoldSchematic.jsx';
import LabJournal from './detailPanel/LabJournal.jsx';
import { getElementColor } from './elementColors.js';

function tierLabel(load) {
  if (load <= 20) return { label: 'T1 · COLD PUMP',   color: '#4FB8D4' };
  if (load <= 45) return { label: 'T2 · STATIC',       color: '#5FD4A8' };
  if (load <= 70) return { label: 'T3 · ARGON FLOW',   color: '#D4C070' };
  if (load <= 90) return { label: 'T4 · REFLUX',       color: '#D48860' };
  return { label: 'T5 · EXOTHERM', color: '#E84A28' };
}

/**
 * SCHLENK detail panel (opens on service card click).
 * Props:
 *   element: selected service
 *   stats: { level, online, ... }
 *   allElements: full service list (for neighbor lookup)
 *   onClose: close handler
 */
export default function SchlenkDetailPanel({ element, stats = {}, allElements = [], onClose }) {
  if (!element) return null;
  const load = Number(stats.level) || 0;
  const tier = tierLabel(load);
  const colorEntry = getElementColor(element.symbol || '');

  return (
    <div style={{
      background: '#0C1420',
      border: '1px solid #223040',
      borderRadius: 6,
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      color: '#C0D4DB',
      maxWidth: 640,
      fontFamily: 'monospace',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: 10,
        background: 'linear-gradient(90deg, rgba(59,151,212,0.15), rgba(59,151,212,0) 60%)',
        borderLeft: '3px solid #4FB8D4', borderRadius: 4,
      }}>
        <div style={{
          width: 48, height: 48, background: `${colorEntry.color}55`, border: `1.5px solid ${colorEntry.color}`,
          borderRadius: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        }}>
          <div style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{element.symbol || '?'}</div>
          <div style={{ color: colorEntry.color, fontSize: 7, marginTop: -2 }}>{element.z ?? ''}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: '#fff', letterSpacing: '0.1em' }}>
            {(element.service || element.name || '').toUpperCase()}
          </div>
          <div style={{ fontSize: 9, color: '#7A9BAE', marginTop: 2 }}>
            {colorEntry.compound} · load {load}%
          </div>
        </div>
        <div style={{
          fontSize: 9, padding: '3px 8px', borderRadius: 3, background: tier.color,
          color: '#0A0A0A', letterSpacing: '0.15em', fontWeight: 700,
        }}>
          {tier.label}
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid #4FB8D4', color: '#4FB8D4',
            padding: '3px 10px', fontFamily: 'monospace', fontSize: 10, cursor: 'pointer', borderRadius: 3,
          }}>×</button>
        )}
      </div>

      {/* Liquid-level gauge */}
      <div style={{ background: '#0A1420', border: '1px solid #1A2A3A', borderRadius: 5, padding: 10 }}>
        <div style={{ fontSize: 8, color: '#7A9BAE', letterSpacing: '0.25em', marginBottom: 6 }}>◆ LIQUID-LEVEL GAUGE</div>
        <LiquidLevelGauge percent={load} color={colorEntry.color} subtitle="queue fill" />
      </div>

      {/* Bubbler rate gauge */}
      <div style={{ background: '#0A1420', border: '1px solid #1A2A3A', borderRadius: 5, padding: 10 }}>
        <div style={{ fontSize: 8, color: '#7A9BAE', letterSpacing: '0.25em', marginBottom: 6 }}>◆ BUBBLER RATE</div>
        <BubblerRateGauge hz={(load / 25) + 0.2} peak={(load / 15)} avg={(load / 30)} />
      </div>

      {/* Manifold schematic */}
      <div style={{ background: '#0A1420', border: '1px solid #1A2A3A', borderRadius: 5, padding: 10 }}>
        <div style={{ fontSize: 8, color: '#7A9BAE', letterSpacing: '0.25em', marginBottom: 6 }}>◆ MANIFOLD SCHEMATIC · port highlighted</div>
        <ManifoldSchematic serviceId={element.id} allElements={allElements} />
      </div>

      {/* Lab journal */}
      <div style={{ background: '#0A1420', border: '1px solid #1A2A3A', borderRadius: 5, padding: 10 }}>
        <div style={{ fontSize: 8, color: '#7A9BAE', letterSpacing: '0.25em', marginBottom: 6 }}>◆ LAB JOURNAL · recent</div>
        <LabJournal entries={stats.logs || []} />
      </div>
    </div>
  );
}
