import { afterEach, describe, expect, it, vi } from 'vitest';
import { StaticZctaGeometrySource } from './StaticZctaGeometrySource';

const fixture = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { zip: '44308' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-81.53, 41.08], [-81.51, 41.08], [-81.51, 41.09], [-81.53, 41.08]]],
      },
    },
    {
      type: 'Feature',
      properties: { ZCTA5: '44122' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-81.52, 41.46], [-81.49, 41.46], [-81.49, 41.49], [-81.52, 41.46]]],
      },
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Static ZCTA geometry source', () => {
  it('loads, normalizes, and orders requested ZIP geometry', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(fixture), {
        status: 200,
        headers: { 'Content-Type': 'application/geo+json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const source = new StaticZctaGeometrySource('/data/test-zcta.geojson');
    const geometry = await source.load(['44122', '44308']);

    expect(fetchMock).toHaveBeenCalledWith('/data/test-zcta.geojson');
    expect(geometry.features.map((feature) => feature.properties.zip)).toEqual(['44122', '44308']);
    expect(geometry.features[0]?.id).toBe('44122');
  });

  it('rejects a checked-in fixture that is missing a requested ZIP', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(fixture), {
          status: 200,
          headers: { 'Content-Type': 'application/geo+json' },
        }),
      ),
    );

    await expect(new StaticZctaGeometrySource().load(['44122', '44022'])).rejects.toThrow(
      'Checked-in Census-derived ZCTA fixture is missing ZIPs: 44022',
    );
  });
});
