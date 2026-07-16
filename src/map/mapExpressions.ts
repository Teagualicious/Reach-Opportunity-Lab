import type { ExpressionSpecification } from 'maplibre-gl';

export const OPPORTUNITY_COLOR_STOPS = [
  [35, '#e9f1f7'],
  [50, '#cfdfeb'],
  [65, '#a7c7dd'],
  [75, '#78a6c8'],
  [85, '#477fae'],
  [95, '#1e5689'],
  [100, '#082f57'],
] as const;

export const opportunityLegendGradient =
  'linear-gradient(90deg, #e9f1f7 0%, #cfdfeb 18%, #a7c7dd 38%, #78a6c8 58%, #477fae 76%, #1e5689 91%, #082f57 100%)';

export const opportunityColorExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'territoryDim'], false],
  '#d9dee4',
  [
    'interpolate',
    ['linear'],
    ['get', 'score'],
    ...OPPORTUNITY_COLOR_STOPS.flatMap(([score, color]) => [score, color]),
  ],
];

export const zipFillOpacityExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'dim'], false],
  0.12,
  ['boolean', ['feature-state', 'territoryDim'], false],
  0.48,
  ['boolean', ['feature-state', 'campaign'], false],
  0.86,
  0.76,
];

export const zipLineColorExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  '#f5b51b',
  ['boolean', ['feature-state', 'campaign'], false],
  '#11c5df',
  ['boolean', ['feature-state', 'hover'], false],
  '#071524',
  ['boolean', ['feature-state', 'territoryDim'], false],
  '#aab3bd',
  'rgba(255,255,255,0.96)',
];

export const zipLineWidthExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  3.2,
  ['boolean', ['feature-state', 'campaign'], false],
  2.4,
  ['boolean', ['feature-state', 'hover'], false],
  1.9,
  ['boolean', ['feature-state', 'territoryDim'], false],
  0.75,
  1.15,
];
