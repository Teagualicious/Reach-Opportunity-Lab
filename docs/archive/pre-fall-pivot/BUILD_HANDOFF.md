# Reach Opportunity Lab — Current Build Handoff

**Purpose:** Give a new contributor enough context to continue the application without undoing product, map, performance, responsive, or trust boundaries. Read [`STATUS.md`](STATUS.md) first and [`ARCHITECTURE.md`](ARCHITECTURE.md) for the durable laws.

## 1. Current product

The application contains one statewide Ohio ZIP/ZCTA intelligence layer and three visibly ordered workspaces.

### Market Opportunity Map

**User:** market strategists, sellers, and sales leaders.

**Question:** Where is opportunity, why does it exist, and what modeled coverage or competitive signals affect it?

Current behavior:

- every source Ohio ZCTA displayed;
- All Ohio plus seven synthetic major-city territories;
- pastel opportunity heat surface;
- score/category filters and territory ranking;
- selected-ZIP score explanation, confidence, and market context;
- modeled reach-gap status;
- synthetic competitor intersections and footprint toggles.

### Seller Action Center

**User:** local sellers and sales managers.

**Question:** Who should a seller pursue, grow, or save next, and what should they do?

Current behavior:

- New Business, Account Growth, Retention Risk, and Category Opportunity objectives;
- objective-specific transformed ZIP priorities;
- deterministic synthetic prospect/account action queue;
- entity type, urgency, evidence, and recommended next step;
- action modeling;
- map retained as supporting geographic evidence.

Do not reduce Seller Action Center to another ZIP ranking screen.

### Client Campaign Planner

**User:** account executives and advertiser teams.

**Question:** How could a specific fictional advertiser diagnose and improve its geographic campaign plan?

Current behavior:

- fictional Lakefront Automotive baseline;
- Current plan → Diagnose gaps → Recommended plan;
- current campaign ZIPs in cyan;
- deterministic reach-gap and competitor-pressure diagnosis;
- four deterministic strategies;
- current-versus-modeled metrics and ranges;
- explained recommended ZIPs in green;
- strategy trade-offs;
- conceptual Architect handoff.

### Shared workspace guide

Every right panel begins with `ExperienceGuide` and states:

- workspace name;
- purpose;
- intended user;
- what to do next.

Visible workspace order is fixed:

1. Market Opportunity Map
2. Seller Action Center
3. Client Campaign Planner

Compact navigation uses shorter visible labels but preserves full accessible names.

## 2. Shared shell and responsive state

`ProductShell` owns:

- workspace mode;
- selected territory or All Ohio;
- expanded/compact viewport mode;
- left panel state;
- right panel state;
- global reset version.

`ProductViewContext` supplies:

- territory definition;
- territory ZIPs;
- viewport bounds;
- panel-layout version;
- viewport mode.

### Expanded

- fixed one-viewport dashboard;
- no page scrolling;
- narrow independent sidebar scrolling;
- collapsible left/right panels;
- map remains the dominant surface.

### Compact

- shared `matchMedia` breakpoint at 900px;
- map visible full-bleed by default;
- one-at-a-time bottom sheets;
- fixed bottom workspace navigation;
- safe-area support;
- no device detection.

All new UI must work in both modes.

## 3. Statewide geography and fixtures

```text
public/data/
  ohio-zcta-2020.geojson
  ohio-opportunities.json
  ohio-market.provenance.json
  market-overlays.json
```

Commands:

```bash
npm run geometry:refresh
npm run geometry:validate
```

The generator includes every source Ohio ZCTA, assigns one synthetic territory, preserves curated Cleveland–Akron records, generates deterministic baselines elsewhere, and writes provenance.

Generated files are never edited manually.

Territories:

- Northeast Ohio · Cleveland–Akron
- Eastern Ohio · Youngstown
- Northwest Ohio · Toledo
- Central Ohio · Columbus
- West Central Ohio · Dayton
- Southwest Ohio · Cincinnati
- Southeast Ohio · Athens–Marietta

All Ohio is a view state, not a territory assignment.

## 4. Source ownership

```text
src/
  app/
    App.tsx
    ProductShell.tsx
    ProductViewContext.ts
    useViewportMode.ts
  components/
    ExperienceGuide.tsx
    TerritorySelector.tsx
    MapLayerControls.tsx
    ClientPlanControls.tsx
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
    clientGeography.ts
    marketMode.ts
    sellerOpportunity.ts
    mapOverlay.ts
  features/
    zip-explorer/       Market Opportunity Map implementation
    market-growth/      Seller Action Center implementation; folder retained for compatibility
    client-growth/      Client Campaign Planner implementation
  map/
    OpportunityMap.tsx
    mapExpressions.ts
    geometryBounds.ts
    offlineBasemapStyle.ts
  styles/
    tokens.css
    base.css
    layout.css
    components.css
    layers.css
    polish.css
    client-growth-v2.css
    experience-guide.css
scripts/
  build-ohio-market.mjs
  validate-ohio-market.mjs
  build-offline-map-context.mjs
  build-offline-review.mjs
  validate-offline-review.mjs
```

Dependency direction:

```text
fixtures
  ↓
repository / geometry adapters
  ↓
pure domain modules
  ↓
shared application state
  ↓
feature orchestration
  ↓
MapLibre presentation
```

## 5. Map implementation

`OpportunityMap` creates one statewide `zip-opportunities` source and promotes `zip` as feature ID.

Feature state:

| State | Purpose |
|---|---|
| `hover` | transient emphasis |
| `selected` | gold selected ZIP |
| `dim` | filter fade |
| `campaign` | cyan current campaign or seller focus |
| `recommended` | green client expansion |
| `territoryDim` | neutral inactive territory context |
| `displayScore` | presentation score for objectives/simulations |

### Supporting-layer focus

Whenever a reach-gap or competitor evidence layer is active, the base opportunity surface mutes. It remains visible so users keep geographic orientation.

Implementation requirement:

- use `zipFillOpacityEvidenceExpression` for the muted state;
- switch `fill-opacity` with one `setPaintProperty` call;
- do not write a global focus flag to every ZCTA;
- selected/current/recommended states remain distinct;
- ordinary current-plan, recommended-plan, and seller-focus views use normal heat-map opacity when no supporting evidence layer is active.

### Performance constraints

Preserve Fable's optimization pass:

- no `setData` recolors of statewide geometry;
- no duplicate per-overlay geometry sources;
- diff feature-state sets;
- Set-based interaction checks;
- O(1) `opportunitiesByZip` lookup;
- one cache-stable MapLibre vendor chunk;
- one inlinable offline script.

### Camera behavior

- territory selection fits territory bounds;
- ZIP selection fits official Polygon or MultiPolygon geometry;
- clearing ZIP selection returns to territory bounds;
- panel changes call `resize()` and preserve current focus.

## 6. Workspace implementation notes

### Market Opportunity Map

`ZipExplorer` owns filters, selected ZIP, ranking, reach-gap visibility, competitor visibility, and right-panel analysis.

Competitor detail cards toggle the same typed footprint layers used by the left controls.

### Seller Action Center

`marketMode.ts` owns objective score transforms.

`sellerOpportunity.ts` deterministically generates entity name, entity kind, visual tone, urgency, headline, recommended action, and evidence.

`MarketGrowthStudio.tsx` owns queue selection and action-modeling theater only.

### Client Campaign Planner

`clientScenario.ts` owns deterministic metric simulation.

`clientGeography.ts` owns deterministic current-footprint diagnosis, reach-gap detection, competitor intersections, expansion ranking, reasons, and summary counts.

`ClientGrowthStudio.tsx` owns Current/Diagnose/Recommended UI state and simulation theater.

MapLibre renders supplied ZIP sets; it does not choose recommendations.

## 7. Trust boundaries

- All business and modeled values are deterministic synthetic demonstration data.
- Competitor footprints are illustrative ZIP memberships, not service-area claims.
- Curated and statewide baseline records remain distinguishable.
- No real company exports, credentials, client data, seller data, or internal reports enter the repository.
- Client-facing and internal-only models remain separated.
- Architect is conceptual; no live integration is represented.

## 8. Delivery

### Local

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run preview
```

### GitHub Pages

Merges to `main` deploy automatically to:

```text
https://teagualicious.github.io/Reach-Opportunity-Lab/
```

### All-offline

```bash
npm run offline:all
```

The offline target embeds data, geography, Census context, JavaScript, and CSS; rejects external requests; validates no linked assets or split chunks; and packages Windows/macOS launchers.

### Releases

```text
Name: <Phase> Release <MAJOR.MINOR>.<build>
Tag:  v<MAJOR.MINOR>.<build>
```

Do not create normal releases or tags manually.

## 9. Required validation

```bash
npm run typecheck
npm run test
npm run build
```

Separate offline validation:

```bash
npm run offline:all
```

Real-browser review remains required for final visual judgment.

## 10. Preserve

- strict TypeScript boundaries;
- deterministic scoring, planning, simulation, and seller actions;
- exact statewide ZIP/territory coverage;
- workspace order and names;
- `ExperienceGuide` at the top of every right panel;
- expanded and compact layout laws;
- map-first desktop proportions;
- feature-state performance optimization;
- pastel base opportunity surface;
- supporting-layer muting for reach gaps and competitor footprints;
- gold selection, cyan current, green recommended;
- synthetic disclosures and provenance;
- client/internal separation.

## 11. Do not reintroduce

- jargon-only workspace names;
- duplicate Market/Seller workflows;
- document-level desktop scrolling;
- business calculations in JSX or MapLibre;
- statewide geometry re-upload for recoloring;
- duplicate overlay geometry sources;
- hiding all non-layer geography;
- map-owned territory, recommendation, or seller-action generation;
- manually edited generated geography;
- uncontrolled randomness;
- scattered direct fixture access;
- broad `any` typing;
- real company/client/seller data;
- fake live integrations;
- deployment-specific domain logic;
- compiled-bundle patching in the offline target.

## 12. Next implementation sequence

1. Review the workspace clarity and supporting-layer focus through the stable Pages URL.
2. Add multiple deterministic fictional advertiser profiles to Client Campaign Planner.
3. Add richer account histories and retention-save comparisons to Seller Action Center.
4. Add additional state and major-city market packages.
5. Add guided executive tour, keyboard tab behavior, compact polish, and visual regression.
