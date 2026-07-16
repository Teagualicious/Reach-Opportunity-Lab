import { describe, expect, it } from 'vitest';
import type { CompetitorFootprint } from './mapOverlay';
import type { ZipOpportunity } from './opportunity';
import { buildTerritoryBrief } from './territoryBrief';

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

const opportunities = [
  makeOpportunity('44101', 88, 'Automotive'),
  makeOpportunity('44102', 62, 'Automotive'),
  makeOpportunity('44103', 74, 'Legal'),
  makeOpportunity('44104', 91, 'Automotive'),
];

const competitors: CompetitorFootprint[] = [
  {
    id: 'northline',
    label: 'Northline Cable',
    subtitle: 'Test clusters',
    color: '#7c3aed',
    zips: ['44101', '44102', '44103'],
  },
  {
    id: 'skycast',
    label: 'SkyCast Stream',
    subtitle: 'Wide availability',
    color: '#94a3b8',
    wide: true,
    zips: ['44101'],
  },
];

describe('territory brief', () => {
  it('returns null with no opportunities', () => {
    expect(buildTerritoryBrief('Empty', [], competitors, [])).toBeNull();
  });

  it('builds a deterministic company-level summary', () => {
    const brief = buildTerritoryBrief('Northeast Ohio', opportunities, competitors, ['44102']);
    expect(brief).not.toBeNull();
    expect(brief).toEqual(buildTerritoryBrief('Northeast Ohio', opportunities, competitors, ['44102']));
    expect(brief?.zipCount).toBe(4);
    expect(brief?.averageOpportunityScore).toBe(Math.round((88 + 62 + 74 + 91) / 4));
    expect(brief?.topCategory).toBe('Automotive');
    expect(brief?.strongestCompetitor).toEqual({ label: 'Northline Cable', zipCount: 3 });
    expect(brief?.reachGapZipCount).toBe(1);
    expect(brief?.highlights.map(({ zip }) => zip)).toEqual(['44104', '44101', '44103']);
    expect(brief?.recommendation).toContain('Seller Action Center');
  });

  it('ignores competitor and reach-gap ZIPs outside the territory', () => {
    const brief = buildTerritoryBrief(
      'Small',
      [makeOpportunity('44199', 70, 'Retail')],
      competitors,
      ['44102'],
    );
    expect(brief?.strongestCompetitor).toBeNull();
    expect(brief?.reachGapZipCount).toBe(0);
  });
});
