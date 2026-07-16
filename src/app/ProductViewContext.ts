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
}
