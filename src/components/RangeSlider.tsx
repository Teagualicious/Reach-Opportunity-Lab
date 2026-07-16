import type { CSSProperties } from 'react';

interface RangeSliderProps {
  label: string;
  minimum: number;
  maximum: number;
  step: number;
  valueMinimum: number;
  valueMaximum: number;
  formattedRange: string;
  onChange: (valueMinimum: number, valueMaximum: number) => void;
}

/**
 * Dual-thumb range control built from two overlaid native range inputs, so
 * keyboard and assistive-technology behavior stays native in both thumbs.
 */
export function RangeSlider({
  label,
  minimum,
  maximum,
  step,
  valueMinimum,
  valueMaximum,
  formattedRange,
  onChange,
}: RangeSliderProps) {
  const span = maximum - minimum;
  const lowPercent = span === 0 ? 0 : ((valueMinimum - minimum) / span) * 100;
  const highPercent = span === 0 ? 100 : ((valueMaximum - minimum) / span) * 100;

  return (
    <div className="range-slider">
      <div className="range-slider__heading">
        <strong>{label}</strong>
        <b>{formattedRange}</b>
      </div>
      <div
        className="range-slider__track"
        style={{ '--range-low': `${lowPercent}%`, '--range-high': `${highPercent}%` } as CSSProperties}
      >
        <input
          type="range"
          min={minimum}
          max={maximum}
          step={step}
          value={valueMinimum}
          aria-label={`${label} minimum`}
          onChange={(event) => {
            const next = Math.min(Number(event.target.value), valueMaximum);
            onChange(next, valueMaximum);
          }}
        />
        <input
          type="range"
          min={minimum}
          max={maximum}
          step={step}
          value={valueMaximum}
          aria-label={`${label} maximum`}
          onChange={(event) => {
            const next = Math.max(Number(event.target.value), valueMinimum);
            onChange(valueMinimum, next);
          }}
        />
      </div>
    </div>
  );
}
