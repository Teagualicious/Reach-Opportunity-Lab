import type { TerritoryDefinition } from '../domain/territory';
import { ALL_TERRITORIES_ID } from '../domain/territory';

interface TerritorySelectorProps {
  territories: readonly TerritoryDefinition[];
  selectedTerritoryId: string;
  onChange: (territoryId: string) => void;
}

export function TerritorySelector({
  territories,
  selectedTerritoryId,
  onChange,
}: TerritorySelectorProps) {
  const selected =
    selectedTerritoryId === ALL_TERRITORIES_ID
      ? null
      : territories.find((territory) => territory.id === selectedTerritoryId) ?? null;

  return (
    <label className="territory-selector">
      <span className="territory-selector__icon" aria-hidden="true">◎</span>
      <span className="territory-selector__copy">
        <small>Operating territory</small>
        <select
          value={selectedTerritoryId}
          aria-label="Select Ohio operating territory"
          onChange={(event) => onChange(event.target.value)}
        >
          <option value={ALL_TERRITORIES_ID}>All Ohio · Statewide view</option>
          {territories.map((territory) => (
            <option value={territory.id} key={territory.id}>
              {territory.selectorLabel}
            </option>
          ))}
        </select>
        <em>{selected ? `${selected.zips.length} ZIP areas` : 'Every Ohio ZIP area'}</em>
      </span>
    </label>
  );
}
