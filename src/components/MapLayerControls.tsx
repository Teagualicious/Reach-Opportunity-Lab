import { useState, type CSSProperties } from 'react';
import type { MarketOverlayData } from '../domain/mapOverlay';

interface MapLayerControlsProps {
  overlays: MarketOverlayData;
  showReachGap: boolean;
  visibleCompetitorIds: readonly string[];
  onShowReachGapChange: (visible: boolean) => void;
  onCompetitorVisibilityChange: (competitorId: string, visible: boolean) => void;
}

/**
 * Progressive disclosure: the evidence-layer toggles stay tucked away until
 * someone wants them, keeping the default rail simple.
 */
export function MapLayerControls({
  overlays,
  showReachGap,
  visibleCompetitorIds,
  onShowReachGapChange,
  onCompetitorVisibilityChange,
}: MapLayerControlsProps) {
  const [open, setOpen] = useState(false);
  const activeCount = (showReachGap ? 1 : 0) + visibleCompetitorIds.length;

  return (
    <section className="panel-section layer-controls">
      <button
        className="filter-zones__summary"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>Show on map</span>
        <strong>{activeCount > 0 ? `${activeCount} on` : 'Off'}</strong>
        <i aria-hidden="true">{open ? '−' : '+'}</i>
      </button>

      {open && (
        <div className="layer-controls__body">
          <label
            className="layer-toggle"
            style={{ '--layer-color': '#d946ef' } as CSSProperties}
          >
            <input
              type="checkbox"
              checked={showReachGap}
              onChange={(event) => onShowReachGapChange(event.target.checked)}
            />
            <span className="layer-swatch layer-swatch--reach-gap" aria-hidden="true" />
            <span>
              <strong>Reach gaps</strong>
              <small>Places our ads under-reach today</small>
            </span>
          </label>

          <div className="layer-controls__divider" />

          {overlays.competitors.map((competitor) => {
            const visible = visibleCompetitorIds.includes(competitor.id);
            return (
              <label
                className="layer-toggle"
                key={competitor.id}
                style={{ '--layer-color': competitor.color } as CSSProperties}
              >
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(event) =>
                    onCompetitorVisibilityChange(competitor.id, event.target.checked)
                  }
                />
                <span
                  className={`layer-swatch ${competitor.wide ? 'is-wide' : ''}`}
                  aria-hidden="true"
                />
                <span>
                  <strong>{competitor.label}</strong>
                  <small>{competitor.subtitle}</small>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
