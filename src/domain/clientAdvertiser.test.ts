import { describe, expect, it } from 'vitest';
import { selectClientCampaignZips } from './clientAdvertiser';
import {
  CLIENT_ADVERTISER_PROFILES,
  LAKEFRONT_CAMPAIGN_TERRITORY_ID,
  LAKEFRONT_CAMPAIGN_ZIPS,
} from './clientScenario';
import type { OpportunityComponents, ZipOpportunity } from './opportunity';

function opportunity(zip: string, score: number, components: OpportunityComponents): ZipOpportunity {
  return {
    zip,
    name: `ZIP ${zip}`,
    score,
    confidence: 'Moderate',
    components,
    householdCount: 10000,
    medianIncome: 70000,
    categoryStrength: 'Demonstration category',
    topDriver: 'audiencePotential',
    topLimiter: 'competitiveConditions',
    summary: 'Deterministic test opportunity.',
  };
}

const componentSets: OpportunityComponents[] = [
  { audiencePotential: 24, reachGap: 4, searchOpportunity: 3, geographicPotential: 14, categoryPotential: 8, competitiveConditions: 7 },
  { audiencePotential: 13, reachGap: 17, searchOpportunity: 14, geographicPotential: 6, categoryPotential: 11, competitiveConditions: 4 },
  { audiencePotential: 20, reachGap: 10, searchOpportunity: 7, geographicPotential: 12, categoryPotential: 14, competitiveConditions: 8 },
  { audiencePotential: 16, reachGap: 15, searchOpportunity: 12, geographicPotential: 8, categoryPotential: 9, competitiveConditions: 6 },
];

describe('client advertiser campaign footprints', () => {
  it('preserves the reviewed Lakefront footprint in its canonical market', () => {
    const opportunities = LAKEFRONT_CAMPAIGN_ZIPS.map((zip, index) =>
      opportunity(zip, 60 + (index % 10), componentSets[index % componentSets.length]),
    );

    expect(
      selectClientCampaignZips(
        opportunities,
        CLIENT_ADVERTISER_PROFILES[0],
        LAKEFRONT_CAMPAIGN_TERRITORY_ID,
      ),
    ).toEqual([...LAKEFRONT_CAMPAIGN_ZIPS]);
  });

  it('creates deterministic, profile-distinct footprints outside canonical markets', () => {
    const opportunities = Array.from({ length: 20 }, (_, index) =>
      opportunity(
        String(43001 + index),
        56 + (index % 25),
        componentSets[index % componentSets.length],
      ),
    );
    const homeServices = selectClientCampaignZips(
      opportunities,
      CLIENT_ADVERTISER_PROFILES[1],
      'dayton-west',
    );
    const financialServices = selectClientCampaignZips(
      opportunities,
      CLIENT_ADVERTISER_PROFILES[2],
      'dayton-west',
    );

    expect(homeServices).toEqual(
      selectClientCampaignZips(opportunities, CLIENT_ADVERTISER_PROFILES[1], 'dayton-west'),
    );
    expect(homeServices).toHaveLength(CLIENT_ADVERTISER_PROFILES[1].campaignZipCount);
    expect(financialServices).toHaveLength(CLIENT_ADVERTISER_PROFILES[2].campaignZipCount);
    expect(homeServices).not.toEqual(financialServices);
  });
});
