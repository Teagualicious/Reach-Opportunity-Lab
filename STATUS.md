# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 1 — Scalable frontend foundation

## Done

- Repo cleanup: removed committed `tests/__pycache__`, added root `.gitignore` (Python cache/venv, data files csv/xlsx/pptx except `tests/fixtures/*.csv`, secrets), added `.github/workflows/ci.yml` (pytest on push/PR, Python 3.12).
- CI `release` job: on pushes to `main` after tests pass, zips source (excludes `.git`, `tests`, `__pycache__`) as `{repo}_{date}_r{run_number}.zip` and publishes a GitHub Release tagged `build-{run_number}` via `softprops/action-gh-release` using the built-in `GITHUB_TOKEN` (`contents: write`, no new secrets).
- Added `AGENTS.md` (house rules for any AI agent, mirrors CLAUDE.md). Adopted a structured decision-log format across `AGENTS.md`, `CLAUDE.md`, and this file's Decisions log; CLAUDE.md's end-of-session rule now references it.
- Filled in CLAUDE.md's Project overview (Spectrum Reach Opportunity Lab: two studios, Describe→Prioritize→Simulate→Activate, one-week synthetic-data prototype) and renamed the handoff doc `Opportunity_Lab.md` → `PRODUCT_BUILD_SPEC.md` (the name the doc references), linked from the overview.
- Added `BUILD_HANDOFF.md` (root): technical audit of the unavailable MapLibre choropleth map — data model, layers, color-ramp pipeline, feature-state interaction, filter/competitor logic, preserve-vs-extend list, target-product/build-sequence recap, and map behavior reference.
- Added `ARCHITECTURE.md`: production-shaped frontend boundaries, local-first delivery rules, typed demo-data adapters, ZIP/ZCTA primary geography, prohibited shortcuts, and scaling path.

## Next up

1. Scaffold a Vite + React + TypeScript application with strict checking, MapLibre, Vitest, local dev/build/preview commands, and an updated CI pipeline.
2. Add typed domain contracts and a `DemoOpportunityRepository` backed by synthetic ZIP opportunity data and local ZIP/ZCTA geometry.
3. Implement the ZIP-level MapLibre foundation: opportunity heat coloring, hover, selection, score detail, reset, and persistent synthetic-data disclosure.

## Decisions log

<!-- Reasoning must survive agent handoffs. Log every non-trivial choice in this format.
     The next agent (or model) reads this instead of re-litigating settled questions. -->

- YYYY-MM-DD | DECISION: what was chosen
  Considered: alternatives that were evaluated
  Rejected because: the actual reason (perf, complexity, dependency weight, policy)
  Must preserve: constraints the next agent must not break

<!-- Example:
- 2026-07-15 | DECISION: CSV parsing uses stdlib csv module, not pandas
  Considered: pandas, polars
  Rejected because: 50MB dependency for one read loop; app ships as a desktop exe
  Must preserve: parser must stream row-by-row — files can exceed memory
-->

- 2026-07-12 | DECISION: CI targets Python 3.12 only
  Considered: a version matrix across 3.11/3.12/3.13
  Rejected because: 3.12 matches the current toolchain; a matrix adds cost for versions nothing yet needs
  Must preserve: this decision is superseded when the web application scaffold replaces the Python-only template pipeline

- 2026-07-15 | DECISION: structured decision-log format (DECISION/Considered/Rejected because/Must preserve)
  Considered: keeping the one-line "Date — decision — why" format
  Rejected because: one line loses the alternatives and constraints that keep the next agent from re-litigating a settled choice
  Must preserve: keep AGENTS.md, CLAUDE.md, and this log's format in sync — CLAUDE.md is the authority they mirror

- 2026-07-15 | DECISION: CLAUDE.md Project overview is a concise summary that points to PRODUCT_BUILD_SPEC.md, not the full spec inlined
  Considered: pasting the whole ~1,700-line handoff doc into CLAUDE.md; a longer multi-paragraph overview
  Rejected because: every session loads CLAUDE.md first — inlining 44KB bloats that context; the spec itself says to keep the full handoff as a standalone PRODUCT_BUILD_SPEC.md
  Must preserve: keep the overview in sync with PRODUCT_BUILD_SPEC.md if the product scope changes; the spec file is the canonical source of product/architecture detail

- 2026-07-15 | DECISION: keep the existing-map technical audit as a separate BUILD_HANDOFF.md rather than folding it into PRODUCT_BUILD_SPEC.md
  Considered: merging it into PRODUCT_BUILD_SPEC.md; inlining it into CLAUDE.md
  Rejected because: it is a distinct concern (how the reference MapLibre experience behaved) vs. the product/architecture vision; one giant merged file is harder to hand off
  Must preserve: use BUILD_HANDOFF.md as a behavioral reference, not as proof that unavailable source code exists

- 2026-07-15 | DECISION: rebuild the map from the behavioral handoff and screenshots instead of waiting for the original HTML
  Considered: blocking until the source could be exported; reproducing the screenshots as a static mock; rebuilding from the documented behavior
  Rejected because: the source cannot be exported, while the handoff and screenshots provide enough product and interaction detail for a clean implementation
  Must preserve: screenshots are visual reference only; implement maintainable behavior rather than pixel-copying accidental details

- 2026-07-15 | DECISION: use Vite + React + strict TypeScript + MapLibre with domain, data, map, and feature boundaries
  Considered: another monolithic HTML file; vanilla untyped JavaScript; a large full-stack framework before a backend exists
  Rejected because: monolithic or untyped code would accelerate the first screenshot but create migration debt; a full-stack framework adds infrastructure before it is needed
  Must preserve: business scoring and simulation remain pure TypeScript; React and MapLibre are adapters at the edges; avoid broad `any` types and hidden side effects

- 2026-07-15 | DECISION: synthetic demo data is provided through typed repository interfaces
  Considered: importing JSON directly inside UI components; hard-coding metrics in JSX; waiting for a production API schema
  Rejected because: direct UI coupling makes the demo implementation the permanent architecture, while waiting for production data blocks the local prototype
  Must preserve: replace demo data by swapping repository composition, not by rewriting screens or domain logic

- 2026-07-15 | DECISION: the primary selectable and scored map unit is a ZIP-like ZCTA polygon
  Considered: preserving large Spectrum Reach sales zones as the primary unit; a non-geographic dashboard; ZIP-level heat cells
  Rejected because: the intended finished product gives each ZIP its own opportunity score and uses larger zones as supporting context
  Must preserve: sales zones may be added as groupings or overlays, but opportunity scoring, hover, selection, and detail start at the ZIP/ZCTA level

- 2026-07-15 | DECISION: deliver a local runnable product before adding Vercel or other hosting
  Considered: designing deployment first; implementing the local product first
  Rejected because: hosting does not validate the product story or interaction model and should not shape domain or feature code
  Must preserve: `npm run dev`, `npm run build`, and `npm run preview` must work without a backend, credentials, or deployment configuration

## Noticed (not yet acted on)

<!-- Problems spotted mid-task but out of scope. Harvest these periodically. -->
- The original HTML implementation is unavailable. No code should claim that current behavior was extracted or preserved byte-for-byte.
- The current repository is still a Python project template; Phase 1 must deliberately migrate documentation, tests, and CI to the web application stack rather than layering Node tooling beside stale instructions indefinitely.

## How to run

The web application scaffold is the next task. Until it lands, the legacy template smoke test remains:

```bash
pip install -r requirements.txt
pytest
```

The Phase 1 target commands are:

```bash
npm install
npm run dev
npm run test
npm run build
npm run preview
```