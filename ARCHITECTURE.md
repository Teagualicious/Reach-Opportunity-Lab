# Opportunity Lab Architecture

This document defines the technical and product boundaries for Reach Opportunity Lab. The current deliverable is an executive prototype, but the structure must remain capable of evolving into a governed production product and adding markets beyond Ohio.

## Architectural goals

1. Build through production-shaped interfaces rather than one-off UI wiring.
2. Keep domain logic independent from React, MapLibre, storage, network access, and deployment.
3. Make deterministic synthetic data replaceable without rewriting product features.
4. Keep client-facing and internal-only models separated.
5. Preserve explainable scoring, client planning, simulation, and seller-action behavior.
6. Represent ZIP geography and operating territories through explicit typed contracts.
7. Keep local, Pages, release, and offline delivery as adapters over one product.
8. Preserve statewide interaction performance as features and evidence layers grow.
9. Make workspace purpose, intended user, and next action obvious in the interface.

## Frontend stack

- Vite
- React
- strict TypeScript
- MapLibre GL JS
- OpenStreetMap raster tiles for the standard basemap
- generated Census context for the all-offline basemap
- Vitest
- CSS variables and modular stylesheets

A dependency requires a concrete capability not reasonably supplied by the current platform or stack.

## Dependency direction

```text
public geography + deterministic synthetic fixtures
        ↓
repository / geometry-source adapters
        ↓
pure opportunity, territory, client-planning, seller-action, scoring, and simulation domain
        ↓
shared application workspace / territory / viewport / panel state
        ↓
feature-owned workflows
        ↓
MapLibre presentation adapters
```

No lower layer imports an upper layer.

## Domain boundary

Modules under `src/domain/` do not import React, MapLibre, storage, or network libraries.

Responsibilities:

- ZIP opportunity and risk models
- score components, confidence, and priority bands
- territory definitions and exact ZIP coverage validation
- deterministic client strategies and simulations
- deterministic client geographic planning and expansion ranking
- internal objective score transforms
- deterministic seller opportunity/action items
- reach-gap and competitor overlay contracts
- recommendations and explanations

Important modules:

- `opportunity.ts`
- `territory.ts`
- `clientScenario.ts`
- `clientGeography.ts`
- `marketMode.ts`
- `sellerOpportunity.ts`
- `mapOverlay.ts`

Business truth is calculated here or supplied through typed repositories—not in JSX handlers or map expressions.

## Data access boundary

Current runtime composition:

- `DemoOpportunityRepository` reads the statewide opportunity payload and overlay fixture.
- `StaticZctaGeometrySource` loads checked-in statewide Ohio ZCTA geometry.
- `publicAssetUrl` resolves local, Pages, release, and offline asset paths.
- `CensusZctaGeometrySource` remains an optional reference adapter, not the runtime default.
- `OpportunityMarket.opportunitiesByZip` provides O(1) ZIP lookup.

Generated statewide fixtures:

```text
public/data/
  ohio-zcta-2020.geojson
  ohio-opportunities.json
  ohio-market.provenance.json
  market-overlays.json
```

Generated files are never edited manually.

## Shared application state

`ProductShell` owns:

- selected workspace
- selected Ohio territory or All Ohio
- expanded/compact viewport mode
- left panel state
- right panel state
- global reset version

Visible workspace order and names are fixed unless a product decision explicitly changes them:

1. **Market Opportunity Map**
2. **Seller Action Center**
3. **Client Campaign Planner**

Compact navigation may use shorter labels, but accessible labels and workspace meaning remain the same.

`ProductViewContext` supplies territory ZIPs, viewport bounds, panel-layout version, and viewport mode to every feature.

## Workspace ownership

Every right panel begins with the shared `ExperienceGuide`, which states purpose, intended user, and the next action.

### Market Opportunity Map

Owns neutral market diagnosis:

- opportunity heat and ranking
- score/category filters
- selected ZIP explanation
- market context
- modeled reach-gap status
- modeled competitor intersections
- evidence-layer controls

Question answered: **Where is opportunity, why does it exist, and what modeled coverage or competitive signals affect it?**

### Seller Action Center

Owns internal seller execution:

- New Business
- Account Growth
- Retention Risk
- Category Opportunity
- deterministic prospect/account action queue
- entity type, urgency, evidence, and recommended next action
- action modeling

Question answered: **Who should a seller pursue, grow, or save next, and what should they do?**

The map is supporting geographic evidence. Do not reduce this workspace to another ZIP ranking screen.

### Client Campaign Planner

Owns one fictional advertiser planning workflow:

- Current plan
- Diagnose gaps
- Recommended plan
- baseline campaign footprint
- deterministic reach-gap and competitor-pressure diagnosis
- selectable deterministic strategies
- current-versus-modeled results
- explained expansion ZIPs
- conceptual Architect handoff

Question answered: **How could a specific advertiser diagnose and improve its geographic campaign plan?**

## Map boundary

MapLibre integration remains isolated under `src/map/`.

Responsibilities:

- render statewide ZCTA geometry
- consume domain-provided scores and ZIP sets
- apply presentation overrides through feature state
- keep inactive territories visible in neutral gray
- render hover, selection, filtering, current plan, recommendations, and seller focus
- render reach-gap and competitor evidence over the shared statewide source
- fit statewide, territory, and selected-ZIP bounds
- resize/refit after panel and viewport-mode changes
- preserve attribution

The map does not calculate scores, choose client recommendations, generate seller actions, or assign territories.

### Feature state

| State | Purpose |
|---|---|
| `hover` | transient hover emphasis |
| `selected` | gold selected ZIP outline |
| `dim` | score/category filtering |
| `campaign` | cyan current campaign or seller focus |
| `recommended` | green recommended expansion |
| `territoryDim` | neutral inactive territory context |
| `displayScore` | objective/simulation presentation score |

### Layer-focus law

Whenever any emphasized layer is active—reach gap, competitor footprint, current campaign, recommended expansion, or seller focus—the base opportunity surface remains visible but mutes.

Requirements:

- never hide all non-layer ZIPs;
- preserve orientation and territory context;
- keep selected/current/recommended ZIPs stronger than the muted base;
- render colored evidence outlines above ordinary ZIP boundaries;
- switch the fill-opacity expression with one paint-property update rather than writing state to every feature.

### Performance laws

- do not re-upload statewide geometry to recolor the map;
- diff feature-state sets before writing;
- use Sets for interaction membership checks;
- keep overlays as filtered layers over `zip-opportunities` rather than duplicate sources;
- reset applied-state tracking when a map instance is recreated;
- keep MapLibre in a cache-stable vendor chunk for standard builds;
- keep offline-review output as one inlinable script.

## Responsive layout laws

### Expanded mode

- one fixed browser viewport
- no document-level scrolling
- narrow independently scrollable sidebars
- both sidebars can collapse
- map remains the dominant surface

### Compact mode

- activated by the shared 900px `matchMedia` contract
- map stays full-bleed and visible by default
- panels become one-at-a-time bottom sheets
- workspace navigation remains available in the fixed bottom bar
- safe-area insets are respected
- no user-agent or device detection

Every new feature must render correctly in both modes.

## Geographic model

The primary selectable/scored unit is a five-digit ZIP identifier rendered with ZCTA geometry.

Every source Ohio ZCTA belongs to exactly one synthetic territory:

- Northeast Ohio · Cleveland–Akron
- Eastern Ohio · Youngstown
- Northwest Ohio · Toledo
- Central Ohio · Columbus
- West Central Ohio · Dayton
- Southwest Ohio · Cincinnati
- Southeast Ohio · Athens–Marietta

All Ohio is a view state, not a territory assignment. Production membership must later use governed definitions without changing feature or map contracts.

## Demonstration-data rules

- All opportunity, territory, advertiser, campaign, account, prospect, seller, coverage, competitor, recommendation, and simulation values are deterministic synthetic data.
- Curated Cleveland–Akron records remain distinguishable from statewide baseline records.
- Competitor footprints are illustrative ZIP memberships, not provider service-area claims.
- No company exports, credentials, internal reports, or real client data enter the repository.
- Every modeled screen includes an appropriate disclosure.
- Geographic source provenance is preserved.

## Delivery adapters

### Standard

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run preview
```

### GitHub Pages

Vite `pages` mode uses `/Reach-Opportunity-Lab/`. Merges to `main` publish to the stable review URL.

### All-offline review

```bash
npm run offline:all
```

The offline target generates statewide Census context, embeds all application assets and fixtures, rejects unapproved runtime requests, includes launchers, and validates that no linked assets or split chunks remain.

## Prohibited shortcuts

- monolithic HTML/JavaScript business implementation
- business rules in JSX event handlers
- scattered direct fixture imports
- score or recommendation calculation inside map expressions
- full statewide source re-upload for presentation changes
- map-owned territory, client recommendation, or seller-action generation
- duplicate overlay geometry sources
- hiding all non-layer geography when evidence is active
- document-level desktop scrolling
- device/user-agent detection
- uncontrolled randomness
- mixing client/internal data in one unfiltered model
- broad `any` typing
- real company/client/seller data
- undocumented or manually edited generated geography
- compiled-bundle patching as the offline source
- deployment-specific logic in domain or feature modules

## Scaling path

The production evolution should add the following without replacing the foundation:

- multiple fictional advertiser profiles, then governed advertiser adapters
- richer account/prospect/retention datasets
- additional state and major-city market packages
- governed territories and coverage definitions
- authenticated API adapters
- server-side scoring and model versioning
- role-based authorization
- persisted scenarios and seller queues
- Architect and CRM integrations
- observability, audit trails, and feature flags
- vector tiles or a governed basemap provider
