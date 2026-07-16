import type { ZipOpportunity } from './opportunity';
import { zipNoise } from './zipDemographics';

/**
 * Deterministic synthetic internal business metrics for the internal
 * workspaces. The original prototype reserved these slots for real company
 * systems; the redesign simulates them so penetration, spend, and whitespace
 * views can be demonstrated. Values are modeled demonstration data only and
 * must never appear in the client-facing workspace.
 */
export interface InternalZipMetrics {
  /** Percent of serviceable households subscribing to Spectrum services. */
  penetrationRate: number;
  /** Average monthly revenue per subscriber household, in dollars. */
  arpu: number;
  /** Modeled monthly churn rate, percent. */
  churnRate: number;
  /** Percent of local advertising wallet held, percent. */
  shareOfWallet: number;
  /** Active local advertiser accounts. */
  activeAccounts: number;
  /** Modeled annual local ad revenue, dollars. */
  adRevenue: number;
  /** Modeled annual competitor media spend in the ZIP, dollars. */
  competitorSpend: number;
  /** Modeled unclaimed annual ad demand (whitespace), dollars. */
  revenueWhitespace: number;
  /** Strongest modeled advertiser categories, best first. */
  topAdCategories: readonly [string, string];
  /** Modeled year-over-year ad revenue growth, percent. */
  yoyGrowth: number;
}

const AD_CATEGORIES = [
  'Automotive',
  'Healthcare',
  'Home Services',
  'Legal',
  'Restaurants',
  'Retail',
  'Financial Services',
  'Recruitment',
] as const;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function round(value: number, places = 0): number {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

export function getInternalZipMetrics(opportunity: ZipOpportunity): InternalZipMetrics {
  const { zip, components, householdCount, medianIncome, score, categoryStrength } = opportunity;
  const incomeNorm = clamp((medianIncome - 30000) / 90000, 0, 1);
  const reachGapNorm = components.reachGap / 20;
  const conditionsNorm = components.competitiveConditions / 10;
  const categoryNorm = components.categoryPotential / 15;

  const penetrationRate = round(
    clamp(22 + (1 - reachGapNorm) * 34 + (zipNoise(zip, 21) - 0.5) * 10, 15, 64),
    1,
  );
  const activeAccounts = Math.max(
    1,
    Math.round((householdCount / 1000) * (0.6 + zipNoise(zip, 22) * 1.2)),
  );
  const adRevenue =
    Math.round(
      (activeAccounts * (14000 + incomeNorm * 22000 + (zipNoise(zip, 23) - 0.5) * 8000)) / 500,
    ) * 500;
  const competitorSpend =
    Math.round((householdCount * (8 + (1 - conditionsNorm) * 30 + zipNoise(zip, 24) * 6)) / 500) *
    500;
  const modeledDemand = householdCount * (26 + categoryNorm * 40 + incomeNorm * 18);
  const revenueWhitespace = Math.max(
    0,
    Math.round((modeledDemand - adRevenue - competitorSpend * 0.55) / 500) * 500,
  );

  const secondaryCandidates = AD_CATEGORIES.filter((category) => category !== categoryStrength);
  const secondaryCategory =
    secondaryCandidates[Math.floor(zipNoise(zip, 25) * secondaryCandidates.length)];

  return {
    penetrationRate,
    arpu: round(clamp(98 + incomeNorm * 55 + (zipNoise(zip, 26) - 0.5) * 12, 92, 168), 2),
    churnRate: round(clamp(2.4 - conditionsNorm * 1.2 + zipNoise(zip, 27) * 0.5, 0.7, 2.9), 2),
    shareOfWallet: round(clamp(14 + (score / 100) * 30 + zipNoise(zip, 28) * 8, 10, 52), 1),
    activeAccounts,
    adRevenue,
    competitorSpend,
    revenueWhitespace,
    topAdCategories: [categoryStrength, secondaryCategory],
    yoyGrowth: round(-6 + (score / 100) * 20 + (zipNoise(zip, 29) - 0.5) * 8, 1),
  };
}
