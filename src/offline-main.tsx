import type { Point } from 'geojson';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import maplibregl, { type MapOptions } from 'maplibre-gl';
import { App } from './app/App';
import {
  createOfflineBasemapStyle,
  loadOfflinePlaceLabels,
  OFFLINE_MAP_CONTEXT_URL,
  type OfflineMapContext,
  type OfflinePlaceLabel,
} from './map/offlineBasemapStyle';
import '@fontsource-variable/inter/opsz.css';
import './styles/index.css';

const OriginalMap = maplibregl.Map;

interface OfflineReviewWindow extends Window {
  __OPPORTUNITY_LAB_OFFLINE_DATA__?: Record<string, unknown>;
}

function getEmbeddedOfflineContext(): OfflineMapContext | null {
  const value = (window as OfflineReviewWindow).__OPPORTUNITY_LAB_OFFLINE_DATA__?.[
    OFFLINE_MAP_CONTEXT_URL
  ];
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<OfflineMapContext>;
  return candidate.type === 'FeatureCollection' && Array.isArray(candidate.features)
    ? (value as OfflineMapContext)
    : null;
}

function placeLabelsFromContext(context: OfflineMapContext): OfflinePlaceLabel[] {
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

function createLabelElement(name: string, tone: 'place' | 'water'): HTMLDivElement {
  const element = document.createElement('div');
  element.textContent = name;
  element.setAttribute('aria-hidden', 'true');
  element.style.cssText = [
    'pointer-events:none',
    'white-space:nowrap',
    'font-family:Inter,Segoe UI,Arial,sans-serif',
    `font-size:${tone === 'water' ? '12px' : '10px'}`,
    `font-weight:${tone === 'water' ? '700' : '800'}`,
    `font-style:${tone === 'water' ? 'italic' : 'normal'}`,
    `letter-spacing:${tone === 'water' ? '0.08em' : '0.02em'}`,
    `color:${tone === 'water' ? '#4c89a8' : '#52606d'}`,
    'text-shadow:0 1px 0 rgba(255,255,255,0.95),0 0 4px rgba(255,255,255,0.95)',
    'opacity:0.88',
  ].join(';');
  return element;
}

class OfflineReviewMap extends OriginalMap {
  private offlineLabels: maplibregl.Marker[] = [];

  constructor(options: MapOptions) {
    const embeddedContext = getEmbeddedOfflineContext();
    const style = createOfflineBasemapStyle();
    const contextSource = style.sources['offline-census-context'];
    if (embeddedContext && contextSource.type === 'geojson') {
      contextSource.data = embeddedContext;
    }

    super({
      ...options,
      style,
    });

    this.once('load', () => {
      const labels = embeddedContext
        ? Promise.resolve(placeLabelsFromContext(embeddedContext))
        : loadOfflinePlaceLabels();

      void labels
        .then((offlineLabels) => {
          this.offlineLabels = offlineLabels.map((label) =>
            new maplibregl.Marker({
              element: createLabelElement(label.name, label.tone),
              anchor: 'center',
            })
              .setLngLat(label.coordinates)
              .addTo(this),
          );
        })
        .catch((reason: unknown) => {
          console.warn('Offline place labels could not be loaded.', reason);
        });
    });
  }

  override remove(): this {
    for (const marker of this.offlineLabels) marker.remove();
    this.offlineLabels = [];
    super.remove();
    return this;
  }
}

(maplibregl as unknown as { Map: typeof OriginalMap }).Map = OfflineReviewMap as typeof OriginalMap;

document.documentElement.dataset.reviewMode = 'offline';

const root = document.getElementById('root');
if (!root) throw new Error('Application root element is missing');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
