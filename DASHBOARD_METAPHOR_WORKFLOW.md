# Dashboard Metaphor & Theme Expansion Workflow

Reference guide for adding new metaphor modes and color themes to the Homepage-Claude dashboard.

> **Current state:** 15 metaphor modes · 12 color themes

---

## Adding a New Color Theme

**1 file to edit: `src/themes/themeConfig.js`**

Add one entry inside the `THEMES` object:

```js
MY_THEME: {
  id: 'MY_THEME',
  name: 'Display Name',        // shown in CHEM mode
  spaceName: 'Alt Name',       // shown in all non-CHEM modes
  bgBase: '#000000',
  dotGridColor: 'rgba(r,g,b,0.04)',
  accent: '#RRGGBB',
  tooltip: 'Short description',
  cat: {
    ALKALI:     { bg: 'rgba(r,g,b,0.08)', border: '#HEX', text: '#HEX', glow: 'rgba(r,g,b,0.40)' },
    ALKALINE:   { ... },
    TRANSITION: { ... },
    HALOGEN:    { ... },
    NOBLE:      { ... },
    LANTHANIDE: { ... },
    POST:       { ... },
    METALLOID:  { ... },
    NONMETAL:   { ... },
    ACTINIDE:   { ... },
    PNICTOGEN:  { ... },
    CHALCOGEN:  { ... },
  },
},
```

**Rules:**
- `text` contrast ratio ≥ 4.5:1 against `bgBase` (WCAG AA)
- Nothing else to change — `ThemeSelector` and auto-cycle auto-detect via `Object.keys(THEMES)`

---

## Adding a New Metaphor Mode

### Step 1 — Create `src/dashboards/<name>/<name>Config.js`

```js
export const <NAME>_LABELS = {
  LANTHANIDE: 'Label',  ACTINIDE: 'Label',   TRANSITION: 'Label',
  NOBLE: 'Label',       CHALCOGEN: 'Label',  METALLOID: 'Label',
  NONMETAL: 'Label',    ALKALI: 'Label',     ALKALINE: 'Label',
  HALOGEN: 'Label',     POST: 'Label',       PNICTOGEN: 'Label',
};

export const <NAME>_OVERLAY = {
  plex:              { /* mode-specific fields */ },
  overseerr:         { ... },
  tautulli:          { ... },
  radarr:            { ... },
  sonarr:            { ... },
  lidarr:            { ... },
  tunarr:            { ... },
  qbittorrent:       { ... },
  sabnzbd:           { ... },
  prowlarr:          { ... },
  cloudflared:       { ... },
  notifiarr:         { ... },
  flaresolverr:      { ... },
  protonvpn:         { ... },
  musicbrainz:       { ... },
  'port-updater':    { ... },
  'musicbrainz-local': { ... },
  bazarr:            { ... },
};

export const get<Name>StatusTier = (level, getStatusTierFn) => {
  const base = getStatusTierFn(level);
  const labels = ['STATUS_0', 'STATUS_1', 'STATUS_2', 'STATUS_3'];
  return { ...base, label: labels[base.tier] ?? base.label };
};
```

### Step 2 — Create `<Name>Card.jsx`

Pick a center visual style:

| Style | Center element | Ring/orbit |
|-------|---------------|------------|
| Like SPACE | Radial gradient circle | `ElectronOrbit` component |
| Like NEURAL | Hexagon via `clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)` | Framer Motion pulsing ring |
| Like ARCANE | Large glyph (`fontFamily: 'serif'`, `textShadow` glow) | Rotated diamond div (45°, opacity 0.15) |
| Like BIO | Double-ring (24px outer border + 12px inner fill) | Reuse `ElectronOrbit` |

Key pattern — read theme without subscribing:
```js
const cat = activeCATRef.current[element.cat] ?? activeCATRef.current.TRANSITION;
```

### Step 3 — Create `<Name>Grid.jsx`

```js
import { ALL_ELEMENTS } from '../sharedGridData.js';  // ← always import from here
import <Name>Card from './<Name>Card.jsx';
```

- Ghost cells for empty positions (dim dot, opacity 0.04)
- Sector placeholder for f-block rows (row 6 col 3 and row 7 col 3)
- Row 8 spacer label: mode-specific text (e.g. `◆ SHADOW CLUSTER ◆`)
- Same CSS grid: `repeat(18, 72px)` × 10 rows, `gap: 2px`

### Step 4 — Create `<Name>DetailPanel.jsx`

Copy `StarDetailPanel.jsx` as a base. Change:
- `key` prop on `motion.div` → unique string (e.g. `"name-detail-panel"`)
- Left section header label
- Status states label string
- Import the mode's overlay/labels/statusTier function
- `aria-label` on close button

### Step 5 — Update `src/components/DashboardModeToggle.jsx`

Add to the `MODES` array (insert at desired cycle position):
```js
{ id: 'MYMODE', icon: '⬡', label: 'MYMODE' },
```

### Step 6 — Update `App.jsx` (6 targeted edits, always last)

```js
// 1. Imports (top of file, after existing dashboard imports)
import MyGrid from './src/dashboards/mymode/MyGrid.jsx';
import MyDetailPanel from './src/dashboards/mymode/MyDetailPanel.jsx';
import { MYMODE_LABELS } from './src/dashboards/mymode/mymodeConfig.js';

// 2. useState — add new ID to valid modes array
const stored = localStorage.getItem('jenkins-media-dashboard-mode');
return ['CHEM', 'SPACE', 'NEURAL', 'ARCANE', 'BIO', 'MOLECULE', 'PLANET', 'WEATHER',
        'AIRPORT', 'DINO', 'NOIR', 'VINYL', 'BAND', 'PARTICLE', 'GLOBE', 'MYMODE'].includes(stored) ? stored : 'CHEM';

// 3. Grid render IIFE — add one branch
if (dashboardMode === 'MYMODE') return <MyGrid statsMap={statsMap} elementRegistry={ELEMENT_REGISTRY} onElementClick={handleElementClick} />;

// 4. Detail panel — add one && conditional
{dashboardMode === 'MYMODE' && <MyDetailPanel element={selectedElement} stats={selectedStats} onClose={handleClosePanel} getStatusTierFn={getStatusTier} />}

// 5. Legend map — add entry
const LEGEND_MAP = { ..., MYMODE: MYMODE_LABELS };

// 6. TICKER_LABELS + LOG_TITLES maps — add entries
MYMODE: { films: ['LABEL', 'Sublabel'], series: ['LABEL', 'Sublabel'], music: ['LABEL', 'Sublabel'] },
LOG_TITLES['MYMODE'] = 'LOG_TITLE ◆ Subtitle';
```

---

## Audit Pipeline

After implementation, run **5 agents in parallel**, then synthesize:

```
code-simplifier + ethical-hacker-pentester + security-reviewer + tech-lead + ux-reviewer
        ↓
   audit-synthesizer
        ↓
  Lead Engineer QC → user approval → deploy
```

---

## Verification

```bash
npm run build                          # zero errors required
docker compose up -d --build homepage  # deploy
```

Checklist:
- [ ] All modes cycle correctly through all 15+ modes
- [ ] Clicking a card in each new mode opens detail panel with correct labels
- [ ] All 12+ color themes apply visually
- [ ] Auto-cycle timer rotates through all themes
- [ ] Page reload preserves mode and theme from localStorage
- [ ] CHEM mode is unchanged

---

## Reference: Service IDs (18 services)

```
plex, overseerr, tautulli, radarr, sonarr, lidarr, tunarr,
qbittorrent, sabnzbd, prowlarr, cloudflared, notifiarr,
flaresolverr, protonvpn, musicbrainz, port-updater,
musicbrainz-local, bazarr
```

## Reference: Category keys (12)

```
ALKALI, ALKALINE, TRANSITION, HALOGEN, NOBLE, LANTHANIDE,
POST, METALLOID, NONMETAL, ACTINIDE, PNICTOGEN, CHALCOGEN
```
