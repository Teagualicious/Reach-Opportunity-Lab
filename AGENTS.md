# AGENTS.md

House rules for any AI or automated contributor working in this repository. `CLAUDE.md` is the authority if files disagree.

## Start sequence

Read:

1. `CURRENT_HANDOFF.md`
2. `STATUS.md`
3. `ARCHITECTURE.md`
4. `PRODUCT_BUILD_SPEC.md`
5. `BUILD_HANDOFF.md`

Do not treat files under `docs/archive/pre-fall-pivot/` as current instructions.

## Workflow laws

1. Work only on the assigned task and record unrelated findings under `STATUS.md` **Noticed**.
2. Use a feature branch. Never commit directly to `main`.
3. Run `npm run typecheck`, `npm run test`, and `npm run build` before declaring product work complete.
4. Run `npm run offline:all` for changes that can affect offline packaging or shared UI/assets.
5. Real-browser expanded/compact review is required for UI acceptance.
6. PR descriptions state what changed, why, validation performed, and the least-certain area.
7. Update `STATUS.md` last and leave a zero-context handoff.

## Product laws

- Account Whitespace is the default Seller Action Center objective.
- Retention / KEEP is second.
- New Business is a secondary handoff.
- Do not collapse objective-specific methods into one universal score.
- Client Campaign Planner remains client-safe.

## Code laws

- Domain logic is independent from React, MapLibre, storage, network, CRM, and provider libraries.
- Use strict TypeScript and typed trust boundaries.
- Reuse existing modules and keep dependencies small.
- Validate input/output at every I/O boundary.
- Map layers consume typed definitions; do not hard-code business truth in map expressions or JSX.
- Preserve one-source map performance and responsive layout laws.

## Data/contact hygiene

- No real client, account, campaign, revenue, seller, or contact data in Git or public/static artifacts.
- No credentials or provider keys in frontend code.
- Synthetic fixtures are deterministic, version-controlled, and visibly labeled.
- Real contacts require authenticated loading, provenance, confidence/status, freshness, and suppression.
- Never automate email, calls, texts, or sequences.
- Never scrape interactive government portals.
- Never label a registered agent or generic inbox as a verified decision maker without evidence.
