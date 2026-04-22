import React, { Suspense } from 'react';
import { useDashboard } from '../../context/DashboardContext.jsx';
import MODE_REGISTRY from '../../modeRegistry.js';
import SystemMetricsPanel from '../../components/SystemMetricsPanel.jsx';

export default function SystemMetricsWidget() {
  const { addLog, transcodingActive, plexStats, dashboardMode } = useDashboard();
  const reg = MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM;

  return (
    <Suspense fallback={null}>
      <SystemMetricsPanel
        addLog={addLog}
        transcodingActive={transcodingActive}
        plexStatsLevel={plexStats.level}
        sectionLabels={reg.sectionLabels}
        glancesLabels={reg.glancesLabels}
        storageLabels={reg.storageLabels}
        widgetLabels={reg.widgetLabels}
        jablonskiLabels={reg.jablonskiLabels}
        CpuDiagram={reg.CpuDiagram}
        RamDiagram={reg.RamDiagram}
        DownloadDiagram={reg.DownloadDiagram}
        UploadDiagram={reg.UploadDiagram}
        ServerStorageDiagram={reg.ServerStorageDiagram}
        MediaStorageDiagram={reg.MediaStorageDiagram}
        SpeedtestDiagram={reg.SpeedtestDiagram}
        glowMetrics={dashboardMode === 'SCHLENK'}
      />
    </Suspense>
  );
}
