import { useState, useEffect } from 'react';

const WEATHER_LAT = 41.85;
const WEATHER_LON = -87.65;
const WEATHER_POLL_MS = 600000; // 10 minutes

const WMO_DESC = (code) => {
  if (code === 0)                        return { label: 'Clear Sky',       state: 'GROUND_STATE'    };
  if (code <= 2)                         return { label: 'Mainly Clear',    state: 'GROUND_STATE'    };
  if (code === 3)                        return { label: 'Overcast',        state: 'METASTABLE'      };
  if (code <= 48)                        return { label: 'Fog',             state: 'SUBLIMATION'     };
  if (code <= 57)                        return { label: 'Drizzle',         state: 'EXCITED'         };
  if (code <= 67)                        return { label: 'Rain',            state: 'IONIZED'         };
  if (code <= 77)                        return { label: 'Snow',            state: 'CRYSTALLINE'     };
  if (code <= 82)                        return { label: 'Rain Showers',    state: 'PLASMA'          };
  if (code <= 86)                        return { label: 'Snow Showers',    state: 'CRYSTALLINE'     };
  if (code <= 99)                        return { label: 'Thunderstorm',    state: 'NUCLEAR_DECAY'   };
  return { label: 'Unknown', state: 'UNKNOWN' };
};

export default function useWeather(addLog) {
  const [weatherStats, setWeatherStats] = useState({
    temp: null, feelsLike: null, humidity: null, windSpeed: null,
    condition: null, state: 'GROUND_STATE', online: false,
  });
  const [weatherForecast, setWeatherForecast] = useState([]);
  const [weatherFetchedAt, setWeatherFetchedAt] = useState(null);
  const [weatherAge, setWeatherAge] = useState(null);

  // Weather polling
  useEffect(() => {
    const poll = async () => {
      try {
        const url = `/api/weather/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&current=temperature_2m,apparent_temperature,weather_code,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const c = data?.current ?? {};
        const wmo = WMO_DESC(c.weather_code ?? 0);
        setWeatherStats({
          temp:       c.temperature_2m         ?? null,
          feelsLike:  c.apparent_temperature   ?? null,
          humidity:   c.relative_humidity_2m   ?? null,
          windSpeed:  c.windspeed_10m           ?? null,
          condition:  wmo.label,
          state:      wmo.state,
          online:     true,
        });
        // NH-10: parse 3-day daily forecast (skip index 0 = today)
        const daily = data?.daily ?? {};
        const forecastDays = [];
        for (let i = 1; i <= 3; i++) {
          const dateStr = daily.time?.[i];
          if (!dateStr) break;
          const d = new Date(`${dateStr}T12:00:00`);
          forecastDays.push({
            day:    d.toLocaleDateString('en-US', { weekday: 'short' }),
            hi:     daily.temperature_2m_max?.[i]             ?? null,
            lo:     daily.temperature_2m_min?.[i]             ?? null,
            precip: daily.precipitation_probability_max?.[i]  ?? null,
          });
        }
        setWeatherForecast(forecastDays);
        setWeatherFetchedAt(new Date());
        addLog('WEATHER', `${wmo.label} — ${Math.round(c.temperature_2m ?? 0)}°F`, 'info');
      } catch (err) {
        setWeatherStats(p => ({ ...p, online: false }));
        addLog('WEATHER', `Probe offline: ${err.message}`, 'warn');
      }
    };
    poll();
    const t = setInterval(poll, WEATHER_POLL_MS);
    return () => clearInterval(t);
  }, [addLog]);

  // NH-10: recalculate "X min ago" label every minute
  useEffect(() => {
    const tick = () => {
      if (!weatherFetchedAt) return;
      const mins = Math.round((Date.now() - weatherFetchedAt.getTime()) / 60_000);
      setWeatherAge(mins < 1 ? 'just now' : `${mins}m ago`);
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [weatherFetchedAt]);

  return { weatherStats, weatherForecast, weatherAge };
}
