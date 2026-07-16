import { describe, expect, it } from 'vitest';
import type { ZipOpportunity } from './opportunity';
import {
  DEMOGRAPHIC_METRICS,
  formatDemographicValue,
  getZipDemographics,
  zipNoise,
} from './zipDemographics';

function makeOpportunity(zip: string, medianIncome: number): ZipOpportunity {
  return {
    zip,
    name: `ZIP ${zip}`,
    score: 72,
    confidence: 'Moderate',
    components: {
      audiencePotential: 20,
      reachGap: 14,
      searchOpportunity: 10,
      geographicPotential: 11,
      categoryPotential: 10,
      competitiveConditions: 7,
    },
    householdCount: 10500,
    medianIncome,
    categoryStrength: 'Automotive',
    topDriver: 'audiencePotential',
    topLimiter: 'searchOpportunity',
    summary: 'Synthetic record.',
  };
}

describe('zip demographics', () => {
  it('is deterministic for the same ZIP', () => {
    const opportunity = makeOpportunity('44122', 92500);
    expect(getZipDemographics(opportunity)).toEqual(getZipDemographics(opportunity));
  });

  it('differs across ZIPs and salts', () => {
    expect(zipNoise('44122', 1)).not.toBe(zipNoise('44122', 2));
    expect(zipNoise('44122', 1)).not.toBe(zipNoise('43001', 1));
    const first = getZipDemographics(makeOpportunity('44122', 92500));
    const second = getZipDemographics(makeOpportunity('43001', 92500));
    expect(first).not.toEqual(second);
  });

  it('keeps every metric inside its plausible range', () => {
    for (const zip of ['43001', '44122', '45999', '43604', '44805']) {
      const demographics = getZipDemographics(makeOpportunity(zip, 41000 + zipNoise(zip, 0) * 80000));
      expect(demographics.medianHomeValue).toBeGreaterThanOrEqual(60000);
      expect(demographics.medianHomeValue).toBeLessThanOrEqual(400000);
      expect(demographics.medianAge).toBeGreaterThanOrEqual(29);
      expect(demographics.medianAge).toBeLessThanOrEqual(59);
      expect(demographics.collegeGradRate).toBeGreaterThanOrEqual(8);
      expect(demographics.collegeGradRate).toBeLessThanOrEqual(60);
      expect(demographics.homeownerRate).toBeGreaterThanOrEqual(25);
      expect(demographics.homeownerRate).toBeLessThanOrEqual(82);
      expect(demographics.income50kPlusRate).toBeGreaterThanOrEqual(30);
      expect(demographics.income50kPlusRate).toBeLessThanOrEqual(88);
      expect(demographics.householdsWithChildrenRate).toBeGreaterThanOrEqual(12);
      expect(demographics.householdsWithChildrenRate).toBeLessThanOrEqual(46);
      expect(demographics.blackPopulationRate).toBeGreaterThanOrEqual(0);
      expect(demographics.blackPopulationRate).toBeLessThanOrEqual(47);
      expect(demographics.hispanicPopulationIndex).toBeGreaterThanOrEqual(30);
      expect(demographics.hispanicPopulationIndex).toBeLessThanOrEqual(290);
      expect(demographics.medianBuildYear).toBeGreaterThanOrEqual(1948);
      expect(demographics.medianBuildYear).toBeLessThanOrEqual(2010);
    }
  });

  it('mirrors the opportunity median income', () => {
    expect(getZipDemographics(makeOpportunity('44122', 92500)).medianIncome).toBe(92500);
  });

  it('formats every metric kind', () => {
    expect(formatDemographicValue('currency', 188547)).toBe('$188,547');
    expect(formatDemographicValue('percent', 30.6)).toBe('30.6%');
    expect(formatDemographicValue('years', 55)).toBe('55.0');
    expect(formatDemographicValue('index', 55.4)).toBe('55');
    expect(formatDemographicValue('year', 1962)).toBe('1962');
    expect(DEMOGRAPHIC_METRICS).toHaveLength(10);
  });
});
