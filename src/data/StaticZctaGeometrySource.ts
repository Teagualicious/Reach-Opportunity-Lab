import { publicAssetUrl } from './publicAssetUrl';
import { normalizeZipGeometry, type RawZipGeometry, type ZipGeometrySource } from './ZipGeometrySource';

export const DEFAULT_STATIC_ZCTA_PATH = 'data/cleveland-akron-zcta-2020.geojson';

export class StaticZctaGeometrySource implements ZipGeometrySource {
  constructor(private readonly path = DEFAULT_STATIC_ZCTA_PATH) {}

  async load(zips: readonly string[]): Promise<RawZipGeometry> {
    const url = publicAssetUrl(this.path);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Unable to load checked-in Census-derived ZCTA geometry: ${response.status} ${response.statusText}`,
      );
    }

    const geometry: unknown = await response.json();
    return normalizeZipGeometry(geometry, zips, 'Checked-in Census-derived ZCTA fixture');
  }
}
