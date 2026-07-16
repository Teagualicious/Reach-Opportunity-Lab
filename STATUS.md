# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 2 — Shared map and first product journeys

## Done

- Established repository governance and production-shaped boundaries in `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `PRODUCT_BUILD_SPEC.md`, and `BUILD_HANDOFF.md`.
- Migrated the repository to Vite + React + strict TypeScript with MapLibre and Vitest; removed the obsolete Python scaffold.
- Added Node-based CI that installs dependencies, typechecks, tests, and builds on every push and pull request.
- Added a main-branch release job that publishes static-build and source ZIP files.
- Added a main-branch GitHub Pages workflow that publishes one stable browser preview after each merge.
- Added base-aware public asset resolution so local, release, offline, and GitHub Pages builds share the same repository/data contracts.
- Added typed opportunity-domain contracts, score validation, confidence, priority bands, and synthetic ZIP opportunity fixtures.
- Added a typed `DemoOpportunityRepository` and replaceable ZIP geometry-source boundary.
- Added a reproducible geometry pipeline that filters a documented 2020 Census-derived Ohio ZCTA source to the 26 demonstration ZIPs.
- Checked in `cleveland-akron-zcta-2020.geojson` plus explicit provenance; runtime geometry no longer depends on a browser-time Census request.
- Added `StaticZctaGeometrySource` as the runtime default and retained the synthetic geometry only as an emergency fallback.
- Added fixture validation for exact ZIP membership/order, duplicate detection, polygon geometry, coordinate sanity, feature count, and provenance.
- Added an OpenStreetMap basemap through the isolated standard MapLibre adapter.
- Added a dedicated all-offline MapLibre review adapter using bundled Census TIGER/Line roads, hydrography, county context, and local place labels.
- Added a reproducible all-offline context generator, single-file packager, Windows/macOS launchers, and hard runtime request boundary.
- Added all-offline validation for embedded assets, geographic context, external document dependencies, Vite split chunks, and the network guard.
- Published `Opportunity-Lab-All-Offline.zip` as a validated workflow artifact and attached it to the latest GitHub release.
- Added a cool-to-hot opportunity palette, ZIP hover/selection, filter dimming, campaign highlighting, score overrides, reset behavior, and attribution.
- Added typed `MarketOverlayData` and `CompetitorFootprint` contracts with validation against the active market ZIP set.
- Added synthetic reach-gap and competitor footprint fixtures, reusable layer controls, and config-driven MapLibre overlay sources/layers.
- Built Opportunity Explorer filters, supporting-layer toggles, ranked ZIPs, explainable score breakdowns, and source disclosure.
- Built the first Client Growth Studio journey for fictional Lakefront Automotive with deterministic simulation and conceptual Architect handoff.
- Built the first Market Growth Studio journey with four objective modes, map recoloring, fictional examples, and recommended actions.
- Synchronized README, agent instructions, architecture, and build handoff with the current application and geography pipeline.

## Next up

1. Extend supporting overlays into Client Growth Studio with explicit current campaign, reach-gap, and recommended expansion controls.
2. Expand Client Growth Studio result transitions, strategy trade-off explanations, and accessible simulation timing.
3. Expand Market Growth Studio with richer synthetic account/prospect datasets and complete retention-save comparisons.
4. Add the nine-step guided executive tour and mobile bottom-sheet interaction.
5. Add WebGL-capable browser visual regression coverage for both standard and offline adapters.

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

- 2026-07-15 | DECISION: use an OpenStreetMap raster basemap for the standard local prototype
  Considered: blank background, credentialed commercial maps, and custom vector tiles
  Rejected because: blank space is not a real map, commercial tiles add credentials, and custom tiles are premature
  Must preserve: attribution remains visible and the provider stays isolated in the standard map adapter

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
  Rejected because: duplicate toolchains create false instructions and maintenance debt
  Must preserve: Vitest and Node CI remain the active application test/build system unless a real Python service is intentionally introduced

- 2026-07-15 | DECISION: use a generated checked-in 2020 Census-derived ZCTA subset at runtime
  Considered: browser-time TIGERweb requests, synthetic polygons, manually copied geometry, and a generated local fixture
  Rejected because: runtime requests are unreliable on restricted networks, synthetic polygons do not meet product intent, and manual copies lose reproducibility
  Must preserve: geometry remains behind `ZipGeometrySource`; the generated file retains provenance, is never edited by hand, and is validated before Vitest runs

- 2026-07-15 | DECISION: retain the network Census source as an optional adapter, not default runtime composition
  Considered: deleting it completely or continuing to use it as the primary source
  Rejected because: deletion removes a useful adapter and reference implementation, while primary network use reintroduces the reliability problem
  Must preserve: `StaticZctaGeometrySource` is the demo default; the synthetic fallback is used only on local fixture failure

- 2026-07-15 | DECISION: provide offline review as a separate build adapter rather than changing the standard product basemap
  Considered: bundling raster tiles into the standard app, replacing OpenStreetMap everywhere, or maintaining a dedicated offline target
  Rejected because: tile packaging creates licensing and size concerns, while replacing the standard map sacrifices visual detail and couples review constraints to product behavior
  Must preserve: the standard app keeps its isolated online basemap; the offline entry bundles Census context, embeds all fixtures and assets, and rejects unapproved runtime requests

- 2026-07-15 | DECISION: publish `main` through GitHub Pages as the stable executive-review URL
  Considered: continuing manual local setup, relying only on release ZIPs, or introducing a third-party host immediately
  Rejected because: manual setup slows every review, release ZIPs are not a shared browser URL, and a separate host adds account/configuration work before it is needed
  Must preserve: Pages is a deployment adapter only; Vite base paths and public asset URLs remain environment-aware rather than hard-coded in feature code

## Noticed

- The Vite standard build reports a large initial JavaScript chunk because MapLibre is bundled up front. Code splitting can be considered after product journeys stabilize.
- Automated screenshot testing is blocked in the current container because Chromium cannot initialize WebGL.
- Synthetic competitor footprints use deterministic ZIP membership, not exact provider service-area polygons. This is appropriate for the prototype but must be replaced by governed coverage data in production.
- The all-offline context is intentionally lighter than a commercial street basemap; it prioritizes dependable geographic orientation and ZIP-level review without network, licensing, or tile-storage dependencies.
- GitHub Pages for this private repository may require the repository owner to enable Pages and select GitHub Actions as the source once; the workflow handles later deployments automatically.

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

Geometry refresh and validation:

```bash
npm run geometry:refresh
npm run geometry:validate
```

All-offline context, package, and validation:

```bash
npm run offline:all
```
