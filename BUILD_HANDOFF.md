# Reach Opportunity Lab — Current Build Handoff

**Branch:** `feature/growth-retention-decision-makers`  
**Base:** `main` commit `b769fac1dffcff5957bb8c96ae181c0175e971a1`  
**Purpose:** allow a developer with no prior context to understand the current product, the code change, the fall roadmap, validation requirements, and the exact next tasks.

## 1. Product state

The application still contains three distinct workspaces over shared Ohio ZIP/ZCTA geography:

1. Market Opportunity Map
2. Seller Action Center
3. Client Campaign Planner

The current branch changes Seller Action Center to lead with existing-account expansion and retention.

### Seller Action Center objectives

```text
Account Whitespace
Retention / KEEP
Category Expansion
New Business Handoff (secondary)
```

The default and reset objective is `account-growth`, displayed as Account Whitespace.

## 2. Code changes

### `src/domain/marketMode.ts`

- reorders mode definitions;
- changes labels/questions/actions;
- adds `secondary?: boolean`;
- marks New Business as secondary;
- leaves current score transforms as synthetic demo logic.

### `src/domain/businessContact.ts`

Pure deterministic synthetic contact generator.

Inputs:

```text
business name
ZIP
category
market mode
```

Output:

```text
fictional name
role/title
.example email
202-555-01xx phone
preferred channel
source label
confidence/status
suppression flag
```

The module imports no React, storage, network, CRM, or provider library.

### `src/domain/sellerOpportunity.ts`

Adds:

- `valueLabel`;
- `secondaryWorkflow`;
- `decisionMaker`;
- growth/retention-first copy;
- revenue-at-risk language for retention;
- approved-workflow handoff language for New Business.

### `src/features/market-growth/MarketGrowthStudio.tsx`

- initializes and resets to `account-growth`;
- updates workspace guidance;
- shows objective-specific value labels;
- renders a synthetic decision-maker card;
- exposes `mailto:` and `tel:` actions;
- adds decision-maker information/actions to the outreach modal;
- expands the synthetic disclosure to include contacts.

### `src/styles/seller-contact.css`

Adds responsive contact-card and contact-action styles.

### Tests

- `businessContact.test.ts` validates deterministic reserved demo values;
- `marketMode.test.ts` validates objective order and secondary New Business;
- `sellerOpportunity.test.ts` validates growth/retention language, values, and contacts.

## 3. Current data truth

All opportunity, account, prospect, seller, revenue, score, simulation, and contact values are synthetic. The branch changes product positioning and demo usability; it does not create a validated whitespace, churn, or contact-enrichment model.

Never describe the branch as empirically validated.

## 4. Contact implementation boundary

### Public demo

Every highlighted business can display a deterministic synthetic decision maker and open an unsent Email or Call action.

### Charlotte validated mode

Required provider order:

1. CRM contacts, owner, last touch, renewal owner, suppression;
2. approved business identity and public business channels;
3. approved server-side professional enrichment;
4. optional approved legal-entity verification;
5. human review for ambiguity/staleness.

Real contacts must be authenticated/internal-only and must never enter static assets or offline public packages.

## 5. Source ownership

```text
src/
  app/                    shared shell and viewport/territory state
  components/             reusable controls and guidance
  data/                   repository and geometry adapters
  domain/
    businessContact.ts    synthetic contact contract/generator
    marketMode.ts         objective definitions and demo transforms
    sellerOpportunity.ts  seller action assembly
    opportunity.ts        opportunity contract
    client*.ts            client-safe planning
  features/
    market-growth/        Seller Action Center
    zip-explorer/         Market Opportunity Map
    client-growth/        Client Campaign Planner
  map/                    MapLibre presentation adapter
  styles/
    seller-contact.css    contact UI
```

## 6. Documentation ownership

Start with:

```text
CURRENT_HANDOFF.md
STATUS.md
BUILD_HANDOFF.md
ARCHITECTURE.md
PRODUCT_BUILD_SPEC.md
docs/FALL_PROJECT_HANDOFF.md
docs/PROJECT_BOARD.csv
docs/CONTACT_STRATEGY.md
```

Historical documents live under `docs/archive/pre-fall-pivot/` and are not current instructions.

## 7. Validation

Run:

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run offline:all
```

Then review in a real browser:

- Account Whitespace opens first after initial load/reset;
- mode order is correct in expanded and compact layouts;
- decision-maker contact card is readable and scroll-safe;
- Email and Call links receive visible keyboard focus;
- modal contains account and decision-maker fields;
- every demo contact uses `.example` and `202-555-01xx`;
- client workspace contains no contact fields;
- map selection, camera, panel collapse, and feature-state performance remain correct.

## 8. Immediate next sequence

1. Resolve any branch CI or browser-review findings.
2. Approve the exact New Business handoff destination.
3. Add configuration for the handoff without importing the other product's business logic.
4. Inventory Charlotte CRM/contact/suppression fields.
5. Finalize validated contact/provider contracts.
6. Select and approve one professional enrichment provider.
7. Manually validate a Charlotte sample.
8. Build Account Whitespace and Retention datasets and observed outcomes.
9. Replace Ohio-only loading with market manifests.
10. Introduce explicit Demo/Validated UI status and version metadata.

## 9. Least-certain areas

- Final visual density of the contact card in compact mode requires real-device/browser judgment.
- The exact internal New Business handoff destination is not public/configured.
- Charlotte contact coverage and provider economics are unknown until a real sample is adjudicated.
- Current mode score transforms and dollar ranges are demonstration heuristics.

## 10. Do not reintroduce

- New Business as the default product objective;
- one universal score for growth, retention, category, and acquisition;
- real contact data in public/static files;
- provider keys or enrichment calls in the browser;
- automatic outreach;
- registered-agent-as-decision-maker assumptions;
- map-owned business logic;
- document-level desktop scrolling;
- duplicate statewide geometry sources;
- uncontrolled randomness;
- hidden mixing of demo and validated records.
