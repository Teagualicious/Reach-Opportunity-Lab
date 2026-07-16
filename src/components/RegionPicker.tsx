import type { RegionSummary } from '../domain/regionSummary';

interface RegionPickerProps {
  regions: readonly RegionSummary[];
  onSelectRegion: (territoryId: string) => void;
}

/**
 * Region-first entry list: shown in the left rail whenever the statewide
 * view is active. Choosing a region drills the whole workspace into it.
 */
export function RegionPicker({ regions, onSelectRegion }: RegionPickerProps) {
  const ranked = [...regions].sort(
    (left, right) => right.averageOpportunityScore - left.averageOpportunityScore,
  );

  return (
    <section className="region-picker">
      <p className="region-picker__intro">
        Start with a region. Click one on the map, or choose it here to see its ZIP areas.
      </p>
      <div className="region-picker__list">
        {ranked.map((region) => (
          <button
            key={region.territoryId}
            type="button"
            onClick={() => onSelectRegion(region.territoryId)}
          >
            <span className="region-picker__body">
              <strong>{region.name}</strong>
              <small>{region.anchorCities.join(' · ')}</small>
            </span>
            <span className="region-picker__score">
              <b>{region.averageOpportunityScore}</b>
              <i>opportunity</i>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
