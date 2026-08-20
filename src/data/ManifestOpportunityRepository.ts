import {
  buildPackageMetadata,
  findManifestEntry,
  type MarketManifest,
} from '../domain/marketPackage';
import { buildOpportunityMarket, type DemoMarketPayload } from './DemoOpportunityRepository';
import type { GeometryMetadata, OpportunityMarket, OpportunityRepository } from './OpportunityRepository';
import { publicAssetUrl } from './publicAssetUrl';
import { StaticZctaGeometrySource } from './StaticZctaGeometrySource';

async function readJson<T>(path: string): Promise<T> {
  const url = publicAssetUrl(path);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load ${url}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export class ManifestOpportunityRepository implements OpportunityRepository {
  constructor(private readonly manifest: MarketManifest) {}

  async loadMarket(marketId: string): Promise<OpportunityMarket> {
    const entry = findManifestEntry(this.manifest, marketId);
    if (!entry) {
      const available = this.manifest.markets.map((m) => m.marketId).join(', ');
      throw new Error(
        `Market "${marketId}" not found in manifest. Available: ${available}`,
      );
    }

    const geometrySource = new StaticZctaGeometrySource(entry.paths.geometry);

    const payloadPromise = readJson<DemoMarketPayload>(entry.paths.opportunities);
    const zipsPromise = payloadPromise.then((payload) =>
      payload.opportunities.map((o) => o.zip),
    );
    const [payload, rawOverlays, geometry] = await Promise.all([
      payloadPromise,
      readJson<unknown>(entry.paths.overlays),
      geometrySource.load(zipsPromise),
    ]);

    const geometryMetadata: GeometryMetadata = {
      kind: 'official-zcta',
      label: `${entry.geographyVintage} Census-derived ZCTA boundaries`,
      source: `Market package ${entry.packageVersion}`,
      vintage: entry.geographyVintage,
    };

    const metadata = buildPackageMetadata(entry, this.manifest.generatedAt);

    return buildOpportunityMarket(payload, geometry, geometryMetadata, rawOverlays, metadata);
  }
}
