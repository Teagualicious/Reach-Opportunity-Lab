# Spectrum Reach Opportunity Lab

A local-first, production-shaped executive prototype for ZIP-level market opportunity intelligence and deterministic strategy simulation.

> **Find the opportunity. Simulate the strategy. Activate through Architect.**

## Current product

The application contains three connected experiences powered by one typed ZIP/ZCTA intelligence layer:

- **Opportunity Explorer** — Cleveland–Akron opportunity heat map, filters, ranked ZIPs, explainable score components, confidence, market context, synthetic reach gaps, and competitor footprint controls.
- **Client Growth Studio** — fictional Lakefront Automotive campaign footprint, four selectable strategies, deterministic simulation theater, current-versus-modeled results, and a conceptual Architect handoff.
- **Market Growth Studio** — New Business, Account Growth, Retention Risk, and Category Opportunity modes that reweight and recolor the shared market intelligence.

All advertiser, account, prospect, performance, coverage, recommendation, and opportunity values are synthetic demonstration data.

## Geography and map data

The repository checks in a compact **2020 Census-derived ZIP Code Tabulation Area (ZCTA)** fixture containing exactly the 26 Cleveland–Akron demonstration ZIPs. Runtime geometry is loaded through `StaticZctaGeometrySource`, so polygon rendering does not depend on a browser-time Census service request.

Geometry provenance and transformations are documented in:

- `public/data/cleveland-akron-zcta-2020.provenance.json`
- `scripts/build-zcta-fixture.mjs`
- `scripts/validate-zcta-fixture.mjs`

The visual basemap uses OpenStreetMap raster tiles through the isolated MapLibre adapter. Basemap rendering still requires internet access but no API key. If the checked-in ZCTA fixture cannot be loaded, the application uses a clearly labeled synthetic geometry fallback rather than failing.

## Run locally

Requirements:

- Node.js 20 or newer
- npm

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`.

## Validate

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

`npm run test` first validates the checked-in ZCTA fixture, then runs the Vitest suite.

To regenerate and validate the geographic fixture:

```bash
npm run geometry:refresh
npm run geometry:validate
```

CI performs typechecking, tests, and a production build on every push and pull request. After a successful merge to `main`, the release job publishes static-build and source ZIP files under a `build-<run_number>` tag.

## Architecture

```text
public geographic + synthetic demonstration fixtures
        ↓
DemoOpportunityRepository / ZipGeometrySource
        ↓
pure TypeScript domain scoring and simulation
        ↓
React product features
        ↓
MapLibre rendering adapter
```

Primary boundaries:

- `src/domain/` — pure scoring, simulation, recommendation, and overlay contracts
- `src/data/` — repository and geometry-source adapters
- `src/map/` — MapLibre sources, layers, feature state, and interaction
- `src/features/` — product-owned UI and orchestration
- `src/components/` — reusable presentation components
- `public/data/` — public geographic fixtures plus deterministic synthetic demonstration fixtures

## Documentation

Read these in order before non-trivial work:

1. [`STATUS.md`](STATUS.md) — current phase, completed work, next tasks, and decision log
2. [`ARCHITECTURE.md`](ARCHITECTURE.md) — dependency boundaries and scaling rules
3. [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md) — product vision, scenarios, acceptance criteria, and roadmap
4. [`BUILD_HANDOFF.md`](BUILD_HANDOFF.md) — current implementation map and technical handoff
5. [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) — agent workflow and repository laws

## Trust and data boundaries

- No real Spectrum Reach, advertiser, campaign, account, revenue, or proprietary data belongs in this repository.
- Client-facing and internal-only data must remain separate at model and feature boundaries.
- Simulation results are illustrative and deterministic, not production forecasts.
- Geographic boundaries preserve source provenance; business overlays remain synthetic.
- Opportunity Lab is the upstream intelligence and scenario-planning layer; Architect remains the activation destination.
