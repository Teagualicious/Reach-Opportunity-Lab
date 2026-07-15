# AGENTS.md

House rules for any AI agent working in this repository (Codex, Claude Code, or other). These are laws, not role assignments — the task prompt assigns the job; this file governs how any job is done. This file mirrors CLAUDE.md; if they ever disagree, CLAUDE.md wins and this file should be updated to match.

## Before any work

Read `STATUS.md` first. It holds current phase, completed work, next tasks, and the decision log. Do not re-derive project state, and do not re-litigate decisions recorded in the log — if a logged decision seems wrong, note it under "Noticed" and continue.

## Workflow laws

1. **Scope:** do only the task given. Unrelated problems you spot go in STATUS.md under "Noticed" — never fix them unprompted.
2. **Tests gate completion.** Run `pytest` before declaring done. Failing tests = not done. New behavior gets a new test.
3. **Work on a branch, deliver as a PR.** Never commit directly to main.
4. **End of session, every time:** update STATUS.md (what changed, what's next, decisions made — in the decision log format below), commit with a clear message, leave the repo in a state a fresh session with zero context can pick up.

## Decision log format (STATUS.md)

Every non-trivial choice gets logged so reasoning survives agent handoffs:

```
- YYYY-MM-DD | DECISION: what was chosen
  Considered: alternatives evaluated
  Rejected because: the actual reason, not a platitude
  Must preserve: constraints the next agent must not break
```

## Code laws

- Minimal code that solves the stated problem. Reuse existing functions before writing new ones. Stdlib before dependencies. New dependencies require a justification in the commit message.
- Never cut: input validation at trust boundaries, error handling around I/O, anything security-relevant.
- No speculative abstractions; no manager/handler classes for things that happen once. Match the style of the file being edited.

## Data hygiene (non-negotiable)

- No real client data, credentials, or company-internal exports enter this repo. Test fixtures are synthetic only (`tests/fixtures/`).
- Respect `.gitignore` — never force-add ignored files.

## Review handoffs

Work delivered by one agent may be reviewed by another. Write PR descriptions for that reviewer: what changed, why, what you're least confident about. If you receive review findings, address them or rebut them explicitly in the PR thread — never silently ignore a finding.
