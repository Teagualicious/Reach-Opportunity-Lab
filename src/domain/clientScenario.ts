import type { OpportunityComponents } from './opportunity';

export type ClientStrategyId =
  | 'search-support'
  | 'streaming-reach'
  | 'geography-expansion'
  | 'high-value-services';

export type ClientAdvertiserId =
  | 'lakefront-automotive'
  | 'buckeye-home-pros'
  | 'queen-city-credit-union'
  | 'harbor-hearth-furnishings';

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

export interface ClientGrowthIdeaCopy {
  name: string;
  description: string;
  benefit: string;
}

export interface ClientAdvertiserProfile {
  id: ClientAdvertiserId;
  name: string;
  category: string;
  summary: string;
  homeMarketLabel: string;
  defaultTerritoryId: string;
  campaignZipCount: number;
  baseline: Readonly<ClientMetrics>;
  strategyMultipliers: Readonly<Record<ClientStrategyId, number>>;
  fitWeights: Readonly<Partial<Record<keyof OpportunityComponents, number>>>;
  premiumGrowthIdea: Readonly<ClientGrowthIdeaCopy>;
  canonicalCampaignZips?: readonly string[];
}

const LAKEFRONT_BASELINE_METRICS: Readonly<ClientMetrics> = {
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

export const CLIENT_ADVERTISER_PROFILES: readonly ClientAdvertiserProfile[] = [
  {
    id: 'lakefront-automotive',
    name: 'Lakefront Automotive Group',
    category: 'Automotive',
    summary: 'Dealer group focused on qualified leads for vehicles and service.',
    homeMarketLabel: 'Northeast Ohio · Cleveland–Akron',
    defaultTerritoryId: LAKEFRONT_CAMPAIGN_TERRITORY_ID,
    campaignZipCount: 14,
    baseline: LAKEFRONT_BASELINE_METRICS,
    strategyMultipliers: {
      'search-support': 1,
      'streaming-reach': 1,
      'geography-expansion': 1,
      'high-value-services': 1,
    },
    fitWeights: {
      audiencePotential: 0.55,
      geographicPotential: 0.85,
      searchOpportunity: 0.9,
      categoryPotential: 1,
    },
    premiumGrowthIdea: {
      name: 'Feature service & premium vehicles',
      description: 'Shift creative toward service, certified vehicles, and higher-value inventory.',
      benefit: 'More value per customer',
    },
    canonicalCampaignZips: LAKEFRONT_CAMPAIGN_ZIPS,
  },
  {
    id: 'buckeye-home-pros',
    name: 'Buckeye Home Pros',
    category: 'Home services',
    summary: 'Regional roofing, HVAC, and exterior-services advertiser.',
    homeMarketLabel: 'Central Ohio · Columbus',
    defaultTerritoryId: 'columbus-central',
    campaignZipCount: 12,
    baseline: {
      effectiveness: 63,
      qualifiedReach: 148000,
      effectiveFrequency: 2.9,
      modeledLeads: 760,
      costPerLead: 86.45,
      priorityClusters: 3,
    },
    strategyMultipliers: {
      'search-support': 1.2,
      'streaming-reach': 0.9,
      'geography-expansion': 1.1,
      'high-value-services': 1.15,
    },
    fitWeights: {
      searchOpportunity: 1.2,
      geographicPotential: 0.75,
      categoryPotential: 0.9,
      reachGap: 0.45,
    },
    premiumGrowthIdea: {
      name: 'Feature roofing & HVAC',
      description: 'Shift creative toward larger repair, replacement, and seasonal service needs.',
      benefit: 'More high-value appointments',
    },
  },
  {
    id: 'queen-city-credit-union',
    name: 'Queen City Credit Union',
    category: 'Financial services',
    summary: 'Member-focused financial advertiser promoting lending and deposits.',
    homeMarketLabel: 'Southwest Ohio · Cincinnati',
    defaultTerritoryId: 'cincinnati-southwest',
    campaignZipCount: 16,
    baseline: {
      effectiveness: 72,
      qualifiedReach: 205000,
      effectiveFrequency: 3.3,
      modeledLeads: 1120,
      costPerLead: 67.4,
      priorityClusters: 5,
    },
    strategyMultipliers: {
      'search-support': 1,
      'streaming-reach': 1.1,
      'geography-expansion': 0.85,
      'high-value-services': 1.2,
    },
    fitWeights: {
      audiencePotential: 0.9,
      categoryPotential: 1,
      competitiveConditions: 0.7,
      reachGap: 0.5,
    },
    premiumGrowthIdea: {
      name: 'Feature lending products',
      description: 'Shift creative toward home, auto, and small-business lending opportunities.',
      benefit: 'More valuable member relationships',
    },
  },
  {
    id: 'harbor-hearth-furnishings',
    name: 'Harbor & Hearth Furnishings',
    category: 'Home furnishings',
    summary: 'Multi-location retailer focused on room packages and seasonal demand.',
    homeMarketLabel: 'Northwest Ohio · Toledo',
    defaultTerritoryId: 'toledo-northwest',
    campaignZipCount: 11,
    baseline: {
      effectiveness: 59,
      qualifiedReach: 131000,
      effectiveFrequency: 2.7,
      modeledLeads: 580,
      costPerLead: 94.2,
      priorityClusters: 3,
    },
    strategyMultipliers: {
      'search-support': 0.9,
      'streaming-reach': 1.2,
      'geography-expansion': 1.15,
      'high-value-services': 1.05,
    },
    fitWeights: {
      audiencePotential: 1,
      geographicPotential: 0.85,
      categoryPotential: 1.1,
      searchOpportunity: 0.35,
    },
    premiumGrowthIdea: {
      name: 'Feature room packages',
      description: 'Shift creative toward bundled rooms, financing, and higher-value collections.',
      benefit: 'Higher value per purchase',
    },
  },
] as const;

export const DEFAULT_CLIENT_ADVERTISER = CLIENT_ADVERTISER_PROFILES[0];
export const LAKEFRONT_BASELINE = DEFAULT_CLIENT_ADVERTISER.baseline;

export function getClientAdvertiserProfile(advertiserId: ClientAdvertiserId): ClientAdvertiserProfile {
  return (
    CLIENT_ADVERTISER_PROFILES.find((advertiser) => advertiser.id === advertiserId) ??
    DEFAULT_CLIENT_ADVERTISER
  );
}

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

function metricScale(profile: ClientAdvertiserProfile, metric: keyof ClientMetrics): number {
  const baselineValue = profile.baseline[metric];
  const lakefrontValue = LAKEFRONT_BASELINE[metric];
  if (lakefrontValue === 0) return 1;
  return baselineValue / lakefrontValue;
}

export function simulateClientScenario(
  selectedStrategyIds: readonly ClientStrategyId[],
  profile: ClientAdvertiserProfile = DEFAULT_CLIENT_ADVERTISER,
): ClientSimulationResult {
  const selectedStrategies = CLIENT_STRATEGIES.filter((strategy) => selectedStrategyIds.includes(strategy.id));
  const metrics: ClientMetrics = { ...profile.baseline };

  for (const strategy of selectedStrategies) {
    const multiplier = profile.strategyMultipliers[strategy.id];
    metrics.effectiveness += strategy.effects.effectiveness * multiplier;
    metrics.qualifiedReach += strategy.effects.qualifiedReach * metricScale(profile, 'qualifiedReach') * multiplier;
    metrics.effectiveFrequency += strategy.effects.effectiveFrequency * multiplier;
    metrics.modeledLeads += strategy.effects.modeledLeads * metricScale(profile, 'modeledLeads') * multiplier;
    metrics.costPerLead += strategy.effects.costPerLead * metricScale(profile, 'costPerLead') * multiplier;
    metrics.priorityClusters += strategy.effects.priorityClusters * multiplier;
  }

  const hasSearchStreamingCombination =
    selectedStrategyIds.includes('search-support') && selectedStrategyIds.includes('streaming-reach');
  if (hasSearchStreamingCombination) {
    const combinationMultiplier =
      (profile.strategyMultipliers['search-support'] + profile.strategyMultipliers['streaming-reach']) / 2;
    metrics.effectiveness += 3 * combinationMultiplier;
    metrics.modeledLeads += 25 * metricScale(profile, 'modeledLeads') * combinationMultiplier;
    metrics.costPerLead -= 1.5 * metricScale(profile, 'costPerLead') * combinationMultiplier;
  }

  metrics.effectiveness = Math.min(92, Math.round(metrics.effectiveness));
  metrics.qualifiedReach = Math.round(metrics.qualifiedReach);
  metrics.effectiveFrequency = round(Math.max(2.5, metrics.effectiveFrequency), 1);
  metrics.modeledLeads = Math.round(metrics.modeledLeads);
  metrics.costPerLead = round(Math.max(55, metrics.costPerLead), 2);
  metrics.priorityClusters = Math.max(1, Math.round(metrics.priorityClusters));

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
    explanations.push(`${profile.premiumGrowthIdea.name} improves modeled value while keeping the audience focused.`);
  }

  const leadRangeOffset = Math.max(
    20,
    Math.round(25 * metricScale(profile, 'modeledLeads')),
  );

  return {
    metrics,
    leadRange: {
      minimum: metrics.modeledLeads - leadRangeOffset,
      maximum: metrics.modeledLeads + leadRangeOffset,
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
