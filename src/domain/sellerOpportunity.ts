import { buildDemoDecisionMaker, type DecisionMakerContact } from './businessContact';
import { COMPONENT_LABELS, type ZipOpportunity } from './opportunity';
import type { MarketModeId } from './marketMode';

export type SellerEntityKind = 'Prospect' | 'Existing account' | 'At-risk account' | 'Vertical lead';
export type SellerOpportunityTone = 'prospect' | 'growth' | 'risk' | 'category';

export interface SellerOpportunityItem {
  id: string;
  zip: string;
  entityName: string;
  entityKind: SellerEntityKind;
  tone: SellerOpportunityTone;
  category: string;
  priorityScore: number;
  urgencyLabel: string;
  headline: string;
  recommendedAction: string;
  /** The product story the seller should open with. */
  leadWith: string;
  /** What the modeled dollar range represents in this workflow. */
  valueLabel: string;
  /** New Business remains available, but only as a secondary handoff. */
  secondaryWorkflow: boolean;
  /** Deterministic synthetic contact in demo mode; validated mode replaces this through a typed provider. */
  decisionMaker: DecisionMakerContact;
  /** Modeled annual opportunity or value-at-risk range in dollars. */
  opportunityRange: { minimum: number; maximum: number };
  evidence: readonly string[];
}

const CATEGORY_NAMES: Readonly<Record<string, readonly string[]>> = {
  Automotive: ['Lakeside European Auto', 'Buckeye Motor Collective', 'Northstar Auto Group'],
  Healthcare: ['Greenline Family Dental', 'OhioCare Specialty Group', 'Summit Wellness Partners'],
  'Home Services': ['North Coast Home Renovation', 'Buckeye Comfort Systems', 'Keystone Home Works'],
  Legal: ['Summit Legal Partners', 'Civic Counsel Group', 'Lakefront Legal Advisors'],
  Restaurants: ['Harbor Table Group', 'Common Ground Hospitality', 'Ohio Kitchen Collective'],
  Retail: ['Lakefront Home Market', 'Buckeye Lifestyle Goods', 'Main Street Mercantile'],
  'Financial Services': ['Summit Financial Partners', 'Heartland Community Finance', 'North Coast Wealth Group'],
  Recruitment: ['Northstar Talent Solutions', 'Ohio Workforce Partners', 'Summit Search Group'],
};

const MODE_COPY: Readonly<
  Record<
    MarketModeId,
    {
      entityKind: SellerEntityKind;
      tone: SellerOpportunityTone;
      urgencyLabel: string;
      headline: (opportunity: ZipOpportunity) => string;
      action: string;
      leadWith: (opportunity: ZipOpportunity) => string;
      valueLabel: string;
      secondaryWorkflow: boolean;
    }
  >
> = {
  'account-growth': {
    entityKind: 'Existing account',
    tone: 'growth',
    urgencyLabel: 'Whitespace ready',
    headline: (opportunity) =>
      `Audience, search, category, and adjacent-geography signals indicate uncaptured account whitespace around ${opportunity.name}.`,
    action: 'Prepare a whitespace expansion brief and open a decision-maker conversation.',
    leadWith: () => 'Cross-screen expansion + adjacent ZIPs',
    valueLabel: 'Modeled whitespace',
    secondaryWorkflow: false,
  },
  'retention-risk': {
    entityKind: 'At-risk account',
    tone: 'risk',
    urgencyLabel: 'KEEP priority',
    headline: (opportunity) =>
      `Competitive pressure and coverage signals suggest a proactive save conversation in ${opportunity.name}.`,
    action: 'Compare save strategies and contact the decision maker before the account declines further.',
    leadWith: () => 'Account health review + added streaming value',
    valueLabel: 'Revenue at risk',
    secondaryWorkflow: false,
  },
  'category-opportunity': {
    entityKind: 'Existing account',
    tone: 'category',
    urgencyLabel: 'Expansion signal',
    headline: (opportunity) =>
      `${opportunity.categoryStrength} is the strongest modeled category signal for expanding the current book in this ZIP.`,
    action: 'Create an existing-account category expansion brief and identify the best-fit offer.',
    leadWith: (opportunity) => `${opportunity.categoryStrength} expansion package`,
    valueLabel: 'Modeled category whitespace',
    secondaryWorkflow: false,
  },
  'new-business': {
    entityKind: 'Prospect',
    tone: 'prospect',
    urgencyLabel: 'Secondary handoff',
    headline: (opportunity) =>
      `${opportunity.categoryStrength} demand makes this ZIP a candidate for the approved prospecting workflow.`,
    action: 'Send the opportunity signal to the approved new-business workflow and confirm seller ownership.',
    leadWith: () => 'Approved prospecting handoff',
    valueLabel: 'Secondary prospect opportunity',
    secondaryWorkflow: true,
  },
};

function stableIndex(zip: string, index: number, length: number): number {
  const numericZip = Number.parseInt(zip, 10);
  return (numericZip + index) % length;
}

function entityName(opportunity: ZipOpportunity, index: number): string {
  const names = CATEGORY_NAMES[opportunity.categoryStrength] ?? [
    `${opportunity.name} Local Business`,
    `${opportunity.name} Growth Company`,
    `${opportunity.name} Community Group`,
  ];
  return names[stableIndex(opportunity.zip, index, names.length)];
}

export function buildSellerOpportunity(
  opportunity: ZipOpportunity,
  mode: MarketModeId,
  priorityScore: number,
  index: number,
): SellerOpportunityItem {
  const copy = MODE_COPY[mode];
  const modeledOpportunity = opportunity.householdCount * (0.9 + priorityScore / 100);
  const businessName = entityName(opportunity, index);

  return {
    id: `${mode}-${opportunity.zip}`,
    zip: opportunity.zip,
    entityName: businessName,
    entityKind: copy.entityKind,
    tone: copy.tone,
    category: opportunity.categoryStrength,
    priorityScore,
    urgencyLabel: copy.urgencyLabel,
    headline: copy.headline(opportunity),
    recommendedAction: copy.action,
    leadWith: copy.leadWith(opportunity),
    valueLabel: copy.valueLabel,
    secondaryWorkflow: copy.secondaryWorkflow,
    decisionMaker: buildDemoDecisionMaker({
      businessName,
      zip: opportunity.zip,
      category: opportunity.categoryStrength,
      mode,
    }),
    opportunityRange: {
      minimum: Math.round((modeledOpportunity * 0.8) / 500) * 500,
      maximum: Math.round((modeledOpportunity * 1.25) / 500) * 500,
    },
    evidence: [
      `${COMPONENT_LABELS[opportunity.topDriver]} is the leading modeled signal.`,
      `${opportunity.householdCount.toLocaleString('en-US')} households are represented in the synthetic market profile.`,
      opportunity.summary,
    ],
  };
}
