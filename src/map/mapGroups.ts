import type { CountySummary } from '../domain/countySummary';
import type { RegionSummary } from '../domain/regionSummary';
import {
  opportunityColorForScore,
  regionColorForIndex,
  type MapGroupKey,
} from './mapExpressions';

/**
 * Presentation adapters that turn domain aggregates into the map's group
 * surface. Regions use the soft categorical palette (statewide averages
 * cluster too tightly for the heat ramp); counties stretch their averages
 * across the full ramp so differences inside one region stay visible.
 */
export interface MapGroupSummary {
  id: string;
  name: string;
  center: [longitude: number, latitude: number];
  averageOpportunityScore: number;
  zipCount: number;
  color: string;
}

export interface MapGroupLayer {
  key: MapGroupKey;
  groups: readonly MapGroupSummary[];
}

export function buildRegionGroupLayer(regions: readonly RegionSummary[]): MapGroupLayer {
  return {
    key: 'territoryId',
    groups: regions.map((region, index) => ({
      id: region.territoryId,
      name: region.name,
      center: region.center,
      averageOpportunityScore: region.averageOpportunityScore,
      zipCount: region.zipCount,
      color: regionColorForIndex(index),
    })),
  };
}

const HEAT_RAMP_MINIMUM = 35;
const HEAT_RAMP_MAXIMUM = 100;

export function buildCountyGroupLayer(counties: readonly CountySummary[]): MapGroupLayer {
  let minimum = Infinity;
  let maximum = -Infinity;
  for (const county of counties) {
    minimum = Math.min(minimum, county.averageOpportunityScore);
    maximum = Math.max(maximum, county.averageOpportunityScore);
  }
  const span = maximum - minimum;

  return {
    key: 'countyId',
    groups: counties.map((county) => {
      const normalized = span === 0 ? 0.5 : (county.averageOpportunityScore - minimum) / span;
      return {
        id: county.countyId,
        name: county.name,
        center: county.center,
        averageOpportunityScore: county.averageOpportunityScore,
        zipCount: county.zipCount,
        color: opportunityColorForScore(
          HEAT_RAMP_MINIMUM + normalized * (HEAT_RAMP_MAXIMUM - HEAT_RAMP_MINIMUM),
        ),
      };
    }),
  };
}
