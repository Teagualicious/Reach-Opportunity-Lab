# Reach Opportunity Lab — Fall Product and Methodology Build Specification

This is the current build specification. The earlier one-week executive-prototype specification is preserved under `docs/archive/pre-fall-pivot/PRODUCT_BUILD_SPEC.md`.

## 1. Assignment

Design, document, and validate a data-driven scoring methodology for market demand, market penetration/account whitespace, and account churn risk; scale the platform from one market to multiple markets; and translate findings into decision-ready recommendations for sales strategy and executive stakeholders.

Required deliverables:

- written methodology paper;
- validation results benchmarked against observed account outcomes;
- final leadership presentation;
- maintainable multi-market product and handoff.

## 2. Revised product promise

> **Protect the book. Find the whitespace. Reach the right decision maker.**

Product priority:

1. Account Whitespace / GROW
2. Retention / KEEP
3. Category Expansion
4. New Business Handoff — secondary

The product does not replace the recently launched internal New Business capability.

## 3. Users and decisions

### Sales manager / seller

- Which existing account has the strongest evidence-backed headroom?
- Which product, medium, audience, category, budget, or geography creates the whitespace?
- Which account is likely to churn or fail to renew?
- How much value is at risk or available?
- Who is the relevant decision maker?
- What should the seller do next?

### Market/research leader

- Which markets/categories have reliable demand and low capture?
- Does the method transfer across markets?
- Which recommendations are validated versus descriptive/research-only?

### Executive stakeholder

- What business decision improves?
- What evidence supports the output?
- How accurate/calibrated is it?
- What limitations and governance controls apply?

## 4. Scope

### In scope

- ACS and Business Patterns ingestion with lineage, uncertainty, and geography reconciliation;
- approved internal account/campaign/outcome aggregates;
- account-whitespace, penetration, and churn methods;
- objective-specific reason codes and confidence;
- temporal and market holdouts;
- Charlotte pilot and additional markets;
- CRM-first decision-maker resolution and approved enrichment;
- human-initiated Email, Call, Copy, and CRM actions in authenticated mode;
- explicit Demo/Validated modes;
- methodology, validation, product, presentation, and handoff documentation.

### Out of scope

- replacing Spectrum Reach's dedicated New Business tool;
- automatic email, dialing, texting, or sequences;
- browser-side enrichment or provider keys;
- scraping interactive government portals;
- public/static real contact or account data;
- promising causal market-share growth from unvalidated simulations;
- agent-based simulation before conventional models pass validation.

## 5. Success criteria

### Account Whitespace

- future account growth increases across score bands;
- top-capacity queue beats simple spend/headroom and seller-rule baselines;
- recommended whitespace type is traceable to approved evidence;
- value range is calibrated or the product remains index-only;
- decision-maker contact precision/coverage passes the approved Charlotte gate.

### Retention

- calibrated probabilities or defensible risk bands;
- lift/precision/recall at seller review capacity;
- revenue-weighted results;
- temporal and market holdout performance;
- faithful pre-outcome reason codes;
- correct renewal/contact timing.

### Contactability

- business identity match rate;
- named decision-maker coverage;
- actionable professional channel coverage;
- manual precision and role relevance;
- freshness, duplicate, and false-match rates;
- provider contribution and cost per accepted contact;
- 100% source/status/suppression completeness for actionable records.

### Multi-market

- one manifest/package contract builds the pilot and at least two additional approved markets;
- consistent units, versions, and quality gates;
- no Ohio-specific feature assumptions in the product domain;
- performance and responsive behavior remain acceptable.

## 6. Data modes

### Demo

Deterministic synthetic values, visibly labeled, safe for public/offline use.

### Validated

Versioned approved data and models. Requires source vintage, feature/model version, as-of date, confidence/coverage, validation status, and authenticated internal loading for restricted fields.

## 7. Methodology requirements

### Public demand

- category-aware feature registry;
- ACS estimates/MOEs/annotations retained;
- Business Patterns suppression/coverage retained;
- explicit USPS ZIP vs ZCTA reconciliation;
- stable reference universe;
- explainable raw and transformed features;
- index first, dollar calibration only with holdout support.

### Penetration and whitespace

- approved addressable-business denominator;
- reconciled active-advertiser/revenue numerator;
- account, product/media, geography, category, and revenue whitespace separated;
- no circular definition where current revenue directly creates the demand estimate;
- low-N, unmatched, and unsupported cases visible.

### Retention

- written churn/nonrenewal event and horizon;
- one row per account/snapshot;
- feature availability dates and leakage checks;
- rules baseline and regularized logistic baseline;
- optional challenger only if it earns complexity;
- temporal/market split;
- calibration and capacity/value thresholds;
- stable reason codes and proxy review.

## 8. Contact requirements

Provider chain:

1. CRM relationship truth;
2. approved business identity;
3. approved professional enrichment;
4. optional legal-entity verification;
5. human review.

Every real contact requires:

- business/contact identifier;
- name/title/role type/relevance;
- approved professional channel;
- source/provider record;
- confidence/status;
- last verified date;
- suppression state;
- authenticated delivery.

## 9. Product requirements

### Seller Action Center

- default Account Whitespace;
- Retention second;
- Category Expansion third;
- secondary New Business handoff;
- account and decision-maker card;
- evidence, value/headroom or risk, confidence, freshness, and next action;
- human-controlled outreach actions.

### Client Campaign Planner

- client-safe scenario comparison;
- no internal contact, churn, account, revenue, or seller fields;
- simulations labeled modeled and non-causal unless validated otherwise.

### Market Opportunity Map

- public demand, penetration/whitespace, confidence/coverage, and methodology lenses;
- stable geographic orientation and performance laws.

## 10. Validation gates

1. Data/governance approval.
2. Geography/contract fixture passes.
3. Pilot public feature table passes quality review.
4. Internal account/outcome/contact panel passes privacy, leakage, and reconciliation review.
5. Methods beat or appropriately fail simple baselines.
6. Charlotte contact sample passes approved precision/suppression gate.
7. Unseen-market transfer is reported.
8. Product values reconcile to frozen artifacts.
9. Client/internal and public/private boundaries pass QA.
10. Clean environment reproduces release.

## 11. Architecture requirements

- retain existing Vite/React/TypeScript/MapLibre product;
- add a small tested analytics package rather than moving data science into the frontend;
- export sanitized versioned market packages;
- load real contacts through an authenticated adapter;
- no raw internal data or provider responses in Git;
- no business logic in JSX or MapLibre;
- preserve responsive and offline adapters.

## 12. Delivery plan

The full sequence and card-level acceptance criteria are in:

```text
docs/FALL_PROJECT_HANDOFF.md
docs/PROJECT_BOARD.csv
```

The immediate technical continuation is documented in `CURRENT_HANDOFF.md` and `STATUS.md`.
