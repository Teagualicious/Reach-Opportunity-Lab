import { useEffect, useMemo, useState } from 'react';
import type { OpportunityMarket } from '../data/OpportunityRepository';
import { DemoOpportunityRepository } from '../data/DemoOpportunityRepository';
import { ProductShell } from './ProductShell';

export function App() {
  const repository = useMemo(() => new DemoOpportunityRepository(), []);
  const [market, setMarket] = useState<OpportunityMarket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    repository
      .loadMarket('cleveland-akron')
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
  }, [repository]);

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
        <span>Loading market intelligence</span>
      </main>
    );
  }

  return <ProductShell data={market} />;
}
