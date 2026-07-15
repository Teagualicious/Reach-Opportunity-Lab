import { describe, expect, it } from 'vitest';
import { LAKEFRONT_BASELINE, simulateClientScenario } from './clientScenario';
describe('client simulation', () => {
  it('returns baseline with no strategies', () => { expect(simulateClientScenario([]).metrics).toEqual(LAKEFRONT_BASELINE); });
  it('applies controlled combined effects', () => { const r=simulateClientScenario(['search-support','streaming-reach']); expect(r.metrics.effectiveness).toBe(84); expect(r.metrics.qualifiedReach).toBe(212000); expect(r.metrics.effectiveFrequency).toBe(3.5); expect(r.metrics.modeledLeads).toBe(1080); expect(r.metrics.costPerLead).toBe(70.29); expect(r.leadRange).toEqual({minimum:1055,maximum:1105}); });
  it('is deterministic', () => { const s=['search-support','streaming-reach'] as const; expect(simulateClientScenario(s)).toEqual(simulateClientScenario(s)); });
});
