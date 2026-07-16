# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 2 — Statewide map foundation and differentiated product journeys

## Done

- Established production-shaped domain, data, application, feature, map, and delivery boundaries.
- Migrated to Vite + React + strict TypeScript with MapLibre and Vitest.
- Added reproducible npm installs, CI, merge-triggered releases, GitHub Pages, and a validated all-offline package.
- Added every source Ohio ZCTA, generated deterministic synthetic opportunity records statewide, and preserved curated Cleveland–Akron records.
- Added seven synthetic major-city territories plus All Ohio.
- Added a fixed one-viewport expanded shell and a shared compact mode with map-first bottom sheets.
- Added independently scrollable/collapsible sidebars and ZIP/territory camera refitting.
- Added pastel opportunity heat, neutral inactive context, gold selection, cyan current-plan/seller focus, and green recommended expansion.
- Added stronger reach-gap and competitor evidence layers.
- Added supporting-layer focus: whenever a reach-gap or competitor layer is active, the base opportunity surface mutes rather than disappearing.
- Renamed and reordered the visible workspaces:
  1. Market Opportunity Map
  2. Seller Action Center
  3. Client Campaign Planner
- Added a reusable right-panel workspace guide showing purpose, intended user, and the next action.
- Built Market Opportunity Map ZIP diagnosis, filters, score explanation, reach-gap status, and synthetic competitor intersections.
- Built Seller Action Center objective queues with deterministic prospects/accounts, urgency, evidence, recommended action, and action modeling.
- Built Client Campaign Planner as Current plan → Diagnose gaps → Recommended plan with deterministic geographic recommendations and Architect handoff.
- Added `clientGeography.ts` and `sellerOpportunity.ts` pure domain modules with tests.
- Preserved Fable's statewide performance work:
  - one statewide source;
  - `displayScore` recoloring instead of geometry re-upload;
  - diffed `dim`, `campaign`, `recommended`, and `territoryDim` state;
  - filtered overlays over the shared source;
  - Set-based hit tests;
  - O(1) ZIP lookup;
  - concurrent startup loading;
  - MapLibre vendor chunking;
  - one inlinable offline script.

## Workspace boundaries

- **Market Opportunity Map:** where is opportunity, why does it exist, and what modeled coverage or competitive signals affect it?
- **Seller Action Center:** who should a seller pursue, grow, or save next, and what action should they take?
- **Client Campaign Planner:** how could a specific fictional advertiser diagnose and improve its geographic campaign plan?

Shared geography does not make these the same product. Each workspace owns a distinct user, question, and next action.

## Next up

1. Merge and visually review the workspace-guide and supporting-layer focus pass through the stable Pages URL.
2. Add multiple deterministic fictional advertiser profiles to Client Campaign Planner.
3. Expand Seller Action Center with account histories, prospect lists, and retention-save comparisons.
4. Add additional state and major-city market packages behind the existing market/territory contracts.
5. Add the guided executive tour, full keyboard tab behavior, and remaining compact-mode polish.
6. Add automated WebGL visual-regression coverage for standard and offline adapters.

## Decisions log

- 2026-07-15 | DECISION: use Vite + React + strict TypeScript + MapLibre with pure domain and typed adapter boundaries
  Considered: monolithic HTML, untyped JavaScript, and premature full-stack infrastructure
  Rejected because: they create migration debt or infrastructure without current product value
  Must preserve: business logic remains pure TypeScript; React and MapLibre stay at the edges

- 2026-07-15 | DECISION: ZIP/ZCTA polygons are the primary selectable and scored geography
  Considered: large sales zones and a non-geographic dashboard
  Rejected because: the product promise is ZIP-level explainable opportunity
  Must preserve: territories group ZIPs but do not replace ZIP truth

- 2026-07-15 | DECISION: include every Ohio ZCTA and assign each ZIP to exactly one synthetic major-city territory
  Considered: 26 curated ZIPs only, unscored statewide context, and arbitrary grids
  Rejected because: fragmented geography looked like a mockup and neutral context did not make major territories explorable
  Must preserve: curated records remain distinguishable from generated baselines; production territories later use governed definitions

- 2026-07-15 | DECISION: standard and all-offline maps are separate presentation adapters over one product
  Considered: bundled raster tiles and replacing the online map with reduced offline context
  Rejected because: tile packaging creates licensing/size concerns and reduced context weakens normal review
  Must preserve: feature/domain logic is shared; offline blocks unapproved runtime requests

- 2026-07-15 | DECISION: expanded and compact layouts share one viewport-mode contract
  Considered: document scrolling, always-open panels, device detection, and a separate mobile build
  Rejected because: those approaches shrink the map, break the dashboard metaphor, or drift apart
  Must preserve: `useViewportMode`, `ProductViewContext.viewportMode`, and the 900px CSS breakpoint remain synchronized

- 2026-07-16 | DECISION: opportunity uses a pastel heat progression with distinct typed emphasis states
  Considered: monochromatic blue and a saturated hot scale
  Rejected because: monochromatic blue weakens heat storytelling while saturated colors overpower the basemap
  Must preserve: inactive gray, selected gold, current cyan, recommended green, and fixture-owned evidence colors

- 2026-07-16 | DECISION: map presentation changes use diffed feature state over one statewide source
  Considered: full GeoJSON recolors, full-state rewrites, and duplicate overlay geometry
  Rejected because: those approaches reparse geometry, issue unnecessary writes, and duplicate polygons
  Must preserve: score/recommendation truth stays in domain modules; MapLibre only renders supplied state

- 2026-07-16 | DECISION: the three visible workspaces use plain business-language names and explicit guidance
  Considered: retaining internal product jargon and relying on users to infer each workflow
  Rejected because: executives should understand purpose, audience, and the next step immediately
  Must preserve: visible order is Market Opportunity Map → Seller Action Center → Client Campaign Planner; each right panel begins with the shared workspace guide

- 2026-07-16 | DECISION: active supporting evidence layers mute the base opportunity surface
  Considered: leaving full heat-map intensity beneath reach-gap/competitor overlays, hiding non-layer ZIPs, and globally muting every workspace at all times
  Rejected because: full intensity washes out evidence, hiding context removes orientation, and permanent muting weakens ordinary campaign and seller views
  Must preserve: reach-gap or competitor visibility switches the base fill-opacity expression with one paint-property update; base ZIPs remain visible; selected/current/recommended states remain distinct

- 2026-07-16 | DECISION: Client Campaign Planner tells Current → Diagnose → Recommended
  Considered: one campaign layer and all evidence visible simultaneously
  Rejected because: users could not tell what changed and always-on evidence created noise
  Must preserve: current ZIPs, diagnostic evidence, and recommendations remain separate typed states

- 2026-07-16 | DECISION: Market Opportunity Map diagnoses while Seller Action Center operationalizes
  Considered: two differently recolored ZIP ranking screens and one combined screen
  Rejected because: duplicate map experiences confuse users and a combined screen mixes diagnosis with seller action
  Must preserve: market diagnosis and seller execution remain different workflows

## Noticed

- Competitor fixtures currently cover Northeast Ohio only; they are illustrative ZIP memberships, not service-area claims.
- Territory-specific client reach gaps are deterministic demonstration output.
- Generated statewide records are baseline quality; curated Cleveland–Akron records have richer narratives.
- MapLibre remains the largest dependency but is isolated in a cache-stable vendor chunk.
- Product and plan tabs still need full arrow-key navigation and roving tabindex.

## Run and validate

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run preview
```

Statewide refresh:

```bash
npm run geometry:refresh
npm run geometry:validate
```

All-offline package:

```bash
npm run offline:all
```
