import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MONO } from '../utils/constants.js';
import { apiFetch } from '../utils/apiClient.js';

function deltaColor(pct) {
  const abs = Math.abs(pct);
  if (abs < 10) return '#22c55e';
  if (abs < 25) return '#eab308';
  return '#ef4444';
}

function fmt(v, suffix = '%') {
  if (v == null || v === '?') return '—';
  return typeof v === 'number' ? `${Math.round(v)}${suffix}` : String(v);
}

export default function ServerComparisonWidget() {
  const { data: srv1 } = useQuery({
    queryKey: ['glances-srv1-compare'],
    queryFn: async () => {
      const [cpu, mem, fs, up] = await Promise.all([
        apiFetch('/api/glances/api/4/cpu'),
        apiFetch('/api/glances/api/4/mem'),
        apiFetch('/api/glances/api/4/fs'),
        apiFetch('/api/glances/api/4/uptime').catch(() => null),
      ]);
      return { cpu: cpu?.total, ram: mem?.percent, disk: fs, uptime: up };
    },
    refetchInterval: 60_000,
  });

  const { data: srv2 } = useQuery({
    queryKey: ['glances-srv2-compare'],
    queryFn: async () => {
      const [cpu, mem, fs, up] = await Promise.all([
        apiFetch('/api/srv2-glances/api/4/cpu'),
        apiFetch('/api/srv2-glances/api/4/mem'),
        apiFetch('/api/srv2-glances/api/4/fs'),
        apiFetch('/api/srv2-glances/api/4/uptime').catch(() => null),
      ]);
      return { cpu: cpu?.total, ram: mem?.percent, disk: fs, uptime: up };
    },
    refetchInterval: 60_000,
  });

  const offline2 = !srv2 || (srv2.cpu == null && srv2.ram == null);

  function primaryDisk() {
    if (!srv1?.disk) return null;
    const d = srv1.disk.find(d => d.mnt_point?.toLowerCase()?.startsWith('/mnt/c'));
    return d?.percent;
  }
  function secondaryDisk() {
    if (!srv2?.disk) return null;
    const d = srv2.disk.find(d => d.mnt_point?.toLowerCase()?.startsWith('/mnt/c'));
    return d?.percent;
  }

  const rows = [
    { label: 'CPU', v1: srv1?.cpu, v2: srv2?.cpu, suffix: '%' },
    { label: 'RAM', v1: srv1?.ram, v2: srv2?.ram, suffix: '%' },
    { label: 'C: Disk', v1: primaryDisk(), v2: secondaryDisk(), suffix: '%' },
  ];

  const cellStyle = { fontFamily: MONO, fontSize: 10, padding: '4px 8px', color: 'rgba(255,255,255,0.7)' };
  const headerStyle = { ...cellStyle, color: 'rgba(255,255,255,0.35)', fontSize: 8, letterSpacing: '0.15em' };

  return (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
        ◆ SERVER COMPARISON ◆
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, textAlign: 'left', width: '25%' }}>METRIC</th>
            <th style={{ ...headerStyle, textAlign: 'right', width: '22%' }}>SRV-1</th>
            <th style={{ ...headerStyle, textAlign: 'center', width: '16%' }}>DELTA</th>
            <th style={{ ...headerStyle, textAlign: 'right', width: '22%' }}>
              {offline2 ? <span style={{ color: '#ef4444' }}>SRV-2 OFFLINE</span> : 'SRV-2'}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const delta = (r.v1 != null && r.v2 != null) ? r.v2 - r.v1 : null;
            return (
              <tr key={r.label} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.5)' }}>{r.label}</td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>{fmt(r.v1, r.suffix)}</td>
                <td style={{ ...cellStyle, textAlign: 'center', color: delta != null ? deltaColor(delta) : 'rgba(255,255,255,0.2)' }}>
                  {delta != null ? `${delta >= 0 ? '+' : ''}${Math.round(delta)}%` : '—'}
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  {offline2 ? <span style={{ color: '#ef4444' }}>—</span> : fmt(r.v2, r.suffix)}
                </td>
              </tr>
            );
          })}
          <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <td style={{ ...cellStyle, color: 'rgba(255,255,255,0.5)' }}>Uptime</td>
            <td style={{ ...cellStyle, textAlign: 'right' }}>{srv1?.uptime || '—'}</td>
            <td style={{ ...cellStyle, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }} />
            <td style={{ ...cellStyle, textAlign: 'right' }}>{offline2 ? '—' : (srv2?.uptime || '—')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
