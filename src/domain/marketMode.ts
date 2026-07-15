import type { ZipOpportunity } from './opportunity';

export type MarketModeId = 'new-business' | 'account-growth' | 'retention-risk' | 'category-opportunity';

export interface MarketModeDefinition {
  id: MarketModeId;
  label: string;
  question: string;
  scoreLabel: string;
  action: string;
}

export const MARKET_MODES: readonly MarketModeDefinition[] = [
  {
    id: 'new-business',
    label: 'New Business',
    question: 'Where should sellers prioritize prospecting?',
    scoreLabel: 'New business opportunity',
    action: 'Build a category prospecting list',
  },
  {
    id: 'account-growth',
    label: 'Account Growth',
    question: 'Which geographies support account expansion?',
    scoreLabel: 'Growth opportunity',
    action: 'Prepare an expansion conversation',
  },
  {
    id: 'retention-risk',
    label: 'Retention Risk',
    question: 'Where are save strategies most urgent?',
    scoreLabel: 'Retention risk',
    action: 'Compare account save strategies',
  },
  {
    id: 'category-opportunity',
    label: 'Category Opportunity',
    question: 'Which ZIPs are strongest for the selected vertical?',
    scoreLabel: 'Category opportunity',
    action: 'Create a vertical market brief',
  },
] as const;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getMarketModeScore(opportunity: ZipOpportunity, mode: MarketModeId): number {
  const { components } = opportunity;
  switch (mode) {
    case 'new-business':
      return opportunity.score;
    case 'account-growth':
      return clampScore(
        components.audiencePotential * 1.7 +
          components.searchOpportunity * 1.35 +
          components.geographicPotential * 1.4 +
          components.categoryPotential,
      );
    case 'retention-risk':
      return clampScore(
        (20 - components.reachGap) * 1.7 +
          (10 - components.competitiveConditions) * 3.1 +
          (15 - components.searchOpportunity) * 1.7 +
          20,
      );
    case 'category-opportunity':
      return clampScore(
        components.categoryPotential * 3.1 +
          components.audiencePotential * 1.45 +
          components.searchOpportunity * 1.1,
      );
  }
}
