# SCHLENK Full-Scene Implementation — Multi-Sprint Plan

> **For agentic workers:** This is an **overview plan** indexing 6 sprints. Each sprint is its own session-sized workload. At the start of each sprint session, invoke `superpowers:writing-plans` to expand that sprint's section into a full per-task plan with complete code blocks. Do NOT try to execute all 6 sprints in one session.

**Spec:** `docs/superpowers/specs/2026-04-20-schlenk-mode-design.md` (B2 — full bench scene)
**Branch base:** `feature/schlenk-phase1` (Phase 0 foundation already landed — 13 commits through `b94a63a`)
**Total estimate:** 25-33h realistic, 40h worst-case
**Sessions:** 6 (one per sprint, 3-7h each)

---

## Prerequisites (before S1)

- Current branch `feature/schlenk-phase1` stays the base — rename to `feature/schlenk-full-scene` at S1 kickoff
- Phase 0 foundation retained as the starting point:
  - ✅ ModeToggle entry with ⌬ icon (+ 13 other missing modes added)
  - ✅ modeRegistry SCHLENK row (will be updated in S3)
  - ✅ themes/modes/schlenk.js (will be rewritten in S1)
  - ✅ 3 SystemMetricsPanel diagrams (ReagentBottle, SolventReservoir, PiraniTrace) — reused
- Dev loop: `docker compose up -d --build homepage` after each sprint to smoke-test in browser

---

## Sprint 1 — Palette & Color System (3-4h)

**Goal:** Replace the Phase-1 ABC-blend category palette with compound-color palette, and ship the full 118-entry per-element color map. Visual smoke-test on a placeholder grid.

**Files to create:**
- `src/dashboards/schlenk/elementColors.js` — 118-entry table `{ symbol: { color, label, compound } }`
- `src/dashboards/schlenk/compoundCategories.js` — 12-entry category palette from spec §2.2

**Files to modify:**
- `src/themes/modes/schlenk.js` — replace `t2.cat` with compound colors; drop scene particles (CSS-only per-card animation will replace in S5)
- `src/modeRegistry.js` — SCHLENK `cardTransform` updated to read `elementColors.js` instead of `elementGases.js` (temporary; replaced entirely in S4 when SchlenkCard renders its own content)

**Files to delete:**
- `src/dashboards/schlenk/elementGases.js` (superseded)

**Task breakdown (10 tasks, each 15-30min):**
1. Build `elementColors.js` s-block entries (6 elements, flame-test colors)
2. Build p-block entries (36 elements, molecular colors)
3. Build d-block first-row entries (10, aqueous ions)
4. Build d-block second/third/fourth rows (20, compound refs)
5. Build lanthanides w/ Aldrich Park overrides (15 entries, Ce emerald, Pr chartreuse, etc.)
6. Build actinides (15 entries, uranyl-anchored, Fm-Lr steel-grey)
7. Build noble gases (7 entries, discharge colors)
8. Build `compoundCategories.js` 12 entries
9. Rewrite `themes/modes/schlenk.js` `t2.cat` + strip scene particles
10. Build + deploy + browser-smoke: CHEM cards (SCHLENK mode still uses PT grid) should now show compound colors instead of ABC-blend tints

**Sprint 1 acceptance:**
- Every element symbol returns a color via `getElementColor(symbol)`
- Category palette matches compound table exactly
- Mode still switches to SCHLENK without error (uses existing PT grid temporarily)
- Cards visibly change color per element when mode switched

---

## Sprint 2 — Glassware SVG Catalog (5-6h)

**Goal:** Build the 24-shape glassware library as standalone SVG components. Verify each renders correctly at sm/xs/xxs sizes via a standalone test route.

**Files to create:**
- `src/dashboards/schlenk/GlasswareClip.jsx` — accepts `shape`, `size`, `fillColor`, `fillPercent`, `tierClass` props; renders the right silhouette
- `src/dashboards/schlenk/glasswareRegistry.js` — export object: `{ shapeId: { viewBox, path, jointX, jointY, liquidClip } }` — pre-computes SVG data for fast rendering
- `src/dashboards/schlenk/glassware/rbf1neck.js` — SVG path + metadata
- ...23 more files, one per shape (all listed in spec §2.4)
- `src/dashboards/schlenk/serviceGlassware.js` — `{ serviceId: shapeId }` mapping for all 47 services + `BOT_GLASSWARE = 'nmr-tube'`
- `src/dashboards/schlenk/GlasswareGallery.jsx` — a standalone dev route `/dev/glassware` that renders all 24 shapes in a grid with labels, for visual verification

**Files to modify:**
- `App.jsx` — add dev route `/dev/glassware` (LAN-only, dev-flag gated) that renders `<GlasswareGallery />` — remove before merge

**Task breakdown (~12 tasks):**
1. Create `GlasswareClip.jsx` skeleton + prop contract
2-10. Add shape files one group at a time (group 1: 9 reaction vessels → task 2; group 2: 4 condensers → task 3; etc.)
11. Wire `serviceGlassware.js` mapping for all 47 services + 20 bots
12. Build `GlasswareGallery.jsx` dev page, browser-verify all 24 shapes render at 3 sizes

**Sprint 2 acceptance:**
- All 24 shapes render without path errors at viewbox scales
- Each service has a mapping (no "unmapped" fallbacks in normal use)
- Gallery page shows all shapes with correct liquid-fill clipping

---

## Sprint 3 — SchlenkBenchScene Skeleton (5-7h)

**Goal:** Build the 1000×660 scene canvas with 6 zone backgrounds and manifold hero (rewrite of current Phase 0 SchlenkManifold). Cards NOT rendered yet — just placeholders.

**Files to create:**
- `src/dashboards/schlenk/SchlenkBenchScene.jsx` — top-level scene. Props: `services, statsMap, onCardClick`. Renders: manifold at top, 6 zone rects, placeholder dots at each service's layout position
- `src/dashboards/schlenk/zoneLayout.js` — per-zone bounds in 1000×660: `{ zoneId: { x, y, w, h, label, tintColor } }`. Services positioned within zones via grid rules.
- `src/dashboards/schlenk/serviceLayout.js` — computes `{ serviceId: { x, y, portId } }` from zone bounds + service's zone + order
- `src/dashboards/schlenk/PressureGauge.jsx` — circular dial + swinging needle, props: `loadPercent`
- `src/dashboards/schlenk/portState.js` — derives `{ portId: 'up' | 'horizontal' | 'down' }` from `statsMap` (health-weighted average per zone)

**Files to modify:**
- `src/dashboards/schlenk/SchlenkManifold.jsx` — rewrite per mockup double-tube + state-driven stopcocks (drop current single-tube flask-bulb version entirely)
- `src/modeRegistry.js` — update SCHLENK row: `Grid: SchlenkBenchScene` (was SchlenkGrid)

**Files to delete:**
- `src/dashboards/schlenk/SchlenkGrid.jsx` (superseded by SchlenkBenchScene)
- `src/layout/zoneConfigs/schlenk.js` (SchlenkBenchScene doesn't use zone engine)
- `src/layout/zoneConfigs/index.js` — unregister SCHLENK

**Task breakdown (~12 tasks):**
1. Build `zoneLayout.js` with 6 zone bounds
2. Build `serviceLayout.js` with grid-position logic
3. Rewrite `SchlenkManifold.jsx` double-tube + 6 ports + pressure gauge placeholder
4. Build `PressureGauge.jsx` (static needle first; state-driven in S6)
5. Build `portState.js` health-derivation
6. Wire manifold stopcock angles from `portState`
7. Build `SchlenkBenchScene.jsx` shell with zone rects + manifold
8. Render placeholder dots at each service's computed position
9. Update modeRegistry to use SchlenkBenchScene
10. Delete deprecated Phase-0 SchlenkGrid + zoneConfigs
11. Build + deploy + browser-verify: SCHLENK mode shows manifold + zone rects + placeholder dots (no flasks yet)
12. Commit

**Sprint 3 acceptance:**
- SCHLENK mode renders the bench canvas (no periodic table)
- Manifold has 6 ports + pressure gauge (static)
- 6 zone rects visible with dashed borders
- Placeholder dots positioned inside correct zones
- No errors switching modes

---

## Sprint 4 — Card Rendering + Tubing (5-7h)

**Goal:** Replace placeholder dots with actual glassware cards; add tubing connecting manifold ports to each card.

**Files to create:**
- `src/dashboards/schlenk/SchlenkCard.jsx` — renders one glassware (via `<GlasswareClip>`) + element symbol + service name text overlaid; accepts load%, health, tier class; applies fillColor from `elementColors.js`
- `src/dashboards/schlenk/SchlenkBotRack.jsx` — renders 20 NMR tubes in a row across the BOTS zone
- `src/dashboards/schlenk/tubingEngine.js` — function `computeTubing({portId, fromY, toX, toY, branchStyle}): string` returns SVG path "d" string
- `src/dashboards/schlenk/SchlenkTubing.jsx` — renders all service tubing paths as `<g>` of `<path>` elements

**Files to modify:**
- `src/dashboards/schlenk/SchlenkBenchScene.jsx` — replace placeholder dots with `<SchlenkCard>`; add `<SchlenkTubing>` above cards, below manifold; add `<SchlenkBotRack>` at bottom

**Task breakdown (~12 tasks):**
1. Build `SchlenkCard.jsx` shell — wraps GlasswareClip + text overlays
2. Compute card absolute position from `serviceLayout` + zone bounds
3. Apply element compound color as fill inside the clip-path
4. Render element symbol (top-center inside bulb) + service name (bottom)
5. Handle size variants (sm / xs / xxs for MEDIA vs LIBRARY vs BOTS)
6. Build `SchlenkBotRack` rendering 20 NMR tubes with compound colors
7. Build `tubingEngine.js` — straight segment, elbow, T-joint, branching
8. Build `SchlenkTubing` rendering tubing paths for all 47 services
9. Replace placeholders in SchlenkBenchScene with SchlenkCard + SchlenkBotRack + SchlenkTubing
10. Size each card correctly per its heroSize/cardSize
11. Build + deploy + browser-verify — flasks visible in zones, tubing connects them to manifold
12. Commit

**Sprint 4 acceptance:**
- All 47 services render as their assigned glassware in correct zones
- All 20 bots appear as NMR tubes in BOTS rack
- Glass tubing connects each card's top joint to a manifold port
- Cards show element symbol + service name correctly
- Compound colors visibly vary per element
- No overlap, overflow, or misalignment

---

## Sprint 5 — Tier Animations + DetailPanel (4-5h)

**Goal:** Per-card CSS animations (T1-T5) + full 6-section detail panel.

**Files to create:**
- `src/dashboards/schlenk/tierAnimations.css` — CSS keyframes for each tier (T1 breath, T2 lazy bubble, T3 bubble train + gas flow, T4 reflux + mantle glow, T5 exotherm + crack + spray)
- `src/dashboards/schlenk/SchlenkDetailPanel.jsx` — 6-section panel per spec §2.9
- `src/dashboards/schlenk/detailPanel/LiquidLevelGauge.jsx`
- `src/dashboards/schlenk/detailPanel/BubblerRateGauge.jsx`
- `src/dashboards/schlenk/detailPanel/ManifoldSchematic.jsx` — shows mini-manifold with this service's port highlighted + neighbors
- `src/dashboards/schlenk/detailPanel/LabJournal.jsx` — recent log lines, notebook style (may be lifted from shared log component)
- `src/dashboards/schlenk/JYoungCharge.jsx` — interaction component for BOT J-Young charge animation

**Files to modify:**
- `src/dashboards/schlenk/SchlenkCard.jsx` — apply tier class from load level; tier classes reference tierAnimations.css keyframes
- `src/modeRegistry.js` — SCHLENK `DetailPanel: SchlenkDetailPanel` (currently still references generic ServiceDetailPanel)
- `src/dashboards/schlenk/SchlenkBotRack.jsx` — wire J-Young click → JYoungCharge animation

**Task breakdown (~10 tasks):**
1. Build `tierAnimations.css` with all 5 tier keyframe sets (breath, bubble, bubble-train+gas-flow, reflux+mantle, exotherm+crack+spray)
2. Wire SchlenkCard to apply tier-N class based on load%
3. Build 4 detail-panel sub-components (liquid gauge, bubbler, schematic, journal)
4. Assemble SchlenkDetailPanel shell with header + 4 sections + shared actions
5. Wire modeRegistry to SchlenkDetailPanel
6. Build JYoungCharge animation (tube travels to charge port and back)
7. Wire BOT click → JYoungCharge
8. Build + deploy + browser-verify animations at 5 tier levels
9. Verify detail panel opens for every service type
10. Commit

**Sprint 5 acceptance:**
- T1-T5 animations visibly fire on cards as load tier changes
- Clicking any service opens SchlenkDetailPanel with all 6 sections populated
- Detail panel's manifold schematic correctly highlights the service's port
- Clicking a J-Young tube triggers the charge animation
- No JS errors in detail panel flow

---

## Sprint 6 — Polish & Acceptance (3-4h)

**Goal:** Live pressure gauge, state-driven stopcock rotation, radiant-glow upgrade on retained CHEM diagrams, performance profile, full browser acceptance.

**Tasks:**
1. Wire pressure gauge needle to aggregate system load (re-renders every refresh)
2. Verify stopcock rotation updates live with service state changes
3. Add radiant-glow filter to CoordComplex/JablonskiDiagram when mode=SCHLENK (drop-shadow with palette C accent)
4. Browser perf profile: 47 cards + 20 NMR tubes + 6 tier-animations running — aim for 60fps on avg hardware
5. If perf fails: investigate CSS animation batching, consider pausing off-screen animations
6. prefers-reduced-motion check: collapse all animations to static if user preference set
7. Full 13-item browser acceptance (from spec §6)
8. Tag branch `schlenk-full-scene-complete`
9. Write session summary + vault update

**Sprint 6 acceptance:**
- All spec §6 acceptance items pass
- Perf acceptable on dev hardware
- Reduced-motion preference respected
- Branch ready to merge (via `finishing-a-development-branch` skill)

---

## Execution Handoff

**Plan complete, saved to `docs/superpowers/plans/2026-04-20-schlenk-full-scene-multi-sprint.md`. This is an overview plan — per-sprint task-level plans with full code blocks get written at the start of each sprint session.**

### Recommended session sequence

1. **This session ends here.** No implementation. The spec + plan are the deliverable.
2. **Session N+1 (Sprint 1 kickoff):** Invoke `superpowers:writing-plans` skill → expand Sprint 1 into a full bite-sized plan with all 118 element-color entries literally enumerated. Then invoke `superpowers:subagent-driven-development` and execute.
3. Repeat for S2, S3, etc.
4. **After S6:** Invoke `superpowers:finishing-a-development-branch` to merge.

### Why this structure

- Each sprint is a session unit — matches normal working rhythm
- Per-sprint detail written at session start means the plan reflects any learnings from prior sprints (color map adjustments, layout tweaks based on what we saw in prior builds)
- Avoids the Phase 1 mistake of under-scoping by trying to write 6 sessions' worth of plan detail upfront without feedback loops

### Notes on the Phase 0 foundation

Still-valid commits on `feature/schlenk-phase1` (to be renamed):
- `2abd6f3` elementGases (will be DELETED in S1)
- `dde43d2` elementGases quality fix (obsolete)
- `0988f71` ReagentBottle (KEEP — still used by SystemMetricsPanel)
- `999e104` SolventReservoir (KEEP)
- `46e5224` PiraniTrace (KEEP, will be polished in S6)
- `9ea9855` PiraniTrace quality fix (KEEP)
- `6d46be8` SchlenkManifold v1 (will be REWRITTEN in S3)
- `d35c48c` SchlenkGrid wrapper (will be DELETED in S3)
- `e832fdf` SCHLENK zoneConfig + registration (will be DELETED in S3)
- `aab5a92` zoneConfig TOOLS fix (obsolete)
- `e2878b1` theme + registration (will be REWRITTEN in S1)
- `c787496` modeRegistry SCHLENK row (will be UPDATED in S1/S3)
- `e4d1b31` modeRegistry DRY fix (UPDATED)
- `b94a63a` 13 modes added to toggle + flask-bulb manifold (toggle KEEP, flask-bulb manifold DROP in S3)
- `f691e24` manifold flask silhouettes (DROP in S3)

So Sprint 1-3 involves some targeted code REMOVAL alongside new work. The 3 metrics diagrams + the toggle entries are the clean wins that transfer forward.
