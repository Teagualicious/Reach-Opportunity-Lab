import { describe, expect, it } from 'vitest';
import type { ZipOpportunity } from './opportunity';
import { buildSellerOpportunity } from './sellerOpportunity';

const opportunity: ZipOpportunity = {
  zip: '44122',
  name: 'Beachwood',
  score: 84,
  confidence: 'High',
  components: {
    audiencePotential: 22,
    reachGap: 17,
    searchOpportunity: 12,
    geographicPotential: 13,
    categoryPotential: 12,
    competitiveConditions: 8,
  },
  householdCount: 14381,
  medianIncome: 92500,
  categoryStrength: 'Automotive',
  topDriver: 'audiencePotential',
  topLimiter: 'competitiveConditions',
  summary: 'Synthetic audience and demand signals indicate a strong local opportunity.',
};

describe('seller opportunity actions', () => {
  it('builds deterministic whitespace items with a synthetic decision maker', () => {
    const first = buildSellerOpportunity(opportunity, 'account-growth', 91, 0);
    const second = buildSellerOpportunity(opportunity, 'account-growth', 91, 0);

    expect(second).toEqual(first);
    expect(first.entityKind).toBe('Existing account');
    expect(first.priorityScore).toBe(91);
    expect(first.zip).toBe('44122');
    expect(first.leadWith).toContain('expansion');
    expect(first.valueLabel).toBe('Modeled whitespace');
    expect(first.secondaryWorkflow).toBe(false);
    expect(first.decisionMaker.status).toBe('demo');
    expect(first.decisionMaker.professionalEmail).toMatch(/\.example$/);
    expect(first.opportunityRange.minimum).toBeGreaterThan(0);
    expect(first.opportunityRange.maximum).toBeGreaterThan(first.opportunityRange.minimum);
    expect(first.opportunityRange.minimum % 500).toBe(0);
    expect(first.opportunityRange.maximum % 500).toBe(0);
  });

  it('leads category expansion briefs with the vertical package', () => {
    const vertical = buildSellerOpportunity(opportunity, 'category-opportunity', 82, 0);
    expect(vertical.leadWith).toBe('Automotive expansion package');
    expect(vertical.entityKind).toBe('Existing account');
  });

  it('uses KEEP language for retention and marks new business as a secondary handoff', () => {
    const retention = buildSellerOpportunity(opportunity, 'retention-risk', 76, 0);
    const prospect = buildSellerOpportunity(opportunity, 'new-business', 91, 0);

    expect(retention.entityKind).toBe('At-risk account');
    expect(retention.tone).toBe('risk');
    expect(retention.valueLabel).toBe('Revenue at risk');
    expect(retention.recommendedAction).toContain('decision maker');
    expect(prospect.entityKind).toBe('Prospect');
    expect(prospect.secondaryWorkflow).toBe(true);
    expect(prospect.recommendedAction).toContain('approved new-business workflow');
  });
});
