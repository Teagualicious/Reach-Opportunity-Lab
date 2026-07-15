import { describe, expect, it } from 'vitest';
import type { ZipOpportunity } from './opportunity';
import { getMarketModeScore } from './marketMode';
const opportunity: ZipOpportunity = { zip:'44122', name:'Beachwood', score:84, confidence:'High', components:{ audiencePotential:22, reachGap:18, searchOpportunity:12, geographicPotential:13, categoryPotential:11, competitiveConditions:8 }, householdCount:15800, medianIncome:112400, categoryStrength:'Automotive', topDriver:'audiencePotential', topLimiter:'competitiveConditions', summary:'Strong audience fit and a meaningful reach gap.' };
describe('market mode scoring', () => {
  it('uses the base score for new business', () => { expect(getMarketModeScore(opportunity,'new-business')).toBe(84); });
  it('produces deterministic bounded scores', () => { for (const mode of ['account-growth','retention-risk','category-opportunity'] as const) { const score=getMarketModeScore(opportunity,mode); expect(score).toBeGreaterThanOrEqual(0); expect(score).toBeLessThanOrEqual(100); expect(score).toBe(getMarketModeScore(opportunity,mode)); } });
});
