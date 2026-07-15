import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { OpportunityMarket } from '../../data/OpportunityRepository';
import {
  CLIENT_STRATEGIES,
  LAKEFRONT_BASELINE,
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
}

const numberFormatter = new Intl.NumberFormat('en-US');
const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const SIMULATION_STEPS = [
  'Analyzing audience opportunity…',
  'Testing selected strategies…',
  'Modeling ZIP-level response…',
  'Estimating campaign impact…',
  'Generating recommendation…',
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

export function ClientGrowthStudio({ data, resetVersion }: ClientGrowthStudioProps) {
  const [selectedStrategies, setSelectedStrategies] = useState<ClientStrategyId[]>([]);
  const [selectedZip, setSelectedZip] = useState<string | null>('44122');
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Choose strategies to test');
  const [result, setResult] = useState<ClientSimulationResult | null>(null);
  const [showArchitect, setShowArchitect] = useState(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    runIdRef.current += 1;
    setSelectedStrategies([]);
    setSelectedZip('44122');
    setStatus('idle');
    setStatusMessage('Choose strategies to test');
    setResult(null);
    setShowArchitect(false);
  }, [resetVersion]);

  const toggleStrategy = (strategyId: ClientStrategyId) => {
    if (status === 'running') return;
    setSelectedStrategies((current) =>
      current.includes(strategyId)
        ? current.filter((id) => id !== strategyId)
        : [...current, strategyId],
    );
    setResult(null);
    setStatus('idle');
  };

  const runSimulation = async () => {
    if (selectedStrategies.length === 0 || status === 'running') return;
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    setStatus('running');
    setResult(null);

    for (const step of SIMULATION_STEPS) {
      if (runIdRef.current !== runId) return;
      setStatusMessage(step);
      await delay(520);
    }

    if (runIdRef.current !== runId) return;
    setResult(simulateClientScenario(selectedStrategies));
    setStatus('complete');
    setStatusMessage('Recommended plan ready');
  };

  const campaignZips = useMemo(
    () =>
      result
        ? [...LAKEFRONT_CAMPAIGN_ZIPS, ...result.recommendedZipExpansions]
        : [...LAKEFRONT_CAMPAIGN_ZIPS],
    [result],
  );

  const displayScores = useMemo(() => {
    if (!result) return undefined;
    const expansionSet = new Set(result.recommendedZipExpansions);
    return Object.fromEntries(
      data.opportunities.map((opportunity) => [
        opportunity.zip,
        Math.min(
          100,
          opportunity.score +
            (LAKEFRONT_CAMPAIGN_ZIPS.includes(opportunity.zip as (typeof LAKEFRONT_CAMPAIGN_ZIPS)[number]) ? 5 : 0) +
            (expansionSet.has(opportunity.zip) ? 9 : 0),
        ),
      ]),
    );
  }, [data.opportunities, result]);

  const handleSelectZip = useCallback((zip: string | null) => setSelectedZip(zip), []);

  return (
    <main className="studio-grid">
      <aside className="panel panel--left client-controls">
        <div className="panel__heading">
          <span className="eyebrow">Client Growth Studio</span>
          <h1>Lakefront Automotive Group</h1>
          <p>Fictional automotive advertiser · qualified lead growth</p>
        </div>

        <section className="client-profile-card">
          <div><span>Annual budget</span><strong>{moneyFormatter.format(75000)}</strong></div>
          <div><span>Current media</span><strong>TV + Streaming</strong></div>
          <div><span>Campaign ZIPs</span><strong>{LAKEFRONT_CAMPAIGN_ZIPS.length}</strong></div>
          <div><span>Effectiveness</span><strong>{LAKEFRONT_BASELINE.effectiveness}/100</strong></div>
        </section>

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
          Fictional advertiser and deterministic demonstration model
        </div>
      </aside>

      <section className={`map-stage simulation-stage ${status === 'running' ? 'is-simulating' : ''}`}>
        <OpportunityMap
          data={data}
          selectedZip={selectedZip}
          resetVersion={resetVersion}
          onSelectZip={handleSelectZip}
          campaignZips={campaignZips}
          displayScores={displayScores}
        />
        <div className="map-stage__caption">
          <span>{result ? 'Projected campaign opportunity' : 'Current campaign footprint'}</span>
          <strong>{result ? 'Recommended ZIP expansion is highlighted' : '14 active ZIPs outlined in cyan'}</strong>
        </div>
        {status === 'running' && (
          <div className="simulation-overlay" role="status" aria-live="polite">
            <span className="simulation-spinner" />
            <strong>{statusMessage}</strong>
            <small>Testing deterministic strategy effects across ZIP opportunity signals</small>
          </div>
        )}
      </section>

      <aside className="panel panel--right client-results">
        <div className="result-heading">
          <span className="eyebrow">Scenario comparison</span>
          <h2>{result ? 'Modeled improvement' : 'Current campaign baseline'}</h2>
          <p>{result ? 'Illustrative results based on the strategies selected.' : 'Choose a strategy combination to model a stronger plan.'}</p>
        </div>

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

            <section className="recommendation-card">
              <span>Why this recommendation?</span>
              <p>{result.explanation}</p>
              <small>Modeled leads: {numberFormatter.format(result.leadRange.minimum)}–{numberFormatter.format(result.leadRange.maximum)} · Cost per lead: ${result.costPerLeadRange.minimum}–${result.costPerLeadRange.maximum}</small>
            </section>

            <button className="architect-action" type="button" onClick={() => setShowArchitect(true)}>
              Prepare Architect handoff <span>→</span>
            </button>
            <p className="model-disclosure">Illustrative modeled results using synthetic demonstration data. Not a production forecast.</p>
          </>
        ) : (
          <div className="baseline-metrics">
            <div><span>Effectiveness</span><strong>{LAKEFRONT_BASELINE.effectiveness}/100</strong></div>
            <div><span>Qualified reach</span><strong>{numberFormatter.format(LAKEFRONT_BASELINE.qualifiedReach)}</strong></div>
            <div><span>Effective frequency</span><strong>{LAKEFRONT_BASELINE.effectiveFrequency.toFixed(1)}</strong></div>
            <div><span>Modeled leads</span><strong>{numberFormatter.format(LAKEFRONT_BASELINE.modeledLeads)}</strong></div>
            <div><span>Cost per lead</span><strong>${LAKEFRONT_BASELINE.costPerLead.toFixed(2)}</strong></div>
            <div><span>Priority clusters</span><strong>{LAKEFRONT_BASELINE.priorityClusters}</strong></div>
          </div>
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
              <div><dt>Objective</dt><dd>Qualified lead growth</dd></div>
              <div><dt>Audience</dt><dd>High-intent automotive households</dd></div>
              <div><dt>Priority ZIPs</dt><dd>{result.recommendedZipExpansions.join(', ')}</dd></div>
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
