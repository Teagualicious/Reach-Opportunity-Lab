# Reach Opportunity Lab Architecture

This document defines the durable boundaries for the fall methodology build and the current growth/retention-first product.

## Architectural goals

1. Preserve the production-shaped React, TypeScript, MapLibre, testing, Pages, release, and offline foundation.
2. Keep domain logic independent from React, MapLibre, storage, network access, deployment, and contact providers.
3. Keep Demo and Validated data modes explicit and impossible to silently combine.
4. Make Account Whitespace and Retention objective-specific, explainable, versioned, and empirically validated.
5. Keep client-facing and internal-only models and fields separated.
6. Represent geography, market packages, scores, confidence, explanations, validation, and contacts through typed contracts.
7. Resolve real contacts server-side or in a secure analytics layer, never in the public browser.
8. Preserve map performance, responsive behavior, accessibility, provenance, and offline delivery laws.

## Frontend stack

- Vite
- React
- strict TypeScript
- MapLibre GL JS
- Vitest
- CSS variables and modular stylesheets

No new dependency is introduced by the synthetic contact patch.

## Dependency direction

```text
public geography + deterministic demo fixtures
validated public/internal market packages
        ↓
repository / market-package / geometry / contact-provider adapters
        ↓
pure opportunity, market-mode, seller, contact, client-planning, scoring, and simulation domain
        ↓
shared application workspace / market / territory / viewport / panel state
        ↓
feature-owned workflows
        ↓
MapLibre and HTML presentation adapters
```

No lower layer imports an upper layer.

## Data modes

### Demo mode

- deterministic synthetic opportunity, account, prospect, revenue, simulation, and contact values;
- safe for public Pages, tests, screenshots, and offline review;
- synthetic disclosures always visible;
- demo contacts use `.example` and `202-555-01xx` values.

### Validated mode

- approved versioned public features and approved internal aggregates;
- authenticated internal delivery for account, churn, revenue, owner, and contact fields;
- source vintages, model versions, confidence, coverage, freshness, and validation status required;
- no fallback to synthetic values without a visible data-mode change.

## Domain boundary

Modules under `src/domain/` do not import React, MapLibre, storage, network libraries, CRM SDKs, or contact-provider SDKs.

Current relevant modules:

- `opportunity.ts` — opportunity record and component contracts;
- `marketMode.ts` — ordered objective definitions and current demo score transforms;
- `sellerOpportunity.ts` — seller action record assembly;
- `businessContact.ts` — deterministic synthetic decision-maker contact generation;
- `clientScenario.ts` / `clientGeography.ts` — client-safe planning;
- `mapOverlay.ts` — typed evidence overlays;
- `territory.ts` — market geography contracts.

Validated score and contact truth must enter through typed repositories/adapters rather than being calculated in JSX or map expressions.

## Product objective boundary

Objective order is fixed unless a recorded product decision changes it:

1. Account Whitespace
2. Retention / KEEP
3. Category Expansion
4. New Business Handoff

These are not color variants of one universal score.

### Account Whitespace

Owns existing-account product, medium, category, audience, budget, and geography headroom. Future validated output must identify the evidence, value/headroom range, confidence, and relevant decision maker.

### Retention / KEEP

Owns calibrated churn/nonrenewal risk, revenue at risk, timing, reason codes, intervention capacity, and decision-maker path.

### Category Expansion

Supports portfolio and vertical strategy for the current book.

### New Business Handoff

Provides secondary market context and routes the opportunity to the approved Spectrum Reach workflow. It must not regain default prominence without a recorded decision.

## Contact boundary

### Demo contact

`buildDemoDecisionMaker` is pure and deterministic. It receives business name, ZIP, category, and objective and returns a typed synthetic contact.

### Validated contact

A future provider interface should return:

- stable contact/business IDs;
- name, title, normalized role type, and role relevance;
- approved professional email and direct/business phone;
- source provider and source record;
- confidence/status;
- last verified date;
- CRM owner and last meaningful touch when approved;
- suppression/do-not-contact state.

Provider precedence:

1. CRM relationship truth;
2. approved business identity;
3. approved professional enrichment;
4. legal-entity verification where useful;
5. human adjudication for ambiguity.

### Prohibited contact shortcuts

- provider keys in frontend code;
- direct browser enrichment calls;
- scraping interactive state portals;
- treating registered agents or generic inboxes as verified marketing decision makers;
- exposing real contacts in Pages, screenshots, source fixtures, releases, or public offline packages;
- enabling contact actions when suppressed;
- automatic email, dialing, texting, or sequences.

## Repository boundary

The current `DemoOpportunityRepository` remains the demo adapter. The fall build should add a manifest-driven repository capable of loading approved market packages without changing feature contracts.

A validated market package should include:

```text
market manifest
geography reference/version
public features and uncertainty
approved internal aggregates
objective-specific scores and reason codes
validation summary
contact availability metadata (not public contact values)
```

Real contact records should load through an authenticated internal contact adapter keyed by approved account/business IDs.

## Map boundary

MapLibre renders supplied geography, score state, selection, current/recommended sets, and typed evidence layers. It does not:

- calculate whitespace or churn;
- choose seller actions;
- resolve contacts;
- decide suppression;
- generate explanations;
- determine market membership.

Preserve:

- one statewide/market source;
- diffed feature-state updates;
- Set-based interaction checks;
- O(1) opportunity lookup;
- filtered overlays instead of duplicate geometry sources;
- no statewide source re-upload for recoloring;
- cache-stable MapLibre vendor chunking;
- one inlinable offline script.

## Shared application state

`ProductShell` and `ProductViewContext` own workspace, territory/county selection, viewport mode, panel state, and reset behavior.

Reset behavior in Seller Action Center must return to Account Whitespace.

## Responsive layout laws

### Expanded

- one fixed browser viewport;
- no document-level scrolling;
- independently scrollable sidebars;
- map remains dominant;
- contact card must not force the map or page outside the viewport.

### Compact

- shared 900px viewport contract;
- map visible by default;
- one-at-a-time bottom sheets;
- contact actions at least 44px high;
- safe-area support;
- no user-agent detection.

## Client/internal separation

Client Campaign Planner may use approved internal signals to inform server-side recommendation logic, but it must not render:

- account names or IDs;
- churn or renewal risk;
- revenue/penetration/whitespace internals;
- seller queues;
- decision-maker contacts;
- CRM ownership or communication history.

## Delivery adapters

Standard:

```bash
npm install
npm run typecheck
npm run test
npm run build
```

All offline:

```bash
npm run offline:all
```

The public offline package may contain synthetic contacts only.

## Documentation authority

Current authority order:

1. `CURRENT_HANDOFF.md`
2. `STATUS.md`
3. `ARCHITECTURE.md`
4. `PRODUCT_BUILD_SPEC.md`
5. `BUILD_HANDOFF.md`
6. `docs/FALL_PROJECT_HANDOFF.md`
7. `docs/CONTACT_STRATEGY.md`

Archived documents are historical context and do not override current root documentation.
