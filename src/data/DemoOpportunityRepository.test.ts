import type { FeatureCollection, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import type { MarketOverlayData } from '../domain/mapOverlay';
import type { ZipOpportunity } from '../domain/opportunity';
import { buildOpportunityMarket } from './DemoOpportunityRepository';

const opportunity: ZipOpportunity = {
  zip: '44122',
  name: 'Beachwood',
  score: 84,
  confidence: 'High',
  components: {
    audiencePotential: 22,
    reachGap: 18,
    searchOpportunity: 12,
    geographicPotential: 13,
    categoryPotential: 11,
    competitiveConditions: 8,
  },
  householdCount: 15800,
  medianIncome: 112400,
  categoryStrength: 'Automotive',
  topDriver: 'audiencePotential',
  topLimiter: 'competitiveConditions',
  summary: 'Strong audience fit and a meaningful reach gap.',
};

const geometry: FeatureCollection<Polygon, { zip: string }> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { zip: '44122' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-81.6, 41.4], [-81.5, 41.4], [-81.5, 41.5], [-81.6, 41.4]]],
      },
    },
  ],
};

const market = {
  id: 'cleveland-akron',
  name: 'Cleveland–Akron DMA',
  subtitle: 'Synthetic demonstration market',
  center: [-81.6, 41.35] as [number, number],
  bounds: [-82.3, 40.9, -81, 41.8] as [number, number, number, number],
};

const overlays: MarketOverlayData = {
  reachGapZips: ['44122'],
  competitors: [
    {
      id: 'example-provider',
      label: 'Example Provider',
      subtitle: 'Synthetic footprint',
      color: '#7c3aed',
      zips: ['44122'],
    },
  ],
};

describe('demo repository adapter', () => {
  it('joins opportunity records to geometry', () => {
    const result = buildOpportunityMarket({ market, opportunities: [opportunity] }, geometry);
    expect(result.geometryMetadata.kind).toBe('synthetic-fallback');
    expect(result.geometry.features[0]?.properties.score).toBe(84);
    expect(result.overlays.competitors).toEqual([]);
  });

  it('joins validated supporting overlays to the market', () => {
    const result = buildOpportunityMarket(
      { market, opportunities: [opportunity] },
      geometry,
      undefined,
      overlays,
    );

    expect(result.overlays.reachGapZips).toEqual(['44122']);
    expect(result.overlays.competitors[0]?.id).toBe('example-provider');
  });

  it('rejects unmatched geometry', () => {
    expect(() => buildOpportunityMarket({ market, opportunities: [] }, geometry)).toThrow(
      'Geometry has no opportunity record',
    );
  });
});
