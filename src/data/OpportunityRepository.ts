import type { FeatureCollection, Geometry } from 'geojson';
import type { MarketOverlayData } from '../domain/mapOverlay';
import type { ZipOpportunity } from '../domain/opportunity';

export interface MarketDefinition {
  id: string;
  name: string;
  subtitle: string;
  center: [longitude: number, latitude: number];
  bounds: [west: number, south: number, east: number, north: number];
}

export interface GeometryMetadata {
  kind: 'official-zcta' | 'synthetic-fallback';
  label: string;
  source: string;
  vintage: string;
}

export interface ZipFeatureProperties {
  zip: string;
  name: string;
  score: number;
  priority: string;
  confidence: string;
}

export interface OpportunityMarket {
  market: MarketDefinition;
  opportunities: ZipOpportunity[];
  geometry: FeatureCollection<Geometry, ZipFeatureProperties>;
  geometryMetadata: GeometryMetadata;
  overlays: MarketOverlayData;
}

export interface OpportunityRepository {
  loadMarket(marketId: string): Promise<OpportunityMarket>;
}
