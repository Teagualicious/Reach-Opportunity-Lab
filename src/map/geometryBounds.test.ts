import type { MultiPolygon, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import { getGeometryBounds } from './geometryBounds';

describe('geometry viewport bounds', () => {
  it('calculates polygon bounds', () => {
    const polygon: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-82.1, 39.8],
          [-81.7, 39.8],
          [-81.7, 40.2],
          [-82.1, 40.2],
          [-82.1, 39.8],
        ],
      ],
    };

    expect(getGeometryBounds(polygon)).toEqual([-82.1, 39.8, -81.7, 40.2]);
  });

  it('combines all multipolygon parts', () => {
    const multiPolygon: MultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [[[-82.4, 40.1], [-82.2, 40.1], [-82.2, 40.3], [-82.4, 40.1]]],
        [[[-81.9, 39.7], [-81.6, 39.7], [-81.6, 40], [-81.9, 39.7]]],
      ],
    };

    expect(getGeometryBounds(multiPolygon)).toEqual([-82.4, 39.7, -81.6, 40.3]);
  });
});
