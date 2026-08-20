import { describe, expect, it } from 'vitest';
import {
  assertMarketManifest,
  assertMarketManifestEntry,
  buildPackageMetadata,
  findManifestEntry,
  type MarketManifest,
  type MarketManifestEntry,
} from './marketPackage';

const validEntry: MarketManifestEntry = {
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

const validManifest: MarketManifest = {
  manifestVersion: '1.0.0',
  generatedAt: '2026-08-20T00:00:00Z',
  defaultMarketId: 'ohio',
  markets: [validEntry],
};

describe('market manifest entry validation', () => {
  it('accepts a valid entry', () => {
    expect(() => assertMarketManifestEntry(validEntry)).not.toThrow();
  });

  it('accepts validated data mode', () => {
    expect(() =>
      assertMarketManifestEntry({ ...validEntry, dataMode: 'validated' }),
    ).not.toThrow();
  });

  it('accepts all validation statuses', () => {
    for (const status of ['unvalidated', 'provisional', 'validated']) {
      expect(() =>
        assertMarketManifestEntry({ ...validEntry, validationStatus: status }),
      ).not.toThrow();
    }
  });

  it('rejects invalid marketId format', () => {
    expect(() =>
      assertMarketManifestEntry({ ...validEntry, marketId: 'OHIO' }),
    ).toThrow('Invalid marketId format');
  });

  it('rejects missing name', () => {
    expect(() => assertMarketManifestEntry({ ...validEntry, name: '' })).toThrow(
      'non-empty string',
    );
  });

  it('rejects invalid data mode', () => {
    expect(() =>
      assertMarketManifestEntry({ ...validEntry, dataMode: 'live' }),
    ).toThrow('Invalid dataMode');
  });

  it('rejects zero zip count', () => {
    expect(() =>
      assertMarketManifestEntry({ ...validEntry, zipCount: 0 }),
    ).toThrow('positive number');
  });

  it('rejects invalid validation status', () => {
    expect(() =>
      assertMarketManifestEntry({ ...validEntry, validationStatus: 'approved' }),
    ).toThrow('Invalid validationStatus');
  });

  it('rejects missing paths', () => {
    expect(() =>
      assertMarketManifestEntry({ ...validEntry, paths: null }),
    ).toThrow('paths must be an object');
  });

  it('rejects malformed bounds', () => {
    expect(() =>
      assertMarketManifestEntry({ ...validEntry, bounds: [1, 2] }),
    ).toThrow('bounds');
  });
});

describe('market manifest validation', () => {
  it('accepts a valid manifest', () => {
    expect(() => assertMarketManifest(validManifest)).not.toThrow();
  });

  it('rejects empty markets array', () => {
    expect(() =>
      assertMarketManifest({ ...validManifest, markets: [] }),
    ).toThrow('at least one market');
  });

  it('rejects duplicate market IDs', () => {
    expect(() =>
      assertMarketManifest({ ...validManifest, markets: [validEntry, validEntry] }),
    ).toThrow('Duplicate market id');
  });

  it('rejects a default market not in the list', () => {
    expect(() =>
      assertMarketManifest({ ...validManifest, defaultMarketId: 'charlotte' }),
    ).toThrow('not listed in the manifest');
  });

  it('accepts multi-market manifests', () => {
    const charlotte: MarketManifestEntry = {
      ...validEntry,
      marketId: 'charlotte',
      name: 'Charlotte DMA',
      subtitle: 'Charlotte pilot market',
      dataMode: 'validated',
      validationStatus: 'provisional',
      paths: {
        opportunities: 'data/charlotte-opportunities.json',
        overlays: 'data/charlotte-overlays.json',
        geometry: 'data/charlotte-zcta-2023.geojson',
      },
    };
    const multi = { ...validManifest, markets: [validEntry, charlotte] };
    expect(() => assertMarketManifest(multi)).not.toThrow();
  });
});

describe('findManifestEntry', () => {
  it('returns the matching entry', () => {
    expect(findManifestEntry(validManifest, 'ohio')?.name).toBe(
      'Ohio Opportunity Network',
    );
  });

  it('returns null for unknown market', () => {
    expect(findManifestEntry(validManifest, 'charlotte')).toBeNull();
  });
});

describe('buildPackageMetadata', () => {
  it('produces demo metadata for a demo entry', () => {
    const meta = buildPackageMetadata(validEntry, validManifest.generatedAt);
    expect(meta.dataMode).toBe('demo');
    expect(meta.packageVersion).toBe('1.0.0');
    expect(meta.validationStatus).toBe('unvalidated');
    expect(meta.sourceLabel).toContain('synthetic');
  });

  it('produces validated metadata for a validated entry', () => {
    const validated = { ...validEntry, dataMode: 'validated' as const };
    const meta = buildPackageMetadata(validated, validManifest.generatedAt);
    expect(meta.dataMode).toBe('validated');
    expect(meta.sourceLabel).toContain('Validated');
  });

  it('carries the manifest generation timestamp', () => {
    const meta = buildPackageMetadata(validEntry, '2026-09-01T12:00:00Z');
    expect(meta.generatedAt).toBe('2026-09-01T12:00:00Z');
  });
});
