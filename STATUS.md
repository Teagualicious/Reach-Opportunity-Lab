# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 0 — Project setup

## Done

- Repo cleanup: removed committed `tests/__pycache__`, added root `.gitignore` (Python cache/venv, data files csv/xlsx/pptx except `tests/fixtures/*.csv`, secrets), added `.github/workflows/ci.yml` (pytest on push/PR, Python 3.12).
- CI `release` job: on pushes to `main` after tests pass, zips source (excludes `.git`, `tests`, `__pycache__`) as `{repo}_{date}_r{run_number}.zip` and publishes a GitHub Release tagged `build-{run_number}` via `softprops/action-gh-release` using the built-in `GITHUB_TOKEN` (`contents: write`, no new secrets).
- Added `AGENTS.md` (house rules for any AI agent, mirrors CLAUDE.md). Adopted a structured decision-log format across `AGENTS.md`, `CLAUDE.md`, and this file's Decisions log; CLAUDE.md's end-of-session rule now references it.

## Next up

1. (first task goes here)
2.
3.

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
  Must preserve: add a matrix here if multi-version support becomes a requirement

- 2026-07-15 | DECISION: structured decision-log format (DECISION/Considered/Rejected because/Must preserve)
  Considered: keeping the one-line "Date — decision — why" format
  Rejected because: one line loses the alternatives and constraints that keep the next agent from re-litigating a settled choice
  Must preserve: keep AGENTS.md, CLAUDE.md, and this log's format in sync — CLAUDE.md is the authority they mirror

## Noticed (not yet acted on)

<!-- Problems spotted mid-task but out of scope. Harvest these periodically. -->
- (none)

## How to run

```
pip install -r requirements.txt
pytest
```
