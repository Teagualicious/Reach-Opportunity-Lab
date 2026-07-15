import { describe, expect, it } from 'vitest';
import { assertMarketOverlayData } from './mapOverlay';

const marketZips = ['44122', '44124', '44145'];

const validOverlayPayload = {
  reachGapZips: ['44122'],
  competitors: [
    {
      id: 'example-provider',
      label: 'Example Provider',
      subtitle: 'Synthetic demonstration footprint',
      color: '#7c3aed',
      zips: ['44122', '44124'],
    },
  ],
};

describe('map overlay validation', () => {
  it('accepts a typed overlay payload for market ZIPs', () => {
    expect(() => assertMarketOverlayData(validOverlayPayload, marketZips)).not.toThrow();
  });

  it('rejects overlays that reference ZIPs outside the market', () => {
    const payload = {
      ...validOverlayPayload,
      reachGapZips: ['99999'],
    };

    expect(() => assertMarketOverlayData(payload, marketZips)).toThrow(
      'reachGapZips references ZIP 99999',
    );
  });

  it('rejects duplicate competitor identifiers', () => {
    const payload = {
      ...validOverlayPayload,
      competitors: [validOverlayPayload.competitors[0], validOverlayPayload.competitors[0]],
    };

    expect(() => assertMarketOverlayData(payload, marketZips)).toThrow(
      'Duplicate competitor overlay id',
    );
  });
});
