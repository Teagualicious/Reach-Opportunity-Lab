export interface CompetitorFootprint {
  id: string;
  label: string;
  subtitle: string;
  color: string;
  wide?: boolean;
  zips: string[];
}

export interface MarketOverlayData {
  reachGapZips: string[];
  competitors: CompetitorFootprint[];
}

export const EMPTY_MARKET_OVERLAYS: MarketOverlayData = {
  reachGapZips: [],
  competitors: [],
};

const ZIP_PATTERN = /^\d{5}$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertZipList(
  value: unknown,
  field: string,
  validZips: ReadonlySet<string>,
  allowEmpty = false,
): asserts value is string[] {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new Error(`${field} must contain${allowEmpty ? '' : ' at least'} one ZIP`);
  }

  const seen = new Set<string>();
  for (const zip of value) {
    if (typeof zip !== 'string' || !ZIP_PATTERN.test(zip)) {
      throw new Error(`${field} contains an invalid ZIP identifier`);
    }
    if (!validZips.has(zip)) {
      throw new Error(`${field} references ZIP ${zip}, which is not part of the market`);
    }
    if (seen.has(zip)) {
      throw new Error(`${field} contains duplicate ZIP ${zip}`);
    }
    seen.add(zip);
  }
}

export function assertMarketOverlayData(
  value: unknown,
  validZipValues: readonly string[],
): asserts value is MarketOverlayData {
  if (!isRecord(value)) {
    throw new Error('Market overlay payload must be an object');
  }

  const validZips = new Set(validZipValues);
  assertZipList(value.reachGapZips, 'reachGapZips', validZips, true);

  if (!Array.isArray(value.competitors)) {
    throw new Error('competitors must be an array');
  }

  const competitorIds = new Set<string>();
  for (const [index, competitor] of value.competitors.entries()) {
    if (!isRecord(competitor)) {
      throw new Error(`competitors[${index}] must be an object`);
    }

    if (typeof competitor.id !== 'string' || !ID_PATTERN.test(competitor.id)) {
      throw new Error(`competitors[${index}].id must be a lowercase kebab-case identifier`);
    }
    if (competitorIds.has(competitor.id)) {
      throw new Error(`Duplicate competitor overlay id: ${competitor.id}`);
    }
    competitorIds.add(competitor.id);

    if (typeof competitor.label !== 'string' || competitor.label.trim().length === 0) {
      throw new Error(`competitors[${index}].label is required`);
    }
    if (typeof competitor.subtitle !== 'string' || competitor.subtitle.trim().length === 0) {
      throw new Error(`competitors[${index}].subtitle is required`);
    }
    if (typeof competitor.color !== 'string' || !COLOR_PATTERN.test(competitor.color)) {
      throw new Error(`competitors[${index}].color must be a six-digit hex color`);
    }
    if (competitor.wide !== undefined && typeof competitor.wide !== 'boolean') {
      throw new Error(`competitors[${index}].wide must be a boolean when provided`);
    }

    assertZipList(competitor.zips, `competitors[${index}].zips`, validZips);
  }
}
