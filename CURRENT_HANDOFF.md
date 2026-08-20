# Current Handoff — Growth, Retention, Whitespace, Decision-Maker Contacts, and Offline Delivery

**Repository:** `Teagualicious/Reach-Opportunity-Lab`  
**Canonical branch after PR #24:** `main`  
**Growth/retention product merge:** PR #23, commit `ee5a57e524753af3752f3e9971493b9cf03aa354`  
**Offline hardening change set:** PR #24, `fix/offline-inliner-validation`  
**Date:** 2026-08-20  
**Primary direction:** Account Whitespace and Retention first; New Business is a secondary handoff.

## Exact restart point

After PR #24 is merged, a future developer should start from `main`:

```bash
git fetch origin
git switch main
git pull --ff-only origin main
```

While reviewing PR #24 before merge, use:

```bash
git fetch origin
git switch fix/offline-inliner-validation
git pull --ff-only origin fix/offline-inliner-validation
```

Then read, in order:

1. `CURRENT_HANDOFF.md`
2. `STATUS.md`
3. `BUILD_HANDOFF.md`
4. `ARCHITECTURE.md`
5. `PRODUCT_BUILD_SPEC.md`
6. `docs/FALL_PROJECT_HANDOFF.md`
7. `docs/PROJECT_BOARD.csv`
8. `docs/CONTACT_STRATEGY.md`
9. `docs/VALIDATION.md`

Files under `docs/archive/pre-fall-pivot/` are historical context, not current instructions.

## Product state

Seller Action Center is ordered as:

1. **Account Whitespace**
2. **Retention / KEEP**
3. **Category Expansion**
4. **New Business Handoff** — secondary

The initial and reset objective is Account Whitespace. New Business must remain complementary to the approved internal Spectrum Reach prospecting workflow.

Each highlighted demo business receives a deterministic synthetic decision maker with:

- a fictional name;
- a category/objective-aware role;
- a reserved `.example` email;
- a reserved `202-555-01xx` phone number;
- visible `Synthetic demo` status;
- human-initiated Email and Call actions.

No real contact data, provider credentials, automatic email, automatic dialing, texting, or sequences are present.

## Offline-delivery hardening

Real Chromium review of the first merged artifact found defects that the old validator missed:

1. A `$&` sequence inside minified React code was interpreted as a `String.replace` replacement token. The matched external script tag was injected into the inline module, closing it early and rendering JavaScript as page text.
2. Seven generated Inter font files and the Spectrum Reach logo remained linked as `/assets/*` files, so the supposedly standalone HTML used missing resources.
3. MapLibre's worker requested `/data/offline-map-context.geojson` directly and bypassed the page-level fetch shim, leaving the Census basemap context unavailable.

PR #24 fixes these by:

- using callback-based literal replacement for inline HTML asset embedding;
- syntax-checking the generated inline module with `node --check`;
- parsing actual script blocks and rejecting premature/unclosed module scripts;
- converting every generated `/assets/*` font or image reference to a MIME-correct data URI;
- rejecting residual generated asset URLs;
- exposing embedded data on `window.__OPPORTUNITY_LAB_OFFLINE_DATA__`;
- supplying the Census context to MapLibre as in-memory GeoJSON before map construction;
- deriving offline place labels from the same embedded object;
- retaining URL loading only as the local-development fallback.

## Verified state

### Automated

On the final functional PR #24 commit `5805f43e56735a0e21644d0260a530b623ee3032`:

- CI run 457 passed;
- all-offline run 110 passed;
- typecheck passed;
- 19 Vitest files / 56 tests passed;
- production and GitHub Pages builds passed;
- offline generation, validation, packaging, artifact upload, and release attachment passed;
- generated HTML contained two valid script blocks, seven embedded fonts, embedded product imagery, and no `/assets/*` references.

### Direct-from-disk Chromium review

The generated HTML was opened through `file://` with no server or internet dependency at:

- expanded viewport: `1440 × 900`;
- compact touch viewport: `393 × 852`.

Verified:

- Spectrum Reach logo loaded from a data URI;
- Census roads, water, counties, place labels, and opportunity geometry rendered;
- Account Whitespace opened first;
- Retention / KEEP appeared second and displayed `Revenue at risk`;
- Category Expansion appeared third;
- New Business Handoff appeared last;
- synthetic decision-maker card displayed name, role, `.example` email, and reserved phone;
- Email and Call links existed in the card and outreach modal;
- modal close control received keyboard focus;
- client workspace exposed no decision-maker/contact fields;
- no horizontal overflow occurred;
- mobile contact actions were 44 px high;
- mobile contact card and modal stayed within the viewport;
- zero page errors;
- zero failed requests;
- zero 4xx/5xx responses;
- zero console errors;
- zero external network requests.

## Immediate next implementation sequence

1. Approve the exact New Business handoff destination and configuration contract.
2. Freeze the Charlotte market boundary, existing-account cohort, growth outcome, and churn/nonrenewal definition.
3. Inventory Charlotte CRM contacts, account owners, last meaningful touch, renewal ownership, and suppression fields.
4. Finalize validated `DecisionMakerContact` missing/generic/verified/suppressed states and provider interface.
5. Select one approved server-side professional enrichment provider.
6. Run a manually adjudicated Charlotte contact-quality sample.
7. Build observed-outcome Account Whitespace and Retention datasets and methods.
8. Generalize the Ohio-only loader into manifest-driven multi-market packages.
9. Introduce explicit Demo and Validated data modes with version, freshness, confidence, and validation metadata.
10. Replace synthetic contacts only inside authenticated validated mode.

## Blocked external decisions

- Exact internal Spectrum Reach destination for New Business handoffs.
- Charlotte market boundary and comparison market.
- Approved internal account, campaign, and outcome extracts.
- Churn/nonrenewal target and prediction horizon.
- Growth/whitespace realization outcome.
- CRM contact and suppression fields.
- Professional enrichment provider and procurement approval.
- Privacy/security approval for authenticated real-contact delivery.

## Non-negotiable boundaries

- Never commit real account, campaign, revenue, seller, or contact data.
- Never place provider keys in frontend code.
- Never scrape the North Carolina Secretary of State interactive portal.
- Never treat a registered agent or generic inbox as a verified marketing decision maker without evidence.
- Never auto-send email, auto-dial, text, or start a sequence.
- Never let New Business regain default prominence without a recorded decision.
- Never mix demo and validated records without an explicit data-mode boundary.
- Never claim an offline package is standalone unless direct-from-disk browser review shows zero linked application assets and zero external requests.
