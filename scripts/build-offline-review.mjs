import { execFileSync } from 'node:child_process';
import { chmod, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_DIR = path.join(ROOT, 'offline-build');
const OUTPUT_ROOT = path.join(ROOT, 'offline-dist');
const PACKAGE_DIR = path.join(OUTPUT_ROOT, 'Opportunity-Lab-All-Offline');
const OUTPUT_HTML = path.join(PACKAGE_DIR, 'Opportunity-Lab-All-Offline.html');

const EMBEDDED_DATA_PATHS = [
  '/data/ohio-opportunities.json',
  '/data/market-overlays.json',
  '/data/ohio-zcta-2020.geojson',
  '/data/offline-map-context.geojson',
];

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function buildOfflineEntry() {
  execFileSync(
    npmCommand,
    [
      'exec',
      '--',
      'vite',
      'build',
      '--mode',
      'offline-review',
      '--outDir',
      BUILD_DIR,
      '--emptyOutDir',
    ],
    {
      cwd: ROOT,
      stdio: 'inherit',
    },
  );
}

async function inlineStyles(html) {
  const stylePattern = /<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
  const matches = [...html.matchAll(stylePattern)];
  let result = html;

  for (const match of matches) {
    const assetPath = match[1].replace(/^\//, '');
    const css = await readFile(path.join(BUILD_DIR, assetPath), 'utf8');
    result = result.replace(match[0], `<style>${css}</style>`);
  }

  return result;
}

async function inlineApplication(html) {
  const scriptPattern = /<script\s+type="module"[^>]*src="([^"]+)"[^>]*><\/script>/;
  const match = html.match(scriptPattern);
  if (!match) throw new Error('Offline Vite output does not contain an application module script');

  const assetPath = match[1].replace(/^\//, '');
  const javascript = (await readFile(path.join(BUILD_DIR, assetPath), 'utf8')).replace(
    /<\/script/gi,
    '<\\/script',
  );

  return html.replace(match[0], `<script type="module">${javascript}</script>`);
}

async function readEmbeddedData() {
  const entries = await Promise.all(
    EMBEDDED_DATA_PATHS.map(async (urlPath) => {
      const filePath = path.join(ROOT, 'public', urlPath.replace(/^\//, ''));
      const data = JSON.parse(await readFile(filePath, 'utf8'));
      return [urlPath, data];
    }),
  );
  return Object.fromEntries(entries);
}

function offlineFetchShim(embeddedData) {
  const serialized = JSON.stringify(embeddedData).replaceAll('<', '\\u003c');
  return `<script>
(() => {
  const embedded = ${serialized};

  function normalizePath(raw) {
    if (Object.prototype.hasOwnProperty.call(embedded, raw)) return raw;
    try {
      const pathname = new URL(raw, window.location.href).pathname.replace(/\\\\/g, '/');
      const dataIndex = pathname.lastIndexOf('/data/');
      return dataIndex >= 0 ? pathname.slice(dataIndex) : pathname;
    } catch {
      const clean = String(raw).replace(/\\\\/g, '/');
      const dataIndex = clean.lastIndexOf('/data/');
      return dataIndex >= 0 ? clean.slice(dataIndex) : clean;
    }
  }

  window.fetch = (input) => {
    const raw = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : input.url;
    const normalized = normalizePath(raw);

    if (Object.prototype.hasOwnProperty.call(embedded, normalized)) {
      return Promise.resolve(new Response(JSON.stringify(embedded[normalized]), {
        status: 200,
        headers: {
          'Content-Type': normalized.endsWith('.geojson')
            ? 'application/geo+json'
            : 'application/json'
        }
      }));
    }

    return Promise.reject(new TypeError('Offline review blocked external request: ' + String(raw)));
  };
})();
</script>`;
}

async function packageOfflineReview() {
  buildOfflineEntry();

  let html = await readFile(path.join(BUILD_DIR, 'offline.html'), 'utf8');
  html = await inlineStyles(html);
  html = await inlineApplication(html);

  const embeddedData = await readEmbeddedData();
  const shim = offlineFetchShim(embeddedData);
  html = html.replace('<div id="root"></div>', `<div id="root"></div>${shim}`);

  await rm(OUTPUT_ROOT, { recursive: true, force: true });
  await mkdir(PACKAGE_DIR, { recursive: true });
  await writeFile(OUTPUT_HTML, html, 'utf8');

  await writeFile(
    path.join(PACKAGE_DIR, 'OPEN_DEMO.bat'),
    '@echo off\r\nstart "" "%~dp0Opportunity-Lab-All-Offline.html"\r\n',
    'utf8',
  );
  await writeFile(
    path.join(PACKAGE_DIR, 'OPEN_DEMO.command'),
    '#!/bin/sh\ncd "$(dirname "$0")"\nopen "Opportunity-Lab-All-Offline.html"\n',
    'utf8',
  );
  await chmod(path.join(PACKAGE_DIR, 'OPEN_DEMO.command'), 0o755);

  await writeFile(
    path.join(PACKAGE_DIR, 'README.txt'),
    [
      'REACH OPPORTUNITY LAB — ALL-OFFLINE VISUAL REVIEW',
      '',
      'Windows: double-click OPEN_DEMO.bat.',
      'macOS: double-click OPEN_DEMO.command or open Opportunity-Lab-All-Offline.html.',
      '',
      'No Node.js, installation, administrator access, local server, or internet connection is required.',
      '',
      'This review build contains:',
      '- checked-in statewide Ohio 2020 Census-derived ZCTA geometry',
      '- seven synthetic major-city operating territories',
      '- bundled Census TIGER/Line road, hydrography, county, and place context',
      '- synthetic opportunity, campaign, competitor, account, and simulation data',
      '',
      'The normal application continues to use the online OpenStreetMap basemap. This package is a dedicated visual-review distribution target.',
      '',
      'Geographic context source: U.S. Census Bureau TIGER/Line.',
    ].join('\r\n'),
    'utf8',
  );

  console.log(`Created ${path.relative(ROOT, OUTPUT_HTML)}`);
}

await packageOfflineReview();
