import { useEffect, useState } from 'react';
import type { OpportunityMarket } from '../data/OpportunityRepository';
import { ManifestOpportunityRepository } from '../data/ManifestOpportunityRepository';
import { assertMarketManifest, type MarketManifest } from '../domain/marketPackage';
import { publicAssetUrl } from '../data/publicAssetUrl';
import { ProductShell } from './ProductShell';

async function loadManifestMarket(): Promise<OpportunityMarket> {
  const manifestUrl = publicAssetUrl('data/market-manifest.json');
  const manifestResponse = await fetch(manifestUrl);
  if (!manifestResponse.ok) {
    throw new Error(
      `Unable to load market manifest: ${manifestResponse.status} ${manifestResponse.statusText}`,
    );
  }
  const raw: unknown = await manifestResponse.json();
  assertMarketManifest(raw);
  const manifest = raw as MarketManifest;
  const repository = new ManifestOpportunityRepository(manifest);
  return repository.loadMarket(manifest.defaultMarketId);
}

export function App() {
  const [market, setMarket] = useState<OpportunityMarket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadManifestMarket()
      .then((loadedMarket) => {
        if (!cancelled) setMarket(loadedMarket);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Unable to load opportunity market');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <main className="load-state load-state--error">
        <span>Opportunity Lab</span>
        <h1>The demonstration data could not be loaded.</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!market) {
    return (
      <main className="load-state">
        <div className="load-state__mark" />
        <span>Loading statewide market intelligence</span>
      </main>
    );
  }

  return <ProductShell data={market} />;
}
