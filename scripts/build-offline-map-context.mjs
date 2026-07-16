import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_PATH = path.join(ROOT, 'public/data/offline-map-context.geojson');
const PROVENANCE_PATH = path.join(ROOT, 'public/data/offline-map-context.provenance.json');

const BOUNDS = {
  west: -84.9,
  south: 38.3,
  east: -80.45,
  north: 42.1,
};

const QUERY_BASE = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb';

const PLACE_LABELS = [
  ['Cleveland', -81.6944, 41.4993, 'place'],
  ['Akron', -81.519, 41.0814, 'place'],
  ['Canton', -81.3784, 40.7989, 'place'],
  ['Youngstown', -80.6495, 41.0998, 'place'],
  ['Toledo', -83.5552, 41.6528, 'place'],
  ['Columbus', -82.9988, 39.9612, 'place'],
  ['Dayton', -84.1916, 39.7589, 'place'],
  ['Cincinnati', -84.512, 39.1031, 'place'],
  ['Athens', -82.1013, 39.3292, 'place'],
  ['Marietta', -81.4548, 39.4154, 'place'],
  ['Lima', -84.1052, 40.7426, 'place'],
  ['Mansfield', -82.5154, 40.7584, 'place'],
  ['Lake Erie', -82.0, 41.92, 'water'],
  ['Ohio River', -82.6, 38.7, 'water'],
];

function buildTiles(columns = 4, rows = 2) {
  const longitudeStep = (BOUNDS.east - BOUNDS.west) / columns;
  const latitudeStep = (BOUNDS.north - BOUNDS.south) / rows;
  const tiles = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      tiles.push({
        west: BOUNDS.west + longitudeStep * column,
        south: BOUNDS.south + latitudeStep * row,
        east: BOUNDS.west + longitudeStep * (column + 1),
        north: BOUNDS.south + latitudeStep * (row + 1),
      });
    }
  }
  return tiles;
}

const QUERY_TILES = buildTiles();

function queryUrl(service, layerId, offset, bounds) {
  const url = new URL(`${QUERY_BASE}/${service}/MapServer/${layerId}/query`);
  url.search = new URLSearchParams({
    where: '1=1',
    geometry: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
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

function featureIdentity(feature, fallbackIndex) {
  const properties = feature?.properties ?? {};
  return String(
    properties.OBJECTID ??
      properties.LINEARID ??
      properties.GEOID ??
      properties.GEOID20 ??
      properties.FULLNAME ??
      properties.NAME ??
      fallbackIndex,
  );
}

async function fetchLayer({ label, service, layerId, offset }) {
  const byId = new Map();

  for (const [tileIndex, bounds] of QUERY_TILES.entries()) {
    const url = queryUrl(service, layerId, offset, bounds);
    const response = await fetch(url, {
      headers: {
        Accept: 'application/geo+json, application/json',
        'User-Agent': 'Reach-Opportunity-Lab-offline-review-builder/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`${label} tile ${tileIndex + 1} request failed: ${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    if (payload?.error) {
      throw new Error(`${label} tile ${tileIndex + 1} request failed: ${payload.error.message ?? 'ArcGIS service error'}`);
    }
    if (payload?.type !== 'FeatureCollection' || !Array.isArray(payload.features)) {
      throw new Error(`${label} tile ${tileIndex + 1} returned an unexpected response`);
    }

    for (const [featureIndex, feature] of payload.features.entries()) {
      const key = featureIdentity(feature, `${tileIndex}:${featureIndex}`);
      if (!byId.has(key)) byId.set(key, feature);
    }
  }

  return [...byId.values()];
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
  fetchLayer({ label: 'Primary roads', service: 'Transportation', layerId: 2, offset: 0.0025 }),
  fetchLayer({ label: 'Secondary roads', service: 'Transportation', layerId: 5, offset: 0.004 }),
  fetchLayer({ label: 'Linear hydrography', service: 'Hydro', layerId: 0, offset: 0.005 }),
  fetchLayer({ label: 'Areal hydrography', service: 'Hydro', layerId: 1, offset: 0.01 }),
  fetchLayer({ label: '2020 counties', service: 'State_County', layerId: 55, offset: 0.006 }),
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
if ((counts.road ?? 0) < 25) throw new Error('Offline context contains too few roads');
if ((counts['water-area'] ?? 0) < 1) throw new Error('Offline context contains no areal hydrography');
if ((counts.county ?? 0) < 20) throw new Error('Offline context contains too few county boundaries');
if ((counts['place-label'] ?? 0) !== PLACE_LABELS.length) {
  throw new Error('Offline context label count does not match the declared labels');
}

const collection = {
  type: 'FeatureCollection',
  features,
};

const provenance = {
  title: 'Ohio statewide offline visual context',
  source: 'U.S. Census Bureau TIGERweb',
  services: ['TIGERweb/Transportation', 'TIGERweb/Hydro', 'TIGERweb/State_County'],
  bounds: BOUNDS,
  queryTiles: QUERY_TILES.length,
  transformation: [
    'Queried tiled envelopes covering statewide Ohio review bounds',
    'Deduplicated features returned across tile boundaries',
    'Requested WGS84 GeoJSON with server-side simplification and five-decimal coordinate precision',
    'Normalized roads, hydrography, county boundaries, and major-city presentation labels into one local context source',
  ],
  featureCounts: counts,
  runtimeNotice: 'The generated context is bundled into the offline review artifact and makes no runtime network requests.',
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(collection)}\n`, 'utf8');
await writeFile(PROVENANCE_PATH, `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');

console.log(`Wrote ${features.length} offline context features to ${path.relative(ROOT, OUTPUT_PATH)}`);
console.log(counts);
