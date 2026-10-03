export function GameIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mx-auto mb-8 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
    </header>
  );
}
