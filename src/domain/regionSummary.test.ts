import { describe, expect, it } from 'vitest';
import type { ZipOpportunity } from './opportunity';
import { buildRegionSummaries } from './regionSummary';
import type { TerritoryDefinition } from './territory';

function makeOpportunity(zip: string, score: number, categoryStrength: string): ZipOpportunity {
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
    medianIncome: 78500,
    categoryStrength,
    topDriver: 'audiencePotential',
    topLimiter: 'searchOpportunity',
    summary: 'Synthetic record.',
  };
}

const territories: TerritoryDefinition[] = [
  {
    id: 'north',
    name: 'North Region',
    selectorLabel: 'North',
    anchorCities: ['Northtown'],
    center: [-81.5, 41.4],
    bounds: [-82, 41, -81, 42],
    zips: ['44101', '44102'],
  },
  {
    id: 'south',
    name: 'South Region',
    selectorLabel: 'South',
    anchorCities: ['Southville'],
    center: [-84.4, 39.2],
    bounds: [-85, 39, -84, 40],
    zips: ['45201'],
  },
];

describe('region summaries', () => {
  it('aggregates deterministic per-territory values', () => {
    const opportunities = [
      makeOpportunity('44101', 80, 'Automotive'),
      makeOpportunity('44102', 60, 'Automotive'),
      makeOpportunity('45201', 91, 'Legal'),
    ];
    const summaries = buildRegionSummaries(opportunities, territories);

    expect(summaries).toEqual(buildRegionSummaries(opportunities, territories));
    expect(summaries).toHaveLength(2);
    expect(summaries[0]).toMatchObject({
      territoryId: 'north',
      name: 'North Region',
      zipCount: 2,
      averageOpportunityScore: 70,
      topCategory: 'Automotive',
      center: [-81.5, 41.4],
    });
    expect(summaries[1]).toMatchObject({
      territoryId: 'south',
      zipCount: 1,
      averageOpportunityScore: 91,
      topCategory: 'Legal',
    });
  });

  it('ignores territory ZIPs missing from the opportunity set', () => {
    const summaries = buildRegionSummaries([makeOpportunity('44101', 74, 'Retail')], territories);
    expect(summaries[0]).toMatchObject({ zipCount: 1, averageOpportunityScore: 74 });
    expect(summaries[1]).toMatchObject({ zipCount: 0, averageOpportunityScore: 0, topCategory: '' });
  });
});
