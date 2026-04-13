import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MONO } from '../utils/constants.js';

const SECTION_STYLE = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '14px 16px',
};

/* ── Air Quality helpers ── */
const AQI_COLOR = {
  'Good':                            '#2ecc71',
  'Moderate':                        '#f1c40f',
  'Unhealthy for Sensitive Groups':  '#e67e22',
  'Unhealthy':                       '#e74c3c',
  'Very Unhealthy':                  '#9b59b6',
  'Hazardous':                       '#922b21',
};
const AQI_ICON = {
  'Good': '✓', 'Moderate': '~', 'Unhealthy for Sensitive Groups': '!',
  'Unhealthy': '✗', 'Very Unhealthy': '✗', 'Hazardous': '✗',
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

const WeatherWidget = ({ weatherStats, weatherForecast, weatherAge, headerLabel, airQualityLabel }) => {
  const { temp, feelsLike, humidity, windSpeed, condition, state, online } = weatherStats;

  /* ── Air Quality data ── */
  const { data: aqData, isLoading: aqLoading, isError: aqError } = useQuery({
    queryKey: ['air-quality'],
    queryFn: async () => {
      const res = await fetch('/api/flask/airquality');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30 * 60 * 1000,
  });

  const worstColor = (() => {
    if (!aqData) return 'rgba(255,255,255,0.2)';
    const cats = ['pm25', 'pm10', 'o3'].map(k => aqData[k]?.category).filter(Boolean);
    const order = ['Hazardous', 'Very Unhealthy', 'Unhealthy', 'Unhealthy for Sensitive Groups', 'Moderate', 'Good'];
    for (const o of order) { if (cats.includes(o)) return AQI_COLOR[o]; }
    return 'rgba(255,255,255,0.2)';
  })();

  return (
    <div style={SECTION_STYLE}>
      <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.25em', marginBottom: 8 }}>
        {headerLabel || '◆ ATMOSPHERIC_PROBE ◆ Open-Meteo'}
        {weatherAge && (
          <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            {weatherAge}
          </span>
        )}
      </div>

      {!online ? (
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
          PROBE OFFLINE
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 300, color: 'white', fontFamily: MONO }}>
              {temp !== null ? `${Math.round(temp)}°F` : '—'}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
              {condition ?? 'Unknown'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {feelsLike !== null && (
              <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>
                FEELS: {Math.round(feelsLike)}°F
              </span>
            )}
            {humidity !== null && (
              <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>
                HUMIDITY: {humidity}%
              </span>
            )}
            {windSpeed !== null && (
              <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>
                WIND: {Math.round(windSpeed)} mph
              </span>
            )}
            <span style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>
              STATE: {state}
            </span>
          </div>

          {weatherForecast.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}>
              {weatherForecast.map((d, i) => (
                <div key={i} style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>{d.day}</div>
                  <div>{d.hi !== null ? `${Math.round(d.hi)}°` : '—'}/{d.lo !== null ? `${Math.round(d.lo)}°` : '—'}</div>
                  {d.precip !== null && <div style={{ color: 'rgba(100,180,255,0.5)' }}>{d.precip}%</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Air Quality (bottom half) ── */}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: worstColor, flexShrink: 0 }} />
          <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)' }}>
            {airQualityLabel || 'AIR_QUALITY ◆ Chicago_OpenAQ'}
          </span>
        </div>

        {aqLoading && (
          <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>LOADING...</div>
        )}
        {aqError && (
          <div style={{ fontFamily: MONO, fontSize: 8, color: '#e74c3c' }}>OPENAQ_UNAVAILABLE</div>
        )}
        {!aqLoading && !aqError && aqData && (
          <>
            <PollutantRow label="PM2.5" data={aqData.pm25} />
            <PollutantRow label="PM10"  data={aqData.pm10} />
            <PollutantRow label="O3"    data={aqData.o3}   />
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;
