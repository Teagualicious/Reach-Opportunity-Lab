import type { CSSProperties } from 'react';
import type { MarketOverlayData } from '../domain/mapOverlay';

interface MapLayerControlsProps {
  overlays: MarketOverlayData;
  showReachGap: boolean;
  visibleCompetitorIds: readonly string[];
  onShowReachGapChange: (visible: boolean) => void;
  onCompetitorVisibilityChange: (competitorId: string, visible: boolean) => void;
}

export function MapLayerControls({
  overlays,
  showReachGap,
  visibleCompetitorIds,
  onShowReachGapChange,
  onCompetitorVisibilityChange,
}: MapLayerControlsProps) {
  return (
    <section className="panel-section layer-controls">
      <div className="section-heading">
        <span>Supporting layers</span>
        <small>Synthetic overlays</small>
      </div>

      <label className="layer-toggle">
        <input
          type="checkbox"
          checked={showReachGap}
          onChange={(event) => onShowReachGapChange(event.target.checked)}
        />
        <span className="layer-swatch layer-swatch--reach-gap" aria-hidden="true" />
        <span>
          <strong>Reach gaps</strong>
          <small>Underexposed high-fit ZIP clusters</small>
        </span>
      </label>

      <div className="layer-controls__divider" />

      {overlays.competitors.map((competitor) => {
        const visible = visibleCompetitorIds.includes(competitor.id);
        return (
          <label className="layer-toggle" key={competitor.id}>
            <input
              type="checkbox"
              checked={visible}
              onChange={(event) =>
                onCompetitorVisibilityChange(competitor.id, event.target.checked)
              }
            />
            <span
              className={`layer-swatch ${competitor.wide ? 'is-wide' : ''}`}
              style={{ '--layer-color': competitor.color } as CSSProperties}
              aria-hidden="true"
            />
            <span>
              <strong>{competitor.label}</strong>
              <small>{competitor.subtitle}</small>
            </span>
          </label>
        );
      })}
    </section>
  );
}
