function LogoGlyph() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.7">
          <line x1="5" y1="6" x2="13" y2="5" />
          <line x1="5" y1="6" x2="13" y2="12" />
          <line x1="5" y1="18" x2="13" y2="12" />
          <line x1="5" y1="18" x2="13" y2="19" />
          <line x1="13" y1="5" x2="20" y2="12" />
          <line x1="13" y1="12" x2="20" y2="12" />
          <line x1="13" y1="19" x2="20" y2="12" />
        </g>
        <circle cx="5" cy="6" r="2" fill="currentColor" />
        <circle cx="5" cy="18" r="2" fill="currentColor" />
        <circle cx="13" cy="5" r="2" fill="currentColor" />
        <circle cx="13" cy="12" r="2" fill="currentColor" />
        <circle cx="13" cy="19" r="2" fill="currentColor" />
        <circle cx="20" cy="12" r="2.4" fill="var(--color-signal)" />
      </svg>
    </span>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoGlyph />
      <p className="font-display text-base font-semibold">MindMesh</p>
    </div>
  );
}
