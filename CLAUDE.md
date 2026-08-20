# CLAUDE.md

Instructions for coding sessions in this repository.

## Before any work

Read in this order:

1. `CURRENT_HANDOFF.md`
2. `STATUS.md`
3. `ARCHITECTURE.md`
4. `PRODUCT_BUILD_SPEC.md`
5. `BUILD_HANDOFF.md`
6. the relevant file under `docs/`

Archived documentation under `docs/archive/pre-fall-pivot/` is historical and does not override current instructions.

## Product direction

Seller Action Center priority is:

1. Account Whitespace / GROW
2. Retention / KEEP
3. Category Expansion
4. New Business Handoff — secondary

Do not restore New Business as the default without a recorded product decision.

## Stack

- Vite
- React
- strict TypeScript
- MapLibre GL JS
- Vitest
- CSS variables and modular stylesheets

## Workflow rules

1. Read `STATUS.md` first and continue from **Next up**.
2. Work only on the assigned card. Record unrelated issues under **Noticed**.
3. Work on a branch and deliver through a pull request unless the user explicitly requests another publish path.
4. Run `npm run typecheck`, `npm run test`, and `npm run build` before completion.
5. Run `npm run offline:all` when shared application, fixture, styling, map, or offline behavior changes.
6. Perform real-browser expanded and compact review for UI work.
7. End by updating `STATUS.md`, `BUILD_HANDOFF.md` when architecture/flow changes, and the project board evidence.

## Architecture rules

- Domain logic does not import React, MapLibre, storage, network, CRM, or provider SDKs.
- React features consume typed repositories and domain services.
- MapLibre renders supplied state; it does not own score, recommendation, contact, suppression, or territory truth.
- Demo and Validated data modes remain explicit.
- Every product surface renders correctly in expanded and compact modes through the shared 900px viewport contract.
- Client-facing and internal-only data remain separated.
- Deployment-specific behavior does not enter domain/feature modules.
- No broad `any`, uncontrolled randomness, duplicate sources of truth, or business rules in JSX handlers.

## Contact/data laws

- No real contact, account, campaign, revenue, seller, or provider-response data enters Git.
- No provider key or enrichment request runs in frontend code.
- Demo contacts use reserved synthetic values and visible labels.
- Real contacts require authenticated internal delivery, source, confidence/status, freshness, and suppression.
- Suppressed contacts expose no Email or Call action.
- Registered agents and generic inboxes are not verified decision makers.
- No automatic email, dialing, texting, or sequences.
- Never scrape the North Carolina Secretary of State interactive portal.

## Decision-log format

```text
- YYYY-MM-DD | DECISION: what was chosen
  Considered: alternatives evaluated
  Rejected because: the actual reason
  Must preserve: constraints the next contributor must not break
```
