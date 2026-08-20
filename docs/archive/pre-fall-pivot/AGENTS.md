# AGENTS.md

House rules for any AI agent working in this repository. These are laws, not role assignments. `CLAUDE.md` is the authority if the files ever disagree.

## Before any work

Read `STATUS.md`, `ARCHITECTURE.md`, and the relevant build specification before editing. Do not re-litigate recorded decisions; add concerns under `STATUS.md` **Noticed**.

## Workflow laws

1. Work only on the assigned task. Record unrelated problems under `STATUS.md` **Noticed**.
2. Tests gate completion. Run `npm run typecheck`, `npm run test`, and `npm run build` before declaring product work complete.
3. Work on a branch and deliver through a pull request. Never commit directly to `main`.
4. At session end, update `STATUS.md` with completed work, next steps, and decisions; leave a clear zero-context handoff.

## Decision-log format

```text
- YYYY-MM-DD | DECISION: what was chosen
  Considered: alternatives evaluated
  Rejected because: the actual reason
  Must preserve: constraints the next agent must not break
```

## Code laws

- Keep domain logic independent from React, MapLibre, storage, and network access.
- Use strict TypeScript. Do not hide boundary problems with broad `any` types.
- Reuse existing modules and keep dependencies small. New dependencies require a concrete justification.
- Keep input validation and I/O error handling at every trust boundary.
- No speculative abstractions, monolithic components, or duplicate sources of business truth.
- Map layers consume typed overlay definitions; do not hard-code business data in map paint expressions or JSX.

## Data hygiene

- No real client, campaign, account, revenue, or company-export data enters this repository.
- No credentials or secrets in frontend code.
- Demonstration fixtures are synthetic, deterministic, version-controlled, and labeled.
- Client-facing and internal-only models remain separated.
- Preserve geographic source attribution and document whether geometry is official or fallback.

## Review handoffs

PR descriptions must state what changed, why, validation performed, and the least-certain area. Review findings must be addressed or explicitly rebutted.
