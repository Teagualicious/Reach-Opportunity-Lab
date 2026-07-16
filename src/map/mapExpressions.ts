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

export const opportunityColorExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'territoryDim'], false],
  '#e4e7ea',
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
  0.3,
  ['boolean', ['feature-state', 'campaign'], false],
  0.86,
  0.78,
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
  'rgba(100,116,139,0.18)',
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
  0.32,
  1.15,
];
