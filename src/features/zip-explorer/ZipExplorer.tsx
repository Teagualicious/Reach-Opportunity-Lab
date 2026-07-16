import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { ProductViewContext } from '../../app/ProductViewContext';
import { MapLayerControls } from '../../components/MapLayerControls';
import { ScoreRing } from '../../components/ScoreRing';
import type { OpportunityMarket } from '../../data/OpportunityRepository';
import {
  COMPONENT_LABELS,
  COMPONENT_MAXIMUMS,
  getPriorityBand,
} from '../../domain/opportunity';
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

export function ZipExplorer({ data, resetVersion, view }: ZipExplorerProps) {
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [minScore, setMinScore] = useState(35);
  const [category, setCategory] = useState('All categories');
  const [showReachGap, setShowReachGap] = useState(false);
  const [visibleCompetitorIds, setVisibleCompetitorIds] = useState<string[]>([]);
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

  const activeOpportunities = useMemo(
    () =>
      territoryOpportunities.filter(
        (opportunity) =>
          opportunity.score >= minScore &&
          (category === 'All categories' || opportunity.categoryStrength === category),
      ),
    [category, minScore, territoryOpportunities],
  );
  const activeZips = useMemo(() => activeOpportunities.map(({ zip }) => zip), [activeOpportunities]);
  const selected = selectedZip ? data.opportunitiesByZip.get(selectedZip) ?? null : null;
  const ranked = useMemo(
    () => [...activeOpportunities].sort((a, b) => b.score - a.score).slice(0, 8),
    [activeOpportunities],
  );
  const selectedCompetitors = useMemo(
    () => selected ? data.overlays.competitors.filter((competitor) => competitor.zips.includes(selected.zip)) : [],
    [data.overlays.competitors, selected],
  );
  const selectedHasReachGap = selected ? data.overlays.reachGapZips.includes(selected.zip) : false;

  useEffect(() => {
    setSelectedZip(null);
    setMinScore(35);
    setCategory('All categories');
    setShowReachGap(false);
    setVisibleCompetitorIds([]);
    setMapResetVersion((version) => version + 1);
  }, [resetVersion]);

  useEffect(() => {
    setSelectedZip(null);
    setCategory('All categories');
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

  const territoryName = view.selectedTerritory?.name ?? 'All Ohio';

  return (
    <main className="explorer-grid product-grid">
      <aside className="panel panel--left">
        <div className="panel__heading">
          <span className="eyebrow">Market intelligence</span>
          <h1>{territoryName}</h1>
          <p>{view.selectedTerritory ? view.selectedTerritory.anchorCities.join(' · ') : data.market.subtitle}</p>
        </div>

        <section className="panel-section">
          <div className="section-heading">
            <span>ZIP opportunity</span>
            <strong>{activeOpportunities.length} of {territoryOpportunities.length}</strong>
          </div>
          <div className="legend-ramp" style={{ background: opportunityLegendGradient }} aria-label="Opportunity score legend" />
          <div className="legend-labels"><span>Emerging</span><span>Qualified</span><span>Priority</span></div>
        </section>

        <section className="panel-section filter-stack">
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
            <span>Highest opportunity</span>
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
                <span className="ranked-item__score">{opportunity.score}</span>
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
          Statewide opportunity, coverage, and competitor values are deterministic synthetic demonstration data.
        </div>
      </aside>

      <section className="map-stage">
        <OpportunityMap
          data={data}
          selectedZip={selectedZip}
          resetVersion={mapResetVersion}
          onSelectZip={handleSelectZip}
          activeZips={activeZips}
          territoryZips={view.territoryZips}
          viewportBounds={view.viewportBounds}
          layoutVersion={view.panelLayoutVersion}
          showReachGap={showReachGap}
          visibleCompetitorIds={visibleCompetitorIds}
        />
        <div className="map-stage__caption">
          <span>{territoryName}</span>
          <strong>Statewide ZIP fabric · selected territory stays vivid</strong>
        </div>
      </section>

      <aside className="panel panel--right">
        {selected ? (
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
              <small className="competitive-disclosure">Footprints are illustrative ZIP memberships, not provider service-area claims.</small>
            </section>

            <section className="detail-section">
              <span className="detail-section__label">Why this ZIP stands out</span>
              <p className="detail-summary">{selected.summary}</p>
              <div className="driver-grid">
                <div><span>Top driver</span><strong>{COMPONENT_LABELS[selected.topDriver]}</strong></div>
                <div><span>Top limiter</span><strong>{COMPONENT_LABELS[selected.topLimiter]}</strong></div>
              </div>
            </section>

            <section className="detail-section detail-section--grow">
              <span className="detail-section__label">Score breakdown</span>
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

            <section className="detail-section">
              <span className="detail-section__label">Market context</span>
              <dl className="metric-grid">
                <div><dt>Households</dt><dd>{numberFormatter.format(selected.householdCount)}</dd></div>
                <div><dt>Median income</dt><dd>{currencyFormatter.format(selected.medianIncome)}</dd></div>
                <div><dt>Category strength</dt><dd>{selected.categoryStrength}</dd></div>
              </dl>
            </section>
          </>
        ) : (
          <div className="empty-detail">
            <div className="empty-detail__visual"><span>OH</span></div>
            <span className="eyebrow">Explore the network</span>
            <h2>Select a ZIP to reveal the opportunity</h2>
            <p>Choose any Ohio ZIP to review its opportunity drivers, market context, and modeled competitive landscape.</p>
            <div className="empty-detail__hint"><span>1</span>Select All Ohio or a major-city territory</div>
            <div className="empty-detail__hint"><span>2</span>Choose a ZIP on the map or ranked list</div>
            <div className="empty-detail__hint"><span>3</span>Review signals before moving into a growth workflow</div>
          </div>
        )}
      </aside>
    </main>
  );
}
