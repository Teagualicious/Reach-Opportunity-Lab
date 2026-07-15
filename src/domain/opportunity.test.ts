import { describe, expect, it } from 'vitest';
import { assertZipOpportunity, getPriorityBand, totalOpportunityPoints, type ZipOpportunity } from './opportunity';
const validOpportunity: ZipOpportunity = { zip:'44122', name:'Beachwood', score:84, confidence:'High', components:{ audiencePotential:22, reachGap:18, searchOpportunity:12, geographicPotential:13, categoryPotential:11, competitiveConditions:8 }, householdCount:15800, medianIncome:112400, categoryStrength:'Automotive', topDriver:'audiencePotential', topLimiter:'competitiveConditions', summary:'Strong audience fit and a meaningful reach gap.' };
describe('opportunity domain', () => {
  it('classifies score bands consistently', () => { expect(getPriorityBand(90)).toBe('Priority'); expect(getPriorityBand(75)).toBe('High'); expect(getPriorityBand(60)).toBe('Qualified'); expect(getPriorityBand(40)).toBe('Emerging'); });
  it('sums score components', () => { expect(totalOpportunityPoints(validOpportunity.components)).toBe(84); });
  it('accepts a valid opportunity record', () => { expect(() => assertZipOpportunity(validOpportunity)).not.toThrow(); });
  it('rejects mismatched totals', () => { expect(() => assertZipOpportunity({ ...validOpportunity, score:85 })).toThrow('Component total does not equal score'); });
});
