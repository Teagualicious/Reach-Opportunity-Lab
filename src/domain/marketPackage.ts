export type DataMode = 'demo' | 'validated';

export type ValidationStatus = 'unvalidated' | 'provisional' | 'validated';

export interface PackageMetadata {
  readonly packageVersion: string;
  readonly dataMode: DataMode;
  readonly asOfDate: string;
  readonly generatedAt: string;
  readonly validationStatus: ValidationStatus;
  readonly geographyVintage: string;
  readonly sourceLabel: string;
}

export interface MarketPackagePaths {
  readonly opportunities: string;
  readonly overlays: string;
  readonly geometry: string;
}

export interface MarketManifestEntry {
  readonly marketId: string;
  readonly name: string;
  readonly subtitle: string;
  readonly dataMode: DataMode;
  readonly packageVersion: string;
  readonly geographyVintage: string;
  readonly center: readonly [number, number];
  readonly bounds: readonly [number, number, number, number];
  readonly zipCount: number;
  readonly territoryCount: number;
  readonly validationStatus: ValidationStatus;
  readonly asOfDate: string;
  readonly paths: MarketPackagePaths;
}

export interface MarketManifest {
  readonly manifestVersion: string;
  readonly generatedAt: string;
  readonly defaultMarketId: string;
  readonly markets: readonly MarketManifestEntry[];
}

export interface ScoreMetadata {
  readonly modelVersion: string;
  readonly modelDate: string;
  readonly confidenceBasis: string;
  readonly coverageRate: number;
  readonly validationStatus: ValidationStatus;
}

const VALID_DATA_MODES: readonly string[] = ['demo', 'validated'];
const VALID_VALIDATION_STATUSES: readonly string[] = ['unvalidated', 'provisional', 'validated'];

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
}

function assertPaths(value: unknown): asserts value is MarketPackagePaths {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Market entry paths must be an object');
  }
  const paths = value as Record<string, unknown>;
  assertString(paths.opportunities, 'paths.opportunities');
  assertString(paths.overlays, 'paths.overlays');
  assertString(paths.geometry, 'paths.geometry');
}

export function assertMarketManifestEntry(value: unknown): asserts value is MarketManifestEntry {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Market manifest entry must be an object');
  }
  const entry = value as Record<string, unknown>;
  assertString(entry.marketId, 'marketId');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.marketId as string)) {
    throw new Error(`Invalid marketId format: ${entry.marketId}`);
  }
  assertString(entry.name, 'name');
  assertString(entry.subtitle, 'subtitle');
  if (!VALID_DATA_MODES.includes(entry.dataMode as string)) {
    throw new Error(`Invalid dataMode: ${entry.dataMode}`);
  }
  assertString(entry.packageVersion, 'packageVersion');
  assertString(entry.geographyVintage, 'geographyVintage');
  if (!Array.isArray(entry.center) || entry.center.length !== 2) {
    throw new Error('center must be a [longitude, latitude] pair');
  }
  if (!Array.isArray(entry.bounds) || entry.bounds.length !== 4) {
    throw new Error('bounds must be a [west, south, east, north] tuple');
  }
  if (typeof entry.zipCount !== 'number' || entry.zipCount < 1) {
    throw new Error('zipCount must be a positive number');
  }
  if (typeof entry.territoryCount !== 'number' || entry.territoryCount < 0) {
    throw new Error('territoryCount must be a non-negative number');
  }
  if (!VALID_VALIDATION_STATUSES.includes(entry.validationStatus as string)) {
    throw new Error(`Invalid validationStatus: ${entry.validationStatus}`);
  }
  assertString(entry.asOfDate, 'asOfDate');
  assertPaths(entry.paths);
}

export function assertMarketManifest(value: unknown): asserts value is MarketManifest {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Market manifest must be an object');
  }
  const manifest = value as Record<string, unknown>;
  assertString(manifest.manifestVersion, 'manifestVersion');
  assertString(manifest.generatedAt, 'generatedAt');
  assertString(manifest.defaultMarketId, 'defaultMarketId');
  if (!Array.isArray(manifest.markets) || manifest.markets.length === 0) {
    throw new Error('Manifest must contain at least one market');
  }
  const ids = new Set<string>();
  for (const entry of manifest.markets) {
    assertMarketManifestEntry(entry);
    if (ids.has((entry as MarketManifestEntry).marketId)) {
      throw new Error(`Duplicate market id: ${(entry as MarketManifestEntry).marketId}`);
    }
    ids.add((entry as MarketManifestEntry).marketId);
  }
  if (!ids.has(manifest.defaultMarketId as string)) {
    throw new Error(
      `Default market "${manifest.defaultMarketId}" is not listed in the manifest`,
    );
  }
}

export function findManifestEntry(
  manifest: MarketManifest,
  marketId: string,
): MarketManifestEntry | null {
  return manifest.markets.find((entry) => entry.marketId === marketId) ?? null;
}

export function buildPackageMetadata(
  entry: MarketManifestEntry,
  manifestGeneratedAt: string,
): PackageMetadata {
  return {
    packageVersion: entry.packageVersion,
    dataMode: entry.dataMode,
    asOfDate: entry.asOfDate,
    generatedAt: manifestGeneratedAt,
    validationStatus: entry.validationStatus,
    geographyVintage: entry.geographyVintage,
    sourceLabel:
      entry.dataMode === 'demo'
        ? 'Deterministic synthetic demonstration data'
        : `Validated ${entry.name} market package`,
  };
}
