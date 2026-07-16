import { getInternalZipMetrics } from './internalMetrics';
import type { CompetitorFootprint } from './mapOverlay';
import type { ZipOpportunity } from './opportunity';

/**
 * The Market Opportunity Map's primary output: a deterministic territory
 * opportunity brief summarizing where the company can win and why. Built
 * entirely from synthetic opportunity records and modeled internal metrics.
 */
export interface TerritoryBriefHighlight {
  zip: string;
  name: string;
  score: number;
  revenueWhitespace: number;
}

export interface TerritoryBrief {
  territoryName: string;
  zipCount: number;
  averageOpportunityScore: number;
  topCategory: string;
  averagePenetrationRate: number;
  reachGapZipCount: number;
  totalRevenueWhitespace: number;
  totalCompetitorSpend: number;
  strongestCompetitor: { label: string; zipCount: number } | null;
  highlights: TerritoryBriefHighlight[];
  recommendation: string;
}

export function buildTerritoryBrief(
  territoryName: string,
  opportunities: readonly ZipOpportunity[],
  competitors: readonly CompetitorFootprint[],
  reachGapZips: readonly string[],
): TerritoryBrief | null {
  if (opportunities.length === 0) return null;

  const zipSet = new Set(opportunities.map(({ zip }) => zip));
  let scoreTotal = 0;
  let penetrationTotal = 0;
  let whitespaceTotal = 0;
  let competitorSpendTotal = 0;
  const categoryCounts = new Map<string, number>();
  const highlights: TerritoryBriefHighlight[] = [];

  for (const opportunity of opportunities) {
    const metrics = getInternalZipMetrics(opportunity);
    scoreTotal += opportunity.score;
    penetrationTotal += metrics.penetrationRate;
    whitespaceTotal += metrics.revenueWhitespace;
    competitorSpendTotal += metrics.competitorSpend;
    categoryCounts.set(
      opportunity.categoryStrength,
      (categoryCounts.get(opportunity.categoryStrength) ?? 0) + 1,
    );
    highlights.push({
      zip: opportunity.zip,
      name: opportunity.name,
      score: opportunity.score,
      revenueWhitespace: metrics.revenueWhitespace,
    });
  }

  highlights.sort(
    (left, right) =>
      right.score - left.score ||
      right.revenueWhitespace - left.revenueWhitespace ||
      left.zip.localeCompare(right.zip),
  );

  let topCategory = opportunities[0].categoryStrength;
  let topCategoryCount = 0;
  for (const [category, count] of categoryCounts) {
    if (count > topCategoryCount || (count === topCategoryCount && category < topCategory)) {
      topCategory = category;
      topCategoryCount = count;
    }
  }

  let strongestCompetitor: { label: string; zipCount: number } | null = null;
  for (const competitor of competitors) {
    const zipCount = competitor.zips.filter((zip) => zipSet.has(zip)).length;
    if (zipCount > 0 && (!strongestCompetitor || zipCount > strongestCompetitor.zipCount)) {
      strongestCompetitor = { label: competitor.label, zipCount };
    }
  }

  const reachGapZipCount = reachGapZips.filter((zip) => zipSet.has(zip)).length;
  const averagePenetrationRate = Math.round((penetrationTotal / opportunities.length) * 10) / 10;

  return {
    territoryName,
    zipCount: opportunities.length,
    averageOpportunityScore: Math.round(scoreTotal / opportunities.length),
    topCategory,
    averagePenetrationRate,
    reachGapZipCount,
    totalRevenueWhitespace: whitespaceTotal,
    totalCompetitorSpend: competitorSpendTotal,
    strongestCompetitor,
    highlights: highlights.slice(0, 3),
    recommendation:
      reachGapZipCount > 0
        ? `Lead with the ${reachGapZipCount} modeled reach-gap ${
            reachGapZipCount === 1 ? 'ZIP' : 'ZIPs'
          } where ${topCategory.toLowerCase()} demand is unclaimed, then hand the priority list to Seller Action Center.`
        : `Concentrate on the highest-whitespace ${topCategory.toLowerCase()} ZIPs, then hand the priority list to Seller Action Center.`,
  };
}
