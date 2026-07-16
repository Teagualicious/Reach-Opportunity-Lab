import type { ClientAdvertiserProfile } from './clientScenario';
import type { ZipOpportunity } from './opportunity';

function stableProfileNoise(profileId: string, zip: string): number {
  let hash = 2166136261;
  const value = `${profileId}:${zip}`;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 13) - 6;
}

function campaignFitScore(opportunity: ZipOpportunity, profile: ClientAdvertiserProfile): number {
  const componentFit = Object.entries(profile.fitWeights).reduce((total, [component, weight]) => {
    const componentValue = opportunity.components[component as keyof typeof opportunity.components];
    return total + componentValue * (weight ?? 0);
  }, 0);

  return opportunity.score + componentFit + stableProfileNoise(profile.id, opportunity.zip);
}

export function selectClientCampaignZips(
  opportunities: readonly ZipOpportunity[],
  profile: ClientAdvertiserProfile,
  territoryId: string | null,
): string[] {
  if (territoryId === profile.defaultTerritoryId && profile.canonicalCampaignZips) {
    const availableZips = new Set(opportunities.map((opportunity) => opportunity.zip));
    const canonicalZips = profile.canonicalCampaignZips.filter((zip) => availableZips.has(zip));
    if (canonicalZips.length > 0) return [...canonicalZips];
  }

  return [...opportunities]
    .sort(
      (left, right) =>
        campaignFitScore(right, profile) - campaignFitScore(left, profile) ||
        left.zip.localeCompare(right.zip),
    )
    .slice(0, Math.min(profile.campaignZipCount, opportunities.length))
    .map((opportunity) => opportunity.zip);
}
