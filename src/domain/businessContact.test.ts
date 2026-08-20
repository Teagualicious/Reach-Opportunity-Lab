import { describe, expect, it } from 'vitest';
import { buildDemoDecisionMaker } from './businessContact';

const input = {
  businessName: 'Lakeside European Auto',
  zip: '44122',
  category: 'Automotive',
  mode: 'account-growth' as const,
};

describe('synthetic decision-maker contacts', () => {
  it('is deterministic and uses reserved demo-only contact values', () => {
    const first = buildDemoDecisionMaker(input);
    const second = buildDemoDecisionMaker(input);

    expect(second).toEqual(first);
    expect(first.status).toBe('demo');
    expect(first.statusLabel).toBe('Synthetic demo');
    expect(first.professionalEmail).toMatch(/\.example$/);
    expect(first.phoneE164).toMatch(/^\+120255501\d{2}$/);
    expect(first.phoneDisplay).toMatch(/^\(202\) 555-01\d{2}$/);
    expect(first.doNotContact).toBe(false);
  });

  it('can choose a different role for a retention conversation', () => {
    const growth = buildDemoDecisionMaker(input);
    const retention = buildDemoDecisionMaker({ ...input, mode: 'retention-risk' });

    expect(retention.id).not.toBe(growth.id);
    expect(['Dealer Principal', 'General Manager']).toContain(retention.title);
  });
});
