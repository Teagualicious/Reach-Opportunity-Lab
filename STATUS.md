# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 2 — Shared map and first product journeys

## Done

- Established repository governance and production-shaped boundaries in `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `PRODUCT_BUILD_SPEC.md`, and `BUILD_HANDOFF.md`.
- Migrated the project to Vite + React + strict TypeScript with MapLibre and Vitest.
- Added typed opportunity models, deterministic client simulation, and objective-specific market growth scoring.
- Added a replaceable `DemoOpportunityRepository` and `ZipGeometrySource` boundary.
- Added official Census TIGERweb ZCTA loading with a clearly disclosed local fallback.
- Added an OpenStreetMap basemap, cool-to-hot ZIP opportunity coloring, hover, selection, filtering, campaign highlighting, and reset behavior.
- Built the Opportunity Explorer, first Client Growth Studio journey, first Market Growth Studio journey, and conceptual Architect handoff.
- Validation passes locally: strict TypeScript, 13 Vitest tests, and production Vite build.
- CI now validates every push/PR and publishes static-build and source ZIP releases after changes land on `main`.

## Next up

1. Check in a simplified official Cleveland–Akron ZCTA fixture so geometry does not depend on browser-time network access.
2. Add competitor footprints, campaign/reach-gap overlays, and typed layer controls.
3. Expand Client Growth Studio strategy tradeoffs, result transitions, and scenario saving.
4. Expand Market Growth Studio with richer synthetic account/prospect datasets and retention-save comparisons.
5. Add the guided executive tour and mobile bottom-sheet interaction.
6. Add browser visual regression testing in a WebGL-capable environment.

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

## Noticed

- Browser-time official geometry and basemap rendering require internet access; the fallback geometry keeps the demo operable.
- The Vite build reports a large initial JavaScript chunk because MapLibre is bundled up front.
- Automated visual testing is blocked in the current container because Chromium cannot initialize WebGL.

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
