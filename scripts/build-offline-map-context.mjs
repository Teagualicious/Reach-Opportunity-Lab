import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = path.join(ROOT, 'public/data/offline-map-context.geojson');
const PROVENANCE_PATH = path.join(ROOT, 'public/data/offline-map-context.provenance.json');

const BOUNDS = {
  west: -82.3,
  south: 40.91,
  east: -80.98,
  north: 41.83,
};

const QUERY_BASE = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb';

const PLACE_LABELS = [
  ['Cleveland', -81.6944, 41.4993, 'place'],
  ['Akron', -81.519, 41.0814, 'place'],
  ['Lakewood', -81.7982, 41.4819, 'place'],
  ['Parma', -81.7229, 41.4048, 'place'],
  ['Beachwood', -81.5087, 41.4645, 'place'],
  ['Mentor', -81.3396, 41.6662, 'place'],
  ['Medina', -81.8637, 41.1384, 'place'],
  ['Hudson', -81.4407, 41.2401, 'place'],
  ['Cuyahoga Falls', -81.4846, 41.1339, 'place'],
  ['Westlake', -81.9179, 41.4553, 'place'],
  ['Brunswick', -81.8418, 41.2381, 'place'],
  ['Stow', -81.4389, 41.1595, 'place'],
  ['Aurora', -81.3454, 41.3176, 'place'],
  ['Lake Erie', -81.65, 41.73, 'water'],
];

function queryUrl(service, layerId, offset) {
  const url = new URL(`${QUERY_BASE}/${service}/MapServer/${layerId}/query`);
  url.search = new URLSearchParams({
    where: '1=1',
    geometry: `${BOUNDS.west},${BOUNDS.south},${BOUNDS.east},${BOUNDS.north}`,
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    returnGeometry: 'true',
    outSR: '4326',
    maxAllowableOffset: String(offset),
    geometryPrecision: '5',
    resultRecordCount: '100000',
    f: 'geojson',
  }).toString();
  return url;
}

async function fetchLayer({ label, service, layerId, offset }) {
  const url = queryUrl(service, layerId, offset);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/geo+json, application/json',
      'User-Agent': 'Reach-Opportunity-Lab-offline-review-builder/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`${label} request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload?.error) {
    throw new Error(`${label} request failed: ${payload.error.message ?? 'ArcGIS service error'}`);
  }
  if (payload?.type !== 'FeatureCollection' || !Array.isArray(payload.features)) {
    throw new Error(`${label} returned an unexpected response`);
  }

  return payload.features;
}

function featureName(properties = {}) {
  return properties.FULLNAME ?? properties.NAME ?? properties.BASENAME ?? undefined;
}

function normalizeFeatures(features, properties) {
  return features
    .filter((feature) => feature?.geometry)
    .map((feature) => ({
      type: 'Feature',
      properties: {
        ...properties,
        ...(featureName(feature.properties) ? { name: String(featureName(feature.properties)) } : {}),
      },
      geometry: feature.geometry,
    }));
}

function labelFeatures() {
  return PLACE_LABELS.map(([name, longitude, latitude, tone]) => ({
    type: 'Feature',
    properties: {
      kind: 'place-label',
      name,
      labelTone: tone,
    },
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  }));
}

function sortFeatures(features) {
  return [...features].sort((left, right) => {
    const leftKey = `${left.properties.kind}:${left.properties.class ?? ''}:${left.properties.name ?? ''}`;
    const rightKey = `${right.properties.kind}:${right.properties.class ?? ''}:${right.properties.name ?? ''}`;
    return leftKey.localeCompare(rightKey);
  });
}

function countKinds(features) {
  return features.reduce((counts, feature) => {
    const kind = feature.properties.kind;
    counts[kind] = (counts[kind] ?? 0) + 1;
    return counts;
  }, {});
}

const [primaryRoads, secondaryRoads, waterLines, waterAreas, counties] = await Promise.all([
  fetchLayer({
    label: 'Primary roads',
    service: 'Transportation',
    layerId: 2,
    offset: 0.0008,
  }),
  fetchLayer({
    label: 'Secondary roads',
    service: 'Transportation',
    layerId: 5,
    offset: 0.0012,
  }),
  fetchLayer({
    label: 'Linear hydrography',
    service: 'Hydro',
    layerId: 0,
    offset: 0.0015,
  }),
  fetchLayer({
    label: 'Areal hydrography',
    service: 'Hydro',
    layerId: 1,
    offset: 0.004,
  }),
  fetchLayer({
    label: '2020 counties',
    service: 'State_County',
    layerId: 55,
    offset: 0.002,
  }),
]);

const features = sortFeatures([
  ...normalizeFeatures(counties, { kind: 'county' }),
  ...normalizeFeatures(waterAreas, { kind: 'water-area' }),
  ...normalizeFeatures(waterLines, { kind: 'water-line' }),
  ...normalizeFeatures(secondaryRoads, { kind: 'road', class: 'secondary' }),
  ...normalizeFeatures(primaryRoads, { kind: 'road', class: 'primary' }),
  ...labelFeatures(),
]);

const counts = countKinds(features);
if ((counts.road ?? 0) < 10) throw new Error('Offline context contains too few roads');
if ((counts['water-area'] ?? 0) < 1) throw new Error('Offline context contains no areal hydrography');
if ((counts.county ?? 0) < 1) throw new Error('Offline context contains no county boundaries');
if ((counts['place-label'] ?? 0) !== PLACE_LABELS.length) {
  throw new Error('Offline context label count does not match the declared labels');
}

const collection = {
  type: 'FeatureCollection',
  features,
};

const provenance = {
  title: 'Cleveland–Akron offline visual context',
  source: 'U.S. Census Bureau TIGERweb',
  services: [
    'TIGERweb/Transportation',
    'TIGERweb/Hydro',
    'TIGERweb/State_County',
  ],
  bounds: BOUNDS,
  transformation: [
    'Queried features intersecting the Cleveland–Akron demonstration bounds',
    'Requested WGS84 GeoJSON with server-side simplification and five-decimal coordinate precision',
    'Normalized roads, hydrography, county boundaries, and presentation labels into one local context source',
  ],
  featureCounts: counts,
  runtimeNotice: 'The generated context is bundled into the offline review artifact and makes no runtime network requests.',
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(collection)}\n`, 'utf8');
await writeFile(PROVENANCE_PATH, `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');

console.log(`Wrote ${features.length} offline context features to ${path.relative(ROOT, OUTPUT_PATH)}`);
console.log(counts);
