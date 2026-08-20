export function allTerritoriesId(marketId: string): string {
  return `all-${marketId}`;
}

export function isAllTerritoriesId(id: string): boolean {
  return id.startsWith('all-');
}

export const ALL_TERRITORIES_ID = allTerritoriesId('ohio');

export type GeographicBounds = [west: number, south: number, east: number, north: number];

export interface TerritoryDefinition {
  id: string;
  name: string;
  selectorLabel: string;
  anchorCities: string[];
  center: [longitude: number, latitude: number];
  bounds: GeographicBounds;
  zips: string[];
}

export function findTerritory(
  territories: readonly TerritoryDefinition[],
  territoryId: string,
): TerritoryDefinition | null {
  if (isAllTerritoriesId(territoryId)) return null;
  return territories.find((territory) => territory.id === territoryId) ?? null;
}

export function getTerritoryZips(
  territories: readonly TerritoryDefinition[],
  territoryId: string,
  allZips: readonly string[],
): readonly string[] {
  return findTerritory(territories, territoryId)?.zips ?? allZips;
}

export function assertTerritoryDefinitions(
  territories: readonly TerritoryDefinition[],
  validZipValues: readonly string[],
): void {
  if (territories.length === 0) throw new Error('At least one territory is required');

  const validZips = new Set(validZipValues);
  const territoryIds = new Set<string>();
  const assignedZips = new Set<string>();

  for (const territory of territories) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(territory.id)) {
      throw new Error(`Invalid territory id: ${territory.id}`);
    }
    if (territoryIds.has(territory.id)) {
      throw new Error(`Duplicate territory id: ${territory.id}`);
    }
    territoryIds.add(territory.id);

    if (!territory.name.trim() || !territory.selectorLabel.trim()) {
      throw new Error(`Territory ${territory.id} is missing a display label`);
    }
    if (!Array.isArray(territory.bounds) || territory.bounds.length !== 4) {
      throw new Error(`Territory ${territory.id} has invalid bounds`);
    }
    if (!Array.isArray(territory.zips) || territory.zips.length === 0) {
      throw new Error(`Territory ${territory.id} must contain ZIPs`);
    }

    for (const zip of territory.zips) {
      if (!validZips.has(zip)) {
        throw new Error(`Territory ${territory.id} references ZIP ${zip} outside the market`);
      }
      if (assignedZips.has(zip)) {
        throw new Error(`ZIP ${zip} belongs to multiple territories`);
      }
      assignedZips.add(zip);
    }
  }

  if (assignedZips.size !== validZips.size) {
    throw new Error('Territories must cover every market ZIP exactly once');
  }
}
