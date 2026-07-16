import { getInternalZipMetrics } from './internalMetrics';
import type { ZipOpportunity } from './opportunity';
import {
  DEMOGRAPHIC_METRICS,
  getZipDemographics,
  type DemographicFormat,
  type DemographicMetricId,
} from './zipDemographics';

/**
 * A market lens recolors the ZIP surface by one numeric signal: the base
 * opportunity score, a synthetic demographic, or a modeled internal business
 * metric. Lenses only produce values — the map renders whatever it is given.
 */
export type MarketLensGroup = 'opportunity' | 'demographics' | 'internal';
export type MarketLensFormat = DemographicFormat | 'score';

export interface MarketLensDefinition {
  id: string;
  label: string;
  group: MarketLensGroup;
  format: MarketLensFormat;
  getValue: (opportunity: ZipOpportunity) => number;
}

export const OPPORTUNITY_LENS_ID = 'opportunity';

export const MARKET_LENSES: readonly MarketLensDefinition[] = [
  {
    id: OPPORTUNITY_LENS_ID,
    label: 'Opportunity score',
    group: 'opportunity',
    format: 'score',
    getValue: (opportunity) => opportunity.score,
  },
  ...DEMOGRAPHIC_METRICS.map<MarketLensDefinition>((metric) => ({
    id: metric.id,
    label: metric.label,
    group: 'demographics',
    format: metric.format,
    getValue: (opportunity) => getZipDemographics(opportunity)[metric.id],
  })),
  {
    id: 'penetrationRate',
    label: 'Reach penetration',
    group: 'internal',
    format: 'percent',
    getValue: (opportunity) => getInternalZipMetrics(opportunity).penetrationRate,
  },
  {
    id: 'competitorSpend',
    label: 'Competitor spend',
    group: 'internal',
    format: 'currency',
    getValue: (opportunity) => getInternalZipMetrics(opportunity).competitorSpend,
  },
  {
    id: 'revenueWhitespace',
    label: 'Revenue whitespace',
    group: 'internal',
    format: 'currency',
    getValue: (opportunity) => getInternalZipMetrics(opportunity).revenueWhitespace,
  },
] as const;

export function findMarketLens(lensId: string): MarketLensDefinition {
  const lens = MARKET_LENSES.find((candidate) => candidate.id === lensId);
  return lens ?? MARKET_LENSES[0];
}

export interface MarketLensSurface {
  /** Per-ZIP presentation scores on the 35–100 heat ramp, or undefined for the base score. */
  displayScores: Record<string, number> | undefined;
  /** Observed metric range across the supplied ZIPs. */
  minimum: number;
  maximum: number;
}

const HEAT_RAMP_MINIMUM = 35;
const HEAT_RAMP_MAXIMUM = 100;

/**
 * Projects a lens onto the shared pastel heat ramp. The range is computed
 * over the supplied (territory-scoped) opportunities so contrast stays
 * meaningful inside the selected territory.
 */
export function buildMarketLensSurface(
  opportunities: readonly ZipOpportunity[],
  lens: MarketLensDefinition,
): MarketLensSurface {
  if (opportunities.length === 0) {
    return { displayScores: undefined, minimum: 0, maximum: 0 };
  }

  const values = opportunities.map((opportunity) => lens.getValue(opportunity));
  let minimum = values[0];
  let maximum = values[0];
  for (const value of values) {
    if (value < minimum) minimum = value;
    if (value > maximum) maximum = value;
  }

  if (lens.id === OPPORTUNITY_LENS_ID) {
    return { displayScores: undefined, minimum, maximum };
  }

  const span = maximum - minimum;
  const displayScores: Record<string, number> = {};
  for (const [index, opportunity] of opportunities.entries()) {
    const normalized = span === 0 ? 0.5 : (values[index] - minimum) / span;
    displayScores[opportunity.zip] = Math.round(
      HEAT_RAMP_MINIMUM + normalized * (HEAT_RAMP_MAXIMUM - HEAT_RAMP_MINIMUM),
    );
  }

  return { displayScores, minimum, maximum };
}

export interface DemographicRange {
  minimum: number;
  maximum: number;
}

export type DemographicFilterState = Partial<Record<DemographicMetricId, DemographicRange>>;

/** Observed value ranges for every demographic metric across the supplied ZIPs. */
export function computeDemographicRanges(
  opportunities: readonly ZipOpportunity[],
): Record<DemographicMetricId, DemographicRange> {
  const ranges = {} as Record<DemographicMetricId, DemographicRange>;
  for (const metric of DEMOGRAPHIC_METRICS) {
    ranges[metric.id] = { minimum: 0, maximum: 0 };
  }
  for (const [index, opportunity] of opportunities.entries()) {
    const demographics = getZipDemographics(opportunity);
    for (const metric of DEMOGRAPHIC_METRICS) {
      const value = demographics[metric.id];
      const range = ranges[metric.id];
      if (index === 0) {
        range.minimum = value;
        range.maximum = value;
      } else {
        if (value < range.minimum) range.minimum = value;
        if (value > range.maximum) range.maximum = value;
      }
    }
  }
  return ranges;
}

/** ZIPs whose synthetic demographics fall inside every active range filter. */
export function filterZipsByDemographics(
  opportunities: readonly ZipOpportunity[],
  filters: DemographicFilterState,
): Set<string> {
  const activeFilters = Object.entries(filters) as Array<[DemographicMetricId, DemographicRange]>;
  const matching = new Set<string>();
  for (const opportunity of opportunities) {
    const demographics = getZipDemographics(opportunity);
    const matches = activeFilters.every(([metricId, range]) => {
      const value = demographics[metricId];
      return value >= range.minimum && value <= range.maximum;
    });
    if (matches) matching.add(opportunity.zip);
  }
  return matching;
}
