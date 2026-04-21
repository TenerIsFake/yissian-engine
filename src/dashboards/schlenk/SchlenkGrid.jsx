import React from 'react';
import SchlenkManifold from './SchlenkManifold.jsx';
import PeriodicTableGrid from '../../components/PeriodicTableGrid.jsx';

/**
 * SCHLENK — Grid wrapper.
 * Phase 1 reuses PeriodicTableGrid (Layout B is driven via zoneConfigs/schlenk.js).
 * Phase 2 will promote this to a bespoke grid with glassware SVGs per zone.
 */
export default function SchlenkGrid(props) {
  return (
    <div style={{ position: 'relative' }}>
      <SchlenkManifold />
      <PeriodicTableGrid {...props} />
    </div>
  );
}
