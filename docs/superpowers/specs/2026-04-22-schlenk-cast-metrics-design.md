# SCHLENK Cast-View Metrics Integration — Design Spec

**Date:** 2026-04-22
**Status:** Approved, ready for planning
**Scope:** SCHLENK dashboard mode cast-view (`?cast=1&mode=SCHLENK`) redesign to embed SRV-1 and SRV-2 system metrics into the Schlenk-line apparatus diagram
**Related:** PRD-037 (SCHLENK mode base); PRD-038 (B-Hyve write — unrelated, context-only)

## 1. Problem Statement

The SCHLENK dashboard mode was added in Session 73 as the 31st metaphor (B2 full-scene Schlenk-line diagram). Its cast-view (`?cast=1`) currently inherits the CHEM layout: 3-column middle row (badges, periodic table, legend) with the scene rendering at natural 1000×660 aspect letterboxed in the center column.

Two limitations:
1. The cast view has no system-metric integration — CPU/RAM/disk/network/speedtest metrics are invisible on Nest Hubs and cast displays running SCHLENK mode.
2. The inherited CHEM chrome (vertical badge column, right-side category legend) doesn't fit SCHLENK's visual language — SCHLENK's scene already communicates categories via colored tubing and apparatus shapes, making the legend redundant.

The goal is a dedicated SCHLENK cast-view that integrates system metrics into the apparatus diagram using chemistry-accurate metaphors, renders at a wider aspect matching typical Nest Hub/TV viewports, and uses SCHLENK-specific chrome.

## 2. Cast Mode Entry & Chrome Layout

### 2.1 URL + HA activation (already implemented)

Cast-view activates via URL params: `?cast=1&mode=SCHLENK`. Home Assistant dispatches this URL via:

- `configuration.yaml` — `ShowHomepage` intent builds `https://dashboard.tendrid.us?cast=1&mode={{ cast_mode }}` (default SCHLENK)
- `scripts.yaml` — `show_homepage` service accepts optional `mode` field (default SCHLENK), template-interpolates into URL
- `custom_sentences/en/casting.yaml` — voice intent "show my homepage in schlenk mode" parses to mode=SCHLENK; default utterance "show my homepage" → mode=SCHLENK

Frontend — already wired in part (a) of this session:
- `App.jsx` reads `IS_CAST` and `CAST_MODE_PARAM` as module-level constants; dashboardMode state initializer honors CAST_MODE_PARAM when IS_CAST, defaulting to SCHLENK.
- `CastLayout.jsx` dispatches the grid via `MODE_REGISTRY[dashboardMode].Grid`, using `MODE_NATURAL_SIZE[dashboardMode]` for scaling math.

### 2.2 CastLayout branching for SCHLENK

CastLayout renders two different compositions based on `dashboardMode`:

**Default (non-SCHLENK) — 3-column middle row (unchanged):**
```
┌──────── TOP BAR: weather + clock ────────┐
│ badges │       grid (scaled)      │legend│
└──────────────────────────────────────────┘
```

**SCHLENK — 3-row layout (new):**
```
┌──────── TOP BAR: weather + clock ────────┐
│                                          │
│            scene (full width)            │
│                                          │
├──────── BOTTOM BAR: badge strip ─────────┤
```

Differences:
- Left column removed; `SecurityBadgeRow` rendered horizontally in a new bottom strip
- Right column removed; `CastLegend` not rendered at all (scene's colored tubing encodes categories)
- Scene occupies the full middle-row width

### 2.3 Scene aspect ratio

Scene uses `viewBox="0 0 1400 660"` (aspect 2.12:1) to match the cast middle row after chrome (~9% top, ~7% bottom). Normal dashboard mode continues to use the standard SCHLENK viewBox (1000×660) — a `cast` prop on `SchlenkBenchScene` triggers the wider cast-specific layout.

`MODE_NATURAL_SIZE.SCHLENK` in CastLayout updates to `[1400, 660]`.

## 3. Scene Design — v9 Layout

Scene composition inside the 1400×660 viewBox:

### 3.1 Manifold strip (y=0-110)

Two server-specific manifolds with a central coupling gap:
- **SRV-1 manifold:** x=30-640. Ar line at y=70 (solid cyan, animated dash-offset = download rate). Vac line at y=85 (dashed lighter cyan, animated dash-offset = upload rate).
- **Coupling gap:** x=640-760 (120px clear, no physical hardware bars).
- **SRV-2 manifold:** x=760-1370. Mirrored: Ar at y=70 (amber), Vac at y=85 (dashed amber).

Manifold labels at y=103: "SRV-1 · Ar ↓940 · Vac ↑35" and "SRV-2 · Ar ↓480 · Vac ↑60".

### 3.2 Apparatus above each manifold (y=8-55)

Four apparatus items per server, evenly spaced above their manifold. Each has a short vertical tap connector down to Ar or Vac line.

**SRV-1 apparatus (outer→inner):**
| Item | x | Taps into | Metric shown |
|------|---|-----------|--------------|
| C tank | 100 | Ar line (y=70) | SRV-1 C drive fill% + GB |
| Pirani gauge | 250 | Vac line (y=85) | SRV-1 RAM% (needle position) |
| Cold trap | 400 | Vac line (y=85) | SRV-1 speedtest (ms ping, ↓/↑ Mbps) + live throughput (bubbles) |
| Vac pump | 550 | Vac line (y=85) | SRV-1 CPU% (rotor speed) |

**SRV-2 apparatus (inner→outer, mirrored):**
| Item | x | Taps into | Metric shown |
|------|---|-----------|--------------|
| Vac pump | 850 | Vac line | SRV-2 CPU% |
| Cold trap | 1000 | Vac line | SRV-2 speedtest + throughput |
| Pirani gauge | 1150 | Vac line | SRV-2 RAM% |
| C tank | 1300 | Ar line | SRV-2 C drive fill% |

Apparatus connector colors: green for Ar (C tank), yellow for Pirani, blue for Cold trap, orange for Vac pump.

### 3.3 Stopcocks (6 per manifold, evenly spaced ~87px)

Each manifold has 6 stopcocks at fixed x positions. Zone-stopcock assignment requires each zone to contain its trunk's x-position so the trunk drops straight into the zone without a horizontal jog.

**SRV-1 stopcocks:**
| x | Type | Feeds | Rationale |
|---|------|-------|-----------|
| 117 | Zone | MEDIA-1 trunk | 117 ∈ MEDIA-1 x=10-320 |
| 204 | Shared | J bottle → SRV-1 side | — |
| 291 | Zone | INFRA-1 trunk | 291 in gutter between MEDIA-1 and LIBRARY-1; trunk passes through vertically to bottom INFRA-1 sub-header |
| 379 | Zone | LIBRARY-1 trunk | 379 ∈ LIBRARY-1 x=330-640 |
| 466 | Shared | Q bottle → SRV-1 side | — |
| 553 | Shared | T bottle → SRV-1 side | — |

**SRV-2 stopcocks:**
| x | Type | Feeds | Rationale |
|---|------|-------|-----------|
| 847 | Shared | T bottle → SRV-2 side | mirror of SRV-1 S-T at 553 (1400-553) |
| 934 | Zone | INFRA-2 trunk | 934 ∈ INFRA-2 x=760-1070 |
| 1021 | Shared | Q bottle → SRV-2 side | — |
| 1109 | Zone | TOOLS-2 trunk | 1109 in gutter between INFRA-2 (x=760-1070) and MEDIA-2 (x=1080-1390); trunk passes through vertically to bottom TOOLS-2 sub-header |
| 1196 | Zone | MEDIA-2 trunk | 1196 ∈ MEDIA-2 x=1080-1390 |
| 1283 | Shared | J bottle → SRV-2 side | — |

Zone stopcocks: 2 circles stacked (Ar + Vac tap, implying 3-way valve). Shared-bottle stopcocks: single green circle (Ar tap only).

### 3.4 Central column — shared drive bottles + manometer (x=660-740, centered at x=700)

**Lecture bottles (J/Q/T) stacked vertically:**
- J bottle at (687, 120): NO₂ (reddish brown), represents J drive — 26w × 72h + valve
- Q bottle at (687, 220): I₂ (purple), Q drive — same dimensions
- T bottle at (687, 320): Cl₂ (yellow-green), T drive — same dimensions

Each bottle has a Y-fitting at its top outputting TWO cross-feed tubes:
- Left cross-feed: to the bottle's SRV-1 shared stopcock (J→x=291, Q→x=466, T→x=553)
- Right cross-feed: to the bottle's SRV-2 shared stopcock (J→x=1109, Q→x=934, T→x=847)

Cross-feed paths (all green for Ar, animated dash-offset outward):
- Horizontal run at y=70 (Ar line level)
- Each bottle's run at a different Y originating level, converging at the Ar line

**U-tube manometer at x=660-740, y=460-535:**
- v6 dimensions (80w × 75h)
- Left leg at x=672, right leg at x=728
- Hg column with differential height = `ΔP = (CPU₁+RAM₁)/2 − (CPU₂+RAM₂)/2` clamped to ±30 torr visual range
- Subtle breathing oscillation on Hg surface
- Left tap: from leg top (672, 460) straight UP to (672, 85), then horizontal LEFT to (640, 85) = SRV-1 Vac line end
- Right tap: from (728, 460) UP to (728, 85), then horizontal RIGHT to (760, 85) = SRV-2 Vac line start

### 3.5 Zones (below strip, y=115-540)

Simplified to 3 zones per server for cast-mode legibility:

Zone x-ranges chosen so each zone contains its assigned stopcock's x-position — trunks are all pure vertical drops from stopcock to sub-header.

**SRV-1 zones (x=10-640):**
- MEDIA-1: x=10-320, y=115-440. Trunk at x=117 from S-M. Sub-header at y=135 spans x=25-315. Flasks in brick-lane rows.
- LIBRARY-1: x=330-640, y=115-440. Trunk at x=379 from S-L. Sub-header at y=135 spans x=345-635.
- INFRA-1: x=10-640, y=455-540 (wide bottom). Trunk at x=291 from S-I routes vertically through the gutter between MEDIA-1 (ends at x=320) and LIBRARY-1 (starts at x=330). Sub-header at y=470 spans x=25-635.

**SRV-2 zones (x=760-1390) — asymmetric-but-mirror-ish:**
- INFRA-2: x=760-1070, y=115-440 (inner-top-right). Trunk at x=934 from S-I2. Sub-header at y=135 spans x=775-1065.
- MEDIA-2: x=1080-1390, y=115-440 (outer-top-right, mirror of MEDIA-1). Trunk at x=1196 from S-M2. Sub-header spans x=1095-1385.
- TOOLS-2: x=760-1390, y=455-540 (wide bottom, mirror of INFRA-1). Trunk at x=1109 from S-T2 routes vertically through the gutter between INFRA-2 (ends at x=1070) and MEDIA-2 (starts at x=1080). Sub-header at y=470 spans x=775-1385.

All flask branches drop from sub-header to flask top-joint at brick-lane positions. "No cyan/amber line crosses glassware" invariant preserved via `posInZone` brick-lane positioning (existing implementation).

All trunks drop from their stopcock to the zone's sub-header. Sub-headers run horizontally across the zone at the zone-top + ~20px. Per-flask branches drop from sub-header to each flask's top joint. Brick-lane flask positioning prevents branches from crossing other flasks.

## 4. Metric-to-Visual Mapping

| Metric | Visual element | Update mechanism |
|--------|----------------|------------------|
| SRV-1 CPU% | Vac pump rotor spin speed | `animateTransform dur = max(0.3s, 3s * (1 − cpu/100))` |
| SRV-1 RAM% | Pirani gauge needle angle | rotate needle from -90° (0%) to +90° (100%) via attribute update |
| SRV-1 C drive fill% | C tank liquid level | `rect.height = 44 * (pct/100)`, `rect.y` adjusted |
| SRV-1 J/Q/T drive fill% | Lecture bottle liquid fill opacity/level | Same pattern, gradient amplitude based on fill |
| SRV-1 download rate | Ar line dash-offset animation | `dur = max(0.2s, 3000ms / downloadMbps)` |
| SRV-1 upload rate | Vac line dash-offset animation | `dur = max(0.3s, 2500ms / uploadMbps)` |
| SRV-1 speedtest ping | Cold trap frost tick density | Number of visible frost marks = `floor(ms / 10)` capped |
| SRV-1 live throughput | Cold trap bubble rise rate | `dur = max(0.4s, 1200ms / (netMbps/100))` × 3 staggered bubbles |
| SRV-2 equivalents | Mirrored apparatus (right side) | Same formulas, separate data channel |
| Δ(SRV-1, SRV-2) load | Manometer Hg differential height | `dH = clamp((load1-load2) * 2, -20, 20)` px |

All metrics read from `useDashboard()` context (statsMap, which already aggregates SSE-driven data from the useSSE hook).

## 5. Implementation Components

### 5.1 New files

| File | Purpose |
|------|---------|
| `src/dashboards/schlenk/SchlenkCastScene.jsx` | Cast-specific scene component (viewBox 1400×660). Wraps or replaces SchlenkBenchScene in cast mode. |
| `src/dashboards/schlenk/apparatus/CTank.jsx` | C drive tank with liquid-level based on stats |
| `src/dashboards/schlenk/apparatus/PiraniGauge.jsx` | RAM gauge with rotating needle |
| `src/dashboards/schlenk/apparatus/VacPump.jsx` | CPU pump with speed-scaled rotor |
| `src/dashboards/schlenk/apparatus/ColdTrap.jsx` | Cold trap with frost + bubbler |
| `src/dashboards/schlenk/apparatus/LectureBottle.jsx` | Parametric lecture bottle with gas-colored gradient |
| `src/dashboards/schlenk/apparatus/UTubeManometer.jsx` | U-tube with differential Hg column |
| `src/dashboards/schlenk/castLayout.js` | Constants: apparatus x-positions, stopcock positions, zone bounds |
| `src/dashboards/schlenk/metricMappers.js` | Pure functions: cpu → rotor dur, ram → needle angle, etc. |

### 5.2 Files to modify

| File | Change |
|------|--------|
| `CastLayout.jsx` | Branch layout on `dashboardMode === 'SCHLENK'`: 3-row layout with bottom badge strip, no left/right columns |
| `src/modeRegistry.js` | Update `MODE_NATURAL_SIZE.SCHLENK = [1400, 660]` in CastLayout (or add a `castSize` field to modeRegistry) |
| `src/components/SecurityBadgeRow.jsx` | Already supports `vertical` prop. Confirm horizontal (default) renders correctly in a narrow ~50px-tall strip |

### 5.3 Existing files unchanged

- `App.jsx` (mode param handling already done in part a)
- `HA configuration.yaml`, `scripts.yaml`, `casting.yaml` (already updated)
- Normal-mode `SchlenkBenchScene.jsx` and its apparatus (the cast scene is a separate component)

## 6. Animation Specifications

All SMIL animations (SVG native) — no JS animation frames required. Durations computed from current metric values on every render; React re-renders when stats change (SSE push).

```jsx
// VacPump.jsx
const rotorDur = Math.max(0.3, 3 * (1 - cpu / 100));  // seconds
<animateTransform dur={`${rotorDur}s`} ... />
```

Metrics update cadence: React updates driven by SSE `stats` events (already in place via `useSSE`). Each render recomputes animation durations; SMIL restarts with new timings.

## 7. Chrome Implementation

### 7.1 Bottom badge strip

New element in CastLayout for SCHLENK mode:
```jsx
<div className="cast-bottom-bar" style={{
  flexShrink: 0,
  background: 'rgba(10,12,18,0.92)',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  display: 'flex', justifyContent: 'center', gap: 20,
  padding: '8px 18px',
  backdropFilter: 'blur(12px)',
  zIndex: 3,
}}>
  <SecurityBadgeRow />
</div>
```

SecurityBadgeRow renders horizontally by default — no `vertical` prop.

### 7.2 Scene container (middle row)

```jsx
<div className="cast-scene" style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
  <Suspense fallback={null}>
    <Grid statsMap={statsMap} allElements={ALL_ELEMENTS} elementRegistry={SERVICE_REGISTRY} cast />
  </Suspense>
</div>
```

The `cast` prop on Grid triggers the wider viewBox and alternate layout inside `SchlenkCastScene`.

## 8. Testing

### 8.1 Smoke tests

- Cast-URL dispatches correctly: `?cast=1` defaults to SCHLENK; `?cast=1&mode=CHEM` renders CHEM with its periodic table.
- HA voice intent "show my homepage" casts with mode=SCHLENK; "show my homepage in chem mode" casts CHEM.
- Bottom badge strip renders with 4 badges (Ports, UFW, Keys, Image Freshness); vertical prop absent.
- SCHLENK scene fills the middle row without letterbox.

### 8.2 Visual verification

- Apparatus items are legibly above each manifold at 10-foot viewing distance (min ~24px character height on a 1080p Nest Hub).
- Ar/Vac line animations visibly differ in speed between SRV-1 (high download) and SRV-2 (medium).
- Lecture bottle liquid levels visually distinguish J/Q/T drive fill percentages.
- Manometer Hg differential leans left when SRV-1 load > SRV-2, right when SRV-2 > SRV-1, balanced when equal.
- No cyan/amber tubing ever crosses any flask body (brick-lane invariant).

### 8.3 Data flow tests

- Mock a `statsMap` with extreme values (0%, 100%) — verify animations and gauges handle boundary cases without visual glitches.
- Simulate rapid updates (stats changing every second) — verify SMIL animations don't stutter.
- Zero-data state (all stats unknown) — verify scene renders without errors, showing neutral/waiting indicators.

## 9. Out of Scope

- Adjusting the normal-mode SCHLENK scene. Its 1000×660 layout continues unchanged.
- Adding new metric types beyond those listed (CPU, RAM, disk fill, network rates, speedtest ping, live throughput).
- Per-service flask-level metrics (each flask's liquid level etc. — already handled by base SCHLENK scene's tier system).
- Landscape vs portrait orientation detection (cast view assumes landscape; portrait Nest Hub is deferred).
- Interactive elements (clicking apparatus opens detail — cast view is display-only; no click handlers beyond the zone flasks which fall back to no-op in cast).

## 10. Architecture Decisions

1. **Separate `SchlenkCastScene.jsx` vs cast prop on existing scene.** Chose separate component — cleaner to maintain two scene variants with different viewBox and positioning. Both reuse the same apparatus primitives (CTank, PiraniGauge, etc.).
2. **SCHLENK-specific cast chrome (no right legend).** The scene's colored tubing and apparatus shapes communicate categorization directly. A text legend is redundant at 10-foot distance. This sets a precedent for other visual-heavy modes to opt out of the legend.
3. **viewBox 1400×660 for cast.** Chosen to match cast middle-row aspect (~2.12:1). Content genuinely fills the space — zones and manifolds spread wider than normal mode.
4. **Apparatus above the manifold, evenly spaced.** Chemistry-authentic for modern bench setups. Also ensures 4 apparatus items stay spatially distinct and readable.
5. **Lecture bottles at center with cross-feeds to stopcocks on both manifolds.** Shared-drive story is the most interesting metric — J/Q/T drives accessed from both servers. Centering the bottles emphasizes this while the colored gases (NO₂/I₂/Cl₂) add visual distinction to otherwise-identical storage.
6. **U-tube manometer for load differential.** A novel metric we don't display elsewhere. The differential is more interesting than absolute values for a side-by-side server comparison.
7. **Stopcocks evenly spaced (not clustered).** Rhythmic visual pattern reads as "bench infrastructure." Serves both zone trunks and bottle cross-feeds via alternating pattern.

## 11. Implementation Sequence

Planned execution order (for writing-plans to detail):

1. Extract apparatus components (C tank, Pirani, Vac pump, Cold trap, lecture bottle, U-tube) as standalone React components with stats props.
2. Build `SchlenkCastScene.jsx` composing these + manifold lines + zones + stopcocks at v9-spec positions.
3. Add `MODE_NATURAL_SIZE.SCHLENK = [1400, 660]` for cast; pass `cast` prop from CastLayout to the Grid.
4. Branch `CastLayout.jsx` on SCHLENK mode: 3-row layout with bottom badge strip, no legend column.
5. Metric mapper tests (pure function: input metric → output animation parameters).
6. Visual smoke tests in cast-URL browser view.
7. Deploy to homepage container; visual verify on Nest Hub.
