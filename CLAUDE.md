# CLAUDE.md

Instructions for coding sessions in this repository. Read `STATUS.md` before starting any work.

## Project overview

**Spectrum Reach Opportunity Lab** is a geographic market-intelligence and deterministic scenario-planning product. One shared ZIP/ZCTA intelligence layer powers an external Client Growth Studio and an internal Market Growth Studio through the workflow **Describe → Prioritize → Simulate → Activate**.

The current deliverable is a locally runnable executive prototype. It uses synthetic opportunity, advertiser, prospect, account, performance, reach-gap, and competitor-footprint data. It does not contain a production predictive model, live LLM calls, real Spectrum data, or a live Architect integration. Architect is the campaign-planning and activation destination, not a capability this product replaces.

Read [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md) for product scope, [`BUILD_HANDOFF.md`](BUILD_HANDOFF.md) for the current technical handoff, and [`ARCHITECTURE.md`](ARCHITECTURE.md) for dependency boundaries.

## Stack

- Vite
- React
- strict TypeScript
- MapLibre GL JS
- Vitest
- CSS variables and modular stylesheets

## Workflow rules

1. Read `STATUS.md` first and continue from its **Next up** list.
2. Work only on the assigned task. Record unrelated issues under **Noticed**.
3. Run `npm run typecheck`, `npm run test`, and `npm run build` before declaring product work complete.
4. Work on a branch and deliver through a pull request. Never commit directly to `main`.
5. End every session by updating `STATUS.md` and leaving a zero-context handoff.

### Decision-log format

```text
- YYYY-MM-DD | DECISION: what was chosen
  Considered: alternatives evaluated
  Rejected because: the actual reason
  Must preserve: constraints the next agent must not break
```

## Architecture rules

- Domain scoring, simulation, recommendations, and overlay validation are pure TypeScript.
- React features consume typed repositories and domain services.
- MapLibre renders geometry and domain-provided values; it does not own business truth.
- Network and local-file access live behind repository or source interfaces.
- Keep client-facing and internal-only data separated.
- Do not add deployment-specific behavior to domain or feature modules.
- Do not create monolithic HTML/JavaScript or business rules embedded in JSX event handlers.
- Do not hide boundary problems with broad `any` types.

## Data hygiene

- No real company data, credentials, internal exports, client identifiers, campaign data, or revenue data.
- All demonstration fixtures are synthetic, deterministic, and visibly disclosed.
- Geographic boundary and basemap providers must preserve attribution and provenance.
