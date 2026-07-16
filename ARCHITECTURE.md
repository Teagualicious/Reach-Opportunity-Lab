# Opportunity Lab Architecture

This document defines the technical boundaries for the Reach Opportunity Lab. The current deliverable is an executive prototype, but the codebase must remain capable of evolving into a governed production product and adding markets beyond Ohio.

## Architectural goals

1. Build through production-shaped interfaces rather than one-off UI wiring.
2. Keep domain logic independent from React, MapLibre, storage, network access, and deployment.
3. Make synthetic data replaceable without rewriting product features.
4. Keep client-facing and internal-only models separated.
5. Preserve deterministic, explainable scoring and simulation behavior.
6. Represent geography and operating territories through explicit typed contracts.
7. Keep local development, GitHub Pages, static releases, and offline review as presentation/deployment adapters over one product.

## Frontend stack

- Vite
- React
- strict TypeScript
- MapLibre GL JS
- OpenStreetMap raster tiles for the standard basemap
- generated Census TIGER/Line context for the all-offline basemap
- Vitest
- CSS variables and modular stylesheets

Dependencies remain intentionally small. A new dependency requires a concrete capability that is not reasonably provided by the platform or current stack.

## Core boundaries

### Domain

Pure TypeScript modules under `src/domain/` do not import React, MapLibre, browser storage, or network libraries.

Responsibilities:

- ZIP opportunity and risk models
- component scores, confidence, and priority bands
- territory definitions and exact ZIP coverage validation
- deterministic client strategies and simulations
- internal objective score transforms
- recommendations and explanations
- reach-gap and competitor overlay contracts

### Data access

The application reads market information through typed repository and geometry-source interfaces.

Current runtime composition:

- `DemoOpportunityRepository` reads the generated statewide Ohio opportunity payload and synthetic overlay fixture.
- `StaticZctaGeometrySource` loads the checked-in statewide Ohio 2020 Census-derived ZCTA fixture.
- `publicAssetUrl` resolves data correctly for local development, release builds, offline packaging, and the GitHub Pages project subpath.
- `CensusZctaGeometrySource` remains an optional network adapter/reference implementation, not the runtime default.

Statewide fixtures are produced and validated through:

- `scripts/build-ohio-market.mjs`
- `scripts/validate-ohio-market.mjs`
- `.github/workflows/generate-ohio-market.yml`
- `public/data/ohio-zcta-2020.geojson`
- `public/data/ohio-opportunities.json`
- `public/data/ohio-market.provenance.json`

The generator preserves curated Cleveland–Akron records and creates deterministic synthetic baseline records for remaining Ohio ZCTAs. Generated files are not edited manually.

Future adapters may include governed APIs, authenticated campaign/account/CRM sources, Architect integration, additional statewide market packages, and vector-tile delivery.

### Application state

`ProductShell` owns shared presentation state that must remain consistent across all product modes:

- selected Ohio territory or All Ohio
- left sidebar collapsed state
- right sidebar collapsed state
- global reset version
- product mode

`ProductViewContext` supplies selected territory ZIPs, viewport bounds, and panel-layout version to all three features.

Feature modules own only their workflow state: ZIP selection, filters, strategies, simulations, market objective, and result theater.

### Map

MapLibre integration remains isolated under `src/map/`.

Responsibilities:

- rendering statewide ZCTA geometry
- applying domain-provided scores
- keeping inactive territories visible in neutral gray
- hover, selection, filter dimming, campaign emphasis, and territory dimming through feature state
- rendering typed reach-gap and competitor overlays
- fitting territory/statewide bounds
- fitting selected ZIP geometry
- resizing/refitting after sidebar collapse while preserving the current ZIP or territory focus
- preserving geographic attribution

The map does not calculate business scores, assign territories, or own product truth.

MapLibre feature state is limited to visual interaction:

| State | Purpose |
|---|---|
| `hover` | transient hover emphasis |
| `selected` | gold selected ZIP outline |
| `dim` | filter-based fading |
| `campaign` | current/recommended campaign emphasis |
| `territoryDim` | neutral gray inactive territory context |

### Product features

Feature folders own UI and orchestration:

- Opportunity Explorer
- Client Growth Studio
- Market Growth Studio
- simulation theater
- conceptual Architect handoff
- future guided executive tour
- future responsive/mobile interaction

All three current features consume the same territory selection and statewide market data.

## Geographic model

The primary selectable and scored unit is a five-digit ZIP identifier rendered with ZCTA polygon geometry.

The statewide Ohio fixture contains every source Ohio ZCTA. Each ZIP belongs to exactly one operating territory. Territories are groupings for focus and viewport behavior; they do not replace ZIP-level opportunity truth.

Current synthetic territories:

- Northeast Ohio · Cleveland–Akron
- Eastern Ohio · Youngstown
- Northwest Ohio · Toledo
- Central Ohio · Columbus
- West Central Ohio · Dayton
- Southwest Ohio · Cincinnati
- Southeast Ohio · Athens–Marietta

All Ohio is a view state, not a territory assignment.

Territory assignment currently uses deterministic nearest multi-city anchor sets suitable for the executive prototype. Production territory membership must be replaced by governed business definitions without changing feature or map contracts.

## Viewport and scrolling laws

The executive application is a fixed one-viewport dashboard:

- `html`, `body`, and `#root` do not scroll.
- The header occupies a fixed row.
- Each sidebar scrolls independently.
- Sidebars can collapse without unmounting feature workflows.
- The map fills the remaining grid cell.
- MapLibre must call `resize()` after panel-layout changes.
- Panel-layout changes preserve selected-ZIP focus when a ZIP is selected; otherwise they refit the active territory.
- Clearing selection returns the camera to the active territory bounds.

Do not reintroduce document-level scrolling for desktop product views.

## Visual map rules

- Standard basemap: light, fully desaturated OpenStreetMap raster context.
- Active opportunity scale: soft pastel cool-to-hot progression.
- Inactive territories: neutral gray with low-opacity fills.
- ZIP boundaries: strong white lines for active territories and extremely faint gray outside them.
- Selection: gold.
- Campaign emphasis: cyan.
- Selecting a ZIP fits its official Polygon or MultiPolygon geometry with bounded zoom.
- Business overlay colors remain typed fixture values.

Scores are attached to features before rendering; paint expressions never calculate opportunity logic.

## Supporting overlays

Supporting layers use typed definitions:

- `MarketOverlayData`
- `CompetitorFootprint`
- validated ZIP membership
- stable IDs
- explicit color, label, subtitle, and wide-coverage behavior

Current reach-gap and competitor fixtures are Northeast Ohio demonstrations. Future statewide coverage data should replace the payload without changing controls or MapLibre contracts.

## Demonstration data rules

- All opportunity, territory, advertiser, account, prospect, campaign, coverage, performance, recommendation, and simulation values are synthetic.
- Synthetic records are deterministic and version-controlled.
- Curated Cleveland–Akron records and generated statewide baseline records remain distinguishable through `detailLevel`.
- No company exports, credentials, internal reports, or real client data enter the repository.
- Every modeled screen includes an appropriate disclosure.
- Geographic source provenance is preserved.

## Delivery adapters

### Standard build

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run preview
```

The standard application uses online OpenStreetMap raster tiles and checked-in statewide ZIP geometry.

### GitHub Pages

Vite `pages` mode uses the `/Reach-Opportunity-Lab/` base path. The Pages workflow publishes `main` to the stable executive-review URL after merges.

### All-offline review

```bash
npm run offline:all
```

The offline target:

1. generates tiled statewide Census context;
2. builds a dedicated Vite entry;
3. inlines JavaScript and CSS;
4. embeds statewide opportunities, territory definitions, geometry, overlays, and map context;
5. includes Windows/macOS launchers;
6. rejects all unapproved runtime fetches;
7. validates that no external tags or split chunks remain.

Offline packaging is a distribution adapter, not a duplicate business implementation. The offline workflow must run for shared `src/` changes because it consumes the same feature and map source.

## Source structure

```text
src/
  app/                 composition root, product mode, shared territory/panel state
  domain/              opportunities, territories, scoring, simulation, overlays
  data/                repositories, public-asset and geometry adapters
  features/            product-owned UI/workflows
  map/                 MapLibre lifecycle, geometry bounds, layers, expressions, basemap adapters
  components/          reusable presentation controls
  styles/              tokens, fixed viewport layout, components, overlays
scripts/
  build-ohio-market.mjs
  validate-ohio-market.mjs
  build-offline-map-context.mjs
  build-offline-review.mjs
  validate-offline-review.mjs
public/data/
  ohio-zcta-2020.geojson
  ohio-opportunities.json
  ohio-market.provenance.json
  market-overlays.json
```

## Prohibited shortcuts

- monolithic HTML/JavaScript business implementation
- business rules in JSX handlers
- direct fixture imports scattered throughout components
- score calculation inside map paint expressions
- map-owned territory assignment
- hard-coded business overlays in MapLibre code
- document-level scrolling on desktop product views
- uncontrolled simulation randomness
- mixing client/internal data in one unfiltered model
- broad `any` typing to bypass contract problems
- real company/client data in fixtures
- undocumented or manually edited generated geography
- compiled-bundle patching as the offline source
- deployment-specific logic in domain or feature modules

## Scaling path

The production evolution should add the following without replacing the frontend foundation:

- additional state and major-city market packages
- governed territory definitions
- authenticated API adapters
- server-side scoring and model versioning
- role-based client/internal authorization
- persisted scenarios
- Architect and CRM integrations
- observability, audit trails, and feature flags
- vector tiles or governed commercial basemap providers

Production work will add infrastructure and stronger controls, but the domain contracts, territory model, repository boundaries, feature ownership, and map adapter should remain recognizable.
