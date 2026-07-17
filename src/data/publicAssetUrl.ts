/**
 * Data-fixture version: bump whenever the generated files under public/data
 * change shape (new fields, new files). The query string busts stale HTTP
 * caches on GitHub Pages, where hashed JS bundles update instantly but the
 * stable data URLs can otherwise be served from cache and desync from the
 * code. The offline runtime matches requests by pathname, so the query is
 * ignored there.
 */
const DATA_VERSION = '2026-07-17-county';

export function publicAssetUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${normalizedPath}?v=${DATA_VERSION}`;
}
