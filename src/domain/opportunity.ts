export type ConfidenceLevel = 'Low' | 'Moderate' | 'High';
export type PriorityBand = 'Emerging' | 'Qualified' | 'High' | 'Priority';
export type OpportunityDetailLevel = 'curated-demo' | 'statewide-baseline';

export interface OpportunityComponents {
  audiencePotential: number;
  reachGap: number;
  searchOpportunity: number;
  geographicPotential: number;
  categoryPotential: number;
  competitiveConditions: number;
}

export interface ZipOpportunity {
  zip: string;
  name: string;
  territoryId?: string;
  detailLevel?: OpportunityDetailLevel;
  centroid?: [longitude: number, latitude: number];
  score: number;
  confidence: ConfidenceLevel;
  components: OpportunityComponents;
  householdCount: number;
  medianIncome: number;
  categoryStrength: string;
  topDriver: keyof OpportunityComponents;
  topLimiter: keyof OpportunityComponents;
  summary: string;
}

export const COMPONENT_MAXIMUMS: Readonly<OpportunityComponents> = {
  audiencePotential: 25,
  reachGap: 20,
  searchOpportunity: 15,
  geographicPotential: 15,
  categoryPotential: 15,
  competitiveConditions: 10,
};

export const COMPONENT_LABELS: Readonly<Record<keyof OpportunityComponents, string>> = {
  audiencePotential: 'Audience potential',
  reachGap: 'Reach gap',
  searchOpportunity: 'Search opportunity',
  geographicPotential: 'Geographic potential',
  categoryPotential: 'Category potential',
  competitiveConditions: 'Competitive conditions',
};

export function getPriorityBand(score: number): PriorityBand {
  if (score >= 85) return 'Priority';
  if (score >= 70) return 'High';
  if (score >= 55) return 'Qualified';
  return 'Emerging';
}

export function totalOpportunityPoints(components: OpportunityComponents): number {
  return Object.values(components).reduce((total, value) => total + value, 0);
}

export function assertZipOpportunity(value: ZipOpportunity): void {
  if (!/^\d{5}$/.test(value.zip)) {
    throw new Error(`Invalid ZIP identifier: ${value.zip}`);
  }

  if (value.territoryId !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.territoryId)) {
    throw new Error(`Invalid territory identifier for ZIP ${value.zip}`);
  }

  if (
    value.detailLevel !== undefined &&
    value.detailLevel !== 'curated-demo' &&
    value.detailLevel !== 'statewide-baseline'
  ) {
    throw new Error(`Invalid opportunity detail level for ZIP ${value.zip}`);
  }

  if (
    value.centroid !== undefined &&
    (!Array.isArray(value.centroid) ||
      value.centroid.length !== 2 ||
      !value.centroid.every(Number.isFinite))
  ) {
    throw new Error(`Invalid centroid for ZIP ${value.zip}`);
  }

  if (!Number.isFinite(value.score) || value.score < 0 || value.score > 100) {
    throw new Error(`Opportunity score must be between 0 and 100 for ZIP ${value.zip}`);
  }

  for (const [component, maximum] of Object.entries(COMPONENT_MAXIMUMS) as Array<
    [keyof OpportunityComponents, number]
  >) {
    const score = value.components[component];
    if (!Number.isFinite(score) || score < 0 || score > maximum) {
      throw new Error(`${component} is outside its allowed range for ZIP ${value.zip}`);
    }
  }

  if (totalOpportunityPoints(value.components) !== value.score) {
    throw new Error(`Component total does not equal score for ZIP ${value.zip}`);
  }
}
