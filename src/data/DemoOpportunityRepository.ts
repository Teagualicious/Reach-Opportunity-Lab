import type { FeatureCollection, Geometry } from 'geojson';
import {
  assertMarketOverlayData,
  EMPTY_MARKET_OVERLAYS,
  type MarketOverlayData,
} from '../domain/mapOverlay';
import { assertZipOpportunity, getPriorityBand, type ZipOpportunity } from '../domain/opportunity';
import type {
  GeometryMetadata,
  MarketDefinition,
  OpportunityMarket,
  OpportunityRepository,
  ZipFeatureProperties,
} from './OpportunityRepository';
import { publicAssetUrl } from './publicAssetUrl';
import { StaticZctaGeometrySource } from './StaticZctaGeometrySource';
import type { RawZipGeometry, ZipGeometrySource } from './ZipGeometrySource';

interface DemoMarketPayload {
  market: MarketDefinition;
  opportunities: ZipOpportunity[];
}

const CHECKED_IN_GEOMETRY_METADATA: GeometryMetadata = {
  kind: 'official-zcta',
  label: 'Checked-in 2020 Census-derived ZCTA boundaries',
  source: 'Simplified 2020 Census ZCTA fixture · see provenance file',
  vintage: '2020 Census',
};

const FALLBACK_GEOMETRY_METADATA: GeometryMetadata = {
  kind: 'synthetic-fallback',
  label: 'Synthetic geometry fallback',
  source: 'Opportunity Lab demonstration fixture',
  vintage: 'Demo only',
};

export function buildOpportunityMarket(
  payload: DemoMarketPayload,
  geometry: RawZipGeometry,
  geometryMetadata: GeometryMetadata = FALLBACK_GEOMETRY_METADATA,
  overlays: MarketOverlayData = EMPTY_MARKET_OVERLAYS,
): OpportunityMarket {
  const opportunitiesByZip = new Map<string, ZipOpportunity>();

  for (const opportunity of payload.opportunities) {
    assertZipOpportunity(opportunity);
    if (opportunitiesByZip.has(opportunity.zip)) {
      throw new Error(`Duplicate opportunity record for ZIP ${opportunity.zip}`);
    }
    opportunitiesByZip.set(opportunity.zip, opportunity);
  }

  assertMarketOverlayData(overlays, [...opportunitiesByZip.keys()]);

  const enrichedFeatures = geometry.features.map((feature, index) => {
    const rawZip = feature.properties?.zip ?? feature.properties?.ZCTA5 ?? feature.properties?.GEOID;
    const zip = typeof rawZip === 'string' ? rawZip : null;
    if (!zip) {
      throw new Error(`Geometry feature ${index} does not contain a ZIP identifier`);
    }

    const opportunity = opportunitiesByZip.get(zip);
    if (!opportunity) {
      throw new Error(`Geometry has no opportunity record for ZIP ${zip}`);
    }

    const properties: ZipFeatureProperties = {
      zip,
      name: opportunity.name,
      score: opportunity.score,
      priority: getPriorityBand(opportunity.score),
      confidence: opportunity.confidence,
    };

    return {
      ...feature,
      id: zip,
      properties,
    };
  });

  if (enrichedFeatures.length !== opportunitiesByZip.size) {
    throw new Error('Opportunity and geometry record counts do not match');
  }

  return {
    market: payload.market,
    opportunities: payload.opportunities,
    geometry: {
      type: 'FeatureCollection',
      features: enrichedFeatures,
    } as FeatureCollection<Geometry, ZipFeatureProperties>,
    geometryMetadata,
    overlays,
  };
}

async function readJson<T>(path: string): Promise<T> {
  const url = publicAssetUrl(path);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to load ${url}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export class DemoOpportunityRepository implements OpportunityRepository {
  constructor(private readonly geometrySource: ZipGeometrySource = new StaticZctaGeometrySource()) {}

  async loadMarket(marketId: string): Promise<OpportunityMarket> {
    if (marketId !== 'cleveland-akron') {
      throw new Error(`Unknown demonstration market: ${marketId}`);
    }

    const [payload, rawOverlays] = await Promise.all([
      readJson<DemoMarketPayload>('data/zip-opportunities.json'),
      readJson<unknown>('data/market-overlays.json'),
    ]);
    const zips = payload.opportunities.map((opportunity) => opportunity.zip);
    assertMarketOverlayData(rawOverlays, zips);

    try {
      const checkedInGeometry = await this.geometrySource.load(zips);
      return buildOpportunityMarket(
        payload,
        checkedInGeometry,
        CHECKED_IN_GEOMETRY_METADATA,
        rawOverlays,
      );
    } catch (checkedInGeometryError) {
      console.warn(
        'Checked-in Census-derived geometry unavailable; using the synthetic fallback.',
        checkedInGeometryError,
      );
      const fallbackGeometry = await readJson<RawZipGeometry>('data/cleveland-zips.geojson');
      return buildOpportunityMarket(payload, fallbackGeometry, FALLBACK_GEOMETRY_METADATA, rawOverlays);
    }
  }
}
