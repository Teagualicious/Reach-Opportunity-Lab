# Spectrum Reach Opportunity Lab — Current Build Handoff

**Purpose:** This document explains the application that exists now, the boundaries that must be preserved, and the next implementation tasks. Product vision and acceptance criteria remain in [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md); architectural laws remain in [`ARCHITECTURE.md`](ARCHITECTURE.md); project state remains in [`STATUS.md`](STATUS.md).

## 1. Current product state

The repository contains a Vite + React + strict TypeScript application with three shared experiences:

1. **Opportunity Explorer**
   - Cleveland–Akron ZIP/ZCTA opportunity heat map
   - cool-to-hot score coloring
   - ZIP hover, selection, filter dimming, ranked opportunities, score explanations, and market context
   - synthetic reach-gap and competitor footprint layer controls

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
   - objective-specific score weighting, map recoloring, fictional account/prospect examples, and recommended actions

All business, advertiser, account, prospect, campaign, reach-gap, competitor, score, recommendation, and simulation values are synthetic.

## 2. Current stack

| Concern | Implementation |
|---|---|
| Build | Vite |
| UI | React 19 |
| Language | strict TypeScript |
| Map | MapLibre GL JS |
| Basemap | OpenStreetMap raster tiles |
| Geometry | Census TIGERweb ZCTA source with labeled local fallback |
| Tests | Vitest |
| Styles | CSS variables and modular stylesheets |
| Backend | None for the prototype |
| Deployment | Local-first static build; GitHub release ZIPs after merge |

## 3. Dependency direction

```text
public/data synthetic fixtures
        ↓
repository / geometry-source adapters
        ↓
pure domain scoring, simulation, and validation
        ↓
React feature orchestration
        ↓
MapLibre rendering adapter
```

Rules:

- `src/domain/` does not import React, MapLibre, browser storage, or network libraries.
- `src/data/` owns fetch and fixture boundaries.
- `src/map/` renders values and geometry supplied by the domain/data layers; it does not calculate business scores.
- `src/features/` owns product workflows and may consume domain services and repositories.
- Business truth must not live only in the DOM or MapLibre feature state.

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
    ZipGeometrySource.ts
    CensusZctaGeometrySource.ts
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
  styles/
    tokens.css
    base.css
    layout.css
    components.css
    layers.css
public/data/
  zip-opportunities.json       synthetic opportunity records
  cleveland-zips.geojson       clearly labeled geometry fallback
  market-overlays.json         synthetic reach-gap and competitor definitions
```

## 5. Map implementation

### Primary ZIP source

`OpportunityMap` creates the `zip-opportunities` GeoJSON source and promotes the `zip` property as the feature ID.

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

### Opportunity color

The map consumes the score already attached to each ZIP feature. The color expression progresses from cool blue through cyan/yellow/orange to red. Selection remains gold and must stay visually distinct from opportunity heat.

### Supporting layers

Typed supporting overlays are loaded from `public/data/market-overlays.json` and validated against the market ZIP set before the UI receives them.

- Reach gaps use a magenta dashed overlay.
- Competitor footprints are config-driven and receive their own GeoJSON source, fill layer, and line layer.
- DMA-wide competitors use lower-opacity fill and dashed lines.
- Overlay controls live in `MapLayerControls`; map rendering only consumes selected IDs and booleans.

Do not hard-code business overlay definitions directly in `OpportunityMap` or JSX.

### Basemap and geometry

- The basemap currently uses OpenStreetMap raster tiles and preserves attribution.
- `CensusZctaGeometrySource` requests official ZCTA geometry through TIGERweb.
- `DemoOpportunityRepository` falls back to `cleveland-zips.geojson` when the browser-time Census request fails.
- The next geometry milestone is a reproducible build-time preparation script and checked-in simplified official fixture. Geometry access must remain behind `ZipGeometrySource`.

## 6. Opportunity Explorer

`ZipExplorer` owns:

- minimum score filter
- category filter
- ranked ZIP list
- selected ZIP details
- supporting layer visibility state
- geometry and synthetic-data disclosures

The map never removes filtered ZIPs; filtered ZIPs remain visible but dimmed.

## 7. Client Growth Studio

Canonical fictional advertiser: **Lakefront Automotive Group**.

`clientScenario.ts` owns:

- baseline metrics
- campaign ZIPs
- strategy definitions
- deterministic effect calculations
- strategy combination behavior
- result ranges, confidence, explanation, and recommended expansion ZIPs

`ClientGrowthStudio` owns UI theater only:

- selecting strategies
- staged simulation status
- current/projected map state
- result comparison
- Architect handoff modal

Identical strategy inputs must always produce identical results.

## 8. Market Growth Studio

`marketMode.ts` owns objective-specific score transformations. The UI supports four modes and uses synthetic examples only.

Client-facing components must not receive internal-only account, revenue, retention, or seller fields.

## 9. Validation and release

Required local checks:

```bash
npm run typecheck
npm run test
npm run build
```

CI runs those checks on every push and pull request. A successful merge to `main` publishes static-build and source ZIP files under a `build-<run_number>` release tag.

## 10. Preserve

- strict TypeScript boundaries
- typed repositories and geometry sources
- pure deterministic domain logic
- ZIP/ZCTA as the primary selectable and scored geography
- MapLibre feature-state interaction
- dimming instead of removing filtered ZIPs
- cool-to-hot opportunity scale and gold selection
- synthetic-data disclosures
- client/internal data separation
- Architect positioned as the activation destination
- OpenStreetMap and Census attribution/provenance

## 11. Do not reintroduce

- monolithic HTML/JavaScript
- Python-template test or CI instructions
- direct JSON imports scattered through components
- score calculation in MapLibre expressions or JSX handlers
- uncontrolled simulation randomness
- broad `any` typing
- real company/client data
- fake live Architect or AI claims
- deployment-specific domain logic

## 12. Next implementation sequence

1. Prepare and check in simplified official Cleveland–Akron ZCTA geometry at build time.
2. Extend supporting overlays into Client Growth Studio, including explicit reach-gap and current/recommended campaign controls.
3. Add richer strategy tradeoffs and result transitions.
4. Expand internal synthetic account/prospect datasets and retention-save comparisons.
5. Add the guided executive tour and mobile bottom sheet.
6. Add WebGL-capable browser visual regression coverage.
