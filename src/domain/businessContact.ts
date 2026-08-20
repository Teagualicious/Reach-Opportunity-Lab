import type { MarketModeId } from './marketMode';

export type DecisionMakerRoleType =
  | 'owner'
  | 'marketing'
  | 'general-management'
  | 'practice-admin'
  | 'other';

export type DecisionMakerContactStatus =
  | 'demo'
  | 'verified'
  | 'likely'
  | 'generic'
  | 'missing'
  | 'suppressed';

export interface DecisionMakerContact {
  id: string;
  businessName: string;
  fullName: string;
  title: string;
  roleType: DecisionMakerRoleType;
  professionalEmail: string;
  phoneDisplay: string;
  phoneE164: string;
  preferredChannel: 'email' | 'phone';
  sourceLabel: string;
  confidence: number;
  status: DecisionMakerContactStatus;
  statusLabel: string;
  lastVerifiedAt: string | null;
  doNotContact: boolean;
}

interface DemoDecisionMakerInput {
  businessName: string;
  zip: string;
  category: string;
  mode: MarketModeId;
}

interface RoleRule {
  title: string;
  roleType: DecisionMakerRoleType;
}

const FIRST_NAMES = [
  'Avery',
  'Cameron',
  'Jordan',
  'Morgan',
  'Parker',
  'Riley',
  'Taylor',
  'Casey',
] as const;

const LAST_NAMES = [
  'Bennett',
  'Carter',
  'Ellis',
  'Foster',
  'Hayes',
  'Monroe',
  'Reed',
  'Sullivan',
] as const;

const DEFAULT_ROLES: Readonly<Record<MarketModeId, readonly RoleRule[]>> = {
  'account-growth': [
    { title: 'Marketing Director', roleType: 'marketing' },
    { title: 'General Manager', roleType: 'general-management' },
  ],
  'retention-risk': [
    { title: 'Owner', roleType: 'owner' },
    { title: 'General Manager', roleType: 'general-management' },
  ],
  'category-opportunity': [
    { title: 'Marketing Director', roleType: 'marketing' },
    { title: 'Owner', roleType: 'owner' },
  ],
  'new-business': [
    { title: 'Owner', roleType: 'owner' },
    { title: 'Marketing Director', roleType: 'marketing' },
  ],
};

const CATEGORY_ROLES: Readonly<
  Record<string, Partial<Record<MarketModeId, readonly RoleRule[]>>>
> = {
  Automotive: {
    'account-growth': [
      { title: 'Marketing Director', roleType: 'marketing' },
      { title: 'Dealer Principal', roleType: 'owner' },
    ],
    'retention-risk': [
      { title: 'Dealer Principal', roleType: 'owner' },
      { title: 'General Manager', roleType: 'general-management' },
    ],
  },
  Healthcare: {
    'account-growth': [
      { title: 'Practice Administrator', roleType: 'practice-admin' },
      { title: 'Marketing Director', roleType: 'marketing' },
    ],
    'retention-risk': [
      { title: 'Practice Administrator', roleType: 'practice-admin' },
      { title: 'Managing Partner', roleType: 'owner' },
    ],
  },
  Legal: {
    'account-growth': [
      { title: 'Firm Administrator', roleType: 'general-management' },
      { title: 'Managing Partner', roleType: 'owner' },
    ],
    'retention-risk': [
      { title: 'Managing Partner', roleType: 'owner' },
      { title: 'Firm Administrator', roleType: 'general-management' },
    ],
  },
  Restaurants: {
    'account-growth': [
      { title: 'Marketing Director', roleType: 'marketing' },
      { title: 'General Manager', roleType: 'general-management' },
    ],
    'retention-risk': [
      { title: 'Owner', roleType: 'owner' },
      { title: 'General Manager', roleType: 'general-management' },
    ],
  },
};

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'local-business';
}

export function buildDemoDecisionMaker({
  businessName,
  zip,
  category,
  mode,
}: DemoDecisionMakerInput): DecisionMakerContact {
  const hash = stableHash(`${businessName}:${zip}:${category}:${mode}`);
  const firstName = FIRST_NAMES[hash % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(hash >>> 6) % LAST_NAMES.length];
  const roles = CATEGORY_ROLES[category]?.[mode] ?? DEFAULT_ROLES[mode];
  const role = roles[(hash >>> 12) % roles.length];
  const fictionalLine = String(100 + ((hash >>> 18) % 100)).padStart(4, '0');
  const emailLocal = `${firstName}.${lastName}`.toLowerCase();

  return {
    id: `demo-contact-${mode}-${zip}`,
    businessName,
    fullName: `${firstName} ${lastName}`,
    title: role.title,
    roleType: role.roleType,
    professionalEmail: `${emailLocal}@${slugify(businessName)}.example`,
    phoneDisplay: `(202) 555-${fictionalLine}`,
    phoneE164: `+1202555${fictionalLine}`,
    preferredChannel: 'email',
    sourceLabel: 'Opportunity Lab synthetic contact fixture',
    confidence: 1,
    status: 'demo',
    statusLabel: 'Synthetic demo',
    lastVerifiedAt: null,
    doNotContact: false,
  };
}
