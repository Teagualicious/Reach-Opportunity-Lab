import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HTML_PATH = path.join(
  ROOT,
  'offline-dist/Opportunity-Lab-All-Offline/Opportunity-Lab-All-Offline.html',
);
const CONTEXT_PATH = path.join(ROOT, 'public/data/offline-map-context.geojson');

const html = await readFile(HTML_PATH, 'utf8');
const context = JSON.parse(await readFile(CONTEXT_PATH, 'utf8'));
const htmlStats = await stat(HTML_PATH);

if (htmlStats.size < 500_000) {
  throw new Error(`Offline review HTML is unexpectedly small: ${htmlStats.size} bytes`);
}

for (const forbidden of [
  '<script type="module" crossorigin src=',
  '<link rel="stylesheet" crossorigin href=',
]) {
  if (html.includes(forbidden)) {
    throw new Error(`Offline review still contains an external document dependency: ${forbidden}`);
  }
}

for (const required of [
  '/data/zip-opportunities.json',
  '/data/market-overlays.json',
  '/data/cleveland-akron-zcta-2020.geojson',
  '/data/offline-map-context.geojson',
  'Offline review blocked external request:',
  'Opportunity Lab',
]) {
  if (!html.includes(required)) {
    throw new Error(`Offline review is missing required embedded content: ${required}`);
  }
}

if (html.includes('return nativeFetch(input')) {
  throw new Error('Offline review fetch shim still permits unapproved runtime network requests');
}

if (context.type !== 'FeatureCollection' || !Array.isArray(context.features)) {
  throw new Error('Offline map context must be a GeoJSON FeatureCollection');
}

const kindCounts = context.features.reduce((counts, feature) => {
  const kind = feature?.properties?.kind;
  if (typeof kind !== 'string') throw new Error('Offline context feature is missing a kind');
  counts[kind] = (counts[kind] ?? 0) + 1;
  return counts;
}, {});

if ((kindCounts.road ?? 0) < 10) throw new Error('Offline context contains too few roads');
if ((kindCounts['water-area'] ?? 0) < 1) throw new Error('Offline context has no water areas');
if ((kindCounts.county ?? 0) < 1) throw new Error('Offline context has no county boundaries');
if ((kindCounts['place-label'] ?? 0) < 10) throw new Error('Offline context has too few place labels');

console.log('Offline review validation passed.');
console.log({ htmlBytes: htmlStats.size, featureCounts: kindCounts });
