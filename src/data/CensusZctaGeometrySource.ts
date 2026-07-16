import {
  normalizeZipGeometry,
  type RawZipGeometry,
  type ZipGeometrySource,
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

export class CensusZctaGeometrySource implements ZipGeometrySource {
  async load(zips: readonly string[] | Promise<readonly string[]>): Promise<RawZipGeometry> {
    const requestedZips = await zips;
    const response = await fetch(buildCensusZctaQueryUrl(requestedZips));
    if (!response.ok) {
      throw new Error(
        `Unable to load official Census ZCTA geometry: ${response.status} ${response.statusText}`,
      );
    }

    const geometry: unknown = await response.json();
    return normalizeZipGeometry(geometry, requestedZips, 'Census ZCTA service');
  }
}
