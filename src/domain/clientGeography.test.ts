import { describe, expect, it } from 'vitest';
import type { CompetitorFootprint } from './mapOverlay';
import type { ZipOpportunity } from './opportunity';
import { buildClientGeographyPlan } from './clientGeography';

function opportunity(
  zip: string,
  score: number,
  reachGap: number,
  searchOpportunity: number,
  categoryPotential: number,
): ZipOpportunity {
  return {
    zip,
    name: `ZIP ${zip}`,
    score,
    confidence: 'Moderate',
    components: {
      audiencePotential: 20,
      reachGap,
      searchOpportunity,
      geographicPotential: 12,
      categoryPotential,
      competitiveConditions: 7,
    },
    householdCount: 10000,
    medianIncome: 70000,
    categoryStrength: 'Automotive',
    topDriver: 'audiencePotential',
    topLimiter: 'competitiveConditions',
    summary: 'Synthetic test opportunity.',
  };
}

const competitors: CompetitorFootprint[] = [
  {
    id: 'competitor-a',
    label: 'Competitor A',
    subtitle: 'Synthetic footprint',
    color: '#ff0000',
    zips: ['44002'],
  },
];

describe('client geography planning', () => {
  const opportunities = [
    opportunity('44001', 80, 16, 12, 12),
    opportunity('44002', 86, 10, 13, 11),
    opportunity('44003', 78, 17, 8, 13),
    opportunity('44004', 72, 9, 11, 8),
    opportunity('44005', 69, 15, 10, 10),
    opportunity('44006', 65, 8, 7, 7),
  ];

  it('keeps current ZIPs out of recommendations and exposes diagnostics', () => {
    const plan = buildClientGeographyPlan({
      opportunities,
      currentZips: ['44001'],
      competitors,
      selectedStrategyIds: ['streaming-reach', 'geography-expansion'],
    });

    expect(plan.currentZips).toEqual(['44001']);
    expect(plan.recommendedZips).not.toContain('44001');
    expect(plan.reachGapZips).toEqual(['44001', '44003', '44005']);
    expect(plan.competitorPressureZips).toEqual(['44002']);
    expect(plan.summary.recommendedCount).toBe(5);
  });

  it('is deterministic and rewards reach-gap ZIPs when streaming is selected', () => {
    const input = {
      opportunities,
      currentZips: ['44001'],
      competitors,
      selectedStrategyIds: ['streaming-reach'] as const,
    };
    const first = buildClientGeographyPlan(input);
    const second = buildClientGeographyPlan(input);

    expect(first).toEqual(second);
    expect(first.recommendedZips[0]).toBe('44003');
    expect(first.candidates[0]?.reachGap).toBe(true);
  });

  it('accounts for modeled competitor pressure in candidate scoring', () => {
    const plan = buildClientGeographyPlan({
      opportunities,
      currentZips: ['44001'],
      competitors,
      selectedStrategyIds: ['search-support'],
    });

    const pressured = plan.candidates.find((candidate) => candidate.zip === '44002');
    expect(pressured?.competitorIds).toEqual(['competitor-a']);
    expect(pressured?.reason).not.toContain('lighter modeled competitor pressure');
  });
});
