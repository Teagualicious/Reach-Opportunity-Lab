# Reach Opportunity Lab

A production-shaped executive prototype for statewide ZIP-level opportunity intelligence, client campaign planning, and seller prioritization.

> **Find the opportunity. Decide what to do. Activate the plan.**

## Stable preview

The latest merged build publishes automatically to:

```text
https://teagualicious.github.io/Reach-Opportunity-Lab/
```

## Product workspaces

The application uses one shared Ohio ZIP/ZCTA intelligence layer across three deliberately different workflows, presented in this order:

### 1. Market Opportunity Map

**Who uses it:** market strategists, sellers, and sales leaders.

**Purpose:** find the strongest ZIP-level opportunities and understand the audience, coverage, and competitive signals behind them.

**What to do next:** select a territory, choose a ZIP, then inspect its score drivers, modeled reach-gap status, and synthetic competitor intersections.

### 2. Seller Action Center

**Who uses it:** local sellers and sales managers.

**Purpose:** turn market intelligence into a prioritized list of prospects and accounts to pursue, grow, or save.

**What to do next:** choose New Business, Account Growth, Retention Risk, or Category Opportunity; open a seller action brief; then model the recommended move.

### 3. Client Campaign Planner

**Who uses it:** account executives and advertiser teams.

**Purpose:** diagnose a current campaign footprint, test growth strategies, and build an explained ZIP expansion plan.

**What to do next:** review **Current plan**, open **Diagnose gaps**, select strategies, run the simulation, then review the **Recommended plan** and conceptual Architect handoff.

The right panel in every workspace begins with a compact guide showing the same purpose, intended user, and next action.

## Universal map behavior

- Every source Ohio ZCTA is displayed.
- Seven synthetic major-city operating territories plus **All Ohio** are available.
- Selected territories remain vivid while the rest of Ohio stays visible in neutral gray.
- Opportunity scores use a pastel cool-to-hot progression.
- Selected ZIPs use gold outlines.
- Current campaign or seller-focus ZIPs use cyan outlines.
- Recommended campaign expansion ZIPs use green outlines.
- Reach-gap and competitor evidence layers use strong typed colors and outlines.
- Whenever a reach-gap or competitor evidence layer is active, the base opportunity surface automatically mutes rather than disappearing.
- ZIP selection zooms to official Polygon or MultiPolygon geometry.

All opportunity, territory, coverage, competitor, advertiser, campaign, seller, account, prospect, recommendation, and simulation values are deterministic synthetic demonstration data.

## Ohio operating territories

- Northeast Ohio · Cleveland–Akron
- Eastern Ohio · Youngstown
- Northwest Ohio · Toledo
- Central Ohio · Columbus
- West Central Ohio · Dayton
- Southwest Ohio · Cincinnati
- Southeast Ohio · Athens–Marietta

Territory membership is demonstration logic. Production membership must eventually use governed business definitions without changing the feature or map contracts.

## Geography and data

Checked-in generated fixtures:

```text
public/data/
  ohio-zcta-2020.geojson
  ohio-opportunities.json
  ohio-market.provenance.json
  market-overlays.json
```

Generation and validation:

```bash
npm run geometry:refresh
npm run geometry:validate
```

Do not edit generated statewide geography or opportunity fixtures manually. Change the builder and regenerate them.

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

`npm run test` validates statewide geometry, opportunity records, territory coverage, and provenance before running Vitest.

## All-offline review

```bash
npm run offline:all
```

Output:

```text
offline-dist/Opportunity-Lab-All-Offline/
```

The packaged HTML opens directly from disk with no Node.js, local server, administrator access, or internet connection. It contains the same product workflows and a bundled Census-derived map context.

## Architecture

```text
public statewide geography + deterministic synthetic fixtures
        ↓
repository / geometry-source adapters
        ↓
pure opportunity, territory, client-planning, seller-action, scoring, and simulation domain
        ↓
shared React territory, viewport, and panel state
        ↓
Market Opportunity Map / Seller Action Center / Client Campaign Planner
        ↓
MapLibre standard or all-offline presentation adapter
```

Core boundaries:

- `src/domain/` — pure scoring, client geography, simulation, seller-action, territory, recommendation, and overlay contracts
- `src/data/` — repositories, public-asset resolution, and geometry-source adapters
- `src/app/` — composition root, workspace navigation, territory selection, viewport mode, and panel state
- `src/map/` — one statewide source, filtered evidence layers, diffed feature state, viewport fitting, and basemap adapters
- `src/features/` — workspace-owned UI and orchestration
- `src/components/` — reusable controls and workspace guidance
- `src/styles/` — tokens, responsive shell, workspace styling, and map polish

Preserve the optimized map laws: no statewide geometry re-upload for recoloring, no duplicate overlay geometry sources, Set-based interaction checks, O(1) ZIP lookup, cache-stable MapLibre vendor chunking, and one inlinable offline script.

## Documentation

Read before non-trivial work:

1. [`STATUS.md`](STATUS.md)
2. [`ARCHITECTURE.md`](ARCHITECTURE.md)
3. [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md)
4. [`BUILD_HANDOFF.md`](BUILD_HANDOFF.md)
5. [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md)

## Trust boundaries

- No real company, advertiser, campaign, seller, account, revenue, or proprietary data belongs in the repository.
- Competitor footprints are illustrative ZIP memberships, not provider service-area claims.
- Client-facing and internal-only models remain separated.
- Geographic provenance is preserved.
- Simulation and recommendation outputs are deterministic illustrations, not production forecasts.
- Architect remains a conceptual activation destination; no live integration is represented.
