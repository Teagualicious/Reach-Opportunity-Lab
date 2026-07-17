import type { ZipOpportunity } from './opportunity';

/**
 * County-level aggregation for the middle drill-down step: a selected region
 * splits into its counties before any ZIP detail appears. Summaries are pure
 * aggregates of the supplied (territory-scoped) synthetic records.
 */
export interface CountySummary {
  countyId: string;
  name: string;
  center: [longitude: number, latitude: number];
  zips: string[];
  zipCount: number;
  averageOpportunityScore: number;
  topCategory: string;
}

export function buildCountySummaries(opportunities: readonly ZipOpportunity[]): CountySummary[] {
  interface Accumulator {
    countyId: string;
    name: string;
    zips: string[];
    scoreTotal: number;
    longitudeTotal: number;
    latitudeTotal: number;
    centroidCount: number;
    categoryCounts: Map<string, number>;
  }

  const byCounty = new Map<string, Accumulator>();
  for (const opportunity of opportunities) {
    const countyId = opportunity.countyId;
    if (!countyId) continue;
    let entry = byCounty.get(countyId);
    if (!entry) {
      entry = {
        countyId,
        name: opportunity.countyName ?? countyId,
        zips: [],
        scoreTotal: 0,
        longitudeTotal: 0,
        latitudeTotal: 0,
        centroidCount: 0,
        categoryCounts: new Map(),
      };
      byCounty.set(countyId, entry);
    }
    entry.zips.push(opportunity.zip);
    entry.scoreTotal += opportunity.score;
    if (opportunity.centroid) {
      entry.longitudeTotal += opportunity.centroid[0];
      entry.latitudeTotal += opportunity.centroid[1];
      entry.centroidCount += 1;
    }
    entry.categoryCounts.set(
      opportunity.categoryStrength,
      (entry.categoryCounts.get(opportunity.categoryStrength) ?? 0) + 1,
    );
  }

  return [...byCounty.values()]
    .map<CountySummary>((entry) => {
      let topCategory = '';
      let topCategoryCount = 0;
      for (const [category, count] of entry.categoryCounts) {
        if (count > topCategoryCount || (count === topCategoryCount && category < topCategory)) {
          topCategory = category;
          topCategoryCount = count;
        }
      }
      return {
        countyId: entry.countyId,
        name: entry.name,
        center:
          entry.centroidCount > 0
            ? [entry.longitudeTotal / entry.centroidCount, entry.latitudeTotal / entry.centroidCount]
            : [0, 0],
        zips: entry.zips.sort(),
        zipCount: entry.zips.length,
        averageOpportunityScore: Math.round(entry.scoreTotal / entry.zips.length),
        topCategory,
      };
    })
    .sort((left, right) => left.countyId.localeCompare(right.countyId));
}
