# Validation Record — Growth, Retention, Synthetic Contacts, and Offline Delivery

## Prepared against

```text
repository: Teagualicious/Reach-Opportunity-Lab
product merge: PR #23 / ee5a57e524753af3752f3e9971493b9cf03aa354
offline hardening: PR #24 / fix/offline-inliner-validation
final functional validation commit: 5805f43e56735a0e21644d0260a530b623ee3032
date: 2026-08-20
```

## Product/domain validation

Verified mode order:

```text
Account Whitespace
Retention / KEEP
Category Expansion
New Business Handoff
```

Verified synthetic contact contract:

- deterministic output for the same business/ZIP/category/objective;
- category/objective-aware title;
- `.example` email;
- reserved `202-555-01xx` phone;
- `Synthetic demo` status;
- no suppression in demo fixtures;
- human-initiated `mailto:` and `tel:` actions only.

Verified objective language:

```text
account-growth value label: Modeled whitespace
retention value label: Revenue at risk
New Business: secondary workflow
```

## Automated full-repository evidence

### Growth/retention implementation head

Commit: `783f54b50fd52b39175ed971c7671f964fb2b2b5`

- CI run 447 (`32398459660`): success.
- All-offline run 106 (`32398459506`): success under the previous offline validator.
- CI steps passed: install, typecheck, tests, production build, GitHub Pages build.
- Offline steps passed: context generation, source validation, build, previous validation, ZIP packaging, artifact upload, release attachment.

### Offline hardening final functional commit

Commit: `5805f43e56735a0e21644d0260a530b623ee3032`

- CI run 457 (`32402702079`): success.
- All-offline run 110 (`32402702171`): success.
- Ohio market validation: 1,233 ZCTAs and seven territories.
- Vitest: 19 files and 56 tests passed.
- Typecheck: passed.
- Production build: passed.
- GitHub Pages build: passed.
- Offline context generation: passed.
- Offline package build and strengthened validation: passed.
- Artifact packaging/upload and release attachment: passed.

Generated standalone HTML validation reported:

```text
script blocks: 2
inline module: valid JavaScript
embedded fonts: 7
embedded images: 2
residual /assets/* references: 0
Census context:
  county: 166
  place-label: 14
  road: 14,293
  water-area: 80,954
  water-line: 112,190
```

## Defects found by real-browser review

The previous validator produced green workflow results while the package was not acceptable in a browser.

### Defect 1 — corrupted inline JavaScript

A `$&` sequence in minified React code was interpreted by string replacement as the entire matched `<script src=…></script>` tag. That inserted a raw closing script tag into the inline module, caused a syntax error, and rendered JavaScript source as body text.

Resolution:

- callback-based literal replacement;
- explicit `</script` and `</style` escaping;
- generated module `node --check`;
- structural script-block validation.

### Defect 2 — linked fonts and logo

Seven Inter font assets and the Spectrum Reach logo remained as `/assets/*` URLs in a package advertised as standalone.

Resolution:

- MIME-correct data URI embedding for generated font/image assets;
- hard validation failure on any residual generated asset URL.

### Defect 3 — MapLibre worker bypassed fetch shim

MapLibre requested `/data/offline-map-context.geojson` from its worker, bypassing `window.fetch` and returning 404.

Resolution:

- expose embedded data on `window.__OPPORTUNITY_LAB_OFFLINE_DATA__`;
- replace the basemap source URL with the in-memory GeoJSON object before map creation;
- derive place labels from the embedded context;
- retain URL fetching only for local-development fallback.

## Direct-from-disk Chromium validation

The final workflow artifact was opened using `file://`; no local server or internet connection was used.

### Expanded viewport — 1440 × 900

Passed:

- application root rendered;
- logo loaded from `data:image/jpeg` with nonzero natural width;
- Inter fonts were embedded;
- MapLibre canvas rendered at nonzero size;
- Census roads, water, counties, place labels, and opportunity layers rendered;
- Cleveland place label present;
- Account Whitespace active by default;
- objective order correct;
- synthetic contact card visible;
- `.example` mail link present;
- reserved telephone link present;
- Retention selected and `Revenue at risk` visible;
- outreach modal contained Email and Call actions;
- modal close control accepted keyboard focus;
- Client Campaign Planner contained no contact fields;
- no horizontal overflow.

### Compact touch viewport — 393 × 852

Passed:

- controls and details sheets opened through their visible compact controls;
- county selection and objective tabs remained usable;
- Account Whitespace first and Retention second;
- contact card stayed within the viewport;
- Email and Call actions measured 44 px high;
- `Revenue at risk` visible;
- outreach modal stayed within the viewport width;
- modal contact actions present;
- close control accepted focus;
- client workspace contained no contact fields;
- no horizontal overflow.

### Browser error/network result

Both expanded and compact direct-file runs recorded:

```text
page errors: 0
failed requests: 0
HTTP 4xx/5xx responses: 0
console errors: 0
external network requests: 0
```

## Required regression commands

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run offline:all
```

For offline-impacting changes, also download the workflow artifact and open `Opportunity-Lab-All-Offline.html` directly from disk in expanded and compact Chromium/browser viewports.

## Production validation not yet performed

No real Charlotte contact, whitespace, retention, or campaign forecast has been validated. Production claims require approved internal data, outcome definitions, authenticated delivery, provider approval, privacy/suppression review, manual contact adjudication, and historical backtesting.
