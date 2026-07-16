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
  /** Modeled annual opportunity range in dollars, minimum and maximum. */
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
    }
  >
> = {
  'new-business': {
    entityKind: 'Prospect',
    tone: 'prospect',
    urgencyLabel: 'Prospect now',
    headline: (opportunity) =>
      `${opportunity.categoryStrength} demand and audience signals make this ZIP a strong prospecting window.`,
    action: 'Open a category-led prospecting conversation and build a short target list.',
    leadWith: () => 'Streaming + Search support',
  },
  'account-growth': {
    entityKind: 'Existing account',
    tone: 'growth',
    urgencyLabel: 'Expansion ready',
    headline: (opportunity) =>
      `Audience scale and search activity support a larger footprint around ${opportunity.name}.`,
    action: 'Prepare an account expansion brief with adjacent ZIP and product recommendations.',
    leadWith: () => 'TV + Streaming expansion',
  },
  'retention-risk': {
    entityKind: 'At-risk account',
    tone: 'risk',
    urgencyLabel: 'Save priority',
    headline: (opportunity) =>
      `Competitive pressure and coverage signals suggest a proactive save conversation in ${opportunity.name}.`,
    action: 'Compare save strategies and schedule an account-health conversation.',
    leadWith: () => 'Retention bundle + added streaming value',
  },
  'category-opportunity': {
    entityKind: 'Vertical lead',
    tone: 'category',
    urgencyLabel: 'Category signal',
    headline: (opportunity) =>
      `${opportunity.categoryStrength} is the strongest modeled vertical signal for this ZIP.`,
    action: 'Create a vertical market brief and identify matching local businesses.',
    leadWith: (opportunity) => `${opportunity.categoryStrength} vertical package`,
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
  return {
    id: `${mode}-${opportunity.zip}`,
    zip: opportunity.zip,
    entityName: entityName(opportunity, index),
    entityKind: copy.entityKind,
    tone: copy.tone,
    category: opportunity.categoryStrength,
    priorityScore,
    urgencyLabel: copy.urgencyLabel,
    headline: copy.headline(opportunity),
    recommendedAction: copy.action,
    leadWith: copy.leadWith(opportunity),
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
