interface ExperienceGuideProps {
  tone: 'market' | 'seller' | 'client';
  title: string;
  audience: string;
  purpose: string;
  nextStep: string;
}

export function ExperienceGuide({
  tone,
  title,
  audience,
  purpose,
  nextStep,
}: ExperienceGuideProps) {
  return (
    <section className={`experience-guide experience-guide--${tone}`} aria-label={`${title} guide`}>
      <div className="experience-guide__title-row">
        <span className="experience-guide__mark" aria-hidden="true" />
        <div>
          <span>Workspace guide</span>
          <h2>{title}</h2>
        </div>
      </div>

      <p>{purpose}</p>

      <div className="experience-guide__details">
        <div>
          <span>Built for</span>
          <strong>{audience}</strong>
        </div>
        <div className="experience-guide__next">
          <span>Do this next</span>
          <strong>{nextStep}</strong>
        </div>
      </div>
    </section>
  );
}
