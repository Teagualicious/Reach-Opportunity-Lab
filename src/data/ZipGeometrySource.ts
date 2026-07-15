import type { Feature, FeatureCollection, Geometry } from 'geojson';

export interface RawZipGeometryProperties {
  zip?: unknown;
  ZCTA5?: unknown;
  GEOID?: unknown;
  BASENAME?: unknown;
  NAME?: unknown;
}

export type RawZipGeometry = FeatureCollection<Geometry, RawZipGeometryProperties>;

export interface ZipGeometrySource {
  load(zips: readonly string[]): Promise<RawZipGeometry>;
}

const ZIP_PATTERN = /^\d{5}$/;

function assertRequestedZips(zips: readonly string[]) {
  if (zips.length === 0) {
    throw new Error('At least one ZIP is required to load ZCTA geometry');
  }

  const invalidZip = zips.find((zip) => !ZIP_PATTERN.test(zip));
  if (invalidZip) {
    throw new Error(`Invalid ZIP identifier in geometry request: ${invalidZip}`);
  }

  if (new Set(zips).size !== zips.length) {
    throw new Error('Geometry request contains duplicate ZIP identifiers');
  }
}

function getFeatureZip(feature: Feature<Geometry, RawZipGeometryProperties>, index: number): string {
  const candidate = feature.properties?.zip ?? feature.properties?.ZCTA5 ?? feature.properties?.GEOID;
  const zip = typeof candidate === 'string' ? candidate : null;
  if (!zip || !ZIP_PATTERN.test(zip)) {
    throw new Error(`Geometry feature ${index} does not contain a valid ZCTA identifier`);
  }
  return zip;
}

export function normalizeZipGeometry(
  value: unknown,
  requestedZips: readonly string[],
  sourceLabel: string,
): RawZipGeometry {
  assertRequestedZips(requestedZips);

  if (
    !value ||
    typeof value !== 'object' ||
    (value as { type?: unknown }).type !== 'FeatureCollection' ||
    !Array.isArray((value as { features?: unknown }).features)
  ) {
    throw new Error(`${sourceLabel} returned an unexpected response`);
  }

  const source = value as RawZipGeometry;
  const requestedSet = new Set(requestedZips);
  const featuresByZip = new Map<string, Feature<Geometry, RawZipGeometryProperties>>();

  for (const [index, feature] of source.features.entries()) {
    const zip = getFeatureZip(feature, index);
    if (!requestedSet.has(zip)) continue;
    if (featuresByZip.has(zip)) {
      throw new Error(`${sourceLabel} contains duplicate geometry for ZIP ${zip}`);
    }

    featuresByZip.set(zip, {
      ...feature,
      id: zip,
      properties: {
        zip,
        ZCTA5: zip,
        GEOID: zip,
        BASENAME: feature.properties?.BASENAME,
        NAME: feature.properties?.NAME,
      },
    });
  }

  const missingZips = requestedZips.filter((zip) => !featuresByZip.has(zip));
  if (missingZips.length > 0) {
    throw new Error(`${sourceLabel} is missing ZIPs: ${missingZips.join(', ')}`);
  }

  return {
    type: 'FeatureCollection',
    features: requestedZips.map((zip) => featuresByZip.get(zip)!),
  };
}
