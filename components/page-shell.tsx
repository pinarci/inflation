import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-12", className)}>
      {children}
    </main>
  );
}

export function CenteredPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="m-auto w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
