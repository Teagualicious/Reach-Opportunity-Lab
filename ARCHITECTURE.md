# Opportunity Lab Architecture

This document defines the foundation for the Spectrum Reach Opportunity Lab. The current deliverable is a local executive demo, but the codebase must remain capable of evolving into a production product that consumes governed real data.

## Architectural goals

1. Build the demo through production-shaped interfaces rather than one-off UI wiring.
2. Keep domain logic independent from React, MapLibre, storage, and network access.
3. Make synthetic demonstration data replaceable without rewriting the product.
4. Keep client-facing and internal-only data separated at the model and feature boundaries.
5. Preserve deterministic, explainable scoring and simulation behavior.
6. Prefer explicit, typed modules over global state, monolithic files, or hidden side effects.
7. Keep the first release locally runnable with no backend, credentials, or deployment dependency.

## Frontend stack

- Vite for the local development and production build pipeline
- React for composable product views and guided workflow state
- TypeScript with strict checking for domain contracts and data boundaries
- MapLibre GL JS for map rendering and feature interaction
- CSS variables and modular stylesheets for the Spectrum Reach-aligned design system
- Vitest for domain and adapter tests

Dependencies should remain intentionally small. A new dependency requires a concrete capability that is not reasonably provided by the platform or current stack.

## Core boundaries

### Domain

Pure TypeScript types and functions. Domain modules must not import React, MapLibre, browser storage, or network libraries.

Responsibilities:

- ZIP opportunity and risk models
- score components and confidence
- advertiser/account scenarios
- strategy definitions
- deterministic simulation calculations
- recommendation and explanation generation

### Data access

The application reads data through typed repository interfaces.

Initial implementation:

- `DemoOpportunityRepository` reads checked-in synthetic JSON and GeoJSON

Future implementation:

- `ApiOpportunityRepository` may read governed production APIs

UI and domain modules must not know which repository implementation is active. Replacing demonstration data with an API should be a composition-root change, not a feature rewrite.

### Map

MapLibre integration is isolated behind map-specific modules and React components.

Responsibilities:

- loading ZIP/ZCTA geometry
- adding and updating sources and layers
- coloring ZIPs from domain-provided metrics
- hover, selection, and feature-state interaction
- competitor and campaign overlays
- fitting and resetting the viewport

The map does not calculate business scores. It renders values supplied by the domain layer.

### Product features

Feature folders own their UI and orchestration:

- landing
- client growth studio
- market growth studio
- ZIP explorer
- simulation
- guided executive tour
- Architect handoff

Features may consume domain services and repositories, but should not reach into another feature's private implementation.

## Primary geographic model

The primary selectable and scored unit is a ZIP-like polygon represented by a ZCTA geometry and a five-digit ZIP identifier. Each map cell receives its own synthetic opportunity values and score breakdown.

Spectrum Reach sales zones remain a useful grouping or overlay, but they are not the primary scoring geometry in the rebuilt product.

## State ownership

- Persistent product state is defined in typed application state at the composition root.
- Transient component state remains local.
- MapLibre feature state is limited to visual interaction such as hover, selection, dimming, and simulation emphasis.
- Business truth never lives only inside MapLibre state or the DOM.

Do not introduce an external state-management dependency until React's built-in state and reducer patterns become insufficient in measured use.

## Demonstration data rules

- All advertiser, account, prospect, performance, score, and recommendation data is synthetic.
- Synthetic data must match explicit production-oriented schemas.
- Demonstration fixtures are deterministic and version-controlled.
- No company exports, credentials, internal reports, or real client data enter the repository.
- Every screen that presents modeled values includes an appropriate synthetic-data disclosure.

## Local-first delivery

The first build must run with:

```bash
npm install
npm run dev
```

It must also produce a static build with:

```bash
npm run build
npm run preview
```

Vercel or other hosting is intentionally deferred. Deployment configuration must not shape or block the local product architecture.

## Intended source structure

```text
src/
  app/                 composition root, routes, shared application state
  domain/              pure types, scoring, simulation, recommendations
  data/                repository contracts and demo implementations
  features/            product experiences and feature-owned UI
  map/                 MapLibre adapter, layers, interactions, map components
  components/          small reusable presentation components
  styles/              tokens, reset, layout, components, animations
public/
  data/                 synthetic JSON and local GeoJSON
```

The exact files may evolve, but these dependency directions must remain intact.

## Prohibited shortcuts

- No monolithic HTML/JS application
- No business rules embedded in JSX event handlers
- No direct JSON imports scattered throughout UI components
- No score computation inside map paint expressions
- No uncontrolled randomness in simulations
- No client/internal data mixing in a shared unfiltered object
- No hidden production claims or fake live integrations
- No patching around type errors with broad `any` types
- No deployment-specific code in domain or feature modules

## Scaling path

A production evolution should be able to add the following without replacing the frontend foundation:

- authenticated API adapters
- governed real datasets
- server-side scoring and model versioning
- role-based access and strict client/internal authorization
- persisted scenarios
- Architect and CRM integrations
- observability, audit trails, and feature flags
- additional markets beyond Cleveland-Akron

Production work will add infrastructure and stronger controls, but the product's domain contracts, feature boundaries, and map adapter should remain recognizable.