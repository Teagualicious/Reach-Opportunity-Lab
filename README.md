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

The demo requests official **2020 Census ZIP Code Tabulation Area (ZCTA)** boundaries from the U.S. Census Bureau TIGERweb service through a typed `ZipGeometrySource` adapter. If that request is unavailable, the application uses a clearly labeled local fallback instead of failing.

The visual basemap uses OpenStreetMap raster tiles through the isolated MapLibre adapter. This requires internet access but no API key. The next geometry milestone is a reproducible checked-in official Cleveland–Akron ZCTA fixture so polygon rendering no longer depends on a browser-time Census request.

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

CI performs typechecking, tests, and a production build on every push and pull request. After a successful merge to `main`, the release job publishes static-build and source ZIP files under a `build-<run_number>` tag.

## Architecture

```text
public/data synthetic fixtures
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
- `public/data/` — deterministic synthetic demonstration fixtures

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
- Opportunity Lab is the upstream intelligence and scenario-planning layer; Architect remains the activation destination.
