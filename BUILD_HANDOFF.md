# Reach Opportunity Lab — Current Build Handoff

**Purpose:** Explain the application that exists now, the boundaries that must be preserved, and the next implementation tasks. Product vision remains in [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md); architectural laws remain in [`ARCHITECTURE.md`](ARCHITECTURE.md); current state remains in [`STATUS.md`](STATUS.md).

## 1. Current product

The application contains one statewide Ohio ZIP/ZCTA intelligence layer and three distinct experiences.

### Opportunity Explorer

Answers: **Where is opportunity, why does it exist, and what modeled competitive/coverage conditions affect it?**

Current behavior:

- every source Ohio ZCTA displayed;
- All Ohio plus seven synthetic major-city territories;
- pastel opportunity heat map;
- score/category filters and ranked ZIPs;
- ZIP hover, selection, official-geometry zoom, score explanation, confidence, and market context;
- ZIP-level modeled reach-gap status;
- ZIP-level synthetic competitor intersections;
- competitor detail cards that toggle typed footprint layers.

### Client Growth Studio

Answers: **How could a specific fictional advertiser improve its campaign plan?**

Current behavior:

- fictional Lakefront Automotive baseline;
- four deterministic strategies;
- territory-aware current footprint and recommended expansion ZIPs;
- staged simulation theater;
- current-versus-modeled metrics and ranges;
- conceptual Architect handoff.

### Seller Growth Studio

Answers: **Who should a seller pursue, grow, or save next, and what should they do?**

Current behavior:

- New Business;
- Account Growth;
- Retention Risk;
- Category Opportunity;
- objective-specific ZIP score transforms;
- deterministic synthetic prospect/account action queue;
- entity type, urgency, evidence, and recommended next action;
- action simulation;
- map retained as supporting geographic evidence.

Do not reduce Seller Growth Studio to another ranked ZIP list. It shares market intelligence with Explorer but owns a different workflow and user question.

All business, opportunity, territory, advertiser, campaign, account, prospect, seller, competitor, recommendation, and simulation values are synthetic.

## 2. Shared shell and responsive state

`ProductShell` owns:

- product mode;
- selected territory or All Ohio;
- expanded/compact viewport mode;
- left panel state;
- right panel state;
- global reset version.

`ProductViewContext` supplies:

- selected territory definition;
- selected territory ZIPs;
- viewport bounds;
- panel-layout version;
- viewport mode.

### Expanded mode

- fixed one-viewport dashboard;
- no document-level scrolling;
- narrow independently scrollable sidebars;
- collapsible left/right panels;
- map is the dominant surface;
- MapLibre resizes and preserves current ZIP/territory focus after panel changes.

### Compact mode

- driven by `useViewportMode` / `matchMedia` at 900px;
- no user-agent detection;
- map full-bleed and visible by default;
- controls/details are one-at-a-time bottom sheets;
- product navigation is a fixed bottom bar;
- safe-area insets and 16px selects are preserved.

Every new feature must work in both modes.

## 3. Statewide data and geography

Generated fixtures:

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

Implemented by:

```text
scripts/build-ohio-market.mjs
scripts/validate-ohio-market.mjs
.github/workflows/generate-ohio-market.yml
```

The builder:

1. downloads the documented simplified 2020 Census-derived Ohio ZCTA source;
2. includes every source Ohio ZCTA;
3. rounds coordinates to five decimals;
4. assigns every ZIP to one deterministic synthetic territory;
5. preserves curated Cleveland–Akron records;
6. generates deterministic synthetic baseline metrics elsewhere;
7. writes provenance.

The validator rejects missing/duplicate ZIPs, invalid geometry, coordinate anomalies, invalid scores, incomplete territory coverage, and missing provenance.

Generated files are never edited manually.

Current synthetic territories:

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
    sellerOpportunity.ts
    mapOverlay.ts
  features/
    zip-explorer/
    client-growth/
    market-growth/       implementation folder; UI is Seller Growth Studio
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
shared app view state
  ↓
feature workflow orchestration
  ↓
MapLibre presentation adapters
```

## 5. Map implementation

`OpportunityMap` creates one statewide `zip-opportunities` GeoJSON source and promotes `zip` as the feature ID.

Feature state:

| State | Purpose |
|---|---|
| `hover` | transient emphasis |
| `selected` | gold selected ZIP outline |
| `dim` | score/category filter fade |
| `campaign` | current/recommended campaign or seller-action emphasis |
| `territoryDim` | neutral gray inactive context |
| `displayScore` | presentation score for objectives/simulations |

Map rules:

- scores arrive already calculated;
- paint expressions do not calculate business logic;
- base statewide geometry is uploaded once per map instance;
- objective/simulation recolors use `displayScore` feature state;
- `dim`, `campaign`, and `territoryDim` updates are diffed;
- selection updates touch only previous/current ZIPs;
- territory hit tests use Sets;
- reach-gap and competitors are filtered layers over the shared source;
- selected territory ZIPs alone are interactive;
- selection zooms to official geometry;
- clearing selection returns to territory bounds;
- panel/viewport changes call `resize()` and preserve current focus.

Visual rules:

- light grayscale basemap;
- pastel cool-to-hot active opportunity surface;
- inactive territories use low-opacity gray and very subtle boundaries;
- selection uses a strong gold outline;
- campaign/action emphasis uses a strong cyan outline;
- enabled reach-gap and competitor layers use high-contrast fills and outlines;
- layer colors remain fixture-owned where applicable.

### Performance constraints

Preserve the Fable optimization pass:

- do not call `setData` to recolor the statewide source;
- do not restore per-overlay GeoJSON sources;
- do not rewrite all 1,233 feature states for a one-ZIP change;
- do not replace Set membership checks with array scans;
- keep `opportunitiesByZip` for O(1) feature lookup;
- keep standard MapLibre code in the vendor chunk;
- keep offline-review output as one inlinable script.

## 6. Opportunity Explorer ownership

`ZipExplorer` owns:

- minimum score and category filters;
- selected ZIP;
- ranked territory ZIPs;
- reach-gap visibility;
- competitor visibility;
- selected ZIP details.

Selected ZIP competitive details are derived from typed `MarketOverlayData`:

- number of intersecting synthetic competitor footprints;
- modeled reach-gap status;
- competitor label/subtitle/color;
- direct footprint-layer toggle.

Footprints are illustrative ZIP memberships, not service-area claims.

## 7. Client Growth ownership

`clientScenario.ts` remains the canonical deterministic simulation engine.

- Northeast Ohio uses the curated Lakefront campaign ZIPs.
- Other territories use deterministic synthetic footprints.
- Recommended expansions stay within the selected territory.
- Identical strategy inputs produce identical output.
- React owns simulation theater, not calculation truth.

## 8. Seller Growth ownership

`marketMode.ts` owns objective score transforms.

`sellerOpportunity.ts` converts a ZIP, objective, transformed priority score, and stable queue index into a deterministic synthetic action item:

- entity name;
- entity kind;
- visual tone;
- urgency label;
- headline;
- recommended action;
- supporting evidence.

`MarketGrowthStudio.tsx` (implementation folder retained for compatibility) owns the UI queue, selection, and action simulation.

Do not put seller entity/action generation in JSX or MapLibre.

## 9. Supporting overlays

`MarketOverlayData` and `CompetitorFootprint` remain typed and validated.

Current fixtures cover Northeast Ohio only. Elsewhere, Explorer correctly reports no modeled intersection. Future statewide definitions should replace fixture data without changing controls, detail cards, or layer contracts.

Layer visibility requirements:

- checked controls must be visually prominent;
- reach-gap and competitor fills must remain visible over the heat surface;
- lines must remain distinguishable at territory and selected-ZIP zoom levels;
- campaign/selection emphasis must remain stronger than ordinary boundaries.

## 10. Delivery

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

### All-offline

```bash
npm run offline:all
```

The target generates statewide Census context, builds the dedicated offline entry, embeds all assets/data, blocks external requests, validates no split chunks/linked assets, and packages Windows/macOS launchers.

### Releases

Merges to `main` publish:

```text
Name: <Phase> Release <MAJOR.MINOR>.<build>
Tag:  v<MAJOR.MINOR>.<build>
```

- phase: `RELEASE_PHASE` in `ci.yml`;
- major/minor: `package.json`;
- build: monotonic CI run number.

Do not create manual releases/tags for normal builds.

## 11. Validation

Required:

```bash
npm run typecheck
npm run test
npm run build
```

Separate all-offline validation:

```bash
npm run offline:all
```

Browser review remains required for final spacing and WebGL visuals. Headless Chromium can use SwiftShader flags, but raster basemap access may be blocked in automation.

## 12. Preserve

- strict TypeScript boundaries;
- deterministic scoring, seller actions, and simulation;
- exact statewide ZIP/territory coverage;
- curated versus baseline record distinction;
- shared territory/viewport state;
- expanded and compact layout contracts;
- map-first desktop proportions;
- feature-state performance optimizations;
- pastel opportunity heat and neutral inactive context;
- prominent typed evidence layers;
- ZIP-level competitive details;
- product split between Explorer, Client Growth, and Seller Growth;
- synthetic disclosures and geographic provenance;
- client/internal separation;
- Architect as activation destination.

## 13. Do not reintroduce

- document-level desktop scrolling;
- duplicate Explorer/Seller workflows;
- business calculations in MapLibre expressions or JSX handlers;
- statewide geometry re-upload for recoloring;
- duplicate overlay geometry sources;
- map-owned territory or seller-action generation;
- manually edited generated geography;
- uncontrolled randomness;
- direct fixture access scattered through UI;
- broad `any` typing;
- real company/client/seller data;
- fake live integrations;
- deployment-specific domain logic;
- compiled-bundle patching or linked assets in the offline target.

## 14. Next implementation sequence

1. Review this differentiated UI through the stable Pages URL on the target laptop.
2. Extend campaign/coverage comparison controls through Client Growth Studio.
3. Add richer deterministic account/prospect/retention datasets to Seller Growth Studio.
4. Add additional state and major-city market packages.
5. Add the executive tour, keyboard tab behavior, compact-mode polish, and automated visual regression.
