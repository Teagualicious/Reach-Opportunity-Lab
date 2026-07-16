import { describe, expect, it } from 'vitest';
import {
  buildMarketLensSurface,
  computeDemographicRanges,
  filterZipsByDemographics,
  findMarketLens,
  MARKET_LENSES,
  OPPORTUNITY_LENS_ID,
} from './marketLens';
import type { ZipOpportunity } from './opportunity';
import { getZipDemographics } from './zipDemographics';

function makeOpportunity(zip: string, medianIncome: number, score: number): ZipOpportunity {
  return {
    zip,
    name: `ZIP ${zip}`,
    score,
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
    medianIncome,
    categoryStrength: 'Automotive',
    topDriver: 'audiencePotential',
    topLimiter: 'searchOpportunity',
    summary: 'Synthetic record.',
  };
}

const opportunities = [
  makeOpportunity('43001', 41000, 55),
  makeOpportunity('44122', 92500, 84),
  makeOpportunity('45999', 118000, 71),
];

describe('market lenses', () => {
  it('exposes opportunity, demographic, and internal lens groups', () => {
    expect(findMarketLens(OPPORTUNITY_LENS_ID).group).toBe('opportunity');
    expect(MARKET_LENSES.filter((lens) => lens.group === 'demographics')).toHaveLength(10);
    expect(MARKET_LENSES.filter((lens) => lens.group === 'internal')).toHaveLength(3);
    expect(findMarketLens('unknown-lens').id).toBe(OPPORTUNITY_LENS_ID);
  });

  it('keeps the base heat surface for the opportunity lens', () => {
    const surface = buildMarketLensSurface(opportunities, findMarketLens(OPPORTUNITY_LENS_ID));
    expect(surface.displayScores).toBeUndefined();
    expect(surface.minimum).toBe(55);
    expect(surface.maximum).toBe(84);
  });

  it('projects metric lenses onto the 35-100 heat ramp', () => {
    const surface = buildMarketLensSurface(opportunities, findMarketLens('medianIncome'));
    expect(surface.minimum).toBe(41000);
    expect(surface.maximum).toBe(118000);
    expect(surface.displayScores?.['43001']).toBe(35);
    expect(surface.displayScores?.['45999']).toBe(100);
    const middle = surface.displayScores?.['44122'] ?? 0;
    expect(middle).toBeGreaterThan(35);
    expect(middle).toBeLessThan(100);
  });

  it('computes territory demographic ranges and filters by them', () => {
    const ranges = computeDemographicRanges(opportunities);
    expect(ranges.medianIncome.minimum).toBe(41000);
    expect(ranges.medianIncome.maximum).toBe(118000);

    const everything = filterZipsByDemographics(opportunities, {});
    expect(everything.size).toBe(3);

    const highIncome = filterZipsByDemographics(opportunities, {
      medianIncome: { minimum: 90000, maximum: 120000 },
    });
    expect(highIncome).toEqual(new Set(['44122', '45999']));

    const first = getZipDemographics(opportunities[0]);
    const exact = filterZipsByDemographics(opportunities, {
      medianAge: { minimum: first.medianAge, maximum: first.medianAge },
    });
    expect(exact.has('43001')).toBe(true);
  });
});
