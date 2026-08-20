import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
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

if (htmlStats.size < 1_000_000) {
  throw new Error(`Offline review HTML is unexpectedly small: ${htmlStats.size} bytes`);
}

function extractScriptBlocks(documentHtml) {
  const lowerHtml = documentHtml.toLowerCase();
  const blocks = [];
  let cursor = 0;

  while (true) {
    const openIndex = lowerHtml.indexOf('<script', cursor);
    if (openIndex < 0) break;

    const openEnd = documentHtml.indexOf('>', openIndex);
    if (openEnd < 0) {
      throw new Error(`Offline review contains an unterminated script opening tag at byte ${openIndex}`);
    }

    const closeIndex = lowerHtml.indexOf('</script>', openEnd + 1);
    if (closeIndex < 0) {
      throw new Error(`Offline review contains an unclosed script tag at byte ${openIndex}`);
    }

    blocks.push({
      openTag: documentHtml.slice(openIndex, openEnd + 1),
      content: documentHtml.slice(openEnd + 1, closeIndex),
    });
    cursor = closeIndex + '</script>'.length;
  }

  return blocks;
}

const scriptBlocks = extractScriptBlocks(html);
const moduleScripts = scriptBlocks.filter((block) => /\btype="module"/i.test(block.openTag));
if (moduleScripts.length !== 1) {
  throw new Error(`Offline review must contain exactly one inline module script; found ${moduleScripts.length}`);
}

const generatedAssetReferences = [...new Set(html.match(/\/assets\/[A-Za-z0-9._-]+/g) ?? [])];
if (generatedAssetReferences.length > 0) {
  throw new Error(
    `Offline review still contains generated asset references: ${generatedAssetReferences.join(', ')}`,
  );
}

async function validateInlineModule(javascript) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'opportunity-lab-offline-'));
  const modulePath = path.join(tempDir, 'offline-module.mjs');

  try {
    await writeFile(modulePath, javascript, 'utf8');
    execFileSync(process.execPath, ['--check', modulePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stderr = error?.stderr?.toString().trim();
    const detail = stderr ? `\n${stderr}` : '';
    throw new Error(`Offline review inline module is not valid JavaScript.${detail}`);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

await validateInlineModule(moduleScripts[0].content);

const documentShell = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>');

if (/<script\b[^>]*\bsrc\s*=/i.test(documentShell)) {
  throw new Error('Offline review contains an external script document dependency');
}
if (/<link\b[^>]*\bhref\s*=/i.test(documentShell)) {
  throw new Error('Offline review contains an external linked document dependency');
}

for (const forbidden of [
  '__vite__mapDeps',
  'assets/main-',
  'return nativeFetch(input',
]) {
  if (html.includes(forbidden)) {
    throw new Error(`Offline review still contains a split or unguarded runtime dependency: ${forbidden}`);
  }
}

for (const required of [
  '/data/ohio-opportunities.json',
  '/data/market-overlays.json',
  '/data/ohio-zcta-2020.geojson',
  '/data/offline-map-context.geojson',
  'data:font/woff2;base64,',
  'data:image/',
  'cleveland-akron',
  'columbus-central',
  'cincinnati-southwest',
  'Offline review blocked external request:',
  'Opportunity Lab',
]) {
  if (!html.includes(required)) {
    throw new Error(`Offline review is missing required embedded content: ${required}`);
  }
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
console.log({
  htmlBytes: htmlStats.size,
  scriptBlocks: scriptBlocks.length,
  inlineModuleBytes: Buffer.byteLength(moduleScripts[0].content),
  embeddedAssets: {
    fonts: (html.match(/data:font\/woff2;base64,/g) ?? []).length,
    images: (html.match(/data:image\/[^;]+;base64,/g) ?? []).length,
  },
  featureCounts: kindCounts,
});
