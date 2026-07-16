# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 2 — Statewide map foundation and differentiated product journeys

## Done

- Established repository governance and production-shaped boundaries in `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `PRODUCT_BUILD_SPEC.md`, and `BUILD_HANDOFF.md`.
- Migrated the application to Vite + React + strict TypeScript with MapLibre and Vitest.
- Added Node CI, reproducible npm installs, standardized merge-triggered releases, a validated all-offline review package, and a stable GitHub Pages preview.
- Added base-aware public asset resolution for local, Pages, release, and offline builds.
- Added a reproducible statewide Ohio market generator using documented 2020 Census-derived ZCTA geometry.
- Included every source Ohio ZCTA and validated exact geometry, opportunity-record, territory, and provenance coverage.
- Preserved curated Cleveland–Akron records and generated deterministic synthetic baseline metrics for every remaining Ohio ZCTA.
- Added seven deterministic synthetic major-city territories plus an All Ohio view.
- Added one shared territory selector across Opportunity Explorer, Client Growth Studio, and Seller Growth Studio.
- Built a fixed one-viewport expanded layout with independently scrollable/collapsible sidebars.
- Built a responsive compact mode at 900px and below: full-bleed map, one-at-a-time bottom sheets, fixed bottom product navigation, safe-area support, and no device detection.
- Restored a pastel cool-to-hot opportunity palette with neutral gray inactive territories, gold selection, cyan current-campaign emphasis, and green recommended-expansion emphasis.
- Added ZIP geometry camera focus: map/list selection zooms to official geometry; clearing selection returns to territory bounds; panel changes preserve current focus.
- Added stronger reach-gap and competitor fills/outlines plus more prominent layer controls.
- Added ZIP-level competitive intelligence to Opportunity Explorer: modeled competitor intersections, reach-gap status, and competitor detail cards that toggle typed map footprint layers.
- Expanded Client Growth Studio into a three-step geographic planning workflow: Current plan, Diagnose gaps, and Recommended plan.
- Added pure deterministic `clientGeography.ts` planning and tests for current footprint, reach-gap detection, competitor-pressure intersections, ranked expansion candidates, recommendation counts, and explanation generation.
- Added typed `recommended` MapLibre feature state so current campaign ZIPs remain cyan while recommended expansion ZIPs render independently in green without statewide geometry re-upload.
- Added dynamic reach-gap filters, plan-view controls, selected-ZIP campaign context, recommended ZIP explanations, diagnostic summary, and explicit strategy trade-offs.
- Built Client Growth Studio with a fictional advertiser, selectable deterministic strategies, current-versus-modeled results, and conceptual Architect handoff.
- Differentiated the internal workflow as Seller Growth Studio rather than a second Explorer.
- Added `sellerOpportunity.ts`, which deterministically converts ZIP/objective signals into synthetic prospects/accounts, urgency, evidence, and recommended seller actions.
- Replaced Seller Growth Studio's duplicate ZIP ranking with a prospect/account action queue and seller action brief; the map is now supporting geographic evidence.
- Optimized statewide map hot paths:
  - objective/simulation recolors use `displayScore` feature state instead of re-uploading the 2.7 MB GeoJSON source;
  - `dim`, `campaign`, `recommended`, and `territoryDim` writes are diffed against applied state;
  - hover/click territory checks use Sets;
  - selection touches only previous/current features;
  - overlays are filtered layers over one shared statewide source.
- Parallelized opportunity, overlay, and geometry startup loading while preserving the `ZipGeometrySource` boundary.
- Exposed `opportunitiesByZip` for O(1) feature lookups.
- Split MapLibre into a cache-stable vendor chunk for standard builds while preserving the offline target's single inlinable script.
- Scrubbed direct company-brand mentions; the product name is Reach Opportunity Lab.

## Product boundaries

- **Opportunity Explorer:** neutral market diagnosis — where opportunity exists, why a ZIP scores as it does, and which modeled coverage/competitor signals intersect it.
- **Client Growth Studio:** advertiser geographic planning — how a fictional campaign moves from current footprint through diagnosed gaps to a recommended plan.
- **Seller Growth Studio:** internal seller action — who to pursue, grow, or save next and what action to take.

Shared geography and score signals do not make these the same product. Each feature owns a different question and workflow.

## Next up

1. Merge and visually review the Client Growth geographic-planning workflow through the stable Pages URL.
2. Refine Client Growth recommended-ZIP ordering, legend, or compact presentation only if real-browser review exposes ambiguity.
3. Add richer synthetic advertiser profiles and allow switching among multiple client scenarios.
4. Expand Seller Growth Studio with deterministic account histories, prospect lists, and retention-save comparisons.
5. Add additional state/major-city market packages behind the same market/territory contracts.
6. Add the guided executive tour and remaining compact-mode polish.
7. Add automated WebGL visual-regression coverage for standard and offline adapters.

## Decisions log

- 2026-07-15 | DECISION: use Vite + React + strict TypeScript + MapLibre with domain, data, map, and feature boundaries
  Considered: monolithic HTML, untyped JavaScript, and a full-stack framework before a backend exists
  Rejected because: the first two create migration debt and the third adds infrastructure without product value
  Must preserve: business logic remains pure TypeScript; React and MapLibre stay at the edges

- 2026-07-15 | DECISION: synthetic data is delivered through typed repositories
  Considered: direct JSON imports in components and waiting for production APIs
  Rejected because: direct imports make demo plumbing permanent while waiting blocks the prototype
  Must preserve: future APIs replace composition, not screens or domain logic

- 2026-07-15 | DECISION: ZIP/ZCTA polygons are the primary selectable and scored geography
  Considered: large sales zones and a non-geographic dashboard
  Rejected because: the product promise is ZIP-level explainable opportunity
  Must preserve: territories group ZIPs but do not replace ZIP truth

- 2026-07-15 | DECISION: include every Ohio ZCTA and assign each ZIP to exactly one synthetic major-city territory
  Considered: 26 curated ZIPs only, unscored statewide context, and arbitrary grids
  Rejected because: fragmented geography looked like a mockup and neutral context did not make major territories explorable
  Must preserve: curated records remain distinguishable from generated baselines; production territory membership must later use governed definitions

- 2026-07-15 | DECISION: standard and all-offline maps are separate presentation adapters over one product
  Considered: bundled raster tiles in the standard app and replacing the online basemap everywhere
  Rejected because: tile packaging creates licensing/size concerns and a single reduced-detail basemap weakens normal review
  Must preserve: business/feature logic is shared; offline blocks unapproved runtime requests

- 2026-07-15 | DECISION: the executive shell is a fixed viewport with expanded and compact layout modes
  Considered: document-level scrolling, always-open panels, device detection, and a separate mobile build
  Rejected because: scrolling breaks the dashboard metaphor, fixed panels shrink the map, and device-specific implementations drift
  Must preserve: `useViewportMode`, `ProductViewContext.viewportMode`, and the 900px CSS breakpoint remain synchronized; map stays visible by default in compact mode

- 2026-07-16 | DECISION: active opportunity values use a pastel heat-map progression
  Considered: monochromatic blue and a highly saturated hot scale
  Rejected because: monochromatic blue weakens heat storytelling while saturated colors overpower the neutral basemap
  Must preserve: inactive territories remain gray; selection gold; current campaign cyan; recommended expansion green; supporting overlays remain visibly distinct

- 2026-07-16 | DECISION: map presentation changes flow through diffed MapLibre feature state over one statewide source
  Considered: full GeoJSON `setData` recolors, full-state rewrites, and duplicate overlay sources
  Rejected because: those approaches reparse geometry, issue unnecessary state writes, and duplicate polygons in memory
  Must preserve: `displayScore` is presentation-only; domain owns score truth; overlay layers filter the shared source; new visual states use diffed feature-state sets

- 2026-07-16 | DECISION: Opportunity Explorer is the diagnostic experience and Seller Growth Studio is the internal action workflow
  Considered: keeping both as ZIP-ranking views with different transforms and combining them into one screen
  Rejected because: duplicate map experiences confuse executives and fail to tell an internal-sales story; one combined screen mixes diagnosis with account/prospect action
  Must preserve: Explorer answers where/why/competitive context; Seller Growth answers who to pursue, grow, or save and what to do next

- 2026-07-16 | DECISION: Client Growth tells a three-step geographic planning story
  Considered: keeping one campaign layer throughout simulation, showing all diagnostic overlays simultaneously, and separating current, diagnostic, and recommended views
  Rejected because: one undifferentiated map cannot explain what changed, while always-on overlays create visual noise and weaken the executive narrative
  Must preserve: current ZIPs, reach gaps/competitor evidence, and recommended ZIPs remain distinct typed states; the simulation advances to the recommended view; geographic recommendations remain deterministic domain output

- 2026-07-16 | DECISION: releases are named `<Phase> Release <MAJOR.MINOR>.<build>` and tagged `v<MAJOR.MINOR>.<build>`
  Considered: generic build tags and manual semver releases
  Rejected because: generic tags lack maturity context and manual tagging does not scale with merge-triggered delivery
  Must preserve: phase comes from `RELEASE_PHASE`, major/minor from `package.json`, and build from CI run number

## Noticed

- Reach-gap and competitor fixtures currently describe Northeast Ohio only; Client Growth generates deterministic territory-specific diagnostic gap sets while competitor pressure remains based on available typed footprints.
- Competitor footprints are synthetic ZIP memberships, not provider service-area claims.
- Generated statewide metrics are baseline-quality synthetic records; curated Cleveland–Akron records contain richer narratives.
- MapLibre remains the largest standard-build dependency but is isolated in a cache-stable vendor chunk.
- Software WebGL can render the map in headless Chromium when SwiftShader flags are enabled, but raster basemap tiles may be blocked in automation.
- Product and plan tabs still need full keyboard arrow navigation and roving tabindex.
- The temporary implementation branch `agent/map-clarity-sales-studio` was abandoned because it predated Fable's optimization and branding merges; current work is based on commit `c4e0904…` or later.

## How to run

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

Statewide market refresh and validation:

```bash
npm run geometry:refresh
npm run geometry:validate
```

All-offline context, package, and validation:

```bash
npm run offline:all
```
