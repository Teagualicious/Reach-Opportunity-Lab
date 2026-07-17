import type { GeographicBounds, TerritoryDefinition } from '../domain/territory';
import type { ViewportMode } from './useViewportMode';

export interface ProductViewContext {
  selectedTerritoryId: string;
  selectedTerritory: TerritoryDefinition | null;
  territoryZips: readonly string[];
  viewportBounds: GeographicBounds;
  panelLayoutVersion: number;
  /** 'compact' on phone-sized viewports; features adapt to this, never to user-agent strings. */
  viewportMode: ViewportMode;
  /** True at the statewide level: the map shows solid regions until one is chosen. */
  regionMode: boolean;
  /** Region-first navigation: drill into a region or return to all regions. */
  selectTerritory: (territoryId: string) => void;
  /** Selected county inside the territory, or null while at the county level. */
  selectedCountyId: string | null;
  selectCounty: (countyId: string | null) => void;
}
