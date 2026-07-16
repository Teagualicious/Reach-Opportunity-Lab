import type { ZipOpportunity } from './opportunity';
import type { TerritoryDefinition } from './territory';

/**
 * Region-first navigation: at the statewide level the map shows each
 * operating territory as one solid region. Selecting a region drills into
 * its ZIP areas. Summaries are pure aggregates of the synthetic records.
 */
export interface RegionSummary {
  territoryId: string;
  name: string;
  anchorCities: string[];
  center: [longitude: number, latitude: number];
  zipCount: number;
  averageOpportunityScore: number;
  topCategory: string;
}

export function buildRegionSummaries(
  opportunities: readonly ZipOpportunity[],
  territories: readonly TerritoryDefinition[],
): RegionSummary[] {
  const byZip = new Map(opportunities.map((opportunity) => [opportunity.zip, opportunity]));

  return territories.map((territory) => {
    let scoreTotal = 0;
    let counted = 0;
    const categoryCounts = new Map<string, number>();

    for (const zip of territory.zips) {
      const opportunity = byZip.get(zip);
      if (!opportunity) continue;
      scoreTotal += opportunity.score;
      counted += 1;
      categoryCounts.set(
        opportunity.categoryStrength,
        (categoryCounts.get(opportunity.categoryStrength) ?? 0) + 1,
      );
    }

    let topCategory = '';
    let topCategoryCount = 0;
    for (const [category, count] of categoryCounts) {
      if (count > topCategoryCount || (count === topCategoryCount && category < topCategory)) {
        topCategory = category;
        topCategoryCount = count;
      }
    }

    return {
      territoryId: territory.id,
      name: territory.name,
      anchorCities: territory.anchorCities,
      center: territory.center,
      zipCount: counted,
      averageOpportunityScore: counted === 0 ? 0 : Math.round(scoreTotal / counted),
      topCategory,
    };
  });
}
