import { describe, expect, it } from 'vitest';
import {
  ALL_TERRITORIES_ID,
  allTerritoriesId,
  assertTerritoryDefinitions,
  findTerritory,
  getTerritoryZips,
  isAllTerritoriesId,
  type TerritoryDefinition,
} from './territory';

const territories: TerritoryDefinition[] = [
  {
    id: 'north',
    name: 'North',
    selectorLabel: 'North · Example City',
    anchorCities: ['Example City'],
    center: [-81.5, 41.2],
    bounds: [-82, 41, -81, 42],
    zips: ['44122', '44308'],
  },
  {
    id: 'south',
    name: 'South',
    selectorLabel: 'South · Example City',
    anchorCities: ['Example City'],
    center: [-82.5, 39.2],
    bounds: [-83, 39, -82, 40],
    zips: ['45202'],
  },
];

 describe('territory domain', () => {
  it('selects a territory or returns the statewide ZIP set', () => {
    expect(findTerritory(territories, 'north')?.name).toBe('North');
    expect(findTerritory(territories, ALL_TERRITORIES_ID)).toBeNull();
    expect(getTerritoryZips(territories, 'north', ['44122', '44308', '45202'])).toEqual([
      '44122',
      '44308',
    ]);
    expect(getTerritoryZips(territories, ALL_TERRITORIES_ID, ['44122', '44308', '45202'])).toEqual([
      '44122',
      '44308',
      '45202',
    ]);
  });

  it('builds market-specific all-territories IDs', () => {
    expect(allTerritoriesId('ohio')).toBe('all-ohio');
    expect(allTerritoriesId('charlotte')).toBe('all-charlotte');
    expect(ALL_TERRITORIES_ID).toBe('all-ohio');
  });

  it('recognizes any all-territories ID', () => {
    expect(isAllTerritoriesId('all-ohio')).toBe(true);
    expect(isAllTerritoriesId('all-charlotte')).toBe(true);
    expect(isAllTerritoriesId('north')).toBe(false);
    expect(isAllTerritoriesId('cleveland-akron')).toBe(false);
  });

  it('returns null for any all-territories ID in findTerritory', () => {
    expect(findTerritory(territories, 'all-ohio')).toBeNull();
    expect(findTerritory(territories, 'all-charlotte')).toBeNull();
  });

  it('returns all ZIPs for any all-territories ID in getTerritoryZips', () => {
    const allZips = ['44122', '44308', '45202'];
    expect(getTerritoryZips(territories, 'all-charlotte', allZips)).toEqual(allZips);
  });

  it('requires territories to cover every ZIP exactly once', () => {
    expect(() => assertTerritoryDefinitions(territories, ['44122', '44308', '45202'])).not.toThrow();
    expect(() => assertTerritoryDefinitions(territories, ['44122', '44308', '45202', '43004'])).toThrow(
      'Territories must cover every market ZIP exactly once',
    );
  });
});
