import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductViewContext } from '../../app/ProductViewContext';
import { AreaPicker } from '../../components/AreaPicker';
import { ExperienceGuide } from '../../components/ExperienceGuide';
import { MapBreadcrumb } from '../../components/MapBreadcrumb';
import type { OpportunityMarket } from '../../data/OpportunityRepository';
import { buildCountySummaries } from '../../domain/countySummary';
import { MARKET_MODES, getMarketModeScore, type MarketModeId } from '../../domain/marketMode';
import { buildRegionSummaries } from '../../domain/regionSummary';
import { buildSellerOpportunity } from '../../domain/sellerOpportunity';
import type { GeographicBounds } from '../../domain/territory';
import { getGeometryBounds } from '../../map/geometryBounds';
import { buildCountyGroupLayer, buildRegionGroupLayer } from '../../map/mapGroups';
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
  const [mode, setMode] = useState<MarketModeId>('account-growth');
  const [selectedZip, setSelectedZip] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [showOutreach, setShowOutreach] = useState(false);

  const territories = data.market.territories ?? [];
  const regionSummaries = useMemo(
    () => buildRegionSummaries(data.opportunities, territories),
    [data.opportunities, territories],
  );
  const territoryZipSet = useMemo(() => new Set(view.territoryZips), [view.territoryZips]);
  const territoryOpportunities = useMemo(
    () => data.opportunities.filter((opportunity) => territoryZipSet.has(opportunity.zip)),
    [data.opportunities, territoryZipSet],
  );
  const countySummaries = useMemo(
    () => buildCountySummaries(territoryOpportunities),
    [territoryOpportunities],
  );
  const selectedCounty = useMemo(
    () => countySummaries.find((county) => county.countyId === view.selectedCountyId) ?? null,
    [countySummaries, view.selectedCountyId],
  );
  // If county assignments are unavailable (e.g. stale cached fixtures), skip
  // the county level so ZIP areas stay reachable and clickable.
  const countiesAvailable = countySummaries.length > 0;
  const level: 'regions' | 'counties' | 'zips' = view.regionMode
    ? 'regions'
    : selectedCounty || !countiesAvailable
      ? 'zips'
      : 'counties';
  const focusZips = selectedCounty ? selectedCounty.zips : view.territoryZips;
  const focusZipSet = useMemo(() => new Set(focusZips), [focusZips]);
  const focusOpportunities = useMemo(
    () =>
      selectedCounty
        ? territoryOpportunities.filter((opportunity) => focusZipSet.has(opportunity.zip))
        : territoryOpportunities,
    [focusZipSet, selectedCounty, territoryOpportunities],
  );
  const countyBounds = useMemo<GeographicBounds | null>(() => {
    if (!selectedCounty) return null;
    let merged: GeographicBounds | null = null;
    for (const feature of data.geometry.features) {
      if (feature.properties.countyId !== selectedCounty.countyId) continue;
      const bounds = getGeometryBounds(feature.geometry);
      if (!bounds) continue;
      merged = merged
        ? [
            Math.min(merged[0], bounds[0]),
            Math.min(merged[1], bounds[1]),
            Math.max(merged[2], bounds[2]),
            Math.max(merged[3], bounds[3]),
          ]
        : bounds;
    }
    return merged;
  }, [data.geometry.features, selectedCounty]);
  const groupLayer = useMemo(() => {
    if (level === 'regions') return buildRegionGroupLayer(regionSummaries);
    if (level === 'counties') return buildCountyGroupLayer(countySummaries);
    return null;
  }, [countySummaries, level, regionSummaries]);

  // Quiet ZIP-code labels inside a drilled county, matching the county text.
  const areaLabels = useMemo(() => {
    if (level !== 'zips' || !selectedCounty) return [];
    return focusOpportunities
      .filter((opportunity) => opportunity.centroid)
      .map((opportunity) => ({
        id: opportunity.zip,
        text: opportunity.zip,
        center: opportunity.centroid as [number, number],
      }));
  }, [focusOpportunities, level, selectedCounty]);
  const handleSelectGroup = useCallback(
    (groupId: string) => {
      if (view.regionMode) view.selectTerritory(groupId);
      else view.selectCounty(groupId);
    },
    [view],
  );

  useEffect(() => {
    setMode('account-growth');
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
    () => [...focusOpportunities].sort((a, b) => scores[b.zip] - scores[a.zip]).slice(0, 8),
    [scores, focusOpportunities],
  );
  const actionQueue = useMemo(
    () => ranked.map((opportunity, index) => buildSellerOpportunity(opportunity, mode, scores[opportunity.zip], index)),
    [mode, ranked, scores],
  );

  useEffect(() => {
    setSelectedZip(ranked[0]?.zip ?? null);
    setSimulated(false);
  }, [ranked, view.selectedCountyId, view.selectedTerritoryId]);

  const selected = (selectedZip ? data.opportunitiesByZip.get(selectedZip) : undefined) ?? ranked[0];
  const selectedIndex = selected ? Math.max(0, ranked.findIndex((opportunity) => opportunity.zip === selected.zip)) : 0;
  const selectedItem = selected
    ? buildSellerOpportunity(selected, mode, scores[selected.zip], selectedIndex)
    : null;
  const selectedScore = selectedItem?.priorityScore ?? 0;
  const projectedScore = simulated ? Math.min(100, selectedScore + 9) : selectedScore;
  const handleSelectZip = useCallback((zip: string | null) => setSelectedZip(zip), []);
  const territoryName = view.selectedTerritory?.name ?? 'All Ohio';
  const focusName = selectedCounty ? `${selectedCounty.name} County` : territoryName;

  return (
    <main className="studio-grid market-studio product-grid">
      <aside className="panel panel--left seller-workspace-controls">
        <div className="panel__heading">
          <span className="eyebrow">Prioritize the business</span>
          <h1>{level === 'regions' ? 'Ohio' : level === 'counties' ? territoryName : focusName}</h1>
          <p>
            {level === 'regions'
              ? 'Pick a region, then a county, to build its seller action queue.'
              : level === 'counties'
                ? 'Pick a county to build its seller action queue.'
                : 'Which existing account should you grow or protect — and who should you contact?'}
          </p>
        </div>

        {level === 'regions' && (
          <>
            <AreaPicker
              intro="Start with a region. Click one on the map, or choose it here to see its counties."
              items={regionSummaries.map((region) => ({
                id: region.territoryId,
                name: region.name,
                subtitle: region.anchorCities.join(' · '),
                score: region.averageOpportunityScore,
              }))}
              onSelect={view.selectTerritory}
            />
            <div className="synthetic-notice"><span className="synthetic-notice__dot" />Seller queue, accounts, decision makers, and performance signals are synthetic.</div>
          </>
        )}

        {level === 'counties' && (
          <>
            <AreaPicker
              intro="Pick a county. Click one on the map, or choose it here to build its action queue."
              items={countySummaries.map((county) => ({
                id: county.countyId,
                name: `${county.name} County`,
                subtitle: `${county.zipCount} ZIP ${county.zipCount === 1 ? 'area' : 'areas'} · strongest: ${county.topCategory}`,
                score: county.averageOpportunityScore,
              }))}
              onSelect={(countyId) => view.selectCounty(countyId)}
            />
            <div className="synthetic-notice"><span className="synthetic-notice__dot" />Seller queue, accounts, decision makers, and performance signals are synthetic.</div>
          </>
        )}

        {level === 'zips' && (
        <>
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
          <div className="section-heading"><span>Seller action queue</span><small>{focusName}</small></div>
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

        <div className="synthetic-notice"><span className="synthetic-notice__dot" />Seller queue, accounts, decision makers, and performance signals are synthetic.</div>
        </>
        )}
      </aside>

      <section className="map-stage">
        <OpportunityMap
          data={data}
          selectedZip={level === 'zips' ? selected?.zip ?? null : null}
          resetVersion={resetVersion}
          onSelectZip={handleSelectZip}
          displayScores={level === 'zips' ? scores : undefined}
          campaignZips={level === 'zips' && selected ? [selected.zip] : []}
          territoryZips={focusZips}
          viewportBounds={countyBounds ?? view.viewportBounds}
          layoutVersion={view.panelLayoutVersion}
          groupLayer={groupLayer}
          onSelectGroup={handleSelectGroup}
          areaLabels={areaLabels}
        />
        <MapBreadcrumb
          regionName={view.selectedTerritory?.name ?? null}
          countyName={selectedCounty ? `${selectedCounty.name} County` : null}
          onSelectTerritory={view.selectTerritory}
          onClearCounty={() => view.selectCounty(null)}
        />
        <div className="map-stage__caption">
          <span>{level === 'regions' ? 'Ohio' : level === 'counties' ? territoryName : 'Geographic evidence'}</span>
          <strong>
            {level === 'regions'
              ? 'Click a region to see its counties'
              : level === 'counties'
                ? 'Click a county to build its action queue'
                : selectedItem
                  ? `${selectedItem.entityName} · ${definition.label}`
                  : definition.label}
          </strong>
        </div>
      </section>

      <aside className="panel panel--right seller-action-detail">
        <ExperienceGuide
          tone="seller"
          title="Seller Action Center"
          audience="Local sellers and sales managers"
          purpose="Grow and protect the existing book by finding whitespace, surfacing retention risk, and identifying the right decision maker. New Business is a secondary handoff."
          nextStep={
            level === 'regions'
              ? 'Pick a region, then a county, to see who is worth contacting there.'
              : level === 'counties'
                ? 'Pick a county to see who is worth contacting there.'
                : 'Start with Account Whitespace or Retention, open an account brief, then contact the synthetic decision maker.'
          }
        />
        {level !== 'zips' && (
          <div className="empty-detail">
            <span className="eyebrow">Prioritize the business</span>
            <h2>{level === 'regions' ? 'Start with a region' : 'Pick a county'}</h2>
            <p>
              {level === 'regions'
                ? 'Choose a region on the map or in the list, then one of its counties, to build the prioritized seller action queue.'
                : 'Choose a county on the map or in the list to build its prioritized seller action queue.'}
            </p>
          </div>
        )}
        {level === 'zips' && selected && selectedItem && (
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
                <span>{selectedItem.valueLabel}</span>
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

            <section
              className="decision-maker-card"
              aria-label={`Synthetic decision maker for ${selectedItem.entityName}`}
            >
              <div className="decision-maker-card__heading">
                <span>Decision maker</span>
                <em>{selectedItem.decisionMaker.statusLabel}</em>
              </div>
              <strong>{selectedItem.decisionMaker.fullName}</strong>
              <p>{selectedItem.decisionMaker.title}</p>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedItem.decisionMaker.professionalEmail}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selectedItem.decisionMaker.phoneDisplay}</dd>
                </div>
              </dl>
              <div className="contact-actions">
                <a
                  className="contact-action contact-action--primary"
                  href={`mailto:${selectedItem.decisionMaker.professionalEmail}`}
                >
                  Email
                </a>
                <a
                  className="contact-action"
                  href={`tel:${selectedItem.decisionMaker.phoneE164}`}
                >
                  Call
                </a>
              </div>
              <small>
                {selectedItem.decisionMaker.sourceLabel}. These contact values are reserved synthetic demo data.
              </small>
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
              <p>{simulated ? `The illustrative action improves the seller priority within ${focusName}.` : 'Model the recommended action to compare the current and potential seller state.'}</p>
            </section>

            <button className="primary-action" type="button" onClick={() => setShowOutreach(true)}>
              Build outreach plan
            </button>
            <button className="secondary-action" type="button" onClick={() => setSimulated((value) => !value)}>
              {simulated ? 'Return to current state' : 'Model seller action'}
            </button>
            <p className="model-disclosure">Illustrative synthetic results and decision-maker contacts. No real account, prospect, seller, contact, or revenue data is shown.</p>
          </>
        )}
      </aside>

      {showOutreach && selected && selectedItem && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowOutreach(false)}>
          <section className="architect-modal" role="dialog" aria-modal="true" aria-labelledby="outreach-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close outreach plan" onClick={() => setShowOutreach(false)}>×</button>
            <span className="eyebrow">Seller outreach plan</span>
            <h2 id="outreach-title">{selectedItem.entityName}</h2>
            <p>{definition.label} play for {selected.name} · ZIP {selected.zip} within {focusName}.</p>
            <dl className="handoff-grid">
              <div><dt>Account</dt><dd>{selectedItem.entityName} · {selectedItem.entityKind}</dd></div>
              <div><dt>Decision maker</dt><dd>{selectedItem.decisionMaker.fullName} · {selectedItem.decisionMaker.title}</dd></div>
              <div><dt>Objective</dt><dd>{definition.label}</dd></div>
              <div><dt>Lead with</dt><dd>{selectedItem.leadWith}</dd></div>
              <div>
                <dt>{selectedItem.valueLabel}</dt>
                <dd>
                  {currencyFormatter.format(selectedItem.opportunityRange.minimum)}–
                  {currencyFormatter.format(selectedItem.opportunityRange.maximum)}
                </dd>
              </div>
            </dl>
            <div className="contact-actions contact-actions--modal">
              <a
                className="contact-action contact-action--primary"
                href={`mailto:${selectedItem.decisionMaker.professionalEmail}`}
              >
                Email {selectedItem.decisionMaker.fullName}
              </a>
              <a
                className="contact-action"
                href={`tel:${selectedItem.decisionMaker.phoneE164}`}
              >
                Call {selectedItem.decisionMaker.phoneDisplay}
              </a>
            </div>
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
            <small>Deterministic synthetic outreach plan and contact. No real account, prospect, seller, contact, or revenue data.</small>
          </section>
        </div>
      )}
    </main>
  );
}
