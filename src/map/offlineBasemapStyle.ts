import type { FeatureCollection, Geometry, Point } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';

export const OFFLINE_MAP_CONTEXT_URL = '/data/offline-map-context.geojson';

export interface OfflineMapContextProperties {
  kind: 'county' | 'road' | 'water-area' | 'water-line' | 'place-label';
  class?: 'primary' | 'secondary';
  name?: string;
  labelTone?: 'place' | 'water';
}

export type OfflineMapContext = FeatureCollection<Geometry, OfflineMapContextProperties>;

export interface OfflinePlaceLabel {
  coordinates: [longitude: number, latitude: number];
  name: string;
  tone: 'place' | 'water';
}

export function createOfflineBasemapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      'offline-census-context': {
        type: 'geojson',
        data: OFFLINE_MAP_CONTEXT_URL,
        attribution: 'Geographic context: U.S. Census Bureau TIGER/Line',
      },
    },
    layers: [
      {
        id: 'offline-background',
        type: 'background',
        paint: { 'background-color': '#edf1f4' },
      },
      {
        id: 'offline-water-areas',
        type: 'fill',
        source: 'offline-census-context',
        filter: ['==', ['get', 'kind'], 'water-area'],
        paint: {
          'fill-color': '#c9e4f2',
          'fill-opacity': 0.9,
        },
      },
      {
        id: 'offline-county-boundaries',
        type: 'line',
        source: 'offline-census-context',
        filter: ['==', ['get', 'kind'], 'county'],
        paint: {
          'line-color': '#b9c4ce',
          'line-width': 1,
          'line-dasharray': [3, 2],
        },
      },
      {
        id: 'offline-secondary-road-casing',
        type: 'line',
        source: 'offline-census-context',
        filter: [
          'all',
          ['==', ['get', 'kind'], 'road'],
          ['==', ['get', 'class'], 'secondary'],
        ],
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1.5, 12, 4],
          'line-opacity': 0.86,
        },
      },
      {
        id: 'offline-secondary-roads',
        type: 'line',
        source: 'offline-census-context',
        filter: [
          'all',
          ['==', ['get', 'kind'], 'road'],
          ['==', ['get', 'class'], 'secondary'],
        ],
        paint: {
          'line-color': '#b6c0c9',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.55, 12, 1.65],
          'line-opacity': 0.9,
        },
      },
      {
        id: 'offline-primary-road-casing',
        type: 'line',
        source: 'offline-census-context',
        filter: [
          'all',
          ['==', ['get', 'kind'], 'road'],
          ['==', ['get', 'class'], 'primary'],
        ],
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 2.5, 12, 6.5],
          'line-opacity': 0.94,
        },
      },
      {
        id: 'offline-primary-roads',
        type: 'line',
        source: 'offline-census-context',
        filter: [
          'all',
          ['==', ['get', 'kind'], 'road'],
          ['==', ['get', 'class'], 'primary'],
        ],
        paint: {
          'line-color': '#7d8995',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1.15, 12, 3.2],
          'line-opacity': 0.94,
        },
      },
      {
        id: 'offline-water-lines',
        type: 'line',
        source: 'offline-census-context',
        filter: ['==', ['get', 'kind'], 'water-line'],
        paint: {
          'line-color': '#89bdd8',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.45, 12, 1.5],
          'line-opacity': 0.75,
        },
      },
      {
        id: 'offline-place-points',
        type: 'circle',
        source: 'offline-census-context',
        filter: ['==', ['get', 'kind'], 'place-label'],
        paint: {
          'circle-color': '#64748b',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 1.5, 12, 3.5],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          'circle-opacity': 0.8,
        },
      },
    ],
  };
}

export async function loadOfflinePlaceLabels(): Promise<OfflinePlaceLabel[]> {
  const response = await fetch(OFFLINE_MAP_CONTEXT_URL);
  if (!response.ok) {
    throw new Error(`Unable to load offline map context: ${response.status} ${response.statusText}`);
  }

  const context = (await response.json()) as OfflineMapContext;
  if (context.type !== 'FeatureCollection' || !Array.isArray(context.features)) {
    throw new Error('Offline map context returned an unexpected response');
  }

  return context.features.flatMap((feature) => {
    if (
      feature.properties.kind !== 'place-label' ||
      feature.geometry.type !== 'Point' ||
      typeof feature.properties.name !== 'string'
    ) {
      return [];
    }

    const point = feature.geometry as Point;
    return [
      {
        coordinates: point.coordinates as [number, number],
        name: feature.properties.name,
        tone: feature.properties.labelTone === 'water' ? 'water' : 'place',
      },
    ];
  });
}
