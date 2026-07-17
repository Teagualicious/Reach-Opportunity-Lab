import { ALL_TERRITORIES_ID } from '../domain/territory';

interface MapBreadcrumbProps {
  regionName: string | null;
  countyName?: string | null;
  onSelectTerritory: (territoryId: string) => void;
  onClearCounty?: () => void;
}

/**
 * Ohio › region › county breadcrumb floating over the map. Clicking Ohio
 * returns to the statewide regions; clicking the region returns to its
 * county view.
 */
export function MapBreadcrumb({
  regionName,
  countyName,
  onSelectTerritory,
  onClearCounty,
}: MapBreadcrumbProps) {
  return (
    <nav className="map-breadcrumb" aria-label="Map location">
      <button
        type="button"
        disabled={!regionName}
        onClick={() => onSelectTerritory(ALL_TERRITORIES_ID)}
      >
        Ohio
      </button>
      {regionName && (
        <>
          <span aria-hidden="true">›</span>
          {countyName && onClearCounty ? (
            <button type="button" onClick={onClearCounty}>{regionName}</button>
          ) : (
            <strong>{regionName}</strong>
          )}
        </>
      )}
      {regionName && countyName && (
        <>
          <span aria-hidden="true">›</span>
          <strong>{countyName}</strong>
        </>
      )}
    </nav>
  );
}
