# Reach Opportunity Lab
## Product, Architecture, Prototype, and Implementation Handoff

**Document purpose:** This file is the primary build handoff for Sol or any other coding model taking over the project. It describes the product vision, user experiences, data model, simulation behavior, technical architecture, prototype scope, production path, deployment approach, security boundaries, acceptance criteria, and immediate implementation steps.

**Current state:** An existing browser-based HTML prototype displays ZIP/ZCTA-based market zones, competitor footprints, demographic filters, opportunity coloring, and a clickable ZIP detail panel. The existing map is valuable and should be preserved unless a technical audit proves it cannot be extended safely.

**Primary constraint for the current internship deliverable:** The presentation version has approximately one week of development time. It needs to look and behave like a credible product, tell a clear executive story, and support controlled interaction. It does not need to contain a real predictive model, real AI agents, live company data, or a working Architect integration.

**Long-term intent:** The prototype should be designed as the visible front end of a real market-intelligence and scenario-planning product, not as a disposable slide animation.

---

# 1. Executive Product Summary

## Product working name

**Reach Opportunity Lab**

Alternative descriptive names:

- Market Opportunity Navigator
- Market Growth Studio
- Geographic Opportunity Intelligence
- Market and Campaign Opportunity Studio

The working name can remain temporary. The central value proposition matters more than branding.

## Core promise

> **Find the opportunity. Simulate the strategy. Activate through Architect. Measure the outcome.**

The product combines geographic market intelligence, opportunity scoring, scenario planning, recommendations, and a handoff into Architect.

It provides two experiences powered by one shared intelligence layer:

1. **Client Growth Studio — external**
   - Helps an advertiser understand where and why campaign opportunity exists.
   - Recommends ways to improve campaign effectiveness.
   - Simulates illustrative changes to reach, frequency, leads, cost efficiency, and geographic coverage.
   - Prepares a recommended plan for execution through Architect.

2. **Market Growth Studio — internal**
   - Helps internal research, sales, and leadership find new-business opportunities.
   - Identifies existing accounts with growth potential.
   - Flags declining or at-risk business.
   - Simulates strategies to win, protect, recover, or expand revenue.
   - Produces an actionable seller recommendation and a path into Architect or CRM workflows.

## Strategic positioning relative to Architect

This product is **not a replacement for Architect**.

Use this positioning consistently:

> The Opportunity Lab is an upstream intelligence and scenario-planning layer. It identifies where opportunity exists, explains why, and tests possible strategies. Architect remains the campaign-planning and activation destination.

The visible workflow should be:

```text
Opportunity Lab identifies the opportunity
        ↓
Simulation Lab tests the strategy
        ↓
Architect builds and activates the campaign
        ↓
Performance data improves future recommendations
```

The prototype should include a clear **Continue in Architect** action even if it only opens a conceptual handoff modal.

---

# 2. Product Vision

## The problem

Market, audience, campaign, competitive, sales, and account-health information often exists across separate systems and requires manual interpretation.

A seller, strategist, or advertiser may need to answer:

- Where is the strongest opportunity?
- Why is one ZIP more attractive than another?
- Which audience or category is driving the opportunity?
- What action should be taken?
- Which strategy is most likely to improve the result?
- What assumptions create the forecast?
- How does the plan move into campaign execution?

The Opportunity Lab compresses this process into one explainable workflow.

## What the current map already does well

The current HTML prototype establishes a valuable foundation:

- Interactive geographic market view
- ZIP/ZCTA-style polygon selection
- Competitor footprint overlays
- Demographic range filters
- Clickable detail drawer
- Market-level comparison potential
- Strong visual contrast between the map and dark data panels

Do not discard this foundation merely to modernize the stack.

## The product evolution

The product should evolve through four levels:

1. **Describe**
   - Show current market conditions.
   - Display demographics, competitors, client footprint, account performance, and sales activity.

2. **Prioritize**
   - Rank ZIPs, accounts, prospects, and categories.
   - Explain the opportunity or risk score.

3. **Simulate**
   - Test strategies and assumptions.
   - Show ranges rather than false precision.
   - Compare baseline and scenario outcomes.

4. **Activate and learn**
   - Prepare an Architect handoff.
   - Track outcomes.
   - Use historical performance to calibrate future models.

---

# 3. User Experiences

## 3.1 Shared landing page

The QR code and primary URL should open a shared landing page.

### Header

**Reach Opportunity Lab**

### Subheading

**See the opportunity. Simulate the strategy. Activate the plan.**

### Entry cards

#### Client Growth Studio

> Improve an advertiser’s campaign by finding geographic, audience, media, and conversion opportunities.

#### Market Growth Studio

> Find, win, protect, and grow local business using shared market intelligence.

#### Guided Executive Tour

> Experience the complete concept through a controlled three-minute walkthrough.

The guided tour is a required prototype feature because many executives will scan the QR code without a presenter beside them.

---

## 3.2 Client Growth Studio

The client experience must be advertiser-centered and should never expose internal-only metrics.

### Primary questions

- Where is the advertiser under-represented?
- Which ZIP clusters contain high-fit audiences?
- Where are reach or frequency gaps?
- Would increased search, streaming, television, digital, creative, or geography improve the plan?
- Which combination produces the strongest modeled outcome?
- Why is the recommendation being made?
- How does the recommendation continue into Architect?

### Recommended demonstration advertiser

Use an obviously fictional business.

**Lakefront Automotive Group**

Example profile:

- Category: Automotive
- Objective: Qualified lead growth
- Current annual campaign budget: $75,000
- Current media mix: Television + streaming
- Current geographic footprint: 14 ZIP-based zones
- Campaign effectiveness score: 68/100
- Current qualified reach: 186,000
- Current effective frequency: 3.1
- Current modeled leads: 940
- Current modeled cost per lead: $79.79

All values must be labeled as synthetic demonstration data.

### Client workflow

1. Select the fictional advertiser.
2. View current campaign footprint.
3. Inspect ZIP-level opportunity.
4. Review strategy recommendations.
5. Select one or more strategies.
6. Run the simulation.
7. Compare current and simulated outcomes.
8. Expand the explanation drawer.
9. Review recommended plan.
10. Continue in Architect.

### Recommended client strategies

At minimum, support four strategy cards:

#### Increase search support

Purpose:
- Capture high-intent activity after campaign exposure.
- Improve response among people actively researching the category.

Potential effects:
- Higher conversion potential
- Better intent capture
- Higher cost
- Limited reach impact

#### Expand streaming reach

Purpose:
- Reach households underexposed through the current plan.
- Improve incremental reach and younger or streaming-heavy audience coverage.

Potential effects:
- Increased qualified reach
- Better cross-screen coverage
- Possible frequency dilution if budget is not increased

#### Expand geography

Purpose:
- Add adjacent ZIPs with strong audience similarity and favorable opportunity scores.

Potential effects:
- Larger addressable market
- More qualified households
- Lower average fit if expansion becomes too broad

#### Promote higher-value services or products

Purpose:
- Shift creative and targeting toward higher-margin or strategically important offerings.

Potential effects:
- Higher modeled value per conversion
- Narrower audience
- Different seasonality and intent signals

### Client result view

Example:

| Metric | Current plan | Simulated plan |
|---|---:|---:|
| Campaign effectiveness | 68 | 84 |
| Qualified reach | 186,000 | 214,800 |
| Effective frequency | 3.1 | 3.5 |
| Modeled leads | 940 | 1,045–1,095 |
| Modeled cost per lead | $79.79 | $70–$74 |
| Priority ZIP clusters | 4 | 7 |

Required label:

> **Illustrative modeled results using synthetic demonstration data. Not a production forecast.**

### Explanation drawer

Title:

**Why this recommendation?**

Example text:

> Streaming expansion closes underexposed audience gaps in three high-fit ZIP clusters. Search support captures additional high-intent activity after campaign exposure. The combined strategy performs better than geographic expansion alone because several adjacent ZIPs have weaker audience fit.

The prototype can generate this explanation from deterministic templates.

### Architect handoff

The result screen should include:

**Recommended Plan**

- Objective
- Audience
- Priority ZIPs
- Recommended media mix
- Suggested budget range
- Primary measurement goal
- Key assumptions

Button:

**Continue in Architect →**

Prototype behavior:
- Open a modal or transition screen.
- State that the campaign recommendation has been prepared for Architect.
- Do not claim a live integration exists.

---

## 3.3 Market Growth Studio

The internal experience is for research, sales, strategy, market intelligence, and leadership.

### Internal mode selector

```text
[ New Business ] [ Account Growth ] [ Retention Risk ] [ Category Opportunity ]
```

The selected objective should change:

- Score weighting
- Map coloring
- Right-side detail panel
- Ranked list
- Recommended action
- Available simulations

### New Business mode

Primary question:

> Which geographies, categories, and fictional prospects should sellers prioritize?

Suggested signals:

- Business concentration
- Category growth
- Local consumer spending potential
- Low advertiser penetration
- Audience-category fit
- Competitive media pressure
- Similar-business campaign success
- Market growth
- Seller coverage gaps

Example result:

**ZIP 44122**

**New Business Opportunity: 89/100**

- 43 high-potential fictional local businesses
- Strong automotive and home-services presence
- High household purchasing power
- Low Reach advertiser penetration
- Moderate competitive pressure

Fictional prospect examples:

- North Coast Home Renovation
- Greenline Family Dental
- Lakeside European Auto
- Summit Financial Partners

The prototype must clearly mark all prospect names as fictional.

### Account Growth mode

Primary question:

> Which existing fictional advertisers could expand spend, geography, media mix, product focus, or campaign duration?

Example account:

**Greenline Family Dental**

**Growth Opportunity: 81/100**

Current state:

- Four ZIPs
- Streaming only
- $32,000 annual spend
- Strong performance in current geography
- Low campaign frequency
- High search activity
- Six adjacent high-fit ZIPs

Recommended strategies:

- Add television reach
- Expand geography
- Increase frequency
- Add search support
- Promote a higher-value service line

### Retention Risk mode

Primary question:

> Which fictional accounts show risk signals, and which save strategy is most promising?

Example account:

**Harbor Home Services**

**Retention Risk: High**

Signals:

- Spend down 18%
- Campaign reach declining
- Search activity increasing while campaign visibility falls
- Competitor activity increasing
- Renewal window approaching

Strategies:

- Reduce cost while maintaining reach
- Add search and improve attribution
- Shift media mix toward streaming
- Introduce seasonal creative
- Narrow geography to improve efficiency
- Add a staged test plan

Simulation output should compare likely retention, campaign effectiveness, account value, and confidence.

### Category Opportunity mode

Primary question:

> Which advertiser verticals should the market prioritize in each ZIP cluster?

Example categories:

- Automotive
- Healthcare
- Home services
- Legal
- Restaurants
- Retail
- Financial services
- Recruitment

The map should recolor based on category-specific opportunity.

---

# 4. Shared Map Behavior

## Required map features

- Render ZIP/ZCTA-style polygons
- Click a zone to select it
- Hover for a compact tooltip
- Highlight selected polygon
- Support dynamic fill colors
- Show competitor overlays
- Show opportunity or risk layer
- Support current versus simulated state
- Support reset to default view
- Preserve the existing Cleveland market geography
- Work in a desktop presentation
- Provide a usable mobile interaction pattern

## Desktop layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Logo / Product / Mode / Scenario / Guided Tour / Reset       │
├────────────────┬──────────────────────────┬──────────────────┤
│ Filters,       │                          │ Selected ZIP,    │
│ ranked list,   │           Map            │ account, score, │
│ objectives     │                          │ recommendations  │
└────────────────┴──────────────────────────┴──────────────────┘
```

## Mobile layout

```text
┌──────────────────────────────┐
│ Mode / Objective / Reset     │
├──────────────────────────────┤
│                              │
│             Map              │
│                              │
├──────────────────────────────┤
│ Swipe-up results drawer      │
└──────────────────────────────┘
```

On mobile, use a bottom sheet or expandable drawer rather than compressing both side panels.

## Layer examples

Shared:

- Opportunity score
- Competitor footprints
- Demographics
- Business/category concentration
- Audience fit
- Market growth

Client-only:

- Current campaign footprint
- Reach gaps
- Search opportunity
- Modeled conversion potential
- Recommended expansion

Internal-only:

- Reach penetration
- Account risk
- Prospect density
- Revenue trend
- Seller opportunity
- Category growth

---

# 5. Opportunity and Risk Scoring

## Principles

The score must be:

- Explainable
- Configurable
- Versioned
- Separated by use case
- Shown as a component breakdown
- Accompanied by a confidence indicator
- Clearly labeled as synthetic in the prototype

Do not present one universal score as if it answers every business question.

## Example client score

```text
Client Opportunity Score =
  25% audience fit
+ 20% current reach gap
+ 15% search opportunity
+ 15% geographic expansion potential
+ 15% category potential
+ 10% competitive conditions
```

## Example new-business score

```text
New Business Opportunity =
  25% business concentration
+ 20% category spending potential
+ 20% low Reach advertiser penetration
+ 15% audience-category fit
+ 10% market growth
+ 10% competitive opportunity
```

## Example account-growth score

```text
Account Growth Opportunity =
  25% historical campaign performance
+ 20% adjacent market potential
+ 15% media-mix gap
+ 15% frequency or reach gap
+ 15% category growth
+ 10% renewal or relationship strength
```

## Example retention-risk score

```text
Retention Risk =
  25% spend decline
+ 20% campaign-performance decline
+ 15% competitor pressure
+ 15% engagement decline
+ 15% renewal proximity
+ 10% category or market weakness
```

## Score breakdown UI

Example:

**Opportunity Score: 84/100 — High Priority**

| Component | Score |
|---|---:|
| Audience potential | 22/25 |
| Reach gap | 18/20 |
| Search opportunity | 12/15 |
| Geographic potential | 13/15 |
| Category potential | 11/15 |
| Competitive conditions | 8/10 |

Also show:

- Confidence: Moderate
- Data freshness
- Top positive driver
- Top limiting factor
- Score version

---

# 6. Simulation Engine

## Prototype simulation

The one-week prototype should not use a live LLM, real agent simulation, or uncontrolled randomness.

Use:

1. Deterministic baseline values
2. Strategy effect definitions
3. Controlled scenario combinations
4. Repeated lightweight calculations
5. Template-generated explanations
6. Fixed seeds or deterministic pseudo-randomness

The same inputs must produce the same result every time.

## Example formula

```text
Projected Score =
  Baseline Score
+ Streaming Effect
+ Search Effect
+ Geography Effect
+ Creative Effect
- Competition Penalty
- Budget Constraint
```

## Example strategy effects

### Increase search

- Intent capture: positive
- Modeled conversion: positive
- Cost: moderate increase
- Reach: minimal effect

### Expand streaming

- Incremental reach: positive
- Cross-screen coverage: positive
- Frequency: may decline if budget is fixed

### Expand geography

- Reach: positive
- Addressable market: positive
- Average fit: may decline

### Shift creative or product emphasis

- Conversion value: positive when aligned
- Audience size: may narrow
- Seasonality: may strengthen or weaken

## Output ranges

Do not show one precise number.

Preferred phrasing:

> Across 500 illustrative simulation runs, modeled lead improvement ranged from 11% to 17%, with a median result of 14%.

The simulation can vary:

- Strategy effectiveness
- Competitive pressure
- Audience response
- Cost inflation
- Conversion rate
- Geography fit

## Confidence levels

Example:

- High: Inputs are complete and scenario sensitivity is low
- Moderate: Some variables are uncertain or modeled
- Low: Results depend heavily on assumptions

For the prototype, confidence can be calculated from scenario complexity and data completeness.

## Simulation theater

When the user clicks **Run Simulation**:

1. Lock or dim controls.
2. Pulse the selected ZIPs.
3. Show staged status messages:
   - Analyzing audience opportunity
   - Testing strategy combinations
   - Modeling competitive response
   - Estimating campaign impact
   - Generating recommendation
4. Animate the map from current to projected.
5. Count the score upward.
6. Reveal result cards.
7. Open or highlight the recommended action.

Target duration: 2.5–4 seconds.

The theatrical sequence is important for executive storytelling, but it must remain fast.

---

# 7. Future Agent-Based or MiroFish-Style Simulation

## Product framing

Do not describe the future system as a guaranteed prediction engine.

Use:

> A market digital twin that combines real-world data, validated predictive models, and agent-based simulation to rehearse decisions before resources are committed.

## Possible future agents

- Local advertiser archetypes
- Audience segments
- Media competitors
- Account executives
- Agencies
- Business owners
- Economic or seasonal forces
- Market-level events

## Appropriate role of agent simulation

Agent simulation should explore:

- Stakeholder reactions
- Objections
- Competitive responses
- Adoption patterns
- Scenario sensitivity
- Plausible alternative futures

It should not replace statistical forecasting or historical validation.

## Production requirement

A real system should combine:

1. Observed market data
2. Conventional predictive models
3. Scenario simulation
4. Agent-based behavioral exploration
5. Human review
6. Backtesting

## Validation

For historical backtesting:

1. Select a historical cutoff date.
2. Hide all later outcomes.
3. Run the model using only data available at that time.
4. Compare predictions with actual acquisition, spend, renewal, churn, reach, or campaign results.
5. Compare against a simple baseline model.
6. Keep the simulation only if it improves decision quality.

---

# 8. Data Model

## Prototype data sources

Use local static files:

- JSON
- GeoJSON
- CSV converted to JSON
- Synthetic account records
- Synthetic campaign history
- Synthetic prospect records
- Synthetic score components
- Synthetic simulation results

No database is required for the one-week build.

## Suggested entities

### Zone

```ts
type Zone = {
  id: string;
  zipCode: string;
  name: string;
  geometryId: string;
  demographics: Demographics;
  competitorPresence: CompetitorPresence[];
  businessMetrics: BusinessMetrics;
  audienceMetrics: AudienceMetrics;
  internalMetrics?: InternalMetrics;
  scoreInputs: ScoreInputs;
  dataQuality: DataQuality;
};
```

### Demographics

```ts
type Demographics = {
  medianIncome: number;
  medianHomeValue: number;
  medianAge: number;
  collegeGradPct: number;
  homeownerPct: number;
  householdIncome50kPct: number;
  householdsWithChildrenPct: number;
  blackAfricanAmericanPct: number;
  hispanicPopulationIndex: number;
  medianBuildYear?: number;
};
```

### Advertiser

```ts
type Advertiser = {
  id: string;
  name: string;
  fictional: true;
  category: string;
  objective: string;
  annualSpend: number;
  currentMediaMix: string[];
  targetedZoneIds: string[];
  baselineMetrics: CampaignMetrics;
  recommendedStrategies: StrategyId[];
};
```

### Internal account

```ts
type InternalAccount = {
  id: string;
  name: string;
  fictional: true;
  category: string;
  accountStatus: "growth" | "stable" | "risk";
  annualSpend: number;
  spendTrendPct: number;
  renewalDate: string;
  riskSignals: string[];
  opportunitySignals: string[];
  assignedMarket: string;
};
```

### Prospect

```ts
type Prospect = {
  id: string;
  name: string;
  fictional: true;
  category: string;
  zoneId: string;
  estimatedPotential: "high" | "medium" | "low";
  reasons: string[];
};
```

### Strategy

```ts
type Strategy = {
  id: string;
  label: string;
  description: string;
  applicableModes: string[];
  effects: Record<string, number>;
  risks: string[];
  explanationTemplates: string[];
};
```

### Simulation result

```ts
type SimulationResult = {
  scenarioId: string;
  baseline: CampaignMetrics;
  projected: CampaignMetrics;
  ranges: Record<string, [number, number]>;
  confidence: "high" | "moderate" | "low";
  primaryDrivers: string[];
  risks: string[];
  recommendation: string;
  architectHandoff: ArchitectHandoff;
};
```

---

# 9. Technical Architecture

## Immediate prototype recommendation

Preserve the existing HTML map and extend it unless the code audit reveals major blockers.

Preferred one-week approach:

- Existing mapping library retained
- Existing polygons retained
- Existing click behavior retained
- Modern component structure added around the map only where useful
- Static synthetic data
- Deterministic simulation logic
- Hosted static build
- Local offline backup

## Possible stack

### Lowest-risk path

- HTML
- CSS
- JavaScript or TypeScript
- Existing map library
- Vite for local development and production build

### Structured path if the existing code is manageable

- React
- TypeScript
- Vite
- Existing map library or MapLibre
- Lightweight state management
- Local JSON/GeoJSON
- Chart library for a small number of visualizations

Do not rewrite the mapping layer merely to adopt React.

## Suggested project structure

```text
opportunity-lab/
├── README.md
├── PRODUCT_BUILD_SPEC.md
├── package.json
├── vite.config.ts
├── public/
│   ├── data/
│   │   ├── zones.geojson
│   │   ├── demographics.json
│   │   ├── client-demo.json
│   │   ├── internal-accounts.json
│   │   ├── prospects.json
│   │   └── scenarios.json
│   └── assets/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.ts
│   │   └── state.ts
│   ├── components/
│   │   ├── OpportunityMap/
│   │   ├── ScoreCard/
│   │   ├── ScoreBreakdown/
│   │   ├── RankedOpportunityList/
│   │   ├── ScenarioBuilder/
│   │   ├── SimulationProgress/
│   │   ├── SimulationResults/
│   │   ├── RecommendationPanel/
│   │   ├── ArchitectHandoff/
│   │   ├── GuidedTour/
│   │   └── MobileBottomSheet/
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── ClientGrowthStudio.tsx
│   │   ├── MarketGrowthStudio.tsx
│   │   └── ExecutiveTour.tsx
│   ├── engine/
│   │   ├── scoring.ts
│   │   ├── strategies.ts
│   │   ├── simulation.ts
│   │   ├── confidence.ts
│   │   └── explanations.ts
│   ├── data/
│   │   ├── loaders.ts
│   │   └── schemas.ts
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── layout.css
│   │   ├── map.css
│   │   ├── panels.css
│   │   └── animations.css
│   └── utils/
└── dist/
```

If the current app is plain HTML/JavaScript and a migration creates risk, use:

```text
opportunity-lab/
├── index.html
├── css/
├── js/
│   ├── app.js
│   ├── map.js
│   ├── client-mode.js
│   ├── internal-mode.js
│   ├── simulation.js
│   ├── explanations.js
│   ├── guided-tour.js
│   └── demo-data.js
├── data/
└── assets/
```

The product story matters more than framework purity.

---

# 10. Visual Design System

## Overall tone

- Executive
- Modern
- Analytical
- Approachable
- brand-aligned
- Not overly futuristic
- Not visually dense

## Recommended visual hierarchy

- White and soft-gray application background
- Dark navy side drawers
- brand-primary blue as the primary action color
- Cyan for opportunities
- Gold for selected zones
- Magenta or red used sparingly for risk
- Large score numerals
- Soft rounded corners
- Subtle shadows
- Clear spacing
- Limited chart count

## Typography

Use a soft, modern sans-serif with:

- Large page titles
- Strong section labels
- Readable body text
- Tabular numerals where possible
- Minimal all-caps except compact metadata labels

## Required visual moments

- Large opportunity or risk score
- Selected ZIP outline
- Ranked list linked to the map
- Baseline versus simulated state
- Animated result reveal
- Confidence range
- Recommendation explanation
- Architect handoff

## Before-and-after visualization

A strong optional feature:

```text
Current Campaign  ←──── slider ────→  Recommended Campaign
```

A simpler toggle is acceptable:

```text
[ Current State ] [ Simulated State ]
```

---

# 11. Guided Executive Tour

## Purpose

The guided tour ensures that a leader scanning the QR code can understand the product without assistance.

## Recommended sequence

### Screen 1 — Product choice

Explain the two experiences and shared intelligence layer.

### Screen 2 — Client opportunity

Open Lakefront Automotive and show the current campaign footprint.

### Screen 3 — ZIP insight

Highlight one high-opportunity cluster and explain why it matters.

### Screen 4 — Strategy selection

Select streaming expansion and search support.

### Screen 5 — Simulation

Run the animated simulation and show improved modeled results.

### Screen 6 — Architect handoff

Show the recommended plan and Continue in Architect.

### Screen 7 — Internal opportunity

Switch to Market Growth Studio.

### Screen 8 — Retention risk

Open Harbor Home Services and compare save strategies.

### Screen 9 — Closing vision

State:

> One intelligence layer supports advertisers, sellers, strategists, and leadership—without replacing Architect.

## Tour behavior

- Next and back controls
- Step count
- Exit tour
- Restart tour
- Automatic map and panel state changes
- No dead ends
- No dependence on user entering text

---

# 12. QR Code and Hosting

## Requirements

- Real HTTPS URL
- No login for the synthetic public demo unless corporate policy requires one
- Mobile-responsive
- Fast initial load
- Reset button
- Guided tour
- Persistent synthetic-data label
- No secrets in browser code
- No real customer or proprietary data
- No broken or empty routes

## Recommended hosting

Any approved static hosting platform is sufficient.

Examples:

- Vercel
- Cloudflare Pages
- GitHub Pages
- Approved internal static hosting

## URL strategy

The printed QR code should point to a stable short URL or redirect controlled by the team.

Preferred:

```text
reach-demo.example.com
```

The redirect can later point to a new deployment without changing printed materials.

## Deep-link examples

```text
/?mode=client
/?mode=internal
/?tour=executive
/?mode=client&scenario=automotive-growth
```

## Offline safety

Keep:

- Local HTML or local production build
- ZIP copy of the entire application
- Backup laptop copy
- Screen recording of the full demo
- Static screenshots of critical result screens

The live presentation must not depend exclusively on conference-room Wi-Fi.

---

# 13. Security, Privacy, and Governance

## Prototype rules

- Synthetic data only
- Fictional advertiser and prospect names
- Persistent demo disclaimer
- No real internal metrics
- No real revenue or churn records
- No customer-level household data
- No API keys in the front end
- No downloadable proprietary datasets
- No claim that outputs are production forecasts

## External/internal separation

The client experience must never display:

- Internal revenue
- Churn indicators
- Sales penetration
- Prospect lists
- Account-risk scoring
- Internal seller performance
- Internal competitive intelligence not approved for customers

Use separate data objects and separate components where necessary, not only hidden CSS.

## Sensitive demographics

The presence of demographic filters requires careful framing.

Production principles:

- Aggregate geography-level data only
- No personally identifiable information
- No individual-level targeting
- Minimum population or household thresholds
- No use of protected attributes to exclude protected groups
- Legal, privacy, and compliance review before production
- Clear methodology and permitted-use documentation

## Production architecture questions

Before connecting real data:

- Where is data stored?
- Which systems are approved?
- Which models are approved?
- What is retained?
- How are outputs audited?
- How are data and score versions tracked?
- How are internal and external permissions enforced?
- What minimum aggregation thresholds apply?
- Can the model explain its result?
- Can the result be reproduced?

---

# 14. Production-Grade Architecture

The production system should eventually include:

## Data ingestion

- Internal campaign performance
- Account and revenue history
- CRM activity
- Audience and media consumption
- Competitor footprint and activity
- Business and category data
- Demographics
- Search and intent signals
- Market events
- Geography and serviceability

## Data processing

- Identity and geography normalization
- Aggregation
- Privacy thresholds
- Feature engineering
- Score calculation
- Model training datasets
- Data quality checks
- Freshness monitoring

## Intelligence services

- Opportunity scoring
- Risk scoring
- Forecasting
- Scenario engine
- Recommendation engine
- Explanation engine
- Model monitoring
- Backtesting

## Application services

- Authentication
- Role-based access
- External client permissions
- Internal permissions
- Saved scenarios
- Exports
- Architect integration
- CRM integration
- Audit logging

## Deployment

- Approved company environment
- Approved model providers
- Approved data stores
- Encryption
- Monitoring
- Access control
- Disaster recovery
- Versioned releases

## Model governance

- Model cards
- Score definitions
- Weight versioning
- Backtest reports
- Bias review
- Performance monitoring
- Human override
- Data lineage
- Decision logging

---

# 15. Prototype Scope for the One-Week Build

## Build these features

### Shared

- Landing page
- Client/internal mode switch
- Existing map preserved
- ZIP selection
- Large score card
- Score breakdown
- Ranked opportunity list
- Scenario selection
- Simulation animation
- Baseline versus result
- Explanation drawer
- Architect handoff
- Guided tour
- Mobile-responsive QR experience
- Synthetic-data methodology page

### Client

- One fictional advertiser
- One complete campaign-growth journey
- Four selectable strategies
- One combined recommendation
- Current and simulated metrics
- ZIP expansion visualization

### Internal

- New-business mode
- Account-growth mode
- Retention-risk mode
- Three to six fictional prospects
- Two fictional existing accounts
- Save-strategy comparison

## Do not build these this week

- Real MiroFish integration
- Live LLM calls
- Live agent simulation
- Real company data
- Authentication
- Database
- CRM integration
- Live Architect integration
- National map
- User-created free-form scenarios
- Editable scoring weights
- Production exports
- Complex analytics administration
- More than three polished internal use cases

These belong in the future-state roadmap, not the presentation build.

---

# 16. Seven-Day Implementation Plan

## Day 1 — Audit and freeze the story

- Back up the current project.
- Run the existing HTML map locally.
- Inventory every file and dependency.
- Identify the map library.
- Identify how polygons and data are loaded.
- Identify the ZIP click event.
- Identify current filters and state.
- Document console errors.
- Define the exact client demo.
- Define the exact internal demos.
- Freeze all synthetic values and narrative copy.
- Create low-fidelity screen sketches.
- Define every click in the live demo.

Deliverable:
- Audit notes
- Working backup
- Agreed screen flow
- Frozen synthetic data table

## Day 2 — Shared shell

- Add landing page.
- Add mode navigation.
- Add shared application frame.
- Add dark/light design tokens.
- Add score card.
- Add ranked list.
- Ensure existing map still works.
- Add reset behavior.

Deliverable:
- Stable shared shell with existing map

## Day 3 — Client journey

- Add fictional advertiser profile.
- Add campaign footprint layer.
- Add strategy cards.
- Add ZIP opportunity detail.
- Add client-safe metrics.
- Add current versus simulated state.
- Add Architect handoff modal.

Deliverable:
- Complete client journey

## Day 4 — Internal journeys

- Add internal objective tabs.
- Add new-business scoring.
- Add fictional prospects.
- Add growth account.
- Add retention-risk account.
- Add seller recommendations.

Deliverable:
- Complete internal journeys

## Day 5 — Simulation theater

- Add deterministic simulation engine.
- Add loading sequence.
- Add map transition.
- Add metric animations.
- Add range results.
- Add explanation templates.
- Add confidence label.

Deliverable:
- Polished simulated analysis behavior

## Day 6 — Guided tour and deployment

- Add guided executive tour.
- Add mobile bottom sheet.
- Test responsive layout.
- Deploy static build.
- Generate QR code.
- Test on iPhone and Android if available.
- Test on cellular data.
- Test Safari and Chrome.
- Create offline build.
- Record backup video.

Deliverable:
- Shareable QR experience

## Day 7 — Stabilization only

- Fix bugs.
- Remove dead controls.
- Improve wording.
- Resolve overflow.
- Check all synthetic labels.
- Rehearse the exact demo.
- Prepare leadership questions and answers.
- Freeze the build.

Do not add new major features on Day 7.

---

# 17. Acceptance Criteria

## Functional

- Application loads without console-breaking errors.
- Existing map renders reliably.
- ZIP selection works.
- Selected ZIP is visually obvious.
- Mode switching works.
- Client/internal data does not leak across modes.
- At least one full client scenario works.
- At least two internal scenarios work.
- Simulation produces consistent results.
- Reset returns to a known starting state.
- Guided tour completes without dead ends.
- Continue in Architect opens a clear conceptual handoff.
- QR URL works on a phone.
- Offline backup works.

## Visual

- Opportunity score is immediately visible.
- Panels do not feel crowded.
- Typography is readable from presentation distance.
- The product looks intentionally brand-aligned.
- Risk and opportunity are clearly differentiated.
- Current and simulated states are easy to compare.
- The mobile layout uses a drawer or bottom sheet.
- Loading animation lasts less than four seconds.
- No unfinished placeholders appear during the main demo.

## Trust

- Synthetic data is clearly labeled.
- Forecasts are described as illustrative.
- Confidence is visible.
- Score components are explainable.
- Methodology is accessible.
- Architect is shown as the activation destination.
- No production capability is falsely implied.

---

# 18. Leadership Questions and Prepared Answers

## How is the score calculated?

> The prototype uses transparent synthetic weights to demonstrate the workflow. In production, weights would be developed with business owners, documented, versioned, and validated against historical outcomes.

## Has the prediction been validated?

> The presentation version is not a production prediction model. The production path would backtest historical periods, compare the system against simple statistical baselines, and report confidence and error ranges.

## Is this replacing Architect?

> No. The Opportunity Lab identifies and tests the opportunity. Architect remains the campaign-planning and activation destination.

## Who uses this?

External:
- Advertisers
- Client strategy teams
- Account teams in customer-facing meetings

Internal:
- Account executives
- Sales leadership
- Market intelligence
- Research
- Strategy
- Regional leadership

## Can it scale nationally?

> The product interface and score framework are reusable. National scale requires automated data ingestion, approved geographic definitions, market-specific calibration, access control, and data-quality monitoring.

## Why not use a general BI dashboard?

> General BI tools can display data. This product packages the information into a decision workflow: identify, explain, compare, simulate, recommend, and hand off.

## How often would data refresh?

Proposed production cadence depends on source:

- Demographics: annual or source cadence
- Competitor footprint: quarterly or material-change updates
- Internal performance: monthly, weekly, or approved near-real-time cadence
- Campaign delivery: source cadence
- Account risk: scheduled scoring
- Search and intent: approved source cadence

## What business value does it create?

- Better territory prioritization
- Faster seller research
- More consistent opportunity identification
- Better client conversations
- Earlier risk detection
- More relevant campaign recommendations
- Stronger handoff into Architect
- Measurable pilot-based lift

Do not invent unsupported revenue estimates.

---

# 19. Instructions for Sol

## Operating rules

1. Inspect the current repository before editing.
2. Preserve the existing map behavior.
3. Do not replace the mapping library without a documented technical reason.
4. Do not rewrite the whole application.
5. Work in small, testable increments.
6. Maintain one stable build at all times.
7. Use synthetic data only.
8. Do not add live AI or external APIs.
9. Do not expose keys or secrets.
10. Do not add features outside the frozen scope.
11. Run the app after every significant change.
12. Check browser console errors.
13. Test desktop and mobile layouts.
14. Summarize all files changed after each task.
15. Never remove working map behavior without explicit approval.

## First Sol task

Use this prompt:

> Inspect the existing heat-map project before editing anything. Run it locally and identify the current technology stack, map library, file structure, data sources, ZIP polygon loading, click handlers, filters, styling, and any console errors. Do not modify the project yet. Produce an audit report that explains which parts should be preserved, which parts can be extended, whether a React migration would create unnecessary risk, and the lowest-risk architecture for adding a landing page, Client Growth Studio, Market Growth Studio, deterministic simulation flow, guided tour, responsive mobile layout, and static deployment. Include a proposed file-by-file implementation sequence for a one-week executive prototype.

## Second Sol task

After approving the audit:

> Create a backup branch or duplicate working directory. Implement only the shared application shell around the existing map: landing page, top navigation, Client Growth and Market Growth mode selection, consistent design tokens, responsive three-column desktop layout, mobile bottom-sheet structure, reset behavior, and persistent Synthetic Demo Data label. Preserve all existing map layers, filters, polygon behavior, and data. Do not implement simulation logic or add new product features yet. Run the app and verify that the map still works before finishing.

## Prompt template for later tasks

> Read PRODUCT_BUILD_SPEC.md and inspect the current implementation before editing. Implement only [FEATURE]. Preserve existing interactions and data structures. Do not replace the map library, redesign unrelated screens, or add new features. Use synthetic data only. After implementation, run the project, inspect the rendered result, fix console errors and layout overflow, test desktop and mobile, and summarize every file changed.

---

# 20. Immediate Next Step

The next step is **not to begin generating new UI immediately**.

Perform a controlled project intake:

1. Create a complete backup of the current HTML project.
2. Put the project into a clearly named folder.
3. Confirm that every local asset required by the map is included.
4. Open the project and record the exact current behavior.
5. Zip the untouched backup.
6. Initialize version control if it is not already present.
7. Create a working branch or working copy.
8. Place this document in the project root as `PRODUCT_BUILD_SPEC.md`.
9. Give Sol the first audit prompt above.
10. Do not allow edits until Sol returns the architecture and risk audit.

At the same time, the human team should freeze the demo content:

- Fictional client name
- Baseline client metrics
- Four client strategies
- Final simulated result
- Fictional prospects
- Growth account
- Retention-risk account
- Score components
- Guided-tour sequence
- Exact wording used in the presentation

The first meaningful coding task should begin only after the current map has been audited and the story data has been frozen.

---

# 21. Definition of Success

The prototype succeeds if senior leadership can understand this story within three minutes:

1. There are two experiences powered by one intelligence layer.
2. The system identifies a geographic opportunity or business risk.
3. It explains why the area, client, or account matters.
4. It allows a user to test strategies.
5. It shows a plausible range of outcomes.
6. It recommends a next action.
7. It hands the plan into Architect rather than competing with it.
8. It can be explored after the presentation through a QR code.

The product does not need to prove that the final prediction engine already exists.

It needs to make the future system feel coherent, useful, credible, and buildable.
