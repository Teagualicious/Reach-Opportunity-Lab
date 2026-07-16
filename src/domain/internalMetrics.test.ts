import { describe, expect, it } from 'vitest';
import { getInternalZipMetrics } from './internalMetrics';
import type { ZipOpportunity } from './opportunity';

function makeOpportunity(zip: string, overrides: Partial<ZipOpportunity> = {}): ZipOpportunity {
  return {
    zip,
    name: `ZIP ${zip}`,
    score: 72,
    confidence: 'Moderate',
    components: {
      audiencePotential: 20,
      reachGap: 14,
      searchOpportunity: 10,
      geographicPotential: 11,
      categoryPotential: 10,
      competitiveConditions: 7,
    },
    householdCount: 10500,
    medianIncome: 78500,
    categoryStrength: 'Automotive',
    topDriver: 'audiencePotential',
    topLimiter: 'searchOpportunity',
    summary: 'Synthetic record.',
    ...overrides,
  };
}

describe('internal zip metrics', () => {
  it('is deterministic for the same record', () => {
    const opportunity = makeOpportunity('44122');
    expect(getInternalZipMetrics(opportunity)).toEqual(getInternalZipMetrics(opportunity));
  });

  it('keeps modeled values inside plausible business ranges', () => {
    for (const zip of ['43001', '44122', '45999', '43604', '44805']) {
      const metrics = getInternalZipMetrics(makeOpportunity(zip));
      expect(metrics.penetrationRate).toBeGreaterThanOrEqual(15);
      expect(metrics.penetrationRate).toBeLessThanOrEqual(64);
      expect(metrics.arpu).toBeGreaterThanOrEqual(92);
      expect(metrics.arpu).toBeLessThanOrEqual(168);
      expect(metrics.churnRate).toBeGreaterThanOrEqual(0.7);
      expect(metrics.churnRate).toBeLessThanOrEqual(2.9);
      expect(metrics.shareOfWallet).toBeGreaterThanOrEqual(10);
      expect(metrics.shareOfWallet).toBeLessThanOrEqual(52);
      expect(metrics.activeAccounts).toBeGreaterThanOrEqual(1);
      expect(metrics.adRevenue).toBeGreaterThan(0);
      expect(metrics.competitorSpend).toBeGreaterThan(0);
      expect(metrics.revenueWhitespace).toBeGreaterThanOrEqual(0);
      expect(metrics.yoyGrowth).toBeGreaterThanOrEqual(-10);
      expect(metrics.yoyGrowth).toBeLessThanOrEqual(22);
    }
  });

  it('leads the top ad categories with the ZIP category strength', () => {
    const metrics = getInternalZipMetrics(makeOpportunity('44122', { categoryStrength: 'Legal' }));
    expect(metrics.topAdCategories[0]).toBe('Legal');
    expect(metrics.topAdCategories[1]).not.toBe('Legal');
  });

  it('models lower penetration where the reach gap is larger', () => {
    const smallGap = makeOpportunity('44122', {
      components: {
        audiencePotential: 20,
        reachGap: 2,
        searchOpportunity: 10,
        geographicPotential: 11,
        categoryPotential: 10,
        competitiveConditions: 7,
      },
    });
    const largeGap = makeOpportunity('44122', {
      components: {
        audiencePotential: 20,
        reachGap: 20,
        searchOpportunity: 10,
        geographicPotential: 11,
        categoryPotential: 10,
        competitiveConditions: 7,
      },
    });
    expect(getInternalZipMetrics(largeGap).penetrationRate).toBeLessThan(
      getInternalZipMetrics(smallGap).penetrationRate,
    );
  });
});
