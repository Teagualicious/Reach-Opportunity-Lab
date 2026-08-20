# Fall Project Handoff — Methodology, Validation, and Multi-Market Build

## Assignment

Design, document, and validate a data-driven scoring methodology for market demand, market penetration/account whitespace, and account churn risk; scale the platform from one market to multiple markets; and translate findings into decision-ready recommendations for sales strategy and executive stakeholders.

Required outputs:

- methodology paper;
- observed-outcome validation report;
- multi-market product;
- final leadership presentation;
- maintainable developer/data handoff.

## Product pivot

The product should no longer lead with broad new-business prospecting. The current hierarchy is:

1. Account Whitespace / GROW
2. Retention / KEEP
3. Category Expansion
4. New Business Handoff — secondary

The novel product opportunity is to show where an existing client is undercapturing demand, how product/media/geography changes could improve the account, what value is at risk or available, and which decision maker the seller should contact.

## Current repository foundation

Preserve:

- Vite + React + strict TypeScript;
- MapLibre and one-source feature-state performance laws;
- statewide Ohio region/county/ZIP geography;
- Market Opportunity Map, Seller Action Center, and Client Campaign Planner;
- expanded and compact layouts;
- CI, Pages, releases, and all-offline review;
- domain/data/application/map boundaries.

Replace or isolate in validated mode:

- hash-generated opportunity values;
- synthetic demographics and internal metrics;
- heuristic mode transforms;
- fictional seller entities and dollar ranges;
- synthetic contacts.

## Methodology blueprint

### Account Whitespace / GROW

Unit: eligible existing account, optionally crossed with product, category, and geography.

Candidate evidence:

- independent public/category demand;
- current account spend and mix;
- share of wallet or approved capture proxy;
- product/media gaps;
- adjacent geography and audience gaps;
- campaign performance and saturation;
- account relationship/renewal context;
- contactability and decision-maker relevance.

Validation:

- future account growth;
- top-capacity lift;
- comparison with simple spend/headroom and seller-rule baselines;
- value-range calibration;
- reason-code fidelity.

### Retention / KEEP

Unit: existing account at a fixed prediction snapshot.

Requirements:

- written churn/nonrenewal event and horizon;
- feature availability timestamps;
- rules baseline;
- regularized logistic baseline;
- optional challenger only if it earns complexity;
- temporal and market holdouts;
- calibration/Brier;
- precision, recall, lift, and retained revenue at seller capacity;
- faithful pre-outcome reason codes;
- decision-maker/contact timing.

### Public market demand

- category-aware ACS and Business Patterns registry;
- estimates, margins of error, annotations, suppression, and source vintage retained;
- explicit USPS ZIP versus ZCTA reconciliation;
- stable normalization universe;
- raw and transformed features preserved;
- index first; dollar calibration only with observed holdout support.

### Penetration and whitespace

- approved addressable-business denominator;
- reconciled active advertiser/revenue numerator;
- separate account, product/media, geography, category, and revenue whitespace;
- no circular current-revenue demand estimate;
- low-N and unmatched cases visible.

## Charlotte decision-maker strategy

Provider order:

1. CRM named contacts, account owner, last meaningful touch, renewal owner, and suppression.
2. Approved business identity/domain/website/business phone.
3. One approved professional enrichment provider queried server-side.
4. Approved legal-entity verification only when useful.
5. Human adjudication for ambiguity, staleness, generic channels, or sensitivity.

Validate:

- business match rate;
- named decision-maker coverage;
- actionable professional channel coverage;
- manual precision;
- role relevance;
- freshness and duplicate rates;
- provider contribution/cost;
- source/status/suppression completeness.

Real contacts are authenticated/internal-only. Demo contacts remain deterministic reserved synthetic values.

## Architecture target

```text
analytics/
  tested public/internal ingestion
  feature engineering
  demand/whitespace/churn models
  validation and model cards
  sanitized market-package exporter
        ↓
public/authenticated market packages
        ↓
ManifestOpportunityRepository + secure contact adapter
        ↓
pure TypeScript domain
        ↓
existing React/MapLibre workspaces
```

The analytics layer should be a small tested package. Notebooks may support exploration but are not production truth.

## Phase plan

### Phase 0 — Governance and decisions

- approve growth/retention-first positioning;
- freeze Charlotte pilot and comparison market;
- approve category taxonomy;
- approve data/contact handling;
- define success and no-go criteria.

### Phase 1 — Contracts and architecture

- geography ADR;
- market manifest;
- public/internal/score/contact schemas;
- lineage and quality gates;
- non-sensitive contract fixture.

### Phase 2 — Public data

- Census client, caching, source snapshots;
- ACS ZCTA estimates/MOEs/annotations;
- County/ZIP Business Patterns;
- ZIP/ZCTA reconciliation;
- category mapper and pilot feature table.

### Phase 3 — Internal data and contacts

- source inventory;
- secure de-identified extract;
- account identity/geocoding;
- monthly leakage-safe panel;
- growth/retention outcomes;
- CRM/contact/suppression inventory;
- privacy and proxy review.

### Phase 4 — Feature engineering

- demand features;
- whitespace/penetration features;
- churn features;
- decision-maker role taxonomy and matching rules;
- exploratory quality review.

### Phase 5 — Models

- Public Market Demand Index;
- Account Whitespace score/model;
- Penetration and whitespace ranges;
- Retention rules/logistic baselines;
- calibration, confidence, reason codes, model cards.

### Phase 6 — Validation

- frozen validation protocol;
- observed future growth backtest;
- churn backtest;
- market holdout;
- penetration reconciliation;
- Charlotte contact-quality adjudication;
- go/no-go disposition.

### Phase 7 — Multi-market scaling

- manifest-driven loader;
- sanitized exporter;
- remove Ohio assumptions;
- Charlotte plus at least one additional market;
- contract/performance/offline regression.

### Phase 8 — Product integration

- explicit Demo/Validated modes;
- validated map lenses;
- Account Whitespace and Retention queues;
- contact cards and CRM actions;
- client/internal boundary QA;
- growth/retention-first guided tour.

### Phase 9 — Delivery

- methodology paper;
- validation report;
- leadership presentation;
- data dictionary;
- runbook;
- clean-environment reproducibility;
- release and knowledge transfer.

## Board

The complete card-level backlog, dependencies, owners, acceptance criteria, estimates, target weeks, and validation gates are in:

```text
docs/PROJECT_BOARD.csv
```

## Immediate next tasks

1. Resolve branch CI and browser findings.
2. Approve the New Business handoff route.
3. Approve Charlotte boundary, account cohort, and outcomes.
4. Inventory CRM/contact/suppression fields.
5. Approve one professional enrichment provider.
6. Build contract fixture and manifest.
7. Build public pilot feature table.
8. Build leakage-safe internal panel.
9. Validate Charlotte contacts.
10. Build Account Whitespace and Retention baselines.

## Critical no-go conditions

- no observed outcomes but a claim of validation;
- real contact/account data in Git or static artifacts;
- provider keys in frontend code;
- browser scraping of interactive portals;
- automatic outreach;
- random row splits for longitudinal churn;
- uncalibrated dollar opportunity presented as fact;
- registered agent or generic inbox presented as verified decision maker;
- New Business restored as default without an approved decision.
