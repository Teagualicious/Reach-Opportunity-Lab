# Opportunity Lab Architecture

This document defines the technical boundaries for Reach Opportunity Lab. The current deliverable is an executive prototype, but the codebase must remain capable of evolving into a governed production product and adding markets beyond Ohio.

## Architectural goals

1. Build through production-shaped interfaces rather than one-off UI wiring.
2. Keep domain logic independent from React, MapLibre, browser storage, network access, and deployment.
3. Make synthetic data replaceable without rewriting product features.
4. Keep client-facing and internal-only models separated.
5. Preserve deterministic, explainable scoring, simulation, and seller-action behavior.
6. Represent geography and operating territories through explicit typed contracts.
7. Keep local development, GitHub Pages, releases, and offline review as adapters over one product.
8. Preserve statewide interaction performance as features and overlays grow.

## Frontend stack

- Vite
- React
- strict TypeScript
- MapLibre GL JS
- OpenStreetMap raster tiles for the standard basemap
- generated Census TIGER/Line context for the all-offline basemap
- Vitest
- CSS variables and modular stylesheets

Dependencies remain intentionally small. A dependency requires a concrete capability not reasonably supplied by the current platform or stack.

## Dependency direction

```text
public statewide geography + deterministic synthetic fixtures
        ↓
repository / geometry-source adapters
        ↓
pure opportunity, territory, seller-action, scoring, and simulation domain
        ↓
shared application territory / viewport / panel state
        ↓
feature-owned workflows
        ↓
MapLibre presentation adapters
```

No lower layer imports an upper layer.

## Core boundaries

### Domain

Pure TypeScript modules under `src/domain/` do not import React, MapLibre, storage, or network libraries.

Responsibilities:

- ZIP opportunity and risk models
- score components, confidence, and priority bands
- exact territory definitions and ZIP coverage validation
- deterministic client strategies and simulations
- internal objective score transforms
- deterministic synthetic seller opportunity/action items
- recommendations and explanations
- reach-gap and competitor overlay contracts

Important modules:

- `opportunity.ts`
- `territory.ts`
- `clientScenario.ts`
- `marketMode.ts`
- `sellerOpportunity.ts`
- `mapOverlay.ts`

### Data access

The application reads market information through typed repository and geometry-source interfaces.

Current runtime composition:

- `DemoOpportunityRepository` reads the generated statewide opportunity payload and overlay fixture.
- `StaticZctaGeometrySource` loads checked-in statewide Ohio ZCTA geometry.
- `publicAssetUrl` resolves local, Pages, release, and offline paths.
- `CensusZctaGeometrySource` remains an optional network adapter/reference implementation, not the default runtime source.
- `OpportunityMarket.opportunitiesByZip` provides O(1) ZIP lookup.

Statewide fixtures are produced and validated through:

- `scripts/build-ohio-market.mjs`
- `scripts/validate-ohio-market.mjs`
- `.github/workflows/generate-ohio-market.yml`
- `public/data/ohio-zcta-2020.geojson`
- `public/data/ohio-opportunities.json`
- `public/data/ohio-market.provenance.json`

Generated files are never edited manually.

### Application state

`ProductShell` owns shared presentation state:

- product mode
- selected Ohio territory or All Ohio
- expanded/compact viewport mode
- left panel state
- right panel state
- global reset version

`ProductViewContext` supplies territory ZIPs, viewport bounds, panel-layout version, and viewport mode to all features.

Features own their own workflow state: selected ZIP, filters, strategies, seller objective, simulation, and result theater.

Do not add an external state library until React state/reducers become measurably insufficient.

### Map

MapLibre integration remains isolated under `src/map/`.

Responsibilities:

- render statewide ZCTA geometry
- consume domain-provided scores
- apply `displayScore` presentation overrides through feature state
- keep inactive territories visible in neutral gray
- render hover, selection, filter dimming, campaign emphasis, and territory dimming
- render typed reach-gap and competitor evidence layers over the shared statewide source
- fit territory, statewide, and selected-ZIP geometry bounds
- resize/refit after panel and viewport-mode changes
- preserve attribution

The map does not calculate business scores, generate seller actions, assign territories, or own product truth.

MapLibre feature state is presentation-only:

| State | Purpose |
|---|---|
| `hover` | transient hover emphasis |
| `selected` | gold selected ZIP outline |
| `dim` | filter-based fading |
| `campaign` | current/recommended campaign emphasis |
| `territoryDim` | neutral gray inactive territory context |
| `displayScore` | objective/simulation presentation score |

Performance laws:

- do not re-upload statewide geometry to recolor the map;
- diff feature-state sets before writing;
- use Sets for interaction membership checks;
- keep overlays as filtered layers over `zip-opportunities` rather than duplicate sources;
- reset applied-state tracking whenever a map instance is recreated;
- keep the standard MapLibre vendor chunk cache-stable;
- keep offline-review output as one inlinable script.

### Product features

Feature folders own UI and orchestration.

#### Opportunity Explorer

Owns neutral ZIP diagnosis:

- opportunity score and explanation
- score/category filters
- market context
- reach-gap status
- modeled competitor intersections
- map-layer controls

Selecting a competitor in ZIP details toggles the same typed map layer. Competitor data remains explicitly synthetic.

#### Client Growth Studio

Owns one fictional advertiser scenario:

- baseline campaign footprint
- selectable deterministic strategies
- current-versus-modeled results
- territory-aware expansion ZIPs
- conceptual Architect handoff

#### Seller Growth Studio

Owns internal account/prospect action:

- New Business
- Account Growth
- Retention Risk
- Category Opportunity
- deterministic seller action queue
- entity type, urgency, evidence, and recommended next action
- action simulation

The map is supporting geographic evidence. Do not reduce Seller Growth Studio to a differently recolored ZIP ranking.

## Geographic model

The primary selectable/scored unit is a five-digit ZIP identifier rendered with ZCTA geometry.

The statewide Ohio fixture contains every source Ohio ZCTA. Each ZIP belongs to exactly one synthetic operating territory:

- Northeast Ohio · Cleveland–Akron
- Eastern Ohio · Youngstown
- Northwest Ohio · Toledo
- Central Ohio · Columbus
- West Central Ohio · Dayton
- Southwest Ohio · Cincinnati
- Southeast Ohio · Athens–Marietta

All Ohio is a view state, not a territory assignment. Production territory membership must later be replaced with governed definitions without changing feature/map contracts.

## Viewport and scrolling laws

Two responsive modes exist:

### Expanded

- one fixed browser viewport
- no document-level scrolling
- narrow independently scrollable sidebars
- both sidebars can collapse
- map remains the dominant surface

### Compact

- activated through the shared 900px `matchMedia` contract
- map is full-bleed and visible by default
- panels are one-at-a-time bottom sheets
- product modes remain available through fixed bottom navigation
- safe-area insets are respected
- no user-agent/device detection

Every new product surface must render correctly in both modes.

## Visual map rules

- standard basemap: light, fully desaturated OpenStreetMap raster context
- active opportunity scale: pastel cool-to-hot progression
- inactive territories: neutral gray with very subtle boundaries
- selection: prominent gold outline
- campaign/current-action emphasis: prominent cyan outline
- enabled reach-gap and competitor layers: higher-contrast typed fills and outlines
- business overlay colors remain fixture-owned

Paint expressions display values; they never calculate opportunity logic.

## Demonstration data rules

- All opportunity, territory, advertiser, campaign, account, prospect, seller, coverage, recommendation, and simulation values are deterministic synthetic data.
- Curated Cleveland–Akron records remain distinguishable from statewide baseline records.
- Competitor footprints are illustrative ZIP memberships, not provider service-area claims.
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

The standard application uses online OpenStreetMap tiles and checked-in statewide geometry.

### GitHub Pages

Vite `pages` mode uses `/Reach-Opportunity-Lab/`. `main` deploys to the stable review URL after merges.

### All-offline review

```bash
npm run offline:all
```

The offline target:

1. generates tiled statewide Census context;
2. builds a dedicated Vite entry;
3. inlines JavaScript and CSS;
4. embeds opportunities, territories, geometry, overlays, and context;
5. includes Windows/macOS launchers;
6. rejects unapproved runtime requests;
7. validates no external tags or split chunks remain.

Offline packaging is a distribution adapter, not a duplicate product implementation.

## Source structure

```text
src/
  app/                 composition root and shared view state
  domain/              opportunities, territories, seller actions, simulations, overlays
  data/                repositories, public-asset, and geometry adapters
  features/            Explorer, Client Growth, Seller Growth workflows
  map/                 MapLibre lifecycle, feature-state, expressions, adapters
  components/          reusable controls
  styles/              tokens, responsive layout, product and map polish
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
- business rules in JSX event handlers
- scattered direct fixture imports
- score calculation inside map paint expressions
- full statewide source re-upload for presentation recolors
- map-owned territory or seller-action generation
- hard-coded business overlays in rendering code
- document-level desktop scrolling
- device/user-agent detection
- uncontrolled randomness
- mixing client/internal data in one unfiltered model
- broad `any` typing
- real company/client data
- undocumented/manually edited generated geography
- compiled-bundle patching as the offline source
- deployment-specific logic in domain/features

## Scaling path

The production evolution should add the following without replacing the foundation:

- additional state/major-city market packages
- governed territory and coverage definitions
- authenticated API adapters
- server-side scoring and model versioning
- role-based client/internal authorization
- persisted scenarios and seller queues
- Architect and CRM integrations
- observability, audit trails, and feature flags
- vector tiles or a governed basemap provider
