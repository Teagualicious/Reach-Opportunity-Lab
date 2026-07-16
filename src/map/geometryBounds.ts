import type { Geometry } from 'geojson';
import type { GeographicBounds } from '../domain/territory';

function visitCoordinates(value: unknown, visit: (longitude: number, latitude: number) => void): void {
  if (!Array.isArray(value)) return;

  if (
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  ) {
    visit(value[0], value[1]);
    return;
  }

  for (const child of value) visitCoordinates(child, visit);
}

export function getGeometryBounds(geometry: Geometry): GeographicBounds | null {
  if (geometry.type === 'GeometryCollection') {
    const childBounds = geometry.geometries
      .map(getGeometryBounds)
      .filter((bounds): bounds is GeographicBounds => bounds !== null);
    const [firstBounds, ...remainingBounds] = childBounds;

    if (!firstBounds) return null;

    return remainingBounds.reduce<GeographicBounds>(
      (combined, bounds) => [
        Math.min(combined[0], bounds[0]),
        Math.min(combined[1], bounds[1]),
        Math.max(combined[2], bounds[2]),
        Math.max(combined[3], bounds[3]),
      ],
      firstBounds,
    );
  }

  if (!('coordinates' in geometry)) return null;

  let west = Number.POSITIVE_INFINITY;
  let south = Number.POSITIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;

  visitCoordinates(geometry.coordinates, (longitude, latitude) => {
    west = Math.min(west, longitude);
    south = Math.min(south, latitude);
    east = Math.max(east, longitude);
    north = Math.max(north, latitude);
  });

  if (![west, south, east, north].every(Number.isFinite)) return null;
  return [west, south, east, north];
}
