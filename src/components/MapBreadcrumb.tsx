import { ALL_TERRITORIES_ID } from '../domain/territory';

interface MapBreadcrumbProps {
  regionName: string | null;
  onSelectTerritory: (territoryId: string) => void;
}

/**
 * Ohio → region breadcrumb floating over the map. Clicking Ohio returns to
 * the statewide region view.
 */
export function MapBreadcrumb({ regionName, onSelectTerritory }: MapBreadcrumbProps) {
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
          <strong>{regionName}</strong>
        </>
      )}
    </nav>
  );
}
