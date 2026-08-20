# STATUS

> Single source of truth for current project state. Read this first and update it last.

## Current phase

**Fall pivot foundation validated — growth/retention-first Seller Action Center, synthetic decision-maker path, and hardened standalone offline delivery**

Canonical continuation after PR #24:

```text
main
```

PR #24 carries the offline hardening discovered during post-merge browser validation.

## Product direction

The product hierarchy is:

1. **Account Whitespace / GROW**
2. **Retention / KEEP**
3. **Category Expansion**
4. **New Business Handoff** — secondary

The fall project is primarily a methodology, validation, secure-data, and multi-market build. The application remains a production-shaped synthetic demo until validated market packages are introduced.

## Done

### Growth, retention, and contacts — PR #23

- Changed Seller Action Center default/reset mode from `new-business` to `account-growth`.
- Reordered objectives to Account Whitespace, Retention / KEEP, Category Expansion, and New Business Handoff.
- Marked New Business as secondary in the typed mode definition.
- Reframed growth around product, media, audience, and geographic whitespace.
- Reframed retention value as modeled revenue at risk.
- Added pure deterministic `businessContact.ts` contact generation.
- Added category- and objective-aware synthetic decision-maker roles.
- Added reserved `.example` emails and `202-555-01xx` phone values.
- Added responsive decision-maker cards and human-initiated Email/Call actions to account briefs and outreach modals.
- Added tests for objective order, secondary status, deterministic contacts, reserved values, and workflow language.
- Replaced the active root documentation and archived pre-pivot documents.
- Added the detailed fall handoff, project board, contact strategy, and validation record.
- Squash-merged PR #23 to `main` as `ee5a57e524753af3752f3e9971493b9cf03aa354`.

### Offline hardening — PR #24

- Reproduced a malformed standalone HTML bundle in real Chromium despite green legacy validation.
- Fixed `$&` replacement-token expansion by using literal callback replacements.
- Added generated inline-module syntax validation with `node --check`.
- Added script-block structure validation that ignores script-like text inside JavaScript strings.
- Embedded all generated fonts and product imagery as data URIs.
- Added a hard failure for residual `/assets/*` references.
- Exposed embedded datasets on a dedicated offline global.
- Supplied Census map context to MapLibre as direct in-memory GeoJSON so the worker performs no URL request.
- Derived place-label markers from the embedded context.
- Preserved URL-based loading as a local-development fallback.

## Validation state

### Automated evidence

Growth/retention branch head `783f54b50fd52b39175ed971c7671f964fb2b2b5`:

- CI run 447: passed.
- All-offline run 106: passed under the previous validator.

Final functional PR #24 commit `5805f43e56735a0e21644d0260a530b623ee3032`:

- CI run 457: passed.
- All-offline run 110: passed.
- 19 test files / 56 tests passed.
- Typecheck, production build, Pages build, offline context generation, offline build, validation, packaging, artifact upload, and release attachment passed.

### Manual browser evidence

The final workflow artifact was opened directly from disk through `file://` in Chromium.

Expanded `1440 × 900` and compact touch `393 × 852` both passed:

- full map and Census context render;
- logo and fonts embedded;
- Account Whitespace default and objective order;
- Retention `Revenue at risk` label;
- decision-maker contact card and modal actions;
- visible keyboard focus on modal close;
- no client-workspace contact leakage;
- no horizontal overflow;
- 44 px compact contact actions;
- zero page errors, failed requests, bad responses, console errors, or external requests.

Detailed evidence is in `docs/VALIDATION.md`.

## Next up

1. Approve the exact New Business handoff destination and configuration.
2. Freeze Charlotte market/cohort and growth/churn outcome definitions.
3. Inventory Charlotte CRM contact, owner, last-touch, renewal, and suppression fields.
4. Finalize validated contact/provider contracts.
5. Approve one professional enrichment provider.
6. Run a manually adjudicated Charlotte contact-quality sample.
7. Build observed-outcome Account Whitespace and Retention methods.
8. Introduce manifest-driven multi-market packages and explicit Demo/Validated modes.
9. Add version, freshness, confidence, coverage, and validation status to decision outputs.

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
  Considered: retaining New Business as default, removing it entirely, and combining objectives into one score
  Rejected because: New Business overlaps a recently launched Spectrum Reach capability, while whitespace and retention are more differentiated and require distinct evidence
  Must preserve: Account Whitespace opens first; Retention / KEEP is second; New Business remains a secondary handoff

- 2026-08-20 | DECISION: highlighted businesses include a typed decision-maker contact path
  Considered: showing only businesses, scraping public registries in the browser, and automatically sending outreach
  Rejected because: insight without an actionable person stops before seller execution, while browser scraping and automated outreach weaken privacy, accuracy, and control
  Must preserve: synthetic contacts in demo mode; CRM-first approved enrichment in authenticated mode; provenance, freshness, confidence, suppression, and human-initiated actions

- 2026-08-20 | DECISION: preserve the existing React/TypeScript/MapLibre foundation
  Considered: replacing the product with a new analytics dashboard
  Rejected because: the current boundaries, map performance, responsive shell, deployment, and offline adapters already support the fall evolution
  Must preserve: analytics and real-data adapters replace demo truth without moving business logic into React or MapLibre

- 2026-08-20 | DECISION: archive rather than delete pre-pivot documentation
  Considered: keeping conflicting documents at root and deleting historical design context
  Rejected because: root conflicts confuse new contributors, while deletion loses useful history
  Must preserve: current root docs are authoritative; `docs/archive/pre-fall-pivot/` is historical only

- 2026-08-20 | DECISION: offline embedding uses literal replacement and validates the generated executable module
  Considered: retaining string replacement and validating only package size/content markers
  Rejected because: JavaScript replacement tokens can corrupt generated HTML while superficial content checks still pass
  Must preserve: callback/literal replacement, script-block parsing, module syntax check, and real-browser direct-file smoke review

- 2026-08-20 | DECISION: standalone offline resources are embedded and Census context is passed to MapLibre in memory
  Considered: copying linked assets beside the HTML and relying on the window fetch shim for MapLibre workers
  Rejected because: the distribution promises one standalone HTML, and worker requests bypass page-level fetch overrides
  Must preserve: data-URI fonts/images, zero `/assets/*` references, in-memory offline GeoJSON, and zero external requests

## Noticed

- Opportunity scores, account entities, dollar ranges, scenario outputs, and contacts remain synthetic demo logic.
- Contact links use reserved values but still open the configured mail/phone application; synthetic labels must remain visible.
- New Business handoff destination is not configured.
- Ohio loading remains hard-coded and must be generalized for Charlotte and other markets.
- Physical-device review is still useful, but compact Chromium contract checks passed.

## Historical record

Pre-pivot status and design decisions are preserved under:

```text
docs/archive/pre-fall-pivot/
```
