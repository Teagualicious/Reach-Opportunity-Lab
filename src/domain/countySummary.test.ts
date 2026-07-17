import { describe, expect, it } from 'vitest';
import { buildCountySummaries } from './countySummary';
import type { ZipOpportunity } from './opportunity';

function makeOpportunity(
  zip: string,
  score: number,
  countyId: string,
  countyName: string,
  centroid: [number, number],
): ZipOpportunity {
  return {
    zip,
    name: `ZIP ${zip}`,
    countyId,
    countyName,
    centroid,
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
    medianIncome: 78500,
    categoryStrength: 'Automotive',
    topDriver: 'audiencePotential',
    topLimiter: 'searchOpportunity',
    summary: 'Synthetic record.',
  };
}

describe('county summaries', () => {
  it('aggregates deterministic per-county values with mean centers', () => {
    const opportunities = [
      makeOpportunity('44101', 80, 'cuyahoga', 'Cuyahoga', [-81.6, 41.5]),
      makeOpportunity('44102', 60, 'cuyahoga', 'Cuyahoga', [-81.8, 41.3]),
      makeOpportunity('44201', 90, 'summit', 'Summit', [-81.5, 41.1]),
    ];
    const summaries = buildCountySummaries(opportunities);

    expect(summaries).toEqual(buildCountySummaries(opportunities));
    expect(summaries).toHaveLength(2);
    expect(summaries[0]).toMatchObject({
      countyId: 'cuyahoga',
      name: 'Cuyahoga',
      zips: ['44101', '44102'],
      zipCount: 2,
      averageOpportunityScore: 70,
      topCategory: 'Automotive',
    });
    expect(summaries[0].center[0]).toBeCloseTo(-81.7);
    expect(summaries[0].center[1]).toBeCloseTo(41.4);
    expect(summaries[1].countyId).toBe('summit');
  });

  it('skips records without a county assignment', () => {
    const noCounty: ZipOpportunity = {
      ...makeOpportunity('44999', 70, 'x', 'X', [0, 0]),
      countyId: undefined,
      countyName: undefined,
    };
    expect(buildCountySummaries([noCounty])).toHaveLength(0);
  });
});
