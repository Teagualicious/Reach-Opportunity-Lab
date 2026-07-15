import type { CSSProperties } from 'react';

interface ScoreRingProps {
  score: number;
  label?: string;
}

export function ScoreRing({ score, label = 'Opportunity score' }: ScoreRingProps) {
  const boundedScore = Math.max(0, Math.min(100, score));
  return (
    <div className="score-ring" style={{ '--score': boundedScore } as CSSProperties}>
      <div className="score-ring__inner">
        <strong>{boundedScore}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
