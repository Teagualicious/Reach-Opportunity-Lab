export interface AreaPickerItem {
  id: string;
  name: string;
  subtitle: string;
  score: number;
}

interface AreaPickerProps {
  intro: string;
  items: readonly AreaPickerItem[];
  onSelect: (id: string) => void;
}

/**
 * Drill-down entry list shared by the region and county levels: choosing an
 * area drills the whole workspace into it. Sorted strongest-first.
 */
export function AreaPicker({ intro, items, onSelect }: AreaPickerProps) {
  const ranked = [...items].sort((left, right) => right.score - left.score);

  return (
    <section className="region-picker">
      <p className="region-picker__intro">{intro}</p>
      <div className="region-picker__list">
        {ranked.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect(item.id)}>
            <span className="region-picker__body">
              <strong>{item.name}</strong>
              <small>{item.subtitle}</small>
            </span>
            <span className="region-picker__score">
              <b>{item.score}</b>
              <i>opportunity</i>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
