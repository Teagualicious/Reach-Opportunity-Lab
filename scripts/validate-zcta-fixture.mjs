import { readFile } from 'node:fs/promises';
import process from 'node:process';

const OPPORTUNITY_DATA = 'public/data/zip-opportunities.json';
const GEOMETRY_DATA = 'public/data/cleveland-akron-zcta-2020.geojson';
const PROVENANCE_DATA = 'public/data/cleveland-akron-zcta-2020.provenance.json';
const ZIP_PATTERN = /^\d{5}$/;

async function loadJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function visitPositions(value, visitor) {
  if (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    visitor(value[0], value[1]);
    return;
  }

  if (Array.isArray(value)) {
    for (const child of value) visitPositions(child, visitor);
  }
}

async function main() {
  const [opportunityPayload, geometry, provenance] = await Promise.all([
    loadJson(OPPORTUNITY_DATA),
    loadJson(GEOMETRY_DATA),
    loadJson(PROVENANCE_DATA),
  ]);

  const expectedZips = opportunityPayload?.opportunities?.map((record) => record.zip);
  if (!Array.isArray(expectedZips) || expectedZips.length === 0) {
    throw new Error(`${OPPORTUNITY_DATA} does not contain ZIP opportunity records`);
  }

  if (geometry?.type !== 'FeatureCollection' || !Array.isArray(geometry.features)) {
    throw new Error(`${GEOMETRY_DATA} is not a GeoJSON FeatureCollection`);
  }

  const actualZips = geometry.features.map((feature, index) => {
    const zip = feature?.properties?.zip;
    if (typeof zip !== 'string' || !ZIP_PATTERN.test(zip)) {
      throw new Error(`Geometry feature ${index} has an invalid ZIP property`);
    }
    if (!feature.geometry || !['Polygon', 'MultiPolygon'].includes(feature.geometry.type)) {
      throw new Error(`Geometry feature ${zip} is not Polygon or MultiPolygon geometry`);
    }

    let positionCount = 0;
    visitPositions(feature.geometry.coordinates, (longitude, latitude) => {
      positionCount += 1;
      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        throw new Error(`Geometry feature ${zip} contains a non-finite coordinate`);
      }
      if (longitude < -85 || longitude > -80 || latitude < 38 || latitude > 42.5) {
        throw new Error(`Geometry feature ${zip} contains a coordinate outside Ohio bounds`);
      }
    });

    if (positionCount < 4) {
      throw new Error(`Geometry feature ${zip} does not contain a valid polygon ring`);
    }

    return zip;
  });

  if (new Set(actualZips).size !== actualZips.length) {
    throw new Error(`${GEOMETRY_DATA} contains duplicate ZIP features`);
  }

  if (JSON.stringify(actualZips) !== JSON.stringify(expectedZips)) {
    throw new Error(
      `${GEOMETRY_DATA} ZIP order does not exactly match ${OPPORTUNITY_DATA}`,
    );
  }

  if (geometry.metadata?.censusVintage !== '2020 Census') {
    throw new Error(`${GEOMETRY_DATA} is missing 2020 Census metadata`);
  }
  if (geometry.metadata?.featureCount !== expectedZips.length) {
    throw new Error(`${GEOMETRY_DATA} metadata feature count is incorrect`);
  }
  if (provenance?.censusVintage !== '2020 Census') {
    throw new Error(`${PROVENANCE_DATA} is missing 2020 Census provenance`);
  }
  if (provenance?.refreshCommand !== 'node scripts/build-zcta-fixture.mjs') {
    throw new Error(`${PROVENANCE_DATA} does not document the fixture refresh command`);
  }

  console.log(`Validated ${actualZips.length} checked-in 2020 ZCTA features.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
