import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MONO } from '../utils/constants.js';
import { apiFetch } from '../utils/apiClient.js';
import StatusDot from './StatusDot.jsx';

function ageStatus(isoStr) {
  if (!isoStr) return 'down';
  const age = (Date.now() - new Date(isoStr).getTime()) / 3600000;
  if (age < 24) return 'up';
  if (age < 48) return 'stale';
  return 'down';
}

function relAge(isoStr) {
  if (!isoStr) return '—';
  const h = Math.floor((Date.now() - new Date(isoStr).getTime()) / 3600000);
  if (h < 1) return '<1h ago';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function BackupPanoramaWidget() {
  const { data } = useQuery({
    queryKey: ['backup-panorama'],
    queryFn: () => apiFetch('/api/flask/backup/panorama'),
    refetchInterval: 300_000,
  });

  const rowStyle = { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)' };
  const labelStyle = { fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.6)', flex: 1 };
  const valStyle = { fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.4)' };

  const restic = data?.restic_srv1 || {};
  const sync = data?.syncthing || {};
  const vols = data?.docker_volumes || {};

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
        ◆ BACKUP PANORAMA ◆
      </div>

      <div style={rowStyle}>
        <StatusDot status={restic.status === 'ok' ? ageStatus(restic.last_backup) : 'down'} />
        <span style={labelStyle}>Restic SRV-1</span>
        <span style={valStyle}>{relAge(restic.last_backup)}</span>
        <span style={valStyle}>{restic.snapshot_count ?? '—'} snaps</span>
        <span style={valStyle}>{restic.size_gb ? `${restic.size_gb} GB` : '—'}</span>
      </div>

      <div style={rowStyle}>
        <StatusDot status={sync.status === 'ok' ? 'up' : sync.status === 'syncing' ? 'stale' : 'down'} />
        <span style={labelStyle}>Syncthing</span>
        <span style={valStyle}>{sync.connected_peers ?? '—'} peers</span>
        <span style={valStyle}>{sync.need_files ? `${sync.need_files} pending` : sync.state || '—'}</span>
      </div>

      <div style={rowStyle}>
        <StatusDot status={vols.status === 'ok' ? ageStatus(vols.last_backup) : 'down'} />
        <span style={labelStyle}>Volume Backups</span>
        <span style={valStyle}>{relAge(vols.last_backup)}</span>
        <span style={valStyle}>{vols.file_count ?? '—'} files</span>
        <span style={valStyle}>{vols.total_mb ? `${vols.total_mb} MB` : '—'}</span>
      </div>

      <div style={{ ...rowStyle, borderBottom: 'none' }}>
        <StatusDot status="up" />
        <span style={labelStyle}>Backup Cron</span>
        <span style={valStyle}>daily 3am</span>
      </div>
    </div>
  );
}
