import { useState } from 'react';
import type { OpportunityMarket } from '../data/OpportunityRepository';
import { ClientGrowthStudio } from '../features/client-growth/ClientGrowthStudio';
import { MarketGrowthStudio } from '../features/market-growth/MarketGrowthStudio';
import { ZipExplorer } from '../features/zip-explorer/ZipExplorer';

export type ProductMode = 'explorer' | 'client-growth' | 'market-growth';

interface ProductShellProps {
  data: OpportunityMarket;
}

const MODE_LABELS: Readonly<Record<ProductMode, string>> = {
  explorer: 'Opportunity Explorer',
  'client-growth': 'Client Growth Studio',
  'market-growth': 'Market Growth Studio',
};

export function ProductShell({ data }: ProductShellProps) {
  const [mode, setMode] = useState<ProductMode>('explorer');
  const [resetVersion, setResetVersion] = useState(0);

  return (
    <div className="explorer-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div>
            <span className="brand-kicker">Spectrum Reach</span>
            <strong>Opportunity Lab</strong>
          </div>
        </div>
        <div className="mode-switch" role="tablist" aria-label="Product mode">
          {(Object.keys(MODE_LABELS) as ProductMode[]).map((candidate) => (
            <button
              key={candidate}
              className={`mode-switch__button ${mode === candidate ? 'is-active' : ''}`}
              type="button"
              role="tab"
              aria-selected={mode === candidate}
              onClick={() => setMode(candidate)}
            >
              {MODE_LABELS[candidate]}
            </button>
          ))}
        </div>
        <button className="reset-button" type="button" onClick={() => setResetVersion((version) => version + 1)}>Reset view</button>
      </header>

      {mode === 'explorer' && <ZipExplorer data={data} resetVersion={resetVersion} />}
      {mode === 'client-growth' && <ClientGrowthStudio data={data} resetVersion={resetVersion} />}
      {mode === 'market-growth' && <MarketGrowthStudio data={data} resetVersion={resetVersion} />}
    </div>
  );
}
