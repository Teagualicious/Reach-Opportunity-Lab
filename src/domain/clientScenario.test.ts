import { describe, expect, it } from 'vitest';
import {
  CLIENT_ADVERTISER_PROFILES,
  LAKEFRONT_BASELINE,
  simulateClientScenario,
} from './clientScenario';

describe('client simulation', () => {
  it('returns the selected advertiser baseline with no strategies', () => {
    expect(simulateClientScenario([]).metrics).toEqual(LAKEFRONT_BASELINE);
    expect(simulateClientScenario([], CLIENT_ADVERTISER_PROFILES[1]).metrics).toEqual(
      CLIENT_ADVERTISER_PROFILES[1].baseline,
    );
  });

  it('preserves the reviewed Lakefront combined effects', () => {
    const result = simulateClientScenario(['search-support', 'streaming-reach']);
    expect(result.metrics.effectiveness).toBe(84);
    expect(result.metrics.qualifiedReach).toBe(212000);
    expect(result.metrics.effectiveFrequency).toBe(3.5);
    expect(result.metrics.modeledLeads).toBe(1080);
    expect(result.metrics.costPerLead).toBe(70.29);
    expect(result.leadRange).toEqual({ minimum: 1055, maximum: 1105 });
  });

  it('applies profile-specific strategy response without changing determinism', () => {
    const profile = CLIENT_ADVERTISER_PROFILES[1];
    const strategies = ['search-support', 'high-value-services'] as const;
    const result = simulateClientScenario(strategies, profile);

    expect(result.metrics).toEqual({
      effectiveness: 75,
      qualifiedReach: 147165,
      effectiveFrequency: 3.1,
      modeledLeads: 847,
      costPerLead: 75.56,
      priorityClusters: 3,
    });
    expect(result).toEqual(simulateClientScenario(strategies, profile));
  });
});
