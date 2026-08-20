import type { ZipOpportunity } from './opportunity';

export type MarketModeId = 'new-business' | 'account-growth' | 'retention-risk' | 'category-opportunity';

export interface MarketModeDefinition {
  id: MarketModeId;
  label: string;
  question: string;
  scoreLabel: string;
  action: string;
  secondary?: boolean;
}

export const MARKET_MODES: readonly MarketModeDefinition[] = [
  {
    id: 'account-growth',
    label: 'Account Whitespace',
    question: 'Which existing accounts have the clearest product, media, or geographic whitespace?',
    scoreLabel: 'Whitespace opportunity',
    action: 'Prepare a whitespace expansion conversation',
  },
  {
    id: 'retention-risk',
    label: 'Retention / KEEP',
    question: 'Which existing accounts need a proactive save conversation?',
    scoreLabel: 'Retention risk',
    action: 'Prepare an account save plan',
  },
  {
    id: 'category-opportunity',
    label: 'Category Expansion',
    question: 'Where can the current book expand around a strong category signal?',
    scoreLabel: 'Category expansion opportunity',
    action: 'Create an existing-account category brief',
  },
  {
    id: 'new-business',
    label: 'New Business Handoff',
    question: 'Which external opportunities should move to the approved prospecting workflow?',
    scoreLabel: 'Secondary new-business signal',
    action: 'Prepare a prospecting handoff',
    secondary: true,
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
