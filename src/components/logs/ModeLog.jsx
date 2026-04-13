import React, { useState } from 'react';
import TerminalLog from './TerminalLog.jsx';
import ParchmentLog from './ParchmentLog.jsx';
import OrganicLog from './OrganicLog.jsx';
import MechanicalLog from './MechanicalLog.jsx';
import AtmosphericLog from './AtmosphericLog.jsx';

// ── Mode → Log Family mapping ────────────────────────────────
const LOG_FAMILY = {
  CHEM:     TerminalLog,
  NEURAL:   TerminalLog,
  AIRPORT:  TerminalLog,
  PARTICLE: TerminalLog,
  ARCANE:   ParchmentLog,
  DINO:     ParchmentLog,
  NOIR:     ParchmentLog,
  BIO:      OrganicLog,
  OCEAN:    OrganicLog,
  WEATHER:  OrganicLog,
  PLANET:   OrganicLog,
  FORGE:    MechanicalLog,
  BAND:     MechanicalLog,
  VINYL:    MechanicalLog,
  MOLECULE: MechanicalLog,
  SPACE:    AtmosphericLog,
  GLOBE:    AtmosphericLog,
};

/**
 * ModeLog — drop-in replacement for LabJournal.
 * Same prop interface: { logs, title, mode }
 * Renders the mode-appropriate log family component.
 */
export default function ModeLog({ logs, title, mode }) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter]     = useState('ALL');

  const services = ['ALL', ...new Set(logs.map(e => e.service).filter(Boolean))];
  const visibleEntries = filter === 'ALL' ? logs : logs.filter(e => e.service === filter);

  const LogComponent = LOG_FAMILY[mode] || TerminalLog;

  return (
    <LogComponent
      logs={logs}
      title={title}
      filter={filter}
      setFilter={setFilter}
      expanded={expanded}
      setExpanded={setExpanded}
      services={services}
      visibleEntries={visibleEntries}
    />
  );
}
