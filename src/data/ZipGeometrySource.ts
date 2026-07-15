import type { FeatureCollection, Geometry } from 'geojson';

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
