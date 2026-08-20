# Decision-Maker Contact Strategy

## Purpose

A recommendation is not operational until the seller can identify the correct person and take an approved next step. The product therefore treats contactability as a separate typed, governed layer rather than guessing a name from public business data.

## Demo mode

Every synthetic business receives a deterministic synthetic contact generated from business name, ZIP, category, and objective.

Safety requirements:

- `.example` email domain;
- `202-555-01xx` telephone range;
- visible `Synthetic demo` status;
- no external lookup;
- no real person or channel;
- Email/Call actions remain unsent human actions.

## Charlotte validated pilot

### Provider precedence

1. **CRM relationship truth** — named contact, title, account owner, last meaningful touch, renewal owner, and suppression.
2. **Business identity** — approved company name/address/domain/website/business phone source.
3. **Professional decision-maker enrichment** — one approved provider queried server-side by company/domain/location/role.
4. **Legal-entity verification** — approved bulk/subscription data only when useful.
5. **Human review** — ambiguous, stale, generic, personal, or low-confidence matches.

### Role taxonomy

Examples by vertical/objective:

- Automotive growth: Marketing Director, Dealer Principal.
- Automotive retention: Dealer Principal, General Manager.
- Healthcare growth: Practice Administrator, Marketing Director.
- Healthcare retention: Practice Administrator, Managing Partner/Owner.
- Legal growth: Firm Administrator, Managing Partner.
- Restaurants growth: Marketing Director, General Manager.

Role definitions must be versioned and approved by a sales SME.

## Contact contract

```ts
type DecisionMakerContact = {
  id: string;
  businessName: string;
  fullName: string | null;
  title: string | null;
  roleType: "owner" | "marketing" | "general-management" | "practice-admin" | "other";
  roleRelevance: "primary" | "secondary" | "generic" | "unknown";
  professionalEmail: string | null;
  phoneE164: string | null;
  preferredChannel: "email" | "phone" | "crm" | null;
  sourceProvider: string;
  sourceRecordId?: string;
  confidence: number;
  status: "verified" | "likely" | "generic" | "missing" | "suppressed" | "demo";
  lastVerifiedAt: string | null;
  crmOwnerId?: string;
  lastMeaningfulTouchAt?: string;
  doNotContact: boolean;
};
```

The current demo interface is narrower than this target contract because every synthetic record is complete and unsuppressed. Validated mode must handle missing, generic, and suppressed states.

## Contact actions

Allowed internship actions:

- Email — opens an unsent draft/action in an approved client.
- Call — opens the device dialer or approved call workflow.
- Copy — copies approved contact details.
- Open CRM — deep-links to the approved record.

Out of scope:

- automatic sending;
- automatic dialing;
- text messages;
- automated sequences;
- browser enrichment;
- contact export without approval.

## Charlotte validation sample

Manually adjudicate a stratified sample across verticals, company sizes, account status, and contact-source path.

Report:

- business identity match rate;
- named decision-maker coverage;
- actionable-channel coverage;
- manual precision and false-match rate;
- role-relevance accuracy;
- stale-contact rate;
- duplicate rate;
- provider contribution;
- cost per accepted contact;
- source/status/freshness/suppression completeness.

Precision and suppression correctness take precedence over volume.

## Privacy and product boundaries

- Real contacts never enter public Pages, source fixtures, screenshots, releases, or public offline packages.
- Client Campaign Planner never receives contact fields.
- Provider raw responses remain restricted.
- Suppression disables action controls.
- A registered agent is not assumed to be the budget or marketing decision maker.
- Generic business channels are labeled generic.
