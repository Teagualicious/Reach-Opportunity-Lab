import { useEffect, useMemo, useRef } from 'react';
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { OpportunityMarket } from '../data/OpportunityRepository';
import {
  opportunityColorExpression,
  zipFillOpacityExpression,
  zipLineColorExpression,
  zipLineWidthExpression,
} from './mapExpressions';

interface OpportunityMapProps {
  data: OpportunityMarket;
  selectedZip: string | null;
  resetVersion: number;
  onSelectZip: (zip: string | null) => void;
  activeZips?: readonly string[];
  campaignZips?: readonly string[];
  displayScores?: Readonly<Record<string, number>>;
}

const SOURCE_ID = 'zip-opportunities';
const FILL_LAYER_ID = 'zip-opportunity-fill';
const LINE_LAYER_ID = 'zip-opportunity-line';

function buildPopupContent(properties: Record<string, unknown>): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'map-tooltip';

  const eyebrow = document.createElement('span');
  eyebrow.className = 'map-tooltip__eyebrow';
  eyebrow.textContent = `ZIP ${String(properties.zip ?? '')}`;

  const name = document.createElement('strong');
  name.textContent = String(properties.name ?? 'Opportunity area');

  const score = document.createElement('span');
  score.className = 'map-tooltip__score';
  score.textContent = `${String(properties.score ?? '—')}/100 opportunity`;

  wrapper.append(eyebrow, name, score);
  return wrapper;
}

function setBooleanFeatureState(
  map: MapLibreMap,
  allZips: readonly string[],
  enabledZips: ReadonlySet<string>,
  stateKey: 'dim' | 'campaign',
  invert = false,
) {
  for (const zip of allZips) {
    const enabled = enabledZips.has(zip);
    map.setFeatureState({ source: SOURCE_ID, id: zip }, { [stateKey]: invert ? !enabled : enabled });
  }
}

export function OpportunityMap({
  data,
  selectedZip,
  resetVersion,
  onSelectZip,
  activeZips,
  campaignZips = [],
  displayScores,
}: OpportunityMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hoveredZipRef = useRef<string | null>(null);
  const selectedZipRef = useRef<string | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const activeZipsRef = useRef<readonly string[]>(activeZips ?? data.opportunities.map(({ zip }) => zip));
  const campaignZipsRef = useRef<readonly string[]>(campaignZips);
  const allZips = useMemo(() => data.opportunities.map(({ zip }) => zip), [data.opportunities]);

  const renderedGeometry = useMemo(() => {
    if (!displayScores) return data.geometry;
    return {
      ...data.geometry,
      features: data.geometry.features.map((feature) => {
        const zip = feature.properties.zip;
        const score = displayScores[zip];
        return score === undefined
          ? feature
          : {
              ...feature,
              properties: {
                ...feature.properties,
                score,
              },
            };
      }),
    };
  }, [data.geometry, displayScores]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'openstreetmap-basemap': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'openstreetmap-basemap',
            type: 'raster',
            source: 'openstreetmap-basemap',
            paint: {
              'raster-saturation': -0.78,
              'raster-contrast': -0.08,
              'raster-brightness-min': 0.16,
              'raster-brightness-max': 0.95,
            },
          },
        ],
      },
      center: data.market.center,
      zoom: 8.35,
      minZoom: 7,
      maxZoom: 14,
      attributionControl: false,
    });

    mapRef.current = map;
    popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: data.geometry,
        promoteId: 'zip',
      });

      map.addLayer({
        id: FILL_LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': opportunityColorExpression,
          'fill-opacity': zipFillOpacityExpression,
          'fill-antialias': true,
        },
      });

      map.addLayer({
        id: LINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': zipLineColorExpression,
          'line-width': zipLineWidthExpression,
        },
      });

      setBooleanFeatureState(map, allZips, new Set(activeZipsRef.current), 'dim', true);
      setBooleanFeatureState(map, allZips, new Set(campaignZipsRef.current), 'campaign');
      if (selectedZipRef.current) {
        map.setFeatureState({ source: SOURCE_ID, id: selectedZipRef.current }, { selected: true });
      }
      map.fitBounds(data.market.bounds, { padding: 42, duration: 0 });
    });

    const handleMouseMove = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const zip = typeof feature.properties?.zip === 'string' ? feature.properties.zip : null;
      if (!zip) return;

      map.getCanvas().style.cursor = 'pointer';

      if (hoveredZipRef.current && hoveredZipRef.current !== zip) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredZipRef.current }, { hover: false });
      }

      hoveredZipRef.current = zip;
      map.setFeatureState({ source: SOURCE_ID, id: zip }, { hover: true });
      popupRef.current?.setLngLat(event.lngLat).setDOMContent(buildPopupContent(feature.properties ?? {})).addTo(map);
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
      popupRef.current?.remove();
      if (hoveredZipRef.current) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredZipRef.current }, { hover: false });
        hoveredZipRef.current = null;
      }
    };

    const handleZipClick = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const zip = typeof feature?.properties?.zip === 'string' ? feature.properties.zip : null;
      if (zip) onSelectZip(zip);
    };

    map.on('mousemove', FILL_LAYER_ID, handleMouseMove);
    map.on('mouseleave', FILL_LAYER_ID, handleMouseLeave);
    map.on('click', FILL_LAYER_ID, handleZipClick);
    map.on('click', (event) => {
      const features = map.queryRenderedFeatures(event.point, { layers: [FILL_LAYER_ID] });
      if (features.length === 0) onSelectZip(null);
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [allZips, data.geometry, data.market.bounds, data.market.center, onSelectZip]);

  useEffect(() => {
    selectedZipRef.current = selectedZip;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;

    for (const zip of allZips) {
      map.setFeatureState({ source: SOURCE_ID, id: zip }, { selected: zip === selectedZip });
    }
  }, [allZips, selectedZip]);

  useEffect(() => {
    const nextActiveZips = activeZips ?? allZips;
    activeZipsRef.current = nextActiveZips;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;
    setBooleanFeatureState(map, allZips, new Set(nextActiveZips), 'dim', true);
  }, [activeZips, allZips]);

  useEffect(() => {
    campaignZipsRef.current = campaignZips;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;
    setBooleanFeatureState(map, allZips, new Set(campaignZips), 'campaign');
  }, [allZips, campaignZips]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(data.market.bounds, { padding: 42, duration: 650 });
  }, [data.market.bounds, resetVersion]);

  useEffect(() => {
    const source = mapRef.current?.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(renderedGeometry);
  }, [renderedGeometry]);

  return <div ref={containerRef} className="opportunity-map" aria-label="Cleveland ZIP opportunity heat map" />;
}
