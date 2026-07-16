import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductViewContext } from '../../app/ProductViewContext';
import type { OpportunityMarket } from '../../data/OpportunityRepository';
import { MARKET_MODES, getMarketModeScore, type MarketModeId } from '../../domain/marketMode';
import { OpportunityMap } from '../../map/OpportunityMap';

interface MarketGrowthStudioProps {
  data: OpportunityMarket;
  resetVersion: number;
  view: ProductViewContext;
}

const numberFormatter = new Intl.NumberFormat('en-US');

const FICTIONAL_PROSPECTS: Readonly<Record<string, string>> = {
  Automotive: 'Lakeside European Auto',
  Healthcare: 'Greenline Family Dental',
  'Home Services': 'North Coast Home Renovation',
  Legal: 'Summit Legal Partners',
  Restaurants: 'Harbor Table Group',
  Retail: 'Lakefront Home Market',
  'Financial Services': 'Summit Financial Partners',
  Recruitment: 'Northstar Talent Solutions',
};

export function MarketGrowthStudio({ data, resetVersion, view }: MarketGrowthStudioProps) {
  const [mode, setMode] = useState<MarketModeId>('new-business');
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);

  const territoryZipSet = useMemo(() => new Set(view.territoryZips), [view.territoryZips]);
  const territoryOpportunities = useMemo(
    () => data.opportunities.filter((opportunity) => territoryZipSet.has(opportunity.zip)),
    [data.opportunities, territoryZipSet],
  );

  useEffect(() => {
    setMode('new-business');
    setSimulated(false);
  }, [resetVersion]);

  useEffect(() => setSimulated(false), [mode, selectedZip]);

  const definition = MARKET_MODES.find((candidate) => candidate.id === mode) ?? MARKET_MODES[0];
  const scores = useMemo(
    () => Object.fromEntries(data.opportunities.map((opportunity) => [opportunity.zip, getMarketModeScore(opportunity, mode)])),
    [data.opportunities, mode],
  );
  const ranked = useMemo(
    () => [...territoryOpportunities].sort((a, b) => scores[b.zip] - scores[a.zip]).slice(0, 8),
    [scores, territoryOpportunities],
  );

  useEffect(() => {
    setSelectedZip(ranked[0]?.zip ?? null);
    setSimulated(false);
  }, [ranked, view.selectedTerritoryId]);

  const selected = data.opportunities.find((opportunity) => opportunity.zip === selectedZip) ?? ranked[0];
  const selectedScore = selected ? scores[selected.zip] : 0;
  const projectedScore = simulated ? Math.min(100, selectedScore + 9) : selectedScore;
  const handleSelectZip = useCallback((zip: string | null) => setSelectedZip(zip), []);
  const territoryName = view.selectedTerritory?.name ?? 'All Ohio';

  return (
    <main className="studio-grid market-studio product-grid">
      <aside className="panel panel--left">
        <div className="panel__heading">
          <span className="eyebrow">Market Growth Studio</span>
          <h1>{territoryName}</h1>
          <p>Find, protect, and grow local business using objective-specific ZIP intelligence.</p>
        </div>

        <div className="internal-mode-list" role="tablist" aria-label="Market growth objective">
          {MARKET_MODES.map((candidate) => (
            <button
              key={candidate.id}
              className={candidate.id === mode ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={candidate.id === mode}
              onClick={() => setMode(candidate.id)}
            >
              {candidate.label}
            </button>
          ))}
        </div>

        <section className="mode-question">
          <span>{definition.scoreLabel}</span>
          <strong>{definition.question}</strong>
        </section>

        <section className="panel-section panel-section--grow">
          <div className="section-heading"><span>Priority ZIPs</span><small>{territoryName}</small></div>
          <div className="ranked-list">
            {ranked.map((opportunity, index) => (
              <button
                className={`ranked-item ${selected?.zip === opportunity.zip ? 'is-selected' : ''}`}
                key={opportunity.zip}
                type="button"
                onClick={() => setSelectedZip(opportunity.zip)}
              >
                <span className="ranked-item__rank">{index + 1}</span>
                <span className="ranked-item__body"><strong>{opportunity.name}</strong><small>ZIP {opportunity.zip} · {opportunity.categoryStrength}</small></span>
                <span className="ranked-item__score">{scores[opportunity.zip]}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="synthetic-notice"><span className="synthetic-notice__dot" />Internal scenarios, territories, prospects, and performance signals are synthetic.</div>
      </aside>

      <section className="map-stage">
        <OpportunityMap
          data={data}
          selectedZip={selected?.zip ?? null}
          resetVersion={resetVersion}
          onSelectZip={handleSelectZip}
          displayScores={scores}
          campaignZips={selected ? [selected.zip] : []}
          territoryZips={view.territoryZips}
          viewportBounds={view.viewportBounds}
          layoutVersion={view.panelLayoutVersion}
        />
        <div className="map-stage__caption"><span>{definition.label}</span><strong>{territoryName} is recolored for this internal objective</strong></div>
      </section>

      <aside className="panel panel--right internal-detail">
        {selected && (
          <>
            <div className="internal-score-hero">
              <span className="eyebrow">{definition.scoreLabel}</span>
              <h2>{selected.name}</h2>
              <p>ZIP {selected.zip} · {selected.categoryStrength}</p>
              <strong>{projectedScore}<small>/100</small></strong>
              {simulated && <em>+{projectedScore - selectedScore} modeled improvement</em>}
            </div>

            <section className="detail-section">
              <span className="detail-section__label">Market signals</span>
              <dl className="metric-grid">
                <div><dt>Households</dt><dd>{numberFormatter.format(selected.householdCount)}</dd></div>
                <div><dt>Base opportunity</dt><dd>{selected.score}/100</dd></div>
                <div><dt>Strongest category</dt><dd>{selected.categoryStrength}</dd></div>
              </dl>
            </section>

            <section className="fictional-prospect-card">
              <span>Fictional example</span>
              <strong>{FICTIONAL_PROSPECTS[selected.categoryStrength] ?? 'Ohio Local Business'}</strong>
              <p>{mode === 'retention-risk' ? 'Spend and reach signals suggest a proactive save conversation.' : 'Category and audience signals suggest a timely seller conversation.'}</p>
            </section>

            <section className="recommended-action">
              <span>Recommended action</span>
              <strong>{definition.action}</strong>
              <p>{simulated ? `The illustrative action improves the modeled score within ${territoryName}.` : 'Run a simple action simulation to compare the current and recommended state.'}</p>
            </section>

            <button className="primary-action" type="button" onClick={() => setSimulated((value) => !value)}>
              {simulated ? 'Return to current state' : 'Simulate recommended action'}
            </button>
            <p className="model-disclosure">Illustrative synthetic results. No real account, prospect, or revenue data is shown.</p>
          </>
        )}
      </aside>
    </main>
  );
}
