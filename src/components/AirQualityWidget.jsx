import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const MONO = 'monospace';

const AQI_COLOR = {
  'Good':                            '#2ecc71',
  'Moderate':                        '#f1c40f',
  'Unhealthy for Sensitive Groups':  '#e67e22',
  'Unhealthy':                       '#e74c3c',
  'Very Unhealthy':                  '#9b59b6',
  'Hazardous':                       '#922b21',
};

const AQI_ICON = {
  'Good':                            '✓',
  'Moderate':                        '~',
  'Unhealthy for Sensitive Groups':  '!',
  'Unhealthy':                       '✗',
  'Very Unhealthy':                  '✗',
  'Hazardous':                       '✗',
};

const PollutantRow = ({ label, data }) => {
  if (!data) return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', minWidth: 48 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>No nearby station</span>
    </div>
  );

  const color  = AQI_COLOR[data.category] ?? 'rgba(255,255,255,0.4)';
  const icon   = AQI_ICON[data.category]  ?? '◆';
  const ts     = data.last_updated ? new Date(data.last_updated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', minWidth: 40 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.7)', minWidth: 60 }}>
        {data.value} {data.unit}
      </span>
      {data.aqi !== null && (
        <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)', minWidth: 40 }}>
          AQI {data.aqi}
        </span>
      )}
      <span aria-hidden="true" style={{ color, fontSize: 9, fontFamily: MONO }}>{icon}</span>
      <span style={{ fontFamily: MONO, fontSize: 8, color, flex: 1 }}>{data.category}</span>
      {ts && <span style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{ts}</span>}
    </div>
  );
};

export const AirQualityWidget = ({ headerLabel }) => {
  const [collapsed, setCollapsed] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['air-quality'],
    queryFn: async () => {
      const res = await fetch('/api/flask/airquality');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30 * 60 * 1000,
  });

  // Overall worst category color for header dot
  const worstColor = (() => {
    if (!data) return 'rgba(255,255,255,0.2)';
    const cats = ['pm25', 'pm10', 'o3'].map(k => data[k]?.category).filter(Boolean);
    const order = ['Hazardous', 'Very Unhealthy', 'Unhealthy', 'Unhealthy for Sensitive Groups', 'Moderate', 'Good'];
    for (const o of order) { if (cats.includes(o)) return AQI_COLOR[o]; }
    return 'rgba(255,255,255,0.2)';
  })();

  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 16px' }}>

      <button onClick={() => setCollapsed(v => !v)}
        aria-expanded={!collapsed}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
        <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: worstColor, flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.4)' }}>
          {headerLabel || '◆ AIR_QUALITY ◆ Chicago_OpenAQ'}
        </span>
        <span aria-hidden="true" style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {collapsed ? '▶' : '▼'}
        </span>
      </button>

      {!collapsed && (
        <div style={{ marginTop: 10 }}>
          {isLoading && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>
          )}
          {isError && (
            <div style={{ fontFamily: MONO, fontSize: 8, color: '#e74c3c' }}>OPENAQ_UNAVAILABLE</div>
          )}
          {!isLoading && !isError && data && (
            <>
              <PollutantRow label="PM2.5" data={data.pm25} />
              <PollutantRow label="PM10"  data={data.pm10} />
              <PollutantRow label="O3"    data={data.o3}   />
              {data.o3 && (
                <div style={{ fontFamily: MONO, fontSize: 7, color: 'rgba(255,255,255,0.15)', marginTop: 4, textAlign: 'right' }}>
                  O3 = 8h avg · station: {data.o3.station || '—'}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AirQualityWidget;
