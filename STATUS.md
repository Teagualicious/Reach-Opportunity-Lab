# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 2 — Shared map and first product journeys

## Done

- Established repository governance and production-shaped boundaries in `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `PRODUCT_BUILD_SPEC.md`, and `BUILD_HANDOFF.md`.
- Migrated the repository from the Python template to Vite + React + strict TypeScript with MapLibre and Vitest; removed the obsolete Python requirements, smoke tests, and fixture.
- Added Node-based CI that installs dependencies, typechecks, tests, and builds on every push and pull request.
- Added a main-branch release job that publishes static-build and source ZIP files; the first merged application release is available under `build-106`.
- Added typed opportunity-domain contracts, score validation, confidence, priority bands, and synthetic ZIP opportunity fixtures.
- Added a typed `DemoOpportunityRepository` and replaceable ZIP geometry-source boundary.
- Added a Census TIGERweb source that requests official 2020 Census ZCTA boundaries for the exact demonstration ZIPs; the app clearly labels and falls back to local geometry if the service is unavailable.
- Added an OpenStreetMap basemap through the isolated MapLibre adapter.
- Added a cool-to-hot opportunity palette, ZIP hover/selection, filter dimming, campaign highlighting, score overrides, reset behavior, and attribution.
- Added typed `MarketOverlayData` and `CompetitorFootprint` contracts with validation against the active market ZIP set.
- Added synthetic reach-gap and competitor footprint fixtures, reusable layer controls, and config-driven MapLibre overlay sources/layers.
- Built Opportunity Explorer filters for minimum score and category strength, supporting-layer toggles, ranked ZIPs, explainable score breakdowns, and data-source disclosure.
- Built the first Client Growth Studio journey for fictional Lakefront Automotive: campaign footprint, four strategies, deterministic simulation theater, current-versus-simulated metrics, explanation, and conceptual Architect handoff.
- Built the first Market Growth Studio journey with New Business, Account Growth, Retention Risk, and Category Opportunity modes, objective-specific score weighting, map recoloring, fictional examples, and recommended actions.
- Synchronized README, agent instructions, architecture, and build handoff with the actual React/TypeScript application.
- Current branch validation: CI run 122 passed install, strict typecheck, Vitest, and production build.

## Next up

1. Add a reproducible build-time Census data-preparation script and check in a simplified official Cleveland–Akron ZCTA fixture so geometry does not depend on a browser-time request.
2. Extend supporting overlays into Client Growth Studio with explicit current campaign, reach-gap, and recommended expansion controls.
3. Expand Client Growth Studio result transitions, strategy trade-off explanations, and accessible simulation timing.
4. Expand Market Growth Studio with richer synthetic account/prospect datasets and complete retention-save comparisons.
5. Add the nine-step guided executive tour and mobile bottom-sheet interaction.
6. Add visual regression/browser testing once a WebGL-capable CI environment is available.

## Decisions log

- 2026-07-15 | DECISION: use Vite + React + strict TypeScript + MapLibre with domain, data, map, and feature boundaries
  Considered: monolithic HTML, untyped JavaScript, and a full-stack framework before a backend exists
  Rejected because: the first two create migration debt and the third adds infrastructure without product value
  Must preserve: business logic remains pure TypeScript; React and MapLibre stay at the edges

- 2026-07-15 | DECISION: synthetic data is delivered through typed repositories
  Considered: importing JSON directly in components or waiting for production APIs
  Rejected because: direct imports make demo plumbing permanent while waiting blocks the prototype
  Must preserve: future APIs replace repository composition, not screens and domain logic

- 2026-07-15 | DECISION: the primary selectable and scored unit is a ZIP-like ZCTA polygon
  Considered: large sales zones or a non-geographic dashboard
  Rejected because: the intended product gives each ZIP its own opportunity score
  Must preserve: sales zones remain optional groupings or overlays

- 2026-07-15 | DECISION: use official Census ZCTA geometry through a replaceable source, with an explicit fallback
  Considered: synthetic polygons, one-off downloaded files, and fetching directly inside the map component
  Rejected because: those choices either miss product intent, lose provenance, or violate module boundaries
  Must preserve: geometry access remains behind `ZipGeometrySource`; the UI discloses official versus fallback geometry

- 2026-07-15 | DECISION: use an OpenStreetMap raster basemap for the local prototype
  Considered: blank background, credentialed commercial maps, and custom vector tiles
  Rejected because: blank space is not a real map, commercial tiles add credentials, and custom tiles are premature
  Must preserve: attribution remains visible and the provider stays isolated in the map adapter

- 2026-07-15 | DECISION: opportunity scores use a cool-to-hot palette
  Considered: preserving a single blue ramp
  Rejected because: increasingly valuable ZIPs need immediate visual recognition
  Must preserve: low scores remain cool, high scores progress through yellow/orange to red, and selection remains gold

- 2026-07-15 | DECISION: client simulations are deterministic domain functions with staged UI theater
  Considered: random outputs, hard-coded result cards, and live AI calls
  Rejected because: randomness damages repeatability, hard-coded screens do not scale, and live AI is out of prototype scope
  Must preserve: identical strategy inputs produce identical outputs and all results remain labeled illustrative

- 2026-07-15 | DECISION: supporting map layers use typed ZIP-membership definitions
  Considered: hard-coded MapLibre polygons, runtime polygon intersection, and config-driven ZIP memberships
  Rejected because: hard-coded layers mix business data with rendering and polygon intersection is unnecessary for deterministic demo coverage
  Must preserve: validate overlay ZIPs against the market; MapLibre renders selected definitions but does not own them

- 2026-07-15 | DECISION: remove the obsolete Python project scaffold
  Considered: keeping pytest and Node workflows side by side for historical reasons
  Rejected because: the repository is now a TypeScript product and duplicate toolchains create false instructions and maintenance debt
  Must preserve: Vitest and Node CI are the only active application test/build system unless a real Python service is intentionally introduced later

## Noticed

- Browser-time official geometry and basemap rendering require internet access. The next geometry task should pin a reproducible official fixture; offline basemap packaging requires a separate licensing and size decision.
- The Vite build reports a large initial JavaScript chunk because MapLibre is bundled up front. Code splitting can be considered after product journeys stabilize.
- Automated visual testing is blocked in the current container because Chromium cannot initialize WebGL.
- Synthetic competitor footprints currently use deterministic ZIP membership, not exact provider service-area polygons. This is appropriate for the prototype but must be replaced by governed coverage data in production.

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
