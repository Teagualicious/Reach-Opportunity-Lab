# STATUS

> The single source of truth for project state. Every session reads this first and updates it last.

## Current phase

Phase 3 — Spectrum Reach experience redesign (Codex proposal, July 2026)

## Done

- Established production-shaped domain, data, application, feature, map, and delivery boundaries.
- Migrated to Vite + React + strict TypeScript with MapLibre and Vitest.
- Added reproducible npm installs, CI, merge-triggered releases, GitHub Pages, and a validated all-offline package.
- Added every source Ohio ZCTA, generated deterministic synthetic opportunity records statewide, and preserved curated Cleveland–Akron records.
- Added seven synthetic major-city territories plus All Ohio.
- Added a fixed one-viewport expanded shell and a shared compact mode with map-first bottom sheets.
- Added independently scrollable/collapsible sidebars and ZIP/territory camera refitting.
- Added pastel opportunity heat, neutral inactive context, gold selection, cyan current-plan/seller focus, and green recommended expansion.
- Added stronger reach-gap and competitor evidence layers.
- Added supporting-layer focus: whenever a reach-gap or competitor layer is active, the base opportunity surface mutes rather than disappearing.
- Renamed and reordered the visible workspaces:
  1. Market Opportunity Map
  2. Seller Action Center
  3. Client Campaign Planner
- Added a reusable right-panel workspace guide showing purpose, intended user, and the next action.
- Built Market Opportunity Map ZIP diagnosis, filters, score explanation, reach-gap status, and synthetic competitor intersections.
- Built Seller Action Center objective queues with deterministic prospects/accounts, urgency, evidence, recommended action, and action modeling.
- Built Client Campaign Planner as Current plan → Diagnose gaps → Recommended plan with deterministic geographic recommendations and Architect handoff.
- Added `clientGeography.ts` and `sellerOpportunity.ts` pure domain modules with tests.
- Preserved Fable's statewide performance work:
  - one statewide source;
  - `displayScore` recoloring instead of geometry re-upload;
  - diffed `dim`, `campaign`, `recommended`, and `territoryDim` state;
  - filtered overlays over the shared source;
  - Set-based hit tests;
  - O(1) ZIP lookup;
  - concurrent startup loading;
  - MapLibre vendor chunking;
  - one inlinable offline script.

- Executed the Spectrum Reach experience-redesign proposal (July 2026) across all three workspaces:
  - Refreshed design tokens to the proposal palette (deep navy, brand blue, reach cyan, growth teal, success green, cloud), added motion tokens (150–250 ms), and bundled Inter Variable with optical sizing (Inter Display headlines, no runtime font requests).
  - Rebranded the header lockup to Spectrum Reach · Opportunity Lab with deep-navy active workspace tabs.
  - Added `zipDemographics.ts` (ten deterministic synthetic demographics per ZIP), `internalMetrics.ts` (modeled penetration, ARPU, churn, share of wallet, accounts, ad revenue, competitor spend, whitespace, top categories, YoY growth), `marketLens.ts` (lens surfaces + demographic range filters), and `territoryBrief.ts`, all pure and tested.
  - Rebuilt Market Opportunity Map: color-ZIPs-by market lens with adaptive legend and lens-aware hover/ranked list, collapsible dual-thumb demographic range filters with N-of-M count, full ZIP market profile (demographics, modeled internal signals, competitive landscape, score breakdown), and the Create-territory-brief primary output.
  - Refreshed Seller Action Center: lead-with product story, modeled annual opportunity range, and Build-outreach-plan primary output; action modeling kept as a secondary control.
  - Rebuilt Client Campaign Planner as a light guided client-safe story: Your-campaign-today tiles, plain-language growth ideas, Today/With-growth map views, modeled-result hero with explained new high-fit ZIPs, and Talk-to-your-account-executive CTA (Architect activation folded into the contact summary). Competitor overlays, penetration, and seller signals no longer render in the client view.
  - Renamed competitor overlay fixtures to fictional providers, then restored the original real provider labels (Cox, Armstrong, Breezeline, AT&T U-verse, DirecTV Stream, Dish Network) on explicit product direction; footprints remain illustrative synthetic ZIP memberships.
- Round 2 of the redesign (user review feedback):
  - Replaced the abstract header mark with the supplied official Spectrum Reach logo asset (`src/assets/spectrum-reach-logo.jpg`).
  - Added region-first navigation everywhere: the statewide view renders the seven operating territories as solid soft-colored regions with HTML-marker name labels (`regionSummary.ts`, map `regionMode`, `RegionPicker`, `MapBreadcrumb`); clicking a region drills into its ZIP areas and the Ohio breadcrumb returns to regions. The region surface switches with one paint-property pass over the shared statewide source.
  - Simplified the interface for non-technical users: plain-language section labels, evidence layers and technical detail (demographics, internal signals, competitor cards, score build-up) behind collapsible disclosures, one calm data footnote, larger small-type sizes.

## Workspace boundaries

- **Market Opportunity Map:** where is opportunity, why does it exist, and what modeled coverage or competitive signals affect it?
- **Seller Action Center:** who should a seller pursue, grow, or save next, and what action should they take?
- **Client Campaign Planner:** how could a specific fictional advertiser diagnose and improve its geographic campaign plan?

Shared geography does not make these the same product. Each workspace owns a distinct user, question, and next action.

## Next up

1. Merge and visually review the Spectrum Reach redesign pass through the stable Pages URL.
2. Validate the all-offline package against the redesign (bundled Inter, new stylesheets) — deferred from this pass by product direction.
3. Add multiple deterministic fictional advertiser profiles to Client Campaign Planner.
4. Expand Seller Action Center with account histories, prospect lists, and retention-save comparisons.
5. Add additional state and major-city market packages behind the existing market/territory contracts.
6. Add the guided executive tour, full keyboard tab behavior, and remaining compact-mode polish.
7. Add automated WebGL visual-regression coverage for standard and offline adapters.

## Decisions log

- 2026-07-15 | DECISION: use Vite + React + strict TypeScript + MapLibre with pure domain and typed adapter boundaries
  Considered: monolithic HTML, untyped JavaScript, and premature full-stack infrastructure
  Rejected because: they create migration debt or infrastructure without current product value
  Must preserve: business logic remains pure TypeScript; React and MapLibre stay at the edges

- 2026-07-15 | DECISION: ZIP/ZCTA polygons are the primary selectable and scored geography
  Considered: large sales zones and a non-geographic dashboard
  Rejected because: the product promise is ZIP-level explainable opportunity
  Must preserve: territories group ZIPs but do not replace ZIP truth

- 2026-07-15 | DECISION: include every Ohio ZCTA and assign each ZIP to exactly one synthetic major-city territory
  Considered: 26 curated ZIPs only, unscored statewide context, and arbitrary grids
  Rejected because: fragmented geography looked like a mockup and neutral context did not make major territories explorable
  Must preserve: curated records remain distinguishable from generated baselines; production territories later use governed definitions

- 2026-07-15 | DECISION: standard and all-offline maps are separate presentation adapters over one product
  Considered: bundled raster tiles and replacing the online map with reduced offline context
  Rejected because: tile packaging creates licensing/size concerns and reduced context weakens normal review
  Must preserve: feature/domain logic is shared; offline blocks unapproved runtime requests

- 2026-07-15 | DECISION: expanded and compact layouts share one viewport-mode contract
  Considered: document scrolling, always-open panels, device detection, and a separate mobile build
  Rejected because: those approaches shrink the map, break the dashboard metaphor, or drift apart
  Must preserve: `useViewportMode`, `ProductViewContext.viewportMode`, and the 900px CSS breakpoint remain synchronized

- 2026-07-16 | DECISION: opportunity uses a pastel heat progression with distinct typed emphasis states
  Considered: monochromatic blue and a saturated hot scale
  Rejected because: monochromatic blue weakens heat storytelling while saturated colors overpower the basemap
  Must preserve: inactive gray, selected gold, current cyan, recommended green, and fixture-owned evidence colors

- 2026-07-16 | DECISION: map presentation changes use diffed feature state over one statewide source
  Considered: full GeoJSON recolors, full-state rewrites, and duplicate overlay geometry
  Rejected because: those approaches reparse geometry, issue unnecessary writes, and duplicate polygons
  Must preserve: score/recommendation truth stays in domain modules; MapLibre only renders supplied state

- 2026-07-16 | DECISION: the three visible workspaces use plain business-language names and explicit guidance
  Considered: retaining internal product jargon and relying on users to infer each workflow
  Rejected because: executives should understand purpose, audience, and the next step immediately
  Must preserve: visible order is Market Opportunity Map → Seller Action Center → Client Campaign Planner; each right panel begins with the shared workspace guide

- 2026-07-16 | DECISION: active supporting evidence layers mute the base opportunity surface
  Considered: leaving full heat-map intensity beneath reach-gap/competitor overlays, hiding non-layer ZIPs, and globally muting every workspace at all times
  Rejected because: full intensity washes out evidence, hiding context removes orientation, and permanent muting weakens ordinary campaign and seller views
  Must preserve: reach-gap or competitor visibility switches the base fill-opacity expression with one paint-property update; base ZIPs remain visible; selected/current/recommended states remain distinct

- 2026-07-16 | DECISION: Client Campaign Planner tells Current → Diagnose → Recommended
  Considered: one campaign layer and all evidence visible simultaneously
  Rejected because: users could not tell what changed and always-on evidence created noise
  Must preserve: current ZIPs, diagnostic evidence, and recommendations remain separate typed states

- 2026-07-16 | DECISION: Market Opportunity Map diagnoses while Seller Action Center operationalizes
  Considered: two differently recolored ZIP ranking screens and one combined screen
  Rejected because: duplicate map experiences confuse users and a combined screen mixes diagnosis with seller action
  Must preserve: market diagnosis and seller execution remain different workflows

- 2026-07-16 | DECISION: execute the Codex redesign proposal with Spectrum Reach lockup branding and fictional competitor names
  Considered: neutral Reach-only branding, real provider names from the original prototype screenshots, and a foundation-only first PR
  Rejected because: the proposal's brand direction was approved for the full refresh, real provider names violate the no-real-company-data rule, and the user chose a full single-branch refresh
  Must preserve: fixtures stay fictional; the header lockup reads Spectrum Reach · Opportunity Lab; workspace names and order are unchanged

- 2026-07-16 | DECISION: (supersedes competitor-name portion above) real competitor brand labels return as a user-approved exception
  Considered: keeping the fictional provider names
  Rejected because: the product owner explicitly directed keeping the real competitor names for review realism
  Must preserve: footprint ZIP memberships stay synthetic and illustrative with visible not-service-area-claims disclosure; no real competitor performance or spend data is represented as factual

- 2026-07-16 | DECISION: region-first navigation renders territories as solid categorical-colored regions over the existing ZIP source
  Considered: dissolved region polygons in a second source, projecting region averages onto the opportunity heat ramp, and keeping the statewide ZIP fabric as the default view
  Rejected because: duplicate geometry violates the performance laws, statewide averages cluster within one ramp step so regions became indistinguishable, and the ZIP-first statewide view read as too technical for the audience
  Must preserve: region mode is a paint-property swap on the shared source (no re-upload); the seven-color REGION_PALETTE stays soft and distinguishable; clicking a region routes through `ProductViewContext.selectTerritory`; the territory dropdown remains synchronized

- 2026-07-16 | DECISION: technical depth is disclosed progressively, not removed
  Considered: deleting score breakdowns and internal metric grids outright, and leaving all detail always visible
  Rejected because: analysts still need the evidence, but the default view must stay simple for non-technical executives
  Must preserve: demographics, internal signals, competitor cards, and score build-up live behind native details/summary disclosures; headline content stays plain-language

- 2026-07-16 | DECISION: synthetic demographics and internal business metrics are pure deterministic functions, not stored fixtures
  Considered: extending the generated statewide fixture files and a new fixture JSON
  Rejected because: derived-per-ZIP pure functions need no regeneration step, keep payload size flat, and stay deterministic by construction
  Must preserve: `zipNoise` hashing stays stable (values are part of the reviewed experience); demographics/internal metrics remain domain-pure and covered by range/determinism tests

- 2026-07-16 | DECISION: market lenses recolor through the existing displayScore feature state over the 35–100 heat ramp
  Considered: per-lens color ramps and re-uploading recolored GeoJSON
  Rejected because: displayScore diffing preserves the statewide performance laws and one ramp keeps the legend consistent
  Must preserve: lens normalization happens in `marketLens.ts`; the map never computes lens values; the opportunity lens passes undefined displayScores

- 2026-07-16 | DECISION: the client workspace is light-surfaced and never renders internal signals
  Considered: keeping the shared dark rail and the three-view diagnose flow with competitor overlays
  Rejected because: the proposal separates internal analytical density from the client growth story, and competitor/penetration data is internal-only
  Must preserve: `.is-client-mode` flips only the client rail; internal signals may inform client recommendation scoring but not client-facing text or layers

## Noticed

- Competitor fixtures currently cover Northeast Ohio only; they are illustrative fictional ZIP memberships, not service-area claims.
- The all-offline package (`npm run offline:all`) has not been revalidated since the redesign added the bundled Inter font and new stylesheets; run it before the next offline review.
- The map hover popup shows the active market lens value via `popupValueText`; other workspaces keep the default opportunity line.
- Territory-specific client reach gaps are deterministic demonstration output.
- Generated statewide records are baseline quality; curated Cleveland–Akron records have richer narratives.
- MapLibre remains the largest dependency but is isolated in a cache-stable vendor chunk.
- Product and plan tabs still need full arrow-key navigation and roving tabindex.

## Run and validate

```bash
npm install
npm run dev
npm run typecheck
npm run test
npm run build
npm run preview
```

Statewide refresh:

```bash
npm run geometry:refresh
npm run geometry:validate
```

All-offline package:

```bash
npm run offline:all
```
