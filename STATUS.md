# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 2 — Statewide map foundation and first product journeys

## Done

- Established repository governance and production-shaped boundaries in `AGENTS.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `PRODUCT_BUILD_SPEC.md`, and `BUILD_HANDOFF.md`.
- Migrated the repository to Vite + React + strict TypeScript with MapLibre and Vitest.
- Added Node CI, main-branch releases, a validated all-offline review package, and a stable GitHub Pages preview after every merge.
- Added base-aware public asset resolution for local, release, offline, and GitHub Pages builds.
- Added deterministic opportunity scoring, confidence, priority bands, client simulation, market-mode score transforms, recommendations, and disclosures.
- Added a reproducible statewide Ohio market generator using documented 2020 Census-derived ZCTA geometry.
- Included every Ohio ZCTA from the source fixture and validated exact geometry/opportunity/territory coverage.
- Preserved the existing curated Cleveland–Akron opportunity records.
- Generated deterministic synthetic baseline metrics for every remaining Ohio ZCTA.
- Added seven major-city operating territories plus an All Ohio view.
- Added one shared territory selector across Opportunity Explorer, Client Growth Studio, and Market Growth Studio.
- Added territory-aware rankings, campaign footprints, expansion recommendations, and internal objective views.
- Rebuilt the universal shell to fit one browser viewport with no page-level scrolling.
- Made left and right sidebars independently scrollable and collapsible across all product modes.
- Added MapLibre resize/refit behavior when panels collapse or territories change.
- Restored a pastel cool-to-hot opportunity scale, neutral gray inactive territories, strong active ZIP boundaries, gold selection, and cyan campaign emphasis.
- Reduced inactive-territory fill opacity and boundary weight so statewide context remains visible without visual clutter.
- Added ZIP-level camera focus: selecting a ZIP from the map or ranked list zooms to its geometry; clearing selection returns to the active territory frame.
- Added polygon and multipolygon viewport-bound tests.
- Lightened and desaturated the standard OpenStreetMap basemap.
- Expanded the all-offline context generator to statewide Ohio using tiled TIGERweb requests and feature deduplication.
- Expanded the offline workflow path filter so shared `src/` changes always rebuild and validate the offline artifact.
- Added territory domain tests and statewide fixture validation.
- Optimized statewide map interaction hot paths: objective/simulation recolors now use `displayScore` feature state with a `coalesce` paint expression instead of re-uploading the 2.7 MB GeoJSON source; dim/campaign/territory feature-state updates are diffed against the previously applied ZIP sets; hover/click territory membership checks use Sets; selection updates touch two features instead of all 1,233.
- Replaced duplicated reach-gap and per-competitor GeoJSON sources with filtered layers over the shared statewide source.
- Parallelized startup data loading: opportunities, overlays, and ZCTA geometry download concurrently (`ZipGeometrySource.load` now accepts a pending ZIP list).
- Split MapLibre into its own cache-stable vendor chunk for standard builds (app chunk 242 KB / MapLibre 1,053 KB, previously one 1,301 KB chunk); the offline-review build still emits a single inlinable script.
- Exposed `opportunitiesByZip` on `OpportunityMarket` so features look up ZIPs without linear scans; overlay validation now happens once inside `buildOpportunityMarket`; the Lakefront canonical territory id moved into the client-scenario domain module.
- Checked in `package-lock.json` for reproducible installs.
- Current validation:
  - standard CI run 299 passed typecheck, statewide validation, Vitest, production build, and GitHub Pages build;
  - all-offline workflow run 57 passed generation, validation, packaging, artifact upload, and release upload;
  - this session: typecheck, statewide validation + 25 Vitest tests, production build, offline-review Vite build (single chunk confirmed), and a headless SwiftShader browser walkthrough of all three product modes (selection zoom, score-filter dimming, reach-gap overlay, territory switch, objective recolors, client simulation) all passed locally.

## Next up

1. Merge the map-polish follow-up and review the updated pastel palette, inactive context, and ZIP focus through the stable GitHub Pages URL.
2. Refine spacing, typography, map fit, panel widths, and territory labels based on real-browser screenshots.
3. Extend reach-gap, competitor, current-campaign, and recommended-expansion controls throughout Client Growth Studio.
4. Expand Market Growth Studio with richer synthetic account/prospect datasets and complete retention-save comparisons.
5. Add additional state/major-city market packages behind the same territory/market contracts.
6. Add the guided executive tour and mobile bottom-sheet interaction.
7. Add WebGL-capable visual regression coverage for standard and offline adapters.

## Decisions log

- 2026-07-15 | DECISION: use Vite + React + strict TypeScript + MapLibre with domain, data, map, and feature boundaries
  Considered: monolithic HTML, untyped JavaScript, and a full-stack framework before a backend exists
  Rejected because: the first two create migration debt and the third adds infrastructure without product value
  Must preserve: business logic remains pure TypeScript; React and MapLibre stay at the edges

- 2026-07-15 | DECISION: synthetic data is delivered through typed repositories
  Considered: importing JSON directly in components or waiting for production APIs
  Rejected because: direct imports make demo plumbing permanent while waiting blocks the prototype
  Must preserve: future APIs replace repository composition, not screens and domain logic

- 2026-07-15 | DECISION: ZIP/ZCTA polygons are the primary selectable and scored geography
  Considered: large sales zones or a non-geographic dashboard
  Rejected because: the intended product gives each ZIP its own opportunity score
  Must preserve: regions and territories group ZIPs but do not replace ZIP-level truth

- 2026-07-15 | DECISION: client simulations are deterministic domain functions with staged UI theater
  Considered: random outputs, hard-coded result cards, and live AI calls
  Rejected because: randomness damages repeatability, hard-coded screens do not scale, and live AI is out of prototype scope
  Must preserve: identical strategy inputs produce identical outputs and all results remain labeled illustrative

- 2026-07-15 | DECISION: supporting map layers use typed ZIP-membership definitions
  Considered: hard-coded MapLibre polygons, runtime polygon intersection, and config-driven ZIP memberships
  Rejected because: hard-coded layers mix business data with rendering and polygon intersection is unnecessary for deterministic demo coverage
  Must preserve: validate overlay ZIPs against the market; MapLibre renders selected definitions but does not own them

- 2026-07-15 | DECISION: generated checked-in Census-derived geometry is the runtime default
  Considered: browser-time TIGERweb requests, synthetic polygons, and manually copied geometry
  Rejected because: runtime requests are unreliable, synthetic polygons miss product intent, and manual copies lose reproducibility
  Must preserve: geometry remains behind `ZipGeometrySource`; generated files retain provenance and are validated before tests

- 2026-07-15 | DECISION: standard and all-offline maps are separate presentation adapters over one product
  Considered: bundling raster tiles into the standard app, replacing OpenStreetMap everywhere, or maintaining a dedicated offline target
  Rejected because: tile packaging creates licensing/size concerns and replacing the standard map sacrifices detail
  Must preserve: business and feature logic is shared; the offline target embeds Census context and blocks external requests

- 2026-07-15 | DECISION: publish `main` through GitHub Pages as the stable executive-review URL
  Considered: manual local setup, release ZIPs only, and an immediate third-party host
  Rejected because: manual setup slows review, ZIPs are not a shared URL, and another host adds unnecessary account/configuration work
  Must preserve: deployment remains an adapter; base paths and public assets remain environment-aware

- 2026-07-15 | DECISION: include every Ohio ZCTA and generate deterministic synthetic baseline scores statewide
  Considered: displaying only 26 curated Cleveland ZIPs, showing unscored gray statewide context, and generating statewide demonstration scores
  Rejected because: the 26-ZIP view looked fragmented and neutral statewide context did not make every major territory explorable
  Must preserve: curated Cleveland–Akron records remain distinguishable from generated statewide baselines; all values remain labeled synthetic

- 2026-07-15 | DECISION: group Ohio into seven major-city operating territories with an All Ohio option
  Considered: county boundaries, arbitrary equal grids, and one statewide view only
  Rejected because: major-city territories tell an executive operating story and provide a scalable contract for future markets
  Must preserve: every ZIP belongs to exactly one territory; selection greys other territories without removing statewide context

- 2026-07-15 | DECISION: the executive shell is one fixed viewport with independently scrollable, collapsible sidebars
  Considered: document-level scrolling and fixed always-visible panels
  Rejected because: scrolling breaks the dashboard metaphor and fixed panels consume too much map space on executive laptops
  Must preserve: no page scroll; map resizes/refits after panel changes; behavior is universal across all three tabs

- 2026-07-16 | DECISION: active opportunity values use a pastel heat-map progression
  Considered: monochromatic light-to-deep blue and a highly saturated hot scale
  Rejected because: monochromatic blue weakens heat-map storytelling while saturated colors overpower the neutral basemap
  Must preserve: the progression remains soft and readable; inactive territories remain neutral gray; selection remains gold; campaign emphasis remains cyan

- 2026-07-16 | DECISION: map presentation state flows through diffed MapLibre feature state over one shared statewide source
  Considered: rebuilding and re-setting the GeoJSON source per recolor, per-ZIP full-state rewrites, and separate GeoJSON sources per overlay
  Rejected because: `setData` re-parses and re-tiles 2.7 MB of geometry per objective switch, full rewrites issue 1,200+ `setFeatureState` calls per filter tick, and per-overlay sources duplicate polygons in memory
  Must preserve: `displayScore` feature state is presentation-only (domain still owns score truth); overlay layers filter the shared `zip-opportunities` source; applied-state diffing resets whenever a map instance is recreated

- 2026-07-16 | DECISION: geometry sources accept a pending ZIP list so startup downloads run concurrently
  Considered: keeping the serial payload-then-geometry load, fetching geometry directly in the repository, and a separate prefetch method
  Rejected because: serial loading delays the largest download by a full round trip, direct fetches bypass the source boundary, and a prefetch method splits one responsibility across two calls
  Must preserve: `ZipGeometrySource.load` still validates and normalizes against the resolved ZIP list; adapters whose request URL depends on ZIPs (Census) simply await the list first

- 2026-07-16 | DECISION: selecting a ZIP changes both detail state and map camera focus
  Considered: updating the detail panel without moving the map
  Rejected because: spatial focus is part of the executive explanation and makes small ZIPs easier to understand
  Must preserve: map/list selection zooms to official geometry; clearing selection and territory reset return to territory bounds; sidebar resize preserves the current focus

## Noticed

- Reach-gap and competitor fixtures currently describe Northeast Ohio only. Controls remain visible statewide, but production-shaped statewide coverage definitions are a later data task.
- Generated statewide metrics are deliberately baseline-quality synthetic records; only the existing Cleveland–Akron records have curated narratives.
- MapLibre now ships as its own vendor chunk, so returning visitors re-download only the ~242 KB app chunk after merges; further size reduction would require lazy product-mode loading, which buys little while all three modes share the map.
- Headless Chromium renders MapLibre in this container with `--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader` (software WebGL; allow ~8 s per frame settle). OpenStreetMap raster tiles are proxy-blocked, so screenshots show vector layers over the plain background. This unblocks the previously noted WebGL limitation for visual checks.
- The mode-switch and Market Growth objective lists use `role="tab"` without arrow-key navigation/roving tabindex; keyboard a11y polish fits the planned spacing/typography pass.
- Legacy curated fixtures (`zip-opportunities.json`, `cleveland-*.geojson`) are generator inputs but still ship in `public/` on every deploy (~76 KB); relocating them would touch generator scripts and two workflows.
- The all-offline context is lighter than a commercial street basemap and prioritizes reliable statewide orientation.

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
