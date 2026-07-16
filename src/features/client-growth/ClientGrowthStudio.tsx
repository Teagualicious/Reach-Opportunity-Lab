import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ProductViewContext } from '../../app/ProductViewContext';
import { ClientPlanControls, type ClientPlanView } from '../../components/ClientPlanControls';
import type { OpportunityMarket } from '../../data/OpportunityRepository';
import { buildClientGeographyPlan } from '../../domain/clientGeography';
import {
  CLIENT_STRATEGIES,
  LAKEFRONT_BASELINE,
  LAKEFRONT_CAMPAIGN_TERRITORY_ID,
  LAKEFRONT_CAMPAIGN_ZIPS,
  simulateClientScenario,
  type ClientMetrics,
  type ClientSimulationResult,
  type ClientStrategyId,
} from '../../domain/clientScenario';
import { OpportunityMap } from '../../map/OpportunityMap';

interface ClientGrowthStudioProps {
  data: OpportunityMarket;
  resetVersion: number;
  view: ProductViewContext;
}

const numberFormatter = new Intl.NumberFormat('en-US');
const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const SIMULATION_STEPS = [
  'Analyzing the current footprint…',
  'Locating underexposed audiences…',
  'Testing competitor pressure…',
  'Modeling ZIP-level expansion…',
  'Generating the recommended plan…',
] as const;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function formatMetric(metric: keyof ClientMetrics, value: number): string {
  if (metric === 'qualifiedReach' || metric === 'modeledLeads') return numberFormatter.format(value);
  if (metric === 'costPerLead') return `$${value.toFixed(2)}`;
  if (metric === 'effectiveFrequency') return value.toFixed(1);
  return String(value);
}

function MetricComparison({
  label,
  metric,
  baseline,
  simulated,
}: {
  label: string;
  metric: keyof ClientMetrics;
  baseline: number;
  simulated: number;
}) {
  const isBetter = metric === 'costPerLead' ? simulated < baseline : simulated > baseline;
  return (
    <div className="comparison-row">
      <span>{label}</span>
      <div><small>Current</small><strong>{formatMetric(metric, baseline)}</strong></div>
      <i aria-hidden="true">→</i>
      <div className={isBetter ? 'is-improved' : ''}><small>Simulated</small><strong>{formatMetric(metric, simulated)}</strong></div>
    </div>
  );
}

export function ClientGrowthStudio({ data, resetVersion, view }: ClientGrowthStudioProps) {
  const [selectedStrategies, setSelectedStrategies] = useState<ClientStrategyId[]>([]);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [planView, setPlanView] = useState<ClientPlanView>('current');
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Choose strategies to test');
  const [result, setResult] = useState<ClientSimulationResult | null>(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const runIdRef = useRef(0);

  const territoryZipSet = useMemo(() => new Set(view.territoryZips), [view.territoryZips]);
  const territoryRanked = useMemo(
    () =>
      data.opportunities
        .filter((opportunity) => territoryZipSet.has(opportunity.zip))
        .sort((a, b) => b.score - a.score),
    [data.opportunities, territoryZipSet],
  );
  const isCanonicalMarket = view.selectedTerritory?.id === LAKEFRONT_CAMPAIGN_TERRITORY_ID;
  const currentCampaignZips = useMemo(() => {
    if (isCanonicalMarket) {
      return LAKEFRONT_CAMPAIGN_ZIPS.filter((zip) => territoryZipSet.has(zip));
    }
    return territoryRanked.slice(0, 14).map(({ zip }) => zip);
  }, [isCanonicalMarket, territoryRanked, territoryZipSet]);
  const territoryCompetitors = useMemo(
    () =>
      data.overlays.competitors.filter((competitor) =>
        competitor.zips.some((zip) => territoryZipSet.has(zip)),
      ),
    [data.overlays.competitors, territoryZipSet],
  );
  const geographyPlan = useMemo(
    () =>
      buildClientGeographyPlan({
        opportunities: territoryRanked,
        currentZips: currentCampaignZips,
        competitors: territoryCompetitors,
        selectedStrategyIds: selectedStrategies,
      }),
    [currentCampaignZips, selectedStrategies, territoryCompetitors, territoryRanked],
  );
  const recommendedZipExpansions = result ? geographyPlan.recommendedZips : [];

  useEffect(() => {
    runIdRef.current += 1;
    setSelectedStrategies([]);
    setSelectedZip(currentCampaignZips[0] ?? territoryRanked[0]?.zip ?? null);
    setPlanView('current');
    setStatus('idle');
    setStatusMessage('Choose strategies to test');
    setResult(null);
    setShowArchitect(false);
  }, [currentCampaignZips, resetVersion, territoryRanked, view.selectedTerritoryId]);

  const toggleStrategy = (strategyId: ClientStrategyId) => {
    if (status === 'running') return;
    setSelectedStrategies((current) =>
      current.includes(strategyId)
        ? current.filter((id) => id !== strategyId)
        : [...current, strategyId],
    );
    setResult(null);
    setStatus('idle');
    if (planView === 'recommended') setPlanView('diagnostic');
  };

  const runSimulation = async () => {
    if (selectedStrategies.length === 0 || status === 'running') return;
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setStatus('running');
    setResult(null);
    setPlanView('diagnostic');

    for (const step of SIMULATION_STEPS) {
      if (runIdRef.current !== runId) return;
      setStatusMessage(step);
      await delay(420);
    }

    if (runIdRef.current !== runId) return;
    setResult(simulateClientScenario(selectedStrategies));
    setStatus('complete');
    setStatusMessage('Recommended plan ready');
    setPlanView('recommended');
  };

  const displayScores = useMemo(() => {
    if (!result) return undefined;
    const currentSet = new Set(currentCampaignZips);
    const expansionSet = new Set(recommendedZipExpansions);
    return Object.fromEntries(
      data.opportunities.map((opportunity) => [
        opportunity.zip,
        Math.min(
          100,
          opportunity.score + (currentSet.has(opportunity.zip) ? 5 : 0) + (expansionSet.has(opportunity.zip) ? 9 : 0),
        ),
      ]),
    );
  }, [currentCampaignZips, data.opportunities, recommendedZipExpansions, result]);

  const handleSelectZip = useCallback((zip: string | null) => setSelectedZip(zip), []);
  const territoryName = view.selectedTerritory?.name ?? 'All Ohio';
  const selectedOpportunity = selectedZip ? data.opportunitiesByZip.get(selectedZip) : undefined;
  const selectedCandidate = geographyPlan.candidates.find((candidate) => candidate.zip === selectedZip);
  const selectedRole = selectedZip
    ? currentCampaignZips.includes(selectedZip)
      ? 'Current campaign ZIP'
      : recommendedZipExpansions.includes(selectedZip)
        ? 'Recommended expansion ZIP'
        : geographyPlan.reachGapZips.includes(selectedZip)
          ? 'Reach-gap opportunity'
          : 'Market context ZIP'
    : null;
  const selectedStrategyDefinitions = CLIENT_STRATEGIES.filter((strategy) =>
    selectedStrategies.includes(strategy.id),
  );
  const diagnosticMode = planView === 'diagnostic';
  const recommendedMode = planView === 'recommended' && Boolean(result);
  const visibleCompetitorIds = diagnosticMode
    ? territoryCompetitors.map((competitor) => competitor.id)
    : [];

  return (
    <main className="studio-grid product-grid">
      <aside className="panel panel--left client-controls">
        <div className="panel__heading">
          <span className="eyebrow">Client Growth Studio</span>
          <h1>Lakefront Automotive Group</h1>
          <p>Fictional advertiser · {territoryName} qualified lead growth</p>
        </div>

        <section className="client-profile-card">
          <div><span>Annual budget</span><strong>{moneyFormatter.format(75000)}</strong></div>
          <div><span>Current media</span><strong>TV + Streaming</strong></div>
          <div><span>Campaign ZIPs</span><strong>{currentCampaignZips.length}</strong></div>
          <div><span>Effectiveness</span><strong>{LAKEFRONT_BASELINE.effectiveness}/100</strong></div>
        </section>

        <ClientPlanControls
          value={planView}
          currentCount={geographyPlan.summary.currentCount}
          reachGapCount={geographyPlan.summary.reachGapCount}
          competitorCount={geographyPlan.summary.competitorPressureCount}
          recommendedCount={result ? geographyPlan.summary.recommendedCount : 0}
          recommendedDisabled={!result}
          onChange={setPlanView}
        />

        <section className="panel-section panel-section--grow">
          <div className="section-heading">
            <span>Strategies to test</span>
            <strong>{selectedStrategies.length} selected</strong>
          </div>
          <div className="strategy-list">
            {CLIENT_STRATEGIES.map((strategy) => {
              const selected = selectedStrategies.includes(strategy.id);
              return (
                <button
                  key={strategy.id}
                  className={`strategy-card ${selected ? 'is-selected' : ''}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleStrategy(strategy.id)}
                >
                  <span className="strategy-card__check">{selected ? '✓' : '+'}</span>
                  <span><strong>{strategy.name}</strong><small>{strategy.description}</small></span>
                  <em>{strategy.benefit}</em>
                </button>
              );
            })}
          </div>
        </section>

        <button
          className="primary-action"
          type="button"
          disabled={selectedStrategies.length === 0 || status === 'running'}
          onClick={runSimulation}
        >
          {status === 'running' ? statusMessage : result ? 'Run another simulation' : 'Run simulation'}
        </button>
        <div className="synthetic-notice">
          <span className="synthetic-notice__dot" />
          Fictional advertiser and deterministic statewide demonstration model
        </div>
      </aside>

      <section className={`map-stage simulation-stage ${status === 'running' ? 'is-simulating' : ''}`}>
        <OpportunityMap
          data={data}
          selectedZip={selectedZip}
          resetVersion={resetVersion}
          onSelectZip={handleSelectZip}
          campaignZips={currentCampaignZips}
          recommendedZips={recommendedMode ? recommendedZipExpansions : []}
          reachGapZips={geographyPlan.reachGapZips}
          displayScores={displayScores}
          showReachGap={diagnosticMode}
          visibleCompetitorIds={visibleCompetitorIds}
          territoryZips={view.territoryZips}
          viewportBounds={view.viewportBounds}
          layoutVersion={view.panelLayoutVersion}
        />
        <div className="map-stage__caption client-map-caption">
          <span>{planView === 'current' ? 'Current campaign footprint' : planView === 'diagnostic' ? 'Campaign diagnostics' : 'Recommended plan'}</span>
          <strong>
            {planView === 'current'
              ? `${currentCampaignZips.length} active ZIPs outlined in cyan`
              : planView === 'diagnostic'
                ? 'Reach gaps and modeled competitor pressure are visible'
                : `${recommendedZipExpansions.length} expansion ZIPs outlined in green`}
          </strong>
        </div>
        {status === 'running' && (
          <div className="simulation-overlay" role="status" aria-live="polite">
            <span className="simulation-spinner" />
            <strong>{statusMessage}</strong>
            <small>Testing deterministic strategy effects across opportunity, reach-gap, and competitor signals</small>
          </div>
        )}
      </section>

      <aside className="panel panel--right client-results">
        <div className="result-heading">
          <span className="eyebrow">Scenario comparison</span>
          <h2>{result ? 'Modeled improvement' : 'Current campaign baseline'}</h2>
          <p>{result ? `Illustrative results for ${territoryName}.` : 'Diagnose the footprint, choose strategies, and model a stronger plan.'}</p>
        </div>

        {selectedOpportunity && selectedRole && (
          <section className="client-zip-context">
            <div>
              <span>Selected ZIP</span>
              <strong>{selectedOpportunity.name}</strong>
              <small>ZIP {selectedOpportunity.zip} · {selectedRole}</small>
            </div>
            <b>{selectedOpportunity.score}</b>
            <dl>
              <div><dt>Reach gap</dt><dd>{geographyPlan.reachGapZips.includes(selectedOpportunity.zip) ? 'Modeled gap' : 'Covered'}</dd></div>
              <div><dt>Competitors</dt><dd>{selectedCandidate?.competitorIds.length ?? territoryCompetitors.filter((competitor) => competitor.zips.includes(selectedOpportunity.zip)).length}</dd></div>
            </dl>
          </section>
        )}

        {result ? (
          <>
            <div className="result-score-card">
              <div><span>Campaign effectiveness</span><strong>{result.metrics.effectiveness}</strong><small>from {LAKEFRONT_BASELINE.effectiveness}</small></div>
              <span className="result-score-card__confidence">{result.confidence} confidence</span>
            </div>

            <section className="comparison-list">
              <MetricComparison label="Qualified reach" metric="qualifiedReach" baseline={LAKEFRONT_BASELINE.qualifiedReach} simulated={result.metrics.qualifiedReach} />
              <MetricComparison label="Effective frequency" metric="effectiveFrequency" baseline={LAKEFRONT_BASELINE.effectiveFrequency} simulated={result.metrics.effectiveFrequency} />
              <MetricComparison label="Modeled leads" metric="modeledLeads" baseline={LAKEFRONT_BASELINE.modeledLeads} simulated={result.metrics.modeledLeads} />
              <MetricComparison label="Cost per lead" metric="costPerLead" baseline={LAKEFRONT_BASELINE.costPerLead} simulated={result.metrics.costPerLead} />
              <MetricComparison label="Priority clusters" metric="priorityClusters" baseline={LAKEFRONT_BASELINE.priorityClusters} simulated={result.metrics.priorityClusters} />
            </section>

            <section className="client-geography-recommendation">
              <div className="detail-section__label">Recommended ZIP expansion</div>
              <div className="client-expansion-list">
                {geographyPlan.candidates.map((candidate, index) => (
                  <button
                    key={candidate.zip}
                    className={selectedZip === candidate.zip ? 'is-selected' : ''}
                    type="button"
                    onClick={() => setSelectedZip(candidate.zip)}
                  >
                    <span>{index + 1}</span>
                    <div><strong>{candidate.name}</strong><small>ZIP {candidate.zip} · {candidate.reason}</small></div>
                    <b>{candidate.opportunityScore}</b>
                  </button>
                ))}
              </div>
            </section>

            <section className="client-tradeoff-card">
              <span>Strategy trade-offs</span>
              {selectedStrategyDefinitions.map((strategy) => (
                <div key={strategy.id}><strong>{strategy.name}</strong><small>{strategy.benefit} · Trade-off: {strategy.tradeoff}</small></div>
              ))}
            </section>

            <section className="recommendation-card">
              <span>Why this recommendation?</span>
              <p>{result.explanation}</p>
              <small>Expansion ZIPs: {recommendedZipExpansions.join(', ') || 'No additional ZIPs'} · Modeled leads: {numberFormatter.format(result.leadRange.minimum)}–{numberFormatter.format(result.leadRange.maximum)}</small>
            </section>

            <button className="architect-action" type="button" onClick={() => setShowArchitect(true)}>
              Prepare Architect handoff <span>→</span>
            </button>
            <p className="model-disclosure">Illustrative modeled results using synthetic demonstration data. Not a production forecast.</p>
          </>
        ) : (
          <>
            <div className="baseline-metrics">
              <div><span>Effectiveness</span><strong>{LAKEFRONT_BASELINE.effectiveness}/100</strong></div>
              <div><span>Qualified reach</span><strong>{numberFormatter.format(LAKEFRONT_BASELINE.qualifiedReach)}</strong></div>
              <div><span>Effective frequency</span><strong>{LAKEFRONT_BASELINE.effectiveFrequency.toFixed(1)}</strong></div>
              <div><span>Modeled leads</span><strong>{numberFormatter.format(LAKEFRONT_BASELINE.modeledLeads)}</strong></div>
              <div><span>Cost per lead</span><strong>${LAKEFRONT_BASELINE.costPerLead.toFixed(2)}</strong></div>
              <div><span>Priority clusters</span><strong>{LAKEFRONT_BASELINE.priorityClusters}</strong></div>
            </div>
            <section className="client-diagnostic-summary">
              <span>Footprint diagnostic</span>
              <div><strong>{geographyPlan.summary.currentCount}</strong><small>current ZIPs</small></div>
              <div><strong>{geographyPlan.summary.reachGapCount}</strong><small>modeled reach gaps</small></div>
              <div><strong>{geographyPlan.summary.competitorPressureCount}</strong><small>ZIPs with competitor pressure</small></div>
              <p>Open <b>Diagnose gaps</b> to reveal the supporting map evidence before choosing a strategy.</p>
            </section>
          </>
        )}
      </aside>

      {showArchitect && result && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowArchitect(false)}>
          <section className="architect-modal" role="dialog" aria-modal="true" aria-labelledby="architect-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close Architect handoff" onClick={() => setShowArchitect(false)}>×</button>
            <span className="eyebrow">Conceptual handoff</span>
            <h2 id="architect-title">Recommended plan prepared for Architect</h2>
            <p>This prototype prepares the intelligence and scenario recommendation. Architect remains the campaign-planning and activation destination.</p>
            <dl className="handoff-grid">
              <div><dt>Territory</dt><dd>{territoryName}</dd></div>
              <div><dt>Objective</dt><dd>Qualified lead growth</dd></div>
              <div><dt>Priority ZIPs</dt><dd>{recommendedZipExpansions.join(', ')}</dd></div>
              <div><dt>Media mix</dt><dd>Television + Streaming + Search</dd></div>
              <div><dt>Budget range</dt><dd>$82K–$88K</dd></div>
              <div><dt>Measurement</dt><dd>Qualified leads and cost per lead</dd></div>
            </dl>
            <button className="primary-action" type="button" onClick={() => setShowArchitect(false)}>Continue in Architect →</button>
            <small>No live Architect integration is represented in this demonstration.</small>
          </section>
        </div>
      )}
    </main>
  );
}
