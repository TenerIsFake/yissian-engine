# Homepage Mega-Expansion — Design Spec

**Date:** 2026-04-15
**Status:** Draft
**Scope:** 30 new modes, 21 new animation behaviors, 60-mode animation profiles, 3 services, 3 tools, 3 bots

---

## Table of Contents

1. [Overview](#overview)
2. [Animation System Expansion](#animation-system-expansion)
   - [Behavior Palette (30 total)](#behavior-palette)
   - [60-Mode Animation Profile Matrix](#60-mode-animation-profile-matrix)
3. [New Modes (27)](#new-modes)
   - [Creative Modes (7)](#creative-modes)
   - [Exotic Modes (10)](#exotic-modes)
   - [Hyper-Accurate Modes (10)](#hyper-accurate-modes)
4. [New Services (3)](#new-services)
5. [New Tools (3)](#new-tools)
6. [New Bots (3)](#new-bots)
7. [Implementation Strategy](#implementation-strategy)

---

## Overview

This spec expands the homepage from 30 modes to 60, from 9 animation behaviors to 30, and adds 3 services, 3 tools, and 3 bots. The guiding principle is **visual uniqueness per mode**: every mode gets a distinct Primary+Secondary animation combo so no two modes look alike, even at a glance.

### Scope Summary

| Category | Current | Adding | Total |
|----------|---------|--------|-------|
| Modes | 30 | 27 (+3 approved) | 60 |
| Animation behaviors | 9 | 21 | 30 |
| Theme tiers | 150 (5×30) | 150 (5×30) | 300 |
| Services monitored | ~35 | 3 | ~38 |
| Interactive tools | 4 | 3 | 7 |
| Media bots | 20 | 3 | 23 |

### Prerequisites

- PRD-033 through PRD-036 (architecture evolution) — all shipped as of Session 65
- Widget manifest registry (PRD-036) — enables zero-prop widget rendering
- DashboardContext — provides shared state to all widgets
- SSE Event Bus (PRD-035) — single aggregated status stream

---

## Animation System Expansion

### Design: Three-Tier Animation Profiles

Every mode gets a three-layer animation composition:

| Layer | Weight | Pool | Role |
|-------|--------|------|------|
| **Primary** | 60-70% visual weight | Any tier | Defines the mode's visual identity |
| **Secondary** | 20-30% visual weight | Any tier | Dramatic accent/punctuation |
| **Fill** | 5-15% visual weight | Light tier | Atmospheric bed |

**Uniqueness rule:** No two modes share the same Primary+Secondary pair.

### Behavior Palette

30 behaviors organized into three visual-weight tiers.

#### Heavy (10) — Scene-Defining

These fill 30%+ of the canvas and define what the mode IS at a glance.

| ID | Behavior | Visual Category | Description | Perf Cost |
|----|----------|----------------|-------------|-----------|
| H1 | `aurora` | Flowing bands | Undulating curtains of light across screen. Color bands shift through accent palette. Intensity scales with health tier. | Medium |
| H2 | `smoke` | Soft-body blobs | Large semi-transparent shapes, simplex noise displacement for morphing. Overlap creates depth. Color shifts within accent palette. | Medium |
| H3 | `matrix` | Glyph streams | Vertical columns of falling characters (katakana, hex, mode-specific symbols). Head glyph bright white, trail fades to accent. Stream length/density scale with tier. | Medium |
| H4 | `constellation` | Connected mesh | Slowly drifting points draw thin connecting lines to nearby neighbors (proximity threshold). Line opacity based on distance. High tiers: faint triangle fills between connected triplets. | Medium-High |
| H5 | `comet` | Trailing arcs | Fast bezier-path particles with fading gradient tails. Arc across screen on parabolic paths. Burst-on-death spawns smaller sparkles at screen edges. Tail length scales with tier. | Low-Medium |
| H6 | `vortex` | Spiral flow | Particles orbit inward or outward from focal points in spiral arms. Multiple vortex centers possible. Galaxy, whirlpool, drain, tornado. Arm count and tightness scale with tier. | Medium |
| H7 | `warp` | Radial streaks | Starfield-tunnel effect — particles streak from center outward (or inward to center). Speed and density scale with tier. Hyperspace jump, eruption, convergence. | Low-Medium |
| H8 | `fractal` | Branching growth | Self-similar patterns grow, fork, and fade. Each branch point spawns 2-3 child branches at diminishing scale. Frost on glass, river deltas, coral, roots, vines. Branch depth scales with tier. | Medium-High |
| H9 | `hologram` | Scan + glitch | Horizontal scan lines sweep across canvas. Jitter, transparency flicker, RGB split artifacts. Intensity of glitch artifacts scales with tier. Technical display, damaged transmission. | Low |
| H10 | `nebula` | Volumetric clouds | Scattered color cloud formations with internal luminous motion. Like aurora but 3D-distributed across the full canvas, not banded. Density and internal complexity scale with tier. | Medium |

#### Medium (10) — Accent-Weight

Visible focus elements at 15-25% of visual weight. Work as primary OR secondary.

| ID | Behavior | Visual Category | Description | Perf Cost |
|----|----------|----------------|-------------|-----------|
| M1 | `lightning` | Branching arcs | Jagged electrical discharges between random screen positions. Fork probability and brightness scale with tier. At Tier 5, arcs chain across the screen. | Low (sparse) |
| M2 | `ripple` | Expanding rings | Concentric circles emanating from spawn points, fade as they grow. Multiple ripples overlap for interference patterns. Can be event-driven (SSE status change). | Low |
| M3 | `firefly` | Flocking dots | Soft-glow particles with loose boid-style flocking (attract/disperse). Periodic synchronized pulse. Flock size and sync frequency scale with tier. | Medium |
| M4 | `orbit` | Circular paths | Particles circle around randomly placed centers at varied radii and speeds. Multiple orbit centers create complex patterns. | Low |
| M5 | `wave` | Sinusoidal flow | Horizontal traversal with vertical sinusoidal oscillation. Overlapping frequencies create interference patterns. Amplitude and frequency count scale with tier. | Low |
| M6 | `curve` | Parabolic arcs | Bezier trajectories with gravity-like `curveFactor` bending the path. Supports trail rendering. Cards, balls, thrown objects. | Low |
| M7 | `bounce` | Edge-reflecting | Particles rebound off screen edges with angle-of-incidence reflection. Optional energy decay per bounce. Bouncing balls, ricochets, pinball. | Low |
| M8 | `chain` | Linked segments | Particles connected in sequences, undulating as a unit. Snake-like, whip-like, rope-like. Segment count and wave amplitude scale with tier. | Medium |
| M9 | `pulse` | Heartbeat rings | Expand-contract-expand rhythm (unlike ripple which only expands). Breathing, sonar echo, heartbeat. Rate syncs to health tier. | Low |
| M10 | `scatter` | Burst + decelerate | Particles explode from a point and slow down radially. Firework, shrapnel, pollen burst. Burst frequency and particle count scale with tier. | Low-Medium |

#### Light (10) — Ambient Fill

Atmospheric texture at 5-15% visual weight. The bed that makes scenes feel inhabited.

| ID | Behavior | Visual Category | Description | Perf Cost |
|----|----------|----------------|-------------|-----------|
| L1 | `twinkle` | Static shimmer | Fixed position, sinusoidal opacity oscillation. Stars, dust catching light. | Minimal |
| L2 | `flash` | Momentary pulse | Stationary, bell-curve opacity burst over lifetime. Sparks, radar pings, camera flashes. | Minimal |
| L3 | `rise` | Upward drift | Moves up with horizontal sine wobble, fades near top. Bubbles, steam, embers, sparks. | Minimal |
| L4 | `fall` | Downward drift | Moves down with lateral wobble and optional wind factor. Rain, snow, petals, ash, confetti. | Minimal |
| L5 | `drift` | Lateral float | Horizontal movement with vertical sine oscillation. Clouds, dust, pollen, fog. | Minimal |
| L6 | `linear` | Straight paths | Fixed-angle movement with optional trail. Contrails, laser beams, tracers, fault lines. | Minimal |
| L7 | `sway` | Pendulum motion | Stays roughly in place, swings side-to-side. Hanging ornaments, seaweed, lanterns, pendulums. | Minimal |
| L8 | `hover` | Brownian jitter | Micro-random-walk in place. Suspended dust, quantum uncertainty, still water particles. | Minimal |
| L9 | `shimmer` | Hue cycling | Fixed position, cycles through hue range over time. Prisms, oil slick, jewels, stained glass. | Minimal |
| L10 | `flicker` | Rapid on/off | Stochastic fast opacity toggling. Candle flames, broken neon, old film grain, firelight. | Minimal |

### New Behaviors to Implement (21)

The 9 existing behaviors (`twinkle`, `linear`, `rise`, `fall`, `drift`, `flash`, `orbit`, `wave`, `curve`) remain unchanged. The following 21 require new implementation in `AnimatedBackground.jsx`:

**Heavy (10 new):** `aurora`, `smoke`, `matrix`, `constellation`, `comet`, `vortex`, `warp`, `fractal`, `hologram`, `nebula`
**Medium (7 new):** `lightning`, `ripple`, `firefly`, `bounce`, `chain`, `pulse`, `scatter` (existing: `orbit`, `wave`, `curve`)
**Light (4 new):** `sway`, `hover`, `shimmer`, `flicker` (existing: `twinkle`, `flash`, `rise`, `fall`, `drift`, `linear`)

### Implementation Notes for New Behaviors

#### aurora
- Uses 3-5 bezier control points per band, animated via sine functions at different frequencies
- Color sampled from mode's accent palette gradient
- `bandCount` and `waveAmplitude` scale with tier
- Renders to a separate offscreen canvas or uses wide gradient strokes on main canvas

#### smoke
- Each blob is a cluster of overlapping radial gradients
- Position and shape displaced by 2D simplex noise sampled at `(x * scale + time, y * scale)`
- `noiseScale`, `noiseSpeed`, and `blobCount` scale with tier
- Uses `globalCompositeOperation: 'screen'` for additive blending

#### matrix
- Each stream is a vertical column with a head position and trail of N characters
- Head advances downward each frame; trail characters have decreasing opacity
- Glyph set per mode: katakana (NEURAL), hex digits (CIRCUIT), game symbols (ARCADE), runes (ARCANE), etc.
- `streamCount`, `streamLength`, and `fallSpeed` scale with tier

#### constellation
- Maintain particle positions; each frame, compute pairwise distances within `proximityThreshold`
- Draw lines between pairs within threshold, opacity = `1 - (distance / threshold)`
- At tier 4+: detect triangles (three mutually connected particles) and fill with very faint accent color
- Use spatial hashing to avoid O(n²) distance checks: grid cells of `proximityThreshold` size

#### comet
- Particles follow bezier curves (3-point: start edge, random control, end edge)
- Store last N positions as trail; render as tapered gradient line (thick→thin, bright→faded)
- On death (reaching end): spawn 3-8 child `flash` particles near death position
- `tailLength`, `speed`, and `burstCount` scale with tier

#### vortex
- 1-3 vortex centers placed randomly (or at mode-specific positions)
- Each particle has `angle` and `radius` relative to its vortex center
- Per frame: `angle += angularSpeed / radius`, `radius += radialSpeed` (inward or outward)
- Spiral arm structure: particles spawn preferentially at `angle % (2π / armCount) < threshold`
- `armCount` (2-5) and `angularSpeed` scale with tier

#### warp
- Single focal point (default: canvas center, configurable per mode)
- Particles spawn at focal point and streak outward (or spawn at edges and converge)
- Speed increases with distance from center (perspective acceleration)
- Render as elongated streaks (length proportional to speed)
- `streakLength` and `spawnRate` scale with tier

#### fractal
- Recursive branch growth: root starts at random edge position
- Each branch grows at a rate, then spawns 2-3 children at `branchAngle ± spread`
- Children are shorter and thinner than parent (scale factor 0.6-0.8)
- Branches fade out after `maxLife`; new roots spawn periodically
- `maxDepth` (3-6) and `branchRate` scale with tier
- Performance: cap total active branch segments at 200

#### hologram
- Full-width horizontal scan lines sweep top-to-bottom at steady rate
- Line has slight horizontal jitter (random offset per frame)
- Every N frames: trigger a "glitch band" — a horizontal strip gets RGB-split (red channel offset left, blue offset right)
- Glitch frequency and RGB-split magnitude scale with tier
- Render: draw semi-transparent horizontal lines with `globalAlpha` modulation

#### nebula
- Similar to `smoke` but distributed across full canvas (not concentrated)
- Each cloud has independent simplex noise offset and color from accent palette
- Clouds have internal "stars" — small bright points that twinkle within the cloud boundary
- `cloudCount`, `cloudSize`, and `internalStarDensity` scale with tier

#### lightning
- On trigger (stochastic, `frequency` scale with tier): pick two random points
- Draw main bolt as jagged line: subdivide midpoints with perpendicular random offset
- At each subdivision, `forkProbability` chance of spawning a child bolt (shorter, dimmer)
- Bolt persists for 3-5 frames then fades
- Total bolt segments capped at 50 per discharge

#### ripple
- On spawn: record center position
- Each frame: radius grows, opacity decreases as `1 - (radius / maxRadius)`
- Ring rendered as circle stroke with lineWidth tapering
- Event-driven mode: SSE `service:status` changes can trigger a ripple at the corresponding card position
- `maxRadius`, `ringWidth`, and `spawnRate` scale with tier

#### firefly
- Boid-style flocking: separation (avoid crowding), alignment (match neighbors' heading), cohesion (steer toward group center)
- Neighbor radius for flocking calculations: 80-120px
- Periodic pulse: all fireflies in a cluster brighten simultaneously, then fade (synchronized flash)
- `flockSize`, `pulseFrequency`, and `glowRadius` scale with tier

#### bounce
- Particles spawn with random velocity vector
- On reaching any screen edge: reflect velocity component (`vx = -vx` or `vy = -vy`)
- Optional `energyDecay` per bounce (0.9 = loses 10% speed each bounce)
- Optional `gravity` constant pulling downward between bounces
- `speed` and `particleCount` scale with tier

#### chain
- Particles grouped into chains of N segments
- Head segment moves freely (drift, wave, or random walk)
- Each subsequent segment follows the previous with spring-like constraint (fixed distance)
- Render: line segments between chain nodes, optional varying thickness
- `segmentCount`, `chainCount`, and `waveAmplitude` scale with tier

#### pulse
- Like `ripple` but with expand-contract cycle: radius oscillates between `minRadius` and `maxRadius`
- Uses sine function: `radius = minR + (maxR - minR) * (0.5 + 0.5 * sin(age * pulseSpeed))`
- Ring opacity peaks at max expansion, dims at contraction
- `pulseSpeed` and `ringCount` scale with tier

#### scatter
- Periodically (stochastic), pick a spawn point
- Emit N particles in radial directions with initial high velocity
- Each particle decelerates via `friction` factor per frame
- Particles fade as they slow; die when velocity < threshold
- `burstSize`, `initialSpeed`, and `frequency` scale with tier

#### sway
- Particle has a fixed anchor point (where it "hangs from")
- Position oscillates horizontally: `x = anchorX + amplitude * sin(time * frequency + phase)`
- Very slight vertical bob: `y = anchorY + smallAmplitude * cos(time * frequency * 0.5)`
- `amplitude` and `frequency` are randomized per particle for organic feel

#### hover
- Particle has a home position
- Each frame: position += random offset from `(-jitter, -jitter)` to `(jitter, jitter)`
- Slight bias back toward home position (spring force): `dx += (homeX - x) * 0.01`
- Creates Brownian motion appearance
- `jitter` magnitude scales with tier (but always small: 0.5-3px)

#### shimmer
- Particle has fixed position
- Each frame: hue rotates through a range: `hue = baseHue + range * sin(time * speed + phase)`
- `hueRange` (30° for subtle, 180° for prismatic) configurable per mode
- Opacity remains constant; only color changes
- Size may gently pulse (±10%)

#### flicker
- Particle has fixed position
- Opacity is stochastic: each frame, `opacity = random() > flickerThreshold ? maxOpacity : 0`
- Smoothed slightly with exponential moving average to avoid pure strobe
- `flickerThreshold` (0.3 = mostly on, 0.7 = mostly off) configurable per mode
- Creates candle-flame / broken-neon / old-film effect

---

## 60-Mode Animation Profile Matrix

### Combo Assignment Rules

1. **No two modes share the same Primary+Secondary pair**
2. **Modes in the same thematic neighborhood have different primaries** (all 10 science modes have different primaries)
3. **One deliberate mirror pair** exists: MOLECULE↔DNA (orbit/chain swapped). The primary/secondary weight difference makes them visually distinct.

### Review Notes (Session 65 audit)

Six combos were revised after a comprehensive thematic-accuracy review:

| Mode | Before → After | Rationale |
|------|---------------|-----------|
| ARCANE | lightning+vortex → lightning+**orbit** | Orbiting spell wards/circles is distinctly magical; vortex reads tornado |
| WEATHER | hologram+wave → **aurora**+wave | Weather should feel atmospheric, not like a radar readout; separates from TACTICAL |
| BAND | lightning+scatter → **comet**+**bounce** | All-punctuation combo had no sustained layer; comets give persistent kinetic base, bounce = confetti physics |
| STEAM | smoke+bounce → smoke+**orbit** | Spinning gears are core steampunk iconography; bounce had no mechanical resonance |
| HEIST | smoke+lightning → smoke+**bounce** | Ricocheting bullets/tools off vault walls is more heist-action than jagged electrical arcs |
| QUANTUM | warp+pulse → **nebula**+pulse | Probability clouds (nebula) IS quantum mechanics; warp reads hyperspace |

### Existing 30 Modes — Upgraded Profiles

| # | Mode | Primary | Secondary | Fill | Scene |
|---|------|---------|-----------|------|-------|
| 1 | CHEM | ripple | scatter | rise | Reaction rings radiate, reagent bursts scatter, vapor rises |
| 2 | SPACE | comet | orbit | twinkle | Shooting stars arc, debris in orbital paths, distant stars twinkle |
| 3 | NEURAL | matrix | constellation | flash | Data cascades through connected synapse lines, intersection flashes |
| 4 | ARCANE | lightning | orbit | shimmer | Eldritch arcs between runes, protective ward circles orbit caster points, gems shimmer |
| 5 | BIO | firefly | pulse | drift | Bioluminescent organelles flock, membranes pulse, cytoplasm drifts |
| 6 | MOLECULE | orbit | chain | twinkle | Electrons trace shells, molecular bonds chain atoms, valence glints |
| 7 | PLANET | aurora | ripple | drift | Aurora bands undulate, pressure ripples expand, cosmic dust drifts |
| 8 | WEATHER | aurora | wave | fall | Cloud-lit sky bands undulate, pressure fronts propagate as waves, precipitation falls |
| 9 | AIRPORT | warp | linear | flash | Departure radials converge, flight paths cross, beacons flash |
| 10 | DINO | comet | scatter | fall | Extinction meteors streak, debris bursts on impact, ash falls |
| 11 | NOIR | smoke | flicker | linear | Fog rolls through alleys, neon flickers, headlight beams |
| 12 | VINYL | wave | orbit | flicker | Sound waves from stylus, groove rings orbit platter, tube amp flicker |
| 13 | BAND | comet | bounce | flash | Stage pyro comets arc overhead, confetti balls bounce off stage floor, strobe flashes |
| 14 | PARTICLE | vortex | curve | flash | Collider ring spirals inward, decay products curve out, collision flashes |
| 15 | GLOBE | constellation | drift | twinkle | Trade routes connect nodes, weather systems drift, city lights twinkle |
| 16 | FORGE | aurora | lightning | rise | Heat curtains from anvil, spark arcs on hammer strikes, embers rise |
| 17 | OCEAN | ripple | wave | drift | Surface ripples from marine life, deep current waves, plankton drifts |
| 18 | TACTICAL | hologram | flash | linear | Tactical display scans, contacts flash on detection, tracer lines |
| 19 | STEAM | smoke | orbit | rise | Pressure clouds billow, gear mechanisms orbit in place, steam rises |
| 20 | ARCADE | matrix | bounce | flash | Pixel code rains, physics balls bounce off platforms, power-up flashes |
| 21 | BLUEPRINT | hologram | linear | flash | Scan lines reveal annotations, dimension lines extend, callout flashes |
| 22 | APOTHECARY | smoke | chain | fall | Potion vapor curls, ingredient drip chains descend, powder sifts |
| 23 | FUNHOUSE | scatter | bounce | flicker | Prize explosions scatter, balls bounce off bumpers, carnival flicker |
| 24 | METRO | warp | chain | flash | Tunnel perspective converges, linked carriages undulate, signals flash |
| 25 | SAFARI | firefly | drift | sway | Amber insect clusters flock, heat pollen drifts, tall grass sways |
| 26 | HEIST | smoke | bounce | linear | Smoke bombs deploy, ricochets bounce off vault walls, laser beam lines |
| 27 | AQUARIUM | ripple | firefly | rise | Surface ripples from fish, bioluminescent schools flock, bubbles rise |
| 28 | GARDEN | fractal | drift | sway | Vines branch outward, pollen drifts on breeze, blossoms sway |
| 29 | BREW | nebula | rise | shimmer | Hop aroma clouds morph, carbonation bubbles rise, copper shimmer |
| 30 | LIBRARY | constellation | sway | flicker | Knowledge web connects spines, hanging mobiles sway, candlelight flickers |

### Approved 3 — Previously Brainstormed

| # | Mode | Primary | Secondary | Fill | Scene |
|---|------|---------|-----------|------|-------|
| 31 | CASINO | curve | scatter | flash | Cards spin on arcs, jackpot coins scatter, slot machine flashes |
| 32 | CIRCUIT | lightning | pulse | flash | Trace sparks arc between pads, clock signals pulse, solder flashes |
| 33 | TAROT | constellation | shimmer | sway | Celestial lines connect card spread, mystic hue cycling, incense sways |

### Creative 7 — Artistic & Abstract

| # | Mode | Primary | Secondary | Fill | Scene |
|---|------|---------|-----------|------|-------|
| 34 | ORIGAMI | fractal | sway | hover | Crease patterns branch and unfold, forms sway on threads, paper dust hovers |
| 35 | KALEIDOSCOPE | vortex | shimmer | flash | Particles spiral into symmetry, facets cycle prismatic spectrum, jewel flashes |
| 36 | INK | smoke | fall | hover | Sumi-e ink drops bloom in water, tendrils sink, pigment suspends |
| 37 | LAVA_LAMP | smoke | rise | shimmer | Wax blobs deform and merge rising through liquid, glass shimmers |
| 38 | PUPPET | chain | sway | flicker | Marionette strings hang, figures sway with physics, gaslight flickers |
| 39 | GRAFFITI | scatter | chain | flicker | Spray bursts from nozzles, dripping paint chains, streetlight flicker |
| 40 | DREAMSCAPE | nebula | hover | shimmer | Ethereal clouds drift through void, fragments hover within, colors shift |

### Exotic 10 — World Culture & Environments

| # | Mode | Primary | Secondary | Fill | Scene |
|---|------|---------|-----------|------|-------|
| 41 | BAZAAR | vortex | flicker | drift | Spice dust spirals from stalls, oil lamps flicker, incense drifts |
| 42 | DEEP_SEA | nebula | ripple | hover | Bioluminescent clouds in abyssal dark, pressure ripples, particles suspend |
| 43 | JUNGLE | fractal | firefly | fall | Vine systems branch across canopy, insects flock between, leaves fall |
| 44 | VOLCANO | warp | scatter | fall | Eruption streaks from caldera, debris bursts, ash rains |
| 45 | CRYSTAL | fractal | shimmer | flash | Lattice structures grow and fork, prismatic surfaces cycle, facet flashes |
| 46 | MONSOON | matrix | ripple | drift | Dense rain columns pour, puddle ripples at impact, wind drift |
| 47 | LANTERN | comet | flicker | sway | Floating lanterns rise as warm comets, candle flames flicker, paper sways |
| 48 | TUNDRA | aurora | hover | shimmer | Polar lights overhead, ice crystals hang suspended, frost shifts hue |
| 49 | CORAL | fractal | pulse | drift | Reef branches grow and fork, colony breathes expand-contract, spores drift |
| 50 | THUNDERHEAD | nebula | lightning | fall | Cumulonimbus clouds roil, branching lightning splits them, rain falls |

### Hyper-Accurate 10 — Science & Engineering

| # | Mode | Primary | Secondary | Fill | Scene |
|---|------|---------|-----------|------|-------|
| 51 | QUANTUM | nebula | pulse | hover | Probability clouds form and shift, wave function collapse pulses, uncertainty jitter |
| 52 | REACTOR | vortex | lightning | flash | Tokamak plasma spirals, breakout arcs discharge, neutron flashes |
| 53 | SONAR | ripple | pulse | hover | Echolocation pings expand, echo returns pulse inward, deep silence |
| 54 | DNA | chain | orbit | shimmer | Backbone chains undulate helically, base-pair bridges orbit axis, phosphor shimmer |
| 55 | SEISMOGRAPH | wave | pulse | linear | P/S waves propagate, aftershock pulses from epicenters, fault lines |
| 56 | WIND_TUNNEL | warp | curve | hover | Airflow radiates from subject, streamlines curve around surfaces, particles suspend |
| 57 | OSCILLOSCOPE | wave | flash | linear | Signal waveforms scroll, trigger flashes on threshold, grid lines |
| 58 | GLACIER | nebula | shimmer | hover | Ice formations morph slowly, prismatic hue cycling, frozen dust |
| 59 | RADAR | vortex | flash | linear | Sweep arm rotates, contacts flash as arm passes, range ring lines |
| 60 | MRI | hologram | pulse | hover | Scan lines sweep revealing cross-sections, data pulses expose layers, tissue suspends |

### Primary Behavior Distribution

| Primary | Count | Modes |
|---------|-------|-------|
| smoke | 6 | NOIR, STEAM, APOTHECARY, HEIST, INK, LAVA_LAMP |
| nebula | 6 | BREW, DREAMSCAPE, DEEP_SEA, THUNDERHEAD, GLACIER, QUANTUM |
| fractal | 5 | GARDEN, ORIGAMI, JUNGLE, CRYSTAL, CORAL |
| vortex | 5 | PARTICLE, KALEIDOSCOPE, BAZAAR, REACTOR, RADAR |
| aurora | 4 | PLANET, FORGE, TUNDRA, WEATHER |
| comet | 4 | SPACE, DINO, LANTERN, BAND |
| ripple | 4 | CHEM, OCEAN, AQUARIUM, SONAR |
| warp | 4 | AIRPORT, METRO, VOLCANO, WIND_TUNNEL |
| hologram | 3 | TACTICAL, BLUEPRINT, MRI |
| constellation | 3 | GLOBE, LIBRARY, TAROT |
| matrix | 3 | NEURAL, ARCADE, MONSOON |
| wave | 3 | VINYL, SEISMOGRAPH, OSCILLOSCOPE |
| lightning | 2 | ARCANE, CIRCUIT |
| firefly | 2 | BIO, SAFARI |
| scatter | 2 | FUNHOUSE, GRAFFITI |
| chain | 2 | PUPPET, DNA |
| orbit | 1 | MOLECULE |
| curve | 1 | CASINO |

---

## New Modes

### Per-Mode Deliverables

Each new mode requires:

1. **Directory:** `src/modes/<mode>/` (or `src/dashboards/<mode>/`)
2. **Grid component:** `<Mode>Grid.jsx` — layout for the services grid
3. **Card component:** `<Mode>Card.jsx` — individual service card
4. **Detail panel:** `<Mode>DetailPanel.jsx` — expanded view on click
5. **Config:** `<mode>Config.js` — labels, overlays, category mappings, diagram definitions
6. **Scene config:** particle type definitions in the mode's theme config (Primary + Secondary + Fill behaviors)
7. **Theme tiers:** 5 curated color themes in `themeConfig.js`
8. **Registry entry:** 1 entry in `modeRegistry.js`

### Creative Modes (7)

#### ORIGAMI
- **Metaphor:** Paper folding studio. Services are folded sculptures (crane, boat, flower, box, star). Healthy = crisp folds. Offline = crumpled/torn.
- **Card design:** Flat-shaded geometric polygonal shapes suggesting folded paper. Subtle fold-line shadows.
- **Detail panel:** "Unfolding instructions" — step-by-step view with service details at each fold step.
- **Color palette:** Washi paper tones — cream, indigo, vermillion, moss green, gold foil accent.
- **Animation:** fractal + sway + hover

#### KALEIDOSCOPE
- **Metaphor:** Kaleidoscope viewer. Services are jewel-like geometric tiles arranged in radial symmetry. Load = brilliance/saturation of the tile.
- **Card design:** Triangular/hexagonal tiles with mirror-axis symmetry. Colors intensify with load.
- **Detail panel:** "Facet inspection" — zoomed view of a single kaleidoscope segment.
- **Color palette:** Full prismatic spectrum — each category gets a primary hue, tiles shift through it.
- **Animation:** vortex + shimmer + flash

#### INK
- **Metaphor:** Sumi-e ink wash painting. Services are brushstroke characters or seal stamps. Load = ink intensity (light wash = idle, heavy black = max load).
- **Card design:** Calligraphic brush stroke forms on rice paper texture. Varying ink saturation.
- **Detail panel:** "Scroll reading" — vertical scroll layout with service details as brush annotations.
- **Color palette:** Ink wash — black, sumi grey, rice paper white, vermillion seal accent, indigo wash.
- **Animation:** smoke + fall + hover

#### LAVA_LAMP
- **Metaphor:** 1960s lava lamp collection. Services are blobs inside individual lamp enclosures. Load = blob activity (still blob = idle, active splitting/merging = high load).
- **Card design:** Rounded blob shapes in glass tube outlines. Warm glow emanates from active services.
- **Detail panel:** "Lamp closeup" — fullscreen blob animation with overlaid data readouts.
- **Color palette:** Retro psychedelic — orange, magenta, chartreuse, violet, warm amber glass.
- **Animation:** smoke + rise + shimmer

#### PUPPET
- **Metaphor:** Marionette puppet theater. Services are wooden puppet characters hanging from control bars. Load = animation activity (limp = idle, dancing = high load). Offline = cut strings.
- **Card design:** Wooden puppet figures with visible string lines to top of card. Articulated limb positions.
- **Detail panel:** "Backstage" — puppet construction view showing internal components (Docker layers).
- **Color palette:** Theater warm — mahogany wood, burgundy curtain, gold trim, spotlight white, shadow black.
- **Animation:** chain + sway + flicker

#### GRAFFITI
- **Metaphor:** Street art wall. Services are spray-painted tags and murals on brick. Load = paint freshness (fresh wet paint = high load, faded/peeling = idle). Offline = whitewashed/buffed.
- **Card design:** Stylized graffiti letterforms on textured brick background. Drip effects on edges.
- **Detail panel:** "Wall closeup" — zoomed mural view with stencil-style data overlays.
- **Color palette:** Street art neons on dark — hot pink, electric blue, lime green, chrome silver, brick red.
- **Animation:** scatter + chain + flicker

#### DREAMSCAPE
- **Metaphor:** Surreal dreamworld. Services are floating dream objects (clocks, doors, stairs, eyes, clouds). Load = dream intensity (faint = idle, vivid/surreal = high load). Offline = fading away.
- **Card design:** Soft-edged floating objects with impossible perspectives. Slight transparency.
- **Detail panel:** "Dream journal" — handwritten-style notes with service metrics as dream symbols.
- **Color palette:** Ethereal pastels — lavender, soft cyan, rose quartz, pearl white, deep twilight purple.
- **Animation:** nebula + hover + shimmer

### Exotic Modes (10)

#### BAZAAR
- **Metaphor:** Middle Eastern marketplace / souk. Services are market stalls with goods. Load = customer activity (empty stall = idle, bustling = high). Offline = closed shutters.
- **Card design:** Arched doorway stall fronts with hanging goods. Warm lamp glow from within.
- **Detail panel:** "Merchant ledger" — ornate bordered scroll with transaction-style metrics.
- **Color palette:** Souk warm — saffron gold, terracotta, turquoise tile, deep purple textile, brass.
- **Animation:** vortex + flicker + drift

#### DEEP_SEA
- **Metaphor:** Abyssal ocean zone. Services are deep-sea organisms (anglerfish, tube worms, jellyfish, vent shrimp). Load = bioluminescence intensity. Offline = dark/dormant.
- **Card design:** Bioluminescent organism shapes glowing against pure black. Soft light halos.
- **Detail panel:** "Specimen scan" — scientific deep-sea photography style with measurement overlays.
- **Color palette:** Abyssal — bioluminescent cyan, deep ocean black, vent orange, jellyfish purple, midnight blue.
- **Animation:** nebula + ripple + hover

#### JUNGLE
- **Metaphor:** Rainforest canopy. Services are canopy species (orchid, toucan, tree frog, vine, bromeliad). Load = growth vigor. Offline = wilted/dormant.
- **Card design:** Lush tropical forms layered with depth (foreground leaves, mid canopy, distant trees).
- **Detail panel:** "Field guide" — naturalist illustration with species data as field notes.
- **Color palette:** Canopy greens — emerald, lime, dark trunk brown, orchid magenta, sky-peek blue.
- **Animation:** fractal + firefly + fall

#### VOLCANO
- **Metaphor:** Volcanic landscape. Services are geological formations (lava tube, caldera, fumarole, obsidian field, magma chamber). Load = volcanic activity. Offline = extinct/cold.
- **Card design:** Cross-section geological views with glowing magma channels. Heat distortion edges.
- **Detail panel:** "Geological survey" — stratigraphy diagram with service data as rock layer annotations.
- **Color palette:** Volcanic — magma orange, basalt black, obsidian purple, sulfur yellow, ash grey.
- **Animation:** warp + scatter + fall

#### CRYSTAL
- **Metaphor:** Crystal cave / mineral collection. Services are crystal specimens (quartz, amethyst, fluorite, bismuth, opal). Load = energy/luminance within crystal. Offline = dull/opaque.
- **Card design:** Faceted crystal shapes with internal light refraction. Sharp geometric edges.
- **Detail panel:** "Mineralogy card" — specimen identification card with hardness, composition, service data.
- **Color palette:** Crystalline — amethyst purple, quartz clear/white, fluorite green, bismuth rainbow, cave shadow.
- **Animation:** fractal + shimmer + flash

#### MONSOON
- **Metaphor:** Monsoon weather system. Services are weather monitoring stations across a rain-swept landscape. Load = rainfall intensity. Offline = station damaged/offline.
- **Card design:** Weather station instrument clusters with rain streaks across the face. Water droplet effects.
- **Detail panel:** "Storm report" — rainfall charts, wind readings, barometric data styled as service metrics.
- **Color palette:** Monsoon — storm grey, rain blue, lightning white, wet earth brown, overcast purple.
- **Animation:** matrix + ripple + drift

#### LANTERN
- **Metaphor:** Sky lantern festival. Services are paper lanterns floating upward. Load = flame brightness. Offline = extinguished / falling.
- **Card design:** Glowing paper lantern shapes with internal candlelight. Warm soft edges.
- **Detail panel:** "Wish card" — lantern wish writing style with service details as wishes/prayers.
- **Color palette:** Festival warm — lantern gold, fire orange, paper cream, night sky indigo, ember red.
- **Animation:** comet + flicker + sway

#### TUNDRA
- **Metaphor:** Arctic research station. Services are research instruments and survival systems (weather station, radio, generator, ice core drill). Load = power draw. Offline = frozen/buried.
- **Card design:** Frost-rimmed instrument panels with ice crystal formations. Cold breath effect.
- **Detail panel:** "Research log" — expedition notebook style with temperature/wind data as service metrics.
- **Color palette:** Arctic — ice blue, frost white, aurora green, polar night dark blue, snow blind bright.
- **Animation:** aurora + hover + shimmer

#### CORAL
- **Metaphor:** Coral reef ecosystem. Services are reef organisms (brain coral, staghorn, sea fan, anemone, clam). Load = polyp activity / extension. Offline = bleached.
- **Card design:** Organic coral forms with flowing tentacles/polyps. Underwater color filtering.
- **Detail panel:** "Marine survey" — reef health assessment card with bleaching percentage as downtime.
- **Color palette:** Reef — coral pink, sea green, deep blue, anemone purple, sand beige.
- **Animation:** fractal + pulse + drift

#### THUNDERHEAD
- **Metaphor:** Inside a thunderstorm. Services are storm system components (pressure cell, wind shear, precipitation core, updraft, anvil top). Load = storm intensity. Offline = dissipated.
- **Card design:** Cloud formation cross-sections with internal turbulence indicators. Dynamic edge lighting.
- **Detail panel:** "Storm cell analysis" — meteorological cross-section with convection arrows as data flow.
- **Color palette:** Storm — cumulonimbus grey, lightning white, rain blue, hail green tint, sunset orange anvil.
- **Animation:** nebula + lightning + fall

### Hyper-Accurate Modes (10)

#### QUANTUM
- **Metaphor:** Quantum computing / particle physics. Services are quantum states, qubits, or fundamental particles. Load = excitation energy. Offline = decoherence / collapsed.
- **Card design:** Probability cloud visualizations (electron orbital shapes). Uncertainty-blurred edges.
- **Detail panel:** "Measurement" — wave function display with observation-triggered state changes.
- **Color palette:** Quantum — Planck blue, superposition purple, entanglement pink, vacuum black, photon white.
- **Animation:** warp + pulse + hover

#### REACTOR
- **Metaphor:** Nuclear fusion reactor (tokamak). Services are reactor subsystems (plasma containment, magnetic coils, coolant, diagnostics). Load = plasma temperature. Offline = shutdown.
- **Card design:** Technical cross-section schematics with glowing plasma channels. Magnetic field lines.
- **Detail panel:** "Reactor diagnostics" — engineering readout with temperature, pressure, confinement time.
- **Color palette:** Reactor — plasma blue-white, containment silver, warning red, cooling blue, neutron gold.
- **Animation:** vortex + lightning + flash

#### SONAR
- **Metaphor:** Submarine sonar room. Services are sonar contacts and ship systems. Load = signal strength / contact proximity. Offline = lost contact.
- **Card design:** Green-on-black sonar display arcs with contact blips. Sweeping highlight line.
- **Detail panel:** "Contact report" — bearing, range, classification, signal-to-noise as service data.
- **Color palette:** Sonar — phosphor green, deep ocean black, contact amber, alert red, hull grey.
- **Animation:** ripple + pulse + hover

#### DNA
- **Metaphor:** Genetic sequence / molecular biology. Services are genetic components (gene, promoter, exon, intron, ribosome). Load = expression level / transcription rate. Offline = silenced gene.
- **Card design:** DNA base-pair segments with backbone ribbons. Color-coded nucleotides.
- **Detail panel:** "Gene expression" — sequence viewer with codon table and protein output as metrics.
- **Color palette:** Genomic — adenine green, thymine red, cytosine blue, guanine yellow, backbone grey.
- **Animation:** chain + orbit + shimmer

#### SEISMOGRAPH
- **Metaphor:** Earthquake monitoring station. Services are seismographic instruments and monitoring systems. Load = seismic activity level (Richter-scaled). Offline = instrument malfunction.
- **Card design:** Waveform trace readouts on graph paper background. Needle-style indicators.
- **Detail panel:** "Seismic report" — epicenter map, magnitude, depth, P/S wave arrival times.
- **Color palette:** Seismic — trace red, graph paper cream, P-wave blue, S-wave orange, bedrock brown.
- **Animation:** wave + pulse + linear

#### WIND_TUNNEL
- **Metaphor:** Aerodynamic testing facility. Services are test parameters and instruments (pitot tube, pressure sensor, flow visualizer, force balance). Load = wind speed / dynamic pressure. Offline = tunnel idle.
- **Card design:** Streamline flow visualization around test shapes. Color-coded pressure zones.
- **Detail panel:** "Test run data" — Cd, Cl, Reynolds number, pressure distribution plots.
- **Color palette:** Aero — wind blue, high-pressure red, low-pressure blue, model silver, tunnel grey.
- **Animation:** warp + curve + hover

#### OSCILLOSCOPE
- **Metaphor:** Electronics test bench. Services are signal channels on a multi-channel scope. Load = signal amplitude / frequency. Offline = flat line / no signal.
- **Card design:** Waveform traces on dark screen with phosphor glow. Grid markings and trigger indicators.
- **Detail panel:** "Channel analysis" — frequency spectrum, trigger settings, measurement cursors.
- **Color palette:** Oscilloscope — CH1 yellow, CH2 cyan, CH3 magenta, CH4 green, graticule grey.
- **Animation:** wave + flash + linear

#### GLACIER
- **Metaphor:** Glaciological study. Services are glacial features (crevasse, moraine, ice shelf, meltwater, firn layer). Load = flow rate / melt rate. Offline = fully frozen / static.
- **Card design:** Translucent ice cross-sections with internal stratification visible. Blue-white glow.
- **Detail panel:** "Ice core analysis" — layer dating, isotope ratios, trapped air bubbles as service data.
- **Color palette:** Glacial — ancient ice blue, firn white, moraine brown, meltwater cyan, crevasse dark blue.
- **Animation:** nebula + shimmer + hover

#### RADAR
- **Metaphor:** Air traffic / weather radar station. Services are radar contacts and system components. Load = return signal strength. Offline = no return / stealth.
- **Card design:** PPI (plan position indicator) arc segments with contact blips at bearing/range positions.
- **Detail panel:** "Track data" — altitude, speed, heading, IFF status as service metrics.
- **Color palette:** Radar — sweep green, contact bright green, alert red, noise static grey, scope black.
- **Animation:** vortex + flash + linear

#### MRI
- **Metaphor:** Medical imaging scanner. Services are anatomical systems or scan sequences. Load = scan resolution / signal intensity. Offline = artifact / signal void.
- **Card design:** Cross-section slice images with tissue contrast. Scan-line reveal animation on load.
- **Detail panel:** "Diagnostic report" — slice viewer with measurement tools, contrast settings as metrics.
- **Color palette:** MRI — tissue grey, bone white, fluid black, contrast agent bright, T1/T2 blue shift.
- **Animation:** hologram + pulse + hover

---

## New Services (3)

### S1: Syncthing Monitor

**Purpose:** Monitor Syncthing folder sync status, connected devices, bandwidth, and conflict files across SRV-1 and SRV-2.

**Data source:** Syncthing REST API (`http://localhost:8384/rest/`)
- `GET /rest/db/status` — per-folder sync completion percentage
- `GET /rest/system/connections` — connected devices with bandwidth
- `GET /rest/db/need` — files needing sync (conflicts, out of date)
- API key via `X-API-Key` header (stored in `.env`)

**Card display:**
- Overall sync completion percentage (weighted across all folders)
- Connected device count / total device count
- Active bandwidth (up/down)
- Conflict file count (0 = healthy, >0 = warning)

**Detail panel:**
- Per-folder sync status table (name, completion %, state, last sync time)
- Connected devices list (name, address, bandwidth, last seen)
- Conflict file list with paths and timestamps
- Bandwidth sparkline (last 30 minutes)

**Load mapping:**
- 0-60 (EQUILIBRIUM): fully synced, 0 conflicts
- 61-80 (ELEVATED): actively syncing, <5 files remaining
- 81-94 (MINOR_WARNING): many files pending or >0 conflicts
- 95-100 (CRITICAL): device disconnected or sync stalled for >10 minutes

**Polling:** 30-second interval via `useServicePoller`

**Proxy route:** `/api/syncthing/*` → `localhost:8384/rest/*` (nginx)

### S2: Unpackerr

**Purpose:** Monitor extraction status from Unpackerr (post-download unpacking for arr stack).

**Data source:** Unpackerr webhook/log parsing
- Unpackerr doesn't have a REST API — monitor via its log file or webhook output
- Option A: Parse `/config/unpackerr/logs/unpackerr.log` via a small Flask endpoint
- Option B: Configure Unpackerr webhook to POST to flask-backend on extract events
- Recommend Option B: add webhook endpoint at `/api/flask/unpackerr-webhook`

**Card display:**
- Active extractions count
- Queue depth (waiting extractions)
- Last extraction status (success/fail + timestamp)
- Total extractions today (success/fail counts)

**Detail panel:**
- Recent extraction history table (file, source, status, duration, timestamp)
- Error log for failed extractions
- Queue contents

**Load mapping:**
- 0-60: idle, no active extractions
- 61-80: actively extracting
- 81-94: extraction taking longer than expected (>10 min)
- 95-100: extraction failed or stuck

**Backend:** New Flask endpoint to receive and store webhook events, expose via GET

### S3: cAdvisor Deep Metrics

**Purpose:** Surface per-container CPU/memory/network from cAdvisor (already running, already scraped by Prometheus, but no dashboard widget).

**Data source:** cAdvisor API (`http://localhost:8085/api/v1.1/subcontainers/docker`)
- Per-container: CPU usage (cores), memory usage/limit, network rx/tx bytes
- Historical data: last 60 seconds of samples per container

**Card display:**
- Top 5 resource consumers (by CPU or memory, configurable)
- Sparkline charts for each
- Alert indicator when any container exceeds 80% of its `mem_limit`

**Detail panel:**
- Full container resource table (sortable by CPU, memory, network)
- Per-container sparkline charts (CPU, memory, network over last 5 minutes)
- Memory limit utilization bars
- Container restart count (from Docker API, cross-referenced)

**Load mapping:**
- 0-60: all containers under 50% resource utilization
- 61-80: any container at 50-80% of limits
- 81-94: any container at 80-95% of limits
- 95-100: any container exceeding limits or OOM-killed recently

**Polling:** 15-second interval (cAdvisor updates every 10s)

**Proxy route:** `/api/cadvisor/*` → `localhost:8085/api/*` (nginx)

---

## New Tools (3)

### T1: Live Dependency Graph

**Purpose:** Interactive force-directed graph showing service dependencies in real-time, with SSE-driven status coloring.

**Components:**
- `src/tools/DependencyGraphTool.jsx` — main tool component
- Uses HTML5 Canvas (not a library) for rendering, consistent with AnimatedBackground approach

**Data source:**
- Static: `ServiceDependencyGraph.md` parsed into JSON at build time (or hardcoded dependency map in `src/data/dependencyMap.js`)
- Dynamic: SSE `service:status` events color nodes in real-time

**Features:**
- Force-directed layout using velocity Verlet integration (repulsion between all nodes, attraction along edges, centering force)
- Nodes colored by service status (healthy=green, warning=amber, offline=red)
- Click node → highlight upstream/downstream dependency chain
- Offline node → entire dependency chain glows red (cascade visualization)
- Hover → tooltip with service name, status, last update time
- Drag nodes to rearrange
- Zoom/pan support

**Layout algorithm:**
- Repulsion: Coulomb's law between all node pairs
- Attraction: Hooke's law along edges
- Centering: gentle force toward canvas center
- Damping: velocity decay each frame for stability
- Warm start from saved positions (localStorage)

**Integration:** Accessible via command palette or a header icon. Opens as a modal overlay.

### T2: Theme Lab

**Purpose:** In-dashboard theme editor for creating custom color palettes.

**Components:**
- `src/tools/ThemeLabTool.jsx` — main editor
- `src/tools/ThemeLabPreview.jsx` — live preview panel

**Features:**
- HSL color pickers for: background, accent primary, accent secondary, text, border
- Live preview on actual dashboard cards (not a mock — applies theme temporarily)
- Particle density/speed sliders (preview in real-time on AnimatedBackground)
- Preset starting points (load any existing theme as base)
- Save to localStorage as custom theme (appears in ThemeSelector)
- Import/export theme as JSON
- "Randomize" button with harmony rules (complementary, analogous, triadic)

**Data model:**
```js
{
  name: "My Theme",
  id: "custom-<uuid>",
  custom: true,
  colors: {
    bg: "hsl(220, 20%, 8%)",
    accentPrimary: "hsl(180, 80%, 50%)",
    accentSecondary: "hsl(280, 60%, 60%)",
    text: "hsl(0, 0%, 90%)",
    border: "hsla(0, 0%, 100%, 0.1)"
  },
  particles: {
    density: 0.7,    // 0-1 multiplier on particle count
    speed: 1.0,      // 0-2 multiplier on particle speeds
    glow: 0.8        // 0-1 multiplier on glow intensity
  }
}
```

**Storage:** `localStorage.setItem('customThemes', JSON.stringify([...]))`

**Integration:** Accessible via ThemeSelector "+" button or command palette.

### T3: Uptime SLA Dashboard

**Purpose:** Historical uptime percentages over 24h/7d/30d from Uptime Kuma, with MTTR calculations.

**Data source:** Uptime Kuma API (`http://10.0.0.155:3001/api/`)
- `GET /api/status-page/heartbeat/<monitorId>` — heartbeat history
- `GET /api/monitor/<id>` — monitor configuration and uptime percentage

**Components:**
- `src/tools/SlaDbTool.jsx` — main dashboard
- `src/tools/SlaTimelineChart.jsx` — incident timeline visualization

**Features:**
- Per-service uptime percentage bars: 24h, 7d, 30d
- "Three nines" (99.9%) compliance indicator per service
- Incident timeline: visual bar chart of downtime events with duration
- MTTR (Mean Time To Recovery) calculation per service
- Flaky service identification: services with >3 incidents in 7 days
- Exportable report (copy as markdown table)
- Sort by: worst uptime, most incidents, longest MTTR

**Integration:** Accessible via command palette or a "SLA" icon in the header status area.

---

## New Bots (3)

All bots integrate into the existing `BOT_REGISTRY` array in `src/data/botRegistry.js` and render via the `BotDetailPanel` component.

### B1: The Librarian (Audiobook/eBook Bot)

**Registry entry:**
```js
{
  name: 'The Librarian',
  emoji: '📚',
  persona: 'A well-read curator who recommends audiobooks and ebooks based on your library',
  group: 'E',
  theme: 'HALOGEN' // or appropriate theme tier
}
```

**Capabilities:**
- Cross-references Audiobookshelf library (API: `http://localhost:13378/api/`) with Kavita library
- Discovers gaps in series you've started (next unowned book)
- "If you liked X" chains based on genre, author, narrator
- Surfaces high-rated books not in your library (Goodreads/OpenLibrary cross-reference)
- Narrator quality signals from review aggregation

**Chat persona:** Speaks like a knowledgeable librarian — measured, well-sourced, occasionally quotes from the books being recommended.

### B2: Docuphile (Documentary Specialist)

**Registry entry:**
```js
{
  name: 'Docuphile',
  emoji: '🎬',
  persona: 'A documentary connoisseur who discovers non-fiction gems across all categories',
  group: 'E',
  theme: 'HALOGEN'
}
```

**Capabilities:**
- Scans Radarr for missing high-rated documentaries by category: nature, true crime, science, history, music, sports
- Doc-specific quality signals: Rotten Tomatoes documentary score, IMDb documentary tags, festival selections (Sundance, TIFF, Sheffield Doc/Fest)
- Category balance: ensures recommendations span categories, not just the most popular genre
- Cross-references with Sonarr for docuseries

**Chat persona:** Passionate about non-fiction storytelling — references specific scenes, directors, and cinematographers.

### B3: The Curator (Seasonal/Contextual Bot)

**Registry entry:**
```js
{
  name: 'The Curator',
  emoji: '🎭',
  persona: 'A time-aware recommender whose picks change with the season, weather, and cultural calendar',
  group: 'E',
  theme: 'HALOGEN'
}
```

**Capabilities:**
- Time-aware recommendations: horror in October, holiday films in December, summer blockbusters in June
- Weather-aware: rainy-day comfort picks when weather API reports storms, sunny-day outdoor adventure films
- Awards season: Oscar/Emmy contenders during nomination/ceremony windows
- Anniversary picks: "This film turns 25 this month"
- Cultural calendar: Pride month, Black History Month, Asian Pacific Heritage Month curated lists

**Chat persona:** Enthusiastic cultural curator — explains why this moment is perfect for each recommendation.

---

## Implementation Strategy

### Phasing

Given the scope (60 modes, 30 behaviors, 9 additional features), implementation should be phased:

**Phase 1: Animation Engine (behaviors 1-21)**
- Implement all 21 new behaviors in AnimatedBackground.jsx
- Add tier scaling, FPS-aware downgrade for each
- Unit test each behavior in isolation
- Performance benchmark: maintain 30fps with 3 simultaneous behaviors

**Phase 2: Existing Mode Upgrades (modes 1-33)**
- Update sceneConfig for all 30 existing modes + 3 approved with new Primary+Secondary+Fill profiles
- No new Grid/Card/Panel components needed — only particle config changes
- Smoketest each mode visually

**Phase 3: New Mode Batch 1 — Creative (modes 34-40)**
- 7 modes: ORIGAMI, KALEIDOSCOPE, INK, LAVA_LAMP, PUPPET, GRAFFITI, DREAMSCAPE
- Each needs: Grid + Card + DetailPanel + config + 5 themes + registry entry

**Phase 4: New Mode Batch 2 — Exotic (modes 41-50)**
- 10 modes: BAZAAR, DEEP_SEA, JUNGLE, VOLCANO, CRYSTAL, MONSOON, LANTERN, TUNDRA, CORAL, THUNDERHEAD

**Phase 5: New Mode Batch 3 — Hyper-Accurate (modes 51-60)**
- 10 modes: QUANTUM, REACTOR, SONAR, DNA, SEISMOGRAPH, WIND_TUNNEL, OSCILLOSCOPE, GLACIER, RADAR, MRI

**Phase 6: Services + Tools + Bots**
- Syncthing Monitor, Unpackerr, cAdvisor widgets
- Dependency Graph, Theme Lab, SLA Dashboard tools
- Librarian, Docuphile, Curator bots

### Performance Budget

- AnimatedBackground must maintain ≥30fps with Primary + Secondary + Fill behaviors active simultaneously
- New behaviors must respect existing tier system: invisible at tier 1-2, full at tier 5
- Spatial hashing for constellation (O(n) instead of O(n²))
- Branch segment cap for fractal (200 max)
- Bolt segment cap for lightning (50 max per discharge)
- Total particle cap remains MAX_PARTICLES=1000 across all behavior layers

### File Impact Summary

| Area | Files Modified | Files Created |
|------|---------------|---------------|
| Animation engine | 1 (AnimatedBackground.jsx) | 0 |
| Existing mode configs | 30 (one per mode theme file) | 0 |
| New modes | 0 | 27 × 5 = 135 (Grid, Card, Panel, config, manifest) |
| Mode registry | 1 (modeRegistry.js) | 0 |
| Theme config | 1 (themeConfig.js) | 0 |
| Services | 2 (nginx.conf.template, nginx.conf) | 3 widgets + 3 manifests = 6 |
| Tools | 0 | ~8 (3 tools + subcomponents) |
| Bots | 1 (botRegistry.js) | 0 |
| Backend | 1 (server.py) | 0 |
| **Total** | ~36 | ~149 |
