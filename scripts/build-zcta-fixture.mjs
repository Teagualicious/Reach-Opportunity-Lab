import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_SOURCE_URL =
  'https://raw.githubusercontent.com/aha1994/ZCTA2020/refs/heads/main/2020%20Census%20Simplified/Ohio_ZCTAs_simplified_2020.json';
const DEFAULT_OUTPUT = 'public/data/cleveland-akron-zcta-2020.geojson';
const DEFAULT_PROVENANCE = 'public/data/cleveland-akron-zcta-2020.provenance.json';
const OPPORTUNITY_DATA = 'public/data/zip-opportunities.json';
const ZIP_PATTERN = /^\d{5}$/;
const ZIP_PROPERTY_CANDIDATES = [
  'ZCTA5CE20',
  'GEOID20',
  'ZCTA5CE10',
  'ZCTA5',
  'GEOID',
  'zip',
];

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value`);
  }
  return value;
}

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

function roundCoordinates(value) {
  if (typeof value === 'number') return Number(value.toFixed(5));
  if (Array.isArray(value)) return value.map(roundCoordinates);
  return value;
}

function normalizeFeature(feature, zip) {
  if (!feature?.geometry || !['Polygon', 'MultiPolygon'].includes(feature.geometry.type)) {
    throw new Error(`ZCTA ${zip} does not contain Polygon or MultiPolygon geometry`);
  }

  return {
    type: 'Feature',
    id: zip,
    properties: {
      zip,
      ZCTA5: zip,
      GEOID: zip,
    },
    geometry: {
      ...feature.geometry,
      coordinates: roundCoordinates(feature.geometry.coordinates),
    },
  };
}

async function loadJsonFile(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function fetchSource(sourceUrl) {
  const response = await fetch(sourceUrl, {
    headers: {
      'User-Agent': 'Reach-Opportunity-Lab geometry fixture builder',
      Accept: 'application/geo+json, application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to download ZCTA source: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function main() {
  const sourceUrl = readArgument('--source-url', DEFAULT_SOURCE_URL);
  const outputPath = readArgument('--output', DEFAULT_OUTPUT);
  const provenancePath = readArgument('--provenance', DEFAULT_PROVENANCE);

  const opportunityPayload = await loadJsonFile(OPPORTUNITY_DATA);
  const targetZips = opportunityPayload?.opportunities?.map((record) => record.zip);
  if (!Array.isArray(targetZips) || targetZips.length === 0) {
    throw new Error(`${OPPORTUNITY_DATA} does not contain opportunity ZIP records`);
  }
  if (targetZips.some((zip) => typeof zip !== 'string' || !ZIP_PATTERN.test(zip))) {
    throw new Error(`${OPPORTUNITY_DATA} contains an invalid ZIP identifier`);
  }
  if (new Set(targetZips).size !== targetZips.length) {
    throw new Error(`${OPPORTUNITY_DATA} contains duplicate ZIP identifiers`);
  }

  const source = await fetchSource(sourceUrl);
  assertFeatureCollection(source, 'Downloaded ZCTA source');

  const sourceByZip = new Map();
  for (const feature of source.features) {
    const zip = getFeatureZip(feature);
    if (zip && !sourceByZip.has(zip)) sourceByZip.set(zip, feature);
  }

  const missingZips = targetZips.filter((zip) => !sourceByZip.has(zip));
  if (missingZips.length > 0) {
    throw new Error(`Downloaded ZCTA source is missing ZIPs: ${missingZips.join(', ')}`);
  }

  const features = targetZips.map((zip) => normalizeFeature(sourceByZip.get(zip), zip));
  const fixture = {
    type: 'FeatureCollection',
    metadata: {
      title: 'Cleveland–Akron Opportunity Lab ZCTA subset',
      sourceDataset: '2020 Census Simplified ZCTA geometry',
      sourceUrl,
      sourceRepository: 'aha1994/ZCTA2020',
      censusVintage: '2020 Census',
      generatedBy: 'scripts/build-zcta-fixture.mjs',
      coordinatePrecision: 5,
      featureCount: features.length,
    },
    features,
  };

  const provenance = {
    title: fixture.metadata.title,
    geometryType: 'ZIP Code Tabulation Area (ZCTA)',
    censusVintage: fixture.metadata.censusVintage,
    sourceDataset: fixture.metadata.sourceDataset,
    sourceRepository: fixture.metadata.sourceRepository,
    sourceUrl,
    transformation: [
      `Filtered to the ${features.length} ZIP identifiers in ${OPPORTUNITY_DATA}`,
      'Normalized ZIP properties to zip, ZCTA5, and GEOID',
      'Rounded coordinates to five decimal places for browser delivery',
      'Preserved Polygon and MultiPolygon topology from the source fixture',
    ],
    refreshCommand: 'node scripts/build-zcta-fixture.mjs',
    businessDataNotice:
      'This file contains public geographic boundaries only. Opportunity, campaign, account, and competitor data remain synthetic.',
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(fixture)}\n`);
  await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);

  const byteLength = Buffer.byteLength(JSON.stringify(fixture));
  console.log(`Wrote ${features.length} ZCTAs to ${outputPath} (${byteLength.toLocaleString()} bytes)`);
  console.log(`Wrote provenance to ${provenancePath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
