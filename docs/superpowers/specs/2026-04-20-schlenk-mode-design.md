# SCHLENK Dashboard Mode — Full-Scene Design Spec (B2)

**Date:** 2026-04-20
**Replaces:** the 2026-04-20 spec of the same path that scoped a "Phase 1 registry-conformant" build (too narrow)
**Scope:** Full Layout A-flexed custom SVG bench schematic per the 10 approved brainstorm mockups at `.superpowers/brainstorm/3924821-1776716561/content/`
**Estimate:** 20-40h across 5-6 sessions. No single-session delivery.

---

## 0 · Why this spec replaces the prior one

The 2026-04-20 Phase-1 spec misread the brainstorm. Only 2 of 10 mockups were reflected: `zone-layouts.html` (Layout B — which was an alternative, not the approved choice) and the System Metrics hybrid. The other 8 mockups — especially `zone-layout-a-flexed.html`, `glassware-zoo.html`, `clip-shapes.html`, `per-element-preview.html`, `category-compounds.html`, `tier-animations.html`, `detail-panel-mockup.html` — collectively describe a bespoke rendering pipeline, not a card-tint variant of CHEM.

The prior Phase-1 work (elementGases, 3 metrics diagrams, theme scaffold, modeRegistry registration, ModeToggle entry, zoneConfigs wiring) is kept as **foundation** — the architectural plumbing is still correct. The visual layer is rewritten.

---

## 1 · Target Experience

SCHLENK is not "CHEM with different colors." It is a **full-screen SVG bench schematic** where every service appears as a specific piece of glassware, connected by glass tubing that descends from a double-tube manifold at the top. Zone backgrounds are dashed rectangles. Cards are not rectangular cells — they are hand-crafted glassware silhouettes with per-service identity.

Reference: `zone-layout-a-flexed.html` — the single mockup that shows the whole scene at 1000×660.

---

## 2 · Design Decision Inventory

### 2.1 Palette — A/B/C roles (locked, matches mockups)

Three palette families, each with a specific UI role. Not a single palette — a layered system.

| Palette | Role | Core hexes |
|---------|------|-----------|
| **A — Borosilicate** (`palette.html` option A) | Glassware chrome, card borders, DOWN/offline overlay, dot-grid | `#4FB8D4` · `#7A9BAE` · `#3A5968` · `#C0D4DB` · `#08101A` bg |
| **B — Vacuum Oil** (option B) | Peripheral equipment, STALE status pulse, ground-glass joint grease, heating-mantle glow | `#D4A04F` · `#8B6B2F` · `#6B4A20` · `#E8B870` · `#15100A` bg |
| **C — Gas-Coded** (option C) | Manifold accents: Ar violet, N₂ green, H₂O coolant cyan, vacuum pulled-black; event flashes | `#B47FE8` Ar · `#5FD4A8` N₂ · `#E8789A` H₂ · `#4FB8D4` coolant |

### 2.2 Category palette — real compound colors (replaces my prior gas-coded categories)

From `category-compounds.html`:

| Category | Compound reference | Color |
|----------|-------------------|-------|
| ALKALI | Li flame test (crimson) | `#D14545` |
| ALKALINE | BaCl₂ flame (pale green) | `#A8D160` |
| TRANSITION | CuSO₄·5H₂O (azure) | `#3B97D4` |
| HALOGEN | I₂ vapor (iodine violet) | `#7A3AA0` |
| NOBLE | Ar plasma (argon lilac) | `#B08BE8` |
| LANTHANIDE | NdCl₃·6H₂O (Nd rose) | `#C073A8` |
| POST | PbS galena | `#3D434D` |
| METALLOID | Si wafer (silicon grey) | `#6E7985` |
| NONMETAL | Prussian blue Fe₄[Fe(CN)₆]₃ | `#1D4E8E` |
| ACTINIDE | Uranyl UO₂²⁺ fluorescence | `#C8DB3C` |
| PNICTOGEN | Red phosphorus (oxblood) | `#A83725` |
| CHALCOGEN | S₈ rhombic (sulfur yellow) | `#E0C432` |

### 2.3 Per-element overrides — Aldrich Park palette (`per-element-preview.html`)

Each element gets a compound-specific color via one of 6 rules:

- **s-block** → flame-test color (Li crimson, Na D-line yellow, K violet, Rb red-violet, Cs blue-violet, Fr deep red extrapolated)
- **p-block** → molecular/elemental color (F₂ pale gas yellow-green, Cl₂ yellow-green, Br₂ red-brown, I₂ violet, S₈ sulfur yellow, P red phosphorus, etc.)
- **d-block first row** → most common aqueous ion or iconic compound (Sc³⁺ pale, TiO₂ white, V²⁺ violet, Cr³⁺ green, MnO₄⁻ permanganate purple, Fe(SCN) blood red, Co²⁺ pink, Ni²⁺ green, CuSO₄ azure, Zn metal grey)
- **lanthanides** → hydrated Ln³⁺ ion + phosphor emission, with Aldrich Park user overrides (Ce=emerald #1EA580, Pr=chartreuse #C4E030, Gd=deep red #C03820, Sm=I₂ violet #6A2A90, Yb/Lu=pale Sm yellow)
- **actinides** → oxidation-state-dependent color (U=uranyl yellow-green anchors the row #C8DB3C, Np=olive, Pu=purple, Am=red, Cm=pale green, Bk/Cf fluorescent, Fm-Lr steel-grey for extrapolated)
- **noble gases** → discharge-tube emission (He pale pink, Ne red-orange, Ar lilac, Kr whitish, Xe blue-white, Rn extrapolated)
- **super-heavy / extrapolated** → neutral steel-grey (#8090A0)

**118 entries to enumerate.** Each entry has: `{ symbol, color, label, compound }`. Label and compound are shown on hover/detail-panel.

### 2.4 Glassware catalog (from `glassware-zoo.html`) — 22 shapes in 5 groups

Each shape is a self-contained SVG path, rendered by a single `<GlasswareClip shape="...">` component. Data-driven from a registry.

**Group 1 — Reaction Vessels (main service cards):**
1. `rbf-1neck` — Round-Bottom Flask, single neck (generic default)
2. `rbf-2neck` — Round-Bottom Flask, 2 necks (*arr apps, flask-backend)
3. `rbf-3neck` — Round-Bottom Flask, 3 necks (Plex, Jellyfin hero)
4. `schlenk-sidearm` — Schlenk flask w/ sidearm stopcock (gluetun, qBittorrent)
5. `fischer-porter` — Pressure-rated sealed tube (Docker/socket-proxy)
6. `pear-flask` — Pear-shaped (rotovap, lightweight services)
7. `j-young` — PTFE-valved NMR tube (air-sensitive sealed services)
8. `rotovap-bump` — Pear with bump trap (batch/scheduled jobs)
9. `kjeldahl` — Long-neck digestion (long-running jobs like kometa)

**Group 2 — Condensers (monitoring/observability):**
10. `dimroth` — Coiled reflux condenser (Grafana, Prometheus)
11. `liebig` — Straight-tube condenser (cadvisor, glances)
12. `allihn` — Bulb-train reflux (Uptime Kuma, notifiarr)
13. `cold-finger` — Dewar-chilled insert (diskhealth-bridge, restic)

**Group 3 — Distillation & Traps (pipelines/data flow):**
14. `dean-stark` — Water-separator trap (Sonarr pipeline, bazarr)
15. `soxhlet` — Continuous extractor (prowlarr)
16. `cold-trap` — LN₂-cooled U-tube (SABnzbd, gluetun)
17. `kugelrohr` — 4-bulb train (syncthing)
18. `sublimation` — Vac + cold-finger purification (kometa)

**Group 4 — Ancillary (utilities/bots):**
19. `addition-funnel` — Pressure-equalized drip (Chat/Gemini widget)
20. `separatory` — Liquid-liquid extraction (lottery, stocks)
21. `buchner-filter` — Vacuum filtration (port-updater, kavita)
22. `nmr-tube` — 5 mm analytical tube (bot row — xxs density)
23. `hg-bubbler` — Mercury J-tube (log/event sinks)

**Fallback:** unmapped service → `rbf-1neck` (generic flask).

### 2.5 Service → glassware mapping

A new registry file `src/dashboards/schlenk/glassware.js`:
```js
export const GLASSWARE_BY_SERVICE = {
  plex: 'rbf-3neck',
  overseerr: 'rbf-2neck',
  tautulli: 'rbf-2neck',
  radarr: 'rbf-2neck',
  sonarr: 'long-schlenk', // TODO confirm — spec mentions "LONG SCHLENK"
  lidarr: 'pear-flask',
  bazarr: 'rbf-sidearm',
  prowlarr: 'long-schlenk', // sealed, no sidearm
  qbittorrent: 'schlenk-sidearm',
  sabnzbd: 'cold-trap',
  gluetun: 'schlenk-sidearm',
  grafana: 'dimroth',
  prometheus: 'dimroth',
  cadvisor: 'liebig',
  glances: 'liebig',
  'uptime-kuma': 'allihn',
  notifiarr: 'allihn',
  // ... 47 total services; enumerate in Sprint 1
};
export const BOT_GLASSWARE = 'nmr-tube'; // uniform for all 20 bots
```

Need a second pass with the user to confirm per-service mappings for all 47 services + 20 bots.

### 2.6 Manifold hero strip (`glassware-zoo.html` group 5, `zone-layout-a-flexed.html` manifold)

**Double-tube horizontal bar** across the top, above the services grid. Width 100%, height ~120-140px.

- **Top tube**: Argon supply. Violet gradient `#3B97D4` fade, stroked cyan. Labeled "Ar" at left end.
- **Bottom tube**: Vacuum line. Near-black `#0A1420` with cyan stroke. Labeled "VAC" at left end.
- **6 numbered ports (P1-P6)**: vertical pipes rising from BOTH tubes through a 2-way stopcock. Stopcock handle states:
  - **Up** = Ar selected (port serving argon, service healthy/inert)
  - **Horizontal** = closed (unused / degrading)
  - **Down** = vacuum selected (port pulling vacuum / service evacuating)
- Labels below each port: `PORT 1` … `PORT 6`.
- **Pressure gauge** at far right — circular dial with swinging needle reflecting aggregate system load.

**Stopcock rotation is health-driven** (Phase 2 was wrong to defer this — it's a core identity feature): each port's handle angle derived from the aggregate health of services on that port's vertical spine.

### 2.7 Layout A-flexed — full scene (`zone-layout-a-flexed.html`)

One integrated SVG canvas at viewBox 0 0 1000 660 (scales responsively via preserveAspectRatio).

**Top:** Manifold hero strip (section 2.6), `y=0` to `y=90`.

**Below manifold:** 6 zone rectangles with dashed cyan borders tinted per palette:
- MEDIA (top-left, under P1) — cyan tint
- LIBRARY (top-center-left spine, under P2) — cyan tint
- PIPELINE (top-center, under P3) — amber (B) tint
- PIPELINE-auxiliary (under P3) — cyan
- INFRA (top-right, under P4) — green (C N₂) tint
- TOOLS (far right, under P5) — violet (C Ar) tint
- BOTS (bottom full-width rack) — pink `#C073A8` tint

**Inside zones:** services rendered as their glassware silhouettes, connected via glass tubing that:
1. Descends from the manifold port
2. Passes through a T-joint or elbow if needed
3. Splits into branches via horizontal tubing runs
4. Connects to the glassware's top ground-glass joint

**Glass tubing** is cyan stroke width 2-3, rendered as straight `<line>` or elbow `<path>` segments. Each tubing path is data-driven from the service's port + position.

**Service content**: element symbol (large, white) + service name (small, letterspaced, below) rendered as `<text>` overlays INSIDE the glassware bulb. Example: `Fe` + `RADARR`.

### 2.8 Per-card tier animations (`tier-animations.html`)

Per-card CSS animations driven by load tier. These replace the current background particle system for SCHLENK mode.

| Tier | Load | Visual signature |
|------|------|-----------------|
| T1 · COLD PUMP | 0-20 | Slow 4s opacity breath on the glassware (inert/idle) |
| T2 · STATIC BENCH | 21-45 | Single lazy bubble every 4s in an attached oil bubbler |
| T3 · ARGON FLOW | 46-70 | Rapid bubble train (3 bubbles staggered at -0.5s intervals) + dashed gas-flow animation on the feed line |
| T4 · REFLUX | 71-90 | Heating-mantle glow beneath the flask (breathing 1.2s), vapor rising into condenser (2s cycle), condensate droplets falling |
| T5 · EXOTHERM | 91-100 | Flask glows red, eruptive particle spray (0.6s cycle), localized flash, flask cracks appear (4-step reveal), smoke tendrils escape |

**Implementation note** (from mockup legend): CSS-only animations. Keep animations per-card rather than global particles. The 30-mode dashboard already runs dozens of animations — CSS keyframes are cheap.

### 2.9 Detail panel (`detail-panel-mockup.html`) — approved sections

When a user clicks a SCHLENK service card, the detail panel opens with these sections:

1. **Header** (unique): element badge (symbol + Z) + service name + "LONG SCHLENK · PORT 2 · SRV-1 · 10.0.0.195:8989" metadata + tier chip "T3 · ARGON FLOW · load 58%"
2. **Liquid-level load gauge** (unique): large flask SVG with liquid fill = load%, tick marks 25/50/75, bubbles inside, raw numbers (queue fill, episodes queued, in flight, blocked)
3. **Bubbler rate gauge** (unique): request-stream visualization as bubbler with amber liquid + yellow bubbles; shows req/sec (e.g., 2.4 Hz, peak 5.1 Hz, avg 1.8 Hz)
4. **Manifold schematic** (unique): mini manifold bar with port P2 highlighted, showing the service's port neighbors (LIDARR, BAZARR, PROWLARR)
5. **Lab journal** (shared): recent log lines styled as notebook entries (orange-amber left border)
6. **Actions** (shared): standard action buttons (restart, view logs, open URL, etc.)

### 2.10 System Metrics Panel (`system-metrics-panel-schlenk.html`) — already partially built

Hybrid layout already approved and partially implemented:

- **CoordComplex** (CPU, RAM) — retained from CHEM, with "radiant glow upgrade" (drop-shadow filter on metal center)
- **JablonskiDiagram** (Download, Upload) — retained from CHEM with radiant glow
- **ReagentBottle** — NEW (already shipped in Phase 1 foundation) for server drive fill
- **SolventReservoir** inverted — NEW (already shipped) for media drives showing FREE headroom
- **PiraniTrace** — NEW (already shipped) vacuum-gauge speedtest

Layout: 3 flex columns (SRV-1 · Storage · SRV-2), 2×2 grid per server.

Labels per SystemMetricsPanel section: `◆ SRV-1 ◆ Vacuum_Manifold`, `◆ Storage ◆ Reagent_Inventory`, `◆ SRV-2 ◆ Distillation_Column`.

Phase 1 foundation already has the 3 new diagrams and registers them in modeRegistry. Verify in Sprint 1 that the radiant-glow filter is on CoordComplex/Jablonski (may need a small update).

### 2.11 Interactions (from `zone-layout-a-flexed.html`)

- **Hover on glassware**: drop-shadow (cyan, 0 0 4px)
- **Click J-Young tube in BOTS rack**: charge animation — tube travels to a "charge port" above the rack and back. Visual signature: `filter: drop-shadow(0 0 6px #C073A8) brightness(1.3)` during transit.
- **Click glassware**: opens detail panel (section 2.9)
- **Stopcock hover tooltip**: shows port number + services on that port
- **Pressure gauge**: needle updates every N seconds based on overall load; swings from 0 (vacuum, all idle) to max (critical, everything running)

---

## 3 · Architecture

Rather than extend PeriodicTableGrid, SCHLENK gets a **dedicated custom renderer**:

```
src/dashboards/schlenk/
├── SchlenkBenchScene.jsx         — top-level scene (1000×660 SVG, replaces PeriodicTableGrid for SCHLENK)
├── SchlenkManifold.jsx            — hero strip (rewrite of current Phase 1 stub; add pressure gauge + port state logic)
├── GlasswareClip.jsx              — single component that renders any of the 22 shapes based on prop
├── glassware/                    — SVG path data per shape
│   ├── rbf1neck.js
│   ├── rbf2neck.js
│   ├── rbf3neck.js
│   ├── schlenkSidearm.js
│   ├── longSchlenk.js
│   ├── fischerPorter.js
│   ├── pearFlask.js
│   ├── jYoung.js
│   ├── rotovapBump.js
│   ├── kjeldahl.js
│   ├── dimroth.js
│   ├── liebig.js
│   ├── allihn.js
│   ├── coldFinger.js
│   ├── deanStark.js
│   ├── soxhlet.js
│   ├── coldTrap.js
│   ├── kugelrohr.js
│   ├── sublimation.js
│   ├── additionFunnel.js
│   ├── separatory.js
│   ├── buchnerFilter.js
│   ├── nmrTube.js
│   └── hgBubbler.js
├── glasswareRegistry.js          — { shapeId: { path, viewBox, jointPoints, liquidClip } }
├── serviceGlassware.js           — { serviceId: shapeId } 47+20 entries
├── elementColors.js              — { symbol: { color, label, compound } } 118 entries (replaces elementGases.js)
├── tubingEngine.js               — given (fromPort, zoneId, position), returns SVG path data
├── zoneLayout.js                 — per-zone bounds in the 1000×660 grid
├── SchlenkCard.jsx               — renders one glassware + element symbol + service name + tier animation class
├── SchlenkDetailPanel.jsx        — 6-section panel per 2.9
├── SchlenkBotRack.jsx             — BOTS row with NMR tube rack + charge-port interaction
├── tierAnimations.css            — CSS keyframes for T1-T5 per-card states
└── diagrams/                      — RETAINED from Phase 1 foundation
    ├── ReagentBottle.jsx         — (shipped)
    ├── SolventReservoir.jsx      — (shipped)
    └── PiraniTrace.jsx           — (shipped)
```

**Modified files:**
- `src/modeRegistry.js` — update SCHLENK row: `Grid: SchlenkBenchScene`, `DetailPanel: SchlenkDetailPanel`, drop cardTransform/detailTransform (SchlenkCard handles card content internally), keep diagram refs
- `src/themes/modes/schlenk.js` — replace ABC-blend cat palette with compound-color cat palette from 2.2; drop scene particles (per-card CSS replaces them)
- `src/components/DashboardModeToggle.jsx` — keep SCHLENK entry; icon stays ⌬
- `src/layout/zoneConfigs/schlenk.js` — DELETE (SchlenkBenchScene doesn't use the zone engine)
- `src/layout/zoneConfigs/index.js` — remove SCHLENK registration

**Deleted files:**
- `src/dashboards/schlenk/elementGases.js` — superseded by elementColors.js (118-entry compound map)
- `src/dashboards/schlenk/SchlenkGrid.jsx` — superseded by SchlenkBenchScene.jsx

**Retained files (Phase 1 foundation):**
- `src/dashboards/schlenk/diagrams/{ReagentBottle,SolventReservoir,PiraniTrace}.jsx` — still correct for SystemMetricsPanel hybrid

---

## 4 · Non-Goals (Explicitly Out of Scope)

- **No AI-generated compound color overrides** — the 118-entry map is the definition. User can overrule any single entry in a follow-up PR.
- **No mobile-specific layout** — the 1000×660 scene scales via SVG viewBox. Mobile gets smaller but same structure.
- **No real-time stopcock animation per service state change** — stopcock rotation is read-only state, updates on re-render (not a smooth tween).
- **No per-service tubing customization** — tubing engine generates paths deterministically from (zoneId, servicePosition, portId). No per-service tubing overrides.
- **No performance-tier degradation for SCHLENK** — if we find perf issues with 47 glassware + 20 NMR tubes + 6 tier-animations running CSS, we investigate in Sprint 6 polish.

---

## 5 · Sprint Breakdown Overview

6 sprints (see companion plan `docs/superpowers/plans/2026-04-20-schlenk-full-scene-multi-sprint.md`):

| Sprint | Duration | Deliverable |
|--------|----------|-------------|
| **S1 — Palette & Color System** | 3-4h | 118-entry elementColors.js, 12-entry category palette, schlenk.js theme rewrite, visual smoke-test of color system on a placeholder grid |
| **S2 — Glassware SVG Catalog** | 5-6h | 24 GlasswareClip shapes, glasswareRegistry.js, serviceGlassware.js mapping, standalone render test page |
| **S3 — SchlenkBenchScene Skeleton** | 5-7h | 1000×660 SVG canvas, 6 zone backgrounds, manifold hero (ported from Phase 1 + pressure gauge + state-driven stopcocks), tubing engine stub |
| **S4 — Card Rendering + Tubing** | 5-7h | SchlenkCard with glassware + element + service text, tubing paths from manifold ports to each card, full 47-service layout, BOTS rack |
| **S5 — Tier Animations + DetailPanel** | 4-5h | tierAnimations.css with T1-T5 per-card keyframes, SchlenkDetailPanel 6 sections, J-Young charge interaction |
| **S6 — Polish & Acceptance** | 3-4h | Pressure gauge animation, stopcock state-driven rotation, radiant glow on CoordComplex/Jablonski, perf profile, browser acceptance |

Total: 25-33h realistic estimate (40h max with churn).

---

## 6 · Acceptance Criteria (B2 complete)

1. `/` → select SCHLENK → dashboard renders the full bench scene (no periodic table visible)
2. All 47 services appear as distinct glassware silhouettes in their correct zones
3. All 20 bots appear as NMR tubes in the bottom rack
4. Glass tubing connects manifold ports to each card top joint
5. Every element shows its compound color (Fe blood-red, Cu azure, Cl yellow-green, etc.) — 118 colors all enumerated
6. Manifold stopcocks rotate based on aggregate zone health
7. Pressure gauge needle swings based on overall load
8. T1-T5 per-card animations fire correctly (observable at different service loads)
9. Clicking any service opens SchlenkDetailPanel with all 6 sections populated
10. Clicking a J-Young tube in BOTS triggers the charge animation
11. SystemMetricsPanel renders the hybrid (4 CHEM + 3 SCHLENK diagrams)
12. No console errors under any SCHLENK interaction
13. Browser acceptance passes at 10 tests (same list as Phase 1 Task 10 but against new renderer)

---

## 7 · Session Handoff

Next action: write the companion multi-sprint plan (`docs/superpowers/plans/2026-04-20-schlenk-full-scene-multi-sprint.md`) that breaks each sprint S1-S6 into bite-sized tasks with exact files, code snippets, and acceptance checks per the writing-plans skill.

After the plan is written, implementation pauses until a fresh session picks up Sprint 1.
