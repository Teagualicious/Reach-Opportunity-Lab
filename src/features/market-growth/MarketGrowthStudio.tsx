import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductViewContext } from '../../app/ProductViewContext';
import { ExperienceGuide } from '../../components/ExperienceGuide';
import type { OpportunityMarket } from '../../data/OpportunityRepository';
import { MARKET_MODES, getMarketModeScore, type MarketModeId } from '../../domain/marketMode';
import { buildSellerOpportunity } from '../../domain/sellerOpportunity';
import { OpportunityMap } from '../../map/OpportunityMap';

interface MarketGrowthStudioProps {
  data: OpportunityMarket;
  resetVersion: number;
  view: ProductViewContext;
}

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function MarketGrowthStudio({ data, resetVersion, view }: MarketGrowthStudioProps) {
  const [mode, setMode] = useState<MarketModeId>('new-business');
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [showOutreach, setShowOutreach] = useState(false);

  const territoryZipSet = useMemo(() => new Set(view.territoryZips), [view.territoryZips]);
  const territoryOpportunities = useMemo(
    () => data.opportunities.filter((opportunity) => territoryZipSet.has(opportunity.zip)),
    [data.opportunities, territoryZipSet],
  );

  useEffect(() => {
    setMode('new-business');
    setSimulated(false);
    setShowOutreach(false);
  }, [resetVersion]);

  useEffect(() => {
    setSimulated(false);
    setShowOutreach(false);
  }, [mode, selectedZip]);

  const definition = MARKET_MODES.find((candidate) => candidate.id === mode) ?? MARKET_MODES[0];
  const scores = useMemo(
    () => Object.fromEntries(data.opportunities.map((opportunity) => [opportunity.zip, getMarketModeScore(opportunity, mode)])),
    [data.opportunities, mode],
  );
  const ranked = useMemo(
    () => [...territoryOpportunities].sort((a, b) => scores[b.zip] - scores[a.zip]).slice(0, 8),
    [scores, territoryOpportunities],
  );
  const actionQueue = useMemo(
    () => ranked.map((opportunity, index) => buildSellerOpportunity(opportunity, mode, scores[opportunity.zip], index)),
    [mode, ranked, scores],
  );

  useEffect(() => {
    setSelectedZip(ranked[0]?.zip ?? null);
    setSimulated(false);
  }, [ranked, view.selectedTerritoryId]);

  const selected = (selectedZip ? data.opportunitiesByZip.get(selectedZip) : undefined) ?? ranked[0];
  const selectedIndex = selected ? Math.max(0, ranked.findIndex((opportunity) => opportunity.zip === selected.zip)) : 0;
  const selectedItem = selected
    ? buildSellerOpportunity(selected, mode, scores[selected.zip], selectedIndex)
    : null;
  const selectedScore = selectedItem?.priorityScore ?? 0;
  const projectedScore = simulated ? Math.min(100, selectedScore + 9) : selectedScore;
  const handleSelectZip = useCallback((zip: string | null) => setSelectedZip(zip), []);
  const territoryName = view.selectedTerritory?.name ?? 'All Ohio';

  return (
    <main className="studio-grid market-studio product-grid">
      <aside className="panel panel--left seller-workspace-controls">
        <div className="panel__heading">
          <span className="eyebrow">Seller Action Center</span>
          <h1>{territoryName}</h1>
          <p>Turn ZIP intelligence into a prioritized prospect, growth, and retention action queue.</p>
        </div>

        <div className="internal-mode-list" role="tablist" aria-label="Seller growth objective">
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
          <div className="section-heading"><span>Seller action queue</span><small>{territoryName}</small></div>
          <div className="seller-queue">
            {actionQueue.map((item) => (
              <button
                className={`seller-queue-item seller-queue-item--${item.tone} ${selected?.zip === item.zip ? 'is-selected' : ''}`}
                key={item.id}
                type="button"
                onClick={() => setSelectedZip(item.zip)}
              >
                <span className={`seller-status seller-status--${item.tone}`}>{item.entityKind}</span>
                <strong>{item.entityName}</strong>
                <small>{item.urgencyLabel} · ZIP {item.zip}</small>
                <b>{item.priorityScore}</b>
              </button>
            ))}
          </div>
        </section>

        <div className="synthetic-notice"><span className="synthetic-notice__dot" />Seller queue, accounts, prospects, and performance signals are synthetic.</div>
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
        <div className="map-stage__caption"><span>Geographic evidence</span><strong>{selectedItem ? `${selectedItem.entityName} · ${definition.label}` : definition.label}</strong></div>
      </section>

      <aside className="panel panel--right seller-action-detail">
        <ExperienceGuide
          tone="seller"
          title="Seller Action Center"
          audience="Local sellers and sales managers"
          purpose="Turn market intelligence into a prioritized list of prospects and accounts to pursue, grow, or save."
          nextStep="Choose an objective, open a seller action brief, then model the recommended move."
        />
        {selected && selectedItem && (
          <>
            <div className="seller-action-hero">
              <div className="seller-action-hero__meta">
                <span className={`seller-status seller-status--${selectedItem.tone}`}>{selectedItem.entityKind}</span>
                <em>{selectedItem.urgencyLabel}</em>
              </div>
              <span className="eyebrow">Seller action brief</span>
              <h2>{selectedItem.entityName}</h2>
              <p>{selected.name} · ZIP {selected.zip} · {selected.categoryStrength}</p>
              <div className="seller-priority-score">
                <strong>{projectedScore}</strong>
                <span>Seller priority / 100</span>
              </div>
              {simulated && <small>+{projectedScore - selectedScore} modeled action lift</small>}
              <div className="seller-opportunity-range">
                <span>Modeled opportunity</span>
                <strong>
                  {currencyFormatter.format(selectedItem.opportunityRange.minimum)}–
                  {currencyFormatter.format(selectedItem.opportunityRange.maximum)}
                </strong>
              </div>
            </div>

            <section className="detail-section">
              <span className="detail-section__label">Why now</span>
              <p className="detail-summary">{selectedItem.headline}</p>
              <ul className="seller-evidence-list">
                {selectedItem.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}
              </ul>
            </section>

            <section className="lead-with-card">
              <span>Lead with</span>
              <strong>{selectedItem.leadWith}</strong>
            </section>

            <section className="detail-section">
              <span className="detail-section__label">Supporting market signals</span>
              <dl className="metric-grid">
                <div><dt>Households</dt><dd>{numberFormatter.format(selected.householdCount)}</dd></div>
                <div><dt>ZIP opportunity</dt><dd>{selected.score}/100</dd></div>
                <div><dt>Strongest category</dt><dd>{selected.categoryStrength}</dd></div>
              </dl>
            </section>

            <section className="recommended-action">
              <span>Recommended next step</span>
              <strong>{selectedItem.recommendedAction}</strong>
              <p>{simulated ? `The illustrative action improves the seller priority within ${territoryName}.` : 'Model the recommended action to compare the current and potential seller state.'}</p>
            </section>

            <button className="primary-action" type="button" onClick={() => setShowOutreach(true)}>
              Build outreach plan
            </button>
            <button className="secondary-action" type="button" onClick={() => setSimulated((value) => !value)}>
              {simulated ? 'Return to current state' : 'Model seller action'}
            </button>
            <p className="model-disclosure">Illustrative synthetic results. No real account, prospect, seller, or revenue data is shown.</p>
          </>
        )}
      </aside>

      {showOutreach && selected && selectedItem && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowOutreach(false)}>
          <section className="architect-modal" role="dialog" aria-modal="true" aria-labelledby="outreach-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close outreach plan" onClick={() => setShowOutreach(false)}>×</button>
            <span className="eyebrow">Seller outreach plan</span>
            <h2 id="outreach-title">{selectedItem.entityName}</h2>
            <p>{definition.label} play for {selected.name} · ZIP {selected.zip} within {territoryName}.</p>
            <dl className="handoff-grid">
              <div><dt>Who to contact</dt><dd>{selectedItem.entityName} · {selectedItem.entityKind}</dd></div>
              <div><dt>Objective</dt><dd>{definition.label}</dd></div>
              <div><dt>Lead with</dt><dd>{selectedItem.leadWith}</dd></div>
              <div>
                <dt>Modeled opportunity</dt>
                <dd>
                  {currencyFormatter.format(selectedItem.opportunityRange.minimum)}–
                  {currencyFormatter.format(selectedItem.opportunityRange.maximum)}
                </dd>
              </div>
            </dl>
            <section className="brief-highlights">
              <span>Why now</span>
              <div><strong>{selectedItem.headline}</strong><small>{selectedItem.urgencyLabel}</small></div>
              {selectedItem.evidence.map((evidence) => (
                <div key={evidence}><small>{evidence}</small></div>
              ))}
            </section>
            <section className="brief-recommendation">
              <span>Next step</span>
              <p>{selectedItem.recommendedAction}</p>
            </section>
            <small>Deterministic synthetic outreach plan. No real account, prospect, seller, or revenue data.</small>
          </section>
        </div>
      )}
    </main>
  );
}
