import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ProductViewContext } from '../../app/ProductViewContext';
import { ExperienceGuide } from '../../components/ExperienceGuide';
import { MapBreadcrumb } from '../../components/MapBreadcrumb';
import { RegionPicker } from '../../components/RegionPicker';
import type { OpportunityMarket } from '../../data/OpportunityRepository';
import { buildClientGeographyPlan } from '../../domain/clientGeography';
import { buildRegionSummaries } from '../../domain/regionSummary';
import {
  CLIENT_STRATEGIES,
  LAKEFRONT_BASELINE,
  LAKEFRONT_CAMPAIGN_TERRITORY_ID,
  LAKEFRONT_CAMPAIGN_ZIPS,
  simulateClientScenario,
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
const compactFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 });

/** Client-facing growth-idea language for the shared strategy definitions. */
const GROWTH_IDEA_COPY: Readonly<
  Record<ClientStrategyId, { name: string; description: string; benefit: string }>
> = {
  'streaming-reach': {
    name: 'Add Streaming',
    description: 'Reach more of your audience across every screen they watch.',
    benefit: 'More qualified reach',
  },
  'search-support': {
    name: 'Add Search',
    description: 'Capture people searching for you right after they see your ads.',
    benefit: 'More leads from the same reach',
  },
  'geography-expansion': {
    name: 'Expand Geography',
    description: 'Add nearby areas that look like your strongest current ones.',
    benefit: 'Larger addressable market',
  },
  'high-value-services': {
    name: 'Feature premium services',
    description: 'Shift creative toward your higher-value service lines.',
    benefit: 'More value per customer',
  },
};

/** Display order per the redesign proposal: streaming, search, geography, premium. */
const GROWTH_IDEA_ORDER: readonly ClientStrategyId[] = [
  'streaming-reach',
  'search-support',
  'geography-expansion',
  'high-value-services',
];

const SIMULATION_STEPS = [
  'Reviewing where your campaign reaches today…',
  'Finding audiences you have not reached yet…',
  'Modeling your growth ideas…',
  'Preparing your growth view…',
] as const;

type ClientMapView = 'current' | 'growth';

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function percentChange(baseline: number, simulated: number): number {
  if (baseline === 0) return 0;
  return Math.round(((simulated - baseline) / baseline) * 100);
}

function ComparisonRow({
  label,
  current,
  simulated,
  improved,
}: {
  label: string;
  current: string;
  simulated: string;
  improved: boolean;
}) {
  return (
    <div className="client-compare-row">
      <span>{label}</span>
      <div><small>Today</small><strong>{current}</strong></div>
      <i aria-hidden="true">→</i>
      <div className={improved ? 'is-improved' : ''}><small>With growth</small><strong>{simulated}</strong></div>
    </div>
  );
}

export function ClientGrowthStudio({ data, resetVersion, view }: ClientGrowthStudioProps) {
  const [selectedStrategies, setSelectedStrategies] = useState<ClientStrategyId[]>([]);
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [mapView, setMapView] = useState<ClientMapView>('current');
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Choose growth ideas');
  const [result, setResult] = useState<ClientSimulationResult | null>(null);
  const [showContact, setShowContact] = useState(false);
  const runIdRef = useRef(0);

  const regionMode = view.regionMode;
  const territories = data.market.territories ?? [];
  const regionSummaries = useMemo(
    () => buildRegionSummaries(data.opportunities, territories),
    [data.opportunities, territories],
  );
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
  // Internal footprints inform the ranking only; the client view never
  // renders or names them (client-safe boundary).
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
  const growthVisible = mapView === 'growth' && Boolean(result);

  useEffect(() => {
    runIdRef.current += 1;
    setSelectedStrategies([]);
    setSelectedZip(currentCampaignZips[0] ?? territoryRanked[0]?.zip ?? null);
    setMapView('current');
    setStatus('idle');
    setStatusMessage('Choose growth ideas');
    setResult(null);
    setShowContact(false);
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
    setMapView('current');
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
      await delay(420);
    }

    if (runIdRef.current !== runId) return;
    setResult(simulateClientScenario(selectedStrategies));
    setStatus('complete');
    setStatusMessage('Growth view ready');
    setMapView('growth');
  };

  const displayScores = useMemo(() => {
    if (!growthVisible) return undefined;
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
  }, [currentCampaignZips, data.opportunities, growthVisible, recommendedZipExpansions]);

  const handleSelectZip = useCallback((zip: string | null) => setSelectedZip(zip), []);
  const territoryName = view.selectedTerritory?.name ?? 'All Ohio';
  const selectedOpportunity = selectedZip ? data.opportunitiesByZip.get(selectedZip) : undefined;
  const selectedRole = selectedZip
    ? currentCampaignZips.includes(selectedZip)
      ? 'In today’s plan'
      : recommendedZipExpansions.includes(selectedZip)
        ? 'Added reach'
        : 'Market context'
    : null;

  const reachChange = result ? percentChange(LAKEFRONT_BASELINE.qualifiedReach, result.metrics.qualifiedReach) : 0;
  const addedCustomers = result ? result.metrics.modeledLeads - LAKEFRONT_BASELINE.modeledLeads : 0;
  const leadsChange = result ? percentChange(LAKEFRONT_BASELINE.modeledLeads, result.metrics.modeledLeads) : 0;
  const lowerCostPerLead = result ? result.metrics.costPerLead < LAKEFRONT_BASELINE.costPerLead : false;

  return (
    <main className="studio-grid product-grid">
      <aside className="panel panel--left client-rail">
        <div className="panel__heading">
          <span className="eyebrow">Client Campaign Planner</span>
          <h1>Lakefront Automotive Group</h1>
          <p>
            {regionMode
              ? 'Fictional advertiser · choose the campaign market'
              : `Fictional advertiser · ${territoryName} qualified lead growth`}
          </p>
        </div>

        {regionMode ? (
          <>
            <RegionPicker regions={regionSummaries} onSelectRegion={view.selectTerritory} />
            <div className="synthetic-notice synthetic-notice--light">
              <span className="synthetic-notice__dot" />
              Fictional advertiser with modeled demonstration results — not a performance forecast.
            </div>
          </>
        ) : (
        <>
        <section className="client-section">
          <div className="client-section__heading">
            <span>Your campaign today</span>
          </div>
          <div className="client-today">
            <div><span>Current reach</span><strong>{compactFormatter.format(LAKEFRONT_BASELINE.qualifiedReach)}</strong></div>
            <div><span>Frequency</span><strong>{LAKEFRONT_BASELINE.effectiveFrequency.toFixed(1)}</strong></div>
            <div><span>Campaign ZIPs</span><strong>{currentCampaignZips.length}</strong></div>
            <div><span>Estimated leads</span><strong>{numberFormatter.format(LAKEFRONT_BASELINE.modeledLeads)}</strong></div>
          </div>
        </section>

        <section className="client-section client-section--grow">
          <div className="client-section__heading">
            <span>Growth ideas</span>
            <strong>{selectedStrategies.length} selected</strong>
          </div>
          <div className="growth-idea-list">
            {[...CLIENT_STRATEGIES]
              .sort((a, b) => GROWTH_IDEA_ORDER.indexOf(a.id) - GROWTH_IDEA_ORDER.indexOf(b.id))
              .map((strategy) => {
              const copy = GROWTH_IDEA_COPY[strategy.id];
              const selected = selectedStrategies.includes(strategy.id);
              return (
                <button
                  key={strategy.id}
                  className={`growth-idea ${selected ? 'is-selected' : ''}`}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleStrategy(strategy.id)}
                >
                  <span className="growth-idea__check" aria-hidden="true">{selected ? '✓' : '+'}</span>
                  <span className="growth-idea__body">
                    <strong>{copy.name}</strong>
                    <small>{copy.description}</small>
                    <em>{copy.benefit}</em>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="client-section">
          <div className="client-section__heading">
            <span>Map view</span>
          </div>
          <div className="client-view-toggle" role="tablist" aria-label="Campaign map view">
            <button
              type="button"
              role="tab"
              aria-selected={mapView === 'current'}
              className={mapView === 'current' ? 'is-active' : ''}
              onClick={() => setMapView('current')}
            >
              Today
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mapView === 'growth'}
              className={mapView === 'growth' ? 'is-active' : ''}
              disabled={!result}
              onClick={() => setMapView('growth')}
            >
              With growth
            </button>
          </div>
        </section>

        <button
          className="primary-action"
          type="button"
          disabled={selectedStrategies.length === 0 || status === 'running'}
          onClick={runSimulation}
        >
          {status === 'running' ? statusMessage : result ? 'Model different ideas' : 'See my growth plan'}
        </button>
        <div className="synthetic-notice synthetic-notice--light">
          <span className="synthetic-notice__dot" />
          Fictional advertiser with modeled demonstration results — not a performance forecast.
        </div>
        </>
        )}
      </aside>

      <section className={`map-stage simulation-stage ${status === 'running' ? 'is-simulating' : ''}`}>
        <OpportunityMap
          data={data}
          selectedZip={regionMode ? null : selectedZip}
          resetVersion={resetVersion}
          onSelectZip={handleSelectZip}
          campaignZips={regionMode ? [] : currentCampaignZips}
          recommendedZips={growthVisible ? recommendedZipExpansions : []}
          displayScores={displayScores}
          territoryZips={view.territoryZips}
          viewportBounds={view.viewportBounds}
          layoutVersion={view.panelLayoutVersion}
          regionMode={regionMode}
          regions={regionSummaries}
          onSelectRegion={view.selectTerritory}
        />
        <MapBreadcrumb
          regionName={view.selectedTerritory?.name ?? null}
          onSelectTerritory={view.selectTerritory}
        />
        <div className="map-stage__caption client-map-caption">
          <span>{regionMode ? 'Ohio' : growthVisible ? 'Current reach + growth' : 'Your campaign today'}</span>
          <strong>
            {regionMode
              ? 'Click a region to plan the campaign there'
              : growthVisible
                ? `${recommendedZipExpansions.length} added ${recommendedZipExpansions.length === 1 ? 'area appears' : 'areas appear'} in growth green`
                : `${currentCampaignZips.length} campaign ZIPs in Spectrum blue`}
          </strong>
          {!regionMode && (
            <span className="client-map-legend">
              <i className="is-current" aria-hidden="true" />Current reach
              <i className="is-added" aria-hidden="true" />Added reach
            </span>
          )}
        </div>
        {status === 'running' && (
          <div className="simulation-overlay" role="status" aria-live="polite">
            <span className="simulation-spinner" />
            <strong>{statusMessage}</strong>
            <small>Modeling deterministic growth ideas over your campaign geography</small>
          </div>
        )}
      </section>

      <aside className="panel panel--right client-results">
        <ExperienceGuide
          tone="client"
          title="Client Campaign Planner"
          audience="Advertisers with their account executive"
          purpose="See where your campaign reaches today and what growth adds — in plain language."
          nextStep={
            regionMode
              ? 'Choose the market where this campaign runs.'
              : 'Choose growth ideas, compare the expanded map, then talk to your account executive.'
          }
        />

        {regionMode ? (
          <div className="client-story-card">
            <span className="eyebrow">Getting started</span>
            <h2>Choose your campaign market</h2>
            <p>
              Pick the region where Lakefront Automotive runs its campaign. You will see today’s
              reach first, then what growth could add.
            </p>
          </div>
        ) : (
        <>
        {selectedOpportunity && selectedRole && (
          <section className="client-zip-card">
            <div>
              <span>Selected area</span>
              <strong>{selectedOpportunity.name}</strong>
              <small>ZIP {selectedOpportunity.zip} · {selectedRole}</small>
            </div>
            <b>{selectedOpportunity.score}<i>audience fit</i></b>
          </section>
        )}

        {result ? (
          <>
            <div className="client-growth-hero">
              <span className="eyebrow">Modeled result</span>
              <div className="client-growth-hero__stats">
                <div>
                  <strong>{reachChange > 0 ? '+' : ''}{reachChange}%</strong>
                  <span>Qualified reach</span>
                </div>
                <div>
                  <strong>{addedCustomers > 0 ? '+' : ''}{numberFormatter.format(addedCustomers)}</strong>
                  <span>Modeled customers</span>
                </div>
              </div>
              <ul className="client-growth-hero__notes">
                <li>{leadsChange > 0 ? '+' : ''}{leadsChange}% modeled leads</li>
                <li>{recommendedZipExpansions.length} recommended {recommendedZipExpansions.length === 1 ? 'ZIP' : 'ZIPs'}</li>
                {lowerCostPerLead && <li>Lower estimated cost per lead</li>}
              </ul>
            </div>

            <section className="client-compare-list">
              <ComparisonRow
                label="Qualified reach"
                current={numberFormatter.format(LAKEFRONT_BASELINE.qualifiedReach)}
                simulated={numberFormatter.format(result.metrics.qualifiedReach)}
                improved={result.metrics.qualifiedReach > LAKEFRONT_BASELINE.qualifiedReach}
              />
              <ComparisonRow
                label="Effective frequency"
                current={LAKEFRONT_BASELINE.effectiveFrequency.toFixed(1)}
                simulated={result.metrics.effectiveFrequency.toFixed(1)}
                improved={result.metrics.effectiveFrequency > LAKEFRONT_BASELINE.effectiveFrequency}
              />
              <ComparisonRow
                label="Modeled leads"
                current={numberFormatter.format(LAKEFRONT_BASELINE.modeledLeads)}
                simulated={numberFormatter.format(result.metrics.modeledLeads)}
                improved={result.metrics.modeledLeads > LAKEFRONT_BASELINE.modeledLeads}
              />
              <ComparisonRow
                label="Cost per lead"
                current={`$${LAKEFRONT_BASELINE.costPerLead.toFixed(2)}`}
                simulated={`$${result.metrics.costPerLead.toFixed(2)}`}
                improved={lowerCostPerLead}
              />
            </section>

            <section className="client-new-zips">
              <div className="client-section__heading">
                <span>{geographyPlan.candidates.length} new high-fit {geographyPlan.candidates.length === 1 ? 'ZIP' : 'ZIPs'}</span>
              </div>
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

            <section className="client-why-card">
              <span>Why this plan?</span>
              <p>{result.explanation}</p>
              <small>
                Modeled leads: {numberFormatter.format(result.leadRange.minimum)}–{numberFormatter.format(result.leadRange.maximum)} · {result.confidence} confidence
              </small>
            </section>

            <button className="primary-action client-contact-action" type="button" onClick={() => setShowContact(true)}>
              Talk to your account executive
            </button>
            <p className="model-disclosure">Modeled ranges from deterministic synthetic demonstration data — not a performance forecast.</p>
          </>
        ) : (
          <>
            <div className="client-story-card">
              <span className="eyebrow">Current reach + growth</span>
              <h2>See where you reach today — and what growth adds</h2>
              <p>
                Your current campaign ZIPs stay in Spectrum blue. When you model growth ideas, new
                reach appears in growth green with the customers it could add.
              </p>
            </div>
            <div className="client-baseline-list">
              <div><span>Qualified reach</span><strong>{numberFormatter.format(LAKEFRONT_BASELINE.qualifiedReach)}</strong></div>
              <div><span>Effective frequency</span><strong>{LAKEFRONT_BASELINE.effectiveFrequency.toFixed(1)}</strong></div>
              <div><span>Modeled leads</span><strong>{numberFormatter.format(LAKEFRONT_BASELINE.modeledLeads)}</strong></div>
              <div><span>Cost per lead</span><strong>${LAKEFRONT_BASELINE.costPerLead.toFixed(2)}</strong></div>
            </div>
            <div className="client-hint">
              Pick one or more growth ideas on the left, then choose <b>See my growth plan</b>.
            </div>
          </>
        )}
        </>
        )}
      </aside>

      {showContact && result && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowContact(false)}>
          <section className="architect-modal" role="dialog" aria-modal="true" aria-labelledby="contact-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close account executive summary" onClick={() => setShowContact(false)}>×</button>
            <span className="eyebrow">Ready for your account executive</span>
            <h2 id="contact-title">Your growth plan is ready to discuss</h2>
            <p>Share this modeled scenario with your Spectrum Reach account executive to review budget, timing, and creative.</p>
            <dl className="handoff-grid">
              <div><dt>Advertiser</dt><dd>Lakefront Automotive Group</dd></div>
              <div><dt>Market</dt><dd>{territoryName}</dd></div>
              <div>
                <dt>Growth ideas</dt>
                <dd>
                  {[...selectedStrategies]
                    .sort((a, b) => GROWTH_IDEA_ORDER.indexOf(a) - GROWTH_IDEA_ORDER.indexOf(b))
                    .map((id) => GROWTH_IDEA_COPY[id].name)
                    .join(' + ') || '—'}
                </dd>
              </div>
              <div><dt>Added areas</dt><dd>{recommendedZipExpansions.join(', ') || 'No additional ZIPs'}</dd></div>
              <div>
                <dt>Modeled leads</dt>
                <dd>{numberFormatter.format(result.leadRange.minimum)}–{numberFormatter.format(result.leadRange.maximum)}</dd>
              </div>
              <div><dt>Next step</dt><dd>Plan review with your account executive</dd></div>
            </dl>
            <section className="brief-recommendation">
              <span>What happens next</span>
              <p>Your account executive finalizes the recommendation and activates the campaign plan in Architect.</p>
            </section>
            <button className="primary-action" type="button" onClick={() => setShowContact(false)}>Done</button>
            <small>Conceptual contact flow. No live Architect integration or real account team is represented.</small>
          </section>
        </div>
      )}
    </main>
  );
}
