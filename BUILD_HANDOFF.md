# Spectrum Reach Opportunity Lab — Current Build Handoff

**Purpose:** Explain the application that exists now, the boundaries that must be preserved, and the next implementation tasks. Product vision remains in [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md); architectural laws remain in [`ARCHITECTURE.md`](ARCHITECTURE.md); current state remains in [`STATUS.md`](STATUS.md).

## 1. Current product

The repository contains a Vite + React + strict TypeScript application with one statewide Ohio ZIP/ZCTA intelligence layer and three connected experiences.

### Opportunity Explorer

- every Ohio ZCTA displayed;
- All Ohio plus seven major-city operating territories;
- inactive territories remain visible in neutral gray;
- selected territory fits the viewport and stays vivid;
- pastel cool-to-hot opportunity scale;
- selecting a ZIP zooms to its official geometry;
- score/category filters, ranked ZIPs, hover/selection, explainable components, confidence, and market context;
- synthetic reach-gap and competitor controls.

### Client Growth Studio

- fictional Lakefront Automotive baseline;
- four deterministic strategy definitions;
- territory-aware campaign footprints;
- territory-aware recommended expansion ZIPs;
- selected ZIP camera focus;
- staged simulation theater and current-versus-modeled metrics;
- conceptual Architect handoff.

### Market Growth Studio

- New Business;
- Account Growth;
- Retention Risk;
- Category Opportunity;
- territory-aware rankings and map recoloring;
- selected ZIP camera focus;
- fictional prospect/account examples and recommended actions.

All business, opportunity, territory, campaign, account, prospect, competitor, recommendation, and simulation values are synthetic.

## 2. Executive shell

`ProductShell` owns universal state shared across all three modes:

- product mode;
- selected territory or All Ohio;
- left sidebar collapsed state;
- right sidebar collapsed state;
- global reset version.

`ProductViewContext` passes:

- selected territory definition;
- selected territory ZIPs;
- territory/statewide viewport bounds;
- panel-layout version.

Desktop layout laws:

- the product fits one browser viewport;
- the page itself never scrolls;
- left and right sidebars scroll independently;
- both sidebars collapse without resetting feature workflows;
- map width expands when panels collapse;
- MapLibre resizes after layout changes;
- panel changes preserve selected-ZIP focus when a ZIP is selected and otherwise refit the active territory.

## 3. Geography and statewide data

### Generated fixtures

```text
public/data/
  ohio-zcta-2020.geojson
  ohio-opportunities.json
  ohio-market.provenance.json
  market-overlays.json
```

Generation and validation:

```bash
npm run geometry:refresh
npm run geometry:validate
```

Implemented by:

```text
scripts/build-ohio-market.mjs
scripts/validate-ohio-market.mjs
.github/workflows/generate-ohio-market.yml
```

The builder:

1. downloads a documented simplified 2020 Census-derived Ohio ZCTA source;
2. includes every source Ohio ZCTA;
3. rounds coordinates to five decimals;
4. assigns every ZIP to one of seven deterministic synthetic territory anchor groups;
5. preserves curated Cleveland–Akron opportunity records;
6. generates deterministic synthetic baseline metrics for remaining Ohio ZIPs;
7. writes provenance.

The validator rejects:

- missing or duplicate ZIPs;
- non-polygon geometry;
- implausible Ohio coordinates;
- opportunity/geometry count mismatch;
- invalid score components;
- duplicate or incomplete territory membership;
- missing provenance.

Generated statewide files are never edited manually.

### Territory definitions

```text
Northeast Ohio · Cleveland–Akron
Eastern Ohio · Youngstown
Northwest Ohio · Toledo
Central Ohio · Columbus
West Central Ohio · Dayton
Southwest Ohio · Cincinnati
Southeast Ohio · Athens–Marietta
```

All Ohio is a view option, not a territory assignment. Each ZIP belongs to exactly one territory.

`src/domain/territory.ts` owns territory selection and coverage validation. Territory assignment is demonstration logic and must eventually be replaced with governed business definitions without changing feature or map contracts.

## 4. Source ownership

```text
src/
  app/
    App.tsx                    loads the `ohio` market
    ProductShell.tsx           shared mode, territory, collapse, and reset state
    ProductViewContext.ts      shared territory/viewport contract
  components/
    TerritorySelector.tsx
    MapLayerControls.tsx
    ScoreRing.tsx
  data/
    OpportunityRepository.ts
    DemoOpportunityRepository.ts
    StaticZctaGeometrySource.ts
    ZipGeometrySource.ts
    publicAssetUrl.ts
  domain/
    opportunity.ts
    territory.ts
    clientScenario.ts
    marketMode.ts
    mapOverlay.ts
  features/
    zip-explorer/
    client-growth/
    market-growth/
  map/
    OpportunityMap.tsx
    geometryBounds.ts
    mapExpressions.ts
    offlineBasemapStyle.ts
  styles/
    base.css
    layout.css
    components.css
    layers.css
scripts/
  build-ohio-market.mjs
  validate-ohio-market.mjs
  build-offline-map-context.mjs
  build-offline-review.mjs
  validate-offline-review.mjs
```

Dependency direction:

```text
public geography + synthetic fixtures
        ↓
repository / geometry-source adapters
        ↓
pure opportunity, territory, scoring, simulation domain
        ↓
shared application view state
        ↓
feature orchestration
        ↓
MapLibre presentation adapters
```

## 5. Map implementation

`OpportunityMap` creates one statewide `zip-opportunities` GeoJSON source and promotes `zip` as feature ID.

Feature state:

| State | Purpose |
|---|---|
| `hover` | transient hover emphasis |
| `selected` | gold selected ZIP outline |
| `dim` | fades ZIPs outside active score/category filters |
| `campaign` | current or recommended campaign emphasis |
| `territoryDim` | neutral gray statewide context outside selected territory |

Map rules:

- opportunity values arrive already calculated;
- MapLibre paint expressions do not calculate business scores;
- active ZIPs use a pastel cool-to-hot progression;
- inactive territories use low-opacity neutral gray;
- active ZIP boundaries are strong white;
- inactive boundaries are extremely faint gray;
- selection remains gold;
- campaign emphasis remains cyan;
- selected territory ZIPs alone are interactive;
- territory and statewide bounds are supplied by shared application state;
- selecting from the map or a ranked list fits the ZIP Polygon/MultiPolygon bounds;
- clearing selection returns to the selected territory frame;
- map calls `resize()` after sidebar changes and preserves current ZIP focus when selected.

`geometryBounds.ts` owns recursive coordinate traversal and converts Polygon, MultiPolygon, and GeometryCollection geometry into a typed `[west, south, east, north]` viewport bound. Keep this pure and covered by Vitest.

The standard basemap is OpenStreetMap raster tiles with full desaturation and high brightness. Attribution remains visible.

## 6. Product feature behavior

### Opportunity Explorer

Owns:

- minimum score and category filters;
- selected ZIP;
- reach-gap and competitor visibility;
- ranked ZIPs inside the selected territory;
- selected ZIP details and disclosures.

Changing territory clears the selected ZIP and category while preserving the global shell state. ZIP selection from either the map or ranking drives the same detail and camera state.

### Client Growth Studio

`clientScenario.ts` remains the canonical deterministic simulation engine.

- Cleveland–Akron uses the curated Lakefront campaign ZIPs.
- Other territories use their highest-scoring ZIPs as a synthetic current footprint.
- Recommended expansion ZIPs are derived from the selected territory.
- Identical strategy inputs produce identical model outputs.
- ZIP selection drives both the map focus and the selected context.

### Market Growth Studio

`marketMode.ts` owns objective-specific score transforms. Rankings and selection are restricted to the selected territory while the rest of Ohio remains visible in gray.

Client-facing components must not receive internal account, revenue, retention, or seller fields.

## 7. Supporting overlays

`MarketOverlayData` and `CompetitorFootprint` remain typed and validated.

Current reach-gap and competitor fixtures cover Northeast Ohio only. They render correctly over the statewide map but do not yet provide statewide coverage truth. Future governed or synthetic statewide definitions should replace the fixture without changing controls or map-layer contracts.

## 8. Standard, Pages, and offline delivery

### Standard/local

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run preview
```

### GitHub Pages

`main` deploys automatically to:

```text
https://teagualicious.github.io/Reach-Opportunity-Lab/
```

Vite `pages` mode and `publicAssetUrl` handle the repository subpath. Feature code must not hard-code deployment URLs.

### All-offline review

```bash
npm run offline:all
```

The target:

1. queries tiled statewide TIGERweb envelopes;
2. deduplicates roads, water, and counties;
3. builds a dedicated offline Vite entry;
4. embeds statewide opportunities, territories, geometry, overlays, context, JavaScript, and CSS;
5. includes Windows/macOS launchers;
6. blocks all unapproved runtime requests;
7. validates no linked assets or Vite split chunks remain.

Output:

```text
offline-dist/Opportunity-Lab-All-Offline/
```

The offline workflow publishes a workflow artifact and attaches the validated ZIP to the latest release. Never upload the package when offline validation fails. Its path filters include shared `src/**` changes because the offline review consumes the same product and map implementation.

## 9. Required validation

```bash
npm run typecheck
npm run test
npm run build
```

`npm run test` validates statewide market fixtures before Vitest.

Separate all-offline validation:

```bash
npm run offline:all
```

Current validated branch runs:

- standard CI run 299 — passed;
- all-offline run 57 — passed.

Visual correctness still requires browser review because the current automated Chromium environment cannot initialize WebGL.

## 10. Preserve

- strict TypeScript boundaries;
- deterministic scoring and simulation;
- every Ohio ZIP represented once;
- exact territory coverage validation;
- curated versus statewide-baseline distinction;
- shared territory state across all product modes;
- one fixed desktop viewport;
- independently scrollable/collapsible sidebars;
- map resize on panel changes while preserving current camera focus;
- pastel active opportunity scale, gray inactive context, gold selection, cyan campaign;
- selected-ZIP geometry focus and territory reset behavior;
- geographic provenance;
- synthetic disclosures;
- client/internal separation;
- standard and offline maps as adapters over one product;
- Architect as activation destination.

## 11. Do not reintroduce

- document-level desktop scrolling;
- fragmented selected-ZIP-only geometry;
- strong inactive-territory boundary clutter;
- detail selection without corresponding map focus;
- business score calculation in MapLibre expressions or JSX handlers;
- map-owned territory assignment;
- manually edited generated geography;
- uncontrolled simulation randomness;
- direct JSON access scattered through UI components;
- broad `any` typing;
- real company/client data;
- fake live Architect/AI integrations;
- deployment-specific domain logic;
- compiled-bundle patching or linked assets in the offline target.

## 12. Next sequence

1. Merge and visually inspect the pastel map polish through GitHub Pages on the target laptop.
2. Tune layout and camera padding based on screenshots from that build.
3. Expand supporting overlays and campaign comparison controls in Client Growth Studio.
4. Add richer statewide account/prospect/retention datasets.
5. Add additional state and major-city market packages behind the current market/territory contracts.
6. Add the executive tour, responsive interaction, and WebGL visual regression coverage.
