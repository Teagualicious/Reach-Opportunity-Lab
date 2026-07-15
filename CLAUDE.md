# CLAUDE.md

Instructions for Claude Code sessions in this repository. Read STATUS.md before starting any work.

## Project overview

**Spectrum Reach Opportunity Lab** — a geographic market-intelligence and scenario-planning tool. It combines a ZIP/ZCTA-based market map with opportunity scoring, deterministic strategy simulation, template-generated explanations, and a conceptual handoff into Spectrum Reach Architect (the campaign-activation destination — this product is the upstream intelligence layer, not a replacement for it). The workflow follows one arc: **Describe → Prioritize → Simulate → Activate**.

One intelligence layer powers two experiences:
- **Client Growth Studio** (external) — helps an advertiser find geographic, audience, media, and conversion opportunities and simulate campaign changes. Never exposes internal-only metrics.
- **Market Growth Studio** (internal) — helps Spectrum Reach sellers and leadership find new business, grow accounts, flag retention risk, and rank category opportunity.

**Current deliverable:** a one-week executive prototype for a QR-code/presentation demo. It must look and behave like a credible product with a guided tour, but it does **not** contain a real predictive model, live LLM/agents, real Spectrum data, or a live Architect integration. All data is synthetic and must be labeled as such; keep client and internal data strictly separated. Preserve the existing HTML map unless an audit proves it can't be extended safely.

**Done** = the acceptance criteria in the build spec are met: map + ZIP selection work, one full client scenario and at least two internal scenarios run, simulation is deterministic and reproducible, the guided tour has no dead ends, the Architect handoff is clear, and the QR/mobile experience works — all with synthetic data clearly labeled.

The full product, architecture, data model, and 7-day implementation plan live in [`PRODUCT_BUILD_SPEC.md`](PRODUCT_BUILD_SPEC.md) — read it before non-trivial product work.

## Stack

- Python 3.11+ (standard library preferred over new dependencies)
- Tests: pytest, in `tests/`
- Dependencies: `requirements.txt` — do not add a dependency without noting why in the commit message

## Workflow rules

1. **Start of session:** read STATUS.md to learn current phase, what's done, and what's next. Do not re-derive project state from scratch.
2. **Scope:** work only on the task given. If you notice unrelated problems, list them in STATUS.md under "Noticed" — do not fix them unprompted.
3. **Tests are the gate.** Run `pytest` before declaring any task complete. A task with failing tests is not done. New behavior gets a new test.
4. **End of session (every time):**
   - Update STATUS.md: what changed, what's next, any decisions made — record decisions in the decision-log format below
   - Commit with a clear message
   - Leave the repo in a state a fresh session can pick up with zero conversation context

### Decision-log format (STATUS.md)

Every non-trivial choice gets logged so reasoning survives session handoffs:

```
- YYYY-MM-DD | DECISION: what was chosen
  Considered: alternatives evaluated
  Rejected because: the actual reason, not a platitude
  Must preserve: constraints the next agent must not break
```

## Code style

- Minimal code that solves the stated problem. Reuse existing functions before writing new ones. Stdlib before dependencies. One line if one line works.
- Never cut: input validation at trust boundaries, error handling around I/O, anything security-relevant.
- No speculative abstractions. No "manager" or "handler" classes for things that happen once.
- Match the existing style of the file being edited.

## Data hygiene (non-negotiable)

- No real client data, campaign data, credentials, or company-internal exports in this repo. Ever.
- Test fixtures use synthetic data only (see `tests/fixtures/`).
- If a task requires realistic data shapes, generate fake data matching the schema.

## Phase discipline

Work is organized in phases (see STATUS.md). A phase ends with: tests passing, STATUS.md updated, changes committed. Prefer finishing a phase over starting the next one.
