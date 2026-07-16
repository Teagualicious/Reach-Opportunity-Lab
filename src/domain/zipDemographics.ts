import type { ZipOpportunity } from './opportunity';

/**
 * Deterministic synthetic ZIP demographics for the Market Opportunity Map.
 *
 * Every value is derived from the ZIP identifier and the existing synthetic
 * opportunity record, so the same ZIP always produces the same profile with
 * no stored fixture and no randomness. These are demonstration values only —
 * they are not Census estimates.
 */
export interface ZipDemographics {
  /** Median household income in dollars (mirrors the opportunity record). */
  medianIncome: number;
  /** Median owner-occupied home value in dollars. */
  medianHomeValue: number;
  /** Median resident age in years. */
  medianAge: number;
  /** Percent of residents 25+ with a college degree. */
  collegeGradRate: number;
  /** Percent of occupied homes that are owner-occupied. */
  homeownerRate: number;
  /** Percent of households earning $50K or more. */
  income50kPlusRate: number;
  /** Percent of households with children. */
  householdsWithChildrenRate: number;
  /** Percent of residents identifying as Black / African American. */
  blackPopulationRate: number;
  /** Hispanic population index where 100 is the state average. */
  hispanicPopulationIndex: number;
  /** Median residential construction year. */
  medianBuildYear: number;
}

export type DemographicMetricId = keyof ZipDemographics;
export type DemographicFormat = 'currency' | 'percent' | 'years' | 'index' | 'year';

export interface DemographicMetricDefinition {
  id: DemographicMetricId;
  label: string;
  format: DemographicFormat;
}

export const DEMOGRAPHIC_METRICS: readonly DemographicMetricDefinition[] = [
  { id: 'medianIncome', label: 'Median income', format: 'currency' },
  { id: 'medianHomeValue', label: 'Median home value', format: 'currency' },
  { id: 'medianAge', label: 'Median age', format: 'years' },
  { id: 'collegeGradRate', label: 'College grad+ (age 25+)', format: 'percent' },
  { id: 'homeownerRate', label: 'Homeowners', format: 'percent' },
  { id: 'income50kPlusRate', label: 'Household income $50K+', format: 'percent' },
  { id: 'householdsWithChildrenRate', label: 'Households with children', format: 'percent' },
  { id: 'blackPopulationRate', label: 'Black / African American', format: 'percent' },
  { id: 'hispanicPopulationIndex', label: 'Hispanic population index', format: 'index' },
  { id: 'medianBuildYear', label: 'Median build year', format: 'year' },
] as const;

export function formatDemographicValue(format: DemographicFormat, value: number): string {
  switch (format) {
    case 'currency':
      return `$${Math.round(value).toLocaleString('en-US')}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'years':
      return value.toFixed(1);
    case 'index':
    case 'year':
      return String(Math.round(value));
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function round(value: number, places = 0): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

/** Deterministic [0, 1) value from a ZIP identifier and a metric salt. */
export function zipNoise(zip: string, salt: number): number {
  let hash = (2166136261 ^ Math.imul(salt + 1, 2654435761)) >>> 0;
  for (let index = 0; index < zip.length; index += 1) {
    hash ^= zip.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0x5bd1e995);
  hash ^= hash >>> 15;
  return (hash >>> 0) / 4294967296;
}

export function getZipDemographics(opportunity: ZipOpportunity): ZipDemographics {
  const { zip, medianIncome } = opportunity;
  const incomeNorm = clamp((medianIncome - 30000) / 90000, 0, 1);

  const ageNoise = zipNoise(zip, 3);
  const medianAge = round(29 + ageNoise * 30, 1);
  const ageNorm = (medianAge - 29) / 30;

  return {
    medianIncome,
    medianHomeValue:
      Math.round((92000 + incomeNorm * 215000 + (zipNoise(zip, 2) - 0.5) * 58000) / 1000) * 1000,
    medianAge,
    collegeGradRate: round(clamp(12 + incomeNorm * 38 + (zipNoise(zip, 4) - 0.5) * 10, 8, 60), 1),
    homeownerRate: round(clamp(30 + incomeNorm * 40 + (zipNoise(zip, 5) - 0.5) * 16, 25, 82), 1),
    income50kPlusRate: round(clamp(35 + incomeNorm * 45 + (zipNoise(zip, 6) - 0.5) * 8, 30, 88), 1),
    householdsWithChildrenRate: round(
      clamp(16 + (1 - ageNorm) * 22 + zipNoise(zip, 7) * 8, 12, 46),
      1,
    ),
    blackPopulationRate: round(zipNoise(zip, 8) ** 2 * 47, 1),
    hispanicPopulationIndex: Math.round(30 + zipNoise(zip, 9) ** 1.6 * 260),
    medianBuildYear: Math.round(1948 + zipNoise(zip, 10) * 62),
  };
}
