# STATUS

> Single source of truth for the current branch. Read this first and update it last.

## Current phase

**Fall pivot foundation — growth/retention-first Seller Action Center and synthetic decision-maker contact path**

Working branch:

```text
feature/growth-retention-decision-makers
```

## Product direction

The product hierarchy is now:

1. **Account Whitespace / GROW**
2. **Retention / KEEP**
3. **Category Expansion**
4. **New Business Handoff** — secondary

The fall project is primarily a methodology, validation, secure-data, and multi-market build. The current application remains a production-shaped synthetic demo until validated market packages are introduced.

## Done on this branch

- Changed Seller Action Center default/reset mode from `new-business` to `account-growth`.
- Reordered visible seller objectives to Account Whitespace, Retention / KEEP, Category Expansion, and New Business Handoff.
- Marked New Business as a secondary workflow in the typed mode definition.
- Reframed account-growth language around product, media, audience, and geographic whitespace.
- Reframed retention value as modeled revenue at risk.
- Added pure deterministic `businessContact.ts` contact generation.
- Added category- and objective-aware synthetic decision-maker roles.
- Added reserved `.example` emails and reserved `202-555-01xx` phone values.
- Added a visible synthetic decision-maker card to each Seller Action Center account brief.
- Added human-initiated Email and Call actions to the detail view and outreach modal.
- Added unit coverage for objective order, secondary New Business status, deterministic contacts, reserved values, and workflow language.
- Added responsive contact-card styling.
- Rewrote the authoritative root documentation for the fall project and preserved old documentation under `docs/archive/pre-fall-pivot/`.
- Added the detailed fall handoff, 126-card project board, contact strategy, and validation record under `docs/`.

## Validation state

Focused pre-commit validation completed before publication:

- unified patch reverse/forward check;
- strict TypeScript checking for changed domain/test sources;
- focused JSX/type-surface parse for `MarketGrowthStudio.tsx`;
- runtime assertions for objective order, secondary status, deterministic synthetic contacts, reserved emails/phones, whitespace label, and revenue-at-risk label.

Branch-level required gates:

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run offline:all
```

GitHub Actions on the pushed branch is the authoritative full-repository signal. Real-browser visual review remains separate.

## Next up

1. Review branch CI and correct any full-repository failures.
2. Perform expanded and compact real-browser review of Seller Action Center contact cards and modal actions.
3. Approve the exact New Business handoff destination and configuration.
4. Inventory Charlotte CRM contact, account-owner, last-touch, renewal, and suppression data.
5. Finalize validated `DecisionMakerContact` states and provider interface.
6. Approve one server-side professional enrichment provider.
7. Run a manually adjudicated Charlotte contact-quality sample.
8. Build observed-outcome Account Whitespace and Retention methods.
9. Introduce manifest-driven multi-market packages and explicit Demo/Validated modes.

## Blocked / external input

- Charlotte market boundary and comparison market.
- Approved internal account/campaign/outcome extracts.
- Churn/nonrenewal target and prediction horizon.
- Growth/whitespace realization outcome.
- CRM contact and suppression fields.
- Professional enrichment provider and procurement approval.
- New Business handoff route/product identifier.
- Privacy/security approval for authenticated real-contact delivery.

## Decisions log

- 2026-08-20 | DECISION: Account Whitespace and Retention are the primary Seller Action Center workflows
  Considered: retaining New Business as the default, removing it entirely, and combining all objectives into one score
  Rejected because: New Business overlaps a recently launched Spectrum Reach capability, while whitespace and retention are more differentiated and require distinct evidence
  Must preserve: Account Whitespace opens first; Retention / KEEP is second; New Business remains a secondary handoff

- 2026-08-20 | DECISION: highlighted businesses include a typed decision-maker contact path
  Considered: showing only business names, scraping public registries in the browser, and automatically sending outreach
  Rejected because: insight without an actionable person stops before seller execution, while browser scraping and automated outreach weaken privacy, accuracy, and control
  Must preserve: synthetic contacts in public demo mode; CRM-first approved enrichment in authenticated mode; provenance, freshness, confidence, suppression, and human-initiated actions

- 2026-08-20 | DECISION: preserve the existing React/TypeScript/MapLibre product foundation
  Considered: replacing the application with a new analytics dashboard
  Rejected because: the current boundaries, map performance, responsive shell, deployment, and offline adapters already support the fall evolution
  Must preserve: analytics and real-data adapters replace demo truth without moving business logic into React or MapLibre

- 2026-08-20 | DECISION: archive rather than delete the pre-pivot documentation
  Considered: keeping conflicting documents at the root and deleting historical design context
  Rejected because: root conflicts confuse new contributors, while deletion loses useful history
  Must preserve: current root docs are authoritative; `docs/archive/pre-fall-pivot/` is historical only

## Noticed

- The mode score transforms, opportunity values, seller entities, opportunity ranges, and contact values are still synthetic demo logic. Product copy must not imply empirical validation.
- Contact links use reserved values but still open the user's configured mail/phone application. The UI must continue labeling them as synthetic.
- The New Business handoff destination is not yet configured.
- The stable GitHub Pages URL tracks merged `main`, not this feature branch.
- The existing Ohio loader remains hard-coded and must be generalized for Charlotte and additional markets.

## Historical record

Pre-pivot status and design decisions are preserved at:

```text
docs/archive/pre-fall-pivot/STATUS.md
docs/archive/pre-fall-pivot/PRODUCT_BUILD_SPEC.md
```
