import type { ExpressionSpecification } from 'maplibre-gl';

export const OPPORTUNITY_COLOR_STOPS = [
  [35, '#dbeafe'],
  [50, '#60a5fa'],
  [65, '#22d3ee'],
  [75, '#fde047'],
  [85, '#fb923c'],
  [95, '#ef4444'],
  [100, '#991b1b'],
] as const;

export const opportunityLegendGradient =
  'linear-gradient(90deg, #dbeafe 0%, #60a5fa 22%, #22d3ee 42%, #fde047 61%, #fb923c 76%, #ef4444 90%, #991b1b 100%)';

export const opportunityColorExpression: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['get', 'score'],
  ...OPPORTUNITY_COLOR_STOPS.flatMap(([score, color]) => [score, color]),
];

export const zipFillOpacityExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'dim'], false],
  0.14,
  ['boolean', ['feature-state', 'campaign'], false],
  0.82,
  0.68,
];

export const zipLineColorExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  '#f5b51b',
  ['boolean', ['feature-state', 'campaign'], false],
  '#16e0ff',
  ['boolean', ['feature-state', 'hover'], false],
  '#071524',
  'rgba(255,255,255,0.78)',
];

export const zipLineWidthExpression: ExpressionSpecification = [
  'case',
  ['boolean', ['feature-state', 'selected'], false],
  3.2,
  ['boolean', ['feature-state', 'campaign'], false],
  2.3,
  ['boolean', ['feature-state', 'hover'], false],
  1.8,
  0.85,
];
