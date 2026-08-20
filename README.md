# Reach Opportunity Lab

Reach Opportunity Lab is a geographic market-intelligence and account-strategy product for Spectrum Reach. The product now prioritizes the existing client book rather than duplicating a newly launched internal new-business workflow.

> **Protect the book. Find the whitespace. Reach the right decision maker.**

## Current product hierarchy

1. **Account Whitespace / GROW** — find product, media, audience, budget, category, and geographic headroom inside existing accounts.
2. **Retention / KEEP** — surface accounts that need proactive intervention and explain the modeled revenue at risk.
3. **Category Expansion** — identify vertical opportunities across the current book.
4. **New Business Handoff** — retain market-demand context, but route prospecting to the approved Spectrum Reach workflow rather than treating it as this product's primary purpose.

The current checked-in business, account, revenue, score, simulation, and contact values remain deterministic synthetic demonstration data. Validated Charlotte work is planned separately and must use approved internal data and authenticated contact loading.

## Start here

A future contributor should read these files in order:

1. [`CURRENT_HANDOFF.md`](CURRENT_HANDOFF.md) — exact restart point, branch, current implementation, blocked decisions, and next sequence.
2. [`STATUS.md`](STATUS.md) — current phase, completed work, validation state, decisions, and next tasks.
3. [`BUILD_HANDOFF.md`](BUILD_HANDOFF.md) — source ownership, changed modules, UI behavior, and validation commands.
4. [`ARCHITECTURE.md`](ARCHITECTURE.md) — durable dependency, trust, geography, contact, responsive, and delivery laws.
5. [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md) — current fall project specification and acceptance gates.
6. [`docs/FALL_PROJECT_HANDOFF.md`](docs/FALL_PROJECT_HANDOFF.md) — detailed methodology, validation, market-scaling, and project-board handoff.
7. [`docs/PROJECT_BOARD.csv`](docs/PROJECT_BOARD.csv) — complete project backlog.
8. [`docs/CONTACT_STRATEGY.md`](docs/CONTACT_STRATEGY.md) — demo and Charlotte decision-maker contact architecture.

Historical pre-pivot root documentation is preserved under `docs/archive/pre-fall-pivot/`.

## Product workspaces

### Market Opportunity Map

**Question:** Where is market opportunity, what evidence drives it, and how reliable is the evidence?

The current demo uses statewide Ohio geography and deterministic synthetic values. The fall project replaces the validated path with versioned public and approved internal data while retaining an explicit demo mode.

### Seller Action Center

**Question:** Which existing account should a seller grow or protect, why now, who should be contacted, and what should the seller do next?

Default objective order:

1. Account Whitespace
2. Retention / KEEP
3. Category Expansion
4. New Business Handoff

Every synthetic highlighted business now receives a deterministic synthetic decision maker with a reserved `.example` email address, a reserved `202-555-01xx` telephone number, a visible synthetic label, and human-initiated Email and Call actions.

### Client Campaign Planner

**Question:** How could a fictional advertiser improve its geographic campaign plan and modeled market position?

This remains client-safe. It must not expose internal account, churn, contact, revenue, penetration, or seller-prioritization data.

## Stable preview

The latest merged `main` build publishes to:

```text
https://teagualicious.github.io/Reach-Opportunity-Lab/
```

The feature branch documented in `CURRENT_HANDOFF.md` is not represented at that stable URL until merged.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

## Validate

```bash
npm run typecheck
npm run test
npm run build
npm run offline:all
```

Real-browser desktop and compact-mode review remains required for visual acceptance.

## Architecture summary

```text
public geography + deterministic demo fixtures
        ↓
typed repository / market-package / geometry adapters
        ↓
pure opportunity, seller, contact, client-planning, scoring, and simulation domain
        ↓
shared React application state
        ↓
Market Opportunity Map / Seller Action Center / Client Campaign Planner
        ↓
MapLibre standard and all-offline presentation adapters
```

## Trust boundaries

- No real client, account, campaign, revenue, seller, or contact data belongs in the public repository or static artifacts.
- Demo contacts use reserved synthetic values only.
- Real Charlotte contact data must load only in authenticated internal mode.
- CRM contact truth precedes external enrichment.
- Every real contact requires provenance, confidence/status, freshness, and suppression state.
- Email and Call actions are initiated by a human. The internship does not auto-send, auto-dial, text, or launch sequences.
- Client-facing and internal-only models remain separated.
- Scores, simulations, opportunity ranges, and decision-maker contacts must identify whether they are demo or validated.
