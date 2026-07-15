# Spectrum Reach Opportunity Lab — Build Handoff

**Purpose:** This document is the single source of truth for any coding agent (Claude Code, Codex, Sol, or equivalent) tasked with building the Opportunity Lab prototype. It describes the existing codebase architecture, the target product, the build sequence, and every constraint that matters.

**Timeline:** Approximately 10 days. The deliverable is a leave-behind interactive dashboard that executives will explore independently after the presentation.

**Quality bar:** This must look and behave like a real product, not a hackathon demo. Executives will click through it alone in their offices. Every dead end, placeholder, or template-looking UI kills credibility.

---

## Part 1: Existing Codebase Architecture

The current project is a **single-page client-side choropleth map app** built as one HTML file. Below is the complete technical audit of what exists and must be preserved.

### 1.1 Tech Stack

| Component | Technology |
|---|---|
| Map rendering | MapLibre GL JS |
| Filter sliders | noUiSlider |
| Data format | Embedded GeoJSON (inline in HTML) |
| Hosting | Local file / static serve |
| Backend | None — fully client-side |
| Framework | None — vanilla JS |

### 1.2 Data Model (Must Preserve)

Three core data structures drive the app:

**`GEO.sr`** — Spectrum Reach zone GeoJSON
- Features with properties: `code`, `name`, `zips`, `n_zips`
- Demographic properties follow the naming pattern `demo_` + `metricKey`
- Example: selecting `median_income` in the dropdown reads `demo_median_income` from the feature
- This naming convention is load-bearing — the metric dropdown, legend, tooltip, detail panel, and color ramp all depend on it

**`GEO.comp`** — Competitor polygon GeoJSON
- Each feature has: `provider`, `name`, `color`, and ZIP lists
- Used for overlap logic (not polygon intersection — see Section 1.6)

**Metric config** — Array of metric definitions
- Each entry: `[key, displayLabel, formatType]`
- Example: `["median_income", "Median income", "money"]`
- Drives: dropdown labels, legend labels, tooltip formatting, detail panel rows, and color ramp computation

### 1.3 Rendering Logic

The map creates two GeoJSON sources: `"sr"` and `"comp"`, then adds these layers:

| Layer ID | Purpose |
|---|---|
| `sr-fill` | Main choropleth fill for SR zones |
| `sr-line` | Subtle base outline |
| `sr-line-hl` | Hover/selection highlight outline |
| `{provider}-fill` | Competitor fill (one per provider, hidden by default) |
| `{provider}-line` | Competitor outline (one per provider, hidden by default) |

**Color computation method** (important — do not change the approach without reason):
1. Find min/max of the selected metric across all SR zones using `metricStats(metric)`
2. Normalize each zone's value to 0–1
3. Convert normalized value through a **blue color ramp** function
4. Generate a MapLibre `"match"` expression keyed on zone `code`
5. Apply with `map.setPaintProperty("sr-fill", "fill-color", colorExpr(curMetric))`

The map is **not** using raw property interpolation. It precomputes a color for each zone and applies via a match expression. This is a deliberate design choice. For the prototype scale this works fine. A future rebuild could switch to `interpolate` expressions for better scalability, but do not change this for the demo build.

### 1.4 Interaction / State Logic

Feature IDs are assigned manually to both SR and competitor features before rendering. SR zones get sequential IDs; competitors start at 1000. This is required for MapLibre's feature-state-driven interactivity.

**Three state flags on SR features:**

| Flag | Behavior |
|---|---|
| `hover` | Draws dark outline on `mousemove` |
| `selected` | Draws gold outline, opens detail panel on click |
| `dim` | Lowers opacity for zones outside active filter ranges |

- Hover updates on `mousemove`, clears on `mouseleave`
- Click selects a zone; clicking blank map deselects
- Tooltip content always reflects the currently selected metric

### 1.5 Filtering Logic

Filters are range sliders (noUiSlider) for a subset of metrics.

**How filtering works:**
1. Each slider writes its current `[min, max]` into `filterState[metric]`
2. `applyFilters()` checks every SR feature against every active filter
3. Non-matching zones get `feature-state.dim = true`
4. The "X of Y zones" counter updates

**Key design choice:** Zones are **never removed** from the map. They remain visible but faded via opacity changes in `sr-fill` and `sr-line`. This is intentional — preserve it.

### 1.6 Competitor Logic

Providers are config-driven with: `label`, `color`, `subtitle`, and optional `wide: true` for DMA-wide providers (DirecTV Stream, Dish Network).

- Toggling a checkbox switches visibility of that provider's prebuilt fill/line layers
- Wide providers get lower-opacity fill and dashed outlines
- The detail panel's "competitor footprints here" logic is **not polygon intersection** — it compares the selected SR zone's ZIP list to each competitor zone's ZIP list and reports overlap counts
- DMA-wide providers are always included in the overlap display

### 1.7 UI Components in Current Build

- Metric dropdown (top of left panel)
- Color legend with min/mid/max labels
- Competitor footprint checkbox list with color indicators
- Range filter sliders with live value labels
- "X of Y zones" counter
- "Reset filters" button
- Right-side detail panel (appears on zone click) showing:
  - Zone name and ZIP count
  - All demographic values for selected zone
  - Competitor footprints present
  - Internal metrics section (currently showing "RESERVED" placeholders)
- Hover tooltip showing zone name + current metric value
- Mobile control toggle

### 1.8 UI Dependencies

| Library | Purpose |
|---|---|
| MapLibre GL JS | Map rendering, layers, expressions, interaction |
| noUiSlider | Range filter sliders |
| Vanilla JS | All application logic |
| CSS | All styling (inline in HTML) |

### 1.9 Current Layout

```
┌────────────────────────────────────────────────────────────┐
│ SPECTRUM REACH header / Cleveland-Akron DMA                │
├────────────────┬────────────────────────┬──────────────────┤
│ Left panel:    │                        │ Right panel:     │
│ - Metric       │                        │ - Zone name      │
│   dropdown     │                        │ - Demographics   │
│ - Color legend │       MapLibre         │ - Competitor     │
│ - Competitor   │       choropleth       │   footprints     │
│   checkboxes   │                        │ - Internal       │
│ - Filter       │                        │   metrics        │
│   sliders      │                        │   (RESERVED)     │
│ - Zone counter │                        │                  │
│ - Reset button │                        │                  │
└────────────────┴────────────────────────┴──────────────────┘
```

### 1.10 What to Preserve vs. Extend

**Preserve (do not break or replace):**
- MapLibre map instance and tile loading
- GeoJSON sources and layer structure
- Zone click/hover/select behavior
- Feature-state interaction model
- Metric dropdown → color ramp pipeline
- Filter slider → dim logic
- Competitor toggle → layer visibility
- Detail panel population on zone select
- The embedded GeoJSON data (SR zones and competitors)

**Extend (add around the existing map):**
- Product shell (landing page, navigation, mode switching)
- Client Growth Studio wrapper
- Market Growth Studio wrapper
- Opportunity scoring overlay
- Simulation engine and animation
- Strategy selection UI
- Results comparison view
- Architect handoff modal
- Guided executive tour
- Design system upgrade (colors, typography, spacing)
- Mobile bottom sheet

**Replace only if necessary:**
- The per-feature `match` expression could become `interpolate` but only if zone count causes performance issues
- noUiSlider can be replaced with a styled equivalent if the design system requires it
- The monolithic HTML can be split into modules if using a bundler, but keep a single-file fallback for offline safety

---

## Part 2: Target Product — Spectrum Reach Opportunity Lab

### 2.1 Product Concept

**One intelligence layer, two experiences:**

1. **Client Growth Studio** (external-facing) — helps an advertiser understand campaign opportunity, simulate strategies, and prepare an Architect handoff
2. **Market Growth Studio** (internal-facing) — helps Spectrum Reach sellers find new business, grow accounts, detect retention risk, and prioritize categories

**Core workflow:**
```
Identify the opportunity →
Explain why it matters →
Simulate strategies →
Show projected outcomes →
Recommend a plan →
Hand off to Architect
```

**Positioning:** This is NOT a replacement for Architect. It is the upstream intelligence and scenario-planning layer. Architect remains the campaign activation destination.

### 2.2 Landing Page

URL opens to a shared landing page with:

**Header:** Spectrum Reach Opportunity Lab
**Subheading:** See the opportunity. Simulate the strategy. Activate the plan.

**Three entry cards:**

| Card | Description |
|---|---|
| Client Growth Studio | Improve an advertiser's campaign by finding geographic, audience, media, and conversion opportunities |
| Market Growth Studio | Find, win, protect, and grow local business using shared market intelligence |
| Guided Executive Tour | Experience the complete concept through a controlled three-minute walkthrough |

The guided tour is critical — executives scanning the QR code need to understand the product without a presenter.

### 2.3 Client Growth Studio

**Demo advertiser:** Lakefront Automotive Group (fictional)

| Attribute | Value |
|---|---|
| Category | Automotive |
| Objective | Qualified lead growth |
| Annual budget | $75,000 |
| Current media | Television + Streaming |
| Geographic footprint | 14 ZIP-based zones |
| Campaign effectiveness | 68/100 |
| Qualified reach | 186,000 |
| Effective frequency | 3.1 |
| Modeled leads | 940 |
| Cost per lead | $79.79 |

**User workflow:**
1. Select advertiser → view current footprint on map
2. Inspect ZIP-level opportunity scores
3. Review strategy recommendations (4 strategy cards)
4. Select strategies to test
5. Run simulation (animated, 2.5–4 seconds)
6. Compare current vs. simulated outcomes
7. Expand explanation drawer
8. Review recommended plan
9. Continue in Architect (handoff modal)

**Four strategy cards:**

| Strategy | Primary Effect | Trade-off |
|---|---|---|
| Increase Search Support | Higher conversion, intent capture | Higher cost, minimal reach impact |
| Expand Streaming Reach | Increased reach, cross-screen | Possible frequency dilution |
| Expand Geography | Larger addressable market | Lower average fit if too broad |
| Promote Higher-Value Services | Higher value per conversion | Narrower audience |

**Simulated result example:**

| Metric | Current | Simulated |
|---|---:|---:|
| Campaign effectiveness | 68 | 84 |
| Qualified reach | 186,000 | 214,800 |
| Effective frequency | 3.1 | 3.5 |
| Modeled leads | 940 | 1,045–1,095 |
| Cost per lead | $79.79 | $70–$74 |
| Priority ZIP clusters | 4 | 7 |

**Required label on all results:** "Illustrative modeled results using synthetic demonstration data. Not a production forecast."

**Explanation drawer** — deterministic template-generated text explaining why the recommendation was made. Example: "Streaming expansion closes underexposed audience gaps in three high-fit ZIP clusters. Search support captures additional high-intent activity after campaign exposure."

**Architect handoff modal** — shows recommended plan summary (objective, audience, priority ZIPs, media mix, budget range, measurement goal) with a "Continue in Architect →" button. Does not claim a live integration exists.

### 2.4 Market Growth Studio

**Mode selector tabs:**
```
[ New Business ] [ Account Growth ] [ Retention Risk ] [ Category Opportunity ]
```

Each mode changes: score weighting, map coloring, detail panel content, ranked list, recommended actions, and available simulations.

**New Business mode:**
- Score: business concentration, category growth, spending potential, low SR penetration, audience fit, competitive pressure
- Shows ranked ZIPs with fictional prospect names
- Example: ZIP 44122, New Business Opportunity 89/100, 43 high-potential businesses

**Account Growth mode:**
- Example: Greenline Family Dental, Growth Opportunity 81/100
- Shows current state and recommended expansion strategies

**Retention Risk mode:**
- Example: Harbor Home Services, Risk: High
- Shows risk signals (spend down 18%, reach declining, competitor activity increasing)
- Compare save strategies via simulation

**Category Opportunity mode:**
- Recolors map by category-specific opportunity
- Categories: Automotive, Healthcare, Home Services, Legal, Restaurants, Retail, Financial Services, Recruitment

### 2.5 Opportunity Scoring

Scores must be: explainable, shown as component breakdowns, accompanied by confidence indicators, and clearly labeled as synthetic.

**Example score display:**

```
Opportunity Score: 84/100 — High Priority

Audience potential        22/25
Reach gap                 18/20
Search opportunity        12/15
Geographic potential      13/15
Category potential        11/15
Competitive conditions     8/10

Confidence: Moderate
Top driver: Audience potential
Top limiter: Competitive conditions
```

### 2.6 Simulation Engine

**Prototype simulation rules:**
- Deterministic — same inputs produce same outputs every time
- No live LLM calls, no real AI, no uncontrolled randomness
- Uses: baseline values + strategy effect definitions + controlled combinations
- Output as ranges, not false-precision single numbers
- Template-generated explanations

**Simulation theater (animation sequence on "Run Simulation"):**
1. Lock/dim controls
2. Pulse selected ZIPs on map
3. Show staged status messages (Analyzing audience... Testing strategies... Modeling response... Estimating impact... Generating recommendation)
4. Animate map from current to projected coloring
5. Count score upward
6. Reveal result cards
7. Open recommended action

Target duration: 2.5–4 seconds. Fast but theatrical.

### 2.7 Guided Executive Tour

Step-by-step walkthrough with next/back controls:

1. Product choice — explain two experiences
2. Client opportunity — show Lakefront Automotive footprint
3. ZIP insight — highlight one high-opportunity cluster
4. Strategy selection — select streaming + search
5. Simulation — run animation, show results
6. Architect handoff — show recommended plan
7. Internal opportunity — switch to Market Growth Studio
8. Retention risk — show Harbor Home Services save strategies
9. Closing vision — "One intelligence layer supports advertisers, sellers, strategists, and leadership"

Must work without the user entering any text. Auto-advances map and panel state.

---

## Part 3: Design System

### 3.1 Visual Tone

- Executive, modern, analytical, approachable
- Spectrum Reach brand-aligned
- Not overly futuristic, not visually dense
- Must look like a shipped product, not a student project

### 3.2 Color Palette

| Role | Color | Usage |
|---|---|---|
| Background | White / soft gray (#F8FAFC) | Application background |
| Panel dark | Navy (#0F172A) | Side drawers, dark panels |
| Primary action | Spectrum blue (#0066CC or nearest brand) | Buttons, active states, links |
| Opportunity | Cyan/teal (#0EA5E9) | Opportunity indicators |
| Selected zone | Gold (#F59E0B) | Selected ZIP highlight |
| Risk/warning | Red (#EF4444) | Risk indicators, sparingly |
| Score high | Green (#10B981) | High scores |
| Score low | Red (#EF4444) | Low scores |
| Text primary | #0F172A | Headings |
| Text secondary | #64748B | Body, labels |

### 3.3 Typography

- Modern sans-serif (Inter, or system font stack)
- Large score numerals (32–48px for primary scores)
- Strong section labels
- Tabular numerals for data
- Minimal all-caps (only compact metadata labels)

### 3.4 Layout — Desktop

```
┌──────────────────────────────────────────────────────────────┐
│ Logo / Product Name / Mode Nav / Scenario / Tour / Reset     │
├────────────────┬──────────────────────────┬──────────────────┤
│ Filters,       │                          │ Selected ZIP,    │
│ ranked list,   │           Map            │ account, score,  │
│ objectives     │                          │ recommendations  │
└────────────────┴──────────────────────────┴──────────────────┘
```

### 3.5 Layout — Mobile

```
┌──────────────────────────────┐
│ Mode / Objective / Reset     │
├──────────────────────────────┤
│                              │
│             Map              │
│                              │
├──────────────────────────────┤
│ Swipe-up bottom sheet        │
└──────────────────────────────┘
```

---

## Part 4: Build Sequence

### Phase 1 — Foundation (Days 1–2)

1. Set up project structure (Vite + vanilla JS or lightweight framework)
2. Extract the existing HTML into modular files:
   - Separate GeoJSON data into `/data/` directory
   - Separate CSS into stylesheets
   - Separate JS into logical modules (map.js, filters.js, competitors.js, detail-panel.js)
3. Verify map still works identically after extraction
4. Add landing page
5. Add top navigation bar with mode switching
6. Add design tokens (colors, typography, spacing)
7. Add persistent "Synthetic Demo Data" label
8. Add reset behavior

**Gate:** Map loads, zones render, click/hover/filter all work. Landing page navigates to map view.

### Phase 2 — Client Growth Studio (Days 3–4)

1. Add Lakefront Automotive demo data
2. Add campaign footprint overlay (highlight 14 zones)
3. Add opportunity score computation and display
4. Add score breakdown panel
5. Add four strategy cards
6. Add strategy selection interaction
7. Add current vs. simulated metric comparison
8. Add explanation drawer with template text
9. Add Architect handoff modal

**Gate:** Complete client journey works end to end. Can select advertiser, see footprint, pick strategies, see results, reach Architect handoff.

### Phase 3 — Simulation Engine (Day 5)

1. Build deterministic simulation calculator
2. Build simulation animation sequence
3. Add map transition (current → projected coloring)
4. Add score count-up animation
5. Add result card reveal animation
6. Add range displays (not single numbers)
7. Add confidence labels

**Gate:** Clicking "Run Simulation" produces a polished 3-second animated sequence ending in credible results.

### Phase 4 — Market Growth Studio (Days 6–7)

1. Add internal mode selector tabs
2. Add New Business mode with ranked ZIPs and fictional prospects
3. Add Account Growth mode with Greenline Family Dental
4. Add Retention Risk mode with Harbor Home Services
5. Add Category Opportunity mode with map recoloring
6. Add internal-only scoring methodology
7. Ensure internal data never leaks to client view

**Gate:** All four internal modes show meaningful content. Mode switching works cleanly.

### Phase 5 — Guided Tour + Polish (Days 8–9)

1. Build guided tour overlay system
2. Implement all 9 tour steps with auto-advancing state
3. Add mobile bottom sheet
4. Test responsive layout
5. Cross-browser test (Chrome, Safari, Edge)
6. Fix overflow, dead ends, placeholder text
7. Polish transitions and timing
8. Generate QR code for hosted URL

**Gate:** Tour completes without dead ends. Mobile layout is usable. No console errors.

### Phase 6 — Stabilization + Deployment (Day 10)

1. Deploy to static hosting (Vercel, GitHub Pages, or Cloudflare)
2. Generate stable short URL for QR code
3. Create offline backup (ZIP of entire built app)
4. Record backup video walkthrough
5. Freeze the build — no new features
6. Rehearse demo flow

**Gate:** URL works on phone over cellular. Offline backup works. Demo is rehearsed.

---

## Part 5: Operating Rules for Build Agents

1. **Inspect before editing.** Read the existing code before changing anything.
2. **Preserve the map.** Do not replace MapLibre, do not change the GeoJSON structure, do not break click/hover/filter behavior.
3. **Work incrementally.** Small testable changes. One stable build at all times.
4. **Synthetic data only.** All advertiser names, prospect names, metrics, and scores are fictional. Label them.
5. **No live AI.** No LLM API calls, no external APIs, no real-time data fetching.
6. **No secrets.** No API keys in frontend code.
7. **Run after every change.** Open in browser, check console, verify map renders.
8. **Test both layouts.** Desktop three-column and mobile bottom sheet.
9. **Summarize changes.** After each task, list every file modified and what changed.
10. **Do not add scope.** Build only what is specified in this document. No extra features.

---

## Part 6: Acceptance Criteria

### Functional
- [ ] App loads without console errors
- [ ] Map renders all Cleveland-Akron zones
- [ ] ZIP click shows score + detail panel
- [ ] Mode switching (Client/Internal) works
- [ ] Client journey: advertiser → footprint → strategies → simulation → results → Architect
- [ ] At least 3 internal modes show content
- [ ] Simulation produces consistent results for same inputs
- [ ] Reset returns to known starting state
- [ ] Guided tour completes without dead ends
- [ ] QR URL works on mobile
- [ ] Offline backup works

### Visual
- [ ] Looks like a real product, not a hackathon project
- [ ] Opportunity score is immediately visible and large
- [ ] Typography is readable from presentation distance
- [ ] Current vs. simulated states are easy to compare
- [ ] Simulation animation runs 2.5–4 seconds
- [ ] No unfinished placeholders visible during main flow
- [ ] Mobile uses bottom sheet, not compressed panels

### Trust
- [ ] All data labeled as synthetic
- [ ] Forecasts described as illustrative
- [ ] Confidence shown on results
- [ ] Score components are explainable
- [ ] Architect positioned as activation destination, not replaced
- [ ] No production capability falsely implied

---

## Part 7: File Structure

```
opportunity-lab/
├── README.md
├── BUILD_HANDOFF.md          ← this file
├── index.html                ← landing page
├── package.json
├── vite.config.js
├── public/
│   └── data/
│       ├── sr-zones.geojson      ← extracted from existing HTML
│       ├── competitors.geojson   ← extracted from existing HTML
│       ├── metrics-config.json
│       ├── demo-advertiser.json  ← Lakefront Automotive
│       ├── internal-accounts.json
│       ├── prospects.json
│       └── scenarios.json
├── src/
│   ├── main.js
│   ├── map/
│   │   ├── init.js               ← MapLibre setup, sources, layers
│   │   ├── colors.js             ← metric → color ramp logic
│   │   ├── interaction.js        ← hover, select, feature-state
│   │   ├── filters.js            ← slider → dim logic
│   │   └── competitors.js        ← toggle, overlap
│   ├── scoring/
│   │   ├── opportunity.js
│   │   ├── risk.js
│   │   └── breakdown.js
│   ├── simulation/
│   │   ├── engine.js             ← deterministic calc
│   │   ├── strategies.js         ← effect definitions
│   │   ├── animation.js          ← theater sequence
│   │   └── explanations.js       ← template generator
│   ├── ui/
│   │   ├── landing.js
│   │   ├── navigation.js
│   │   ├── score-card.js
│   │   ├── strategy-cards.js
│   │   ├── results-panel.js
│   │   ├── detail-panel.js
│   │   ├── architect-handoff.js
│   │   ├── guided-tour.js
│   │   └── mobile-sheet.js
│   └── styles/
│       ├── tokens.css
│       ├── layout.css
│       ├── map.css
│       ├── panels.css
│       └── animations.css
└── dist/                         ← production build output
```

---

## Part 8: First Task for Build Agent

> **Task 1 — Project Setup and Map Extraction**
>
> 1. Create the project structure shown in Part 7.
> 2. The existing map is a single monolithic HTML file. I will paste its contents into the appropriate location. Your job is to:
>    - Extract the embedded GeoJSON data into separate files under `public/data/`
>    - Extract the CSS into `src/styles/`
>    - Extract the JS into logical modules under `src/map/`
>    - Create an `index.html` that loads everything and renders the map identically to the original
> 3. Verify: map loads, zones color by median income, click shows detail panel, filters dim zones, competitor toggles work, tooltip shows on hover.
> 4. Do not add any new features. Do not change any behavior. Just modularize.
> 5. Report: list every file created and confirm the map works.

---

## Credits

- **Heat map concept and original build:** [Names of Cleveland team members who built the original]
- **Product vision and spec:** Spectrum Reach Opportunity Lab team
- **Technical architecture and implementation:** [Your team]

*All data in this prototype is synthetic and fictional. No real Spectrum Reach client, account, revenue, or proprietary data is included.*
