// src/dashboards/schlenk/SchlenkCastScene.jsx
// SCHLENK cast-view scene (viewBox 1400x660).
// Renders SRV-1 + SRV-2 apparatus above each manifold, 6 stopcocks per manifold,
// 3 zones per server, 3 centered lecture bottles, and a U-tube manometer.
import React from 'react';
import {
  CAST_W, CAST_H, AR_Y, VAC_Y,
  SRV1_MANIFOLD, SRV2_MANIFOLD, COUPLING,
  SRV1_APPARATUS, SRV2_APPARATUS,
  SRV1_STOPCOCKS, SRV2_STOPCOCKS,
  SRV1_ZONES, SRV2_ZONES,
  LECTURE_BOTTLES, MANOMETER,
} from './castLayout.js';
import { downloadToArDur, uploadToVacDur, loadDifferential } from './metricMappers.js';
import CTank from './apparatus/CTank.jsx';
import PiraniGauge from './apparatus/PiraniGauge.jsx';
import VacPump from './apparatus/VacPump.jsx';
import ColdTrap from './apparatus/ColdTrap.jsx';
import LectureBottle from './apparatus/LectureBottle.jsx';
import UTubeManometer from './apparatus/UTubeManometer.jsx';

// Read a numeric stat with fallback
function stat(statsMap, serviceId, key, fallback = 0) {
  return statsMap?.[serviceId]?.[key] ?? fallback;
}

export default function SchlenkCastScene({ statsMap = {}, elementRegistry = [] }) {
  // Aggregate SRV-1 and SRV-2 metrics from statsMap.
  // Convention: SRV-1 metrics on 'glances-srv1'-style keys, SRV-2 on 'glances-srv2'.
  // Fallback to 0 if unavailable — component renders neutral/empty state.
  const srv1 = statsMap.srv1 || {};
  const srv2 = statsMap.srv2 || {};

  const cpu1 = srv1.cpu ?? 0;
  const ram1 = srv1.ram ?? 0;
  const down1 = srv1.downloadMbps ?? 1;
  const up1 = srv1.uploadMbps ?? 1;
  const ping1 = srv1.pingMs ?? 0;
  const driveC1 = srv1.driveC ?? 0;
  const driveJ = srv1.driveJ ?? 0;
  const driveQ = srv1.driveQ ?? 0;
  const driveT = srv1.driveT ?? 0;

  const cpu2 = srv2.cpu ?? 0;
  const ram2 = srv2.ram ?? 0;
  const down2 = srv2.downloadMbps ?? 1;
  const up2 = srv2.uploadMbps ?? 1;
  const ping2 = srv2.pingMs ?? 0;
  const driveC2 = srv2.driveC ?? 0;

  const deltaTorr = loadDifferential({ cpu1, ram1, cpu2, ram2 });

  const srv1ArDur = downloadToArDur(down1);
  const srv1VacDur = uploadToVacDur(up1);
  const srv2ArDur = downloadToArDur(down2);
  const srv2VacDur = uploadToVacDur(up2);

  return (
    <svg viewBox={`0 0 ${CAST_W} ${CAST_H}`} xmlns="http://www.w3.org/2000/svg"
         style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <pattern id="dotsCast" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(79,184,212,0.07)" />
        </pattern>
        <linearGradient id="liqCyanCast" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#8CF0B4" stopOpacity="0.7" />
          <stop offset="1" stopColor="#8CF0B4" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="liqAmberCast" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFA940" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFA940" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="gNO2Cast" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D86030" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#B04518" stopOpacity="0.8" />
          <stop offset="1" stopColor="#8C3010" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="gI2Cast" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9040C8" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#6020A0" stopOpacity="0.75" />
          <stop offset="1" stopColor="#401880" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="gCl2Cast" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D0E880" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#A8C850" stopOpacity="0.7" />
          <stop offset="1" stopColor="#80A028" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="mercCast" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D8D8E8" />
          <stop offset="0.5" stopColor="#A8A8B8" />
          <stop offset="1" stopColor="#888898" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={CAST_W} height={CAST_H} fill="url(#dotsCast)" />

      {/* Manifold strip bg */}
      <rect x="0" y="0" width={CAST_W} height="110" fill="#0A1620" opacity="0.92" />
      <line x1="0" y1="110" x2={CAST_W} y2="110" stroke="rgba(79,184,212,0.35)" strokeWidth="1" />

      {/* ═ SRV-1 apparatus ═ */}
      <CTank x={SRV1_APPARATUS.cTank} y={10} fillPct={driveC1}
             label={`C ${Math.round(driveC1)}%`}
             subLabel={srv1.driveCGb ?? ''}
             color="#4FB8D4" gradientId="liqCyanCast" />
      <line x1={SRV1_APPARATUS.cTank} y1="55" x2={SRV1_APPARATUS.cTank} y2={AR_Y}
            stroke="#4FB8D4" strokeWidth="1.4" />

      <PiraniGauge x={SRV1_APPARATUS.pirani} y={27} ramPct={ram1} label="RAM" />
      <line x1={SRV1_APPARATUS.pirani} y1="46" x2={SRV1_APPARATUS.pirani} y2={VAC_Y}
            stroke="rgba(255,220,80,0.55)" strokeWidth="1.2" />

      <ColdTrap x={SRV1_APPARATUS.coldTrap} y={5}
                pingMs={ping1} downloadMbps={down1} uploadMbps={up1} />
      <line x1={SRV1_APPARATUS.coldTrap} y1="57" x2={SRV1_APPARATUS.coldTrap} y2={VAC_Y}
            stroke="rgba(120,180,255,0.55)" strokeWidth="1.2" />

      <VacPump x={SRV1_APPARATUS.vacPump} y={8} cpuPct={cpu1} />
      <line x1={SRV1_APPARATUS.vacPump} y1="50" x2={SRV1_APPARATUS.vacPump} y2={VAC_Y}
            stroke="rgba(255,140,60,0.55)" strokeWidth="1.2" />

      {/* ═ SRV-1 manifold lines ═ */}
      <line x1={SRV1_MANIFOLD.x1} y1={AR_Y} x2={SRV1_MANIFOLD.x2} y2={AR_Y}
            stroke="#4FB8D4" strokeWidth="2.6" strokeDasharray="10 6">
        <animate attributeName="stroke-dashoffset" from="0" to="-16"
                 dur={`${srv1ArDur}s`} repeatCount="indefinite" />
      </line>
      <line x1={SRV1_MANIFOLD.x1} y1={VAC_Y} x2={SRV1_MANIFOLD.x2} y2={VAC_Y}
            stroke="rgba(79,184,212,0.55)" strokeWidth="2.2" strokeDasharray="5 4">
        <animate attributeName="stroke-dashoffset" from="0" to="9"
                 dur={`${srv1VacDur}s`} repeatCount="indefinite" />
      </line>
      <text x="335" y="103" fontFamily="monospace" fontSize="7" fill="#4FB8D4"
            textAnchor="middle" letterSpacing="0.2em" opacity="0.8">
        SRV-1 · Ar ↓{Math.round(down1)} · Vac ↑{Math.round(up1)}
      </text>

      {/* SRV-1 stopcocks (6 evenly spaced) */}
      {Object.entries(SRV1_STOPCOCKS).map(([key, sx]) => {
        const isZone = ['M', 'I', 'L'].includes(key);
        return (
          <g key={key}>
            {isZone && (
              <>
                <circle cx={sx} cy={AR_Y} r="3.2" fill="#0A1620" stroke="#4FB8D4" strokeWidth="1.2" />
                <circle cx={sx} cy={VAC_Y} r="3.2" fill="#0A1620" stroke="rgba(79,184,212,0.55)" strokeWidth="1.2" />
              </>
            )}
            {!isZone && (
              <circle cx={sx} cy={AR_Y} r="2.6" fill="#0A1620" stroke="#8CF0B4" strokeWidth="1.1" />
            )}
            <text x={sx} y="103" fontFamily="monospace" fontSize="5"
                  fill={isZone ? 'rgba(79,184,212,0.6)' : 'rgba(140,240,180,0.6)'}
                  textAnchor="middle">{isZone ? `S-${key}` : `S-${key}`}</text>
          </g>
        );
      })}

      {/* ═ SRV-2 apparatus (mirror order) ═ */}
      <VacPump x={SRV2_APPARATUS.vacPump} y={8} cpuPct={cpu2} />
      <line x1={SRV2_APPARATUS.vacPump} y1="50" x2={SRV2_APPARATUS.vacPump} y2={VAC_Y}
            stroke="rgba(255,140,60,0.55)" strokeWidth="1.2" />

      <ColdTrap x={SRV2_APPARATUS.coldTrap} y={5}
                pingMs={ping2} downloadMbps={down2} uploadMbps={up2} />
      <line x1={SRV2_APPARATUS.coldTrap} y1="57" x2={SRV2_APPARATUS.coldTrap} y2={VAC_Y}
            stroke="rgba(120,180,255,0.55)" strokeWidth="1.2" />

      <PiraniGauge x={SRV2_APPARATUS.pirani} y={27} ramPct={ram2} label="RAM" />
      <line x1={SRV2_APPARATUS.pirani} y1="46" x2={SRV2_APPARATUS.pirani} y2={VAC_Y}
            stroke="rgba(255,220,80,0.55)" strokeWidth="1.2" />

      <CTank x={SRV2_APPARATUS.cTank} y={10} fillPct={driveC2}
             label={`C ${Math.round(driveC2)}%`}
             subLabel={srv2.driveCGb ?? ''}
             color="#FFA940" gradientId="liqAmberCast" />
      <line x1={SRV2_APPARATUS.cTank} y1="55" x2={SRV2_APPARATUS.cTank} y2={AR_Y}
            stroke="#FFA940" strokeWidth="1.4" />

      {/* ═ SRV-2 manifold lines ═ */}
      <line x1={SRV2_MANIFOLD.x1} y1={AR_Y} x2={SRV2_MANIFOLD.x2} y2={AR_Y}
            stroke="#FFA940" strokeWidth="2.6" strokeDasharray="10 6">
        <animate attributeName="stroke-dashoffset" from="0" to="16"
                 dur={`${srv2ArDur}s`} repeatCount="indefinite" />
      </line>
      <line x1={SRV2_MANIFOLD.x1} y1={VAC_Y} x2={SRV2_MANIFOLD.x2} y2={VAC_Y}
            stroke="rgba(255,169,64,0.55)" strokeWidth="2.2" strokeDasharray="5 4">
        <animate attributeName="stroke-dashoffset" from="0" to="-9"
                 dur={`${srv2VacDur}s`} repeatCount="indefinite" />
      </line>
      <text x="1065" y="103" fontFamily="monospace" fontSize="7" fill="#FFA940"
            textAnchor="middle" letterSpacing="0.2em" opacity="0.8">
        SRV-2 · Ar ↓{Math.round(down2)} · Vac ↑{Math.round(up2)}
      </text>

      {/* SRV-2 stopcocks */}
      {Object.entries(SRV2_STOPCOCKS).map(([key, sx]) => {
        const isZone = ['I2', 'T2', 'M2'].includes(key);
        return (
          <g key={key}>
            {isZone && (
              <>
                <circle cx={sx} cy={AR_Y} r="3.2" fill="#0A1620" stroke="#FFA940" strokeWidth="1.2" />
                <circle cx={sx} cy={VAC_Y} r="3.2" fill="#0A1620" stroke="rgba(255,169,64,0.55)" strokeWidth="1.2" />
              </>
            )}
            {!isZone && (
              <circle cx={sx} cy={AR_Y} r="2.6" fill="#0A1620" stroke="#8CF0B4" strokeWidth="1.1" />
            )}
            <text x={sx} y="103" fontFamily="monospace" fontSize="5"
                  fill={isZone ? 'rgba(255,169,64,0.6)' : 'rgba(140,240,180,0.6)'}
                  textAnchor="middle">{`S-${key}`}</text>
          </g>
        );
      })}

      {/* ═ Lecture bottles centered at x=700 ═ */}
      {Object.entries(LECTURE_BOTTLES).map(([key, bot]) => {
        const pct = (key === 'J' ? driveJ : key === 'Q' ? driveQ : driveT);
        const gbLabel = srv1[`drive${key}Gb`] ?? '';
        return (
          <LectureBottle key={key}
            x={COUPLING.cx} y={bot.y}
            gas={bot.gas} drive={bot.drive} fillPct={pct} gbLabel={gbLabel}
            srv1TargetX={bot.srv1Stopcock} srv2TargetX={bot.srv2Stopcock}
            arLineY={AR_Y} />
        );
      })}

      {/* ═ Zones ═ */}
      {Object.entries(SRV1_ZONES).map(([name, z]) => (
        <g key={`srv1-${name}`}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h}
                fill="rgba(79,184,212,0.04)" stroke="rgba(79,184,212,0.3)"
                strokeDasharray="3 3" rx="4" />
          <text x={z.x + 8} y={z.y + z.h - 8} fontFamily="monospace" fontSize="7"
                fill="rgba(79,184,212,0.7)" letterSpacing="0.15em">{name} · SRV-1</text>
          {/* Trunk: straight vertical from stopcock to sub-header */}
          <line x1={z.trunkX} y1={VAC_Y + 4} x2={z.trunkX} y2={z.subHeaderY}
                stroke="#4FB8D4" strokeWidth="1.6" />
          {/* Sub-header */}
          <line x1={z.x + 15} y1={z.subHeaderY} x2={z.x + z.w - 15} y2={z.subHeaderY}
                stroke="#4FB8D4" strokeWidth="1.4" />
        </g>
      ))}
      {Object.entries(SRV2_ZONES).map(([name, z]) => (
        <g key={`srv2-${name}`}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h}
                fill="rgba(255,169,64,0.04)" stroke="rgba(255,169,64,0.3)"
                strokeDasharray="3 3" rx="4" />
          <text x={z.x + 8} y={z.y + z.h - 8} fontFamily="monospace" fontSize="7"
                fill="rgba(255,169,64,0.7)" letterSpacing="0.15em">{name} · SRV-2</text>
          <line x1={z.trunkX} y1={VAC_Y + 4} x2={z.trunkX} y2={z.subHeaderY}
                stroke="#FFA940" strokeWidth="1.6" />
          <line x1={z.x + 15} y1={z.subHeaderY} x2={z.x + z.w - 15} y2={z.subHeaderY}
                stroke="#FFA940" strokeWidth="1.4" />
        </g>
      ))}

      {/* ═ Manometer (centered, v6 dimensions) ═ */}
      <UTubeManometer
        cx={MANOMETER.cx} topY={MANOMETER.topY} bottomY={MANOMETER.bottomY}
        legLeftX={MANOMETER.legLeftX} legRightX={MANOMETER.legRightX}
        deltaTorr={deltaTorr}
        srv1VacEndX={SRV1_MANIFOLD.x2} srv2VacStartX={SRV2_MANIFOLD.x1}
        vacLineY={VAC_Y} />
    </svg>
  );
}
