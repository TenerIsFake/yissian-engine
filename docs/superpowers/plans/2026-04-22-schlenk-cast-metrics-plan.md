# SCHLENK Cast-View Metrics Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render SRV-1 and SRV-2 system metrics inside a cast-optimized SCHLENK scene (`?cast=1&mode=SCHLENK`), with apparatus above each manifold, centered lecture bottles + U-tube manometer, and a 3-row cast chrome (weather-clock bar + full-width scene + bottom badge strip).

**Architecture:** Pure-SVG components with SMIL animations driven by props from `useDashboard()` context (statsMap, SSE-pushed). New cast-specific scene component composes 7 reusable apparatus components at fixed positions from a constants file. Pure metric-mapper functions separate visual math from rendering. CastLayout branches on `dashboardMode === 'SCHLENK'` for specialized chrome.

**Tech Stack:** React 18 + Vite, inline SVG with native SMIL `<animate>`/`<animateTransform>`, no external animation libs. No test framework (the repo has no test runner); verification via `npm run build` syntax check + in-browser visual smoke testing against deployed homepage container.

**Reference spec:** `docs/superpowers/specs/2026-04-22-schlenk-cast-metrics-design.md`

---

## File Structure

New files (all under `/home/tener/projects/Homepage-claude/`):

| File | Purpose | Size |
|------|---------|------|
| `src/dashboards/schlenk/castLayout.js` | Positional constants: manifold x-ranges, apparatus x's, stopcock x's, zone bounds | ~60 lines |
| `src/dashboards/schlenk/metricMappers.js` | Pure functions: CPU→rotor-dur, RAM→needle-angle, etc. | ~50 lines |
| `src/dashboards/schlenk/apparatus/CTank.jsx` | C-drive tank with liquid-level fill | ~40 lines |
| `src/dashboards/schlenk/apparatus/PiraniGauge.jsx` | RAM gauge with rotating needle | ~35 lines |
| `src/dashboards/schlenk/apparatus/VacPump.jsx` | CPU pump with speed-scaled rotor | ~35 lines |
| `src/dashboards/schlenk/apparatus/ColdTrap.jsx` | Cold trap with frost ticks + rising bubbles | ~55 lines |
| `src/dashboards/schlenk/apparatus/LectureBottle.jsx` | Lecture bottle with gas color + cross-feeds | ~70 lines |
| `src/dashboards/schlenk/apparatus/UTubeManometer.jsx` | U-tube with differential Hg column | ~60 lines |
| `src/dashboards/schlenk/SchlenkCastScene.jsx` | Top-level cast scene (1400×660) | ~250 lines |

Files modified:

| File | Change |
|------|--------|
| `src/modeRegistry.js` | Add `castSize: [1400, 660]` to SCHLENK row + lazy-import SchlenkCastScene as `CastGrid` |
| `CastLayout.jsx` | Prefer `reg.CastGrid` when cast + use per-mode natural size; branch to 3-row layout for SCHLENK |
| `CastLayout.jsx` | Add bottom badge strip rendering (SCHLENK branch only) |

---

## Task 1: Layout Constants

**Files:**
- Create: `src/dashboards/schlenk/castLayout.js`

- [ ] **Step 1: Create constants file**

```javascript
// src/dashboards/schlenk/castLayout.js
// Positional constants for SCHLENK cast scene (viewBox 1400x660).
// All coordinates in SVG viewBox units.

export const CAST_W = 1400;
export const CAST_H = 660;

// Manifold strip occupies y=0..110
export const STRIP_H = 110;

// Ar + Vac line Y positions inside the strip
export const AR_Y = 70;
export const VAC_Y = 85;

// SRV-1 manifold extends x=30..640 (610 wide)
export const SRV1_MANIFOLD = { x1: 30, x2: 640 };
// SRV-2 manifold extends x=760..1370 (mirror, 610 wide)
export const SRV2_MANIFOLD = { x1: 760, x2: 1370 };

// Coupling gap x=640..760 (120 wide) hosts lecture bottles + manometer taps
export const COUPLING = { x1: 640, x2: 760, cx: 700 };

// Apparatus X positions per server (4 items, evenly spaced above manifold)
// Chemistry order: C tank (outer, feeds Ar) → Pirani → Cold trap → Vac pump (inner, near coupling)
export const SRV1_APPARATUS = {
  cTank: 100,
  pirani: 250,
  coldTrap: 400,
  vacPump: 550,
};
// SRV-2 mirrored: pump inner → trap → pirani → C outer
export const SRV2_APPARATUS = {
  vacPump: 850,
  coldTrap: 1000,
  pirani: 1150,
  cTank: 1300,
};

// 6 evenly-spaced stopcocks per manifold at ~87px intervals
// Zone stopcocks are INSIDE their zone's x-range so trunks drop straight.
export const SRV1_STOPCOCKS = {
  M: 117,   // zone: MEDIA-1 (x=10..320)
  J: 204,   // shared: J bottle
  I: 291,   // zone: INFRA-1 trunk (drops through gutter between MEDIA-1 & LIBRARY-1)
  L: 379,   // zone: LIBRARY-1 (x=330..640)
  Q: 466,   // shared: Q bottle
  T: 553,   // shared: T bottle
};
export const SRV2_STOPCOCKS = {
  T: 847,   // shared: T bottle mirror (1400-553)
  I2: 934,  // zone: INFRA-2 (x=760..1070)
  Q: 1021,  // shared: Q bottle mirror
  T2: 1109, // zone: TOOLS-2 trunk (drops through gutter between INFRA-2 & MEDIA-2)
  M2: 1196, // zone: MEDIA-2 (x=1080..1390)
  J: 1283,  // shared: J bottle mirror
};

// Zone bounds — each zone contains its trunk stopcock's X for straight-drop trunks
export const SRV1_ZONES = {
  MEDIA:   { x: 10,  y: 115, w: 310, h: 325, trunkX: 117, subHeaderY: 135 },
  LIBRARY: { x: 330, y: 115, w: 310, h: 325, trunkX: 379, subHeaderY: 135 },
  INFRA:   { x: 10,  y: 455, w: 630, h: 85,  trunkX: 291, subHeaderY: 470 },
};
export const SRV2_ZONES = {
  INFRA:   { x: 760,  y: 115, w: 310, h: 325, trunkX: 934,  subHeaderY: 135 },
  MEDIA:   { x: 1080, y: 115, w: 310, h: 325, trunkX: 1196, subHeaderY: 135 },
  TOOLS:   { x: 760,  y: 455, w: 630, h: 85,  trunkX: 1109, subHeaderY: 470 },
};

// Lecture bottle positions (y fixed per bottle; x centered at COUPLING.cx)
export const LECTURE_BOTTLES = {
  J: { gas: 'NO2', drive: 'J', y: 120, srv1Stopcock: 204, srv2Stopcock: 1283 },
  Q: { gas: 'I2',  drive: 'Q', y: 220, srv1Stopcock: 466, srv2Stopcock: 1021 },
  T: { gas: 'Cl2', drive: 'T', y: 320, srv1Stopcock: 553, srv2Stopcock: 847  },
};

// Manometer position (centered at COUPLING.cx, v6 dimensions 80w x 75h)
export const MANOMETER = {
  cx: 700,
  legLeftX: 672,
  legRightX: 728,
  topY: 460,
  bottomY: 535,
};
```

- [ ] **Step 2: Verify file parses**

```bash
cd /home/tener/projects/Homepage-claude && node -e "import('./src/dashboards/schlenk/castLayout.js').then(m => console.log('exports:', Object.keys(m).length))"
```

Expected: `exports: 13` (or more, count of named exports).

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/castLayout.js
git commit -m "feat(schlenk-cast): add layout constants for cast-view scene"
```

---

## Task 2: Metric Mapper Functions

**Files:**
- Create: `src/dashboards/schlenk/metricMappers.js`

- [ ] **Step 1: Create mappers file**

```javascript
// src/dashboards/schlenk/metricMappers.js
// Pure functions mapping metric values to visual animation parameters.
// Each function is side-effect-free and takes a single scalar (or tiny object) input.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** CPU% → Vac pump rotor animation duration in seconds. Higher CPU = faster spin. */
export function cpuToRotorDur(cpuPct) {
  const pct = clamp(cpuPct ?? 0, 0, 100);
  return Math.max(0.3, 3 * (1 - pct / 100));
}

/** RAM% → Pirani needle angle in degrees (-90=empty..+90=full). */
export function ramToNeedleAngle(ramPct) {
  const pct = clamp(ramPct ?? 0, 0, 100);
  return -90 + (pct / 100) * 180;
}

/** Drive fill% → liquid height in px for a tank of given total height. */
export function drivePctToLiquidHeight(fillPct, tankHeight) {
  const pct = clamp(fillPct ?? 0, 0, 100);
  return Math.round(tankHeight * (pct / 100));
}

/** Download Mbps → Ar line dash-offset animation duration in seconds. */
export function downloadToArDur(mbps) {
  const m = Math.max(1, mbps ?? 1);
  return Math.max(0.2, 3 / m * 1000 / 1000);  // 3000ms / mbps, capped at 0.2s
}
// Simpler: dur = max(0.2, 3000 / downloadMbps) but downloadMbps is in Mbps units
// so: dur seconds = max(0.2, 3 / mbps). For 940 Mbps: 3/940 = 0.003s too fast; floored at 0.2s.
// For 10 Mbps: 3/10 = 0.3s. Reasonable.

/** Upload Mbps → Vac line dash-offset animation duration in seconds. */
export function uploadToVacDur(mbps) {
  const m = Math.max(1, mbps ?? 1);
  return Math.max(0.3, 2.5 / m);
}

/** Total net Mbps → Cold trap bubble rise animation duration in seconds. */
export function netToBubbleDur(netMbps) {
  const m = Math.max(1, netMbps ?? 1);
  return Math.max(0.4, 1.2 / (m / 100));  // bubbles faster for higher throughput
}

/** Speedtest ping ms → number of visible frost tick marks in cold trap (capped 0..5). */
export function pingToFrostCount(pingMs) {
  const ms = Math.max(0, pingMs ?? 0);
  return Math.min(5, Math.floor(ms / 5));
}

/** Load differential between two servers (CPU+RAM blend). Returns torr delta. */
export function loadDifferential({ cpu1 = 0, ram1 = 0, cpu2 = 0, ram2 = 0 }) {
  return (cpu1 + ram1) / 2 - (cpu2 + ram2) / 2;
}

/** Differential torr → Hg column vertical offset in px (clamped to ±20). */
export function differentialToMercuryOffset(deltaTorr) {
  return clamp((deltaTorr ?? 0) * 2, -20, 20);
}
```

- [ ] **Step 2: Verify sample outputs**

```bash
cd /home/tener/projects/Homepage-claude && node -e "
import('./src/dashboards/schlenk/metricMappers.js').then(m => {
  console.log('cpuToRotorDur(38) =', m.cpuToRotorDur(38));  // ~1.86
  console.log('ramToNeedleAngle(54) =', m.ramToNeedleAngle(54));  // ~7.2
  console.log('loadDifferential({cpu1:38,ram1:54,cpu2:22,ram2:41}) =', m.loadDifferential({cpu1:38,ram1:54,cpu2:22,ram2:41}));  // 14.5
  console.log('differentialToMercuryOffset(14.5) =', m.differentialToMercuryOffset(14.5));  // 20 (clamped from 29)
});
"
```

Expected: `cpuToRotorDur(38) = 1.86`, `ramToNeedleAngle(54) = 7.2`, `loadDifferential = 14.5`, `mercuryOffset = 20`.

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/metricMappers.js
git commit -m "feat(schlenk-cast): add pure metric mapper functions"
```

---

## Task 3: CTank Component

**Files:**
- Create: `src/dashboards/schlenk/apparatus/CTank.jsx`

- [ ] **Step 1: Create component**

```jsx
// src/dashboards/schlenk/apparatus/CTank.jsx
// Drive tank shown as a small Ar cylinder with liquid-level fill.
// Props: x (center X), y (top Y), fillPct, label, subLabel, color, gradientId
import React from 'react';
import { drivePctToLiquidHeight } from '../metricMappers.js';

const TANK_W = 30;
const TANK_H = 45;

export default function CTank({ x, y, fillPct = 0, label = '', subLabel = '', color = '#4FB8D4', gradientId = 'liqCyanCast' }) {
  const liquidH = drivePctToLiquidHeight(fillPct, TANK_H - 1);
  const liquidY = (y + 1) + (TANK_H - 1 - liquidH);
  return (
    <g>
      <rect x={x - TANK_W / 2} y={y} width={TANK_W} height={TANK_H} rx="2"
            fill={`${color}1A`} stroke={color} strokeWidth="1.2" />
      <rect x={x - TANK_W / 2 + 1} y={liquidY} width={TANK_W - 2} height={liquidH}
            fill={`url(#${gradientId})`} />
      <circle cx={x} cy={y - 3} r="3" fill={color} />
      <text x={x} y={y + TANK_H + 9} fontFamily="monospace" fontSize="6"
            fill={color} textAnchor="middle">{label}</text>
      {subLabel && (
        <text x={x} y={y + TANK_H + 16} fontFamily="monospace" fontSize="5"
              fill={color} opacity="0.7" textAnchor="middle">{subLabel}</text>
      )}
    </g>
  );
}
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -4
```

Expected: `✓ built in Ns` (no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/apparatus/CTank.jsx
git commit -m "feat(schlenk-cast): add CTank apparatus component"
```

---

## Task 4: PiraniGauge Component

**Files:**
- Create: `src/dashboards/schlenk/apparatus/PiraniGauge.jsx`

- [ ] **Step 1: Create component**

```jsx
// src/dashboards/schlenk/apparatus/PiraniGauge.jsx
// RAM gauge as a circular Pirani-style vacuum gauge with rotating needle.
// Props: x, y (center), ramPct, label
import React from 'react';
import { ramToNeedleAngle } from '../metricMappers.js';

const GAUGE_R = 17;

export default function PiraniGauge({ x, y, ramPct = 0, label = 'RAM' }) {
  const angle = ramToNeedleAngle(ramPct);
  const rad = (angle - 90) * Math.PI / 180;
  const needleEndX = x + Math.cos(rad) * (GAUGE_R - 3);
  const needleEndY = y + Math.sin(rad) * (GAUGE_R - 3);
  return (
    <g>
      <circle cx={x} cy={y} r={GAUGE_R} fill="rgba(255,220,80,0.09)"
              stroke="#FFDC50" strokeWidth="1.3" />
      <circle cx={x} cy={y} r={GAUGE_R - 5} fill="none"
              stroke="rgba(255,220,80,0.35)" strokeWidth="0.4" strokeDasharray="1.5 1.5" />
      <line x1={x} y1={y} x2={needleEndX} y2={needleEndY}
            stroke="#FFDC50" strokeWidth="1.6" />
      <circle cx={x} cy={y} r="1.4" fill="#FFDC50" />
      <text x={x} y={y + GAUGE_R + 10} fontFamily="monospace" fontSize="6"
            fill="#FFDC50" textAnchor="middle">{label} {Math.round(ramPct)}%</text>
    </g>
  );
}
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -4
```

Expected: `✓ built in Ns`.

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/apparatus/PiraniGauge.jsx
git commit -m "feat(schlenk-cast): add PiraniGauge apparatus component"
```

---

## Task 5: VacPump Component

**Files:**
- Create: `src/dashboards/schlenk/apparatus/VacPump.jsx`

- [ ] **Step 1: Create component**

```jsx
// src/dashboards/schlenk/apparatus/VacPump.jsx
// CPU as vacuum pump with rotating rotor. Rotor duration scales inversely with CPU%.
// Props: x (center), y (top of pump), cpuPct
import React from 'react';
import { cpuToRotorDur } from '../metricMappers.js';

const PUMP_W = 40;
const PUMP_H = 42;

export default function VacPump({ x, y, cpuPct = 0 }) {
  const rotorDur = cpuToRotorDur(cpuPct);
  const cx = x;
  const cy = y + PUMP_H / 2;
  return (
    <g>
      <rect x={x - PUMP_W / 2} y={y} width={PUMP_W} height={PUMP_H} rx="2"
            fill="rgba(255,140,60,0.12)" stroke="#FF8C3C" strokeWidth="1.3" />
      <circle cx={cx} cy={cy} r="12" fill="none" stroke="#FF8C3C" strokeWidth="1.2" />
      <g transform={`translate(${cx},${cy})`}>
        <line x1="0" y1="-9" x2="0" y2="9" stroke="#FF8C3C" strokeWidth="1.7" />
        <line x1="-9" y1="0" x2="9" y2="0" stroke="#FF8C3C" strokeWidth="1.7" />
        <animateTransform attributeName="transform" type="rotate"
                          from="0" to="360" dur={`${rotorDur}s`} repeatCount="indefinite" />
      </g>
      <text x={x} y={y + PUMP_H + 10} fontFamily="monospace" fontSize="6"
            fill="#FF8C3C" textAnchor="middle">CPU {Math.round(cpuPct)}%</text>
    </g>
  );
}
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -4
```

Expected: `✓ built in Ns`.

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/apparatus/VacPump.jsx
git commit -m "feat(schlenk-cast): add VacPump apparatus component"
```

---

## Task 6: ColdTrap Component

**Files:**
- Create: `src/dashboards/schlenk/apparatus/ColdTrap.jsx`

- [ ] **Step 1: Create component**

```jsx
// src/dashboards/schlenk/apparatus/ColdTrap.jsx
// Cold trap with condensate pool (frost ticks = latency) and rising bubbles (throughput).
// Props: x (center), y (top), pingMs, downloadMbps, uploadMbps
import React from 'react';
import { netToBubbleDur, pingToFrostCount } from '../metricMappers.js';

const TRAP_W = 40;
const TRAP_H = 52;

export default function ColdTrap({ x, y, pingMs = 0, downloadMbps = 0, uploadMbps = 0 }) {
  const frostCount = pingToFrostCount(pingMs);
  const netMbps = (downloadMbps ?? 0) + (uploadMbps ?? 0);
  const bubbleDur = netToBubbleDur(netMbps);
  const leftX = x - TRAP_W / 2;
  // 3 bubbles at staggered starts
  const bubbles = [
    { cx: leftX + 13, r: 1.6, begin: 0 },
    { cx: leftX + 20, r: 1.3, begin: bubbleDur / 3 },
    { cx: leftX + 27, r: 1.5, begin: (2 * bubbleDur) / 3 },
  ];
  const frostTicks = [];
  for (let i = 0; i < frostCount; i++) {
    const ty = y + 36 + i * 3;
    const tx1 = leftX + 8 + (i * 2) % 20;
    frostTicks.push(
      <line key={i} x1={tx1} y1={ty} x2={tx1 + 4} y2={ty}
            stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
    );
  }
  return (
    <g>
      <rect x={leftX} y={y} width={TRAP_W} height={TRAP_H} rx="2"
            fill="rgba(120,180,255,0.1)" stroke="#78B4FF" strokeWidth="1.3" />
      <rect x={leftX + 5} y={y + 30} width={TRAP_W - 10} height={TRAP_H - 34}
            fill="rgba(255,255,255,0.28)" />
      {frostTicks}
      {bubbles.map((b, i) => (
        <g key={i}>
          <circle cx={b.cx} cy={y + 46} r={b.r} fill="#78B4FF">
            <animate attributeName="cy" from={y + 49} to={y + 8}
                     dur={`${bubbleDur}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="1" to="0"
                     dur={`${bubbleDur}s`} begin={`${b.begin}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      <text x={x} y={y + TRAP_H + 10} fontFamily="monospace" fontSize="5.5"
            fill="#78B4FF" textAnchor="middle">
        {Math.round(pingMs)}ms ↓{Math.round(downloadMbps)}/↑{Math.round(uploadMbps)}
      </text>
    </g>
  );
}
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -4
```

Expected: `✓ built in Ns`.

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/apparatus/ColdTrap.jsx
git commit -m "feat(schlenk-cast): add ColdTrap apparatus component"
```

---

## Task 7: LectureBottle Component

**Files:**
- Create: `src/dashboards/schlenk/apparatus/LectureBottle.jsx`

- [ ] **Step 1: Create component**

```jsx
// src/dashboards/schlenk/apparatus/LectureBottle.jsx
// Lecture bottle (compressed-gas cylinder) with colored gas gradient + Y-split cross-feeds.
// Each bottle feeds BOTH manifolds via animated dashed tubes.
// Props: x (center of bottle column), y (top of bottle body),
//        gas: 'NO2'|'I2'|'Cl2', drive, fillPct,
//        gbLabel, srv1TargetX, srv2TargetX, arLineY
import React from 'react';

const BOTTLE_W = 22;
const BOTTLE_H = 72;

const GAS_META = {
  NO2: { gradientId: 'gNO2Cast', stroke: '#B4593A', valveFill: '#8C3010', knobFill: '#D86030', label: 'NO₂', textFill: 'rgba(255,230,200,0.9)', subFill: 'rgba(255,230,200,0.75)' },
  I2:  { gradientId: 'gI2Cast',  stroke: '#7020A0', valveFill: '#401880', knobFill: '#9040C8', label: 'I₂',  textFill: 'rgba(230,210,245,0.9)', subFill: 'rgba(230,210,245,0.75)' },
  Cl2: { gradientId: 'gCl2Cast', stroke: '#80A028', valveFill: '#607820', knobFill: '#D0E880', label: 'Cl₂', textFill: 'rgba(240,245,200,0.9)', subFill: 'rgba(240,245,200,0.75)' },
};

export default function LectureBottle({
  x, y, gas, drive, fillPct = 0, gbLabel = '',
  srv1TargetX, srv2TargetX, arLineY,
}) {
  const meta = GAS_META[gas] || GAS_META.NO2;
  const bx = x - BOTTLE_W / 2;
  // Horizontal run y-level for cross-feeds: arLineY
  const runY = arLineY;
  // Local bottle-side exit points (where cross-feeds leave the bottle)
  const leftExitX = bx - 2;
  const rightExitX = bx + BOTTLE_W + 2;
  const sideExitY = y + 20;  // mid-bottle side
  // Path: out → horizontal short step → vertical up to runY → horizontal to target X → down to runY (target point on Ar line)
  const leftPath = `M ${bx} ${sideExitY} L ${leftExitX} ${sideExitY} L ${leftExitX} ${runY} L ${srv1TargetX} ${runY}`;
  const rightPath = `M ${bx + BOTTLE_W} ${sideExitY} L ${rightExitX} ${sideExitY} L ${rightExitX} ${runY} L ${srv2TargetX} ${runY}`;
  return (
    <g>
      {/* Cross-feed tubes (green Ar color, outward flow) */}
      <path d={leftPath} fill="none" stroke="#8CF0B4" strokeWidth="1.3"
            strokeDasharray="6 4" opacity="0.85">
        <animate attributeName="stroke-dashoffset" from="0" to="-10"
                 dur="2.5s" repeatCount="indefinite" />
      </path>
      <path d={rightPath} fill="none" stroke="#8CF0B4" strokeWidth="1.3"
            strokeDasharray="6 4" opacity="0.85">
        <animate attributeName="stroke-dashoffset" from="0" to="-10"
                 dur="2.5s" repeatCount="indefinite" />
      </path>
      {/* Bottle body */}
      <rect x={bx} y={y + 6} width={BOTTLE_W} height={BOTTLE_H} rx="10"
            fill={`url(#${meta.gradientId})`} stroke={meta.stroke} strokeWidth="1" />
      {/* Valve cap */}
      <rect x={bx + 7} y={y - 4} width="8" height="8" rx="1"
            fill={meta.valveFill} stroke={meta.stroke} strokeWidth="1" />
      <circle cx={bx + 11} cy={y} r="1.5" fill={meta.knobFill} />
      {/* Labels */}
      <text x={x} y={y + 50} fontFamily="monospace" fontSize="7"
            fill={meta.textFill} textAnchor="middle" fontWeight="bold">{drive}</text>
      <text x={x} y={y + 62} fontFamily="monospace" fontSize="5.5"
            fill={meta.subFill} textAnchor="middle">{meta.label}</text>
      <text x={x} y={y + 92} fontFamily="monospace" fontSize="6"
            fill={meta.knobFill} textAnchor="middle">{Math.round(fillPct)}% · {gbLabel}</text>
    </g>
  );
}
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -4
```

Expected: `✓ built in Ns`.

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/apparatus/LectureBottle.jsx
git commit -m "feat(schlenk-cast): add LectureBottle apparatus component"
```

---

## Task 8: UTubeManometer Component

**Files:**
- Create: `src/dashboards/schlenk/apparatus/UTubeManometer.jsx`

- [ ] **Step 1: Create component**

```jsx
// src/dashboards/schlenk/apparatus/UTubeManometer.jsx
// U-tube manometer showing SRV-1 vs SRV-2 load differential via Hg column offset.
// Props: cx (center x), topY, bottomY, legLeftX, legRightX,
//        deltaTorr, srv1VacEndX, srv2VacStartX, vacLineY
import React from 'react';
import { differentialToMercuryOffset } from '../metricMappers.js';

export default function UTubeManometer({
  cx, topY, bottomY, legLeftX, legRightX,
  deltaTorr = 0,
  srv1VacEndX, srv2VacStartX, vacLineY,
}) {
  const offset = differentialToMercuryOffset(deltaTorr);
  // At rest (delta=0) Hg surface at midY; positive delta pushes LEFT column DOWN, RIGHT column UP
  const midY = (topY + bottomY) / 2 + 10;
  const leftHgTop = midY + offset;  // delta>0 → left pushed down
  const rightHgTop = midY - offset; // delta>0 → right pushed up

  const curveRadius = 18;
  const curveTop = bottomY - curveRadius;

  // Glass tube outline
  const glassPath = `M ${legLeftX} ${topY} L ${legLeftX} ${curveTop}
                     Q ${legLeftX} ${bottomY} ${(legLeftX + legRightX) / 2 - 5} ${bottomY}
                     L ${(legLeftX + legRightX) / 2 + 5} ${bottomY}
                     Q ${legRightX} ${bottomY} ${legRightX} ${curveTop}
                     L ${legRightX} ${topY}`;

  // Hg fill — from leftHgTop down the left leg, around the curve, up to rightHgTop
  const innerLeftOffset = 4;
  const innerRightOffset = -4;
  const hgPath = `M ${legLeftX} ${leftHgTop}
                  L ${legLeftX} ${curveTop}
                  Q ${legLeftX} ${bottomY} ${(legLeftX + legRightX) / 2 - 5} ${bottomY}
                  L ${(legLeftX + legRightX) / 2 + 5} ${bottomY}
                  Q ${legRightX} ${bottomY} ${legRightX} ${curveTop}
                  L ${legRightX} ${rightHgTop}
                  L ${legRightX + innerRightOffset} ${rightHgTop}
                  L ${legRightX + innerRightOffset} ${curveTop}
                  Q ${legRightX + innerRightOffset} ${bottomY - 4} ${(legLeftX + legRightX) / 2 + 5} ${bottomY - 4}
                  L ${(legLeftX + legRightX) / 2 - 5} ${bottomY - 4}
                  Q ${legLeftX + innerLeftOffset} ${bottomY - 4} ${legLeftX + innerLeftOffset} ${curveTop}
                  L ${legLeftX + innerLeftOffset} ${leftHgTop}
                  Z`;

  return (
    <g>
      {/* Taps from Vac lines */}
      <path d={`M ${legLeftX} ${topY} L ${legLeftX} ${vacLineY} L ${srv1VacEndX} ${vacLineY}`}
            fill="none" stroke="rgba(192,212,219,0.4)" strokeWidth="1.2" strokeDasharray="2 3" />
      <path d={`M ${legRightX} ${topY} L ${legRightX} ${vacLineY} L ${srv2VacStartX} ${vacLineY}`}
            fill="none" stroke="rgba(192,212,219,0.4)" strokeWidth="1.2" strokeDasharray="2 3" />
      {/* Glass outline */}
      <path d={glassPath} fill="none" stroke="rgba(192,212,219,0.6)" strokeWidth="2" strokeLinejoin="round" />
      {/* Hg fill */}
      <path d={hgPath} fill="url(#mercCast)" stroke="none" />
      {/* Hg surface shimmer */}
      <ellipse cx={legLeftX + 2} cy={leftHgTop} rx="3.5" ry="1" fill="rgba(255,255,255,0.55)" />
      <ellipse cx={legRightX - 2} cy={rightHgTop} rx="3.5" ry="1" fill="rgba(255,255,255,0.55)" />
      {/* Tick marks between legs */}
      <g opacity="0.5">
        {[-15, 0, +15].map(dy => (
          <line key={dy} x1={legLeftX + 5} y1={midY + dy} x2={legRightX - 5} y2={midY + dy}
                stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" strokeDasharray="1 2" />
        ))}
      </g>
      {/* Labels */}
      <text x={cx} y={topY - 5} fontFamily="monospace" fontSize="6"
            fill="rgba(255,255,255,0.65)" textAnchor="middle" letterSpacing="0.15em">MANOMETER</text>
      <text x={cx} y={bottomY + 13} fontFamily="monospace" fontSize="7"
            fill="#FFDC50" textAnchor="middle">ΔP {deltaTorr >= 0 ? '+' : ''}{deltaTorr.toFixed(1)} torr</text>
    </g>
  );
}
```

- [ ] **Step 2: Verify syntax**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -4
```

Expected: `✓ built in Ns`.

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/apparatus/UTubeManometer.jsx
git commit -m "feat(schlenk-cast): add UTubeManometer apparatus component"
```

---

## Task 9: SchlenkCastScene — Top-Level Scene Composition

**Files:**
- Create: `src/dashboards/schlenk/SchlenkCastScene.jsx`

This is the large composition task. It imports all apparatus, applies layout constants, renders manifolds, stopcocks, zones, bottles, manometer.

- [ ] **Step 1: Create SchlenkCastScene.jsx**

```jsx
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
```

- [ ] **Step 2: Verify build**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -6
```

Expected: `✓ built in Ns`. No module-not-found or syntax errors.

- [ ] **Step 3: Commit**

```bash
git add src/dashboards/schlenk/SchlenkCastScene.jsx
git commit -m "feat(schlenk-cast): compose SchlenkCastScene from apparatus + layout"
```

---

## Task 10: Register Cast Scene in modeRegistry

**Files:**
- Modify: `src/modeRegistry.js`

- [ ] **Step 1: Read current SCHLENK row in modeRegistry**

```bash
cd /home/tener/projects/Homepage-claude && grep -n "SCHLENK:\|SchlenkBenchScene\|SchlenkDetailPanel" src/modeRegistry.js
```

Expected: lines showing SCHLENK row with `Grid: SchlenkBenchScene` and `DetailPanel: SchlenkDetailPanel`. Note the line number for Step 2.

- [ ] **Step 2: Add lazy import + CastGrid slot**

Add the import near the other SCHLENK imports:

```javascript
// In src/modeRegistry.js, near the SchlenkBenchScene lazy import:
const SchlenkCastScene = lazy(() => import('./dashboards/schlenk/SchlenkCastScene.jsx'));
```

Then in the SCHLENK registry row, add a `CastGrid` property alongside `Grid`:

```javascript
SCHLENK: {
  Grid: SchlenkBenchScene,
  CastGrid: SchlenkCastScene,  // ADD THIS LINE
  DetailPanel: SchlenkDetailPanel,
  // ... rest unchanged
},
```

- [ ] **Step 3: Verify modeRegistry parses**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -4
```

Expected: `✓ built in Ns`.

- [ ] **Step 4: Commit**

```bash
git add src/modeRegistry.js
git commit -m "feat(schlenk-cast): register SchlenkCastScene as SCHLENK.CastGrid in modeRegistry"
```

---

## Task 11: CastLayout — 3-Row SCHLENK Chrome Branching

**Files:**
- Modify: `/home/tener/projects/Homepage-claude/CastLayout.jsx`

This task updates CastLayout to: (a) prefer `reg.CastGrid` when present and cast is active, (b) use [1400, 660] as the SCHLENK cast size, (c) render a 3-row layout for SCHLENK with a horizontal badge strip at the bottom and no side columns.

- [ ] **Step 1: Update MODE_NATURAL_SIZE for SCHLENK cast**

In `CastLayout.jsx`, find the `MODE_NATURAL_SIZE` constant (near line 14) and update the SCHLENK entry:

```javascript
const MODE_NATURAL_SIZE = {
  CHEM:    [1336, 760],
  SCHLENK: [1400, 660],  // CHANGED from [1000, 660]
};
```

- [ ] **Step 2: Dispatch CastGrid vs Grid**

Find where the Grid is resolved (near line 130 in the component body) and update to prefer CastGrid when available:

```jsx
// Before (original):
// const reg = MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM;
// const Grid = reg.Grid;

// After:
const reg = MODE_REGISTRY[dashboardMode] ?? MODE_REGISTRY.CHEM;
const Grid = reg.CastGrid ?? reg.Grid;
```

- [ ] **Step 3: Branch layout on SCHLENK**

Find the return statement in CastLayout that renders the 3-column main area. Wrap it with a conditional that dispatches to a SCHLENK 3-row layout when `dashboardMode === 'SCHLENK'`.

Add the following near the top of the component body (after existing hooks, before the return):

```jsx
const isSchlenk = dashboardMode === 'SCHLENK';
```

Then replace the existing return with:

```jsx
return (
  <div style={{
    position: 'fixed', inset: 0, overflow: 'hidden',
    background: 'var(--bg-base, #0F1117)',
    display: 'flex', flexDirection: 'column',
  }}>
    <AnimatedBackground
      sceneConfig={sceneConfig}
      tier={animationTier}
      accent={THEMES[activeTheme]?.accent}
    />

    {/* ── TOP BAR: weather + clock (unchanged) ── */}
    <div style={{
      flexShrink: 0,
      padding: '10px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      background: 'rgba(10,12,18,0.88)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'relative', zIndex: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1, minWidth: 0 }}>
        {!online ? (
          <span style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            {online === null ? '◆ LOADING...' : '◆ PROBE OFFLINE'}
          </span>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexShrink: 0 }}>
              <span style={{
                fontFamily: MONO, fontSize: 42, fontWeight: 200,
                color: 'rgba(255,255,255,0.9)', lineHeight: 1,
              }}>
                {temp !== null ? `${Math.round(temp)}°F` : '—'}
              </span>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(255,255,255,0.58)', letterSpacing: '0.03em' }}>
                  {condition ?? '—'}
                </div>
                {weatherDetails && (
                  <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', marginTop: 2 }}>
                    {weatherDetails}
                  </div>
                )}
              </div>
            </div>
            <div style={{ width: 1, height: 44, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
            {weatherForecast.length > 0 && (
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {weatherForecast.slice(0, 5).map((d, i) => (
                  <div key={i} style={{ fontFamily: MONO, fontSize: 10, textAlign: 'center', lineHeight: 1.5 }}>
                    <div style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '0.06em', marginBottom: 1 }}>{d.day}</div>
                    <div style={{ color: 'rgba(255,255,255,0.72)' }}>
                      {d.hi !== null ? `${Math.round(d.hi)}°` : '—'}
                      <span style={{ color: 'rgba(255,255,255,0.24)' }}>/{d.lo !== null ? `${Math.round(d.lo)}°` : '—'}</span>
                    </div>
                    {d.precip !== null && (
                      <div style={{ fontSize: 8, color: 'rgba(100,180,255,0.42)' }}>{d.precip}%</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <CastClock />
    </div>

    {isSchlenk ? (
      // ── SCHLENK 3-row layout: scene fills middle, badges at bottom ──
      <>
        <div ref={tableRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: `translate(-50%, -50%) scale(${scale})`,
            width: tableW,
            height: tableH,
          }}>
            <Suspense fallback={null}>
              <Grid
                statsMap={statsMap}
                onElementClick={() => {}}
                elementRegistry={SERVICE_REGISTRY}
                allElements={ALL_ELEMENTS}
              />
            </Suspense>
          </div>
        </div>
        <div style={{
          flexShrink: 0,
          padding: '8px 24px',
          background: 'rgba(10,12,18,0.92)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20,
        }}>
          <SecurityBadgeRow />
        </div>
      </>
    ) : (
      // ── Default 3-column layout: badges | scene | legend ──
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: 158,
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 10px',
          display: 'flex', alignItems: 'center',
          position: 'relative', zIndex: 10,
          overflow: 'hidden',
        }}>
          <SecurityBadgeRow vertical />
        </div>
        <div ref={tableRef} style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10,
        }}>
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: `translate(-50%, -50%) scale(${scale})`,
            width: tableW,
            height: tableH,
          }}>
            <Suspense fallback={null}>
              <Grid
                statsMap={statsMap}
                onElementClick={() => {}}
                elementRegistry={SERVICE_REGISTRY}
                allElements={ALL_ELEMENTS}
              />
            </Suspense>
          </div>
        </div>
        <div style={{
          width: 130,
          flexShrink: 0,
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 14px',
          display: 'flex', alignItems: 'center',
          position: 'relative', zIndex: 10,
          overflow: 'hidden',
        }}>
          <CastLegend dashboardMode={dashboardMode} />
        </div>
      </div>
    )}
  </div>
);
```

Note: the top-bar block is identical to the existing code. Only the body-below-topbar is conditional. When editing, preserve the original CastClock component definition and CastLegend component definition at the top of the file — they're unchanged.

- [ ] **Step 4: Build + verify no errors**

```bash
cd /home/tener/projects/Homepage-claude && npm run build 2>&1 | tail -6
```

Expected: `✓ built in Ns`. Bundle includes `SchlenkCastScene-*.js` chunk.

- [ ] **Step 5: Commit**

```bash
git add CastLayout.jsx
git commit -m "feat(schlenk-cast): branch CastLayout to 3-row chrome for SCHLENK mode"
```

---

## Task 12: Deploy + Visual Smoke Test

**Files:** (no edits — deploy + verification only)

- [ ] **Step 1: Rebuild homepage container**

```bash
cd /home/tener && docker compose up -d --build homepage 2>&1 | tail -6
```

Expected: `Container homepage Started` with no build errors.

- [ ] **Step 2: Verify bundle contains new files**

```bash
cd /home/tener/projects/Homepage-claude && ls dist/assets/ | grep -Ei 'schlenkcast|cast' | head -5
```

Expected: at least one `SchlenkCastScene-*.js` chunk file listed.

- [ ] **Step 3: Open cast URL in browser**

Navigate (in a Windows browser on the LAN) to: `http://10.0.0.195:3000/?cast=1&mode=SCHLENK`

Verify:
- Top bar shows weather (temp, condition, 5-day forecast) + live clock on the right.
- Full-width scene renders below top bar, showing:
  - SRV-1 manifold on the left with Ar (top, cyan solid animated) + Vac (bottom, cyan dashed animated).
  - 4 apparatus items above SRV-1 manifold: C tank, Pirani gauge (needle visible), Cold trap (bubbles rising), Vac pump (rotor spinning).
  - SRV-2 manifold on the right, mirrored.
  - 6 stopcocks per manifold evenly spaced (3 zone stopcocks with Ar+Vac circles, 3 bottle stopcocks with green single circles).
  - 3 lecture bottles (brown J/NO₂, purple Q/I₂, green T/Cl₂) vertically stacked centered at x=700.
  - Green dashed cross-feed tubes from each bottle snaking to their SRV-1 and SRV-2 stopcocks.
  - U-tube manometer at bottom-center with Hg column tilted based on load differential.
  - 6 zone rectangles (3 per server) with trunks dropping from stopcocks + sub-headers.
- Bottom strip shows 4 security badges (PORTS, UFW, KEYS, IMAGES) horizontally centered.
- No right-side legend column.
- No visible CastLegend or vertical SecurityBadgeRow.

- [ ] **Step 4: Verify default mode = SCHLENK**

Navigate to `http://10.0.0.195:3000/?cast=1` (no mode param).

Expected: same SCHLENK view as step 3.

- [ ] **Step 5: Verify CHEM cast still works (regression check)**

Navigate to `http://10.0.0.195:3000/?cast=1&mode=CHEM`.

Expected: old 3-column layout with vertical badges on left, periodic table in center, legend on right. Weather bar unchanged.

- [ ] **Step 6: Commit deployment verification note**

```bash
cd /home/tener/projects/Homepage-claude
echo "$(date -Iseconds) SCHLENK cast v9 deployed, visual verified" >> docs/superpowers/specs/verify-log.txt
git add docs/superpowers/specs/verify-log.txt
git commit -m "chore(schlenk-cast): log visual verification"
```

---

## Plan Self-Review

Performed after plan completion:

### Spec coverage check
- Section 2.1 (URL + HA activation): already implemented pre-plan. Not a task.
- Section 2.2 (CastLayout branching): Task 11.
- Section 2.3 (viewBox 1400x660 + MODE_NATURAL_SIZE update): Task 11 Step 1.
- Section 3.1 (manifold strip): Task 9 (SchlenkCastScene manifold lines).
- Section 3.2 (apparatus above manifold): Tasks 3-6 (individual components) + Task 9 (composition + taps).
- Section 3.3 (6 evenly-spaced stopcocks): Task 1 (constants) + Task 9 (rendering loop).
- Section 3.4 (lecture bottles + manometer centered at x=700): Task 7, Task 8, Task 9 (composition).
- Section 3.5 (zones with straight trunks): Task 1 (zone bounds) + Task 9 (zone rendering).
- Section 4 (metric-to-visual mapping): Task 2 (metric mappers) + individual apparatus components (Tasks 3-8).
- Section 5 (implementation components): All tasks.
- Section 6 (animation specs): Tasks 3-8 embed `<animate>` and `<animateTransform>` inline.
- Section 7 (chrome implementation): Task 11.
- Section 8 (testing): Task 12 (visual smoke test).
- Section 9 (out of scope): No tasks — correctly excluded.
- Section 10 (architecture decisions): Embodied in task ordering + file structure.
- Section 11 (implementation sequence): This plan follows it.

### Placeholder scan
No `TBD`, `TODO`, or incomplete code blocks in any task. Every step includes: (a) exact file paths, (b) complete code, (c) exact commands, (d) expected output.

### Type consistency
- `statsMap` shape consistent across tasks: `statsMap.srv1.cpu`, `statsMap.srv1.ram`, etc.
- `CAST_W`, `CAST_H` consistently imported from `castLayout.js`.
- `AR_Y`, `VAC_Y` referenced consistently as 70 and 85 respectively.
- Apparatus props consistent with their use sites in SchlenkCastScene.
- Mapper function names unchanged throughout.
