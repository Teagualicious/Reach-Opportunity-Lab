import { useEffect, useMemo, useRef } from 'react';
import maplibregl, {
  type ExpressionSpecification,
  type Map as MapLibreMap,
  type MapLayerMouseEvent,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { OpportunityMarket } from '../data/OpportunityRepository';
import type { GeographicBounds } from '../domain/territory';
import { getGeometryBounds } from './geometryBounds';
import {
  opportunityColorExpression,
  zipFillOpacityEvidenceExpression,
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
  recommendedZips?: readonly string[];
  displayScores?: Readonly<Record<string, number>>;
  showReachGap?: boolean;
  reachGapZips?: readonly string[];
  visibleCompetitorIds?: readonly string[];
  territoryZips?: readonly string[];
  viewportBounds?: GeographicBounds;
  layoutVersion?: number;
  /** Optional domain-supplied hover text replacing the default score line. */
  popupValueText?: (zip: string) => string | null;
}

const SOURCE_ID = 'zip-opportunities';
const FILL_LAYER_ID = 'zip-opportunity-fill';
const LINE_LAYER_ID = 'zip-opportunity-line';
const REACH_GAP_FILL_LAYER_ID = 'reach-gap-fill';
const REACH_GAP_LINE_LAYER_ID = 'reach-gap-line';

type ZipFlagStateKey = 'dim' | 'campaign' | 'recommended' | 'territoryDim';

function competitorFillLayerId(competitorId: string): string {
  return `competitor-${competitorId}-fill`;
}

function competitorLineLayerId(competitorId: string): string {
  return `competitor-${competitorId}-line`;
}

function zipMembershipFilter(zips: readonly string[]): ExpressionSpecification {
  return ['in', ['get', 'zip'], ['literal', [...zips]]];
}

function getZipBounds(data: OpportunityMarket, zip: string | null): GeographicBounds | null {
  if (!zip) return null;
  const feature = data.geometry.features.find((candidate) => candidate.properties.zip === zip);
  return feature ? getGeometryBounds(feature.geometry) : null;
}

function buildPopupContent(
  properties: Record<string, unknown>,
  displayScore?: number,
  valueText?: string | null,
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'map-tooltip';

  const eyebrow = document.createElement('span');
  eyebrow.className = 'map-tooltip__eyebrow';
  eyebrow.textContent = `ZIP ${String(properties.zip ?? '')}`;

  const name = document.createElement('strong');
  name.textContent = String(properties.name ?? 'Opportunity area');

  const score = document.createElement('span');
  score.className = 'map-tooltip__score';
  score.textContent = valueText ?? `${String(displayScore ?? properties.score ?? '—')}/100 opportunity`;

  wrapper.append(eyebrow, name, score);
  return wrapper;
}

function syncZipFlagState(
  map: MapLibreMap,
  applied: ReadonlySet<string>,
  next: ReadonlySet<string>,
  stateKey: ZipFlagStateKey,
): ReadonlySet<string> {
  for (const zip of applied) {
    if (!next.has(zip)) {
      map.setFeatureState({ source: SOURCE_ID, id: zip }, { [stateKey]: false });
    }
  }
  for (const zip of next) {
    if (!applied.has(zip)) {
      map.setFeatureState({ source: SOURCE_ID, id: zip }, { [stateKey]: true });
    }
  }
  return next;
}

function syncDisplayScoreState(
  map: MapLibreMap,
  allZips: readonly string[],
  applied: Readonly<Record<string, number>> | undefined,
  next: Readonly<Record<string, number>> | undefined,
): Readonly<Record<string, number>> | undefined {
  for (const zip of allZips) {
    const appliedScore = applied?.[zip];
    const nextScore = next?.[zip];
    if (appliedScore !== nextScore) {
      map.setFeatureState({ source: SOURCE_ID, id: zip }, { displayScore: nextScore ?? null });
    }
  }
  return next;
}

function setLayerVisibility(map: MapLibreMap, layerIds: readonly string[], visible: boolean) {
  for (const layerId of layerIds) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    }
  }
}

function fitViewport(map: MapLibreMap, bounds: GeographicBounds, duration: number) {
  map.fitBounds(bounds, {
    padding: { top: 34, right: 34, bottom: 34, left: 34 },
    duration,
    maxZoom: 10.5,
  });
}

function fitZipViewport(map: MapLibreMap, bounds: GeographicBounds, duration: number) {
  map.fitBounds(bounds, {
    padding: { top: 72, right: 72, bottom: 72, left: 72 },
    duration,
    maxZoom: 12.6,
  });
}

export function OpportunityMap({
  data,
  selectedZip,
  resetVersion,
  onSelectZip,
  activeZips,
  campaignZips = [],
  recommendedZips = [],
  displayScores,
  showReachGap = false,
  reachGapZips,
  visibleCompetitorIds = [],
  territoryZips,
  viewportBounds,
  layoutVersion = 0,
  popupValueText,
}: OpportunityMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hoveredZipRef = useRef<string | null>(null);
  const selectedZipRef = useRef<string | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const allZips = useMemo(() => data.opportunities.map(({ zip }) => zip), [data.opportunities]);

  const territoryZipSet = useMemo(() => new Set(territoryZips ?? allZips), [allZips, territoryZips]);
  const dimmedZips = useMemo(() => {
    const active = new Set(activeZips ?? allZips);
    return new Set(allZips.filter((zip) => !active.has(zip)));
  }, [activeZips, allZips]);
  const campaignZipSet = useMemo(() => new Set(campaignZips), [campaignZips]);
  const recommendedZipSet = useMemo(() => new Set(recommendedZips), [recommendedZips]);
  const evidenceFocusActive = showReachGap || visibleCompetitorIds.length > 0;
  const effectiveReachGapZips = useMemo(
    () => reachGapZips ?? data.overlays.reachGapZips,
    [data.overlays.reachGapZips, reachGapZips],
  );
  const territoryDimmedZips = useMemo(
    () => new Set(allZips.filter((zip) => !territoryZipSet.has(zip))),
    [allZips, territoryZipSet],
  );

  const territoryZipSetRef = useRef(territoryZipSet);
  const dimmedZipsRef = useRef(dimmedZips);
  const campaignZipSetRef = useRef(campaignZipSet);
  const recommendedZipSetRef = useRef(recommendedZipSet);
  const reachGapZipsRef = useRef<readonly string[]>(effectiveReachGapZips);
  const territoryDimmedZipsRef = useRef(territoryDimmedZips);
  const displayScoresRef = useRef(displayScores);
  const viewportBoundsRef = useRef<GeographicBounds>(viewportBounds ?? data.market.bounds);
  const showReachGapRef = useRef(showReachGap);
  const visibleCompetitorIdsRef = useRef<readonly string[]>(visibleCompetitorIds);
  const evidenceFocusActiveRef = useRef(evidenceFocusActive);
  const popupValueTextRef = useRef(popupValueText);

  // Feature state already written to the current map instance, so updates only
  // touch ZIPs whose state changed instead of rewriting all 1,200+ features.
  const appliedDimmedRef = useRef<ReadonlySet<string>>(new Set());
  const appliedCampaignRef = useRef<ReadonlySet<string>>(new Set());
  const appliedRecommendedRef = useRef<ReadonlySet<string>>(new Set());
  const appliedTerritoryDimmedRef = useRef<ReadonlySet<string>>(new Set());
  const appliedDisplayScoresRef = useRef<Readonly<Record<string, number>> | undefined>(undefined);

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
            id: 'page-background',
            type: 'background',
            paint: { 'background-color': '#eef1f3' },
          },
          {
            id: 'openstreetmap-basemap',
            type: 'raster',
            source: 'openstreetmap-basemap',
            paint: {
              'raster-saturation': -1,
              'raster-contrast': -0.18,
              'raster-brightness-min': 0.72,
              'raster-brightness-max': 1,
              'raster-opacity': 0.82,
            },
          },
        ],
      },
      center: data.market.center,
      zoom: 6.2,
      minZoom: 5.2,
      maxZoom: 14,
      attributionControl: false,
    });

    mapRef.current = map;
    appliedDimmedRef.current = new Set();
    appliedCampaignRef.current = new Set();
    appliedRecommendedRef.current = new Set();
    appliedTerritoryDimmedRef.current = new Set();
    appliedDisplayScoresRef.current = undefined;
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
          'fill-opacity': evidenceFocusActiveRef.current
            ? zipFillOpacityEvidenceExpression
            : zipFillOpacityExpression,
          'fill-antialias': true,
        },
      });

      map.addLayer({
        id: REACH_GAP_FILL_LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        filter: zipMembershipFilter(reachGapZipsRef.current),
        layout: { visibility: showReachGapRef.current ? 'visible' : 'none' },
        paint: {
          'fill-color': '#8b5cf6',
          'fill-opacity': 0.24,
        },
      });
      map.addLayer({
        id: REACH_GAP_LINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        filter: zipMembershipFilter(reachGapZipsRef.current),
        layout: { visibility: showReachGapRef.current ? 'visible' : 'none' },
        paint: {
          'line-color': '#c026d3',
          'line-width': 3,
          'line-opacity': 0.98,
          'line-dasharray': [2, 1.5],
        },
      });

      const visibleCompetitors = new Set(visibleCompetitorIdsRef.current);
      for (const competitor of data.overlays.competitors) {
        const visible = visibleCompetitors.has(competitor.id);
        const competitorFilter = zipMembershipFilter(competitor.zips);
        map.addLayer({
          id: competitorFillLayerId(competitor.id),
          type: 'fill',
          source: SOURCE_ID,
          filter: competitorFilter,
          layout: { visibility: visible ? 'visible' : 'none' },
          paint: {
            'fill-color': competitor.color,
            'fill-opacity': competitor.wide ? 0.11 : 0.2,
          },
        });
        map.addLayer({
          id: competitorLineLayerId(competitor.id),
          type: 'line',
          source: SOURCE_ID,
          filter: competitorFilter,
          layout: { visibility: visible ? 'visible' : 'none' },
          paint: {
            'line-color': competitor.color,
            'line-width': competitor.wide ? 2 : 2.8,
            'line-opacity': 0.96,
            ...(competitor.wide ? { 'line-dasharray': [4, 3] as [number, number] } : {}),
          },
        });
      }

      map.addLayer({
        id: LINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': zipLineColorExpression,
          'line-width': zipLineWidthExpression,
        },
      });

      appliedDimmedRef.current = syncZipFlagState(map, appliedDimmedRef.current, dimmedZipsRef.current, 'dim');
      appliedCampaignRef.current = syncZipFlagState(map, appliedCampaignRef.current, campaignZipSetRef.current, 'campaign');
      appliedRecommendedRef.current = syncZipFlagState(
        map,
        appliedRecommendedRef.current,
        recommendedZipSetRef.current,
        'recommended',
      );
      appliedTerritoryDimmedRef.current = syncZipFlagState(
        map,
        appliedTerritoryDimmedRef.current,
        territoryDimmedZipsRef.current,
        'territoryDim',
      );
      appliedDisplayScoresRef.current = syncDisplayScoreState(
        map,
        allZips,
        appliedDisplayScoresRef.current,
        displayScoresRef.current,
      );
      if (selectedZipRef.current) {
        map.setFeatureState({ source: SOURCE_ID, id: selectedZipRef.current }, { selected: true });
      }
      fitViewport(map, viewportBoundsRef.current, 0);
    });

    const handleMouseMove = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) return;
      const zip = typeof feature.properties?.zip === 'string' ? feature.properties.zip : null;
      if (!zip || !territoryZipSetRef.current.has(zip)) {
        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
        return;
      }

      map.getCanvas().style.cursor = 'pointer';
      if (hoveredZipRef.current && hoveredZipRef.current !== zip) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredZipRef.current }, { hover: false });
      }

      hoveredZipRef.current = zip;
      map.setFeatureState({ source: SOURCE_ID, id: zip }, { hover: true });
      popupRef.current
        ?.setLngLat(event.lngLat)
        .setDOMContent(
          buildPopupContent(
            feature.properties ?? {},
            displayScoresRef.current?.[zip],
            popupValueTextRef.current?.(zip),
          ),
        )
        .addTo(map);
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
      if (zip && territoryZipSetRef.current.has(zip)) onSelectZip(zip);
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
  }, [allZips, data, onSelectZip]);

  useEffect(() => {
    const previousSelectedZip = selectedZipRef.current;
    selectedZipRef.current = selectedZip;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;

    if (previousSelectedZip && previousSelectedZip !== selectedZip) {
      map.setFeatureState({ source: SOURCE_ID, id: previousSelectedZip }, { selected: false });
    }
    if (selectedZip && selectedZip !== previousSelectedZip) {
      map.setFeatureState({ source: SOURCE_ID, id: selectedZip }, { selected: true });
    }

    const selectedBounds = getZipBounds(data, selectedZip);
    if (selectedBounds) {
      fitZipViewport(map, selectedBounds, 520);
    } else if (previousSelectedZip) {
      fitViewport(map, viewportBoundsRef.current, 420);
    }
  }, [data, selectedZip]);

  useEffect(() => {
    popupValueTextRef.current = popupValueText;
  }, [popupValueText]);

  useEffect(() => {
    dimmedZipsRef.current = dimmedZips;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;
    appliedDimmedRef.current = syncZipFlagState(map, appliedDimmedRef.current, dimmedZips, 'dim');
  }, [dimmedZips]);

  useEffect(() => {
    campaignZipSetRef.current = campaignZipSet;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;
    appliedCampaignRef.current = syncZipFlagState(map, appliedCampaignRef.current, campaignZipSet, 'campaign');
  }, [campaignZipSet]);

  useEffect(() => {
    recommendedZipSetRef.current = recommendedZipSet;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;
    appliedRecommendedRef.current = syncZipFlagState(
      map,
      appliedRecommendedRef.current,
      recommendedZipSet,
      'recommended',
    );
  }, [recommendedZipSet]);

  useEffect(() => {
    territoryZipSetRef.current = territoryZipSet;
    territoryDimmedZipsRef.current = territoryDimmedZips;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;
    appliedTerritoryDimmedRef.current = syncZipFlagState(
      map,
      appliedTerritoryDimmedRef.current,
      territoryDimmedZips,
      'territoryDim',
    );
  }, [territoryDimmedZips, territoryZipSet]);

  useEffect(() => {
    displayScoresRef.current = displayScores;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;
    appliedDisplayScoresRef.current = syncDisplayScoreState(
      map,
      allZips,
      appliedDisplayScoresRef.current,
      displayScores,
    );
  }, [allZips, displayScores]);

  useEffect(() => {
    reachGapZipsRef.current = effectiveReachGapZips;
    const map = mapRef.current;
    if (!map?.getSource(SOURCE_ID)) return;
    const filter = zipMembershipFilter(effectiveReachGapZips);
    if (map.getLayer(REACH_GAP_FILL_LAYER_ID)) map.setFilter(REACH_GAP_FILL_LAYER_ID, filter);
    if (map.getLayer(REACH_GAP_LINE_LAYER_ID)) map.setFilter(REACH_GAP_LINE_LAYER_ID, filter);
  }, [effectiveReachGapZips]);

  useEffect(() => {
    showReachGapRef.current = showReachGap;
    const map = mapRef.current;
    if (!map) return;
    setLayerVisibility(map, [REACH_GAP_FILL_LAYER_ID, REACH_GAP_LINE_LAYER_ID], showReachGap);
  }, [showReachGap]);

  useEffect(() => {
    visibleCompetitorIdsRef.current = visibleCompetitorIds;
    const map = mapRef.current;
    if (!map) return;
    const visible = new Set(visibleCompetitorIds);
    for (const competitor of data.overlays.competitors) {
      setLayerVisibility(
        map,
        [competitorFillLayerId(competitor.id), competitorLineLayerId(competitor.id)],
        visible.has(competitor.id),
      );
    }
  }, [data.overlays.competitors, visibleCompetitorIds]);

  useEffect(() => {
    evidenceFocusActiveRef.current = evidenceFocusActive;
    const map = mapRef.current;
    if (!map?.getLayer(FILL_LAYER_ID)) return;
    map.setPaintProperty(
      FILL_LAYER_ID,
      'fill-opacity',
      evidenceFocusActive ? zipFillOpacityEvidenceExpression : zipFillOpacityExpression,
    );
  }, [evidenceFocusActive]);

  useEffect(() => {
    viewportBoundsRef.current = viewportBounds ?? data.market.bounds;
    const map = mapRef.current;
    if (!map || selectedZipRef.current) return;
    fitViewport(map, viewportBoundsRef.current, 520);
  }, [data.market.bounds, resetVersion, viewportBounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const frame = window.requestAnimationFrame(() => {
      map.resize();
      const selectedBounds = getZipBounds(data, selectedZipRef.current);
      if (selectedBounds) {
        fitZipViewport(map, selectedBounds, 260);
      } else {
        fitViewport(map, viewportBoundsRef.current, 260);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [data, layoutVersion]);

  return <div ref={containerRef} className="opportunity-map" aria-label="Ohio ZIP opportunity map" />;
}
