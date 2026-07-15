# Spectrum Reach Opportunity Lab — Current Build Handoff

**Purpose:** This document explains the application that exists now, the boundaries that must be preserved, and the next implementation tasks. Product vision and acceptance criteria remain in [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md); architectural laws remain in [`ARCHITECTURE.md`](ARCHITECTURE.md); project state remains in [`STATUS.md`](STATUS.md).

## 1. Current product state

The repository contains a Vite + React + strict TypeScript application with three shared experiences:

1. **Opportunity Explorer**
   - Cleveland–Akron ZIP/ZCTA opportunity heat map
   - cool-to-hot score coloring
   - ZIP hover, selection, filter dimming, ranked opportunities, score explanations, and market context
   - synthetic reach-gap and competitor footprint controls

2. **Client Growth Studio**
   - fictional Lakefront Automotive baseline and campaign footprint
   - four selectable strategy definitions
   - deterministic simulation theater and reproducible results
   - current-versus-modeled metrics
   - conceptual Architect handoff modal

3. **Market Growth Studio**
   - New Business
   - Account Growth
   - Retention Risk
   - Category Opportunity
   - objective-specific score weighting, map recoloring, fictional examples, and recommended actions

All business, advertiser, account, prospect, campaign, reach-gap, competitor, score, recommendation, and simulation values are synthetic.

Two presentation adapters render the same product:

- **Standard application** — OpenStreetMap raster basemap, local development/static deployment.
- **All-offline visual review** — bundled Census TIGER/Line context and one embedded HTML application with a hard network-request boundary.

## 2. Current stack

| Concern | Implementation |
|---|---|
| Build | Vite |
| UI | React 19 |
| Language | strict TypeScript |
| Map | MapLibre GL JS |
| Standard basemap | OpenStreetMap raster tiles |
| Offline map context | generated Census TIGER/Line roads, hydrography, counties, and local labels |
| ZIP geometry | checked-in simplified 2020 Census-derived ZCTA subset |
| Geometry refresh | Node fixture builder + GitHub Actions review workflow |
| Offline packaging | dedicated Vite entry + single-file Node packager |
| Tests | geographic/offline validation scripts + Vitest |
| Styles | CSS variables and modular stylesheets |
| Backend | none for the prototype |
| Deployment | local-first static build and GitHub release artifacts |

## 3. Dependency direction

```text
public geographic + synthetic fixtures
        ↓
repository / geometry-source adapters
        ↓
pure domain scoring, simulation, and validation
        ↓
React feature orchestration
        ↓
MapLibre rendering adapter
        ↓
standard basemap OR offline-review basemap adapter
```

Rules:

- `src/domain/` does not import React, MapLibre, browser storage, or network libraries.
- `src/data/` owns fetch and fixture boundaries.
- `src/map/` renders values and geometry supplied by domain/data layers; it does not calculate business scores.
- `src/features/` owns product workflows and may consume domain services and repositories.
- Business truth must not live only in the DOM or MapLibre feature state.
- Offline packaging is a build/distribution concern, not a second business implementation.

## 4. Source map

```text
src/
  app/
    App.tsx                    composition root and repository loading
    ProductShell.tsx           product mode navigation and global reset
  components/
    ScoreRing.tsx
    MapLayerControls.tsx       typed reach-gap and competitor toggles
  data/
    OpportunityRepository.ts  market and repository contracts
    DemoOpportunityRepository.ts
    ZipGeometrySource.ts      shared geometry validation/normalization
    StaticZctaGeometrySource.ts
    CensusZctaGeometrySource.ts optional network adapter, not runtime default
  domain/
    opportunity.ts             ZIP scoring contracts and validation
    clientScenario.ts          deterministic client strategies and simulation
    marketMode.ts              internal objective score transforms
    mapOverlay.ts              reach-gap and competitor overlay contracts
  features/
    zip-explorer/
    client-growth/
    market-growth/
  map/
    OpportunityMap.tsx         MapLibre lifecycle, sources, layers, feature state
    mapExpressions.ts          opportunity heat and line expressions
    offlineBasemapStyle.ts     bundled Census context style and labels
  main.tsx                     standard application entry
  offline-main.tsx             offline-review application entry
  styles/
    tokens.css
    base.css
    layout.css
    components.css
    layers.css
offline.html                   offline Vite HTML entry
scripts/
  build-zcta-fixture.mjs       filters and normalizes source Ohio ZCTA geometry
  validate-zcta-fixture.mjs    gates tests on fixture integrity
  build-offline-map-context.mjs
  build-offline-review.mjs
  validate-offline-review.mjs
public/data/
  zip-opportunities.json
  market-overlays.json
  cleveland-akron-zcta-2020.geojson
  cleveland-akron-zcta-2020.provenance.json
  cleveland-zips.geojson       synthetic emergency fallback only
```

`offline-map-context.geojson` and its provenance file are generated build outputs. They do not contain business data and do not need to be checked into the repository.

## 5. Geographic pipeline

### Runtime ZIP geometry

`DemoOpportunityRepository` loads:

1. synthetic opportunity and overlay fixtures;
2. the checked-in 2020 Census-derived ZCTA subset through `StaticZctaGeometrySource`;
3. the synthetic fallback only if the checked-in fixture cannot be loaded or validated.

Runtime ZIP polygons do not depend on a Census service request.

### ZIP refresh

```bash
npm run geometry:refresh
npm run geometry:validate
```

The builder:

- downloads a documented 2020 Census-derived Ohio ZCTA source;
- filters exactly the ZIP identifiers in `zip-opportunities.json`;
- normalizes ZIP properties;
- rounds coordinates to five decimals;
- preserves Polygon and MultiPolygon topology;
- writes a provenance record.

The standard `npm run test` command validates geometry before running Vitest. It rejects missing, extra, duplicate, invalid, non-polygon, or geographically implausible features.

Do not edit the generated ZCTA GeoJSON by hand. Change the builder or source declaration and regenerate it.

### Offline context generation

```bash
npm run offline:context
```

`build-offline-map-context.mjs` queries public U.S. Census Bureau TIGERweb services for the Cleveland–Akron market bounds and prepares:

- primary and secondary roads;
- linear and areal hydrography;
- county boundaries;
- deterministic local place/water labels.

The generated context is simplified for browser delivery and bundled only into the all-offline review target.

## 6. Map implementation

`OpportunityMap` creates the `zip-opportunities` GeoJSON source and promotes `zip` as the feature ID.

Primary layers:

- `zip-opportunity-fill`
- `zip-opportunity-line`

Feature state:

| State | Purpose |
|---|---|
| `hover` | hover emphasis and tooltip interaction |
| `selected` | gold selected ZIP outline |
| `dim` | fades ZIPs outside active filters |
| `campaign` | highlights active or recommended client campaign ZIPs |

The map consumes scores already attached to ZIP features. The color expression progresses from cool blue through cyan/yellow/orange to red. Selection remains gold.

Supporting overlays are loaded from `market-overlays.json` and validated against the active market ZIP set:

- reach gaps use a magenta dashed overlay;
- competitors receive config-driven sources, fill layers, and line layers;
- DMA-wide competitors use lower-opacity fills and dashed lines;
- visibility state lives in `MapLayerControls` and product features.

Do not hard-code business overlay definitions directly in `OpportunityMap` or JSX.

## 7. All-offline review target

Build the full package with:

```bash
npm run offline:all
```

The target:

1. generates local Census map context;
2. runs strict TypeScript validation;
3. builds `offline.html` through the `offline-review` Vite mode;
4. inlines all JavaScript and CSS;
5. embeds ZIP opportunities, overlays, ZCTA geometry, fallback geometry, and map context;
6. adds Windows/macOS launchers;
7. rejects all unapproved runtime fetches;
8. validates that no external document tags or Vite split chunks remain.

Output:

```text
offline-dist/Opportunity-Lab-All-Offline/
  Opportunity-Lab-All-Offline.html
  OPEN_DEMO.bat
  OPEN_DEMO.command
  README.txt
```

The package opens directly from `file://`; it requires no Node.js, install, local server, administrator rights, or internet connection.

`.github/workflows/offline-review.yml` publishes a workflow artifact and attaches the validated ZIP to the latest GitHub release. Never upload the package if `offline:validate` fails.

## 8. Product ownership

### Opportunity Explorer

`ZipExplorer` owns filters, ranked ZIPs, selected ZIP details, layer visibility, and disclosures. Filtered ZIPs remain visible but dimmed.

### Client Growth Studio

`clientScenario.ts` owns baseline metrics, campaign ZIPs, strategies, deterministic effects, ranges, confidence, explanation, and expansion ZIPs. `ClientGrowthStudio` owns UI theater only. Identical inputs must produce identical outputs.

### Market Growth Studio

`marketMode.ts` owns objective-specific score transforms. Client-facing components must not receive internal account, revenue, retention, or seller fields.

## 9. Validation and release

Required standard checks:

```bash
npm run typecheck
npm run test
npm run build
```

Required offline check:

```bash
npm run offline:all
```

CI runs standard checks on every push and pull request. The offline workflow separately generates, validates, packages, and uploads `Opportunity-Lab-All-Offline.zip`. A successful merge to `main` publishes standard static-build and source ZIPs under a `build-<run_number>` release tag.

## 10. Preserve

- strict TypeScript boundaries
- typed repositories and geometry sources
- pure deterministic domain logic
- ZIP/ZCTA as the primary selectable and scored geography
- generated-geometry provenance and validation
- MapLibre feature-state interaction
- dimming instead of removing filtered ZIPs
- cool-to-hot opportunity scale and gold selection
- synthetic-data disclosures
- client/internal data separation
- Architect positioned as the activation destination
- geographic attribution and provenance
- standard and offline basemaps as separate adapters over the same product features
- the offline hard network boundary and single-file packaging validation

## 11. Do not reintroduce

- monolithic business/UI implementation
- runtime dependence on remote ZCTA geometry
- manually edited generated geometry
- compiled-bundle patching as the source of the offline target
- dynamic chunks or linked assets in the offline package
- unguarded network fallback in the offline package
- direct JSON imports scattered through components
- score calculation in MapLibre expressions or JSX handlers
- uncontrolled simulation randomness
- broad `any` typing
- real company/client data
- fake live Architect or AI claims
- deployment-specific domain logic

## 12. Next implementation sequence

1. Extend supporting overlays into Client Growth Studio with explicit current campaign, reach-gap, and recommended expansion controls.
2. Add richer strategy tradeoffs and result transitions.
3. Expand internal synthetic account/prospect datasets and retention-save comparisons.
4. Add the guided executive tour and mobile bottom sheet.
5. Add WebGL-capable browser visual regression coverage for the standard and offline adapters.
