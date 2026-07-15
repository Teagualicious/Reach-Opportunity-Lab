import type { Feature, Geometry } from 'geojson';
import type {
  RawZipGeometry,
  RawZipGeometryProperties,
  ZipGeometrySource,
} from './ZipGeometrySource';

export const CENSUS_ZCTA_QUERY_ENDPOINT =
  'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2/query';

function quoteSqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function buildCensusZctaQueryUrl(zips: readonly string[]): string {
  if (zips.length === 0) {
    throw new Error('At least one ZIP is required to request Census ZCTA geometry');
  }

  const invalidZip = zips.find((zip) => !/^\d{5}$/.test(zip));
  if (invalidZip) {
    throw new Error(`Invalid ZIP identifier in Census geometry request: ${invalidZip}`);
  }

  const params = new URLSearchParams({
    where: `ZCTA5 IN (${zips.map(quoteSqlString).join(',')})`,
    outFields: 'ZCTA5,GEOID,BASENAME,NAME',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'geojson',
  });

  return `${CENSUS_ZCTA_QUERY_ENDPOINT}?${params.toString()}`;
}

function normalizeFeature(feature: Feature<Geometry, RawZipGeometryProperties>, index: number) {
  const candidate = feature.properties?.ZCTA5 ?? feature.properties?.GEOID ?? feature.properties?.zip;
  const zip = typeof candidate === 'string' ? candidate : null;
  if (!zip || !/^\d{5}$/.test(zip)) {
    throw new Error(`Census geometry feature ${index} does not contain a valid ZCTA identifier`);
  }

  return {
    ...feature,
    id: zip,
    properties: {
      zip,
      ZCTA5: zip,
      GEOID: zip,
      BASENAME: feature.properties?.BASENAME,
      NAME: feature.properties?.NAME,
    },
  };
}

export class CensusZctaGeometrySource implements ZipGeometrySource {
  async load(zips: readonly string[]): Promise<RawZipGeometry> {
    const response = await fetch(buildCensusZctaQueryUrl(zips));
    if (!response.ok) {
      throw new Error(
        `Unable to load official Census ZCTA geometry: ${response.status} ${response.statusText}`,
      );
    }

    const geometry = (await response.json()) as RawZipGeometry;
    if (geometry.type !== 'FeatureCollection' || !Array.isArray(geometry.features)) {
      throw new Error('Census ZCTA service returned an unexpected response');
    }

    const normalizedFeatures = geometry.features.map(normalizeFeature);
    const returnedZips = new Set(normalizedFeatures.map((feature) => feature.properties.zip));
    const missingZips = zips.filter((zip) => !returnedZips.has(zip));
    if (missingZips.length > 0) {
      throw new Error(`Census ZCTA geometry is missing ZIPs: ${missingZips.join(', ')}`);
    }

    return {
      type: 'FeatureCollection',
      features: normalizedFeatures,
    };
  }
}
