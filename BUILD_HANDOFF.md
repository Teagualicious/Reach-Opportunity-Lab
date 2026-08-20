# Reach Opportunity Lab — Current Build Handoff

**Canonical branch after PR #24:** `main`  
**Growth/retention merge:** PR #23 / `ee5a57e524753af3752f3e9971493b9cf03aa354`  
**Offline hardening:** PR #24 / `fix/offline-inliner-validation`  
**Purpose:** allow a developer with no prior context to understand the current product, source ownership, validated demo state, fall roadmap, and exact next tasks.

## 1. Product state

Three distinct workspaces share Ohio ZIP/ZCTA geography:

1. Market Opportunity Map
2. Seller Action Center
3. Client Campaign Planner

Seller Action Center is growth/retention first:

```text
Account Whitespace
Retention / KEEP
Category Expansion
New Business Handoff (secondary)
```

Default/reset objective: `account-growth`, displayed as Account Whitespace.

## 2. Growth/retention and contact implementation

### `src/domain/marketMode.ts`

- orders objectives;
- supplies labels/questions/actions;
- marks New Business secondary;
- retains current score transforms as synthetic demo logic.

### `src/domain/businessContact.ts`

Pure deterministic synthetic contact generator.

Inputs:

```text
business name
ZIP
category
market mode
```

Outputs:

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

Adds objective-specific value labels, secondary-workflow status, decision-maker contact, growth/retention copy, revenue-at-risk language, and New Business handoff language.

### `src/features/market-growth/MarketGrowthStudio.tsx`

- initializes/resets to Account Whitespace;
- renders the synthetic decision-maker card;
- exposes unsent Email and Call actions;
- includes decision-maker details/actions in the outreach modal;
- keeps synthetic disclosures visible.

### `src/styles/seller-contact.css`

Responsive contact-card and contact-action styling. Compact actions have a 44 px minimum target.

## 3. Offline packaging implementation

### `scripts/build-offline-review.mjs`

- builds one Vite offline module;
- embeds CSS and JavaScript through callback-based literal replacement;
- escapes inline closing script/style sequences;
- converts generated fonts and product imagery to data URIs;
- embeds approved JSON/GeoJSON data;
- exposes embedded data on `window.__OPPORTUNITY_LAB_OFFLINE_DATA__`;
- writes one standalone HTML plus platform launchers/readme.

Never revert to string replacement with a replacement string: minified JavaScript may contain `$&`, `$1`, or related replacement tokens.

### `src/offline-main.tsx`

- reads the embedded Census context from the dedicated offline global;
- supplies the full FeatureCollection directly to the MapLibre GeoJSON source;
- derives place-label markers from the same object;
- falls back to URL loading only during local development when the global is absent.

MapLibre worker requests do not use the page's `window.fetch` override. Do not move the offline Census source back to a URL in the standalone package.

### `scripts/validate-offline-review.mjs`

Validates:

- minimum package size;
- real script-block structure;
- exactly one inline module;
- valid inline-module JavaScript via `node --check`;
- no external script/link document dependencies;
- no residual `/assets/*` references;
- embedded font and image data;
- required product/data markers;
- minimum Census feature counts.

CI validation is necessary but not sufficient. Direct-from-disk browser review remains required for offline-impacting changes.

## 4. Current data truth

All opportunity, account, prospect, seller, revenue, score, simulation, and contact values are synthetic. Product positioning and demo usability are implemented; validated whitespace, churn, contact-enrichment, and campaign-response models are not.

Never describe demo outputs as empirically validated.

## 5. Contact boundary

### Public demo

Every highlighted business can display a deterministic synthetic decision maker and open an unsent Email or Call action.

### Charlotte validated mode

Provider order:

1. CRM contacts, owner, last touch, renewal owner, suppression;
2. approved business identity/public channels;
3. approved server-side professional enrichment;
4. optional approved legal-entity verification;
5. human review for ambiguity or staleness.

Real contacts are authenticated/internal-only and never enter static assets or public offline packages.

## 6. Source ownership

```text
src/
  app/                    shared shell and viewport/territory state
  components/             reusable controls and guidance
  data/                   repository and geometry adapters
  domain/
    businessContact.ts    synthetic contact contract/generator
    marketMode.ts         objective definitions/demo transforms
    sellerOpportunity.ts  seller action assembly
    opportunity.ts        opportunity contract
    client*.ts            client-safe planning
  features/
    market-growth/        Seller Action Center
    zip-explorer/         Market Opportunity Map
    client-growth/        Client Campaign Planner
  map/                    MapLibre presentation adapters
  offline-main.tsx        standalone offline MapLibre/data adapter
  styles/
    seller-contact.css    contact UI
scripts/
  build-offline-review.mjs
  validate-offline-review.mjs
```

## 7. Documentation ownership

Read:

```text
CURRENT_HANDOFF.md
STATUS.md
BUILD_HANDOFF.md
ARCHITECTURE.md
PRODUCT_BUILD_SPEC.md
docs/FALL_PROJECT_HANDOFF.md
docs/PROJECT_BOARD.csv
docs/CONTACT_STRATEGY.md
docs/VALIDATION.md
```

Historical documents under `docs/archive/pre-fall-pivot/` are not current instructions.

## 8. Validation evidence

Final functional PR #24 commit `5805f43e56735a0e21644d0260a530b623ee3032` passed:

```text
CI run 457
all-offline run 110
19 test files / 56 tests
typecheck
production build
Pages build
offline generation/validation/package/upload/release attachment
```

Direct `file://` Chromium review passed at `1440 × 900` and touch `393 × 852` with:

- complete map/Census context rendering;
- embedded logo/fonts;
- correct objective order and retention label;
- working synthetic contact card/modal links;
- keyboard focus on close;
- no client contact leakage;
- no horizontal overflow;
- 44 px compact contact actions;
- zero page errors, failed requests, bad responses, console errors, or external requests.

See `docs/VALIDATION.md` for the detailed record.

## 9. Regression commands

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run offline:all
```

For changes touching shared UI, maps, assets, offline entry, or packaging, download the workflow artifact and open it directly from disk in expanded and compact browser viewports.

## 10. Immediate next sequence

1. Approve the New Business handoff destination/configuration.
2. Freeze Charlotte market/cohort and growth/churn outcomes.
3. Inventory CRM/contact/suppression fields.
4. Finalize validated contact/provider contracts.
5. Approve one professional enrichment provider.
6. Manually validate a Charlotte contact sample.
7. Build observed-outcome Account Whitespace and Retention datasets/methods.
8. Replace Ohio-only loading with market manifests.
9. Introduce explicit Demo/Validated UI status and version metadata.

## 11. Least-certain areas

- Exact internal New Business handoff destination is not configured.
- Charlotte contact coverage/provider economics are unknown until a real sample is adjudicated.
- Current mode scores and dollar ranges are demonstration heuristics.
- Physical-device review remains useful even though compact Chromium contracts passed.

## 12. Do not reintroduce

- New Business as default;
- one universal score;
- real contact/account data in Git or public/static files;
- provider keys/enrichment calls in browser;
- automatic outreach;
- registered-agent-as-decision-maker assumptions;
- map-owned business logic;
- duplicate statewide geometry sources;
- uncontrolled randomness;
- hidden demo/validated mixing;
- replacement-string asset inlining;
- linked generated assets in standalone HTML;
- URL-backed offline MapLibre context in the final package.
