export default function Loading() {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center p-6" aria-busy="true">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary" aria-hidden="true" />
        Loading game…
      </div>
    </main>
  );
}
