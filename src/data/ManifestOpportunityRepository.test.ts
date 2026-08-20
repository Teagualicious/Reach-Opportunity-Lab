import type { FeatureCollection, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import type { MarketManifest, MarketManifestEntry } from '../domain/marketPackage';
import { buildPackageMetadata, findManifestEntry } from '../domain/marketPackage';
import type { ZipOpportunity } from '../domain/opportunity';

const opportunity: ZipOpportunity = {
  zip: '44122',
  name: 'Beachwood',
  score: 84,
  confidence: 'High',
  components: {
    audiencePotential: 22,
    reachGap: 18,
    searchOpportunity: 12,
    geographicPotential: 13,
    categoryPotential: 11,
    competitiveConditions: 8,
  },
  householdCount: 15800,
  medianIncome: 112400,
  categoryStrength: 'Automotive',
  topDriver: 'audiencePotential',
  topLimiter: 'competitiveConditions',
  summary: 'Strong audience fit and a meaningful reach gap.',
};

const geometry: FeatureCollection<Polygon, { zip: string }> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { zip: '44122' },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-81.6, 41.4], [-81.5, 41.4], [-81.5, 41.5], [-81.6, 41.4]]],
      },
    },
  ],
};

const ohioEntry: MarketManifestEntry = {
  marketId: 'ohio',
  name: 'Ohio Opportunity Network',
  subtitle: 'Statewide Ohio market',
  dataMode: 'demo',
  packageVersion: '1.0.0',
  geographyVintage: '2020 ZCTA',
  center: [-82.5, 40.2],
  bounds: [-84.82, 38.4, -80.52, 42.0],
  zipCount: 1233,
  territoryCount: 7,
  validationStatus: 'unvalidated',
  asOfDate: '2026-08-20',
  paths: {
    opportunities: 'data/ohio-opportunities.json',
    overlays: 'data/market-overlays.json',
    geometry: 'data/ohio-zcta-2020.geojson',
  },
};

const manifest: MarketManifest = {
  manifestVersion: '1.0.0',
  generatedAt: '2026-08-20T00:00:00Z',
  defaultMarketId: 'ohio',
  markets: [ohioEntry],
};

describe('manifest-driven repository contract', () => {
  it('resolves the default market from the manifest', () => {
    const entry = findManifestEntry(manifest, manifest.defaultMarketId);
    expect(entry).not.toBeNull();
    expect(entry!.marketId).toBe('ohio');
  });

  it('rejects unknown market IDs', () => {
    const entry = findManifestEntry(manifest, 'charlotte');
    expect(entry).toBeNull();
  });

  it('builds metadata from a manifest entry', () => {
    const entry = findManifestEntry(manifest, 'ohio')!;
    const metadata = buildPackageMetadata(entry, manifest.generatedAt);
    expect(metadata.dataMode).toBe('demo');
    expect(metadata.packageVersion).toBe('1.0.0');
    expect(metadata.validationStatus).toBe('unvalidated');
    expect(metadata.geographyVintage).toBe('2020 ZCTA');
    expect(metadata.asOfDate).toBe('2026-08-20');
    expect(metadata.generatedAt).toBe('2026-08-20T00:00:00Z');
  });

  it('produces validated metadata for validated markets', () => {
    const charlotteEntry: MarketManifestEntry = {
      ...ohioEntry,
      marketId: 'charlotte',
      name: 'Charlotte DMA',
      dataMode: 'validated',
      validationStatus: 'provisional',
    };
    const multiManifest: MarketManifest = {
      ...manifest,
      markets: [ohioEntry, charlotteEntry],
    };

    const entry = findManifestEntry(multiManifest, 'charlotte')!;
    const metadata = buildPackageMetadata(entry, multiManifest.generatedAt);
    expect(metadata.dataMode).toBe('validated');
    expect(metadata.validationStatus).toBe('provisional');
    expect(metadata.sourceLabel).toContain('Validated');
  });

  it('uses manifest paths to derive geometry metadata', () => {
    const entry = findManifestEntry(manifest, 'ohio')!;
    expect(entry.paths.opportunities).toBe('data/ohio-opportunities.json');
    expect(entry.paths.overlays).toBe('data/market-overlays.json');
    expect(entry.paths.geometry).toBe('data/ohio-zcta-2020.geojson');
  });
});

describe('multi-market manifest support', () => {
  const charlotteEntry: MarketManifestEntry = {
    ...ohioEntry,
    marketId: 'charlotte',
    name: 'Charlotte DMA',
    subtitle: 'Charlotte pilot market',
    dataMode: 'validated',
    packageVersion: '0.1.0',
    geographyVintage: '2023 ZCTA',
    validationStatus: 'provisional',
    paths: {
      opportunities: 'data/charlotte-opportunities.json',
      overlays: 'data/charlotte-overlays.json',
      geometry: 'data/charlotte-zcta-2023.geojson',
    },
  };

  const multiManifest: MarketManifest = {
    ...manifest,
    markets: [ohioEntry, charlotteEntry],
  };

  it('resolves each market independently', () => {
    const ohio = findManifestEntry(multiManifest, 'ohio');
    const charlotte = findManifestEntry(multiManifest, 'charlotte');
    expect(ohio?.name).toBe('Ohio Opportunity Network');
    expect(charlotte?.name).toBe('Charlotte DMA');
  });

  it('distinguishes data modes across markets', () => {
    const ohio = findManifestEntry(multiManifest, 'ohio')!;
    const charlotte = findManifestEntry(multiManifest, 'charlotte')!;
    expect(ohio.dataMode).toBe('demo');
    expect(charlotte.dataMode).toBe('validated');
  });

  it('separates geography vintages', () => {
    const ohio = findManifestEntry(multiManifest, 'ohio')!;
    const charlotte = findManifestEntry(multiManifest, 'charlotte')!;
    expect(ohio.geographyVintage).toBe('2020 ZCTA');
    expect(charlotte.geographyVintage).toBe('2023 ZCTA');
  });
});
