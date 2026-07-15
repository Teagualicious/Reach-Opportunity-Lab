import { describe, expect, it } from 'vitest';
import { buildCensusZctaQueryUrl, CENSUS_ZCTA_QUERY_ENDPOINT } from './CensusZctaGeometrySource';
describe('Census ZCTA source', () => {
  it('builds an exact GeoJSON request', () => { const url=new URL(buildCensusZctaQueryUrl(['44122','44308'])); expect(`${url.origin}${url.pathname}`).toBe(CENSUS_ZCTA_QUERY_ENDPOINT); expect(url.searchParams.get('f')).toBe('geojson'); expect(url.searchParams.get('outSR')).toBe('4326'); expect(url.searchParams.get('where')).toBe("ZCTA5 IN ('44122','44308')"); });
  it('rejects invalid ZIPs', () => { expect(() => buildCensusZctaQueryUrl(['4412'])).toThrow('Invalid ZIP identifier'); });
});
