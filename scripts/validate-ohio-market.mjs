import { readFile, stat } from 'node:fs/promises';

const GEOMETRY_PATH = 'public/data/ohio-zcta-2020.geojson';
const OPPORTUNITY_PATH = 'public/data/ohio-opportunities.json';
const PROVENANCE_PATH = 'public/data/ohio-market.provenance.json';
const ZIP_PATTERN = /^\d{5}$/;
const COMPONENT_MAXIMUMS = {
  audiencePotential: 25,
  reachGap: 20,
  searchOpportunity: 15,
  geographicPotential: 15,
  categoryPotential: 15,
  competitiveConditions: 10,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function visitPositions(value, callback) {
  if (!Array.isArray(value)) return;
  if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
    callback(value[0], value[1]);
    return;
  }
  for (const child of value) visitPositions(child, callback);
}

const geometry = JSON.parse(await readFile(GEOMETRY_PATH, 'utf8'));
const payload = JSON.parse(await readFile(OPPORTUNITY_PATH, 'utf8'));
const provenance = JSON.parse(await readFile(PROVENANCE_PATH, 'utf8'));
const geometryStats = await stat(GEOMETRY_PATH);
const opportunityStats = await stat(OPPORTUNITY_PATH);

assert(geometry.type === 'FeatureCollection', 'Ohio geometry must be a FeatureCollection');
assert(Array.isArray(geometry.features), 'Ohio geometry features must be an array');
assert(geometry.features.length > 800, 'Ohio geometry contains too few ZCTAs');
assert(geometryStats.size > 500_000, 'Ohio geometry file is unexpectedly small');
assert(opportunityStats.size > 250_000, 'Ohio opportunity file is unexpectedly small');
assert(payload?.market?.id === 'ohio', 'Ohio opportunity market id is invalid');
assert(Array.isArray(payload.market.territories), 'Ohio market territories are missing');
assert(payload.market.territories.length >= 7, 'Ohio market contains too few territories');
assert(Array.isArray(payload.opportunities), 'Ohio opportunity records are missing');
assert(
  payload.opportunities.length === geometry.features.length,
  'Ohio opportunity and geometry record counts do not match',
);

const geometryZips = new Set();
const territoryGeometryCounts = new Map();
for (const [index, feature] of geometry.features.entries()) {
  const zip = feature?.properties?.zip;
  const territoryId = feature?.properties?.territoryId;
  assert(typeof zip === 'string' && ZIP_PATTERN.test(zip), `Geometry feature ${index} has an invalid ZIP`);
  assert(!geometryZips.has(zip), `Geometry contains duplicate ZIP ${zip}`);
  assert(typeof territoryId === 'string' && territoryId.length > 0, `Geometry ZIP ${zip} has no territory`);
  assert(['Polygon', 'MultiPolygon'].includes(feature?.geometry?.type), `Geometry ZIP ${zip} is not polygonal`);
  visitPositions(feature.geometry.coordinates, (longitude, latitude) => {
    assert(longitude >= -85 && longitude <= -80, `ZIP ${zip} longitude is outside Ohio range`);
    assert(latitude >= 38 && latitude <= 43, `ZIP ${zip} latitude is outside Ohio range`);
  });
  geometryZips.add(zip);
  territoryGeometryCounts.set(territoryId, (territoryGeometryCounts.get(territoryId) ?? 0) + 1);
}

const opportunityZips = new Set();
let curatedCount = 0;
for (const record of payload.opportunities) {
  assert(typeof record.zip === 'string' && ZIP_PATTERN.test(record.zip), 'Opportunity record has invalid ZIP');
  assert(!opportunityZips.has(record.zip), `Opportunity records contain duplicate ZIP ${record.zip}`);
  assert(geometryZips.has(record.zip), `Opportunity ZIP ${record.zip} has no geometry`);
  assert(typeof record.territoryId === 'string', `Opportunity ZIP ${record.zip} has no territory`);
  assert(
    typeof record.countyId === 'string' && record.countyId.length > 0,
    `Opportunity ZIP ${record.zip} has no county id`,
  );
  assert(
    typeof record.countyName === 'string' && record.countyName.length > 0,
    `Opportunity ZIP ${record.zip} has no county name`,
  );
  assert(['curated-demo', 'statewide-baseline'].includes(record.detailLevel), `Opportunity ZIP ${record.zip} has invalid detail level`);
  assert(Number.isFinite(record.score) && record.score >= 0 && record.score <= 100, `Opportunity ZIP ${record.zip} has invalid score`);
  let componentTotal = 0;
  for (const [key, maximum] of Object.entries(COMPONENT_MAXIMUMS)) {
    const value = record.components?.[key];
    assert(Number.isFinite(value) && value >= 0 && value <= maximum, `Opportunity ZIP ${record.zip} has invalid ${key}`);
    componentTotal += value;
  }
  assert(componentTotal === record.score, `Opportunity ZIP ${record.zip} component total does not equal score`);
  if (record.detailLevel === 'curated-demo') curatedCount += 1;
  opportunityZips.add(record.zip);
}
assert(curatedCount >= 20, 'Curated Cleveland–Akron records were not preserved');
const countyIds = new Set(payload.opportunities.map((record) => record.countyId));
assert(countyIds.size >= 80, `Expected ZCTAs across at least 80 Ohio counties, found ${countyIds.size}`);

const territoryIds = new Set();
const coveredZips = new Set();
for (const territory of payload.market.territories) {
  assert(typeof territory.id === 'string' && territory.id.length > 0, 'Territory has invalid id');
  assert(!territoryIds.has(territory.id), `Duplicate territory id ${territory.id}`);
  assert(Array.isArray(territory.zips) && territory.zips.length > 0, `Territory ${territory.id} has no ZIPs`);
  assert(Array.isArray(territory.bounds) && territory.bounds.length === 4, `Territory ${territory.id} has invalid bounds`);
  for (const zip of territory.zips) {
    assert(geometryZips.has(zip), `Territory ${territory.id} references unknown ZIP ${zip}`);
    assert(!coveredZips.has(zip), `ZIP ${zip} belongs to multiple territories`);
    coveredZips.add(zip);
  }
  territoryIds.add(territory.id);
}
assert(coveredZips.size === geometryZips.size, 'Territories do not cover every Ohio ZCTA exactly once');
assert(territoryIds.has(payload.market.defaultTerritoryId), 'Default territory does not exist');
assert(provenance.censusVintage === '2020 Census', 'Ohio market provenance has wrong Census vintage');
assert(typeof provenance.businessDataNotice === 'string', 'Ohio market provenance lacks business-data notice');

console.log('Ohio statewide market validation passed.');
console.log({
  zctaCount: geometry.features.length,
  territoryCount: payload.market.territories.length,
  curatedCount,
  baselineCount: payload.opportunities.length - curatedCount,
  territoryGeometryCounts: Object.fromEntries(territoryGeometryCounts),
});
