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
  it('builds deterministic queue items from the same inputs', () => {
    const first = buildSellerOpportunity(opportunity, 'new-business', 91, 0);
    const second = buildSellerOpportunity(opportunity, 'new-business', 91, 0);

    expect(second).toEqual(first);
    expect(first.entityKind).toBe('Prospect');
    expect(first.priorityScore).toBe(91);
    expect(first.zip).toBe('44122');
  });

  it('changes the seller workflow language by objective', () => {
    const prospect = buildSellerOpportunity(opportunity, 'new-business', 91, 0);
    const retention = buildSellerOpportunity(opportunity, 'retention-risk', 76, 0);

    expect(prospect.entityKind).toBe('Prospect');
    expect(retention.entityKind).toBe('At-risk account');
    expect(retention.tone).toBe('risk');
    expect(retention.recommendedAction).toContain('save strategies');
  });
});
