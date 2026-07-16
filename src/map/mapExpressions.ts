import type { ExpressionSpecification } from 'maplibre-gl';

export const OPPORTUNITY_COLOR_STOPS = [
  [35, '#dcecf7'],
  [50, '#b9deda'],
  [65, '#cfe7b2'],
  [75, '#f4e6a2'],
  [85, '#f5c08a'],
  [95, '#ee9a87'],
  [100, '#dc6f78'],
] as const;

export const opportunityLegendGradient =
  'linear-gradient(90deg, #dcecf7 0%, #b9deda 18%, #cfe7b2 38%, #f4e6a2 58%, #f5c08a 76%, #ee9a87 91%, #dc6f78 100%)';

/**
 * Soft categorical colors for the region-first statewide view. Opportunity
 * averages cluster tightly statewide, so distinct hues keep the seven
 * regions readable instead of projecting them onto the heat ramp.
 */
export const REGION_PALETTE = [
  '#a8cdea',
  '#9adbd3',
  '#b5dea9',
  '#ead9a0',
  '#d9c3e6',
  '#f2bfa4',
  '#c4d3df',
] as const;

export function regionColorForIndex(index: number): string {
  return REGION_PALETTE[index % REGION_PALETTE.length];
}

/** Solid region coloring: every ZIP in a territory shares one fill. */
export function regionFillColorExpression(
  regionColors: ReadonlyMap<string, string>,
): ExpressionSpecification {
  const branches: unknown[] = ['match', ['get', 'territoryId']];
  for (const [territoryId, color] of regionColors) {
    branches.push(territoryId, color);
  }
  branches.push('#e4e7ea');
  return branches as unknown as ExpressionSpecification;
}

// Feature-state display scores let objective/simulation recolors update per feature
// without re-uploading the statewide GeoJSON source; null falls through to the base score.
export const effectiveScoreExpression: ExpressionSpecification = [
  'coalesce',
  ['feature-state', 'displayScore'],
  ['get', 'score'],
];

export const opportunityColorExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'territoryDim'], false],
  '#e4e7ea',
  [
    'interpolate',
    ['linear'],
    effectiveScoreExpression,
    ...OPPORTUNITY_COLOR_STOPS.flatMap(([score, color]) => [score, color]),
  ],
];

export const zipFillOpacityExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'dim'], false],
  0.12,
  ['boolean', ['feature-state', 'territoryDim'], false],
  0.3,
  ['boolean', ['feature-state', 'recommended'], false],
  0.96,
  ['boolean', ['feature-state', 'campaign'], false],
  0.92,
  0.78,
];

// When any supporting evidence layer is enabled, the base opportunity surface
// remains visible but recedes so reach gaps and competitor footprints read first.
export const zipFillOpacityEvidenceExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'dim'], false],
  0.05,
  ['boolean', ['feature-state', 'territoryDim'], false],
  0.14,
  ['boolean', ['feature-state', 'selected'], false],
  0.66,
  ['boolean', ['feature-state', 'recommended'], false],
  0.62,
  ['boolean', ['feature-state', 'campaign'], false],
  0.58,
  0.34,
];

export const zipLineColorExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  '#f4ad12',
  ['boolean', ['feature-state', 'recommended'], false],
  '#16a34a',
  ['boolean', ['feature-state', 'campaign'], false],
  '#00a8d4',
  ['boolean', ['feature-state', 'hover'], false],
  '#071524',
  ['boolean', ['feature-state', 'territoryDim'], false],
  'rgba(100,116,139,0.18)',
  'rgba(255,255,255,0.96)',
];

export const zipLineWidthExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  4,
  ['boolean', ['feature-state', 'recommended'], false],
  3.5,
  ['boolean', ['feature-state', 'campaign'], false],
  3.1,
  ['boolean', ['feature-state', 'hover'], false],
  2.1,
  ['boolean', ['feature-state', 'territoryDim'], false],
  0.32,
  1.15,
];
