import type { CompetitorFootprint } from './mapOverlay';
import type { ZipOpportunity } from './opportunity';
import type { ClientStrategyId } from './clientScenario';

export interface ClientGeographyCandidate {
  zip: string;
  name: string;
  opportunityScore: number;
  recommendationScore: number;
  reachGap: boolean;
  competitorIds: string[];
  reason: string;
}

export interface ClientGeographyPlan {
  currentZips: string[];
  reachGapZips: string[];
  competitorPressureZips: string[];
  recommendedZips: string[];
  candidates: ClientGeographyCandidate[];
  summary: {
    currentCount: number;
    reachGapCount: number;
    competitorPressureCount: number;
    recommendedCount: number;
  };
}

interface ClientGeographyPlanInput {
  opportunities: readonly ZipOpportunity[];
  currentZips: readonly string[];
  competitors: readonly CompetitorFootprint[];
  selectedStrategyIds: readonly ClientStrategyId[];
}

function competitorIdsForZip(competitors: readonly CompetitorFootprint[], zip: string): string[] {
  return competitors
    .filter((competitor) => competitor.zips.includes(zip))
    .map((competitor) => competitor.id)
    .sort();
}

function recommendationReason(
  opportunity: ZipOpportunity,
  reachGap: boolean,
  competitorCount: number,
  selectedStrategyIds: readonly ClientStrategyId[],
): string {
  const reasons: string[] = [];
  if (reachGap) reasons.push('underexposed audience potential');
  if (selectedStrategyIds.includes('geography-expansion')) reasons.push('strong adjacent-market fit');
  if (selectedStrategyIds.includes('search-support') && opportunity.components.searchOpportunity >= 10) {
    reasons.push('high search intent');
  }
  if (selectedStrategyIds.includes('high-value-services') && opportunity.components.categoryPotential >= 10) {
    reasons.push('strong high-value category fit');
  }
  if (competitorCount === 0) reasons.push('lighter modeled competitor pressure');
  if (reasons.length === 0) reasons.push('balanced audience and category opportunity');
  return reasons.slice(0, 2).join(' with ');
}

export function buildClientGeographyPlan({
  opportunities,
  currentZips,
  competitors,
  selectedStrategyIds,
}: ClientGeographyPlanInput): ClientGeographyPlan {
  const currentSet = new Set(currentZips);
  const streamingSelected = selectedStrategyIds.includes('streaming-reach');
  const geographySelected = selectedStrategyIds.includes('geography-expansion');
  const searchSelected = selectedStrategyIds.includes('search-support');
  const valueSelected = selectedStrategyIds.includes('high-value-services');

  const reachGapZips = opportunities
    .filter((opportunity) => opportunity.components.reachGap >= 14)
    .map((opportunity) => opportunity.zip)
    .sort();
  const reachGapSet = new Set(reachGapZips);

  const competitorPressureZips = opportunities
    .filter((opportunity) => competitorIdsForZip(competitors, opportunity.zip).length > 0)
    .map((opportunity) => opportunity.zip)
    .sort();

  const candidates = opportunities
    .filter((opportunity) => !currentSet.has(opportunity.zip))
    .map<ClientGeographyCandidate>((opportunity) => {
      const competitorIds = competitorIdsForZip(competitors, opportunity.zip);
      const reachGap = reachGapSet.has(opportunity.zip);
      const recommendationScore = Math.round(
        opportunity.score +
          (reachGap ? (streamingSelected ? 14 : 7) : 0) +
          (geographySelected ? 10 : 0) +
          (searchSelected ? opportunity.components.searchOpportunity * 0.55 : 0) +
          (valueSelected ? opportunity.components.categoryPotential * 0.45 : 0) -
          competitorIds.length * 3,
      );
      return {
        zip: opportunity.zip,
        name: opportunity.name,
        opportunityScore: opportunity.score,
        recommendationScore,
        reachGap,
        competitorIds,
        reason: recommendationReason(
          opportunity,
          reachGap,
          competitorIds.length,
          selectedStrategyIds,
        ),
      };
    })
    .sort(
      (left, right) =>
        right.recommendationScore - left.recommendationScore || left.zip.localeCompare(right.zip),
    );

  const recommendationCount = Math.min(
    5,
    2 + (geographySelected ? 2 : 0) + (streamingSelected ? 1 : 0),
  );
  const recommendedCandidates = candidates.slice(0, recommendationCount);

  return {
    currentZips: [...currentZips],
    reachGapZips,
    competitorPressureZips,
    recommendedZips: recommendedCandidates.map((candidate) => candidate.zip),
    candidates: recommendedCandidates,
    summary: {
      currentCount: currentZips.length,
      reachGapCount: reachGapZips.length,
      competitorPressureCount: competitorPressureZips.length,
      recommendedCount: recommendedCandidates.length,
    },
  };
}
