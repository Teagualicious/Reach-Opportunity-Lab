import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { ProductViewContext } from '../../app/ProductViewContext';
import { ExperienceGuide } from '../../components/ExperienceGuide';
import { MapLayerControls } from '../../components/MapLayerControls';
import { RangeSlider } from '../../components/RangeSlider';
import { ScoreRing } from '../../components/ScoreRing';
import type { OpportunityMarket } from '../../data/OpportunityRepository';
import { getInternalZipMetrics } from '../../domain/internalMetrics';
import {
  buildMarketLensSurface,
  computeDemographicRanges,
  filterZipsByDemographics,
  findMarketLens,
  MARKET_LENSES,
  OPPORTUNITY_LENS_ID,
  type DemographicFilterState,
  type MarketLensFormat,
} from '../../domain/marketLens';
import {
  COMPONENT_LABELS,
  COMPONENT_MAXIMUMS,
  getPriorityBand,
} from '../../domain/opportunity';
import { buildTerritoryBrief } from '../../domain/territoryBrief';
import {
  DEMOGRAPHIC_METRICS,
  formatDemographicValue,
  getZipDemographics,
  type DemographicMetricId,
} from '../../domain/zipDemographics';
import { OpportunityMap } from '../../map/OpportunityMap';
import { opportunityLegendGradient } from '../../map/mapExpressions';

interface ZipExplorerProps {
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

const LENS_GROUP_LABELS = {
  opportunity: 'Opportunity',
  demographics: 'Demographics',
  internal: 'Internal signals · modeled',
} as const;

function sliderStep(format: MarketLensFormat): number {
  switch (format) {
    case 'currency':
      return 1000;
    case 'percent':
    case 'years':
      return 0.5;
    default:
      return 1;
  }
}

/** Short slider-heading values, e.g. `$41K – $118K` or `15% – 54%`. */
function formatCompact(format: MarketLensFormat, value: number): string {
  switch (format) {
    case 'currency':
      return `$${Math.round(value / 1000)}K`;
    case 'percent':
      return `${Math.round(value)}%`;
    case 'years':
      return String(Math.round(value));
    default:
      return String(Math.round(value));
  }
}

function formatLensValue(format: MarketLensFormat, value: number): string {
  if (format === 'score') return `${Math.round(value)}/100`;
  return formatDemographicValue(format, value);
}

export function ZipExplorer({ data, resetVersion, view }: ZipExplorerProps) {
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [lensId, setLensId] = useState<string>(OPPORTUNITY_LENS_ID);
  const [minScore, setMinScore] = useState(35);
  const [category, setCategory] = useState('All categories');
  const [demographicFilters, setDemographicFilters] = useState<DemographicFilterState>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showReachGap, setShowReachGap] = useState(false);
  const [visibleCompetitorIds, setVisibleCompetitorIds] = useState<string[]>([]);
  const [showBrief, setShowBrief] = useState(false);
  const [mapResetVersion, setMapResetVersion] = useState(0);

  const territoryZipSet = useMemo(() => new Set(view.territoryZips), [view.territoryZips]);
  const territoryOpportunities = useMemo(
    () => data.opportunities.filter((opportunity) => territoryZipSet.has(opportunity.zip)),
    [data.opportunities, territoryZipSet],
  );
  const categories = useMemo(
    () => [
      'All categories',
      ...Array.from(new Set(territoryOpportunities.map(({ categoryStrength }) => categoryStrength))).sort(),
    ],
    [territoryOpportunities],
  );

  const lens = useMemo(() => findMarketLens(lensId), [lensId]);
  const lensSurface = useMemo(
    () => buildMarketLensSurface(territoryOpportunities, lens),
    [lens, territoryOpportunities],
  );
  const demographicRanges = useMemo(
    () => computeDemographicRanges(territoryOpportunities),
    [territoryOpportunities],
  );

  const activeDemographicFilters = useMemo(() => {
    const active: DemographicFilterState = {};
    for (const metric of DEMOGRAPHIC_METRICS) {
      const filter = demographicFilters[metric.id];
      const range = demographicRanges[metric.id];
      if (!filter) continue;
      if (filter.minimum <= range.minimum && filter.maximum >= range.maximum) continue;
      active[metric.id] = filter;
    }
    return active;
  }, [demographicFilters, demographicRanges]);
  const demographicFilterCount = Object.keys(activeDemographicFilters).length;

  const demographicMatchSet = useMemo(
    () => filterZipsByDemographics(territoryOpportunities, activeDemographicFilters),
    [activeDemographicFilters, territoryOpportunities],
  );

  const activeOpportunities = useMemo(
    () =>
      territoryOpportunities.filter(
        (opportunity) =>
          opportunity.score >= minScore &&
          (category === 'All categories' || opportunity.categoryStrength === category) &&
          demographicMatchSet.has(opportunity.zip),
      ),
    [category, demographicMatchSet, minScore, territoryOpportunities],
  );
  const activeZips = useMemo(() => activeOpportunities.map(({ zip }) => zip), [activeOpportunities]);

  const ranked = useMemo(
    () =>
      [...activeOpportunities]
        .sort((a, b) => lens.getValue(b) - lens.getValue(a) || b.score - a.score)
        .slice(0, 8),
    [activeOpportunities, lens],
  );

  const selected = selectedZip ? data.opportunitiesByZip.get(selectedZip) ?? null : null;
  const selectedDemographics = useMemo(
    () => (selected ? getZipDemographics(selected) : null),
    [selected],
  );
  const selectedInternalMetrics = useMemo(
    () => (selected ? getInternalZipMetrics(selected) : null),
    [selected],
  );
  const selectedCompetitors = useMemo(
    () => selected ? data.overlays.competitors.filter((competitor) => competitor.zips.includes(selected.zip)) : [],
    [data.overlays.competitors, selected],
  );
  const selectedHasReachGap = selected ? data.overlays.reachGapZips.includes(selected.zip) : false;

  const territoryName = view.selectedTerritory?.name ?? 'All Ohio';
  const territoryBrief = useMemo(
    () =>
      showBrief
        ? buildTerritoryBrief(
            territoryName,
            territoryOpportunities,
            data.overlays.competitors,
            data.overlays.reachGapZips,
          )
        : null,
    [data.overlays.competitors, data.overlays.reachGapZips, showBrief, territoryName, territoryOpportunities],
  );

  useEffect(() => {
    setSelectedZip(null);
    setLensId(OPPORTUNITY_LENS_ID);
    setMinScore(35);
    setCategory('All categories');
    setDemographicFilters({});
    setFiltersOpen(false);
    setShowReachGap(false);
    setVisibleCompetitorIds([]);
    setShowBrief(false);
    setMapResetVersion((version) => version + 1);
  }, [resetVersion]);

  useEffect(() => {
    setSelectedZip(null);
    setCategory('All categories');
    setDemographicFilters({});
  }, [view.selectedTerritoryId]);

  useEffect(() => {
    if (selectedZip && !activeZips.includes(selectedZip)) setSelectedZip(null);
  }, [activeZips, selectedZip]);

  const handleSelectZip = useCallback((zip: string | null) => {
    setSelectedZip(zip);
  }, []);

  const handleCompetitorVisibilityChange = useCallback(
    (competitorId: string, visible: boolean) => {
      setVisibleCompetitorIds((current) =>
        visible
          ? current.includes(competitorId)
            ? current
            : [...current, competitorId]
          : current.filter((id) => id !== competitorId),
      );
    },
    [],
  );

  const handleDemographicFilterChange = useCallback(
    (metricId: DemographicMetricId, minimum: number, maximum: number) => {
      setDemographicFilters((current) => ({ ...current, [metricId]: { minimum, maximum } }));
    },
    [],
  );

  const popupValueText = useCallback(
    (zip: string) => {
      if (lens.id === OPPORTUNITY_LENS_ID) return null;
      const opportunity = data.opportunitiesByZip.get(zip);
      if (!opportunity) return null;
      return `${lens.label}: ${formatLensValue(lens.format, lens.getValue(opportunity))}`;
    },
    [data.opportunitiesByZip, lens],
  );

  const lensIsOpportunity = lens.id === OPPORTUNITY_LENS_ID;

  return (
    <main className="explorer-grid product-grid">
      <aside className="panel panel--left">
        <div className="panel__heading">
          <span className="eyebrow">Market intelligence</span>
          <h1>{territoryName}</h1>
          <p>{view.selectedTerritory ? view.selectedTerritory.anchorCities.join(' · ') : data.market.subtitle}</p>
        </div>

        <section className="panel-section lens-section">
          <div className="section-heading">
            <span>Color ZIPs by</span>
            <small>Market lens</small>
          </div>
          <select
            className="lens-select"
            value={lens.id}
            aria-label="Color ZIP areas by market lens"
            onChange={(event) => setLensId(event.target.value)}
          >
            {(['opportunity', 'demographics', 'internal'] as const).map((group) => (
              <optgroup key={group} label={LENS_GROUP_LABELS[group]}>
                {MARKET_LENSES.filter((candidate) => candidate.group === group).map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="legend-ramp" style={{ background: opportunityLegendGradient }} aria-label={`${lens.label} legend`} />
          {lensIsOpportunity ? (
            <div className="legend-labels"><span>Emerging</span><span>Qualified</span><span>Priority</span></div>
          ) : (
            <div className="legend-labels">
              <span>{formatLensValue(lens.format, lensSurface.minimum)}</span>
              <span>{formatLensValue(lens.format, lensSurface.maximum)}</span>
            </div>
          )}
        </section>

        <section className="panel-section filter-zones">
          <button
            className="filter-zones__summary"
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <span>Filter ZIPs</span>
            <strong>{activeOpportunities.length} of {territoryOpportunities.length}</strong>
            <i aria-hidden="true">{filtersOpen ? '−' : '+'}</i>
          </button>

          {filtersOpen && (
            <div className="filter-zones__body">
              <label className="filter-control">
                <span><strong>Minimum opportunity</strong><b>{minScore}+</b></span>
                <input
                  type="range"
                  min="35"
                  max="90"
                  step="5"
                  value={minScore}
                  onChange={(event) => setMinScore(Number(event.target.value))}
                />
              </label>
              <label className="filter-control">
                <span><strong>Category strength</strong></span>
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categories.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>

              {DEMOGRAPHIC_METRICS.map((metric) => {
                const range = demographicRanges[metric.id];
                const value = demographicFilters[metric.id] ?? range;
                return (
                  <RangeSlider
                    key={metric.id}
                    label={metric.label}
                    minimum={range.minimum}
                    maximum={range.maximum}
                    step={sliderStep(metric.format)}
                    valueMinimum={value.minimum}
                    valueMaximum={value.maximum}
                    formattedRange={`${formatCompact(metric.format, value.minimum)} – ${formatCompact(metric.format, value.maximum)}`}
                    onChange={(minimum, maximum) => handleDemographicFilterChange(metric.id, minimum, maximum)}
                  />
                );
              })}

              <button
                className="filter-zones__reset"
                type="button"
                disabled={demographicFilterCount === 0 && minScore === 35 && category === 'All categories'}
                onClick={() => {
                  setDemographicFilters({});
                  setMinScore(35);
                  setCategory('All categories');
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </section>

        <MapLayerControls
          overlays={data.overlays}
          showReachGap={showReachGap}
          visibleCompetitorIds={visibleCompetitorIds}
          onShowReachGapChange={setShowReachGap}
          onCompetitorVisibilityChange={handleCompetitorVisibilityChange}
        />

        <section className="panel-section panel-section--grow">
          <div className="section-heading">
            <span>{lensIsOpportunity ? 'Highest opportunity' : `Strongest · ${lens.label}`}</span>
            <small>{territoryName}</small>
          </div>
          <div className="ranked-list">
            {ranked.length > 0 ? ranked.map((opportunity, index) => (
              <button
                className={`ranked-item ${selectedZip === opportunity.zip ? 'is-selected' : ''}`}
                key={opportunity.zip}
                type="button"
                onClick={() => setSelectedZip(opportunity.zip)}
              >
                <span className="ranked-item__rank">{index + 1}</span>
                <span className="ranked-item__body">
                  <strong>{opportunity.name}</strong>
                  <small>ZIP {opportunity.zip} · {getPriorityBand(opportunity.score)}</small>
                </span>
                <span className={`ranked-item__score ${lensIsOpportunity ? '' : 'is-metric'}`}>
                  {lensIsOpportunity ? opportunity.score : formatLensValue(lens.format, lens.getValue(opportunity))}
                </span>
              </button>
            )) : <p className="filter-empty">No ZIPs match these filters.</p>}
          </div>
        </section>

        <div className={`geometry-notice geometry-notice--${data.geometryMetadata.kind}`}>
          <span className="synthetic-notice__dot" />
          <div><strong>{data.geometryMetadata.label}</strong><small>{data.geometryMetadata.source} · {data.geometryMetadata.vintage}</small></div>
        </div>
        <div className="synthetic-notice">
          <span className="synthetic-notice__dot" />
          Opportunity, demographic, coverage, competitor, and internal business values are deterministic synthetic demonstration data.
        </div>
      </aside>

      <section className="map-stage">
        <OpportunityMap
          data={data}
          selectedZip={selectedZip}
          resetVersion={mapResetVersion}
          onSelectZip={handleSelectZip}
          activeZips={activeZips}
          displayScores={lensSurface.displayScores}
          territoryZips={view.territoryZips}
          viewportBounds={view.viewportBounds}
          layoutVersion={view.panelLayoutVersion}
          showReachGap={showReachGap}
          visibleCompetitorIds={visibleCompetitorIds}
          popupValueText={popupValueText}
        />
        <div className="map-stage__caption">
          <span>{territoryName}</span>
          <strong>{lensIsOpportunity ? 'Statewide ZIP fabric · selected territory stays vivid' : `ZIPs colored by ${lens.label.toLowerCase()}`}</strong>
        </div>
      </section>

      <aside className="panel panel--right">
        <ExperienceGuide
          tone="market"
          title="Market Opportunity Map"
          audience="Strategy, intelligence, and leadership"
          purpose="Compare demand, demographics, competitor activity, modeled Spectrum Reach position, and revenue whitespace."
          nextStep="Select a market or ZIP, then generate a territory opportunity brief."
        />
        {selected && selectedDemographics && selectedInternalMetrics ? (
          <>
            <div className="detail-hero">
              <div>
                <span className="eyebrow">Selected opportunity</span>
                <h2>{selected.name}</h2>
                <p>ZIP {selected.zip} · {getPriorityBand(selected.score)} priority</p>
              </div>
              <ScoreRing score={selected.score} />
            </div>

            <div className="confidence-row">
              <span>Model confidence</span>
              <strong>{selected.confidence}</strong>
            </div>

            <section className="detail-section">
              <span className="detail-section__label">Demographics · synthetic</span>
              <div className="demographics-table">
                <div className="demographics-row">
                  <span>Households</span>
                  <strong>{numberFormatter.format(selected.householdCount)}</strong>
                </div>
                {DEMOGRAPHIC_METRICS.map((metric) => (
                  <div
                    className={`demographics-row ${lens.id === metric.id ? 'is-lens' : ''}`}
                    key={metric.id}
                  >
                    <span>{metric.label}</span>
                    <strong>{formatDemographicValue(metric.format, selectedDemographics[metric.id])}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <span className="detail-section__label">Internal signals · modeled</span>
              <dl className="internal-metrics">
                <div><dt>Reach penetration</dt><dd>{selectedInternalMetrics.penetrationRate.toFixed(1)}%</dd></div>
                <div><dt>ARPU</dt><dd>${selectedInternalMetrics.arpu.toFixed(2)}</dd></div>
                <div><dt>Churn rate</dt><dd>{selectedInternalMetrics.churnRate.toFixed(2)}%</dd></div>
                <div><dt>Share of wallet</dt><dd>{selectedInternalMetrics.shareOfWallet.toFixed(1)}%</dd></div>
                <div><dt>Active accounts</dt><dd>{numberFormatter.format(selectedInternalMetrics.activeAccounts)}</dd></div>
                <div><dt>Ad revenue</dt><dd>{currencyFormatter.format(selectedInternalMetrics.adRevenue)}</dd></div>
                <div><dt>Competitor spend</dt><dd>{currencyFormatter.format(selectedInternalMetrics.competitorSpend)}</dd></div>
                <div><dt>Revenue whitespace</dt><dd>{currencyFormatter.format(selectedInternalMetrics.revenueWhitespace)}</dd></div>
                <div><dt>Top ad categories</dt><dd>{selectedInternalMetrics.topAdCategories.join(' · ')}</dd></div>
                <div><dt>YoY growth</dt><dd>{selectedInternalMetrics.yoyGrowth > 0 ? '+' : ''}{selectedInternalMetrics.yoyGrowth.toFixed(1)}%</dd></div>
              </dl>
              <small className="competitive-disclosure">Modeled synthetic business signals. Internal only — never shown in the client workspace.</small>
            </section>

            <section className="detail-section competitive-landscape">
              <span className="detail-section__label">Competitive landscape</span>
              <div className="competition-summary">
                <div><strong>{selectedCompetitors.length}</strong><span>modeled competitor footprints</span></div>
                <span className={`reach-status ${selectedHasReachGap ? 'has-gap' : ''}`}>
                  {selectedHasReachGap ? 'Reach gap detected' : 'No modeled reach gap'}
                </span>
              </div>
              {selectedCompetitors.length > 0 ? (
                <div className="competitor-intel-list">
                  {selectedCompetitors.map((competitor) => {
                    const visible = visibleCompetitorIds.includes(competitor.id);
                    return (
                      <button
                        className={`competitor-intel-card ${visible ? 'is-visible' : ''}`}
                        key={competitor.id}
                        type="button"
                        aria-pressed={visible}
                        style={{ '--competitor-color': competitor.color } as CSSProperties}
                        onClick={() => handleCompetitorVisibilityChange(competitor.id, !visible)}
                      >
                        <span className="competitor-intel-card__swatch" aria-hidden="true" />
                        <span><strong>{competitor.label}</strong><small>{competitor.subtitle}</small></span>
                        <em>{visible ? 'Layer visible' : 'Show footprint'}</em>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="competitive-empty">No synthetic competitor footprint currently intersects this ZIP.</p>
              )}
              <small className="competitive-disclosure">Footprints are illustrative fictional ZIP memberships, not provider service-area claims.</small>
            </section>

            <section className="detail-section detail-section--grow">
              <span className="detail-section__label">Why this ZIP stands out</span>
              <p className="detail-summary">{selected.summary}</p>
              <div className="driver-grid">
                <div><span>Top driver</span><strong>{COMPONENT_LABELS[selected.topDriver]}</strong></div>
                <div><span>Top limiter</span><strong>{COMPONENT_LABELS[selected.topLimiter]}</strong></div>
              </div>
              <div className="component-list">
                {(Object.keys(selected.components) as Array<keyof typeof selected.components>).map((component) => {
                  const value = selected.components[component];
                  const maximum = COMPONENT_MAXIMUMS[component];
                  return (
                    <div className="component-row" key={component}>
                      <div className="component-row__heading">
                        <span>{COMPONENT_LABELS[component]}</span>
                        <strong>{value}/{maximum}</strong>
                      </div>
                      <div className="component-row__track"><i style={{ width: `${(value / maximum) * 100}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <div className="empty-detail">
            <div className="empty-detail__visual"><span>OH</span></div>
            <span className="eyebrow">Find the market</span>
            <h2>Where can the company compete and grow?</h2>
            <p>Color the map with a market lens, narrow the ZIP set, then open any ZIP for its full market profile.</p>
            <div className="empty-detail__hint"><span>1</span>Choose a market lens and territory</div>
            <div className="empty-detail__hint"><span>2</span>Select a ZIP on the map or ranked list</div>
            <div className="empty-detail__hint"><span>3</span>Generate the territory opportunity brief</div>
          </div>
        )}

        <button className="primary-action" type="button" onClick={() => setShowBrief(true)}>
          Create territory brief
        </button>
        <p className="model-disclosure">Illustrative synthetic market intelligence. No real company, client, or competitor data is shown.</p>
      </aside>

      {showBrief && territoryBrief && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowBrief(false)}>
          <section className="architect-modal" role="dialog" aria-modal="true" aria-labelledby="brief-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close territory brief" onClick={() => setShowBrief(false)}>×</button>
            <span className="eyebrow">Market opportunity brief</span>
            <h2 id="brief-title">{territoryBrief.territoryName}</h2>
            <p>Where Spectrum Reach can win, why it matters, and the strongest modeled company-level advantage.</p>
            <dl className="handoff-grid">
              <div><dt>ZIP areas</dt><dd>{numberFormatter.format(territoryBrief.zipCount)}</dd></div>
              <div><dt>Average opportunity</dt><dd>{territoryBrief.averageOpportunityScore}/100</dd></div>
              <div><dt>Strongest category</dt><dd>{territoryBrief.topCategory}</dd></div>
              <div><dt>Modeled penetration</dt><dd>{territoryBrief.averagePenetrationRate.toFixed(1)}%</dd></div>
              <div><dt>Reach-gap ZIPs</dt><dd>{territoryBrief.reachGapZipCount}</dd></div>
              <div><dt>Revenue whitespace</dt><dd>{currencyFormatter.format(territoryBrief.totalRevenueWhitespace)}</dd></div>
              <div><dt>Competitor spend</dt><dd>{currencyFormatter.format(territoryBrief.totalCompetitorSpend)}</dd></div>
              <div>
                <dt>Strongest competitor</dt>
                <dd>
                  {territoryBrief.strongestCompetitor
                    ? `${territoryBrief.strongestCompetitor.label} · ${territoryBrief.strongestCompetitor.zipCount} ZIPs`
                    : 'None modeled'}
                </dd>
              </div>
            </dl>
            <section className="brief-highlights">
              <span>Priority ZIPs</span>
              {territoryBrief.highlights.map((highlight) => (
                <div key={highlight.zip}>
                  <strong>{highlight.name}</strong>
                  <small>ZIP {highlight.zip} · {highlight.score}/100 · {currencyFormatter.format(highlight.revenueWhitespace)} whitespace</small>
                </div>
              ))}
            </section>
            <section className="brief-recommendation">
              <span>Recommendation</span>
              <p>{territoryBrief.recommendation}</p>
            </section>
            <small>Deterministic synthetic market brief. Not a production forecast.</small>
          </section>
        </div>
      )}
    </main>
  );
}
