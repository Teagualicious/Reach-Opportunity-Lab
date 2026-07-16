import { useEffect, useMemo, useState } from 'react';
import { TerritorySelector } from '../components/TerritorySelector';
import type { OpportunityMarket } from '../data/OpportunityRepository';
import {
  ALL_TERRITORIES_ID,
  findTerritory,
  getTerritoryZips,
} from '../domain/territory';
import { ClientGrowthStudio } from '../features/client-growth/ClientGrowthStudio';
import { MarketGrowthStudio } from '../features/market-growth/MarketGrowthStudio';
import { ZipExplorer } from '../features/zip-explorer/ZipExplorer';
import type { ProductViewContext } from './ProductViewContext';
import { useViewportMode } from './useViewportMode';

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
  const territories = data.market.territories ?? [];
  const defaultTerritoryId = data.market.defaultTerritoryId ?? ALL_TERRITORIES_ID;
  const viewportMode = useViewportMode();
  const isCompact = viewportMode === 'compact';
  const [mode, setMode] = useState<ProductMode>('explorer');
  const [resetVersion, setResetVersion] = useState(0);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState(defaultTerritoryId);
  const [leftCollapsed, setLeftCollapsed] = useState(isCompact);
  const [rightCollapsed, setRightCollapsed] = useState(isCompact);

  // Compact mode is map-first: crossing the breakpoint closes both bottom
  // sheets; returning to the expanded layout restores both sidebars.
  useEffect(() => {
    setLeftCollapsed(isCompact);
    setRightCollapsed(isCompact);
  }, [isCompact]);

  const allZips = useMemo(() => data.opportunities.map(({ zip }) => zip), [data.opportunities]);
  const selectedTerritory = useMemo(
    () => findTerritory(territories, selectedTerritoryId),
    [selectedTerritoryId, territories],
  );
  const territoryZips = useMemo(
    () => getTerritoryZips(territories, selectedTerritoryId, allZips),
    [allZips, selectedTerritoryId, territories],
  );
  const view = useMemo<ProductViewContext>(
    () => ({
      selectedTerritoryId,
      selectedTerritory,
      territoryZips,
      viewportBounds: selectedTerritory?.bounds ?? data.market.bounds,
      panelLayoutVersion:
        (leftCollapsed ? 1 : 0) + (rightCollapsed ? 2 : 0) + (isCompact ? 4 : 0),
      viewportMode,
    }),
    [
      data.market.bounds,
      isCompact,
      leftCollapsed,
      rightCollapsed,
      selectedTerritory,
      selectedTerritoryId,
      territoryZips,
      viewportMode,
    ],
  );

  const resetReview = () => {
    setSelectedTerritoryId(defaultTerritoryId);
    setLeftCollapsed(isCompact);
    setRightCollapsed(isCompact);
    setResetVersion((version) => version + 1);
  };

  // Compact bottom sheets open one at a time so the map keeps context.
  const toggleLeftPanel = () => {
    setLeftCollapsed((collapsed) => {
      if (collapsed && isCompact) setRightCollapsed(true);
      return !collapsed;
    });
  };
  const toggleRightPanel = () => {
    setRightCollapsed((collapsed) => {
      if (collapsed && isCompact) setLeftCollapsed(true);
      return !collapsed;
    });
  };

  return (
    <div
      className={`explorer-shell ${leftCollapsed ? 'is-left-collapsed' : ''} ${
        rightCollapsed ? 'is-right-collapsed' : ''
      }`}
    >
      <header className="app-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div>
            <span className="brand-kicker">Reach</span>
            <strong>Opportunity Lab</strong>
          </div>
        </div>

        <TerritorySelector
          territories={territories}
          selectedTerritoryId={selectedTerritoryId}
          onChange={setSelectedTerritoryId}
        />

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

        <button className="reset-button" type="button" onClick={resetReview}>Reset review</button>
      </header>

      <button
        className="panel-toggle panel-toggle--left"
        type="button"
        aria-label={
          isCompact
            ? leftCollapsed
              ? 'Open controls panel'
              : 'Close controls panel'
            : leftCollapsed
              ? 'Expand left sidebar'
              : 'Collapse left sidebar'
        }
        aria-expanded={!leftCollapsed}
        onClick={toggleLeftPanel}
      >
        {isCompact ? (
          <span className="panel-toggle__label">{leftCollapsed ? 'Controls' : 'Close'}</span>
        ) : (
          <span aria-hidden="true">{leftCollapsed ? '›' : '‹'}</span>
        )}
      </button>
      <button
        className="panel-toggle panel-toggle--right"
        type="button"
        aria-label={
          isCompact
            ? rightCollapsed
              ? 'Open details panel'
              : 'Close details panel'
            : rightCollapsed
              ? 'Expand right sidebar'
              : 'Collapse right sidebar'
        }
        aria-expanded={!rightCollapsed}
        onClick={toggleRightPanel}
      >
        {isCompact ? (
          <span className="panel-toggle__label">{rightCollapsed ? 'Details' : 'Close'}</span>
        ) : (
          <span aria-hidden="true">{rightCollapsed ? '‹' : '›'}</span>
        )}
      </button>

      {mode === 'explorer' && <ZipExplorer data={data} resetVersion={resetVersion} view={view} />}
      {mode === 'client-growth' && <ClientGrowthStudio data={data} resetVersion={resetVersion} view={view} />}
      {mode === 'market-growth' && <MarketGrowthStudio data={data} resetVersion={resetVersion} view={view} />}
    </div>
  );
}
