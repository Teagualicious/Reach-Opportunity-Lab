import { normalizeZipGeometry, type RawZipGeometry, type ZipGeometrySource } from './ZipGeometrySource';

export const DEFAULT_STATIC_ZCTA_URL = '/data/cleveland-akron-zcta-2020.geojson';

export class StaticZctaGeometrySource implements ZipGeometrySource {
  constructor(private readonly url = DEFAULT_STATIC_ZCTA_URL) {}

  async load(zips: readonly string[]): Promise<RawZipGeometry> {
    const response = await fetch(this.url);
    if (!response.ok) {
      throw new Error(
        `Unable to load checked-in Census-derived ZCTA geometry: ${response.status} ${response.statusText}`,
      );
    }

    const geometry: unknown = await response.json();
    return normalizeZipGeometry(geometry, zips, 'Checked-in Census-derived ZCTA fixture');
  }
}
