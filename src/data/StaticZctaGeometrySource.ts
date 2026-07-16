import { publicAssetUrl } from './publicAssetUrl';
import { normalizeZipGeometry, type RawZipGeometry, type ZipGeometrySource } from './ZipGeometrySource';

export const DEFAULT_STATIC_ZCTA_PATH = 'data/ohio-zcta-2020.geojson';

export class StaticZctaGeometrySource implements ZipGeometrySource {
  constructor(private readonly path = DEFAULT_STATIC_ZCTA_PATH) {}

  async load(zips: readonly string[] | Promise<readonly string[]>): Promise<RawZipGeometry> {
    const url = publicAssetUrl(this.path);
    const responsePromise = fetch(url);
    // If the ZIP list rejects first, the in-flight fetch must not surface as an
    // unhandled rejection.
    responsePromise.catch(() => undefined);

    const requestedZips = await zips;
    const response = await responsePromise;
    if (!response.ok) {
      throw new Error(
        `Unable to load checked-in Census-derived ZCTA geometry: ${response.status} ${response.statusText}`,
      );
    }

    const geometry: unknown = await response.json();
    return normalizeZipGeometry(geometry, requestedZips, 'Checked-in statewide Ohio ZCTA fixture');
  }
}
