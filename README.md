# Reach Opportunity Lab

A production-shaped executive prototype for statewide ZIP-level opportunity intelligence and deterministic strategy simulation.

> **Find the opportunity. Simulate the strategy. Activate through Architect.**

## Stable preview

The latest merged build is published after every merge to `main`:

```text
https://teagualicious.github.io/Reach-Opportunity-Lab/
```

## Current product

The application uses one shared Ohio ZIP/ZCTA intelligence layer across three experiences:

- **Opportunity Explorer** — statewide ZIP opportunity map, territory focus, score/category filters, ranked ZIPs, explainable components, confidence, synthetic reach gaps, and competitor overlays.
- **Client Growth Studio** — fictional Lakefront Automotive footprint, selectable strategies, deterministic simulation, territory-specific expansion ZIPs, current-versus-modeled results, and conceptual Architect handoff.
- **Market Growth Studio** — New Business, Account Growth, Retention Risk, and Category Opportunity modes that reweight the selected territory and generate fictional seller actions.

The shell is designed for executive review in one browser viewport. The document does not scroll; each sidebar scrolls independently and can be collapsed to expand the map.

## Ohio operating territories

Every Ohio 2020 Census-derived ZCTA is included and assigned to one deterministic synthetic operating territory:

- Northeast Ohio · Cleveland–Akron
- Eastern Ohio · Youngstown
- Northwest Ohio · Toledo
- Central Ohio · Columbus
- West Central Ohio · Dayton
- Southwest Ohio · Cincinnati
- Southeast Ohio · Athens–Marietta

The selector also includes **All Ohio**. Selecting a territory fits the map to that area, keeps its ZIPs vivid, and greys the remaining statewide context.

The existing Cleveland–Akron records retain their curated demonstration narratives and metrics. Remaining Ohio ZIPs receive deterministic synthetic baseline scores so every territory can be explored without claiming production intelligence.

## Geography and map data

The runtime uses checked-in statewide Ohio ZCTA geometry generated from a documented simplified 2020 Census-derived source:

- `public/data/ohio-zcta-2020.geojson`
- `public/data/ohio-opportunities.json`
- `public/data/ohio-market.provenance.json`
- `scripts/build-ohio-market.mjs`
- `scripts/validate-ohio-market.mjs`

Do not edit generated geographic or statewide opportunity fixtures manually. Change the builder and regenerate them.

The standard application uses a light grayscale OpenStreetMap raster basemap. The ZIP opportunity scale progresses from light to deep blue; inactive territories use neutral gray; selection remains gold and campaign emphasis remains cyan.

## All-offline visual review

A separate distribution target renders the same product journeys without runtime network access. It embeds:

- every Ohio ZCTA and statewide synthetic opportunity record;
- seven major-city territory definitions;
- Census TIGER/Line roads, hydrography, county context, and major-city labels;
- all application JavaScript, CSS, and demonstration fixtures in one HTML file.

Build and validate it with:

```bash
npm run offline:all
```

Output:

```text
offline-dist/Opportunity-Lab-All-Offline/
```

`Opportunity-Lab-All-Offline.html` opens directly from disk. Windows and macOS launchers are included. No Node.js, installation, local server, administrator access, or internet connection is required for the packaged review build.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`.

## Validate

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

`npm run test` first validates statewide geometry, opportunity records, territory coverage, and provenance, then runs the Vitest suite.

Regenerate and validate the statewide market:

```bash
npm run geometry:refresh
npm run geometry:validate
```

The legacy 26-ZIP fixture commands remain available only for historical/reference work:

```bash
npm run legacy-geometry:refresh
npm run legacy-geometry:validate
```

## Architecture

```text
public statewide geography + deterministic synthetic fixtures
        ↓
DemoOpportunityRepository / ZipGeometrySource
        ↓
pure TypeScript opportunity, territory, scoring, and simulation domain
        ↓
shared React territory and panel state
        ↓
Opportunity Explorer / Client Growth Studio / Market Growth Studio
        ↓
MapLibre standard or all-offline presentation adapter
```

Primary boundaries:

- `src/domain/` — pure scoring, simulation, territory, recommendation, and overlay contracts
- `src/data/` — repository, public-asset, and geometry-source adapters
- `src/app/` — composition root, shared territory selection, product navigation, and panel collapse state
- `src/map/` — MapLibre sources, layers, feature state, viewport fitting, and basemap adapters
- `src/features/` — product-owned UI and orchestration
- `public/data/` — public geographic fixtures and deterministic synthetic business fixtures
- `scripts/` — reproducible market generation, offline context, packaging, and validation

## Documentation

Read these before non-trivial work:

1. [`STATUS.md`](STATUS.md)
2. [`ARCHITECTURE.md`](ARCHITECTURE.md)
3. [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md)
4. [`BUILD_HANDOFF.md`](BUILD_HANDOFF.md)
5. [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md)

## Trust and data boundaries

- No real company, advertiser, campaign, account, revenue, or proprietary data belongs in this repository.
- All opportunity, territory, coverage, prospect, recommendation, and simulation values are synthetic demonstration data.
- Client-facing and internal-only fields remain separated at model and feature boundaries.
- Geographic source provenance is preserved.
- Simulation outputs are illustrative and deterministic, not production forecasts.
- Opportunity Lab is the upstream intelligence and scenario-planning layer; Architect remains the activation destination.
