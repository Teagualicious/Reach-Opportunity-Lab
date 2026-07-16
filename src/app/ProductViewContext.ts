import type { GeographicBounds, TerritoryDefinition } from '../domain/territory';

export interface ProductViewContext {
  selectedTerritoryId: string;
  selectedTerritory: TerritoryDefinition | null;
  territoryZips: readonly string[];
  viewportBounds: GeographicBounds;
  panelLayoutVersion: number;
}
