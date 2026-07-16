import type { MarketOverlayData } from './mapOverlay';
import type { ZipOpportunity } from './opportunity';

export type MarketColorMetric =
  | 'opportunity'
  | 'revenue-headroom'
  | 'competitor-spend'
  | 'median-income'
  | 'home-value'
  | 'family-households';

export interface MarketMetricDefinition {
  id: MarketColorMetric;
  label: string;
  shortLabel: string;
  lowLabel: string;
  highLabel: string;
}

export interface MarketIntelligenceProfile {
  zip: string;
  medianHomeValue: number;
  medianAge: number;
  collegeGraduatePct: number;
  homeownerPct: number;
  incomeOver50kPct: number;
  householdsWithChildrenPct: number;
  blackPopulationPct: number;
  hispanicPopulationIndex: number;
  medianBuildYear: number;
  businessDensityIndex: number;
  categoryDemandIndex: number;
  competitorCount: number;
  estimatedCompetitorSpend: number;
  modeledSpectrumPenetrationPct: number;
  modeledRevenueHeadroom: number;
  competitivePosition: 'Conquest' | 'Expand' | 'Defend' | 'Develop';
  leadershipHeadline: string;
  whyWeCanWin: readonly string[];
}

export const MARKET_METRICS: readonly MarketMetricDefinition[] = [
  {
    id: 'opportunity',
    label: 'Overall market opportunity',
    shortLabel: 'Opportunity',
    lowLabel: 'Emerging',
    highLabel: 'Priority',
  },
  {
    id: 'revenue-headroom',
    label: 'Modeled revenue headroom',
    shortLabel: 'Revenue headroom',
    lowLabel: 'Lower gap',
    highLabel: 'Larger gap',
  },
  {
    id: 'competitor-spend',
    label: 'Estimated competitor spend',
    shortLabel: 'Competitor spend',
    lowLabel: 'Lower spend',
    highLabel: 'Higher spend',
  },
  {
    id: 'median-income',
    label: 'Median household income',
    shortLabel: 'Median income',
    lowLabel: 'Lower income',
    highLabel: 'Higher income',
  },
  {
    id: 'home-value',
    label: 'Median home value',
    shortLabel: 'Home value',
    lowLabel: 'Lower value',
    highLabel: 'Higher value',
  },
  {
    id: 'family-households',
    label: 'Households with children',
    shortLabel: 'Family households',
    lowLabel: 'Lower share',
    highLabel: 'Higher share',
  },
] as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number, places = 0): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

function zipSeed(zip: string): number {
  return [...zip].reduce((total, digit, index) => total + Number(digit) * (index + 7), 0);
}

function stableVariation(zip: string, modulus: number, offset = 0): number {
  return (zipSeed(zip) * 37 + offset * 53) % modulus;
}

function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${Math.round(value)}`;
}

export function buildMarketIntelligenceProfile(
  opportunity: ZipOpportunity,
  overlays: MarketOverlayData,
): MarketIntelligenceProfile {
  const competitorCount = overlays.competitors.filter((competitor) => competitor.zips.includes(opportunity.zip)).length;
  const hasReachGap = overlays.reachGapZips.includes(opportunity.zip);
  const seed = zipSeed(opportunity.zip);

  const medianHomeValue = Math.round(
    opportunity.medianIncome * (2.55 + stableVariation(opportunity.zip, 95, 1) / 100) + 32_000,
  );
  const medianAge = round(31 + stableVariation(opportunity.zip, 255, 2) / 10, 1);
  const collegeGraduatePct = round(
    clamp(14 + opportunity.components.audiencePotential * 1.45 + stableVariation(opportunity.zip, 85, 3) / 10, 14, 64),
    1,
  );
  const homeownerPct = round(
    clamp(39 + opportunity.medianIncome / 4_800 + stableVariation(opportunity.zip, 75, 4) / 10, 35, 84),
    1,
  );
  const incomeOver50kPct = round(clamp(35 + opportunity.medianIncome / 2_300, 38, 88), 1);
  const householdsWithChildrenPct = round(
    clamp(17 + stableVariation(opportunity.zip, 210, 5) / 10 + opportunity.components.geographicPotential / 4, 17, 46),
    1,
  );
  const blackPopulationPct = round(clamp(2 + stableVariation(opportunity.zip, 480, 6) / 10, 2, 50), 1);
  const hispanicPopulationIndex = Math.round(38 + stableVariation(opportunity.zip, 250, 7));
  const medianBuildYear = Math.round(1946 + stableVariation(opportunity.zip, 66, 8));
  const businessDensityIndex = Math.round(
    clamp(30 + opportunity.components.searchOpportunity * 2.8 + opportunity.components.categoryPotential * 1.6, 30, 99),
  );
  const categoryDemandIndex = Math.round(
    clamp(38 + opportunity.components.categoryPotential * 3.2 + opportunity.components.audiencePotential, 42, 100),
  );

  const estimatedCompetitorSpend = Math.round(
    opportunity.householdCount * (18 + opportunity.score / 2.7) + competitorCount * 96_000 + stableVariation(opportunity.zip, 85_000, 9),
  );
  const modeledSpectrumPenetrationPct = round(
    clamp(
      58 - opportunity.components.reachGap * 1.55 - competitorCount * 5 + opportunity.components.competitiveConditions * 1.25,
      8,
      68,
    ),
    1,
  );
  const modeledRevenueHeadroom = Math.round(
    estimatedCompetitorSpend * (1 - modeledSpectrumPenetrationPct / 100) * (hasReachGap ? 0.58 : 0.42),
  );

  const competitivePosition: MarketIntelligenceProfile['competitivePosition'] =
    modeledRevenueHeadroom >= 600_000 && competitorCount >= 2
      ? 'Conquest'
      : modeledSpectrumPenetrationPct >= 50
        ? 'Defend'
        : opportunity.score >= 75
          ? 'Expand'
          : 'Develop';

  const leadershipHeadline =
    competitivePosition === 'Conquest'
      ? `${formatCurrencyCompact(modeledRevenueHeadroom)} in modeled headroom sits behind elevated competitor activity.`
      : competitivePosition === 'Defend'
        ? 'Strong modeled position with enough competitive pressure to justify a defensive growth plan.'
        : competitivePosition === 'Expand'
          ? 'Audience strength and category demand indicate room to expand the current market position.'
          : 'A developing market where focused category and audience activation could build future share.';

  const whyWeCanWin = [
    opportunity.components.audiencePotential >= 18
      ? 'Large qualified household base supports scaled local reach.'
      : 'Focused audience pockets support a more targeted local-market approach.',
    businessDensityIndex >= 72
      ? 'Business density creates a deep pool of local advertiser prospects.'
      : 'Category concentration offers a manageable prospecting entry point.',
    hasReachGap
      ? 'Modeled reach whitespace creates a clear coverage and streaming conversation.'
      : 'Current coverage can support product expansion without relying on geographic whitespace.',
    competitorCount >= 2
      ? 'Visible competitor activity proves advertiser demand and creates a conquest story.'
      : 'Lower modeled competitor pressure may improve the path to local share growth.',
  ] as const;

  return {
    zip: opportunity.zip,
    medianHomeValue,
    medianAge,
    collegeGraduatePct,
    homeownerPct,
    incomeOver50kPct,
    householdsWithChildrenPct,
    blackPopulationPct,
    hispanicPopulationIndex,
    medianBuildYear,
    businessDensityIndex,
    categoryDemandIndex,
    competitorCount,
    estimatedCompetitorSpend,
    modeledSpectrumPenetrationPct,
    modeledRevenueHeadroom,
    competitivePosition,
    leadershipHeadline,
    whyWeCanWin,
  };
}

export function buildMarketIntelligenceProfiles(
  opportunities: readonly ZipOpportunity[],
  overlays: MarketOverlayData,
): ReadonlyMap<string, MarketIntelligenceProfile> {
  return new Map(opportunities.map((opportunity) => [opportunity.zip, buildMarketIntelligenceProfile(opportunity, overlays)]));
}

export function getMarketMetricValue(
  opportunity: ZipOpportunity,
  profile: MarketIntelligenceProfile,
  metric: MarketColorMetric,
): number {
  switch (metric) {
    case 'opportunity':
      return opportunity.score;
    case 'revenue-headroom':
      return profile.modeledRevenueHeadroom;
    case 'competitor-spend':
      return profile.estimatedCompetitorSpend;
    case 'median-income':
      return opportunity.medianIncome;
    case 'home-value':
      return profile.medianHomeValue;
    case 'family-households':
      return profile.householdsWithChildrenPct;
  }
}

export function buildMarketDisplayScores(
  opportunities: readonly ZipOpportunity[],
  profiles: ReadonlyMap<string, MarketIntelligenceProfile>,
  metric: MarketColorMetric,
): Readonly<Record<string, number>> | undefined {
  if (metric === 'opportunity') return undefined;

  const values = opportunities.map((opportunity) => {
    const profile = profiles.get(opportunity.zip);
    return profile ? getMarketMetricValue(opportunity, profile, metric) : 0;
  });
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const span = Math.max(1, maximum - minimum);

  return Object.fromEntries(
    opportunities.map((opportunity, index) => [
      opportunity.zip,
      Math.round(35 + ((values[index] - minimum) / span) * 65),
    ]),
  );
}

export function formatMarketMetricValue(
  opportunity: ZipOpportunity,
  profile: MarketIntelligenceProfile,
  metric: MarketColorMetric,
): string {
  const value = getMarketMetricValue(opportunity, profile, metric);
  switch (metric) {
    case 'opportunity':
      return `${value}/100`;
    case 'revenue-headroom':
    case 'competitor-spend':
    case 'median-income':
    case 'home-value':
      return formatCurrencyCompact(value);
    case 'family-households':
      return `${value.toFixed(1)}%`;
  }
}
