import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_URL =
  'https://raw.githubusercontent.com/aha1994/ZCTA2020/refs/heads/main/2020%20Census%20Simplified/Ohio_ZCTAs_simplified_2020.json';
const CURATED_DATA_PATH = 'public/data/zip-opportunities.json';
const GEOMETRY_OUTPUT = 'public/data/ohio-zcta-2020.geojson';
const OPPORTUNITY_OUTPUT = 'public/data/ohio-opportunities.json';
const PROVENANCE_OUTPUT = 'public/data/ohio-market.provenance.json';
const ZIP_PATTERN = /^\d{5}$/;
const ZIP_PROPERTY_CANDIDATES = [
  'ZCTA5CE20',
  'GEOID20',
  'ZCTA5CE10',
  'ZCTA5',
  'GEOID',
  'zip',
];

const TERRITORY_SEEDS = [
  {
    id: 'cleveland-akron',
    name: 'Northeast Ohio',
    selectorLabel: 'Northeast Ohio · Cleveland–Akron',
    anchorCities: ['Cleveland', 'Akron', 'Canton'],
    anchors: [
      [-81.6944, 41.4993],
      [-81.519, 41.0814],
      [-81.3784, 40.7989],
    ],
  },
  {
    id: 'youngstown-east',
    name: 'Eastern Ohio',
    selectorLabel: 'Eastern Ohio · Youngstown',
    anchorCities: ['Youngstown', 'Steubenville'],
    anchors: [
      [-80.6495, 41.0998],
      [-80.6339, 40.3698],
    ],
  },
  {
    id: 'toledo-northwest',
    name: 'Northwest Ohio',
    selectorLabel: 'Northwest Ohio · Toledo',
    anchorCities: ['Toledo', 'Findlay', 'Lima'],
    anchors: [
      [-83.5552, 41.6528],
      [-83.6499, 41.0442],
      [-84.1052, 40.7426],
    ],
  },
  {
    id: 'columbus-central',
    name: 'Central Ohio',
    selectorLabel: 'Central Ohio · Columbus',
    anchorCities: ['Columbus', 'Mansfield', 'Newark'],
    anchors: [
      [-82.9988, 39.9612],
      [-82.5154, 40.7584],
      [-82.4013, 40.0581],
    ],
  },
  {
    id: 'dayton-west',
    name: 'West Central Ohio',
    selectorLabel: 'West Central Ohio · Dayton',
    anchorCities: ['Dayton', 'Springfield'],
    anchors: [
      [-84.1916, 39.7589],
      [-83.8088, 39.9242],
    ],
  },
  {
    id: 'cincinnati-southwest',
    name: 'Southwest Ohio',
    selectorLabel: 'Southwest Ohio · Cincinnati',
    anchorCities: ['Cincinnati', 'Hamilton'],
    anchors: [
      [-84.512, 39.1031],
      [-84.5613, 39.3995],
    ],
  },
  {
    id: 'southeast-ohio',
    name: 'Southeast Ohio',
    selectorLabel: 'Southeast Ohio · Athens–Marietta',
    anchorCities: ['Athens', 'Marietta', 'Portsmouth'],
    anchors: [
      [-82.1013, 39.3292],
      [-81.4548, 39.4154],
      [-82.9977, 38.7317],
    ],
  },
];

const CATEGORIES = [
  'Automotive',
  'Healthcare',
  'Financial Services',
  'Home Services',
  'Restaurants',
  'Retail',
  'Legal',
  'Recruitment',
];

const COMPONENT_MAXIMUMS = {
  audiencePotential: 25,
  reachGap: 20,
  searchOpportunity: 15,
  geographicPotential: 15,
  categoryPotential: 15,
  competitiveConditions: 10,
};

function assertFeatureCollection(value, label) {
  if (!value || value.type !== 'FeatureCollection' || !Array.isArray(value.features)) {
    throw new Error(`${label} is not a GeoJSON FeatureCollection`);
  }
}

function getFeatureZip(feature) {
  const properties = feature?.properties;
  if (!properties || typeof properties !== 'object') return null;
  for (const candidate of ZIP_PROPERTY_CANDIDATES) {
    const value = properties[candidate];
    if (typeof value === 'string' && ZIP_PATTERN.test(value)) return value;
  }
  return null;
}

function visitPositions(value, callback) {
  if (!Array.isArray(value)) return;
  if (
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    callback(value[0], value[1]);
    return;
  }
  for (const child of value) visitPositions(child, callback);
}

function geometryBounds(geometry) {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  visitPositions(geometry.coordinates, (longitude, latitude) => {
    west = Math.min(west, longitude);
    south = Math.min(south, latitude);
    east = Math.max(east, longitude);
    north = Math.max(north, latitude);
  });
  if (![west, south, east, north].every(Number.isFinite)) {
    throw new Error('Geometry does not contain valid coordinates');
  }
  return [west, south, east, north];
}

function midpoint(bounds) {
  return [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2];
}

function mergeBounds(boundsList) {
  return boundsList.reduce(
    (merged, bounds) => [
      Math.min(merged[0], bounds[0]),
      Math.min(merged[1], bounds[1]),
      Math.max(merged[2], bounds[2]),
      Math.max(merged[3], bounds[3]),
    ],
    [Infinity, Infinity, -Infinity, -Infinity],
  );
}

function padBounds(bounds, longitudePadding = 0.08, latitudePadding = 0.06) {
  return [
    Number((bounds[0] - longitudePadding).toFixed(5)),
    Number((bounds[1] - latitudePadding).toFixed(5)),
    Number((bounds[2] + longitudePadding).toFixed(5)),
    Number((bounds[3] + latitudePadding).toFixed(5)),
  ];
}

function squaredDistance([longitude, latitude], [anchorLongitude, anchorLatitude]) {
  const longitudeScale = Math.cos((latitude * Math.PI) / 180);
  const longitudeDelta = (longitude - anchorLongitude) * longitudeScale;
  const latitudeDelta = latitude - anchorLatitude;
  return longitudeDelta * longitudeDelta + latitudeDelta * latitudeDelta;
}

function assignTerritory(center) {
  return TERRITORY_SEEDS.reduce((best, territory) => {
    const distance = Math.min(...territory.anchors.map((anchor) => squaredDistance(center, anchor)));
    return !best || distance < best.distance ? { territory, distance } : best;
  }, null).territory;
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rangeValue(hash, offset, minimum, maximum) {
  const width = maximum - minimum + 1;
  return minimum + ((hash >>> offset) % width);
}

function generateComponents(zip, territoryId) {
  const hash = stableHash(`${zip}:${territoryId}`);
  return {
    audiencePotential: rangeValue(hash, 0, 13, COMPONENT_MAXIMUMS.audiencePotential),
    reachGap: rangeValue(hash, 4, 8, COMPONENT_MAXIMUMS.reachGap),
    searchOpportunity: rangeValue(hash, 8, 5, COMPONENT_MAXIMUMS.searchOpportunity),
    geographicPotential: rangeValue(hash, 12, 6, COMPONENT_MAXIMUMS.geographicPotential),
    categoryPotential: rangeValue(hash, 16, 6, COMPONENT_MAXIMUMS.categoryPotential),
    competitiveConditions: rangeValue(hash, 20, 3, COMPONENT_MAXIMUMS.competitiveConditions),
  };
}

function getDriverAndLimiter(components) {
  const entries = Object.entries(components);
  const ratios = entries.map(([key, value]) => [key, value / COMPONENT_MAXIMUMS[key]]);
  ratios.sort((a, b) => b[1] - a[1]);
  return { topDriver: ratios[0][0], topLimiter: ratios[ratios.length - 1][0] };
}

function buildSyntheticOpportunity(zip, territory, center) {
  const hash = stableHash(zip);
  const components = generateComponents(zip, territory.id);
  const score = Object.values(components).reduce((sum, value) => sum + value, 0);
  const { topDriver, topLimiter } = getDriverAndLimiter(components);
  const categoryStrength = CATEGORIES[hash % CATEGORIES.length];
  const householdCount = 4200 + (hash % 28600);
  const medianIncome = 44000 + ((hash >>> 5) % 86000);
  const confidence = score >= 82 ? 'High' : score >= 61 ? 'Moderate' : 'Low';

  return {
    zip,
    name: `ZIP ${zip}`,
    territoryId: territory.id,
    detailLevel: 'statewide-baseline',
    score,
    confidence,
    components,
    householdCount,
    medianIncome,
    categoryStrength,
    topDriver,
    topLimiter,
    summary: `ZIP ${zip} is a deterministic synthetic statewide baseline within ${territory.name}. Its modeled opportunity reflects audience, reach, search, geographic, category, and competitive signals for executive demonstration only.`,
    centroid: center.map((value) => Number(value.toFixed(5))),
  };
}

function roundCoordinates(value) {
  if (typeof value === 'number') return Number(value.toFixed(5));
  if (Array.isArray(value)) return value.map(roundCoordinates);
  return value;
}

async function fetchSource() {
  const response = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent': 'Reach-Opportunity-Lab Ohio market builder',
      Accept: 'application/geo+json, application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Unable to download Ohio ZCTA source: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function main() {
  const curatedPayload = JSON.parse(await readFile(CURATED_DATA_PATH, 'utf8'));
  const curatedByZip = new Map(
    curatedPayload.opportunities.map((opportunity) => [opportunity.zip, opportunity]),
  );

  const source = await fetchSource();
  assertFeatureCollection(source, 'Downloaded Ohio ZCTA source');

  const normalizedRecords = [];
  const seenZips = new Set();
  for (const feature of source.features) {
    const zip = getFeatureZip(feature);
    if (!zip || seenZips.has(zip)) continue;
    if (!feature.geometry || !['Polygon', 'MultiPolygon'].includes(feature.geometry.type)) continue;
    seenZips.add(zip);
    const bounds = geometryBounds(feature.geometry);
    const center = midpoint(bounds);
    const territory = assignTerritory(center);
    normalizedRecords.push({ zip, feature, bounds, center, territory });
  }
  normalizedRecords.sort((a, b) => a.zip.localeCompare(b.zip));

  const territoryBounds = new Map();
  const territoryZips = new Map(TERRITORY_SEEDS.map((territory) => [territory.id, []]));
  for (const record of normalizedRecords) {
    territoryZips.get(record.territory.id).push(record.zip);
    const current = territoryBounds.get(record.territory.id);
    territoryBounds.set(
      record.territory.id,
      current ? mergeBounds([current, record.bounds]) : [...record.bounds],
    );
  }

  const territories = TERRITORY_SEEDS.map(({ anchors, ...territory }) => ({
    ...territory,
    bounds: padBounds(territoryBounds.get(territory.id)),
    center: midpoint(territoryBounds.get(territory.id)).map((value) => Number(value.toFixed(5))),
    zips: territoryZips.get(territory.id),
  }));

  const opportunities = normalizedRecords.map((record) => {
    const curated = curatedByZip.get(record.zip);
    if (!curated) return buildSyntheticOpportunity(record.zip, record.territory, record.center);
    return {
      ...curated,
      territoryId: record.territory.id,
      detailLevel: 'curated-demo',
      centroid: record.center.map((value) => Number(value.toFixed(5))),
    };
  });

  const geometry = {
    type: 'FeatureCollection',
    metadata: {
      title: 'Ohio Opportunity Lab 2020 ZCTA geometry',
      sourceDataset: '2020 Census Simplified ZCTA geometry',
      sourceUrl: SOURCE_URL,
      sourceRepository: 'aha1994/ZCTA2020',
      censusVintage: '2020 Census',
      generatedBy: 'scripts/build-ohio-market.mjs',
      coordinatePrecision: 5,
      featureCount: normalizedRecords.length,
    },
    features: normalizedRecords.map((record) => ({
      type: 'Feature',
      id: record.zip,
      properties: {
        zip: record.zip,
        ZCTA5: record.zip,
        GEOID: record.zip,
        territoryId: record.territory.id,
      },
      geometry: {
        ...record.feature.geometry,
        coordinates: roundCoordinates(record.feature.geometry.coordinates),
      },
    })),
  };

  const stateBounds = padBounds(mergeBounds(normalizedRecords.map((record) => record.bounds)), 0.03, 0.03);
  const payload = {
    market: {
      id: 'ohio',
      name: 'Ohio Opportunity Network',
      subtitle: 'Statewide ZIP-level opportunity intelligence with territory focus',
      center: midpoint(stateBounds).map((value) => Number(value.toFixed(5))),
      bounds: stateBounds,
      defaultTerritoryId: 'cleveland-akron',
      territories,
    },
    opportunities,
  };

  const provenance = {
    title: 'Ohio Opportunity Lab statewide market fixtures',
    geometryType: 'ZIP Code Tabulation Area (ZCTA)',
    censusVintage: '2020 Census',
    sourceDataset: '2020 Census Simplified ZCTA geometry',
    sourceRepository: 'aha1994/ZCTA2020',
    sourceUrl: SOURCE_URL,
    transformations: [
      'Included every Ohio ZCTA in the source fixture',
      'Rounded coordinates to five decimal places',
      'Assigned each ZCTA to the nearest multi-city synthetic territory anchor set',
      'Preserved existing curated Cleveland–Akron opportunity records',
      'Generated deterministic synthetic baseline metrics for all remaining Ohio ZCTAs',
    ],
    businessDataNotice:
      'All opportunity, territory, campaign, account, competitor, recommendation, and simulation values are synthetic demonstration data.',
  };

  await mkdir(path.dirname(GEOMETRY_OUTPUT), { recursive: true });
  await writeFile(GEOMETRY_OUTPUT, `${JSON.stringify(geometry)}\n`);
  await writeFile(OPPORTUNITY_OUTPUT, `${JSON.stringify(payload)}\n`);
  await writeFile(PROVENANCE_OUTPUT, `${JSON.stringify(provenance, null, 2)}\n`);

  console.log(`Generated ${geometry.features.length} Ohio ZCTAs across ${territories.length} territories.`);
  console.log(`Preserved ${opportunities.filter((record) => record.detailLevel === 'curated-demo').length} curated ZIP records.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
