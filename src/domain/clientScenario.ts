export type ClientStrategyId =
  | 'search-support'
  | 'streaming-reach'
  | 'geography-expansion'
  | 'high-value-services';

export interface ClientMetrics {
  effectiveness: number;
  qualifiedReach: number;
  effectiveFrequency: number;
  modeledLeads: number;
  costPerLead: number;
  priorityClusters: number;
}

export interface ClientMetricRange {
  minimum: number;
  maximum: number;
}

export interface ClientSimulationResult {
  metrics: ClientMetrics;
  leadRange: ClientMetricRange;
  costPerLeadRange: ClientMetricRange;
  confidence: 'Moderate';
  explanation: string;
  recommendedZipExpansions: string[];
}

export interface ClientStrategyDefinition {
  id: ClientStrategyId;
  name: string;
  description: string;
  benefit: string;
  tradeoff: string;
  effects: ClientMetrics;
}

export const LAKEFRONT_BASELINE: Readonly<ClientMetrics> = {
  effectiveness: 68,
  qualifiedReach: 186000,
  effectiveFrequency: 3.1,
  modeledLeads: 940,
  costPerLead: 79.79,
  priorityClusters: 4,
};

export const LAKEFRONT_CAMPAIGN_TERRITORY_ID = 'cleveland-akron';

export const LAKEFRONT_CAMPAIGN_ZIPS = [
  '44102',
  '44103',
  '44106',
  '44109',
  '44111',
  '44113',
  '44114',
  '44115',
  '44118',
  '44122',
  '44124',
  '44128',
  '44129',
  '44130',
] as const;

export const CLIENT_STRATEGIES: readonly ClientStrategyDefinition[] = [
  {
    id: 'search-support',
    name: 'Increase search support',
    description: 'Capture high-intent activity after campaign exposure.',
    benefit: 'Higher conversion potential',
    tradeoff: 'Higher media cost',
    effects: {
      effectiveness: 6,
      qualifiedReach: 2000,
      effectiveFrequency: 0.1,
      modeledLeads: 70,
      costPerLead: -5.5,
      priorityClusters: 0,
    },
  },
  {
    id: 'streaming-reach',
    name: 'Expand streaming reach',
    description: 'Close underexposed audience gaps across screens.',
    benefit: 'More qualified reach',
    tradeoff: 'Possible frequency dilution',
    effects: {
      effectiveness: 7,
      qualifiedReach: 24000,
      effectiveFrequency: 0.25,
      modeledLeads: 45,
      costPerLead: -2.5,
      priorityClusters: 1,
    },
  },
  {
    id: 'geography-expansion',
    name: 'Expand geography',
    description: 'Add adjacent ZIPs with strong audience similarity.',
    benefit: 'Larger addressable market',
    tradeoff: 'Lower average fit if too broad',
    effects: {
      effectiveness: 5,
      qualifiedReach: 18000,
      effectiveFrequency: -0.05,
      modeledLeads: 35,
      costPerLead: -1.2,
      priorityClusters: 2,
    },
  },
  {
    id: 'high-value-services',
    name: 'Promote higher-value services',
    description: 'Shift creative toward higher-margin service lines.',
    benefit: 'More value per conversion',
    tradeoff: 'Narrower audience',
    effects: {
      effectiveness: 4,
      qualifiedReach: -3000,
      effectiveFrequency: 0.05,
      modeledLeads: 20,
      costPerLead: -3,
      priorityClusters: 0,
    },
  },
] as const;

function round(value: number, places = 0): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

export function simulateClientScenario(selectedStrategyIds: readonly ClientStrategyId[]): ClientSimulationResult {
  const selectedStrategies = CLIENT_STRATEGIES.filter((strategy) => selectedStrategyIds.includes(strategy.id));
  const metrics: ClientMetrics = { ...LAKEFRONT_BASELINE };

  for (const strategy of selectedStrategies) {
    metrics.effectiveness += strategy.effects.effectiveness;
    metrics.qualifiedReach += strategy.effects.qualifiedReach;
    metrics.effectiveFrequency += strategy.effects.effectiveFrequency;
    metrics.modeledLeads += strategy.effects.modeledLeads;
    metrics.costPerLead += strategy.effects.costPerLead;
    metrics.priorityClusters += strategy.effects.priorityClusters;
  }

  const hasSearchStreamingCombination =
    selectedStrategyIds.includes('search-support') && selectedStrategyIds.includes('streaming-reach');
  if (hasSearchStreamingCombination) {
    metrics.effectiveness += 3;
    metrics.modeledLeads += 25;
    metrics.costPerLead -= 1.5;
  }

  metrics.effectiveness = Math.min(92, Math.round(metrics.effectiveness));
  metrics.qualifiedReach = Math.round(metrics.qualifiedReach);
  metrics.effectiveFrequency = round(Math.max(2.5, metrics.effectiveFrequency), 1);
  metrics.modeledLeads = Math.round(metrics.modeledLeads);
  metrics.costPerLead = round(Math.max(55, metrics.costPerLead), 2);

  const explanations: string[] = [];
  if (selectedStrategyIds.includes('streaming-reach')) {
    explanations.push('Streaming expansion closes underexposed audience gaps in high-fit ZIP clusters.');
  }
  if (selectedStrategyIds.includes('search-support')) {
    explanations.push('Search support captures additional high-intent activity after campaign exposure.');
  }
  if (selectedStrategyIds.includes('geography-expansion')) {
    explanations.push('Geographic expansion adds adjacent ZIPs that resemble the campaign’s strongest current areas.');
  }
  if (selectedStrategyIds.includes('high-value-services')) {
    explanations.push('Higher-value service messaging improves modeled value while keeping the audience focused.');
  }

  return {
    metrics,
    leadRange: {
      minimum: metrics.modeledLeads - 25,
      maximum: metrics.modeledLeads + 25,
    },
    costPerLeadRange: {
      minimum: round(metrics.costPerLead - 2, 0),
      maximum: round(metrics.costPerLead + 2, 0),
    },
    confidence: 'Moderate',
    explanation:
      explanations.join(' ') ||
      'Select at least one strategy to compare an illustrative modeled plan with the current campaign.',
    recommendedZipExpansions: selectedStrategyIds.includes('geography-expansion')
      ? ['44022', '44140', '44145', '44236']
      : ['44022', '44140'],
  };
}
