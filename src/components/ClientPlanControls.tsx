export type ClientPlanView = 'current' | 'diagnostic' | 'recommended';

interface ClientPlanControlsProps {
  value: ClientPlanView;
  currentCount: number;
  reachGapCount: number;
  competitorCount: number;
  recommendedCount: number;
  recommendedDisabled: boolean;
  onChange: (value: ClientPlanView) => void;
}

const VIEW_COPY: Readonly<Record<ClientPlanView, { label: string; description: string }>> = {
  current: {
    label: 'Current plan',
    description: 'Show the active campaign footprint.',
  },
  diagnostic: {
    label: 'Diagnose gaps',
    description: 'Reveal reach gaps and modeled competitor pressure.',
  },
  recommended: {
    label: 'Recommended',
    description: 'Compare the current footprint with proposed expansion.',
  },
};

export function ClientPlanControls({
  value,
  currentCount,
  reachGapCount,
  competitorCount,
  recommendedCount,
  recommendedDisabled,
  onChange,
}: ClientPlanControlsProps) {
  return (
    <section className="client-plan-controls" aria-label="Campaign map view">
      <div className="section-heading">
        <span>Map story</span>
        <small>Current → diagnose → recommend</small>
      </div>
      <div className="client-plan-tabs" role="tablist" aria-label="Campaign plan view">
        {(Object.keys(VIEW_COPY) as ClientPlanView[]).map((candidate) => (
          <button
            key={candidate}
            className={value === candidate ? 'is-active' : ''}
            type="button"
            role="tab"
            aria-selected={value === candidate}
            disabled={candidate === 'recommended' && recommendedDisabled}
            onClick={() => onChange(candidate)}
          >
            <strong>{VIEW_COPY[candidate].label}</strong>
            <small>{VIEW_COPY[candidate].description}</small>
          </button>
        ))}
      </div>
      <div className="client-plan-legend">
        <span><i className="is-current" />Current <strong>{currentCount}</strong></span>
        <span><i className="is-gap" />Reach gaps <strong>{reachGapCount}</strong></span>
        <span><i className="is-pressure" />Pressure <strong>{competitorCount}</strong></span>
        <span><i className="is-recommended" />Expand <strong>{recommendedCount}</strong></span>
      </div>
    </section>
  );
}
