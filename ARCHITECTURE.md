# Opportunity Lab Architecture

This document defines the technical boundaries for the Spectrum Reach Opportunity Lab. The current deliverable is a local executive prototype, but the codebase must remain capable of evolving into a governed production product.

## Architectural goals

1. Build the demo through production-shaped interfaces rather than one-off UI wiring.
2. Keep domain logic independent from React, MapLibre, storage, and network access.
3. Make synthetic demonstration data replaceable without rewriting product features.
4. Keep client-facing and internal-only data separated at model and feature boundaries.
5. Preserve deterministic, explainable scoring and simulation behavior.
6. Prefer explicit typed modules over global state, monolithic files, or hidden side effects.
7. Keep local development and static builds first-class; hosting must not shape domain code.

## Frontend stack

- Vite for development and production builds
- React for composable product views and workflow state
- strict TypeScript for domain contracts and trust boundaries
- MapLibre GL JS for map rendering and feature interaction
- OpenStreetMap raster tiles for the current basemap
- Vitest for domain and adapter tests
- CSS variables and modular stylesheets for the design system

Dependencies remain intentionally small. A new dependency requires a concrete capability that is not reasonably provided by the platform or current stack.

## Core boundaries

### Domain

Pure TypeScript types and functions. Domain modules do not import React, MapLibre, browser storage, or network libraries.

Responsibilities:

- ZIP opportunity and risk models
- score components and confidence
- advertiser/account scenarios
- deterministic strategy definitions and simulation calculations
- internal objective score transformations
- recommendation and explanation generation
- market overlay contracts and validation

### Data access

The application reads market information through typed repository and source interfaces.

Current implementations:

- `DemoOpportunityRepository` reads deterministic synthetic JSON fixtures.
- `CensusZctaGeometrySource` requests official 2020 Census ZCTA geometry.
- A clearly labeled local GeoJSON fallback keeps the product usable if the Census request fails.
- Synthetic reach-gap and competitor definitions are validated before they enter product state.

Future implementations may include:

- `ApiOpportunityRepository` for governed production APIs
- a build-time or server-side official geometry source
- authenticated account, campaign, CRM, and Architect adapters

UI and domain modules must not know which repository implementation is active. Replacing demonstration data with production APIs should be a composition-root change, not a feature rewrite.

### Map

MapLibre integration is isolated under `src/map/`.

Responsibilities:

- rendering ZIP/ZCTA geometry
- adding and updating opportunity, campaign, reach-gap, and competitor layers
- coloring ZIPs from domain-provided metrics
- hover, selection, dimming, campaign emphasis, and reset interaction
- fitting the viewport
- preserving basemap and geographic-source attribution

The map does not calculate business scores or own product truth. It consumes enriched features and typed overlay selections.

### Product features

Feature folders own UI and workflow orchestration:

- Opportunity Explorer
- Client Growth Studio
- Market Growth Studio
- simulation theater
- Architect handoff
- future guided executive tour
- future mobile bottom sheet

Features may consume domain services and repositories, but must not reach into another feature's private implementation.

## Primary geographic model

The primary selectable and scored unit is a five-digit ZIP identifier rendered using ZCTA polygon geometry. Each map cell receives its own synthetic opportunity values and explainable score breakdown.

Spectrum Reach sales zones may be added later as groupings or overlays, but they are not the primary scoring geometry.

## State ownership

- The composition root owns loaded market data.
- Product features own workflow and selection state.
- Transient component state remains local.
- MapLibre feature state is limited to visual interaction: hover, selection, dimming, and campaign emphasis.
- Business truth never lives only in MapLibre state or the DOM.

Do not add an external state-management dependency until React's built-in state and reducer patterns become insufficient in measured use.

## Supporting overlays

Supporting layers use production-shaped typed definitions:

- `MarketOverlayData`
- `CompetitorFootprint`
- validated ZIP membership
- unique stable overlay IDs
- explicit color, label, subtitle, and DMA-wide behavior

The fixture currently contains synthetic reach gaps and competitor footprints. Future real coverage data should replace the repository payload without changing map-control or layer contracts.

## Demonstration data rules

- All advertiser, account, prospect, campaign, coverage, performance, score, recommendation, and simulation data is synthetic.
- Synthetic data matches explicit production-oriented schemas.
- Demonstration fixtures are deterministic and version-controlled.
- No company exports, credentials, internal reports, or real client data enter the repository.
- Every screen presenting modeled values includes an appropriate disclosure.
- Geographic boundary and basemap data preserve source attribution and provenance.

## Local-first delivery

Development:

```bash
npm install
npm run dev
```

Validation and static build:

```bash
npm run typecheck
npm run test
npm run build
npm run preview
```

Vercel or other hosting is intentionally deferred. Deployment configuration must not shape or block domain, data, map, or feature architecture.

## Source structure

```text
src/
  app/                 composition root, product navigation, shared reset
  domain/              pure types, scoring, simulation, overlays, recommendations
  data/                repository and geometry-source contracts/adapters
  features/            product experiences and feature-owned UI
  map/                 MapLibre lifecycle, sources, layers, interactions
  components/          reusable presentation components
  styles/              design tokens, layout, components, layers
public/
  data/                 synthetic JSON and local geometry fallback
```

## Prohibited shortcuts

- monolithic HTML/JavaScript application
- business rules embedded in JSX event handlers
- direct JSON imports scattered throughout UI components
- score computation inside map paint expressions
- business overlay data hard-coded into map rendering code
- uncontrolled randomness in simulations
- client/internal data mixing in a shared unfiltered object
- hidden production claims or fake live integrations
- broad `any` typing to bypass contract problems
- deployment-specific code in domain or feature modules
- real company or client data in fixtures

## Scaling path

The production evolution should be able to add these capabilities without replacing the frontend foundation:

- authenticated API adapters
- governed real datasets
- server-side scoring and model versioning
- role-based access and strict client/internal authorization
- persisted scenarios
- Architect and CRM integrations
- observability, audit trails, and feature flags
- additional markets beyond Cleveland–Akron
- vector tiles or a governed basemap provider
- build-time or server-side geometry preparation

Production work will add infrastructure and stronger controls, but the product's domain contracts, repository boundaries, feature ownership, and map adapter should remain recognizable.
