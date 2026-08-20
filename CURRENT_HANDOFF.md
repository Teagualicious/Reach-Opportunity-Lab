# Current Handoff — Growth, Retention, Whitespace, and Decision-Maker Contacts

**Repository:** `Teagualicious/Reach-Opportunity-Lab`  
**Working branch:** `feature/growth-retention-decision-makers`  
**Branch base:** `main` at `b769fac1dffcff5957bb8c96ae181c0175e971a1`  
**Date:** 2026-08-20  
**Primary product direction:** Account Whitespace and Retention first; New Business is a secondary handoff.

## Exact restart point

A future developer or coding session should:

```bash
git fetch origin
git switch feature/growth-retention-decision-makers
git pull --ff-only origin feature/growth-retention-decision-makers
```

Then read, in order:

1. `CURRENT_HANDOFF.md`
2. `STATUS.md`
3. `BUILD_HANDOFF.md`
4. `ARCHITECTURE.md`
5. `PRODUCT_BUILD_SPEC.md`
6. `docs/FALL_PROJECT_HANDOFF.md`
7. `docs/PROJECT_BOARD.csv`
8. `docs/CONTACT_STRATEGY.md`

Do not restart from the old prototype assumptions. Archived pre-pivot documents are historical context only.

## What this branch changes

### Seller Action Center hierarchy

The branch changes the default and reset objective from New Business to Account Whitespace and orders the modes as:

1. Account Whitespace
2. Retention / KEEP
3. Category Expansion
4. New Business Handoff

New Business is marked secondary and should eventually point to the approved internal Spectrum Reach workflow through configuration.

### Synthetic decision-maker contacts

Each highlighted synthetic business receives a deterministic contact with:

- fictional name;
- category/objective-appropriate role;
- `.example` professional email;
- reserved `202-555-01xx` phone number;
- `Synthetic demo` status;
- source label;
- Email and Call actions.

The contact implementation is pure domain logic in `src/domain/businessContact.ts`. No real contact data or provider credentials are introduced.

### Updated documentation

The authoritative documentation has been rewritten around the fall methodology project, growth/retention product pivot, Charlotte contact strategy, and exact handoff process. Old root documentation is preserved in `docs/archive/pre-fall-pivot/`.

## Files added

```text
CURRENT_HANDOFF.md
docs/FALL_PROJECT_HANDOFF.md
docs/PROJECT_BOARD.csv
docs/CONTACT_STRATEGY.md
docs/VALIDATION.md
src/domain/businessContact.ts
src/domain/businessContact.test.ts
src/styles/seller-contact.css
```

## Files materially updated

```text
README.md
STATUS.md
ARCHITECTURE.md
BUILD_HANDOFF.md
PRODUCT_BUILD_SPEC.md
CLAUDE.md
AGENTS.md
src/domain/marketMode.ts
src/domain/marketMode.test.ts
src/domain/sellerOpportunity.ts
src/domain/sellerOpportunity.test.ts
src/features/market-growth/MarketGrowthStudio.tsx
src/styles/index.css
```

## Validation required on the branch

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run offline:all
```

Also perform:

- expanded desktop browser review;
- compact/mobile browser review;
- keyboard focus and link review;
- confirmation that `.example` and `555-01xx` values are the only demo contacts;
- confirmation that client-facing screens expose no contact data;
- confirmation that the stable map performance laws remain intact.

Check GitHub Actions for the branch push before treating the implementation as complete.

## Immediate next implementation sequence

1. Approve the exact New Business handoff destination and configuration contract.
2. Inventory Charlotte CRM contacts, account ownership, last meaningful touch, renewal ownership, and suppression fields.
3. Finalize `DecisionMakerContact` for validated mode, including missing/generic/suppressed states.
4. Select one approved professional enrichment provider and define procurement, cost, terms, and server-side adapter requirements.
5. Build a Charlotte business/contact sample and manually adjudicate identity, role relevance, precision, freshness, duplicates, and suppression.
6. Replace synthetic contacts only in authenticated validated mode; preserve synthetic public demo mode.
7. Build and validate Account Whitespace and Retention models against observed outcomes.
8. Generalize the Ohio-only loader into a manifest-driven multi-market repository.

## Blocked external decisions

- Exact internal Spectrum Reach destination for New Business handoffs.
- Approved Charlotte CRM fields and extract process.
- Approved professional contact provider.
- Charlotte pilot market boundary and account cohort.
- Churn/nonrenewal and growth/whitespace outcome definitions.
- Privacy, suppression, and authenticated-delivery approval for real contacts.

## Non-negotiable boundaries

- Never commit real contact or account data.
- Never place a provider key in frontend code.
- Never scrape the North Carolina Secretary of State interactive portal.
- Never treat a registered agent or generic inbox as a verified marketing decision maker.
- Never auto-send email, auto-dial, text, or start a sequence.
- Never let New Business regain default product prominence without a recorded product decision.
- Never mix demo and validated records without an explicit data-mode boundary.
